# PHÂN TÍCH ƯU NHƯỢC ĐIỂM TOÀN BỘ HỆ THỐNG

> Ngày phân tích: 2026-05-15
> Phạm vi: Toàn bộ file MD nghiệp vụ, API routes, code frontend/backend

---

## MODULE 1: XÁC THỰC & TÀI KHOẢN NGƯỜI DÙNG

### ĐIỂM MẠNH:
1. **Đa phương thức xác thực**: Hỗ trợ 4 phương thức (Email/Password, Google OAuth, Facebook OAuth, Face ID) — đáp ứng nhiều đối tượng khách hàng
2. **Face ID tiên tiến**: Sử dụng face-api.js với TinyFaceDetector, ngưỡng Euclidean distance < 0.5 — tính năng hiếm trong e-commerce nông sản
3. **Quy trình OTP chuẩn**: Mã 6 số, thời hạn 5 phút, sử dụng 1 lần, tự xóa OTP cũ trước khi tạo mới
4. **Phân quyền theo vai trò**: Redirect đúng dashboard theo role (ADMIN → /admin, STAFF → /staff, CUSTOMER → /store)
5. **Tài khoản người dùng đầy đủ**: Profile, địa chỉ (cascading dropdown GHN), wishlist, đổi mật khẩu, Face ID — UX hoàn chỉnh
6. **Ownership check đã implement**: Kiểm tra quyền sở hữu khi CRUD địa chỉ, thông báo — ngăn truy cập trái phép
7. **Rate limiting đã có**: API đổi mật khẩu 3 lần/5 phút, force logout sau đổi MK thành công
8. **Giới hạn địa chỉ**: Tối đa 5 địa chỉ/user, validate SĐT format (10-11 số, bắt đầu 0), validate ngày sinh
9. **Notification center**: Hỗ trợ phân trang, đánh dấu đã đọc, phân loại theo loại (đơn hàng, khuyến mãi, hệ thống)
10. **Unsaved changes warning**: Hook `useUnsavedChanges` ngăn mất dữ liệu khi rời trang

### ĐIỂM YẾU:
1. **Không có Rate Limiting cho login/register/OTP** — Dễ bị brute force tấn công (file: `filemd/xac-thuc.md` mục 3.1)
2. **Không có Middleware bảo vệ route** — Thiếu file `middleware.ts` để chặn truy cập trái phép ở edge level
3. **Face ID không có Liveness Detection** — Dễ bị lừa bởi ảnh/video tĩnh, cần kiểm tra nhắm mắt/quay đầu
4. **OTP lưu dạng plaintext** — Nên hash trước khi lưu database
5. **Mật khẩu yếu**: Chỉ yêu cầu tối thiểu 6 ký tự, không bắt buộc chữ hoa/số/ký tự đặc biệt
6. **Không có CAPTCHA** — Form đăng ký/đăng nhập dễ bị bot spam
7. **Session không bị vô hiệu khi đổi mật khẩu** (trừ change-password page đã fix)
8. **Dữ liệu khuôn mặt không mã hóa** — Lưu JSON plaintext trong database
9. **Không có 2FA** ngoài Face ID (không có TOTP/SMS)
10. **Không có xóa tài khoản** (GDPR right to be forgotten)
11. **Đăng ký không yêu cầu xác thực email trước** — Tạo tài khoản rác dễ dàng
12. **Không có khóa tài khoản** sau nhiều lần đăng nhập thất bại

---

## MODULE 2: SẢN PHẨM & TRANG CỬA HÀNG

### ĐIỂM MẠNH:
1. **Hệ thống biến thể linh hoạt**: Hỗ trợ nhiều biến thể/SKU với giá và đơn vị khác nhau (kg, 500g, hộp) — phù hợp nông sản
2. **Bộ lọc server-side mạnh**: Lọc theo danh mục (cha + con), khoảng giá, đánh giá, xuất xứ, chứng chỉ (VietGAP, Organic, GlobalGAP)
3. **Quick View popup**: Xem nhanh sản phẩm từ listing (modal 2 cột: ảnh + info), chọn biến thể, thêm giỏ
4. **Hệ thống đánh giá đầy đủ**: 1-5 sao + nội dung + ảnh, chỉ người đã mua mới được đánh giá (kiểm tra đơn DA_GIAO), mỗi user 1 lần/SP, admin duyệt + phản hồi
5. **SEO đã có structured data**: JSON-LD Schema.org Product (name, image, brand, offers, aggregateRating) — hỗ trợ Google Rich Results
6. **Breadcrumb navigation**: Trang chủ > Sản phẩm > Danh mục > Tên SP
7. **Back-in-stock notification**: Khách đăng ký email khi sản phẩm hết hàng, hỗ trợ cả guest
8. **Tối ưu hình ảnh**: Upload resize max 1200px, convert WebP quality 80% (sharp)
9. **Landing page danh mục**: Hero gradient, subcategories pills, featured products — không còn redirect đơn giản
10. **Sản phẩm liên quan thông minh**: 3 tầng ưu tiên (frequently bought together > cùng danh mục + giá tương tự > cùng xuất xứ)
11. **Homepage chuyên nghiệp**: Hero carousel từ CMS, 2 loại SP nổi bật (tươi + đặc sản), trust bar, newsletter
12. **Trang nông dân (Farmers)**: Storytelling với 6 hồ sơ nông dân, parallax, stats bar — tạo cảm xúc và niềm tin

### ĐIỂM YẾU:
1. **Nông dân hardcoded**: Dữ liệu 6 nông dân nằm trong code, không quản lý được từ admin
2. **Thiếu SEO cơ bản**: Không có meta tags động, sitemap.xml tự động, robots.txt tối ưu, Open Graph tags
3. **Không có ISR/revalidation**: Trang tĩnh không cache, mỗi lần truy cập đều fetch mới
4. **Hình ảnh SP từ Unsplash**: Không self-hosted, không optimize cho production
5. **Không có tìm kiếm trên homepage**: Thiếu search bar prominently
6. **Newsletter không có backend**: Chỉ UI, không lưu email vào DB
7. **Không có price history**: Không theo dõi lịch sử giá sản phẩm
8. **Không có so sánh sản phẩm**
9. **Không có "Frequently Bought Together"** (đã có logic backend nhưng thiếu UI rõ ràng)
10. **Pagination chỉ 6 SP/trang** — Quá ít, gây nhiều lần click
11. **Không có video sản phẩm**
12. **Không có min/max order quantity** per biến thể

---

## MODULE 3: GIỎ HÀNG & THANH TOÁN

### ĐIỂM MẠNH:
1. **4 phương thức thanh toán đầy đủ**: COD, VNPay, MoMo, Chuyển khoản ngân hàng — đáp ứng mọi đối tượng
2. **Merge giỏ hàng**: Tự động merge giỏ guest vào user cart khi đăng nhập
3. **Voucher system hoàn chỉnh**: 2 loại (TIEN_MAT, PHAN_TRAM), đơn tối thiểu, giảm tối đa, thời hạn
4. **Miễn phí ship thông minh**: Tự động miễn phí khi đơn ≥ 500K, progress bar cho khách biết còn thiếu bao nhiêu
5. **VNPay integration đầy đủ**: SHA512-HMAC signature, verify chữ ký khi callback, redirect flow chuẩn
6. **MoMo IPN webhook**: HMAC-SHA256 verification, auto cập nhật trạng thái DB
7. **QR VietQR cho chuyển khoản**: Tự động generate QR code với số tiền + nội dung CK, không cần đăng ký
8. **Trang kết quả 3 trạng thái**: Success (xanh) + Pending (vàng) + Failed (đỏ) — UX rõ ràng
9. **Idempotency key**: Chống double-submit khi tạo đơn hàng (đã fix 09/05/2026)
10. **Server-side price calculation**: Không nhận tổng tiền từ client nữa, tính lại từ giá biến thể trong DB

### ĐIỂM YẾU:
1. **Giỏ hàng chỉ ở localStorage**: Không đồng bộ lên server → mất khi xóa browser data, model `gio_hang` trong DB không được sử dụng
2. **Không validate giá server-side khi thêm giỏ**: Giá SP lưu ở client có thể bị thao tung (chỉ validate khi checkout)
3. **Không kiểm tra tồn kho khi thêm giỏ**: Thêm vào giỏ không check còn hàng, chỉ check khi tạo đơn
4. **Không đối chiếu số tiền callback**: Server không kiểm tra số tiền callback = số tiền đơn hàng gốc → dễ bị thao tung amount (file: `filemd/thanh-toan.md` mục 3.1)
5. **Test credentials hardcode làm fallback**: MoMo/VNPay dùng credentials test hardcode trong code
6. **Không có IP whitelist cho webhook**: Webhook MoMo/VNPay không kiểm tra IP nguồn → bất kỳ ai cũng gọi được
7. **Không xác thực user cho payment endpoint**: POST `/api/store/payment` không bắt buộc đăng nhập
8. **Không có timeout URL thanh toán**: URL VNPay/MoMo không theo dõi hết hạn (15 phút)
9. **Bank transfer hoàn toàn thủ công**: Phụ thuộc nhân viên kiểm tra, không có auto reconciliation
10. **Double payment chưa xử lý**: Khách thanh toán 2 lần cho 1 đơn → không detect + auto hoàn
11. **Voucher chỉ validate client-side khi ở giỏ hàng**: Thiếu validation phía server triệt để
12. **Race condition localStorage**: 2 tab có thể ghi đè giỏ hàng của nhau

---

## MODULE 4: ĐƠN HÀNG & VẬN CHUYỂN

### ĐIỂM MẠNH:
1. **3 gốc nhìn đầy đủ**: Khách (store), Nhân viên (staff), Quản trị (admin) — mỗi role có dashboard riêng
2. **Flow trạng thái rõ ràng**: CHO_XAC_NHAN → DA_XAC_NHAN → CHO_GIAO_HANG → DANG_GIAO → DA_GIAO → HOAN_THANH
3. **Staff dashboard mạnh**: KPI cards, tab đa trạng thái, bộ lọc nâng cao, tìm kiếm, thao tác hàng loạt, xuất CSV (UTF-8 BOM)
4. **Tích hợp GHN đầy đủ**: Master data, tính phí, tạo vận đơn, tracking, webhook, hủy vận đơn — 1 đối tác, 1 luồng
5. **Mapping trạng thái GHN → hệ thống**: 9 trạng thái GHN tương ứng rõ ràng
6. **QR scan khi đóng gói**: Staff quét QR từng sản phẩm, hiển thị tiến trình
7. **Ownership check đã fix**: Chỉ user đúng mới được xem/hủy/đổi trả đơn của mình (09/05/2026)
8. **Trừ tồn kho theo FEFO**: Khi tạo đơn, lô gần hết hạn bị trừ trước — chuẩn cho nông sản
9. **Hoàn tiền tự động khi hủy đơn**: Đơn đã thanh toán online bị hủy → tự tạo record hoàn tiền
10. **Timeline lịch sử đầy đủ**: Ghi lại mọi thay đổi trạng thái với thời gian
11. **Xử lý đơn hàng split theo khoảng cách**: Phân loại GAN/TRUNG/XA ảnh hưởng đến FEFO picking + cảnh báo đóng gói

### ĐIỂM YẾU:
1. **Không có timeout cho đơn CHO_XAC_NHAN**: Đơn có thể treo vĩnh viễn nếu không ai xử lý (thiếu cron job)
2. **Không gửi thông báo khi trạng thái thay đổi**: Không email/SMS → khách không biết đơn đang ở đâu
3. **Không có audit trail**: Không ghi lại AI đã xử lý đơn, thời gian, hành động (cho compliance)
4. **Trọng lượng tính đơn giản**: Chỉ dùng `số_lượng * 500g`, không phân biệt loại SP (rau củ vs gạo 5kg)
5. **Không cache dữ liệu master data GHN**: Mỗi lần load form địa chỉ đều gọi API → chậm
6. **Không xử lý GHN API downtime**: Nếu GHN không phản hồi, không có fallback
7. **Webhook GHN không xác thực**: Không kiểm tra signature/IP nguồn
8. **Ghi chú đơn hàng không sanitize**: Nguy cơ XSS (file: `filemd/don-hang.md` mục 3.2)
9. **Không có in phiếu giao hàng / hóa đơn**
10. **Không có partial cancellation**: Hủy 1 phần đơn hàng
11. **Không thu hồi mã giảm giá khi hủy đơn**

---

## MODULE 5: KHO HÀNG & NHÀ CUNG CẤP

### ĐIỂM MẠNH:
1. **Sơ đồ kho trực quan**: Drill-down 4 cấp (Khu vực → Dãy → Kệ → Tầng), mã màu công suất (xanh/vàng/đỏ/xám)
2. **FEFO thông minh theo khoảng cách**: Đơn GẦN (min 1 ngày HSD), TRUNG (min 3 ngày), XA (min 5 ngày) — đảm bảo chất lượng nông sản
3. **Quy trình nhập kho 2-step verification**: Nhân viên kiểm đếm → Quản lý duyệt — chống gian lận, minh bạch với NCC
4. **Gợi ý vị trí cất hàng**: Dựa trên sức chứa còn lại khi nhập kho
5. **Cảnh báo hạn sử dụng 3 cấp**: Sắp hết hạn (≤7 ngày), đã hết hạn, tồn kho thấp — với phương thức xử lý (thanh lý/hủy/trả NCC)
6. **QR code cho kiện hàng**: Mã vạch quét cho từng kiện, traceability từ nhập → xuất
7. **Xuất kho theo đơn hàng đầy đủ**: Tạo phiếu xuất khi confirm, staff nhặt hàng + quét QR, hoàn thành → tạo vận đơn
8. **NCC quản lý đa chiều**: 6 tab (Thông tin, Hợp đồng, Đánh giá, Công nợ, Trả hàng, Lô hàng trong kho)
9. **Đánh giá NCC 4 tiêu chí**: Chất lượng, đúng số lượng, đúng hạn, đóng gói — với ảnh minh chứng
10. **Chốt giá NCC**: Quản lý bảng giá nhập theo thời gian
11. **Phiếu tra NCC**: Khi hàng lỗi → tạo phiếu trả, liên kết phiếu xuất kho

### ĐIỂM YẾU:
1. **Không có reservation mechanism hoàn chỉnh**: Dù đã trừ tồn kho khi tạo đơn, nhưng không lock hàng giữa lúc thêm giỏ → checkout (oversell window)
2. **Không tính toán sức chứa thực tế**: Khi nhập hàng chỉ gợi ý vị trí nhưng không chắc chắn còn chỗ
3. **Điểm uy tín NCC nhập thủ công**: Không tự động tính từ trung bình các lần đánh giá
4. **Không validate MST format**: Cho phép mã số thuế sai format
5. **Không có auto PO**: Tồn kho thấp không tự động tạo đơn đặt hàng NCC
6. **Không có ABC analysis**: Không phân loại hàng A/B/C theo doanh thu
7. **Không tích hợp nhiệt độ/độ ẩm**: Quan trọng cho nông sản tươi nhưng chưa có IoT
8. **Không có multi-warehouse transfer**: Chỉ 1 kho, không hỗ trợ chuyển kho
9. **File hợp đồng NCC không virus scan**: Upload file không kiểm tra malware
10. **Không có cảnh báo tồn kho thấp tự động** (reorder point)
11. **Không export báo cáo tồn kho**: Thiếu export Excel/PDF
12. **API NCC không phân quyền chi tiết**: Chỉ kiểm tra "là admin", không phân biệt ai xem công nợ vs ai thanh toán

---

## MODULE 6: NHÂN SỰ & LƯƠNG

### ĐIỂM MẠNH:
1. **Chấm công Face ID**: Xác thực sinh trắc học cho nhân viên — chống gian lận chấm công hộ
2. **Phân ca phát hiện xung đột**: Không phân ca cho người đang nghỉ phép (đã duyệt), không phân ca trùng ngày
3. **Tính lương đầy đủ**: lương_cơ_bản + phụ_cấp_ca_tối + thưởng_chuyên_cần - khấu_trừ_trễ = thực_nhận
4. **Nghỉ phép 5 loại**: Phép năm, nghỉ bệnh, không lương, nghỉ lễ, việc riêng — validate ngày kết thúc >= bắt đầu
5. **Nhiệm vụ công việc**: Gắn task cho nhân viên liên kết với đơn hàng, theo dõi trạng thái
6. **Staff tự quản lý**: Xem lịch ca, gửi đơn nghỉ, đổi mật khẩu, quản lý Face ID — qua tab interface
7. **Cron chấm công vắng**: Auto đánh dấu vắng mặt cho nhân viên không chấm công

### ĐIỂM YẾU:
1. **Nhân viên không xem được lương**: Staff KHÔNG có giao diện xem chi tiết lương — rất cơ bản nhưng thiếu
2. **Số ngày phép hardcode "5 ngày"**: Không tính toán thực tế từ đơn đã duyệt
3. **Không có lịch sử chấm công cho staff**: NV không tự kiểm tra được giờ vào/ra
4. **Không có overtime tracking**: Giờ làm thêm không được tính, không có phụ cấp OT
5. **Không có chính sách phép theo thâm niên**: Tất cả NV cùng số ngày phép
6. **Không có phiếu lương (pay stub)**: Không in/xuất phiếu lương PDF
7. **Không tích hợp BHXH/thuế TNCN**: Bảng lương không tính các khoản bắt buộc theo luật
8. **Không có đổi ca**: Nhân viên không thể swap ca với nhau
9. **Không kiểm tra số phép còn lại trước khi duyệt**: Có thể duyệt quá số ngày phép
10. **Không có thông báo khi đơn nghỉ được duyệt/từ chối**
11. **Giao diện staff không responsive mobile**: Nhân viên kho thường dùng điện thoại
12. **Không có KPI/đánh giá hiệu suất**
13. **Không quản lý hợp đồng**: Không cảnh báo hợp đồng sắp hết hạn

---

## MODULE 7: CHATBOT AI & BÁO CÁO & QUẢN TRỊ HỆ THỐNG

### ĐIỂM MẠNH:
1. **Chatbot AI "Freshy" thông minh**: Tích hợp Google Gemini 2.5 Flash, kết hợp fast-path + AI-powered responses
2. **Fast-path hiệu quả**: Tính phí ship từ tin nhắn, điều hướng thông minh (10+ route), tìm kiếm SP, chào hỏi — không cần gọi AI
3. **Context-aware**: Gửi context giỏ hàng (số lượng, trọng lượng) cho AI, inject catalog 50 SP
4. **Rate limiting chatbot**: 18 cuộc gọi Gemini/phút, gửi lịch sử 10 tin nhắn
5. **Dashboard admin overview**: KPI cards, area chart doanh thu, pie chart danh mục, top SP bán chạy, đơn gần đây
6. **Quản lý khách hàng**: Phân loại VIP/Trung thành/Mới, tìm kiếm, export Excel
7. **Hệ thống RBAC đầy đủ trong DB**: Phân hệ → Chức năng → Quyền (Xem/Thêm/Sửa/Xóa)
8. **CMS banner**: Quản lý banner quảng cáo (hero, sidebar, popup) với thời gian hiệu lực
9. **Đề xuất báo cáo 18 loại đã plan**: Chia 7 nhóm nghiệp vụ với ưu tiên rõ ràng, có sẵn route structure + API endpoints
10. **API reports đã có 1 phần**: `/api/admin/reports/orders`, `/api/admin/reports/revenue`, `/api/admin/reports/inventory/*`

### ĐIỂM YẾU:
1. **RBAC chưa áp dụng đầy đủ**: Hệ thống phân quyền có trong DB nhưng KHÔNG kiểm tra ở mọi API route — điểm yếu bảo mật nghiêm trọng
2. **Không có audit log**: Không ghi lại ai làm gì, khi nào — vi phạm compliance
3. **Không có 2FA cho admin**: Tài khoản admin chỉ cần email/password → nguy hiểm
4. **Chatbot không lưu phiên chat**: Reset khi tải lại trang → mất lịch sử hội thoại
5. **Rate limiter in-memory**: Restart server = reset counter, không chia sẻ giữa instances
6. **Catalog chatbot hardcode 50 SP**: Không tự động cập nhật khi sản phẩm thay đổi
7. **Không có human handoff**: Bot không thể chuyển sang nhân viên thật khi không trả lời được
8. **Không validate input length chatbot**: Có thể gửi tin nhắn cực dài → prompt injection risk
9. **Không sanitize AI output**: Có thể bị prompt injection
10. **Không có IP whitelist cho admin panel**: Ai cũng truy cập được /admin
11. **Dashboard không auto-refresh**: Dữ liệu chỉ realtime khi tải trang
12. **Global search không hoạt động**: Topbar có ô tìm kiếm nhưng không có chức năng
13. **Báo cáo hầu hết chưa implement**: 18 loại báo cáo đã plan nhưng chỉ 3-4 API có sẵn
14. **Không có notification management**: Không gửi thông báo push/email cho nhóm KH

---

## MODULE 8: ĐỔI TRẢ HOÀN TIỀN & KIẾN TRÚC TỔNG QUAN

### ĐIỂM MẠNH:
1. **Flow đổi trả rõ ràng**: Khách gửi yêu cầu (lý do + ảnh) → Staff duyệt → Hoàn tiền + Hoàn kho
2. **Upload ảnh minh chứng**: Tối đa 5 ảnh, hỗ trợ JPG/PNG/WebP
3. **Hoàn kho tự động**: Khi admin duyệt trả hàng, increment `ton_kho_tong` tự động
4. **Hoàn tiền tự động**: Tạo record `lich_su_hoan_tien` khi admin duyệt (cho đơn thanh toán online)
5. **Phiếu trả NCC liên kết**: Hàng lỗi do NCC → trả về + ghi nhận công nợ
6. **Kiến trúc tổng thể Next.js 14 App Router**: Phân chia route group rõ ràng ((auth), (store), admin, staff)
7. **Prisma ORM + PostgreSQL**: Schema đầy đủ với relations, unique constraints, enum types
8. **Nhiều dependencies chất lượng**: NextAuth v5, bcryptjs, face-api.js, sharp, prisma, react-hook-form

### ĐIỂM YẾU:
1. **Không giới hạn thời gian đổi trả**: Không có deadline (VD: 7 ngày sau DA_GIAO) — khách có thể đổi trả mãi
2. **Ảnh Base64 trong DB**: Lưu trực tiếp JSON chuỗi Base64 → database phồng to, query chậm — nên dùng file storage
3. **Không validate kích thước ảnh server-side** (đã ghi TODOs nhưng file md nói chưa fix đổi trả ảnh)
4. **Không có quy trình nhận lại hàng**: Chỉ xử lý yêu cầu, chưa có flow nhận hàng trả về kho
5. **Không phân biệt ĐỔI vs TRẢ**: Đổi (exchange SP khác) vs Trả (hoàn tiền) dùng chung flow
6. **Không có partial return**: Trả 1 phần đơn hàng — hiện phải trả cả đơn
7. **Không có timeline tracking cho khách**: Khách không biết yêu cầu đổi trả đang ở đâu
8. **Không có chat giữa khách và staff**: Về yêu cầu đổi trả
9. **Form không cho chọn SP cụ thể**: Hiện trả cả đơn, không chọn item nào muốn trả
10. **Không liên kết với NCC**: Hàng lỗi do NCC → không auto tạo phiếu trả NCC

---

## TỔNG HỢP ĐÁNH GIÁ TOÀN HỆ THỐNG

### TOP 10 ĐIỂM MẠNH NỔI BẬT:
1. Kiến trúc microservice-like với route groups rõ ràng (auth/store/admin/staff)
2. Tích hợp đa dạng: GHN, VNPay, MoMo, Google Gemini, Face-api.js, VietQR
3. FEFO thông minh theo khoảng cách giao hàng — ít hệ thống nông sản nào có
4. Sơ đồ kho 4 cấp drill-down với mã màu công suất
5. Quy trình nhập kho 2-step verification chống gian lận
6. 4 phương thức thanh toán đầy đủ với webhook/IPN
7. Chatbot AI kết hợp fast-path + Gemini AI context-aware
8. Hệ thống NCC quản lý đa chiều (6 tab) với đánh giá 4 tiêu chí
9. Staff dashboard mạnh với KPI, filter, bulk actions, CSV export
10. Đã fix nhiều lỗ hổng bảo mật quan trọng (ownership check, server-side price, idempotency key, FEFO deduction)

### TOP 10 ĐIỂM YẾU NGHIÊM TRỌNG NHẤT:
1. **RBAC chưa áp dụng triệt để** — Phân quyền có trong DB nhưng không enforce ở API routes
2. **Không có audit log** — Không trace được ai làm gì khi nào → vi phạm compliance
3. **Rate limiting thiếu** — Login/register/OTP không giới hạn → brute force risk
4. **Giỏ hàng localStorage-only** — Mất dữ liệu, không sync, race condition
5. **Không đối chiếu số tiền payment callback** — Lỗ hổng thanh toán nghiêm trọng
6. **Ảnh Base64 trong DB** — Performance + storage bomb
7. **Webhook không xác thực** — GHN/MoMo/VNPay webhook không verify IP/signature đầy đủ
8. **Nhân viên không xem được lương** — Feature cơ bản nhưng thiếu
9. **Không có notification system** — Khách không nhận thông báo thay đổi trạng thái đơn
10. **Báo cáo hầu hết chưa implement** — 18 loại planned nhưng chỉ 3-4 có sẵn

### ĐIỂM ĐẶC BIỆT SO VỚI HỆ THỐNG THÔNG THƯỜNG:

> So sánh với hệ thống e-commerce thông thường (Shopify, WooCommerce, Magento, hoặc các hệ thống bán hàng online phổ biến), hệ thống này có những điểm KHÁC BIỆT rõ rệt sau:

#### 1. FEFO Thông Minh Theo Khoảng Cách Giao Hàng (Distance-Aware FEFO)
- **Hệ thống thường**: FIFO (first in first out) hoặc FEFO đơn giản (lô cũ nhất xuất trước)
- **Hệ thống này**: FEFO kết hợp khoảng cách giao hàng — đơn GIAO GẦN (cùng TP) chấp nhận lô chỉ còn 1 ngày HSD, đơn GIAO XA (liên tỉnh) yêu cầu tối thiểu 5 ngày HSD
- **Giá trị**: Giảm hao hụt nông sản tươi, đảm bảo chất lượng khi đến tay khách ở xa — tính năng này HIẾM CÓ ngay cả trong các hệ thống ERP chuyên nghiệp

#### 2. Sơ Đồ Kho 4 Cấp Trực Quan (Zone → Row → Shelf → Floor)
- **Hệ thống thường**: Quản lý kho dạng danh sách hoặc tối đa 2 cấp (warehouse → bin)
- **Hệ thống này**: Drill-down 4 cấp với bản đồ kho trực quan, mã màu công suất (xanh <50%, vàng 50-80%, đỏ >80%, xám trống), click vào từng tầng kệ xem chi tiết lô hàng + HSD
- **Giá trị**: Staff kho thấy ngay vị trí đặt/lấy hàng mà không cần đào tạo phức tạp

#### 3. Nhập Kho 2-Step Verification (Kiểm Đếm → Duyệt)
- **Hệ thống thường**: 1 người nhập kho là xong, hoặc phải dùng WMS riêng
- **Hệ thống này**: Nhân viên kiểm đếm thực tế (ghi số lượng, HSD, chất lượng) → Quản lý kho duyệt + so khớp với đơn đặt hàng NCC → Mới nhập kho chính thức
- **Giá trị**: Chống gian lận nhập kho (khai khống/bớt xén), minh bạch với NCC, traceability đầy đủ

#### 4. Face ID Đa Mục Đích (Khách Hàng + Nhân Viên)
- **Hệ thống thường**: Không có Face ID, hoặc chỉ là login bằng face (Samsung/Apple native)
- **Hệ thống này**: Face-api.js tự host với 2 use case:
  - Khách hàng: Đăng ký/đăng nhập bằng khuôn mặt (thay mật khẩu)
  - Nhân viên: Chấm công Face ID (chống chấm hộ), check-in/check-out với ngưỡng Euclidean distance < 0.5
- **Giá trị**: 1 công nghệ phục vụ 2 nhóm user hoàn toàn khác nhau, tiết kiệm thiết bị vân tay

#### 5. Chatbot AI Context-Aware Kết Hợp Fast-Path
- **Hệ thống thường**: Chatbot FAQ tĩnh, hoặc GPT tích hợp nhưng chỉ trả lời chung chung
- **Hệ thống này**: 
  - Fast-path: Tính phí ship trực tiếp từ tin nhắn, điều hướng 10+ route, tìm SP, chào hỏi — KHÔNG gọi AI (tiết kiệm chi phí, trả lời tức thì)
  - AI-path: Khi fast-path không match → gọi Gemini 2.5 Flash với context: giỏ hàng hiện tại (số lượng, trọng lượng), catalog 50 SP, lịch sử 10 tin nhắn
- **Giá trị**: Hybrid approach vừa nhanh vừa thông minh — chatbot biết khách đang có gì trong giỏ để tư vấn phù hợp

#### 6. NCC Quản Lý Đa Chiều 6-Tab Tích Hợp
- **Hệ thống thường**: Module NCC chỉ lưu thông tin liên hệ, đơn đặt hàng
- **Hệ thống này**: 1 module NCC quản lý đồng thời 6 chiều:
  - Thông tin cơ bản + MST + email/SĐT
  - Hợp đồng (upload file, thời hạn)
  - Đánh giá chất lượng 4 tiêu chí (chất lượng, số lượng, đúng hạn, đóng gói) + ảnh minh chứng
  - Công nợ (nợ hiện tại, lịch sử thanh toán)
  - Trả hàng NCC (phiếu trả khi hàng lỗi)
  - Lô hàng đang trong kho (trace từ NCC → vị trí kệ)
- **Giá trị**: Không cần nhảy qua nhiều module để đánh giá 1 NCC toàn diện

#### 7. Quy Trình Xuất Kho Theo Đơn Hàng Với QR Scan
- **Hệ thống thường**: Đánh dấu đã ship và trừ kho, không có quy trình picking cụ thể
- **Hệ thống này**: Khi staff xác nhận đơn → Tạo phiếu xuất kho → Chọn lô FEFO → Staff nhặt hàng + quét QR từng kiện → Hoàn tất xuất kho → Auto tạo vận đơn GHN
- **Giá trị**: Traceability end-to-end, giảm sai sót giao nhầm SP, cơ sở recall nếu lô có vấn đề

#### 8. Thanh Toán VietQR Không Cần Đăng Ký Payment Gateway
- **Hệ thống thường**: Chỉ có COD + VNPay/Momo (cần hợp đồng + tài khoản merchant)
- **Hệ thống này**: Ngoài VNPay + MoMo, có VietQR tự generate QR code thanh toán ngân hàng:
  - Không cần đăng ký merchant account
  - QR chứa sẵn số tiền + nội dung chuyển khoản
  - Dùng được với bất kỳ ngân hàng nào hỗ trợ VietQR (40+ ngân hàng VN)
- **Giá trị**: Hữu ích cho doanh nghiệp nhỏ chưa đủ điều kiện đăng ký cổng thanh toán chính thức

#### 9. Hệ Thống Chứng Chỉ Nông Sản (VietGAP, Organic, GlobalGAP)
- **Hệ thống thường**: Chỉ có categories/tags chung
- **Hệ thống này**: 
  - Model `chung_chi_san_pham` riêng cho từng SP
  - Bộ lọc frontend theo chứng chỉ (checkbox với màu riêng)
  - Hiển thị badge chứng chỉ trên card sản phẩm
  - Tích hợp SEO: chứng chỉ xuất hiện trong JSON-LD structured data
- **Giá trị**: Tạo niềm tin cho khách mua nông sản an toàn, hỗ trợ Google Rich Results hiển thị thông tin chứng chỉ

#### 10. Trang Nông Dân (Farmers) — Storytelling Xây Dựng Niềm Tin
- **Hệ thống thường**: Không có, hoặc chỉ là trang "About Us" chung chung
- **Hệ thống này**: Trang riêng giới thiệu hồ sơ nông dân với:
  - Parallax effects, stats bar (tổng hectare, năm kinh nghiệm, chứng chỉ)
  - Ảnh chân dung, câu chuyện cá nhân, vùng canh tác
  - Tạo emotional connection giữa khách hàng và người sản xuất
- **Giá trị**: Khác biệt với e-commerce thông thường vì nông sản dựa nhiều vào niềm tin về nguồn gốc

#### 11. Cảnh Báo Hạn Sử Dụng 3 Cấp Với Phương Thức Xử Lý
- **Hệ thống thường**: Không quản lý HSD, hoặc chỉ cảnh báo chung
- **Hệ thống này**: 3 mức cảnh báo tự động:
  - 🟡 Sắp hết hạn (≤7 ngày) → Gợi ý khuyến mãi/bán nhanh
  - 🔴 Đã hết hạn → Đề xuất hủy/trả NCC
  - ⚠️ Tồn kho thấp → Gợi ý đặt hàng NCC
- **Giá trị**: Chủ động quản lý hao hụt nông sản tươi — mặt hàng có HSD ngắn (3-30 ngày), không như electronics (2-5 năm)

#### 12. B2B Riêng Biệt Cho Đối Tác/Nhà Hàng
- **Hệ thống thường**: Chỉ bán lẻ B2C, hoặc cần hệ thống riêng cho B2B
- **Hệ thống này**: Trang B2B `/b2b` riêng cho đối tác (nhà hàng, siêu thị mini, quán ăn):
  - Đặt hàng số lượng lớn
  - Giá sỉ riêng
  - Quy trình duyệt đối tác
- **Giá trị**: Phục vụ cả 2 kênh B2C + B2B trong cùng 1 platform — phù hợp thực tế nông sản VN

---

**TÓM LẠI**: Hệ thống này không phải là "thêm giao diện đẹp cho shop bán rau". Nó giải quyết những BÀI TOÁN ĐẶC THÙ của ngành nông sản tươi sống:
- Hàng có HSD ngắn → FEFO + cảnh báo 3 cấp + khoảng cách giao hàng
- Niềm tin nguồn gốc → Chứng chỉ + Trang nông dân + Đánh giá NCC
- Chuỗi cung ứng phức tạp → Kho 4 cấp + 2-step nhập kho + QR traceability
- Đa dạng kênh → B2C + B2B + AI chatbot tư vấn
- Nhân sự kho → Face ID chấm công + Task quản lý + Xuất kho QR scan
