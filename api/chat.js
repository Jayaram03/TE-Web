// Vercel Serverless Function — Gemini AI Chat (Aria)
// POST /api/chat
//
// Multi-model fallback hierarchy:
//   1. gemini-2.5-flash      (primary)
//   2. gemma-3-27b-it        (fallback #1)
//   3. gemma-3-4b-it         (fallback #2 — lightest, highest free limits)
//
// Rate limit strategy:
//   - RPM/TPM (429, per-minute) → skip to next model immediately
//   - RPD     (429, per-day)    → mark exhausted for 24h, skip to next
//   - All models RPM cooling    → wait 65s, retry from model 1
//   - All models RPD exhausted  → friendly degradation message (no hard error)

// ── Model definitions ─────────────────────────────────────────────
const MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemma-3-27b-it',   name: 'Gemma 3 27B'      },
  { id: 'gemma-3-4b-it',    name: 'Gemma 3 4B'       },
];

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// ── In-memory rate limit state ────────────────────────────────────
const modelState = Object.fromEntries(
  MODELS.map(m => [m.id, {
    rpdExhausted:    false,
    rpdExhaustedAt:  null,
    rpmCoolingUntil: null,
  }])
);

// ── Helpers ───────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function isRpmCooling(modelId) {
  const until = modelState[modelId].rpmCoolingUntil;
  return until && Date.now() < until;
}

function isRpdExhausted(modelId) {
  const s = modelState[modelId];
  if (!s.rpdExhausted) return false;
  if (Date.now() - s.rpdExhaustedAt >= 24 * 60 * 60 * 1000) {
    s.rpdExhausted   = false;
    s.rpdExhaustedAt = null;
    console.log(`[Chat Fallback] RPD auto-reset for ${modelId}`);
    return false;
  }
  return true;
}

function markRpmCooldown(modelId) {
  modelState[modelId].rpmCoolingUntil = Date.now() + 65_000;
  console.log(`[Chat Fallback] ${modelId} — RPM cooldown set (65s)`);
}

function markRpdExhausted(modelId) {
  modelState[modelId].rpdExhausted   = true;
  modelState[modelId].rpdExhaustedAt = Date.now();
  console.log(`[Chat Fallback] ${modelId} — RPD exhausted, skipping for 24h`);
}

async function classify429(response) {
  try {
    const body = await response.json();
    const msg  = (body?.error?.message || '').toLowerCase();
    if (
      msg.includes('daily') || msg.includes('per day') ||
      msg.includes('quota') || msg.includes('per_day')
    ) {
      return { type: 'RPD', body };
    }
    return { type: 'RPM', body };
  } catch {
    return { type: 'RPM', body: null };
  }
}

// ── Call a single model ───────────────────────────────────────────
async function callModel(modelId, prompt, apiKey) {
  const url = `${BASE_URL}/${modelId}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
    }),
  });

  if (response.ok) {
    const data    = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return { success: false, type: 'EMPTY' };
    return { success: true, rawText };
  }

  if (response.status === 429) {
    const { type, body } = await classify429(response);
    console.error(`[Chat Fallback] ${modelId} 429 [${type}]:`, body?.error?.message);
    return { success: false, type };
  }

  const errText = await response.text();
  console.error(`[Chat Fallback] ${modelId} error [${response.status}]:`, errText);
  return { success: false, type: 'OTHER', status: response.status };
}

// ── Fallback engine ───────────────────────────────────────────────
async function chatWithFallback(prompt, apiKey) {
  for (let pass = 0; pass < 2; pass++) {

    let allRpdExhausted = true;

    for (const model of MODELS) {
      const { id, name } = model;

      if (isRpdExhausted(id)) {
        console.log(`[Chat Fallback] Skipping ${name} — RPD exhausted`);
        continue;
      }
      allRpdExhausted = false;

      if (pass === 0 && isRpmCooling(id)) {
        console.log(`[Chat Fallback] Skipping ${name} — RPM cooling`);
        continue;
      }

      console.log(`[Chat Fallback] Trying ${name} (pass ${pass + 1})`);
      const result = await callModel(id, prompt, apiKey);

      if (result.success) {
        console.log(`[Chat Fallback] ✅ Success with ${name}`);
        return { success: true, rawText: result.rawText, usedModel: name };
      }

      if (result.type === 'RPD') { markRpdExhausted(id); continue; }
      if (result.type === 'RPM') { markRpmCooldown(id);  continue; }
      // EMPTY / OTHER — try next model
    }

    if (allRpdExhausted) {
      return { success: false, type: 'ALL_RPD' };
    }

    if (pass === 0) {
      console.log('[Chat Fallback] All models RPM cooling — waiting 65s…');
      await sleep(65_000);
      MODELS.forEach(m => { modelState[m.id].rpmCoolingUntil = null; });
    }
  }

  return { success: false, type: 'ALL_FAILED' };
}

// ── Friendly fallback replies (so chat never hard-errors) ─────────
const FALLBACK_REPLIES = {
  ALL_RPD:    "I've been helping lots of travellers today and hit my daily limit! 😊 But don't worry — click **Plan a Trip ✈️** to share your details and our team will personally get back to you within 2 hours!",
  ALL_FAILED: "Oops! I've been chatting a bit too much and hit my limit for the moment. 😅 Please try again in a minute, or click **Plan a Trip ✈️** to share your details directly with our team!",
};

// ── Main Vercel handler ───────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const { message, context } = req.body;

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
    console.warn('AI Chat: GEMINI_API_KEY is missing or placeholder.');
    return res.status(200).json({
      reply: "I'm Aria! However, my AI brain (Gemini API) isn't connected right now. Please tell the admin to add a valid `GEMINI_API_KEY`.\n\nIn the meantime, you can click **Plan a Trip ✈️** to use our standard enquiry form."
    });
  }

  try {
    const prompt = `You are Aria, a friendly and knowledgeable AI travel assistant for 'TravelEpisodes.in' — a premium Indian travel agency.

AGENCY CONTEXT:
- Specialises in curated, personalised travel across India and internationally.
- Popular destinations: Kerala, Goa, Rajasthan, Manali, Bali, Maldives, Dubai, Thailand, and more.
- Custom packages and pricing are handled by the human team via the Trip Planner form.

YOUR JOB — before replying, silently classify the user's message into one of these types and respond accordingly:

TYPE 1 — QUICK FACT (weather, visa, currency, best time, travel tips)
→ Answer in 2–3 crisp lines. No lists needed. End with a relevant follow-up question.
→ Example: "What's the weather in Goa in December?" → 2 lines about weather + "Planning a trip there? 😊"

TYPE 2 — DISCOVERY LIST (best places, top destinations, things to do, where to go in [month])
→ Give 5 picks MAX. Format: emoji + place name + one punchy line. Nothing more per item.
→ End with: "Interested in any of these? I can help you plan! 🗺️"
→ Do NOT write paragraphs about each place.

TYPE 3 — TRIP PLANNING (plan a trip, make an itinerary, suggest a package)
→ Give a 3–4 line teaser overview only — highlights, rough cost range, best time.
→ Then say: "For your full personalised itinerary with exact pricing, use our Trip Planner 👇 Our team will have it ready within 2 hours!"
→ Do NOT write a full day-by-day itinerary in chat. That's the Trip Planner's job.

TYPE 4 — PRICING / BOOKING (how much does it cost, what packages do you have)
→ Give a rough ballpark range if you can (e.g. "Goa packages typically start from ₹8,000/person").
→ Always follow with: "For an exact quote tailored to your dates and group, our Trip Planner takes just 2 minutes 👇"

TYPE 5 — GENERAL CHAT / OFF-TOPIC
→ Respond warmly in 1–2 lines and steer back to travel.
→ If completely off-topic (not travel related): "I'm best at travel planning! 😄 Ask me about destinations, itineraries, or planning your next trip ✈️"

TONE RULES (always):
- Warm, like a well-travelled friend — never robotic or formal.
- Use 1–3 emojis per message max. Don't overdo it.
- Never write more than 120 words. If more is needed, offer a follow-up.
- Always end with either a question OR a nudge to the Trip Planner.

Current Chat History: ${context?.substring(0, 2000) || 'None'}

User says: "${message}"

Silently pick the TYPE above, then reply as Aria accordingly. Do not mention the type in your reply.`;

    // ── Run with multi-model fallback ──────────────────────────
    const result = await chatWithFallback(prompt, GEMINI_API_KEY);

    if (!result.success) {
      console.warn(`[Chat] Degraded — type: ${result.type}`);
      return res.status(200).json({
        reply: FALLBACK_REPLIES[result.type] ?? FALLBACK_REPLIES.ALL_FAILED,
      });
    }

    return res.status(200).json({ reply: result.rawText.trim() });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error:   'Failed to process chat',
      message: error.message,
    });
  }
}

// export default async function handler(req, res) {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }

//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
//   const { message, context } = req.body;

//   if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
//     console.warn('AI Chat: GEMINI_API_KEY is missing or placeholder.');
//     return res.status(200).json({
//       reply: "I'm Aria! However, my AI brain (Gemini API) isn't connected right now. Please tell the admin to add a valid `GEMINI_API_KEY`.\n\nIn the meantime, you can click **Plan a Trip ✈️** to use our standard enquiry form."
//     });
//   }

//   try {
//     const prompt = `You are Aria, a friendly, professional, enthusiastic AI travel assistant exclusively for the travel agency 'TravelEpisodes.in'. 
    
//     Context about the agency:
//     - Specializes in curated, premium, and personalized travel experiences in India and internationally.
//     - Popular destinations: Kerala, Goa, Rajasthan, Manali, Bali, Maldives, Dubai, Thailand.
//     - Always strictly refer the user to "TravelEpisodes.in" if they ask about booking or costs you don't know.
//     - Keep responses concise (under 3 paragraphs) and use emojis warmly.
    
//     Current Chat History summary: ${context?.substring(0, 1000) || 'None'}
    
//     User says: "${message}"
    
//     Respond directly to the user as Aria. Be helpful, concise, and enthusiastic.`;

//     const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent?key=${GEMINI_API_KEY}`;

//     const response = await fetch(geminiUrl, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         contents: [{ parts: [{ text: prompt }] }],
//         generationConfig: {
//           temperature: 0.7,
//           maxOutputTokens: 500
//         }
//       })
//     });

//     if (!response.ok) {
//       const errStatusCode = response.status;
//       const errBody = await response.text();
//       console.error(`Gemini API Error (Chat) [${errStatusCode}]:`, errBody);

//       if (errStatusCode === 429) {
//         return res.status(200).json({
//           reply: "Oops! I've been chatting a bit too much and reached my limit for the moment. 😅 Please try again in a minute, or click **Plan a Trip ✈️** to share your details directly with our team!"
//         });
//       }
//       throw new Error(`Gemini API ${errStatusCode}: ${errBody}`);
//     }

//     const data = await response.json();
//     const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

//     if (!rawText) {
//       throw new Error('No valid response from API');
//     }

//     return res.status(200).json({ reply: rawText.trim() });

//   } catch (error) {
//     console.error('Chat API error:', error);
//     return res.status(500).json({ error: 'Failed to process chat', message: error.message });
//   }
// }
