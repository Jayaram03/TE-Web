/**
 * Google Apps Script — Enquiry Form -> Google Sheet
 * -------------------------------------------------
 * Setup:
 * 1. Create a new Google Sheet (e.g. "Travel Episodes Enquiries").
 * 2. In the Sheet, go to Extensions > Apps Script.
 * 3. Delete any boilerplate code and paste this file's contents.
 * 4. Click Deploy > New deployment > Select type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy the deployment URL (ends with /exec).
 * 6. In the website project, create a .env file (copy from .env.example)
 *    and set VITE_ENQUIRY_SCRIPT_URL to that URL.
 * 7. Redeploy the site (env vars are read at build time).
 */

const SHEET_NAME = 'Enquiries';

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.destination || '',
      data.tripType || '',
      data.travelDate || '',
      data.travellers || '',
      data.budget || '',
      data.message || '',
      data.source || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Timestamp', 'Name', 'Email', 'Phone', 'Destination',
      'Trip Type', 'Travel Date', 'Travellers', 'Budget', 'Message', 'Source',
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
