// ============================================
// Этот код вставить в Google Apps Script
// (Расширения → Apps Script в Google Таблице)
// ============================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Форматируем дату
    var now = new Date();
    var date = Utilities.formatDate(now, 'Europe/Moscow', 'dd.MM.yyyy HH:mm');

    // Добавляем строку
    sheet.appendRow([
      date,
      data.name || '',
      data.phone || '',
      data.car || '',
      data.contact_method || '',
      data.source || 'Сайт'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
