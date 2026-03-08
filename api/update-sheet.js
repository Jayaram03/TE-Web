// Vercel Serverless Function — Google Sheets updater proxy
// POST /api/update-sheet

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const WEBHOOK_URL = process.env.VITE_GOOGLE_SHEET_WEBHOOK_URL || process.env.GOOGLE_SHEET_WEBHOOK_URL;

  if (!WEBHOOK_URL) {
    return res.status(200).json({
      success: false,
      message: 'Google Sheet webhook URL not configured.'
    });
  }

  try {
    const { action, ...data } = req.body;
    const url = action ? `${WEBHOOK_URL}?action=${action}` : WEBHOOK_URL;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      redirect: 'follow'
    });

    const result = await response.json();
    return res.status(200).json(result);

  } catch (error) {
    console.error('Sheet update error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update sheet', message: error.message });
  }
}
