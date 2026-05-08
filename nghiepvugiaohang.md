# Nghiệp Vụ Giao Hàng — Hệ Thống NôngSản

> Cập nhật: 08/05/2026

---

## 1. Tổng Quan Mô Hình Giao Hàng

Hệ thống chia thành **2 kênh giao hàng** dựa trên địa chỉ nhận:

| Kênh | Phạm vi | Đơn vị vận chuyển | Thời gian giao |
|------|---------|-------------------|----------------|
| Giao gần | Nội thành Đà Nẵng | Tài xế riêng (nội bộ/CTV) | 1–4 giờ |
| Giao trung & xa | Toàn quốc (ngoài Đà Nẵng) | GHN API | 1–4 ngày |

---

## 2. Giao Hàng Gần — Tài Xế Riêng (Nội Thành Đà Nẵng)

| Hạng mục | Chi tiết |
|----------|----------|
| Hình thức | Tài xế nội bộ hoặc cộng tác viên cố định |
| Thời gian giao | 1–4 giờ, theo khung giờ ca sáng/chiều |
| Chi phí | Lương cố định hoặc theo chuyến (~15.000–25.000 ₫/đơn) |
| Ưu điểm | Kiểm soát chất lượng, giao đúng giờ, gọi trước được |
| Lưu ý | Cần quản lý lộ trình giao theo cụm địa chỉ để tối ưu số chuyến |

### 2.1 Luồng nghiệp vụ — Giao gần

```
Đơn hàng mới (trang_thai: CHO_XAC_NHAN)
  → Hệ thống detect địa chỉ thuộc Đà Nẵng (dựa ma_tinh_ghn hoặc tên tỉnh)
  → Admin xác nhận đơn → Assign cho tài xế nội bộ
  → Tài xế nhận đơn → trang_thai: DANG_GIAO_HANG
  → Tài xế giao xong → xác nhận → trang_thai: DA_GIAO
```

### 2.2 Plan triển khai — Giao gần

| Bước | Mô tả | File/API liên quan |
|------|--------|-------------------|
| 1 | Tạo bảng `tai_xe` trong DB (id, ho_ten, sdt, trang_thai, khu_vuc) | `prisma/schema.prisma` |
| 2 | Tạo bảng `don_giao_noi_bo` (id, ma_don_hang, ma_tai_xe, trang_thai, thoi_gian_nhan, thoi_gian_giao) | `prisma/schema.prisma` |
| 3 | Logic phân loại tự động: nếu `ma_tinh_ghn` = ID tỉnh Đà Nẵng → kênh nội bộ | `src/app/api/store/orders/route.ts` (POST) |
| 4 | Trang Admin: giao đơn cho tài xế (dropdown chọn tài xế) | `src/app/admin/orders/` |
| 5 | Trang Tài xế: danh sách đơn được assign, nút "Đã giao" | `src/app/driver/` (mới) |
| 6 | Thông báo realtime cho tài xế (optional: push notification hoặc polling) | — |

---

## 3. Giao Hàng Trung & Xa — GHN

| Hạng mục | Trung (Miền Trung) | Xa (Toàn Quốc) |
|----------|---------------------|-----------------|
| Dịch vụ | GHN Nhanh | GHN Nhanh / GHN Tiết Kiệm |
| Thời gian | 1 ngày | 2–4 ngày |
| Chi phí ước tính | 25.000–45.000 ₫ | 50.000–120.000 ₫ |
| Bảo hiểm hàng | Có — khai giá trị đơn | Có — khai giá trị đơn |
| Đóng gói lạnh | Khuyến nghị với rau tươi | Bắt buộc với hàng dễ hỏng |
| Tích hợp API | ✅ GHN Open API | ✅ Dùng chung một API |

**Lợi thế dùng một đơn vị (GHN):** Một tài khoản, một bảng giá đàm phán, một luồng tracking — dễ tích hợp vào hệ thống.

### 3.1 Luồng nghiệp vụ — GHN (đã tích hợp)

```
Đơn hàng mới (trang_thai: CHO_XAC_NHAN)
  → Hệ thống detect địa chỉ KHÔNG thuộc Đà Nẵng
  → Admin xác nhận đơn → Gọi GHN Create Order API
  → Nhận mã vận đơn → Lưu vào bảng don_van_chuyen
  → GHN Webhook callback khi trạng thái thay đổi → Cập nhật DB tự động
  → Khách tra cứu qua TrackingTimeline component
```

### 3.2 Plan triển khai — GHN (trạng thái hiện tại)

| Bước | Mô tả | Trạng thái |
|------|--------|-----------|
| 1 | API tính phí ship (`/api/ghn/fee`) | ✅ Done |
| 2 | API tạo vận đơn (`/api/ghn/create-order`) | ✅ Done |
| 3 | API tra cứu (`/api/ghn/tracking`) | ✅ Done |
| 4 | Webhook nhận cập nhật (`/api/ghn/webhook`) | ✅ Done |
| 5 | Master data tỉnh/quận/phường (`/api/ghn/master-data`) | ✅ Done |
| 6 | Frontend: AddressForm chọn địa chỉ GHN khi checkout | ✅ Done |
| 7 | Frontend: TrackingTimeline hiển thị cho khách | ✅ Done |
| 8 | Đăng ký tài khoản GHN sandbox + điền env | ⚠️ Cần bạn làm |

---

## 4. Logic Phân Loại Tự Động Khi Tạo Đơn

```
Khách đặt hàng → Chọn địa chỉ giao
  │
  ├── ma_tinh_ghn === 48 (Đà Nẵng)?
  │     ├── CÓ  → Kênh: GIAO_NOI_BO
  │     │         → Phí ship: 15.000–25.000 ₫ (cố định)
  │     │         → Assign tài xế riêng
  │     │         → Giao trong 1–4 giờ
  │     │
  │     └── KHÔNG → Kênh: GHN
  │               → Phí ship: Gọi GHN Fee API (động)
  │               → Tạo vận đơn GHN khi admin xác nhận
  │               → Tracking qua GHN API
```

**Ghi chú:** ProvinceID của Đà Nẵng trong GHN master-data = `48`. Cần verify lại bằng cách gọi `/api/ghn/master-data?type=province`.

---

## 5. Trạng Thái Đơn Hàng — Luồng Đầy Đủ

### 5.1 Luồng chính (Happy path)

```
CHO_XAC_NHAN → DA_THANH_TOAN → DANG_GIAO_HANG → DA_GIAO → (HOAN_THANH)
```

### 5.2 Luồng đặc biệt

```
CHO_XAC_NHAN → DA_HUY                              (Khách hủy trước khi xác nhận)
DA_GIAO → YEU_CAU_DOI_TRA → DA_HOAN_TRA            (Khách yêu cầu đổi trả, admin duyệt)
DA_GIAO → YEU_CAU_DOI_TRA → DA_GIAO                (Admin từ chối đổi trả)
DANG_GIAO_HANG → GIAO_THAT_BAI → DANG_HOAN_TRA     (GHN giao thất bại)
```

### 5.3 Mapping trạng thái GHN → Hệ thống

| GHN Status | Trạng thái hệ thống | Ghi chú |
|------------|---------------------|---------|
| ready_to_pick | DANG_CHUAN_BI | Admin vừa tạo vận đơn |
| picking | DANG_LAY_HANG | Shipper đang đến lấy |
| picked | DA_LAY_HANG | Đã lấy hàng từ kho |
| delivering | DANG_GIAO_HANG | Đang giao cho khách |
| delivered | DA_GIAO | Giao thành công |
| delivery_fail | GIAO_THAT_BAI | Giao thất bại |
| return | DANG_HOAN_TRA | Đang trả hàng về |
| returned | DA_HOAN_TRA | Đã trả về kho |
| cancel | DA_HUY | Hủy vận đơn |

---

## 6. Các Nghiệp Vụ Cốt Lõi & Plan Chi Tiết

### 6.1 Nghiệp vụ: Đặt hàng + Thanh toán

**Mô tả:** Khách chọn sản phẩm → checkout → chọn địa chỉ → chọn phương thức thanh toán → tạo đơn.

| # | Bước | API/File | Trạng thái |
|---|------|----------|-----------|
| 1 | Khách thêm vào giỏ | CartContext + `/api/store/cart` | ✅ |
| 2 | Trang checkout: chọn địa chỉ (GHN) | `/payment/page.tsx` → AddressForm | ✅ |
| 3 | Tính phí ship | `/api/ghn/fee` | ✅ |
| 4 | Chọn phương thức thanh toán (COD/MoMo/VNPay/Bank) | `/payment/page.tsx` | ✅ |
| 5 | Tạo đơn hàng + giao dịch thanh toán | POST `/api/store/orders` | ✅ |
| 6 | Redirect theo phương thức (MoMo/VNPay redirect, Bank hiện QR) | `/api/store/payment` | ✅ |
| 7 | Callback xác nhận thanh toán | `momo-ipn`, `vnpay-return` | ✅ |
| 8 | Trang kết quả | `/payment/check` | ✅ |

**Cần fix:**
- [ ] `userId` hardcode = 1 → lấy từ session
- [ ] Phân loại kênh giao hàng ngay khi tạo đơn (Đà Nẵng vs GHN)

---

### 6.2 Nghiệp vụ: Quản lý đơn hàng (Khách)

**Mô tả:** Khách xem danh sách đơn, xem chi tiết, theo dõi vận chuyển, yêu cầu đổi trả.

| # | Bước | API/File | Trạng thái |
|---|------|----------|-----------|
| 1 | Danh sách đơn + filter tab | `/account/orders` → `/orders/page.tsx` | ✅ |
| 2 | Modal chi tiết đơn + stepper trạng thái | Cùng file trên | ✅ |
| 3 | Tracking vận chuyển GHN | `TrackingTimeline` component | ✅ |
| 4 | Yêu cầu đổi trả (form + upload ảnh) | PUT `/api/store/orders` | ⚠️ Thiếu lưu lý do + ảnh |
| 5 | Hủy đơn (khi còn CHO_XAC_NHAN) | — | ❌ Chưa có |

**Cần làm:**
- [ ] Fix API PUT lưu `ly_do_hoan_tra` + `anh_minh_chung` (đang bị comment out)
- [ ] Thêm nút + API "Hủy đơn" cho trạng thái CHO_XAC_NHAN
- [ ] Fix userId từ session thay vì hardcode
- [ ] Hiển thị `phi_van_chuyen` thật trong modal (đang hardcode 0đ)

---

### 6.3 Nghiệp vụ: Quản lý đơn hàng (Admin)

**Mô tả:** Admin xem tất cả đơn, đổi trạng thái, tạo vận đơn GHN, duyệt đổi trả.

| # | Bước | API/File | Trạng thái |
|---|------|----------|-----------|
| 1 | Danh sách đơn + search/filter/phân trang | GET `/api/admin/orders` | ✅ |
| 2 | Đổi trạng thái đơn hàng | PUT `/api/admin/orders` | ✅ |
| 3 | Tạo vận đơn GHN | POST `/api/ghn/create-order` | ✅ |
| 4 | Duyệt/từ chối đổi trả | PUT `/api/admin/orders` (action: HANDLE_RETURN) | ✅ |
| 5 | Ghi lịch sử đơn hàng khi đổi trạng thái | `lich_su_don_hang` table | ❌ Chưa ghi |
| 6 | Assign tài xế nội bộ (đơn Đà Nẵng) | — | ❌ Chưa có |

**Cần làm:**
- [ ] Insert `lich_su_don_hang` mỗi khi admin đổi trạng thái
- [ ] Trang/logic assign tài xế cho đơn giao nội bộ Đà Nẵng
- [ ] Dashboard thống kê đơn theo kênh (nội bộ vs GHN)

---

### 6.4 Nghiệp vụ: Giao hàng nội bộ (MỚI — cần phát triển)

**Mô tả:** Đơn hàng giao trong nội thành Đà Nẵng do tài xế riêng thực hiện.

| # | Bước | Mô tả | Trạng thái |
|---|------|-------|-----------|
| 1 | Schema DB: bảng `tai_xe`, `don_giao_noi_bo` | Lưu thông tin tài xế + lịch sử giao | ❌ Chưa có |
| 2 | API assign đơn cho tài xế | Admin chọn tài xế → gán vào đơn | ❌ Chưa có |
| 3 | Trang tài xế (mobile-friendly) | Xem đơn cần giao, xác nhận đã giao | ❌ Chưa có |
| 4 | Auto-detect kênh giao khi tạo đơn | Dựa vào `ma_tinh_ghn` = 48 | ❌ Chưa có |
| 5 | Phí ship cố định cho nội thành | 15.000–25.000 ₫ thay vì gọi GHN fee | ❌ Chưa có |
| 6 | Quản lý lộ trình theo cụm địa chỉ | Tối ưu số chuyến/ngày | ❌ Phase 2 |

---

### 6.5 Nghiệp vụ: Đổi trả & Hoàn tiền

**Mô tả:** Khách yêu cầu đổi/trả → Admin duyệt → Hoàn tiền (nếu có).

| # | Bước | API/File | Trạng thái |
|---|------|----------|-----------|
| 1 | Khách gửi yêu cầu (lý do + ảnh) | PUT `/api/store/orders` (action: RETURN) | ⚠️ Thiếu lưu data |
| 2 | Admin xem yêu cầu đổi trả | `/admin/orders` → drawer | ✅ |
| 3 | Admin duyệt / từ chối | PUT `/api/admin/orders` (action: HANDLE_RETURN) | ✅ |
| 4 | Hoàn tiền (nếu duyệt + thanh toán online) | Bảng `lich_su_hoan_tien` | ❌ Chưa có logic |
| 5 | Hoàn kho (trả số lượng tồn kho) | `bien_the_san_pham.so_luong_ton` | ❌ Comment out |

**Cần làm:**
- [ ] Uncomment + fix lưu `ly_do_hoan_tra`, `anh_minh_chung` trong API
- [ ] Logic hoàn tiền: tạo record `lich_su_hoan_tien` khi duyệt
- [ ] Logic hoàn kho: increment `so_luong_ton` khi duyệt trả hàng

---

## 7. Ưu Tiên Triển Khai (Đề Xuất)

| Ưu tiên | Nghiệp vụ | Lý do |
|---------|-----------|-------|
| 🔴 P0 | Fix userId từ session | Bug — mọi khách thấy cùng 1 đơn |
| 🔴 P0 | Fix lưu lý do + ảnh đổi trả | Data loss — khách gửi nhưng không lưu |
| 🟡 P1 | Thêm nút hủy đơn (khách) | UX cơ bản thiếu |
| 🟡 P1 | Ghi lịch sử đơn hàng | Audit trail quan trọng |
| 🟡 P1 | Hiển thị phí ship thật trong modal | Sai thông tin cho khách |
| 🟠 P2 | Logic phân loại kênh giao (Đà Nẵng vs GHN) | Nghiệp vụ mới |
| 🟠 P2 | Trang + API tài xế nội bộ | Nghiệp vụ mới |
| 🟠 P2 | Logic hoàn tiền + hoàn kho | Hoàn thiện đổi trả |
| ⚪ P3 | Quản lý lộ trình cụm địa chỉ | Optimization |
| ⚪ P3 | Push notification cho tài xế | Nice-to-have |

---

## 8. Schema DB Cần Bổ Sung (cho giao hàng nội bộ)

```prisma
model tai_xe {
  id              Int               @id @default(autoincrement())
  ho_ten          String            @db.VarChar(100)
  so_dien_thoai   String            @db.VarChar(15)
  trang_thai      String?           @default("SAN_SANG") @db.VarChar(20) // SAN_SANG, DANG_GIAO, NGHI
  khu_vuc         String?           @db.VarChar(100)
  ngay_tao        DateTime?         @default(now()) @db.DateTime(0)
  don_giao_noi_bo don_giao_noi_bo[]
}

model don_giao_noi_bo {
  id              Int       @id @default(autoincrement())
  ma_don_hang     Int
  ma_tai_xe       Int?
  trang_thai      String?   @default("CHO_NHAN") @db.VarChar(30) // CHO_NHAN, DANG_GIAO, DA_GIAO, THAT_BAI
  thoi_gian_nhan  DateTime? @db.DateTime(0)
  thoi_gian_giao  DateTime? @db.DateTime(0)
  ghi_chu         String?   @db.Text
  don_hang        don_hang  @relation(fields: [ma_don_hang], references: [id], onDelete: Cascade)
  tai_xe          tai_xe?   @relation(fields: [ma_tai_xe], references: [id])

  @@index([ma_don_hang])
  @@index([ma_tai_xe])
}
```

Cần thêm vào `don_hang`:
```prisma
kenh_giao_hang    String?   @default("GHN") @db.VarChar(20) // GHN, NOI_BO
don_giao_noi_bo   don_giao_noi_bo[]
```
