# Hướng dẫn kết nối Form khách hàng → Google Sheet + Zalo

Website đang dùng Google Apps Script làm backend miễn phí cho form liên hệ.
Bạn cần làm 4 bước sau (~10 phút).

## Bước 1: Tạo Google Sheet

1. Vào https://sheets.google.com → tạo sheet mới, đặt tên ví dụ `NC_KhachHang`.
2. Nhìn lên thanh URL, copy phần `SHEET_ID`:
   ```
   https://docs.google.com/spreadsheets/d/  1AbC...XyZ  /edit
                                            ↑↑↑↑↑↑↑↑↑
                                            đây là SHEET_ID
   ```
3. Sheet sẽ tự động tạo tab `KhachHang` với header khi có dữ liệu đầu tiên.

## Bước 2: Tạo Google Apps Script

1. Vào https://script.google.com → **New project**.
2. Xóa code mẫu, dán toàn bộ nội dung file `google-apps-script.gs` (cùng thư mục website).
3. Sửa các biến cấu hình ở đầu file:
   ```js
   var SHEET_ID = '1AbC...XyZ';            // Dán SHEET_ID ở Bước 1
   var ZALO_ACCESS_TOKEN = '';             // Để rỗng nếu chưa dùng Zalo
   var ZALO_USER_ID = '';                  // Để rỗng nếu chưa dùng Zalo
   var NOTIFY_EMAIL = 'letuantran@gmail.com'; // Email nhận thông báo
   ```
4. Bấm **Save** (Ctrl+S), đặt tên project ví dụ `NC Form Backend`.

## Bước 3: Deploy Web App

1. Bấm **Deploy** (góc phải) → **New deployment**.
2. Bấm icon bánh răng → chọn **Web app**.
3. Cấu hình:
   - **Description**: NC Form v1
   - **Execute as**: **Me** (chọn email của bạn)
   - **Who has access**: **Anyone** (bắt buộc — để website gọi được)
4. Bấm **Deploy** → **Authorize access** → chọn email → **Allow** (lần đầu sẽ yêu cầu cấp quyền cho Sheet và Mail).
5. Copy **Web app URL**, sẽ có dạng:
   ```
   https://script.google.com/macros/s/AKfycbx...xyz/exec
   ```

## Bước 4: Dán URL vào website

Mở file `website/main.js`, tìm dòng:
```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/PASTE_YOUR_DEPLOYMENT_ID_HERE/exec';
```
Thay bằng URL bạn vừa copy ở Bước 3.

**Xong!** Mở `index.html` hoặc `lien-he.html`, gửi thử form → kiểm tra Google Sheet.

---

## Test nhanh không cần website

Mở Web app URL bằng trình duyệt, bạn sẽ thấy text:
```
NC Environment Form Backend is running.
```
Nếu thấy thông báo này → backend đang hoạt động bình thường.

## Cập nhật code Apps Script sau này

Sau khi sửa code trong Apps Script, bạn cần **Deploy → Manage deployments → bấm icon bút chì → Version: New version → Deploy**. URL không đổi.

---

## Tích hợp Zalo (tùy chọn)

Có **3 cách** gửi tin Zalo, mỗi cách có giới hạn riêng:

### Cách A: Zalo OA Customer Service Message (đơn giản nhất)
- Dùng Zalo Official Account (miễn phí, đăng ký tại https://oa.zalo.me).
- **Giới hạn**: Chỉ gửi được tin trong vòng **48 giờ** sau khi khách nhắn tới OA.
- Phù hợp khi bạn muốn nhận thông báo vào tài khoản admin của OA, không phải gửi cho khách.
- Cách lấy:
  1. Đăng ký Zalo OA → tạo ứng dụng tại https://developers.zalo.me/createapp
  2. Lấy `access_token` từ phần OA Management
  3. `user_id` của bạn (admin): truy vấn qua API `/v3.0/oa/user/getlist`
- Dán vào `google-apps-script.gs`:
  ```js
  var ZALO_ACCESS_TOKEN = 'access_token_cua_ban';
  var ZALO_USER_ID = 'user_id_cua_admin';
  ```

### Cách B: Webhook → Zalo cá nhân qua bot trung gian
Vì Zalo không có API public cho tài khoản cá nhân, có thể dùng các dịch vụ trung gian như **Zalo PC Bot** hoặc **n8n + Zalo node**. Phức tạp hơn — nhắn tôi nếu cần hướng dẫn.

### Cách C (đề xuất): Email + thông báo điện thoại
Nếu chỉ cần nhận thông báo nhanh, dùng **email thông thường** (đã cài sẵn `NOTIFY_EMAIL` trong Apps Script). Trên điện thoại bật notification của Gmail là đủ — không cần config Zalo.

---

## Cấu trúc dữ liệu trong Google Sheet

| Cột | Tên | Mô tả |
|---|---|---|
| A | Thời gian | Datetime gửi |
| B | Họ và tên | |
| C | Số điện thoại | |
| D | Email | |
| E | Công ty | (chỉ form lien-he.html) |
| F | Dịch vụ quan tâm | |
| G | Nội dung | |
| H | Nguồn | "Trang chủ" hoặc "Trang liên hệ" |
| I | Trang gửi | URL đầy đủ của trang khách gửi từ |

## Khắc phục lỗi thường gặp

**Form báo "Gửi không thành công"**
- Kiểm tra console trình duyệt (F12 → Console).
- Mở Web app URL bằng trình duyệt — phải thấy "NC Environment Form Backend is running."
- Đảm bảo deploy với **Who has access: Anyone**.

**Sheet không nhận dữ liệu**
- Kiểm tra `SHEET_ID` có đúng không.
- Vào Apps Script → **Executions** xem log lỗi.

**Không nhận email thông báo**
- Lần đầu Apps Script chạy `MailApp.sendEmail` cần authorize quyền Gmail. Vào Apps Script → chạy thử `appendToSheet` thủ công 1 lần để cấp quyền.
- Kiểm tra hộp thư Spam.
