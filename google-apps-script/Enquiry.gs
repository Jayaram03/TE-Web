// Deploy from the original Form owner's Apps Script account. See docs/enquiry-delivery.md.
// Secrets / IDs belong in Script Properties, not in this file or browser code.
var LEDGER_TAB = 'Website Enquiry Delivery';
var ITEM_IDS = { name: 66210896, email: 1390205392, mobile: 2004247390, destination: 1870638346, startingPoint: 2106773726, people: 1460216643, tripStart: 1441138657, tripEnd: 1198879795, transport: 1964377753, stay: 1741261392, referral: 140523021, message: 2081643983 };
var LEDGER_HEADERS = ['Submission ID', 'Enquiry JSON', 'Received at', 'Form response ID', 'Linked Sheet confirmed', 'Email sent', 'Last error'];

function jsonReply(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function getSettings() {
  var properties = PropertiesService.getScriptProperties();
  var settings = { token: properties.getProperty('ENQUIRY_SCRIPT_TOKEN'), formId: properties.getProperty('GOOGLE_FORM_ID'), email: properties.getProperty('NOTIFICATION_EMAIL') };
  if (!settings.token || !settings.formId || !settings.email) throw new Error('Missing Script Properties');
  return settings;
}

function getLedger(form) {
  if (form.getDestinationType() !== FormApp.DestinationType.SPREADSHEET) throw new Error('The Form must be linked to a Google Sheet');
  var spreadsheet = SpreadsheetApp.openById(form.getDestinationId());
  var sheet = spreadsheet.getSheetByName(LEDGER_TAB);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(LEDGER_TAB);
    sheet.appendRow(LEDGER_HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange('A:B').setNumberFormat('@');
    SpreadsheetApp.flush();
  }
  if (JSON.stringify(sheet.getRange(1, 1, 1, 7).getValues()[0]) !== JSON.stringify(LEDGER_HEADERS)) throw new Error('Delivery ledger headers were changed');
  return sheet;
}

function validatePayload(enquiry) {
  var fields = Object.keys(ITEM_IDS);
  if (!enquiry || typeof enquiry !== 'object') throw new Error('Invalid enquiry');
  fields.forEach(function (key) {
    if (typeof enquiry[key] !== 'string') throw new Error('Invalid field: ' + key);
    if (enquiry[key].length > (key === 'message' ? 5000 : key === 'referral' ? 500 : 254)) throw new Error('Field too long: ' + key);
    if (key !== 'referral' && key !== 'message' && !enquiry[key].trim()) throw new Error('Required field: ' + key);
  });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) throw new Error('Invalid email');
  var digits = enquiry.mobile.replace(/\D/g, '');
  if (!/^\+?[\d\s().-]+$/.test(enquiry.mobile) || digits.length < 10 || digits.length > 15) throw new Error('Invalid phone');
  if (!/^\d+$/.test(enquiry.people) || !Number.isSafeInteger(Number(enquiry.people)) || Number(enquiry.people) < 1) throw new Error('Invalid travellers');
  ['tripStart', 'tripEnd'].forEach(function (key) {
    var date = new Date(enquiry[key] + 'T12:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(enquiry[key]) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== enquiry[key]) throw new Error('Invalid date');
  });
  if (enquiry.tripEnd < enquiry.tripStart) throw new Error('Invalid date order');
  if (['Car', 'Traveller Van', 'Bus (For Bigger groups)'].indexOf(enquiry.transport) < 0) throw new Error('Invalid transport');
  if (['3* Hotels', '4* Hotels or above', 'Resort / Cottages', 'Tent / Camping'].indexOf(enquiry.stay) < 0) throw new Error('Invalid stay');
}

function doPost(event) {
  var lock = LockService.getScriptLock();
  try {
    var data = JSON.parse(event.postData.contents);
    var settings = getSettings();
    if (data.token !== settings.token) return jsonReply({ ok: false, error: 'Unauthorized' });
    if (typeof data.submissionId !== 'string' || !/^[\w-]{20,80}$/.test(data.submissionId)) throw new Error('Invalid submission ID');
    validatePayload(data.enquiry);
    // Serialise first submissions, retries and the recovery trigger to prevent duplicates.
    if (!lock.tryLock(10000)) return jsonReply({ ok: false, error: 'Busy; retry with the same ID' });
    var form = FormApp.openById(settings.formId);
    var ledger = getLedger(form);
    var match = ledger.getRange('A:A').createTextFinder(data.submissionId).matchEntireCell(true).findNext();
    var row = match ? match.getRow() : ledger.getLastRow() + 1;
    var serialized = JSON.stringify(data.enquiry);
    if (match && ledger.getRange(row, 2).getValue() !== serialized) throw new Error('Submission ID already belongs to a different enquiry');
    if (!match) {
      if (row > ledger.getMaxRows()) ledger.insertRowsAfter(ledger.getMaxRows(), 1000);
      // Write the complete enquiry BEFORE attempting Form submission or email.
      // A server crash after this point leaves a durable record for the recovery trigger.
      ledger.getRange(row, 1, 1, 7).setValues([[data.submissionId, serialized, new Date(), '', false, false, '']]);
      SpreadsheetApp.flush();
      if (ledger.getRange(row, 2).getValue() !== serialized) throw new Error('Backup read-back failed');
    }
    return jsonReply(deliverRow(form, ledger, row, settings));
  } catch (error) {
    // Do not echo PII, secrets or Google errors to the public endpoint.
    console.error(String(error));
    return jsonReply({ ok: false, error: 'Delivery not confirmed; retry with the same ID' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function buildResponse(form, enquiry, marker) {
  if (!form.isAcceptingResponses()) throw new Error('Google Form is not accepting responses');
  var response = form.createResponse();
  Object.keys(ITEM_IDS).forEach(function (key) {
    var item = form.getItemById(ITEM_IDS[key]);
    if (!item) throw new Error('Missing Google Form item: ' + key);
    var value = key === 'message' ? enquiry.message + '\n\n' + marker : enquiry[key];
    var itemResponse;
    if (key === 'tripStart' || key === 'tripEnd') {
      var parts = value.split('-').map(Number);
      itemResponse = item.asDateItem().createResponse(new Date(parts[0], parts[1] - 1, parts[2], 12));
    } else if (key === 'transport' || key === 'stay') {
      var choice = item.asMultipleChoiceItem();
      if (!choice.getChoices().some(function (option) { return option.getValue() === value; })) throw new Error('Google Form options changed: ' + key);
      itemResponse = choice.createResponse(value);
    } else if (key === 'message') {
      itemResponse = item.asParagraphTextItem().createResponse(value);
    } else {
      itemResponse = item.asTextItem().createResponse(value);
    }
    response.withItemResponse(itemResponse);
  });
  // Fail closed if the owner added a required question not mapped above.
  var known = Object.keys(ITEM_IDS).map(function (key) { return ITEM_IDS[key]; });
  form.getItems().forEach(function (item) {
    if (known.indexOf(item.getId()) >= 0) return;
    var type = String(item.getType());
    if (['PAGE_BREAK', 'SECTION_HEADER', 'IMAGE', 'VIDEO'].indexOf(type) >= 0) return;
    throw new Error('Unmapped Google Form question; update integration before collecting enquiries');
  });
  return response;
}

function findExistingResponse(form, since, marker) {
  return form.getResponses(new Date(new Date(since).getTime() - 60000)).find(function (response) {
    return response.getItemResponses().some(function (answer) {
      return answer.getItem().getId() === ITEM_IDS.message && String(answer.getResponse()).endsWith('\n\n' + marker);
    });
  });
}

function linkedSheetContains(form, marker) {
  // Only count a marker in the actual Form response message column, never the backup ledger.
  var title = form.getItemById(ITEM_IDS.message).getTitle();
  return SpreadsheetApp.openById(form.getDestinationId()).getSheets().some(function (sheet) {
    if (sheet.getName() === LEDGER_TAB || sheet.getLastRow() < 2) return false;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    var column = headers.indexOf(title) + 1;
    if (!column) return false;
    return sheet.getRange(2, column, sheet.getLastRow() - 1, 1).createTextFinder(marker).findAll().some(function (cell) {
      return cell.getDisplayValue().endsWith('\n\n' + marker);
    });
  });
}

function deliverRow(form, ledger, row, settings) {
  var record = ledger.getRange(row, 1, 1, 7).getValues()[0];
  var id = record[0];
  var enquiry = JSON.parse(record[1]);
  var marker = '[TE enquiry: ' + id + ']';
  var responseId = record[3];
  var confirmed = record[4] === true;
  var emailSent = record[5] === true;
  try {
    if (!responseId) {
      // Recover a response accepted before a timeout/crash without posting it again.
      var existing = findExistingResponse(form, record[2], marker);
      var response = existing || buildResponse(form, enquiry, marker).submit();
      responseId = response.getId();
      if (!responseId || !form.getResponse(responseId)) throw new Error('Form response read-back failed');
      ledger.getRange(row, 4).setValue(responseId);
      SpreadsheetApp.flush();
    }
    if (!confirmed) {
      confirmed = linkedSheetContains(form, marker);
      // Google may take time to copy its Form response into the linked Sheet.
      if (confirmed) {
        ledger.getRange(row, 5).setValue(true);
        SpreadsheetApp.flush();
      }
    }
    if (confirmed && !emailSent) {
      try {
        if (MailApp.getRemainingDailyQuota() < 1) throw new Error('Email quota exhausted');
        MailApp.sendEmail({ to: settings.email, replyTo: enquiry.email, subject: 'Trip enquiry ' + id + ' — ' + enquiry.name, body: Object.keys(ITEM_IDS).map(function (key) { return key + ': ' + enquiry[key]; }).join('\n') + '\n\nReference: ' + id });
        ledger.getRange(row, 6).setValue(true);
        SpreadsheetApp.flush();
        emailSent = true;
      } catch (mailError) {
        ledger.getRange(row, 7).setValue('Email pending: ' + String(mailError));
      }
    }
    if (confirmed && emailSent) ledger.getRange(row, 7).clearContent();
    else if (!confirmed) ledger.getRange(row, 7).setValue('Awaiting linked Google Form response Sheet row');
  } catch (error) {
    ledger.getRange(row, 7).setValue(String(error));
  }
  return { ok: Boolean(responseId && confirmed), submissionId: id, formResponseId: responseId || '', formConfirmed: Boolean(responseId), sheetConfirmed: confirmed, emailSent: emailSent };
}

function retryPendingEnquiries() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    var settings = getSettings();
    var form = FormApp.openById(settings.formId);
    var ledger = getLedger(form);
    if (ledger.getLastRow() < 2) return;
    var records = ledger.getRange(2, 1, ledger.getLastRow() - 1, 7).getValues();
    var started = Date.now();
    var processed = 0;
    var properties = PropertiesService.getScriptProperties();
    var cursor = Number(properties.getProperty('RETRY_CURSOR') || 0) % records.length;
    for (var offset = 0; offset < records.length && processed < 20 && Date.now() - started < 240000; offset++) {
      var index = (cursor + offset) % records.length;
      var record = records[index];
      if (record[4] !== true || record[5] !== true) {
        deliverRow(form, ledger, index + 2, settings);
        processed++;
      }
      // Rotate fairly: permanently invalid rows must not starve later enquiries.
      properties.setProperty('RETRY_CURSOR', String((index + 1) % records.length));
    }
  } finally {
    lock.releaseLock();
  }
}

function setupEnquiryDelivery() {
  var settings = getSettings();
  var form = FormApp.openById(settings.formId);
  getLedger(form);
  // Request Mail permissions during owner setup, not the first customer's request.
  MailApp.getRemainingDailyQuota();
  if (!ScriptApp.getProjectTriggers().some(function (trigger) { return trigger.getHandlerFunction() === 'retryPendingEnquiries'; })) {
    ScriptApp.newTrigger('retryPendingEnquiries').timeBased().everyMinutes(5).create();
  }
}