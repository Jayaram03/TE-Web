// Vercel Serverless Function — Gemini AI Itinerary Generator
// POST /api/generate-itinerary
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
//   - All models RPD exhausted  → graceful degradation (still saves enquiry)

// ── Model definitions ─────────────────────────────────────────────
const MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemma-3-27b-it', name: 'Gemma 3 27B' },
  { id: 'gemma-3-4b-it', name: 'Gemma 3 4B' },
];

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// ── In-memory rate limit state ────────────────────────────────────
// Scoped per serverless instance. Works fine for Vercel.
// For multi-region prod scale, replace with Vercel KV / Redis.
const modelState = Object.fromEntries(
  MODELS.map(m => [m.id, {
    rpdExhausted: false, // true = daily quota hit, skip for 24h
    rpdExhaustedAt: null,  // Date.now() when RPD was hit
    rpmCoolingUntil: null,  // Date.now() + 65s when RPM was hit
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
  // Auto-reset after 24h
  if (Date.now() - s.rpdExhaustedAt >= 24 * 60 * 60 * 1000) {
    s.rpdExhausted = false;
    s.rpdExhaustedAt = null;
    console.log(`[Fallback] RPD auto-reset for ${modelId}`);
    return false;
  }
  return true;
}

function markRpmCooldown(modelId) {
  modelState[modelId].rpmCoolingUntil = Date.now() + 65_000; // 65s buffer
  console.log(`[Fallback] ${modelId} — RPM cooldown set (65s)`);
}

function markRpdExhausted(modelId) {
  modelState[modelId].rpdExhausted = true;
  modelState[modelId].rpdExhaustedAt = Date.now();
  console.log(`[Fallback] ${modelId} — RPD exhausted, skipping for 24h`);
}

// Gemini 429s can mean RPM/TPM (per-minute) or RPD (per-day).
// Parse the error body to tell them apart.
async function classify429(response) {
  try {
    const body = await response.json();
    const msg = (body?.error?.message || '').toLowerCase();
    if (
      msg.includes('daily') || msg.includes('per day') ||
      msg.includes('quota') || msg.includes('per_day')
    ) {
      return { type: 'RPD', body };
    }
    return { type: 'RPM', body };
  } catch {
    return { type: 'RPM', body: null }; // default to RPM (shorter penalty)
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
      generationConfig: { temperature: 0.7, maxOutputTokens: 2500 },
    }),
  });

  if (response.ok) {
    const data = await response.json();
    const candidate = data.candidates?.[0];
    const rawText = candidate?.content?.parts?.[0]?.text;
    const finishReason = candidate?.finishReason;

    if (!rawText) return { success: false, type: 'EMPTY' };

    // MAX_TOKENS means the response was cut off mid-JSON — treat as retryable
    if (finishReason === 'MAX_TOKENS') {
      console.warn(`[Fallback] ${modelId} hit MAX_TOKENS — response truncated, trying next model`);
      return { success: false, type: 'TRUNCATED' };
    }

    return { success: true, rawText };
  }

  if (response.status === 429) {
    const { type, body } = await classify429(response);
    console.error(`[Fallback] ${modelId} 429 [${type}]:`, body?.error?.message);
    return { success: false, type };
  }

  // Any other HTTP error
  const errText = await response.text();
  console.error(`[Fallback] ${modelId} error [${response.status}]:`, errText);
  return { success: false, type: 'OTHER', status: response.status };
}

// ── Fallback engine ───────────────────────────────────────────────
async function generateWithFallback(prompt, apiKey) {
  // Two passes:
  //   Pass 0 — try all non-cooling, non-exhausted models
  //   Pass 1 — after 65s wait, retry (clears RPM cooldowns)
  for (let pass = 0; pass < 2; pass++) {

    let allRpdExhausted = true;

    for (const model of MODELS) {
      const { id, name } = model;

      // Skip if daily quota used up
      if (isRpdExhausted(id)) {
        console.log(`[Fallback] Skipping ${name} — RPD exhausted`);
        continue;
      }
      allRpdExhausted = false;

      // On first pass, skip models still in RPM cooldown
      if (pass === 0 && isRpmCooling(id)) {
        console.log(`[Fallback] Skipping ${name} — RPM cooling`);
        continue;
      }

      console.log(`[Fallback] Trying ${name} (pass ${pass + 1})`);
      const result = await callModel(id, prompt, apiKey);

      if (result.success) {
        console.log(`[Fallback] ✅ Success with ${name}`);
        return { success: true, rawText: result.rawText, usedModel: name };
      }

      if (result.type === 'RPD') { markRpdExhausted(id); continue; }
      if (result.type === 'RPM') { markRpmCooldown(id); continue; }
      if (result.type === 'TRUNCATED') {
        // This model truncated — try next model without penalising it
        console.warn(`[Fallback] ${name} truncated response — trying next model`);
        continue;
      }
      // EMPTY / OTHER — log already done above, just try next model
    }

    // All models have hit their daily limit — no point waiting
    if (allRpdExhausted) {
      return {
        success: false,
        type: 'ALL_RPD',
        message: "We've hit today's AI processing limit. Your enquiry has been saved — our team will personally prepare your itinerary within 2 hours!",
      };
    }

    // End of pass 0 with all models RPM-cooling → wait 65s then retry
    if (pass === 0) {
      console.log('[Fallback] All available models RPM cooling — waiting 65s…');
      await sleep(65_000);
      // Force-clear RPM locks (65s has elapsed)
      MODELS.forEach(m => { modelState[m.id].rpmCoolingUntil = null; });
    }
  }

  // Both passes exhausted
  return {
    success: false,
    type: 'ALL_FAILED',
    message: "Our AI planner is temporarily busy. Your enquiry is saved — we'll send your personalised itinerary within 2 hours!",
  };
}

// ── Main Vercel handler ───────────────────────────────────────────
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
    console.warn('Itinerary Gen: GEMINI_API_KEY is missing or placeholder.');
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  try {
    const { destination, duration, travelers, budget, stay, special, dates } = req.body;

    // ── Smart conversion-focused prompt ───────────────────────
    const prompt = `You are a senior travel planner for TravelEpisodes.in — a premium Indian travel agency.
Your goal: generate a sample itinerary that excites the customer enough to confirm their booking.
Think "movie trailer" — enticing highlights, not an exhaustive schedule.

Customer details:
- Destination: ${destination}
- Duration: ${duration}
- Travelers: ${travelers}
- Budget: ${budget} per person
- Stay Preference: ${stay}
- Travel Dates: ${dates || 'Not specified'}
- Special Requirements: ${special}

ITINERARY RULES:
- Each day: one punchy title + 2–3 vivid highlights only. Not a minute-by-minute plan.
- "activities" field: comma-separated highlights, max 15 words. Specific and vivid.
  GOOD: "Sunrise at Dal Lake, Shikara ride, Old city spice market walk"
  BAD: "In the morning you will visit the lake and then go for shopping"
- Cost range: realistic for the ${stay} preference and ${budget} budget tier.
- "includes": short punchy list, max 8 words. E.g. "Stays, meals, transfers, sightseeing, guide"

PERSONALIZED TIP ("note" field) — this is your conversion weapon:
- Make it feel hand-crafted for THIS customer, not copy-pasted.
- Based on their travel dates and destination, include ONE of:
    * A festival or special event happening during their dates (e.g. "Your dates coincide with Onam — you'll witness the Grand Vallam Kali boat race!")
    * A seasonal insider tip (e.g. "June in Coorg means misty waterfalls at full flow — carry a light rain jacket")
    * A weather heads-up with a positive spin (e.g. "Monsoon Goa means half the crowds and lush green cliffs — a hidden gem experience")
    * A romantic upgrade for honeymoon/anniversary couples
    * A kid-friendly highlight for families
    * An adrenaline highlight for adventure travelers
- 2–3 sentences max. Warm and specific, not salesy.
- End with ONE soft urgency line if their dates are near peak season or have limited availability.

ADMIN NOTES ("enquiryNotes" field) — for TravelEpisodes team only, customer never sees this:
- Flag operational info the team needs: peak season pricing alerts, permit requirements,
  weather risks, hotel scarcity, advance booking urgency, visa info for international trips.
- 1–2 sentences. Direct and factual.
- Example: "Dec Manali = peak season, hotels fill 3 weeks ahead — confirm immediately. Rohtang permit needed."

Respond ONLY in this exact JSON format. No extra text. No markdown code blocks:
{
  "days": [
    {"day": "Day 1", "title": "...", "activities": "..."},
    {"day": "Day 2", "title": "...", "activities": "..."},
    {"day": "Day 3", "title": "...", "activities": "..."}
  ],
  "costMin": "₹XX,000",
  "costMax": "₹XX,000",
  "includes": "...",
  "note": "...",
  "enquiryNotes": "..."
}

Generate the correct number of days based on the duration.
Include realistic INR costs for the ${stay} preference and ${budget} budget.`;

    // ── Run with multi-model fallback ──────────────────────────
    const result = await generateWithFallback(prompt, GEMINI_API_KEY);

    // All models failed — return 200 so the chatbot handles it gracefully
    // (shows friendly message + still submits the enquiry form to Sheets)
    if (!result.success) {
      console.warn(`[Itinerary] Degraded — type: ${result.type}`);
      return res.status(200).json({
        success: false,
        degraded: true,
        errorType: result.type,
        message: result.message,
      });
    }

    // ── Strip markdown fences if model included them ───────────
    let cleanText = result.rawText.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText
        .replace(/^```(?:json)?\n?/, '')
        .replace(/\n?```$/, '');
    }

    // ── Robust JSON parse with truncation recovery ──────────────
    // Models occasionally truncate mid-string even under the token limit.
    // Strategy: try raw parse first, then attempt surgical repair.
    let itinerary;
    try {
      itinerary = JSON.parse(cleanText);
    } catch (parseErr) {
      console.warn('[Itinerary] Initial JSON parse failed, attempting repair…', parseErr.message);

      // 1. Remove any trailing incomplete key-value or unterminated string
      //    by walking back to the last valid closing brace/bracket.
      let repaired = cleanText;

      // Close any open string by finding last complete field boundary
      // Remove everything after the last clean comma or complete value
      repaired = repaired
        // Remove trailing incomplete field (unterminated string value)
        .replace(/,?\s*"[^"]*$/, '')
        // Remove trailing incomplete key
        .replace(/,?\s*"[^"]*":\s*$/, '')
        // Remove trailing comma before closing brace
        .replace(/,\s*([}\]])/, '$1');

      // Close any unclosed objects/arrays by counting braces
      const openBraces = (repaired.match(/\{/g) || []).length;
      const closeBraces = (repaired.match(/\}/g) || []).length;
      const openBrackets = (repaired.match(/\[/g) || []).length;
      const closeBrackets = (repaired.match(/\]/g) || []).length;

      for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']';
      for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}';

      try {
        itinerary = JSON.parse(repaired);
        console.log('[Itinerary] JSON repair succeeded');
      } catch (repairErr) {
        // Repair failed — return graceful degradation so enquiry still submits
        console.error('[Itinerary] JSON repair also failed:', repairErr.message);
        console.error('[Itinerary] Raw text was:', cleanText.substring(0, 300));
        return res.status(200).json({
          success: false,
          degraded: true,
          errorType: 'PARSE_ERROR',
          message: "We're preparing your personalised itinerary! Our team will share the full details within 2 hours. Your enquiry has been saved. 🌍",
        });
      }
    }

    return res.status(200).json({
      success: true,
      itinerary,
      generatedBy: result.usedModel,       // "Gemini 2.5 Flash" / "Gemma 3 27B" etc.
      // enquiryNotes returned separately so frontend can save to Sheets
      // but NOT show to customer
      enquiryNotes: itinerary.enquiryNotes || null,
    });

  } catch (error) {
    console.error('Generate itinerary error:', error);
    return res.status(500).json({
      error: 'Failed to generate itinerary',
      message: error.message,
    });
  }
}


// // Vercel Serverless Function — Gemini AI Itinerary Generator
// // POST /api/generate-itinerary

// export default async function handler(req, res) {
//   // CORS headers
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
//   if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
//     console.warn('Itinerary Gen: GEMINI_API_KEY is missing or placeholder.');
//     return res.status(500).json({ error: 'Gemini API key not configured' });
//   }

//   try {
//     const { destination, duration, travelers, budget, stay, special } = req.body;

//     const prompt = `You are a travel planner for TravelEpisodes.in — a premium Indian travel agency.
// Generate a detailed sample itinerary for:
// - Destination: ${destination}
// - Duration: ${duration}
// - Travelers: ${travelers}
// - Budget: ${budget} per person
// - Stay Preference: ${stay}
// - Special Requirements: ${special}

// Respond ONLY in this exact JSON format, no extra text, no markdown code blocks:
// {
//   "days": [
//     {"day": "Day 1", "title": "...", "activities": "..."},
//     {"day": "Day 2", "title": "...", "activities": "..."},
//     {"day": "Day 3", "title": "...", "activities": "..."}
//   ],
//   "costMin": "₹XX,000",
//   "costMax": "₹XX,000",
//   "includes": "...",
//   "note": "..."
// }

// Generate the correct number of days based on the duration. Include realistic costs in INR.
// The "includes" field should list what's included (hotels, transport, meals, sightseeing, etc).
// The "note" field should be a helpful tip or booking advice.`;

//     // gemini-2.5-flash
//     // gemma-3-27b-it
//     // gemma-3-4b-it
//     const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent?key=${GEMINI_API_KEY}`;

//     const response = await fetch(geminiUrl, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         contents: [{ parts: [{ text: prompt }] }],
//         generationConfig: {
//           temperature: 0.7,
//           maxOutputTokens: 1500
//         }
//       })
//     });

//     if (!response.ok) {
//       const errStatusCode = response.status;
//       const errBody = await response.text();
//       console.error(`Gemini API Error (Itinerary) [${errStatusCode}]:`, errBody);

//       if (errStatusCode === 429) {
//         return res.status(429).json({
//           error: 'Rate limit exceeded',
//           message: "Our AI is currently at its processing limit. Please try again in a few minutes or proceed with a manual enquiry."
//         });
//       }
//       return res.status(502).json({ error: 'AI service error', details: errBody });
//     }

//     const data = await response.json();
//     const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

//     if (!rawText) {
//       return res.status(502).json({ error: 'No response from AI' });
//     }

//     // Clean the response — strip markdown code blocks if present
//     let cleanText = rawText.trim();
//     if (cleanText.startsWith('```')) {
//       cleanText = cleanText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
//     }

//     // Parse the JSON
//     const itinerary = JSON.parse(cleanText);
//     return res.status(200).json({ success: true, itinerary });

//   } catch (error) {
//     console.error('Generate itinerary error:', error);
//     return res.status(500).json({ error: 'Failed to generate itinerary', message: error.message });
//   }
// }
