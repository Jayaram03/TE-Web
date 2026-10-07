export const transportOptions = ['Car', 'Traveller Van', 'Bus (For Bigger groups)'];
export const stayOptions = ['3* Hotels', '4* Hotels or above', 'Resort / Cottages', 'Tent / Camping'];
export const enquiryFields = ['name', 'email', 'mobile', 'destination', 'startingPoint', 'people', 'tripStart', 'tripEnd', 'transport', 'stay', 'referral', 'message'];
export const DRAFT_KEY = 'te-enquiry-draft-v1';
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export function normalizeEnquiry(value = {}) {
    if (!value || typeof value !== 'object') value = {};
    return Object.fromEntries(enquiryFields.map(key => [key, typeof value[key] === 'string' ? value[key].trim() : '']));
}

export function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T12:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateEnquiry(value, minimumStart = '') {
    const form = normalizeEnquiry(value);
    const errors = {};
    for (const key of ['name', 'email', 'mobile', 'destination', 'startingPoint', 'people', 'tripStart', 'tripEnd', 'transport', 'stay']) {
        if (!form[key]) errors[key] = 'This field is required';
    }
    for (const key of enquiryFields) {
        const limit = key === 'message' ? 5000 : key === 'referral' ? 500 : 254;
        if (form[key].length > limit) errors[key] = `Use at most ${limit} characters`;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email';
    const digits = form.mobile.replace(/\D/g, '');
    if (!/^\+?[\d\s().-]+$/.test(form.mobile) || digits.length < 10 || digits.length > 15) errors.mobile = 'Enter a valid mobile number (10–15 digits)';
    if (!/^\d+$/.test(form.people) || !Number.isSafeInteger(Number(form.people)) || Number(form.people) < 1) errors.people = 'Enter a whole number of travellers (at least 1)';
    if (!validDate(form.tripStart)) errors.tripStart = 'Select a valid start date';
    else if (minimumStart && form.tripStart < minimumStart) errors.tripStart = 'Choose a future date (tomorrow or later)';
    if (!validDate(form.tripEnd)) errors.tripEnd = 'Select a valid end date';
    else if (validDate(form.tripStart) && form.tripEnd < form.tripStart) errors.tripEnd = 'End date cannot be before start date';
    if (!transportOptions.includes(form.transport)) errors.transport = 'Select a listed transport option';
    if (!stayOptions.includes(form.stay)) errors.stay = 'Select a listed stay option';
    return errors;
}

export function readDraft(storage, now = Date.now()) {
    try {
        const draft = JSON.parse(storage.getItem(DRAFT_KEY));
        if (!draft || !Number.isFinite(draft.savedAt) || now - draft.savedAt > MAX_AGE) {
            storage.removeItem(DRAFT_KEY);
            return null;
        }
        const form = normalizeEnquiry(draft.form);
        const pending = draft.pending && /^[\w-]{20,80}$/.test(draft.pending.id) && !Object.keys(validateEnquiry(draft.pending.form)).length
            ? { id: draft.pending.id, form: normalizeEnquiry(draft.pending.form) } : null;
        return { form: pending?.form || form, pending };
    } catch {
        return null;
    }
}

export function saveDraft(storage, form, pending, now = Date.now()) {
    // Throw on storage failure so the UI never claims a recoverable local backup exists.
    storage.setItem(DRAFT_KEY, JSON.stringify({ form, pending, savedAt: now }));
}

export function isConfirmedReceipt(receipt, id) {
    return receipt?.ok === true && receipt.submissionId === id && receipt.sheetConfirmed === true && receipt.formConfirmed === true && typeof receipt.formResponseId === 'string' && receipt.formResponseId.length > 0;
}

export async function submitEnquiry(pending, { fetchImpl = globalThis.fetch, timeoutMs = 30000 } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetchImpl('/api/enquiry', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submissionId: pending.id, enquiry: pending.form }),
            signal: controller.signal,
        });
        const receipt = await response.json();
        if (response.ok && isConfirmedReceipt(receipt, pending.id)) return receipt;
        const error = new Error(receipt.error || 'Delivery is not confirmed. Your enquiry is retained; retry to check the same submission.');
        if (response.status === 400 && receipt.fields) error.fields = receipt.fields;
        if (receipt.notAccepted === true) error.notAccepted = true;
        throw error;
    } finally {
        clearTimeout(timer);
    }
}

export function googleFormFallback(form) {
    const entries = { name: 1089377378, email: 1495965433, mobile: 228924055, destination: 1017602788, startingPoint: 1539082874, people: 779309777, tripStart: 90809953, tripEnd: 1369608764, transport: 961666899, stay: 1633115499, referral: 353242617, message: 343713554 };
    const params = new URLSearchParams({ usp: 'pp_url' });
    for (const [key, id] of Object.entries(entries)) params.set(`entry.${id}`, form[key] || '');
    return `https://docs.google.com/forms/d/e/1FAIpQLScgsRCJAg1ZbXQ1Uk4GbL5fWShnkAWq7gLtA9POBUUpYnX4Pg/viewform?${params}`;
}