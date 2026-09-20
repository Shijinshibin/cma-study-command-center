/**
 * CMA Study Command Center - Google Sheets backend
 *
 * Deploy this Apps Script as a Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * If this script is bound to the Google Sheet, leave SPREADSHEET_ID empty.
 * If it is a standalone Apps Script project, put the spreadsheet ID here.
 */
const SPREADSHEET_ID = '';
const SHEETS = {
  config: 'StudyOS_Config',
  subjects: 'StudyOS_Subjects',
  tasks: 'StudyOS_Tasks',
  sessions: 'StudyOS_Sessions',
  tests: 'StudyOS_Tests',
  reminders: 'StudyOS_Reminders'
};

function spreadsheet_() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('No active spreadsheet. Bind this script to your Google Sheet or set SPREADSHEET_ID.');
  return ss;
}

function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : '';
    if (action !== 'get') return json_({ ok: true, service: 'CMA Study OS', message: 'Use ?action=get to read the current study data.' });
    const result = { ok: true, data: readAll_() };
    const callback = e && e.parameter ? e.parameter.callback : '';
    if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
      return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return json_(result);
  } catch (err) {
    const result = { ok: false, error: String(err.message || err) };
    const callback = e && e.parameter ? e.parameter.callback : '';
    if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
    return json_(result);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action !== 'save') throw new Error('Unsupported action.');
    saveAll_(body.data || {});
    return json_({ ok: true, savedAt: new Date().toISOString() });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function saveAll_(data) {
  const ss = spreadsheet_();
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    writeTable_(ss, SHEETS.config, ['key', 'value'], [
      ['masterTarget', data.masterTarget == null ? 425 : data.masterTarget],
      ['examAt', data.examAt || '2026-12-10T09:00']
    ]);

    writeTable_(ss, SHEETS.subjects,
      ['id', 'name', 'short', 'color', 'target', 'completed', 'focus'],
      (data.subjects || []).map(s => [s.id, s.name, s.short, s.color, s.target, s.completed, s.focus])
    );

    writeTable_(ss, SHEETS.tasks,
      ['id', 'date', 'subject', 'title', 'hours', 'type', 'done', 'priority'],
      (data.tasks || []).map(t => [t.id, t.date, t.subject, t.title, t.hours, t.type, t.done, t.priority])
    );

    writeTable_(ss, SHEETS.sessions,
      ['id', 'date', 'subject', 'topic', 'minutes', 'type'],
      (data.sessions || []).map(s => [s.id, s.date, s.subject, s.topic, s.minutes, s.type])
    );

    writeTable_(ss, SHEETS.tests,
      ['id', 'date', 'subject', 'score', 'total', 'weak', 'action'],
      (data.tests || []).map(t => [t.id, t.date, t.subject, t.score, t.total, t.weak, t.action])
    );

    writeTable_(ss, SHEETS.reminders,
      ['id', 'label', 'start', 'end', 'kind', 'enabled'],
      (data.reminders || []).map(r => [r.id, r.label, r.start, r.end, r.kind, r.enabled])
    );
  } finally {
    lock.releaseLock();
  }
}

function readAll_() {
  const ss = spreadsheet_();
  const config = readTable_(ss, SHEETS.config);
  const configMap = {};
  config.forEach(r => configMap[String(r.key)] = r.value);

  return {
    masterTarget: Number(configMap.masterTarget) || 425,
    examAt: String(configMap.examAt || '2026-12-10T09:00'),
    subjects: readTable_(ss, SHEETS.subjects),
    tasks: readTable_(ss, SHEETS.tasks).map(t => ({ ...t, hours: Number(t.hours) || 0, done: String(t.done).toLowerCase() === 'true' })),
    sessions: readTable_(ss, SHEETS.sessions).map(s => ({ ...s, minutes: Number(s.minutes) || 0 })),
    tests: readTable_(ss, SHEETS.tests).map(t => ({ ...t, score: Number(t.score) || 0, total: Number(t.total) || 100 })),
    reminders: readTable_(ss, SHEETS.reminders).map(r => ({ ...r, enabled: String(r.enabled).toLowerCase() !== 'false' }))
  };
}

function writeTable_(ss, name, headers, rows) {
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clearContents();
  const values = [headers].concat(rows || []);
  if (values.length) sh.getRange(1, 1, values.length, headers.length).setValues(values);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sh.autoResizeColumns(1, headers.length);
}

function readTable_(ss, name) {
  const sh = ss.getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
  const headers = values.shift().map(String);
  return values.filter(row => row.some(v => v !== '')).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
