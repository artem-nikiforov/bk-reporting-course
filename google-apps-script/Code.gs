/**
 * Приём попыток итогового теста курса «Работа с отчётностью» в Google Таблицу.
 *
 * ВАЖНО: этот скрипт должен быть привязан к таблице (container-bound),
 * то есть создан через Расширения → Apps Script ИЗ САМОЙ ТАБЛИЦЫ.
 * Если создать отдельный (standalone) проект, SpreadsheetApp.getActiveSpreadsheet()
 * вернёт null и записи работать не будут.
 */

/* Должен совпадать с QUIZ_LOG_SECRET в index.html */
var SECRET = 'bk-gostemania-2026';

/* Лист, в который пишем. Будет создан автоматически, если его нет. */
var SHEET_NAME = 'Попытки';

/* Количество вопросов в тесте. Меняется только вместе с QUIZ_DATA в курсе. */
var QUESTION_COUNT = 7;

/**
 * Порядок колонок задаётся ЯВНО, а не через Object.keys(payload).
 * Иначе при будущих правках payload колонки поедут и данные попадут не в те столбцы.
 */
function buildColumns() {
  var cols = [
    'timestamp',
    'session_id',
    'attempt',
    'student_id',
    'student_name',
    'score',
    'total',
    'percent',
    'passed'
  ];
  for (var i = 1; i <= QUESTION_COUNT; i++) {
    cols.push('q' + i + '_answer');
    cols.push('q' + i + '_correct');
  }
  return cols;
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return textOut('ERROR: no body');
    }

    var payload = JSON.parse(e.postData.contents);

    if (payload.secret !== SECRET) {
      return textOut('ERROR: bad secret');
    }

    var lock = LockService.getScriptLock();
    lock.waitLock(20000); // защита от гонки при одновременных попытках
    try {
      var sheet = getSheet_();
      var cols = buildColumns();

      // Первая запись — дописываем строку заголовков
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(cols);
        sheet.setFrozenRows(1);
        sheet.getRange(1, 1, 1, cols.length).setFontWeight('bold');
      }

      var row = cols.map(function (key) {
        var v = payload[key];
        return (v === undefined || v === null) ? '' : v;
      });
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }

    return textOut('OK');
  } catch (err) {
    // Курсу ответ всё равно не важен (no-cors), но в логах Apps Script будет видно
    return textOut('ERROR: ' + err);
  }
}

/** Быстрая проверка в браузере: открыть /exec — должно показать «alive». */
function doGet() {
  return textOut('alive');
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Нет активной таблицы — скрипт должен быть container-bound');
  }
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function textOut(msg) {
  return ContentService.createTextOutput(msg).setMimeType(ContentService.MimeType.TEXT);
}
