/**
 * ═══════════════════════════════════════════════════════════
 * TravelEpisodes.in — Google Apps Script Backend
 * ═══════════════════════════════════════════════════════════
 * 
 * This script integrates with the existing Google Sheet:
 * https://docs.google.com/spreadsheets/d/1woboYFqguuvWjFkL5jTD5uJFY4S2BtDQ1ZMytzAHf9c/edit
 * 
 * It reads the automated form columns (A-M) and appends Admin 
 * columns (N-Y) to track state without breaking form functionality.
 */

// ── Sheet definition ──
// Use the exact tab where Enquiries Form is linked, e.g., 'Enquiries - 26' or 'Form Responses 1'. 
// If not specified, it will use the first sheet in the document.
const SHEET_NAME = 'Enquiries - 26'; 

// ── Column mapping (1-indexed for Apps Script) ──
const COLS = {
  TIMESTAMP: 1,      // A
  NAME: 2,           // B
  EMAIL: 3,          // C
  MOBILE: 4,         // D
  DESTINATION: 5,    // E
  START_LOC: 6,      // F
  PEOPLE: 7,         // G
  START_DATE: 8,     // H
  END_DATE: 9,       // I
  TRANSPORT: 10,     // J
  STAY: 11,          // K
  REFERRAL: 12,      // L
  ANYTHING_ELSE: 13, // M
  
  // ── Admin Added Columns ──
  ADMIN_ID: 14,          // N
  ADMIN_STATUS: 15,      // O
  ADMIN_NOTES: 16,       // P
  ADMIN_CANVA_LINK: 17,  // Q
  ADMIN_SENT_AT: 18,     // R
  ADMIN_SENT_VIA: 19,    // S
  ADMIN_COST_RANGE: 20,  // T
  ADMIN_AUTO_FOLLOWUP: 21, // U
  ADMIN_FOLLOWUP_DUE: 22, // V
  SOURCE: 23,            // W
  BUDGET: 24,            // X
  MEALS: 25              // Y
};

const EXTRA_HEADERS = [
  'Admin_ID', 'Admin_Status', 'Admin_Notes', 'Admin_Canva_Link', 
  'Admin_Sent_At', 'Admin_Sent_Via', 'Admin_Cost_Range', 
  'Admin_Auto_Followup', 'Admin_Followup_Due', 'Source', 'Budget', 'Meals', 'Admin_Package_Rate'
];

/**
 * Run this once to ensure Admin headers exist in N-Y
 */
function setupAdminHeaders() {
  const ss = SpreadsheetApp.openById('1woboYFqguuvWjFkL5jTD5uJFY4S2BtDQ1ZMytzAHf9c');
  let sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  
  // Check if Admin_ID exists in column N (14)
  const headerN = sheet.getRange(1, COLS.ADMIN_ID).getValue();
  if (headerN !== 'Admin_ID') {
    sheet.getRange(1, COLS.ADMIN_ID, 1, EXTRA_HEADERS.length).setValues([EXTRA_HEADERS]);
    sheet.getRange(1, COLS.ADMIN_ID, 1, EXTRA_HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#1a2332')
      .setFontColor('#d4a853');
  }
}

/**
 * Handle POST requests (from Chatbot or Admin Dashboard)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    // Prefer action from query param, then from body
    const action = e.parameter.action || data.action || '';

    if (action === 'updateStatus') {
      return handleUpdateStatus(data);
    }

    if (action === 'updateCanvaLink') {
      return handleUpdateCanvaLink(data);
    }

    // Default: submit new enquiry from Chatbot
    // Guard: Only allow new enquiry if no action is specified AND no ID is present
    if (action === '' && !data.id) {
      return handleNewEnquiry(data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Invalid action or ID provided for new enquiry' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Helper: Generate Sequential ID (e.g., ENQ20260001)
 */
function generateNextId(sheet) {
  const lastRow = sheet.getLastRow();
  const currentYear = new Date().getFullYear();
  const basePrefix = 'ENQ' + currentYear;
  
  if (lastRow <= 1) {
    return basePrefix + '0001';
  }

  // Get all IDs in Column N (Admin_ID)
  const allIds = sheet.getRange(2, COLS.ADMIN_ID, lastRow - 1, 1).getValues().flat();
  
  let maxNum = 0;
  for (let id of allIds) {
    if (id && id.toString().startsWith('ENQ')) {
      // Extract the last 4 digits (e.g. ENQ20260005 -> 5)
      const numStr = id.toString().slice(-4);
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  const nextNum = maxNum + 1;
  // Pad to 4 digits
  const paddedNum = String(nextNum).padStart(4, '0');
  return basePrefix + paddedNum;
}

/**
 * Handle GET requests (Admin Dashboard load)
 */
function doGet(e) {
  try {
    const action = e.parameter.action || '';
    if (action === 'getAll') {
      return handleGetAll();
    }
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * POST — Submit new enquiry (From AI Chatbot)
 */
function handleNewEnquiry(data) {
  const ss = SpreadsheetApp.openById('1woboYFqguuvWjFkL5jTD5uJFY4S2BtDQ1ZMytzAHf9c');
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  const id = generateNextId(sheet);
  const timestamp = new Date().toISOString();

  // Create empty array of 25 columns
  let row = new Array(25).fill('');
  
  // Map Chatbot data to exact columns
  row[COLS.TIMESTAMP - 1] = timestamp;
  row[COLS.NAME - 1] = data.name || '';
  row[COLS.EMAIL - 1] = data.email || '';
  row[COLS.MOBILE - 1] = data.phone || '';
  row[COLS.DESTINATION - 1] = data.destination || '';
  row[COLS.START_LOC - 1] = ''; // Chatbot doesn't ask start location currently
  row[COLS.PEOPLE - 1] = data.travelers || '';
  row[COLS.START_DATE - 1] = data.dates || ''; 
  row[COLS.END_DATE - 1] = data.duration || ''; // Mapping duration to end date for now
  row[COLS.TRANSPORT - 1] = data.transport || '';
  row[COLS.STAY - 1] = data.stay || '';
  row[COLS.REFERRAL - 1] = '';
  row[COLS.ANYTHING_ELSE - 1] = data.special || '';
  
  // Admin fields
  row[COLS.ADMIN_ID - 1] = id;
  row[COLS.ADMIN_STATUS - 1] = 'New';
  row[COLS.ADMIN_AUTO_FOLLOWUP - 1] = 'OFF';
  row[COLS.SOURCE - 1] = 'AI Chatbot';
  row[COLS.BUDGET - 1] = data.budget || '';
  row[COLS.MEALS - 1] = data.meals || '';

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, id: id }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * GET — Fetch all enquiries for Admin Dashboard
 * Auto-generates Admin_ID for Google Form entries if missing
 */
function handleGetAll() {
  const ss = SpreadsheetApp.openById('1woboYFqguuvWjFkL5jTD5uJFY4S2BtDQ1ZMytzAHf9c');
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }

  // Ensure Admin headers exist
  setupAdminHeaders();

  const data = sheet.getRange(2, 1, lastRow - 1, 26).getValues();
  let needsUpdate = false;
  
  const results = data.map((row, index) => {
    let id = row[COLS.ADMIN_ID - 1];
    let source = row[COLS.SOURCE - 1];
    let status = row[COLS.ADMIN_STATUS - 1];

    // If a Google Form was submitted, it won't have an ID or Source or Status yet
    if (!id) {
      id = generateNextId(sheet); 
      // Need to flush immediately and update the array conceptually so next row gets a new ID, 
      // but since we write it to sheet, next iteration finding max ID might be tricky without a live read.
      // For `getAll` mass updates, relying on maxNum + index ensures sequence if multiple empty rows exist:
      // However, `generateNextId` is clean for single runs. To be safe in loops, we generate and write.
      sheet.getRange(index + 2, COLS.ADMIN_ID).setValue(id);
      sheet.getRange(index + 2, COLS.ADMIN_STATUS).setValue('New');
      sheet.getRange(index + 2, COLS.SOURCE).setValue('Google Form');
      sheet.getRange(index + 2, COLS.ADMIN_AUTO_FOLLOWUP).setValue('OFF');
      needsUpdate = true;
      source = 'Google Form';
      status = 'New';
    }

    return {
      id: id,
      timestamp: row[COLS.TIMESTAMP - 1] || '',
      name: row[COLS.NAME - 1] || '',
      email: row[COLS.EMAIL - 1] || '',
      phone: row[COLS.MOBILE - 1] || '',
      destination: row[COLS.DESTINATION - 1] || '',
      start_loc: row[COLS.START_LOC - 1] || '',
      travelers: row[COLS.PEOPLE - 1] || '',
      dates: row[COLS.START_DATE - 1] || '',
      duration: row[COLS.END_DATE - 1] || '',
      transport: row[COLS.TRANSPORT - 1] || '',
      stay: row[COLS.STAY - 1] || '',
      special: row[COLS.ANYTHING_ELSE - 1] || '',
      status: status,
      notes: row[COLS.ADMIN_NOTES - 1] || '',
      canva_link: row[COLS.ADMIN_CANVA_LINK - 1] || '',
      sent_at: row[COLS.ADMIN_SENT_AT - 1] || '',
      sent_via: row[COLS.ADMIN_SENT_VIA - 1] || '',
      cost_range: row[COLS.ADMIN_COST_RANGE - 1] || '',
      auto_followup: row[COLS.ADMIN_AUTO_FOLLOWUP - 1] || 'OFF',
      followup_due: row[COLS.ADMIN_FOLLOWUP_DUE - 1] || '',
      source: source,
      budget: row[COLS.BUDGET - 1] || '',
      meals: row[COLS.MEALS - 1] || '',
      package_rate: row[25] || ''
    };
  }).reverse(); // Newest first

  if (needsUpdate) SpreadsheetApp.flush();

  return ContentService
    .createTextOutput(JSON.stringify(results))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST — Update enquiry status + notes
 */
function handleUpdateStatus(data) {
  const ss = SpreadsheetApp.openById('1woboYFqguuvWjFkL5jTD5uJFY4S2BtDQ1ZMytzAHf9c');
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  const allIds = sheet.getRange(2, COLS.ADMIN_ID, sheet.getLastRow() - 1, 1).getValues().flat();

  const rowIndex = allIds.indexOf(data.id);
  if (rowIndex !== -1) {
    const rowNum = rowIndex + 2;
    if (data.status) sheet.getRange(rowNum, COLS.ADMIN_STATUS).setValue(data.status);
    if (data.notes !== undefined) sheet.getRange(rowNum, COLS.ADMIN_NOTES).setValue(data.notes);
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'ID not found' })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST — Update Canva link + mark as sent
 */
function handleUpdateCanvaLink(data) {
  const ss = SpreadsheetApp.openById('1woboYFqguuvWjFkL5jTD5uJFY4S2BtDQ1ZMytzAHf9c');
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  const allIds = sheet.getRange(2, COLS.ADMIN_ID, sheet.getLastRow() - 1, 1).getValues().flat();

  const rowIndex = allIds.indexOf(data.id);
  if (rowIndex !== -1) {
    const rowNum = rowIndex + 2;
    if (data.canva_link) sheet.getRange(rowNum, COLS.ADMIN_CANVA_LINK).setValue(data.canva_link);
    if (data.sent_at) sheet.getRange(rowNum, COLS.ADMIN_SENT_AT).setValue(data.sent_at);
    if (data.sent_via) sheet.getRange(rowNum, COLS.ADMIN_SENT_VIA).setValue(data.sent_via);
    if (data.cost_range) sheet.getRange(rowNum, COLS.ADMIN_COST_RANGE).setValue(data.cost_range);
    if (data.package_rate) {
      // Create Rate column if it doesn't exist (Index 26 / Z)
      const rateCol = 26; 
      if (sheet.getRange(1, rateCol).getValue() !== 'Admin_Package_Rate') {
        sheet.getRange(1, rateCol).setValue('Admin_Package_Rate').setFontWeight('bold');
      }
      sheet.getRange(rowNum, rateCol).setValue(data.package_rate);
    }
    sheet.getRange(rowNum, COLS.ADMIN_STATUS).setValue('Itinerary Sent');

    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'ID not found' })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Daily follow-up checker (Time-driven trigger)
 */
function checkFollowups() {
  const ss = SpreadsheetApp.openById('1woboYFqguuvWjFkL5jTD5uJFY4S2BtDQ1ZMytzAHf9c');
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) return;

  const data = sheet.getRange(2, 1, lastRow - 1, 25).getValues();
  const now = new Date();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const autoFollowup = row[COLS.ADMIN_AUTO_FOLLOWUP - 1];
    const status = row[COLS.ADMIN_STATUS - 1];
    const sentAt = row[COLS.ADMIN_SENT_AT - 1];
    
    if (autoFollowup !== 'ON' || status === 'Confirmed' || status === 'Closed' || !sentAt) continue;

    const sentDate = new Date(sentAt);
    const daysSince = Math.floor((now - sentDate) / (1000 * 60 * 60 * 24));

    if (daysSince >= 3 && daysSince < 7 && status === 'Itinerary Sent') {
      sheet.getRange(i + 2, COLS.ADMIN_FOLLOWUP_DUE).setValue('Day 3 - ' + now.toISOString());
    } else if (daysSince >= 7 && status === 'Itinerary Sent') {
      sheet.getRange(i + 2, COLS.ADMIN_FOLLOWUP_DUE).setValue('Day 7 - ' + now.toISOString());
    }
  }
}
