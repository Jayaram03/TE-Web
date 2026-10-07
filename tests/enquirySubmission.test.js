import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import handler from '../api/enquiry.js';
import { DRAFT_KEY, normalizeEnquiry, validateEnquiry, readDraft, saveDraft, isConfirmedReceipt, submitEnquiry, googleFormFallback } from '../src/data/enquirySubmission.js';

const id = 'ee461d63-9346-4609-b3f3-76eb637ff413';
const enquiry = { name: 'Test Traveller', email: 'traveller@example.com', mobile: '+91 98765 43210', destination: 'Manali', startingPoint: 'Chennai', people: '4', tripStart: '2027-05-10', tripEnd: '2027-05-12', transport: 'Car', stay: '3* Hotels', referral: '', message: 'Test only' };
const pending = { id, form: enquiry };
const receipt = { ok: true, submissionId: id, formResponseId: 'google-response-1', sheetConfirmed: true, formConfirmed: true, emailSent: true };

test('preflight validates required fields, phone, email, integer count, dates, options and lengths', () => {
    assert.deepEqual(validateEnquiry(enquiry, '2027-05-09'), {});
    const invalid = { ...enquiry, name: ' ', email: 'a@@b.com', mobile: 'abc9876543210', people: '2.5', tripStart: '2027-02-30', tripEnd: 'bad', transport: 'Train', stay: 'Unknown', message: 'x'.repeat(5001) };
    assert.deepEqual(Object.keys(validateEnquiry(invalid)).sort(), ['email', 'message', 'mobile', 'name', 'people', 'stay', 'transport', 'tripEnd', 'tripStart'].sort());
    assert.ok(validateEnquiry({ ...enquiry, tripEnd: '2027-05-09' }).tripEnd);
    assert.ok(validateEnquiry(enquiry, '2027-05-11').tripStart);
    assert.deepEqual(validateEnquiry({ ...enquiry, tripEnd: enquiry.tripStart }), {});
    assert.ok(validateEnquiry({ ...enquiry, people: '1e2' }).people);
    assert.ok(validateEnquiry({ ...enquiry, people: '9007199254740992' }).people);
    assert.ok(validateEnquiry({ ...enquiry, mobile: '1'.repeat(16) }).mobile);
    assert.ok(validateEnquiry(null).name);
    assert.equal(normalizeEnquiry({ ...enquiry, name: ' Test ' }).name, 'Test');
});

function memoryStorage() {
    const values = new Map();
    return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}

test('pending payload and reference survive refresh; corrupt/expired drafts are not restored', () => {
    const storage = memoryStorage();
    saveDraft(storage, enquiry, pending, 1000);
    assert.deepEqual(readDraft(storage, 2000), { form: enquiry, pending });
    // Pending snapshot takes precedence over a different editable draft.
    saveDraft(storage, { ...enquiry, name: 'Changed' }, pending, 1000);
    assert.equal(readDraft(storage, 2000).form.name, enquiry.name);
    assert.equal(readDraft(storage, 1000 + 8 * 86400000), null);
    assert.equal(storage.getItem(DRAFT_KEY), null);
    storage.setItem(DRAFT_KEY, 'not-json');
    assert.equal(readDraft(storage), null);
    assert.throws(() => saveDraft({ setItem() { throw new Error('Blocked'); } }, enquiry, pending));
});

test('only matching explicit Form + Sheet receipts can be successful', () => {
    assert.equal(isConfirmedReceipt(receipt, id), true);
    for (const invalid of [null, {}, { ok: true }, { ...receipt, submissionId: 'another' }, { ...receipt, sheetConfirmed: false }, { ...receipt, formConfirmed: false }, { ...receipt, formResponseId: '' }]) {
        assert.equal(isConfirmedReceipt(invalid, id), false);
    }
});

test('client never treats HTML, queued responses or HTTP 200 without confirmation as success', async () => {
    for (const invalid of [{ ok: true }, { ...receipt, sheetConfirmed: false }, { ...receipt, submissionId: 'wrong' }]) {
        await assert.rejects(submitEnquiry(pending, { fetchImpl: async () => ({ ok: true, status: 200, json: async () => invalid }) }));
    }
    await assert.rejects(submitEnquiry(pending, { fetchImpl: async () => ({ ok: true, json: async () => { throw new SyntaxError('HTML'); } }) }));
    await assert.rejects(submitEnquiry(pending, { fetchImpl: async () => { throw new Error('Offline'); } }));
    let sent;
    assert.deepEqual(await submitEnquiry(pending, {
        fetchImpl: async (url, options) => {
            sent = { url, body: JSON.parse(options.body) };
            return { ok: true, json: async () => receipt };
        }
    }), receipt);
    assert.deepEqual(sent, { url: '/api/enquiry', body: { submissionId: id, enquiry } });
});

test('client timeout rejects without discarding the original payload', async () => {
    await assert.rejects(submitEnquiry(pending, {
        timeoutMs: 5,
        fetchImpl: async (_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('Timeout', 'AbortError')))),
    }), { name: 'AbortError' });
    assert.equal(pending.id, id);
});

test('fallback opens a prefilled Form, not an opaque submission endpoint', () => {
    const url = new URL(googleFormFallback(enquiry));
    assert.ok(url.pathname.endsWith('/viewform'));
    assert.equal(url.searchParams.get('entry.1089377378'), enquiry.name);
    assert.equal(url.searchParams.get('entry.90809953'), enquiry.tripStart);
});

function responseMock() {
    return { code: 0, payload: null, headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(payload) { this.payload = payload; return this; } };
}
const request = () => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: { submissionId: id, enquiry } });

test('API validates before upstream and refuses unconfigured delivery', async t => {
    t.mock.method(globalThis, 'fetch', async () => { throw new Error('Must not send'); });
    let res = responseMock();
    await handler({ ...request(), method: 'GET' }, res);
    assert.equal(res.code, 405);
    res = responseMock();
    await handler({ ...request(), body: { submissionId: id, enquiry: { ...enquiry, email: 'bad' } } }, res);
    assert.equal(res.code, 400);
    assert.ok(res.payload.fields.email);
    res = responseMock();
    await handler({ ...request(), body: { submissionId: id, enquiry: null } }, res);
    assert.equal(res.code, 400);
    const previous = process.env.ENQUIRY_SCRIPT_URL;
    delete process.env.ENQUIRY_SCRIPT_URL;
    try {
        res = responseMock();
        await handler(request(), res);
        assert.equal(res.code, 503);
        assert.equal(res.payload.notAccepted, true);
        assert.notEqual(res.payload.ok, true);
    } finally {
        if (previous === undefined) delete process.env.ENQUIRY_SCRIPT_URL;
        else process.env.ENQUIRY_SCRIPT_URL = previous;
    }
});

test('API returns success only for Google Form and linked Sheet confirmation', async t => {
    const previousURL = process.env.ENQUIRY_SCRIPT_URL;
    const previousToken = process.env.ENQUIRY_SCRIPT_TOKEN;
    process.env.ENQUIRY_SCRIPT_URL = 'https://script.google.com/macros/s/test-deployment/exec';
    process.env.ENQUIRY_SCRIPT_TOKEN = 'test-secret-not-a-real-credential';
    let upstreamReceipt = receipt;
    let failure = false;
    let sent;
    t.mock.method(globalThis, 'fetch', async (_url, options) => {
        sent = JSON.parse(options.body);
        if (failure) throw new Error('Network failure');
        return { ok: true, json: async () => upstreamReceipt };
    });
    try {
        const res = responseMock();
        await handler(request(), res);
        assert.equal(res.code, 200);
        assert.equal(res.payload.sheetConfirmed, true);
        assert.equal(sent.submissionId, id);
        assert.equal(sent.token, process.env.ENQUIRY_SCRIPT_TOKEN);
        assert.equal(JSON.stringify(res.payload).includes(sent.token), false);
        for (const invalid of [{ ok: true }, { ...receipt, sheetConfirmed: false }, { ...receipt, submissionId: 'wrong' }]) {
            upstreamReceipt = invalid;
            const unconfirmed = responseMock();
            await handler(request(), unconfirmed);
            assert.equal(unconfirmed.code, 202);
            assert.equal(unconfirmed.payload.ok, false);
        }
        failure = true;
        const failed = responseMock();
        await handler(request(), failed);
        assert.equal(failed.code, 502);
    } finally {
        if (previousURL === undefined) delete process.env.ENQUIRY_SCRIPT_URL;
        else process.env.ENQUIRY_SCRIPT_URL = previousURL;
        if (previousToken === undefined) delete process.env.ENQUIRY_SCRIPT_TOKEN;
        else process.env.ENQUIRY_SCRIPT_TOKEN = previousToken;
    }
});

// Execute the actual Apps Script source against Google service mocks. No live writes.
function googleReceiver() {
    const records = [['Submission ID', 'Enquiry JSON', 'Received at', 'Form response ID', 'Linked Sheet confirmed', 'Email sent', 'Last error']];
    const responses = [];
    const state = { sheetReady: true, mailFail: false, formFail: false, crashAfterSubmit: false, notifications: 0, formPosts: 0 };
    const cell = (row, column) => ({ getValue: () => records[row - 1]?.[column - 1], setValue: value => { records[row - 1][column - 1] = value; }, clearContent: () => { records[row - 1][column - 1] = ''; } });
    const ledger = {
        getLastRow: () => records.length,
        getMaxRows: () => 1000,
        getRange: (row, column, count = 1, width = 1) => {
            if (row === 'A:A') return {
                createTextFinder: value => ({
                    matchEntireCell() { return this; }, findNext: () => {
                        const index = records.findIndex(record => record[0] === value);
                        return index < 0 ? null : { getRow: () => index + 1 };
                    }
                })
            };
            return { ...cell(row, column), getValues: () => records.slice(row - 1, row - 1 + count).map(record => record.slice(column - 1, column - 1 + width)), setValues: values => values.forEach((value, index) => { records[row - 1 + index] = value; }) };
        },
    };
    let runtime;
    const form = {
        getDestinationType: () => 'SPREADSHEET', getDestinationId: () => 'linked-sheet',
        getResponses: () => responses, getResponse: responseId => responses.find(response => response.getId() === responseId),
    };
    const properties = { ENQUIRY_SCRIPT_TOKEN: 'secret', GOOGLE_FORM_ID: 'form', NOTIFICATION_EMAIL: 'team@example.com' };
    runtime = vm.createContext({
        console: { error() { } },
        ContentService: { MimeType: { JSON: 'json' }, createTextOutput: value => ({ setMimeType: () => JSON.parse(value) }) },
        PropertiesService: { getScriptProperties: () => ({ getProperty: key => properties[key], setProperty: (key, value) => { properties[key] = value; } }) },
        LockService: { getScriptLock: () => ({ tryLock: () => true, hasLock: () => true, releaseLock() { } }) },
        FormApp: { DestinationType: { SPREADSHEET: 'SPREADSHEET' }, openById: () => form },
        SpreadsheetApp: { openById: () => ({ getSheetByName: () => ledger }), flush() { } },
        MailApp: { getRemainingDailyQuota: () => 10, sendEmail() { if (state.mailFail) throw new Error('Quota'); state.notifications++; } },
    });
    vm.runInContext(readFileSync(new URL('../google-apps-script/Enquiry.gs', import.meta.url), 'utf8'), runtime);
    const buildResponse = runtime.buildResponse;
    const linkedSheetContains = runtime.linkedSheetContains;
    runtime.buildResponse = (_form, value, marker) => ({
        submit() {
            // The payload has to be durable before a Form or email attempt.
            assert.ok(records.some(record => record[1] === JSON.stringify(value)));
            if (state.formFail) throw new Error('Form closed');
            state.formPosts++;
            const responseId = 'response-' + state.formPosts;
            const response = { getId: () => responseId, getItemResponses: () => [{ getItem: () => ({ getId: () => runtime.ITEM_IDS.message }), getResponse: () => value.message + '\n\n' + marker }] };
            responses.push(response);
            if (state.crashAfterSubmit) { state.crashAfterSubmit = false; throw new Error('Response lost after commit'); }
            return response;
        }
    });
    runtime.linkedSheetContains = () => state.sheetReady;
    return { state, records, runtime, buildResponse, linkedSheetContains, call: (value = enquiry, reference = id, token = 'secret') => runtime.doPost({ postData: { contents: JSON.stringify({ token, submissionId: reference, enquiry: value }) } }), retry: () => runtime.retryPendingEnquiries() };
}

test('Google receiver durably backs up all fields and deduplicates identical retries', () => {
    const google = googleReceiver();
    assert.equal(google.call().ok, true);
    assert.deepEqual(JSON.parse(google.records[1][1]), enquiry);
    assert.equal(google.call().ok, true);
    assert.equal(google.state.formPosts, 1);
    assert.equal(google.state.notifications, 1);
    assert.equal(google.call({ ...enquiry, destination: 'Changed' }).ok, false);
    assert.equal(google.state.formPosts, 1);
});

test('Google receiver never confirms the backup alone; delayed Sheet row recovers without duplicate Form', () => {
    const google = googleReceiver();
    google.state.sheetReady = false;
    const unconfirmed = google.call();
    assert.equal(unconfirmed.ok, false);
    assert.equal(unconfirmed.formConfirmed, true);
    assert.equal(unconfirmed.sheetConfirmed, false);
    assert.equal(google.records.length, 2);
    google.state.sheetReady = true;
    assert.equal(google.call().ok, true);
    assert.equal(google.state.formPosts, 1);
});

test('Google receiver recovers a Form commit followed by a lost response', () => {
    const google = googleReceiver();
    google.state.crashAfterSubmit = true;
    assert.equal(google.call().ok, false);
    assert.equal(google.call().ok, true);
    assert.equal(google.state.formPosts, 1);
});

test('Google recovery retries closed Forms and failed notifications from durable backups', () => {
    const google = googleReceiver();
    google.state.formFail = true;
    assert.equal(google.call().ok, false);
    assert.equal(google.records[1][1], JSON.stringify(enquiry));
    google.state.formFail = false;
    google.state.mailFail = true;
    google.retry();
    assert.equal(google.records[1][4], true);
    assert.equal(google.records[1][5], false);
    assert.equal(google.call().emailSent, false);
    google.state.mailFail = false;
    google.retry();
    assert.equal(google.records[1][5], true);
    assert.equal(google.state.formPosts, 1);
    assert.equal(google.state.notifications, 1);
});

test('unauthorized or invalid Google requests cannot write records', () => {
    const google = googleReceiver();
    assert.equal(google.call(enquiry, id, 'wrong-secret').ok, false);
    assert.equal(google.call({ ...enquiry, people: '-1' }).ok, false);
    assert.equal(google.records.length, 1);
    assert.equal(google.state.formPosts, 0);
});

test('actual Google Form builder maps every field including calendar dates and marker', () => {
    const google = googleReceiver();
    const answers = new Map();
    const response = { withItemResponse: answer => { answers.set(answer.key, answer.value); return response; } };
    const items = Object.entries(google.runtime.ITEM_IDS).map(([key, itemId]) => {
        const answer = { createResponse: value => ({ key, value }), getChoices: () => [{ getValue: () => enquiry[key] }] };
        return { getId: () => itemId, asTextItem: () => answer, asParagraphTextItem: () => answer, asDateItem: () => answer, asMultipleChoiceItem: () => answer };
    });
    const form = { isAcceptingResponses: () => true, createResponse: () => response, getItemById: itemId => items.find(item => item.getId() === itemId), getItems: () => items };
    assert.equal(google.buildResponse(form, enquiry, 'marker'), response);
    assert.equal(answers.size, 12);
    assert.equal(answers.get('message'), enquiry.message + '\n\nmarker');
    assert.equal(answers.get('tripStart').getFullYear(), 2027);
    assert.equal(answers.get('tripStart').getMonth(), 4);
    assert.equal(answers.get('tripStart').getDate(), 10);
    for (const key of Object.keys(enquiry).filter(key => !['message', 'tripStart', 'tripEnd'].includes(key))) assert.equal(answers.get(key), enquiry[key]);
    assert.throws(() => google.buildResponse({ ...form, isAcceptingResponses: () => false }, enquiry, 'marker'), /not accepting/);
    assert.throws(() => google.buildResponse({ ...form, getItems: () => [...items, { getId: () => 123, getType: () => 'TEXT' }] }, enquiry, 'marker'), /Unmapped/);
});

test('actual Sheet verifier excludes backup ledger and requires exact message marker suffix', () => {
    const google = googleReceiver();
    const marker = '[TE enquiry: ' + id + ']';
    const title = "Anything else you'd like to add?";
    const form = { getDestinationId: () => 'sheet', getItemById: () => ({ getTitle: () => title }) };
    const sheet = (name, header, content) => ({
        getName: () => name, getLastRow: () => 2, getLastColumn: () => 1,
        getRange: row => row === 1 ? { getDisplayValues: () => [[header]] } : { createTextFinder: () => ({ findAll: () => [{ getDisplayValue: () => content }] }) },
    });
    let sheets = [sheet('Website Enquiry Delivery', title, '\n\n' + marker)];
    google.runtime.SpreadsheetApp.openById = () => ({ getSheets: () => sheets });
    assert.equal(google.linkedSheetContains(form, marker), false);
    sheets = [sheet('Form Responses 1', title, enquiry.message + '\n\n' + marker + 'wrong')];
    assert.equal(google.linkedSheetContains(form, marker), false);
    sheets = [sheet('Form Responses 1', title, enquiry.message + '\n\n' + marker)];
    assert.equal(google.linkedSheetContains(form, marker), true);
});