// Vercel Serverless Function — Brevo (Sendinblue) Email Sender
// POST /api/send-email

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  if (!BREVO_API_KEY) {
    return res.status(200).json({
      success: false,
      method: 'not_configured',
      message: 'Brevo API key not configured. Set BREVO_API_KEY in environment variables.'
    });
  }

  try {
    const { to_email, to_name, subject, html_content, attachment_url } = req.body;

    let attachments = [];
    if (attachment_url) {
      try {
        const fileRes = await fetch(attachment_url);
        if (fileRes.ok) {
          const buffer = await fileRes.arrayBuffer();
          const base64Content = Buffer.from(buffer).toString('base64');
          const fileName = attachment_url.split('/').pop().split('?')[0] || 'itinerary.pdf';
          
          attachments.push({
            content: base64Content,
            name: fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
          });
        }
      } catch (fileErr) {
        console.warn('Failed to fetch attachment:', fileErr.message);
        // Continue sending email even if attachment fails
      }
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'TravelEpisodes',
          email: 'hello@travelepisodes.in'
        },
        to: [{ email: to_email, name: to_name || 'Traveler' }],
        subject: subject,
        htmlContent: html_content,
        attachment: attachments.length > 0 ? attachments : undefined
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Brevo API error:', data);
      return res.status(502).json({ error: 'Email service error', details: data });
    }

    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email', message: error.message });
  }
}
