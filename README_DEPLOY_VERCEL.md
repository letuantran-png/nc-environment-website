Hướng dẫn nhanh deploy lên Vercel

Hai cách chính:

1) Dùng Vercel CLI (deploy trực tiếp từ máy của bạn)

- Cài Vercel CLI:

```bash
npm install -g vercel
```

- Đăng nhập:

```bash
vercel login
```

- Trong thư mục `website` (chứa `index.html`) chạy:

```bash
cd "C:\Users\letuantran\Desktop\Cong ty TNHH TN&MT NC\04_Marketing_va_Thuong_hieu\website"
vercel --prod
```

Lần đầu Vercel sẽ hỏi thông tin project; chấp nhận mặc định là OK.

2) Dùng Git + Vercel dashboard (kết nối repo GitHub / GitLab / Bitbucket)

- Tạo repo trên GitHub, push toàn bộ thư mục `website` vào repo (đặt `index.html` ở root repo hoặc trong folder public nếu bạn muốn).
- Vào dashboard vercel.com → New Project → Import từ Git provider → chọn repo → Deploy.

Custom domain:

- Thêm domain tại Vercel dashboard hoặc dùng CLI:

```bash
vercel domain add your-domain.com
```

- Cập nhật bản ghi DNS (A / CNAME) theo hướng dẫn Vercel tại trang domain.

Lưu ý:
- Dự án của bạn là một trang tĩnh (HTML/CSS/JS). Không cần bước build nếu không có công cụ như webpack hoặc SSG.
- Mình đã thêm `vercel.json` tối thiểu để Vercel biết đây là site tĩnh.

Nếu bạn muốn, mình có thể:
- Kết nối và deploy thay bạn (cần quyền truy cập GitHub or Vercel), hoặc
- Hướng dẫn chi tiết từng bước (với hình ảnh/command cụ thể).