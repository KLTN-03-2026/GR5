# LUỒNG NGHIỆP VỤ: TỪ NHẬP HÀNG ĐẾN TẠO VẬN ĐƠN GHN

> Tài liệu trình bày demo khóa luận – mô tả end-to-end luồng nghiệp vụ từ lúc nhà cung cấp giao hàng vào kho cho đến khi đơn của khách được đẩy sang đối tác vận chuyển GHN (Giao Hàng Nhanh).
>
> Stack: Next.js 14 (App Router) + Prisma + PostgreSQL + GHN Open API v2.

---

## SƠ ĐỒ TỔNG QUÁT (HIGH-LEVEL FLOW)

```
┌────────────────┐   ┌────────────────┐   ┌────────────────┐   ┌──────────────┐
│ NHÀ CUNG CẤP   │──►│ NHẬP KHO + QC  │──►│ KHÁCH ĐẶT HÀNG │──►│ XUẤT KHO +   │
│ (PO → Giao)    │   │ (Goods Receipt)│   │ (E-commerce)   │   │ ĐÓNG GÓI     │
└────────────────┘   └────────────────┘   └────────────────┘   └──────┬───────┘
                                                                     │
                                                                     ▼
                                                            ┌──────────────────┐
                                                            │ TẠO VẬN ĐƠN GHN  │
                                                            │ (Admin click 1 nút)
                                                            └────────┬─────────┘
                                                                     │
                                                                     ▼
                                                            ┌──────────────────┐
                                                            │ GHN PICKUP →     │
                                                            │ GIAO → WEBHOOK   │
                                                            │ CẬP NHẬT TRẠNG   │
                                                            │ THÁI ĐƠN HÀNG    │
                                                            └──────────────────┘
```

---

## PHẦN 1 – LUỒNG NHẬP HÀNG (INBOUND / GOODS RECEIVING)

### 1.1. Mục tiêu nghiệp vụ
Khi xe của Nhà cung cấp (NCC) đến cổng kho, hệ thống phải:
1. Đối chiếu với phiếu đặt hàng đã có sẵn (số lượng yêu cầu).
2. Cho phép thủ kho **cân – đếm – chụp ảnh** số lượng thực nhận.
3. Tự động sinh **nhiệm vụ kiểm định (QC)** cho lô hàng.
4. Sau khi QC PASS, tạo **lô hàng (batch)** với hạn sử dụng / ngày thu hoạch và **cập nhật tồn kho tổng**.

### 1.2. Các model Prisma liên quan (`prisma/schema.prisma`)

| Model | Vai trò |
|---|---|
| `nha_cung_cap` | Hồ sơ NCC (tên, mã số thuế, hợp đồng) |
| `phieu_nhap_kho` | Phiếu nhập (PO header) – trạng thái: `CHO_GIAO_HANG → DANG_KIEM_TRA → HOAN_THANH` |
| `chi_tiet_phieu_nhap` | PO line: `so_luong_yeu_cau`, `so_luong_thuc_nhan`, lý do lệch, ảnh bằng chứng |
| `nhiem_vu_kiem_dinh` | Nhiệm vụ QC: `WAITING_FOR_QC → PASS / FAIL` |
| `lo_hang` | Lô hàng (batch): `ma_lo_hang`, hạn sử dụng, ngày thu hoạch, ngày nhập |
| `kien_hang_chi_tiet` | Kiện hàng: barcode, vị trí lưu trữ, trạng thái |
| `vi_tri_kho` | Vị trí kệ (khu vực / dãy / kệ / tầng) |
| `ton_kho_tong` | Tồn kho tổng hợp theo lô + vị trí |
| `lich_su_nhan_hang` | Audit trail của từng lần nhận hàng |

### 1.3. Các bước thực hiện (chronological)

**Bước 1 – Tạo phiếu nhập kho (PO)**
- Người quản trị tạo `phieu_nhap_kho` từ NCC, status mặc định `CHO_GIAO_HANG`.
- Mỗi dòng `chi_tiet_phieu_nhap` ghi rõ biến thể sản phẩm + số lượng yêu cầu.

**Bước 2 – Thủ kho mở dashboard tiếp nhận**
- UI: `src/components/admin/warehouse/WarehouseReceivingClient.tsx`
- Endpoint: `GET /api/admin/warehouse/receiving/today`
- Hiển thị 50 phiếu mới nhất, có stats card (tổng / chờ / đang xử lý / xong) và filter theo trạng thái.

**Bước 3 – Đếm – cân – chụp ảnh thực tế**
- Wizard 4 bước: `DASHBOARD → COUNT → CONFIRM → DONE`.
- Với mỗi dòng nhập, staff nhập số lượng thực tế.
- Nếu chênh lệch > 5% so với yêu cầu → **bắt buộc** ghi lý do và upload ảnh bằng chứng.
- Upload ảnh qua: `POST /api/admin/warehouse/upload/evidence` (FormData → S3).
- Kiểm tra mã lô: `POST /api/admin/warehouse/import/check-batch`.
- Gợi ý vị trí lưu trữ tối ưu: `POST /api/admin/warehouse/import/suggest-location`.

**Bước 4 – Submit phiếu nhập**
- Endpoint: `POST /api/admin/warehouse/receiving/submit`
- Body: `{ poId, items: [{id, actualQty, reason, evidenceUrl, packageStatus}], nguoi_nhan_id }`
- Side effects (trong 1 transaction Prisma):
  1. Update `chi_tiet_phieu_nhap.so_luong_thuc_nhan`.
  2. Tạo 1 record `nhiem_vu_kiem_dinh` (status `WAITING_FOR_QC`) cho mỗi dòng có `actualQty > 0`.
  3. `phieu_nhap_kho.trang_thai = 'DANG_KIEM_TRA'`.
  4. Append `lich_su_nhan_hang` (audit log).

**Bước 5 – Kiểm định chất lượng (QC)**
- Lấy danh sách nhiệm vụ: `GET /api/admin/warehouse/qc/tasks?status=WAITING_FOR_QC`.
- Nhân viên QC bắt đầu: `POST /api/admin/warehouse/qc/tasks/[id]/start`.
- Ra quyết định: `POST /api/admin/warehouse/qc/tasks/[id]/decision`
  - Body: `{ result: 'PASS' | 'FAIL', defectQty, evidenceUrl, note }`.
- Nếu **PASS**: hệ thống tạo `lo_hang` + `kien_hang_chi_tiet` (gán vị trí lưu) → cộng vào `ton_kho_tong`.
- Nếu **FAIL**: ghi nhận lỗi, trả lô hoặc xử lý hủy, không cộng tồn kho.

**Bước 6 – Đóng phiếu nhập**
- Sau khi toàn bộ dòng đã có quyết định QC → `phieu_nhap_kho.trang_thai = 'HOAN_THANH'`.
- Tồn kho khả dụng (`ton_kho_tong`) tăng → sẵn sàng phục vụ đơn của khách hàng.

---

## PHẦN 2 – LUỒNG TẠO VẬN ĐƠN GHN

### 2.1. Cấu hình tích hợp

ENV (`.env`):
```env
GHN_BASE_URL=https://dev-online-gateway.ghn.vn/shiip/public-api
GHN_TOKEN=<token cấp bởi GHN cho shop>
GHN_SHOP_ID=<shop_id của kho>
GHN_FROM_DISTRICT_ID=1526       # quận/huyện của kho gốc
GHN_FROM_WARD_CODE=550113       # phường/xã của kho gốc
```

GHN API v2 được sử dụng:

| Endpoint GHN | Mục đích | Endpoint app proxy |
|---|---|---|
| `POST /v2/shipping-order/fee` | Tính phí vận chuyển | `/api/ghn/fee` |
| `POST /v2/shipping-order/create` | Tạo vận đơn | `/api/ghn/create-order` |
| `POST /v2/shipping-order/detail` | Tra cứu chi tiết / tracking | `/api/ghn/tracking` |
| `POST /v2/switch-status/cancel` | Hủy vận đơn | `/api/ghn/cancel` |
| (Master data) | Tỉnh / Quận / Phường | `/api/ghn/master-data` |
| (Webhook) | GHN callback cập nhật trạng thái | `/api/ghn/webhook` |

### 2.2. Sổ địa chỉ của người dùng & snapshot lên đơn

#### a) 1 user – nhiều địa chỉ giao hàng

Quan hệ trong `prisma/schema.prisma`:
```
nguoi_dung (1) ───< (N) dia_chi_nguoi_dung
```
Model `dia_chi_nguoi_dung` (dòng 243–259):

| Trường | Ý nghĩa |
|---|---|
| `id` | PK của từng địa chỉ |
| `ma_nguoi_dung` (FK) | Trỏ về `nguoi_dung.id` (1 user có nhiều dòng) |
| `ho_ten`, `so_dien_thoai` | Người nhận của địa chỉ đó (có thể khác chủ tài khoản) |
| `tinh_thanh`, `quan_huyen`, `phuong_xa`, `chi_tiet_dia_chi` | Địa chỉ dạng text |
| `ma_tinh_ghn`, `ma_quan_huyen_ghn`, `ma_phuong_xa_ghn` | Mã hành chính GHN tương ứng (gắn lúc chọn từ master-data GHN) |
| `la_mac_dinh` | `true` ở **đúng 1 dòng** = địa chỉ mặc định khi checkout |

UI quản lý sổ địa chỉ ở `src/app/(store)/account/addresses/page.tsx`: khách có thể thêm/sửa/xóa nhiều địa chỉ (nhà riêng, công ty, gửi cho người thân…), đặt 1 cái mặc định.

#### b) Khi đặt hàng – chọn & snapshot

Ở bước checkout, khách chọn **1 trong các địa chỉ** của sổ địa chỉ (mặc định nếu không đổi). Hệ thống ghi vào `don_hang` **cả hai dạng** cùng lúc:

1. **Tham chiếu (FK)** – để truy vết:
   - `don_hang.ma_dia_chi` → trỏ về `dia_chi_nguoi_dung.id`

2. **Snapshot (giá trị tại thời điểm đặt)** – để không phụ thuộc về sau:
   - `don_hang.ho_ten_nguoi_nhan`
   - `don_hang.sdt_nguoi_nhan`
   - `don_hang.dia_chi_giao_hang` (text full address)
   - `don_hang.ma_tinh_ghn`
   - `don_hang.ma_quan_huyen_ghn`
   - `don_hang.ma_phuong_xa_ghn`
   - `don_hang.phi_van_chuyen` (đã tính bằng `/api/ghn/fee` với 3 mã GHN trên)

Lý do snapshot song song với FK: nếu sau này khách **sửa địa chỉ trong sổ**, **xóa địa chỉ**, hay **bỏ flag mặc định**, đơn cũ vẫn giữ nguyên thông tin tại thời điểm đặt → GHN không bị lệch, lịch sử đơn hàng vẫn tra cứu được. FK `ma_dia_chi` chỉ phục vụ analytics/UI (ví dụ hiển thị "địa chỉ thuộc nhóm Nhà / Công ty"), không phải nguồn dữ liệu giao hàng.

### 2.3. Trigger tạo vận đơn (User flow trên trang Admin)

UI: `src/app/admin/orders/page.tsx` – Drawer chi tiết đơn hàng (section "Vận chuyển GHN").

**Điều kiện hiển thị nút "Tạo vận đơn GHN"**:
```ts
viewingOrder.trang_thai === 'CHO_GIAO_HANG'
  && viewingOrder.dia_chi_giao_hang
  && !viewingOrder.don_van_chuyen?.some(s => s.ma_van_don)
```

Trình tự khi admin bấm nút (hàm `handleCreateGHNOrder`, file `src/app/admin/orders/page.tsx` ~ dòng 208–239):
1. Mở confirm dialog "Tạo vận đơn GHN cho đơn #X?".
2. `POST /api/ghn/create-order` với body `{ orderId }`.
3. Nếu thành công → toast hiển thị `order_code`, **gọi tiếp** `PUT /api/admin/orders` để chuyển trạng thái đơn `→ DANG_GIAO_HANG`.
4. Refetch danh sách đơn + đóng drawer.

### 2.4. Logic backend `POST /api/ghn/create-order`

File: `src/app/api/ghn/create-order/route.ts` (135 dòng).

Các bước nội bộ:

1. **Load đơn hàng** từ DB kèm `nguoi_dung.ho_so_nguoi_dung`, `chi_tiet_don_hang.bien_the_san_pham.san_pham`, và bản ghi `giao_dich_thanh_toan` mới nhất.

2. **Idempotency check**: nếu `don_van_chuyen` của đơn này đã có `ma_van_don` → trả về 200 với mã cũ, không gọi GHN lần nữa.

3. **Validate địa chỉ GHN**: thiếu `ma_quan_huyen_ghn` hoặc `ma_phuong_xa_ghn` → trả 400 yêu cầu cập nhật địa chỉ.

4. **Xác định COD vs Prepaid**:
   - `paymentMethod = giao_dich_thanh_toan[0].phuong_thuc_thanh_toan`.
   - `isCOD = paymentMethod === 'COD'`.
   - `cod_amount = isCOD ? round(tong_tien) : 0`.

5. **Build payload GHN**:
   ```ts
   {
     to_name:          order.ho_ten_nguoi_nhan,
     to_phone:         order.sdt_nguoi_nhan,
     to_address:       order.dia_chi_giao_hang,
     to_ward_code:     String(order.ma_phuong_xa_ghn),
     to_district_id:   Number(order.ma_quan_huyen_ghn),
     cod_amount,                              // số tiền thu hộ
     weight:           Math.max(items.length * 500, 200),  // gram
     service_type_id:  2,                     // GHN Tiết kiệm
     payment_type_id:  1,                     // Shop trả phí ship
     required_note:    'CHOXEMHANGKHONGTHU',  // cho xem hàng, không thử
     note:             order.ghi_chu,
     items:            [{ name, quantity, price }, ...],
   }
   ```

6. **Gọi GHN**:
   ```http
   POST {GHN_BASE}/v2/shipping-order/create
   Headers: { Token: GHN_TOKEN, ShopId: GHN_SHOP_ID }
   ```
   Nếu `data.code !== 200` → trả về 400 kèm message lỗi của GHN.

7. **Persist kết quả**:
   - Tìm hoặc tạo `doi_tac_van_chuyen` với `ten_doi_tac = 'GHN'`.
   - `prisma.don_van_chuyen.upsert(...)`:
     - `ma_van_don = ghnData.data.order_code`
     - `trang_thai = 'ready_to_pick'`
     - `ngay_giao_du_kien = expected_delivery_time` (parsed về `Date`).

8. **Response**: `{ success: true, order_code }`.

### 2.5. Webhook GHN cập nhật trạng thái

File: `src/app/api/ghn/webhook/route.ts`.

GHN POST về với body `{ OrderCode, Status, Time, Description }`. Backend:

1. **Map trạng thái GHN → trạng thái nội bộ** (rút gọn):

   | GHN status | Internal status |
   |---|---|
   | `ready_to_pick` | CHO_LAY_HANG |
   | `picking` | DANG_LAY_HANG |
   | `picked` | DA_LAY_HANG |
   | `delivering` / `money_collect_delivering` | DANG_GIAO_HANG |
   | `delivered` | **DA_GIAO** |
   | `delivery_fail` | GIAO_THAT_BAI |
   | `returned` | DA_HOAN_TRA |
   | `cancel` | DA_HUY |
   | `lost` / `damage` | THAT_LAC / HONG_HOC |

2. **`UPDATE don_van_chuyen SET trang_thai = <ghn_status> WHERE ma_van_don = OrderCode`**.

3. Nếu là status quan trọng (`delivered` / `returned` / `cancel`) → đồng bộ ngược vào `don_hang.trang_thai` và **append `lich_su_don_hang`** để dựng timeline trên UI.

### 2.6. Hủy vận đơn

UI: nút "Hủy vận đơn" cạnh mã GHN trên admin drawer. Endpoint app: `POST /api/ghn/cancel` → gọi GHN cancel → cập nhật `don_van_chuyen.trang_thai`.

### 2.7. Tracking khách hàng tự xem

Khách có thể click link `https://donhang.ghn.vn/?order_code=<ma_van_don>` (render sẵn ở admin drawer). Phía app có thêm `POST /api/ghn/tracking` proxy về `v2/shipping-order/detail` cho mục đích nội bộ.

---

## PHẦN 3 – TIMELINE ĐỒNG BỘ (DEMO SCRIPT)

Dùng cho phần demo trực tiếp trước hội đồng:

| # | Tác nhân | Hành động | Endpoint / Component | State đổi |
|---|---|---|---|---|
| 1 | Admin | Tạo `phieu_nhap_kho` đặt 100kg cà chua từ NCC A | UI Admin Warehouse | `CHO_GIAO_HANG` |
| 2 | Thủ kho | Mở dashboard tiếp nhận | `GET /api/admin/warehouse/receiving/today` | – |
| 3 | Thủ kho | Cân thực tế 98kg, chụp ảnh chênh 2%, submit | `POST /api/admin/warehouse/receiving/submit` | phiếu → `DANG_KIEM_TRA`, tạo `nhiem_vu_kiem_dinh` |
| 4 | QC | Bấm "Bắt đầu" → kiểm tra → PASS | `POST /qc/tasks/[id]/decision` | tạo `lo_hang`, cộng `ton_kho_tong` |
| 5 | Khách | Đặt 2kg cà chua, chọn địa chỉ (Q.1, TP.HCM), VNPay | Store checkout | tạo `don_hang` → `CHO_XAC_NHAN`, snapshot `ma_*_ghn`, `phi_van_chuyen` |
| 6 | Admin | Duyệt đơn → hệ thống tạo `phieu_xuat_kho` | `/api/staff/orders` (CONFIRM) | đơn → `CHO_GIAO_HANG` |
| 7 | Admin | Mở drawer đơn → click **"Tạo vận đơn GHN"** | `POST /api/ghn/create-order` | tạo `don_van_chuyen.ma_van_don`, đơn → `DANG_GIAO_HANG` |
| 8 | GHN | Shipper đến lấy hàng | GHN webhook `picked` | `don_van_chuyen.trang_thai = picked` |
| 9 | GHN | Đang giao | GHN webhook `delivering` | đồng bộ về app |
| 10 | GHN | Khách ký nhận | GHN webhook `delivered` | `don_hang.trang_thai = DA_GIAO`, ghi `lich_su_don_hang` |

---

## PHẦN 4 – ĐIỂM NHẤN KỸ THUẬT KHI THUYẾT TRÌNH

1. **Idempotent tạo vận đơn**: bấm nút nhiều lần không tạo trùng vận đơn nhờ check `existingShipment.ma_van_don` trước khi gọi GHN.
2. **Snapshot địa chỉ GHN trên đơn hàng**: tránh data drift khi user đổi sổ địa chỉ sau khi đã đặt.
3. **Webhook 2 chiều**: GHN → app cập nhật real-time, không cần polling.
4. **Mapping trạng thái tập trung** (`STATUS_MAP` trong webhook) → dễ mở rộng cho đối tác khác (GHTK, Viettel Post) bằng cùng pattern.
5. **Audit trail kép**: `lich_su_nhan_hang` (kho) + `lich_su_don_hang` (đơn) → truy vết toàn bộ vòng đời sản phẩm từ NCC → khách.
6. **Tách `don_van_chuyen` khỏi `don_hang`**: 1 đơn hàng có thể có nhiều vận đơn (tách kiện), schema sẵn sàng cho multi-shipment.
7. **QC gate trước khi mở bán**: tồn kho chỉ tăng sau khi PASS QC → tránh bán hàng kém chất lượng.
8. **GHN fee tính lúc checkout** (`/api/ghn/fee`), nên giá ship khách thấy = giá ship thực tế GHN trả về, không có hardcode.

---

## PHẦN 5 – CÁC FILE / ENDPOINT TRÍCH DẪN NHANH

**Nhập kho**
- UI: `src/components/admin/warehouse/WarehouseReceivingClient.tsx`
- Dashboard: `GET /api/admin/warehouse/receiving/today`
- Submit: `POST /api/admin/warehouse/receiving/submit`
- Upload ảnh: `POST /api/admin/warehouse/upload/evidence`
- QC list: `GET /api/admin/warehouse/qc/tasks`
- QC decision: `POST /api/admin/warehouse/qc/tasks/[id]/decision`

**Vận đơn GHN**
- Tính phí: `src/app/api/ghn/fee/route.ts`
- Tạo vận đơn: `src/app/api/ghn/create-order/route.ts`
- Webhook: `src/app/api/ghn/webhook/route.ts`
- Hủy: `src/app/api/ghn/cancel/route.ts`
- Tracking: `src/app/api/ghn/tracking/route.ts`
- UI trigger: `src/app/admin/orders/page.tsx` (hàm `handleCreateGHNOrder`)

**Schema chính** (`prisma/schema.prisma`)
- `phieu_nhap_kho`, `chi_tiet_phieu_nhap`, `nhiem_vu_kiem_dinh`, `lo_hang`, `ton_kho_tong`
- `don_hang` (snapshot `ma_*_ghn`, `phi_van_chuyen`)
- `don_van_chuyen` (`ma_van_don`, `trang_thai`, `ngay_giao_du_kien`)
- `doi_tac_van_chuyen` (đối tác vận chuyển – GHN, GHTK,…)
- `lich_su_don_hang` (timeline trạng thái đơn)
