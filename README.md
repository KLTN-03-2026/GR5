Các bước thiết lập:

1. Tải source code & Cài đặt thư viện

Bash
git clone <link-repo-github-cua-ban>
cd agricultural-products-trading
npm install
2. Cấu hình biến môi trường

Tạo một file tên là .env tại thư mục gốc của dự án (ngang hàng với package.json).

Liên hệ với người quản trị dự án (hoặc team member) để lấy nội dung bảo mật dán vào file này.

3. Khởi chạy Database ngầm bằng Docker

Bash
docker-compose up -d
(💡 Mẹo: Có thể xem giao diện quản lý Database tại http://localhost:8080)

4. Đồng bộ cấu trúc Database (50+ bảng)

Bash
npx prisma db push
npx prisma generate
5. Khởi chạy dự án

Bash
npm run dev
🎉 Hoàn tất! Truy cập dự án tại: http://localhost:3000

Lưu ý thao tác hàng ngày: > * Mở máy lên code: Bật Docker -> gõ docker-compose start -> gõ npm run dev.

Code xong tắt máy: Gõ docker-compose stop.

Chú ý làm việc nhóm:
1. Bắt buộc: Mỗi ngày trước khi gõ dòng code đầu tiên, tất cả thành viên phải gõ lệnh: git pull origin main để lấy code mới nhất của anh em khác về máy mình.
2. Quy trình đúng: Ai code tính năng gì (ví dụ: Đạt làm quản lý kho, Hưng làm tính lương) thì phải tạo nhánh riêng (feature-dat, feature-hung). Code xong đẩy lên nhánh riêng đó, rồi lên GitHub tạo Pull Request (PR).
3. Ai tạo Conflict, người đó tự dọn: Người tạo PR phải tự quay về máy mình, tải main về, tự dùng fix, rồi mới được đẩy lên lại.
4. Mỗi khi Admin duyệt xong một PR và thành viên tải main mới về máy, bắt buộc phải chạy đủ combo sau để máy không bị lỗi:

npm install (Để cài các thư viện mới mà team vừa thêm).

npx prisma db push (Để ép các bảng/cột mới xuống MySQL nội bộ).

npx prisma generate (Để code nhận diện được cấu trúc CSDL mới).
