Giai đoạn 3 — Tiếp nhận hàng (Receiving / Inbound)
Giai đoạn này tập trung vào việc đối chiếu số lượng thực tế với số lượng dự kiến trên Purchase Order (PO). Dữ liệu lúc này chỉ là "hàng tạm", chưa được tính vào tồn kho (Inventory) có thể bán.

3.1. Check-in tại cổng kho (Hành động số hóa)

Thao tác thực tế: Tài xế đến giao hàng, đưa mã PO hoặc quét QR code trên phiếu giao hàng.

Xử lý trên hệ thống (Web/Tablet App):

Bảo vệ/Nhân viên kho quét mã. Hệ thống gọi API check valid PO.

Trạng thái của PO chuyển từ PENDING sang RECEIVING.

Hệ thống hiển thị danh sách các mặt hàng (SKU) và số lượng dự kiến (Expected Quantity).

3.2. Dỡ hàng & Kiểm đếm số lượng (Thao tác trên Mobile App)

Thao tác thực tế: Hàng được bốc xuống. Nhân viên dùng thiết bị cầm tay (Handheld) để đếm số lượng kiện/thùng.

Xử lý trên hệ thống:

Nhân viên nhập số lượng thực tế (Actual Quantity) vào app.

Logic xử lý:

Nếu Actual == Expected: App bôi xanh, pass.

Nếu Actual != Expected (Lệch số lượng): App bắt buộc nhân viên phải nhập lý do (vd: NCC giao thiếu, hàng rách vỡ ngay lúc dỡ) và bắt buộc chụp ảnh upload lên server (lưu qua S3 bucket) làm bằng chứng.

Hệ thống không chặn việc nhận thiếu hàng, nhưng sẽ tự động cập nhật lại chứng từ (GRN) theo số thực nhận để team Finance thanh toán sau này.

3.3. Đưa vào vùng đệm (Staging Area)

Thao tác thực tế: Hàng bốc xong được kéo vào khu vực chờ QC.

Xử lý trên hệ thống:

Lô hàng được hệ thống tự động sinh ra một mã định danh tạm (Temp Batch ID).

Trạng thái lô hàng được set thành WAITING_FOR_QC.

Hệ thống bắn thông báo (Real-time qua WebSocket) sang màn hình Dashboard của team QC.

Giai đoạn 4 — Kiểm định chất lượng (QC - Quality Control)
Đây là bước quyết định hàng có được phép nhập kho hay không. Chúng ta thiết kế flow này dưới dạng một ứng dụng Checklist động.

4.1. Nhận Task QC (Hệ thống điều phối)

Xử lý trên hệ thống: Màn hình Dashboard của QC Lead hiển thị danh sách các lô hàng có trạng thái WAITING_FOR_QC. Hệ thống tự động Sort theo độ ưu tiên (hàng tươi sống/nhạy cảm thời gian nổi lên đầu).

Thao tác thực tế: Nhân viên QC bấm "Nhận việc" trên máy tính bảng. Trạng thái lô hàng đổi thành QC_IN_PROGRESS.

4.2. Thực hiện kiểm tra (Dynamic Form)

Thao tác thực tế: QC kiểm tra ngẫu nhiên một vài thùng. Xem xét màu sắc, mùi vị, dùng cân điện tử để kiểm tra trọng lượng trung bình.

Xử lý trên hệ thống (Tablet App):

Giao diện hiển thị một form checklist đơn giản (Pass/Fail checkbox, hoặc Input số).

Ví dụ: Bao bì nguyên vẹn (Checkbox), Màu sắc tươi (Checkbox), Kích thước đạt chuẩn (Input mm/gram).

4.3. Quyết định QC (Logic xử lý cốt lõi)
Nhân viên QC phải chọn 1 trong 3 Action trên hệ thống. Đây là nơi các dòng code xử lý phân luồng phức tạp nhất:

Pass Toàn Bộ (Accept All):

Toàn bộ số lượng hàng ở bước 3 đạt chuẩn.

Trạng thái Batch chuyển thành QC_PASSED.

Pass Một Phần (Partial Accept):

Ví dụ nhận 100 thùng, nhưng có 10 thùng bị dập nát.

QC nhập số lượng hàng lỗi (Damaged Qty) = 10.

Logic Backend: Tự động clone/tách lô hàng này ra làm 2 record trong Database. 1 lô 90 thùng mang status QC_PASSED, 1 lô 10 thùng mang status RETURN_TO_VENDOR.

Fail Toàn Bộ (Reject All):

Hàng quá tệ, từ chối nhận.

Logic Backend: Bắt buộc QC chọn lý do từ Dropdown list và upload hình ảnh. Trạng thái chuyển thành QC_FAILED.

4.4. Mã hóa & In tem nhãn (Labeling / Barcoding)

Xử lý trên hệ thống: Ngay khi lô hàng có trạng thái QC_PASSED, hệ thống tự động sinh ra một mã Barcode/QR code nội bộ. Mã này bao gồm: SKU_ID + Batch_ID + Expiry_Date.

Thao tác thực tế: Ứng dụng gọi API kết nối mạng LAN tới máy in tem (Zebra/Xprinter). Tem được in ra. Nhân viên dán tem lên từng thùng hàng.

# Kế Hoạch Triển Khai WMS - Module Nhập Kho & Kiểm Định (Nông Sản)

Tài liệu này phân rã nghiệp vụ Quản lý Kho (WMS) thành 2 phần để thực hiện. Hệ thống sử dụng Next.js (App Router) cho UI/API, Prisma ORM thao tác với MySQL database và AWS S3 để lưu trữ tệp tin.

---

## Phần 1: Thực hiện Giai đoạn 3 — Tiếp nhận hàng (Inbound / Receiving)

Mục tiêu: Đưa hàng vật lý từ xe tải vào khu vực chờ (Staging Area) và ghi nhận số lượng thực tế lên hệ thống.

### 1.1. Thiết kế Database (Prisma Schema)
- [x] Tạo model `PurchaseOrder` (Trạng thái: `PENDING`, `RECEIVING`, `COMPLETED`).
- [x] Tạo model `PO_Item` (Chứa `sku_id`, `expected_qty`, `actual_qty`).
- [x] Tạo model `ReceivingLog` (Lưu lịch sử nhân viên quét mã, thời gian check-in).

### 1.2. Phát triển API (Next.js Route Handlers)
- [x] `GET /api/receiving/po/:code` - Trả về chi tiết PO và danh sách SKU dự kiến khi nhân viên quét QR ở cổng kho.
- [x] `PUT /api/receiving/po/:code/status` - Cập nhật trạng thái PO từ `PENDING` sang `RECEIVING`.
- [x] `POST /api/receiving/submit` - Ghi nhận số lượng thực tế dỡ xuống.
- [x] `POST /api/upload/evidence` - Xử lý upload hình ảnh (hàng thiếu/hư hỏng lúc dỡ) qua AWS S3 và trả về URL.

### 1.3. Xây dựng Giao diện (Frontend)
- [x] **Màn hình Check-in (Web/Tablet):** Ô input/Nút mở camera quét mã PO. Hiển thị thông tin xe, NCC và danh sách dự kiến.
- [x] **Màn hình Kiểm đếm (Mobile-friendly):** 
  - List các SKU cần nhận.
  - Form nhập `Actual Quantity`.
  - Logic UI: Bôi xanh ròng nếu `Actual == Expected`. Cảnh báo đỏ và hiện nút "Chụp ảnh bằng chứng" nếu `Actual != Expected`.
- [x] **Hành động hoàn tất dỡ hàng:** 
  - Nút "Chuyển vào Staging". 
  - Hệ thống tự động sinh `Temp_Batch_ID` và phát event (WebSocket/Pusher) để báo cho team QC.

---

## Phần 2: Thực hiện Giai đoạn 4 — Kiểm định chất lượng (QC)

Mục tiêu: Đánh giá chất lượng lô hàng trong Staging Area, phân luồng nhập kho hoặc trả hàng, và khởi tạo tồn kho thực tế.

### 2.1. Thiết kế Database (Prisma Schema)
- [x] Tạo model `QC_Task` (Liên kết với `Temp_Batch_ID`, Trạng thái: `WAITING_FOR_QC`, `QC_IN_PROGRESS`, `DONE`).
- [x] Tạo model `InventoryBatch` (Lô hàng chính thức sau khi pass QC, chứa `sku_id`, `qty`, `expiry_date`, `barcode`).
- [x] Tạo model `ReturnToVendor` (Lưu thông tin hàng bị reject kèm lý do để đối soát thanh toán).

### 2.2. Phát triển API (Next.js Route Handlers)
- [x] `GET /api/qc/tasks` - Lấy danh sách lô hàng đang chờ kiểm định, sort theo ưu tiên (nông sản tươi lên đầu).
- [x] `PUT /api/qc/tasks/:id/start` - Đổi trạng thái sang `QC_IN_PROGRESS`.
- [x] `POST /api/qc/tasks/:id/decision` - Endpoint cốt lõi xử lý 3 luồng quyết định:
  - **Trường hợp Accept All:** Chuyển toàn bộ số lượng sang bảng `InventoryBatch`.
  - **Trường hợp Reject All:** Đẩy toàn bộ vào bảng `ReturnToVendor`.
  - **Trường hợp Partial Accept:** Transaction cắt lô (chia data) - một phần vào `InventoryBatch`, phần lỗi vào `ReturnToVendor`.

### 2.3. Xây dựng Giao diện (Frontend)
- [x] **QC Dashboard:** Bảng Kanban hoặc List view hiển thị các task đang chờ.
- [x] **Dynamic Form Kiểm định (Tablet App):**
  - Checkbox: *Màu sắc chuẩn*, *Bao bì nguyên vẹn*, *Không dập nát*.
  - Input số: *Trọng lượng trung bình (gram)*, *Kích thước (mm)*.
- [x] **Modal Quyết định QC:**
  - Nút "Pass Toàn Bộ".
  - Nút "Pass Một Phần" -> Mở input nhập số lượng hàng bị lỗi.
  - Nút "Fail Toàn Bộ" -> Bắt buộc chọn lý do từ Dropdown (Thối rữa, Sai quy cách, Không đủ chứng từ) và nút Upload ảnh lên S3.
- [x] **Tích hợp In tem (Barcode):** 
  - Sau khi xử lý `Pass`, UI hiển thị nút "In Tem Lô Hàng".
  - Chuyển đổi dữ liệu `InventoryBatch` thành mã định dạng Barcode/QR để máy in mạng nội bộ xuất tem.

---

## 3. Ghi Chú Cập Nhật Schema (Thực hiện bởi AI)

Thay vì tạo các model tiếng Anh mới hoàn toàn và gây phân mảnh với DB cũ, hệ thống sẽ mở rộng các model tiếng Việt hiện có trong `schema.prisma`:

1. **PurchaseOrder & PO_Item**:
   - Sử dụng model `phieu_nhap_kho` và `chi_tiet_phieu_nhap` hiện có.
   - Bổ sung trường `ly_do_lech` (lý do lệch số lượng) và `anh_bang_chung` (ảnh upload S3) vào `chi_tiet_phieu_nhap`.

2. **ReceivingLog**:
   - Tạo mới model `lich_su_nhan_hang` liên kết với `phieu_nhap_kho` và `nguoi_dung` để lưu log hành động check-in, đếm số lượng, đưa vào staging.

3. **QC_Task**:
   - Tạo mới model `nhiem_vu_kiem_dinh` liên kết 1-1 với `chi_tiet_phieu_nhap`. Lưu các thông tin: trạng thái QC (WAITING_FOR_QC, QC_IN_PROGRESS), kết quả (PASS_ALL, PARTIAL_PASS, REJECT_ALL), số lượng lỗi, lý do lỗi, và ảnh bằng chứng.

4. **InventoryBatch & ReturnToVendor**:
   - `InventoryBatch` tương đương với model `lo_hang` hiện hành.
   - `ReturnToVendor` tương đương với model `phieu_tra_nha_cung_cap` hiện hành.

*Schema đã được cập nhật tương ứng vào `prisma/schema.prisma`.*

---

## 4. Ghi Chú Tối Ưu UI & Phân Quyền Route (Cập nhật mới)

Để hệ thống hoạt động đúng với kiến trúc Role-based phân tách rõ ràng của dự án, các Component đã được cấu hình lại để nhúng vào đúng môi trường thay vì chỉ nằm ở `/admin`:

1. **Routing & Phân Quyền Thực Tế:**
   - **Màn hình Nhận Hàng (Check-in)** (`WarehouseReceivingClient.tsx`): 
     - Được tích hợp vào `/staff/warehouse/receiving` (Dành cho Nhân viên).
     - Được tích hợp vào `/warehouse-manager/receiving` (Dành cho Thủ kho).
   - **Màn hình Kiểm Định QC** (`QCDashboardClient.tsx`):
     - Được tích hợp vào `/warehouse-manager/qc` (Dành riêng cho Thủ kho/Quản lý).

2. **Cập Nhật Sidebar Menu:**
   - **Staff Sidebar:** Đã thêm mục `Nhận Hàng (Check-in)` để nhân viên dễ dàng thao tác quét mã và đếm số lượng dỡ hàng.
   - **Warehouse Manager Sidebar:** Đã thêm 2 mục `Nhận Hàng (Check-in)` và `Kiểm Định (QC)` để thủ kho điều hướng nhanh chóng bằng thao tác click, không cần gõ URL thủ công.