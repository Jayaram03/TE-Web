# Verified enquiry delivery — owner setup required

## Why the old implementation lost confirmation

The hidden cross-origin iframe reported a `load` for both a Google validation/error
page and a successful response. The website could not distinguish them. That load
must never be treated as evidence of a Form response or Sheet row.

The replacement requires a real acknowledgement from Google's account-owned
receiver. Until it is configured, the custom form **does not send or show success**;
it offers the original prefilled Google Form instead. The visitor must press Submit
on that Form and use Google's confirmation. This fallback is not independently
verified by the website.

## Configure Google (Form owner)

1. Open the original **Enquiries-26** Google Form in **edit** mode. Ensure it accepts
   responses and its Responses tab is linked to the existing Google Spreadsheet.
   Leave the Form's raw response tab and headers unchanged.
2. Create an Apps Script project under the account that owns the Form and Sheet.
   Copy [google-apps-script/Enquiry.gs](../google-apps-script/Enquiry.gs) into it.
   Enable the V8 runtime and set the project's time zone to **Asia/Kolkata**.
3. Under **Project Settings → Script Properties**, add:
   - `GOOGLE_FORM_ID`: the ID between `/d/` and `/edit` in the owner's edit URL.
     **Not** the public `1FAIpQL...` ID or a Spreadsheet ID.
   - `ENQUIRY_SCRIPT_TOKEN`: a unique cryptographically random secret, at least
     32 bytes. Use a password manager's random generator. Never put it in a `VITE_`
     variable or commit it to Git.
   - `NOTIFICATION_EMAIL`: `travelepisodeschennai@gmail.com` (or the monitored team inbox).
4. Run `setupEnquiryDelivery()` once and approve Form, Spreadsheet, email and trigger
   permissions. It creates **Website Enquiry Delivery**, a durable backup/delivery
   ledger in the **same** linked Spreadsheet, plus a five-minute retry trigger.
5. **Deploy → New deployment → Web app**. Execute as **Me** (owner), access **Anyone**.
   Anonymous HTTP access is required by the website's server; the receiver checks
   the shared secret before reading/writing. Copy the deployment's `/exec` URL.
   Editing script code requires updating the deployment to the new version.

## Configure Vercel

Add server-only environment variables for the applicable Preview / Production environments:

- `ENQUIRY_SCRIPT_URL`: the deployed `https://script.google.com/macros/s/.../exec` URL.
- `ENQUIRY_SCRIPT_TOKEN`: the identical Script Properties secret.

Redeploy the website. The API is [api/enquiry.js](../api/enquiry.js), not a Vite client
environment variable. Vite's static development server does not run Vercel functions;
use Vercel's full-stack local development environment with the same server variables
to test delivery locally. A static-only host needs an equivalent server endpoint.

## Delivery contract

- Browser and server validate required fields, email, phone, whole-number travellers,
  real calendar dates, date ordering, lengths and allowed preferences. Future-date
  validation applies to new browser submissions only so an old pending enquiry can
  still be recovered after midnight or its departure date.
- Before sending, the browser stores the exact pending payload and random submission
  reference. Retries reuse it; pending details are locked to prevent accidental
  changes/duplicates. Double clicks cannot start another request.
- Google stores **all fields in the ledger before attempting Form submission**.
  Ledger payloads are JSON strings, not executable Sheet formulas.
- The receiver submits the original Form using its supported `FormApp` API. It adds
  a `[TE enquiry: reference]` marker to the optional message. It records the actual
  Form response ID and checks the message column in the linked Form response Sheet
  for that marker. A backup row alone is **not** success.
- A lock serializes retries and the background worker. If a request dies after
  Google accepted the Form, recovery searches existing Form responses for the same
  marker before submitting again. A changed payload cannot reuse an existing ID.
- Success requires a matching reference, non-empty response ID, `formConfirmed`
  and `sheetConfirmed`. HTTP 200, an HTML page, a timeout, offline state or a queued
  backup can never produce “Enquiry Sent”. Google Sheet propagation can be delayed;
  use **Retry / Check My Enquiry** to retrieve confirmation.
- An explicit `MailApp` notification is used because programmatic Form submissions
  do not fire normal Form submit triggers. Failed notifications retry every five
  minutes. The success screen distinguishes notification-sent from notification-queued.
  An accepted send does **not** prove inbox delivery; check spam/bounces separately.
- Pending work is retried fairly in bounded batches. Google errors / quotas are
  recorded in **Last error**. No server record is automatically deleted.

## Acceptance check before publishing

Use one clearly labelled test enquiry approved by the business owner (do not send
fake customer enquiries to production without approval):

1. Submit valid data. Confirm the original Google Form response, the raw linked
   Sheet row, the ledger's response ID / confirmed flag, and the team email.
2. Submit invalid email, alphabetic phone, decimal travellers and reversed dates:
   no network submission should start and the offending field should be indicated.
3. Go offline, attempt submission and refresh: details/reference must remain, with
   **no** success. Reconnect and retry; exactly one Form response should result.
4. Interrupt a response after it reaches Google, reload and retry. Verify no duplicate
   Form response. Check **Last error** and the Apps Script execution log if delayed.
5. Temporarily close the Form: the backup must survive, success must not appear.
   Reopen it and run the recovery trigger; verify the original Form/Sheet delivery.
6. Exercise notification failures on a non-production copy and verify pending email
   is retried independently of successful Form/Sheet storage.

The repository's automated tests use mocks and cannot replace this account-owned
integration check. No live production enquiries are submitted by the tests.

## Operations, privacy and limits

No system can guarantee 100% delivery during a permanent outage, revoked access,
deleted records or exhausted quotas. This implementation fails closed, retains
recoverable data and acknowledges only verified Form/Sheet writes. Monitor the
ledger, Apps Script trigger failures, email quotas and Vercel errors. Protect the
public API with Vercel Firewall / rate limiting; it is a public enquiry endpoint and
the shared secret is not a substitute for abuse protection. Restrict Sheet access
to authorised staff and agree a retention policy for backup customer data.

Browser drafts use local storage. They are removed on confirmed success/reset and
expire when next read after seven days, **not by a background browser deletion job**.
Browsers can clear/block storage, private sessions may not persist it, and local
copies are not a server backup. Storage failure is shown; download a copy before
leaving if confirmation is unavailable. Use a private device for personal details.

Do not delete pending ledger rows or edit their IDs / JSON. Once successfully delivered,
they may be archived under the business's retention policy, preserving references
for as long as customers could retry. Updating Form questions requires updating
`ITEM_IDS` and validators, redeploying, then repeating the acceptance check.

Previously lost enquiries cannot be reconstructed from this repository. Audit the
old Form responses, linked Sheet and customer correspondence separately.