// Vercel Serverless Function — WhatsApp Business API Sender
// POST /api/send-whatsapp

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const TOKEN = process.env.WHATSAPP_TOKEN;

  if (!PHONE_NUMBER_ID || !TOKEN) {
    // Return fallback wa.me link instead of failing
    const { phone, message } = req.body;
    const cleanPhone = phone?.replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message || '')}`;
    return res.status(200).json({
      success: true,
      method: 'fallback',
      waLink,
      message: 'WhatsApp API not configured. Use the direct link instead.'
    });
  }

  try {
    const { phone, message } = req.body;

    // Ensure phone has country code, no + symbol
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone; // Default to India
    }

    const whatsappUrl = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

    const response = await fetch(whatsappUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: message }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      // Return fallback link on API error
      const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      return res.status(200).json({
        success: true,
        method: 'fallback',
        waLink,
        apiError: data
      });
    }

    return res.status(200).json({ success: true, method: 'api', data });

  } catch (error) {
    console.error('WhatsApp send error:', error);
    return res.status(500).json({ error: 'Failed to send WhatsApp', message: error.message });
  }
}
