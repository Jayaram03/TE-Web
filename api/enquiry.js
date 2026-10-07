import { normalizeEnquiry, validateEnquiry, isConfirmedReceipt } from '../src/data/enquirySubmission.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }
    if (!req.headers['content-type']?.startsWith('application/json')) return res.status(415).json({ error: 'JSON is required' });
    const { submissionId, enquiry } = req.body || {};
    if (typeof submissionId !== 'string' || !/^[\w-]{20,80}$/.test(submissionId)) return res.status(400).json({ error: 'Invalid submission reference' });
    const normalized = normalizeEnquiry(enquiry);
    const fields = validateEnquiry(normalized);
    if (Object.keys(fields).length) return res.status(400).json({ error: 'Please correct the highlighted fields.', fields });
    const endpoint = process.env.ENQUIRY_SCRIPT_URL;
    const token = process.env.ENQUIRY_SCRIPT_TOKEN;
    if (!endpoint || !/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint) || !token) {
        return res.status(503).json({ notAccepted: true, error: 'Verified submission is not configured yet. This enquiry has not been sent. Please use the original Google Form below and press Submit there.' });
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 50000);
    try {
        const upstream = await fetch(endpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, submissionId, enquiry: normalized }),
            signal: controller.signal, redirect: 'follow',
        });
        const receipt = await upstream.json();
        if (upstream.ok && isConfirmedReceipt(receipt, submissionId)) {
            return res.status(200).json({ ok: true, submissionId, formConfirmed: true, sheetConfirmed: true, formResponseId: receipt.formResponseId, emailSent: receipt.emailSent === true });
        }
        // Never trust an HTTP 200, HTML response, or queued backup as delivery confirmation.
        return res.status(202).json({ ok: false, submissionId, error: 'Google Form / Sheet delivery is not confirmed yet. Retry safely using the same reference; your details have been retained.' });
    } catch {
        return res.status(502).json({ error: 'Unable to confirm delivery. Keep this enquiry and retry; a retry uses the same reference to avoid duplicate submissions.' });
    } finally {
        clearTimeout(timer);
    }
}