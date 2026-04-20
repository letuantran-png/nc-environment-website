/**
 * NC Environment - Backend xử lý form khách hàng
 * Ghi vào Google Sheet + gửi tin nhắn qua Zalo OA
 *
 * Cách dùng:
 * 1. Vào https://script.google.com → New project → dán toàn bộ file này
 * 2. Sửa các CONFIG bên dưới (SHEET_ID, ZALO_ACCESS_TOKEN, ZALO_USER_ID)
 * 3. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy URL deploy, dán vào main.js (biến APPS_SCRIPT_URL)
 */

// ==================== CẤU HÌNH ====================
// ID của Google Sheet (lấy từ URL: docs.google.com/spreadsheets/d/<SHEET_ID>/edit)
var SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';
var SHEET_NAME = 'KhachHang';

// Zalo OA (Official Account) - Tùy chọn, nếu không dùng để rỗng
// Lấy access token tại: https://developers.zalo.me/
var ZALO_ACCESS_TOKEN = '';   // Access token của Zalo OA
var ZALO_USER_ID = '';        // user_id của tài khoản admin nhận tin nhắn

// Email nhận thông báo khi có khách hàng mới (tùy chọn, để rỗng nếu không dùng)
var NOTIFY_EMAIL = 'letuantran@gmail.com';

// ==================== XỬ LÝ POST ====================
function doPost(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var data = {
      submittedAt: params.submittedAt || new Date().toISOString(),
      hoTen:       params.hoTen || '',
      soDienThoai: params.soDienThoai || '',
      email:       params.email || '',
      congTy:      params.congTy || '',
      dichVu:      params.dichVu || '',
      noiDung:     params.noiDung || '',
      source:      params.source || '',
      pageUrl:     params.pageUrl || ''
    };

    // 1. Ghi vào Google Sheet
    appendToSheet(data);

    // 2. Gửi Zalo (nếu có cấu hình)
    if (ZALO_ACCESS_TOKEN && ZALO_USER_ID) {
      try { sendZaloMessage(data); } catch (zErr) { Logger.log('Zalo error: ' + zErr); }
    }

    // 3. Gửi email thông báo (nếu có cấu hình)
    if (NOTIFY_EMAIL) {
      try { sendEmailNotification(data); } catch (mErr) { Logger.log('Email error: ' + mErr); }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log('doPost error: ' + err);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Cho phép GET để test xem deploy đã hoạt động chưa
function doGet() {
  return ContentService
    .createTextOutput('NC Environment Form Backend is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ==================== GOOGLE SHEET ====================
function appendToSheet(data) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Thời gian', 'Họ và tên', 'Số điện thoại', 'Email',
      'Công ty', 'Dịch vụ quan tâm', 'Nội dung', 'Nguồn', 'Trang gửi'
    ]);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#1E3A5F').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([
    new Date(data.submittedAt),
    data.hoTen,
    data.soDienThoai,
    data.email,
    data.congTy,
    data.dichVu,
    data.noiDung,
    data.source,
    data.pageUrl
  ]);
}

// ==================== ZALO ====================
/**
 * Gửi tin nhắn qua Zalo OA API
 * Lưu ý: Zalo OA chỉ cho gửi free-form message trong 48h sau khi user nhắn tới OA.
 * Nếu cần gửi proactive, phải dùng "Consultation Tag" hoặc Notification Service.
 *
 * Tài liệu: https://developers.zalo.me/docs/api/official-account-api/tin-nhan
 */
function sendZaloMessage(data) {
  var text =
    '🔔 KHÁCH HÀNG MỚI - NC Environment\n' +
    '─────────────────\n' +
    '👤 Họ tên: ' + data.hoTen + '\n' +
    '📞 SĐT: ' + data.soDienThoai + '\n' +
    (data.email ? '✉️ Email: ' + data.email + '\n' : '') +
    (data.congTy ? '🏢 Công ty: ' + data.congTy + '\n' : '') +
    (data.dichVu ? '📋 Dịch vụ: ' + data.dichVu + '\n' : '') +
    (data.noiDung ? '📝 Nội dung: ' + data.noiDung + '\n' : '') +
    '─────────────────\n' +
    '🌐 Nguồn: ' + data.source;

  var payload = {
    recipient: { user_id: ZALO_USER_ID },
    message:   { text: text }
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'access_token': ZALO_ACCESS_TOKEN },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var resp = UrlFetchApp.fetch('https://openapi.zalo.me/v3.0/oa/message/cs', options);
  Logger.log('Zalo response: ' + resp.getContentText());
}

// ==================== EMAIL ====================
function sendEmailNotification(data) {
  var subject = '[NC Environment] Khách hàng mới: ' + data.hoTen;
  var body =
    'Bạn vừa nhận được yêu cầu tư vấn mới từ website:\n\n' +
    'Họ tên: ' + data.hoTen + '\n' +
    'SĐT: ' + data.soDienThoai + '\n' +
    'Email: ' + data.email + '\n' +
    'Công ty: ' + data.congTy + '\n' +
    'Dịch vụ: ' + data.dichVu + '\n' +
    'Nội dung: ' + data.noiDung + '\n\n' +
    'Nguồn: ' + data.source + '\n' +
    'Trang gửi: ' + data.pageUrl + '\n' +
    'Thời gian: ' + data.submittedAt;
  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}
