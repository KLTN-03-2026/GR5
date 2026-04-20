## Nghiệp vụ cần thể hiện

### Cấu trúc File & Routing
- layout route cho Warehouse gồm (map, receiving, alerts).
- layout route cho Suppliers với master page danh sách và nested tabs cho chi tiết NCC (info, history, debt, quality).

### Quản lý kho hàng
- **Sơ đồ kho**: phải đi theo cấu trúc Khu -> Dãy -> Kệ -> Tầng. Mỗi ô lấy dữ liệu `%` sức chứa, danh sách lô, và highlight các lô gần hết HSD. Component có side-panel drilldown.
- **Nhập kho Master-Detail**:
  - Giao diện trên/dưới. Bên dưới hiển thị list sản phẩm soi chênh lệch thực nhận vs yêu cầu.
  - POST duyệt phiếu là Prisma Transaction: (Tạo lô, Sinh QR, Cộng kho, Cộng dư nợ NCC). Approve gửi Notify.
  - POST từ chối bắt buộc có lý do.
- **Cảnh báo HSD**:
  - GET list có 4 state, default tab Cần xử lý vs Chờ duyệt.
  - Duyệt tiêu huỷ -> update status `CHO_TIEU_HUY` -> gửi Notification cho kho.
  - Duyệt xả Kho -> Tự động sinh `ma_giam_gia` giới hạn cho biến thể đó. Redirect & popup UI.

### Quản lý nhà cung cấp
- **Danh sách NCC (Index)**:
  - Bảng tổng quan gọi các chỉ số tự tính (không lưu cứng): Công Nợ hiện tại (từ `cong_no_ncc`), Điểm uy tín (từ `danh_gia_giao_hang`), Phiếu nhập tháng này.
- **4 Tab Chi Tiết NCC**:
  - **Info Tab**: Edit thông tin và status "Ngừng hợp tác" (cần check công nợ = 0).
  - **History Tab**: List phiếu nhập kho. Thêm modal Đánh giá chất lượng dạng Rating 5 sao nếu chưa có.
  - **Debt Tab**: Timeline thanh toán & Công nợ lớn, xuất Excel.
  - **Quality Tab**: KPIs (Đúng hạn, đủ hàng, TB sao, Số lỗi), Biểu đồ Recharts, Cảnh báo uy tín < 6.

### Dịch vụ Thông Báo
- Notification Core logic (insert `thong_bao`).
- 5 Trigger points: Kho (duyệt/từ chối/huỷ) & NCC (< 6 điểm / Nợ quá hạn).
- Cronjob (Vercel Cron endpoint: `/api/cron/suppliers-debt`).

---

## Tiến độ (Task Tracker)
- [ ] Phần 1: Routing & Layout.
- [ ] Migrate DB thêm trường `ma_bien_the_ap_dung` cho bảng `ma_giam_gia`.
- [ ] Phần 2: Sơ đồ kho map.
- [ ] Phần 3: Phiếu nhập Master-detail.
- [ ] Phần 4: Cảnh báo HSD.
- [ ] Phần 5: List NCC.
- [ ] Phần 6: 4 tabs chi tiết.
- [ ] Phần 7: Notifications & Cron.

---

## Nhật ký hoàn thành — 20/04/2026

### 🐛 Bug Fixes
- **[Fix] TypeScript error `SupplierDeliveryTab.tsx` L128**
  - Lỗi: Cast `form as Record<string, number>` bị TS từ chối vì `form` có field `boolean` và `string`
  - Fix: dùng `form as unknown as Record<string, number>` — pattern chuẩn để bypass overlap check

- **[Fix] `/staff/hr` lỗi 500 — `useSession` không có Provider**
  - Lỗi: Project dùng Auth.js v5 với `auth()` server-side, không cài `SessionProvider` → `useSession()` crash
  - Fix: Tách thành 2 file:
    - `page.tsx` (Server Component): gọi `auth()` → query DB lấy `user.id` → truyền vào Client
    - `HRClient.tsx` (Client Component): nhận `userId` qua props, không dùng `useSession`

### ✅ Tính năng mới

- **[Feature] Form Đơn Xin Nghỉ Phép hoạt động thật** (`/staff/hr`)
  - Kết nối `POST /api/nghi-phep` — submit đơn với `ma_nguoi_dung` từ session
  - Load lịch sử đơn của user hiện tại (`GET /api/nghi-phep?ma_nguoi_dung=...`)
  - Validation client-side: ngày bắt đầu/kết thúc, hiển thị tổng số ngày nghỉ
  - Loading spinner khi gửi, success banner, error banner
  - **Fix API**: thêm filter `ma_nguoi_dung` vào `GET /api/nghi-phep`

- **[Feature] Hệ thống Auth — Đăng ký & Đăng nhập hoàn chỉnh**
  - **`src/lib/auth.ts`**: Thêm Google & Facebook OAuth providers
    - `signIn` callback: tự động tạo `nguoi_dung` + `ho_so_nguoi_dung` khi đăng nhập OAuth lần đầu
    - `jwt` + `session` callbacks: expose numeric `user.id` vào session
  - **`POST /api/auth/register`** (API route mới): nhận `{ ho_ten, email, password }`, hash bcrypt, tạo user + hồ sơ, trả về lỗi có cấu trúc
  - **`/login`**: Google/FB buttons gọi `signIn()` thật, spinner loading khi redirect
  - **`/register`**: Viết lại hoàn toàn
    - Form có field Họ tên, validation (mật khẩu ≥ 6 ký tự, confirm match)
    - Gọi REST API `/api/auth/register` thay vì server action cũ
    - Hiệu ứng success animation → tự redirect
    - Nút Google/FB đăng ký OAuth
  - **`.env`**: Thêm placeholder `GOOGLE_CLIENT_ID/SECRET` và `FACEBOOK_CLIENT_ID/SECRET`

### ⚠️ Cần làm tiếp
- Điền OAuth credentials thật vào `.env` (Google Cloud Console + Facebook Developers)
- Thêm Redirect URI vào Google: `http://localhost:3001/api/auth/callback/google`
- Thêm Redirect URI vào Facebook: `http://localhost:3001/api/auth/callback/facebook`
