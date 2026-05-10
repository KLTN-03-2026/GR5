# Nghiệp Vụ Giao Hàng — Hệ Thống NôngSản

> Cập nhật: 08/05/2026

---

## 1. Tổng Quan Mô Hình Giao Hàng

Toàn bộ đơn hàng đều giao qua **GHN (Giao Hàng Nhanh)** — một đơn vị, một API, một luồng tracking.

| Khoảng cách | Phạm vi | Dịch vụ GHN | Thời gian giao | Chi phí ước tính |
|---|---|---|---|---|
| Gần | Nội thành Đà Nẵng | GHN Nhanh | 1–4 giờ (nội thành) | 15.000–30.000 ₫ |
| Trung | Miền Trung (Huế, Quảng Nam...) | GHN Nhanh | 1 ngày | 25.000–45.000 ₫ |
| Xa | Toàn quốc | GHN Nhanh / GHN Tiết Kiệm | 2–4 ngày | 50.000–120.000 ₫ |

**Lợi thế dùng một đơn vị (GHN) cho tất cả:**
- Một tài khoản, một bảng giá đàm phán
- Một luồng tracking, một webhook
- Không cần quản lý tài xế, lộ trình, nhân sự giao hàng
- GHN nội thành Đà Nẵng giao rất nhanh (1–4h) — gần như tương đương tài xế riêng

---

## 2. Luồng Nghiệp Vụ Giao Hàng (Thống Nhất)

```
Khách đặt hàng → Chọn địa chỉ giao (GHN master-data: tỉnh/quận/phường)
  → Hệ thống gọi GHN Fee API → Hiển thị phí ship cho khách
  → Khách xác nhận đặt hàng → Tạo đơn (trang_thai: CHO_XAC_NHAN)
  → Admin xác nhận đơn → Gọi GHN Create Order API → Nhận mã vận đơn
  → Lưu mã vận đơn vào bảng don_van_chuyen
  → GHN Webhook callback khi trạng thái thay đổi → Cập nhật DB tự động
  → Khách tra cứu qua TrackingTimeline component
```

---

## 3. Các API GHN Đã Tích Hợp

| # | Mục đích | Endpoint hệ thống | Trạng thái |
|---|----------|-------------------|-----------|
| 1 | Lấy tỉnh/quận/phường | GET `/api/ghn/master-data` | ✅ Done |
| 2 | Tính phí vận chuyển | POST `/api/ghn/fee` | ✅ Done |
| 3 | Tạo vận đơn | POST `/api/ghn/create-order` | ✅ Done |
| 4 | Tra cứu vận đơn | POST `/api/ghn/tracking` | ✅ Done |
| 5 | Webhook nhận cập nhật | POST `/api/ghn/webhook` | ✅ Done |

---

## 4. Lưu Ý Đặc Biệt Cho Nông Sản

| Vấn đề | Giải pháp |
|--------|-----------|
| Rau/củ tươi dễ hỏng | Đóng gói lạnh (túi giữ nhiệt) — khuyến nghị cho giao trung, bắt buộc cho giao xa |
| Trọng lượng lớn (gạo, khoai...) | Khai đúng `weight` (gram) khi tạo vận đơn để GHN tính phí chính xác |
| Giá trị hàng cao | Luôn khai `insurance_value` = giá trị đơn để có bảo hiểm |
| Nội thành Đà Nẵng | GHN giao nhanh 1–4h, đủ đáp ứng nhu cầu giao gần mà không cần tài xế riêng |

---

## 5. Trạng Thái Đơn Hàng — Luồng Đầy Đủ

### 5.1 Luồng chính (Happy path)

```
CHO_XAC_NHAN → DA_THANH_TOAN → DANG_GIAO_HANG → DA_GIAO
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
| 2 | Trang checkout: chọn địa chỉ (GHN master-data) | `/payment/page.tsx` → AddressForm | ✅ |
| 3 | Tính phí ship (GHN Fee API) | `/api/ghn/fee` | ✅ |
| 4 | Chọn phương thức thanh toán (COD/MoMo/VNPay/Bank) | `/payment/page.tsx` | ✅ |
| 5 | Tạo đơn hàng + giao dịch thanh toán | POST `/api/store/orders` | ✅ |
| 6 | Redirect theo phương thức (MoMo/VNPay redirect, Bank hiện QR) | `/api/store/payment` | ✅ |
| 7 | Callback xác nhận thanh toán | `momo-ipn`, `vnpay-return` | ✅ |
| 8 | Trang kết quả | `/payment/check` | ✅ |

**Đã hoàn thành (08/05/2026):**
- [x] `userId` lấy từ session (useSession) — đã fix trong `/orders/page.tsx`

---

### 6.2 Nghiệp vụ: Quản lý đơn hàng (Khách)

**Mô tả:** Khách xem danh sách đơn, xem chi tiết, theo dõi vận chuyển, yêu cầu đổi trả.

| # | Bước | API/File | Trạng thái |
|---|------|----------|-----------|
| 1 | Danh sách đơn + filter tab | `/account/orders` → `/orders/page.tsx` | ✅ UI + API |
| 2 | Modal chi tiết đơn + stepper trạng thái | Cùng file trên | ✅ UI + API |
| 3 | Tracking vận chuyển GHN | `TrackingTimeline` component | ✅ UI + API |
| 4 | Yêu cầu đổi trả (form + upload ảnh) | PUT `/api/store/orders` | ✅ Đã fix (UI có sẵn, API đã lưu lý do + ảnh) |
| 5 | Hủy đơn (khi còn CHO_XAC_NHAN) | PUT `/api/store/orders` (action: CANCEL) | ✅ Đã thêm (UI nút "Hủy đơn" + API) |

**Đã hoàn thành (08/05/2026):**
- [x] Fix API PUT lưu `ly_do_hoan_tra` + `anh_minh_chung`
- [x] Thêm nút "Hủy đơn" + API (action: CANCEL) — UI hiển thị cho đơn CHO_XAC_NHAN
- [x] Fix userId lấy từ session (useSession) thay vì hardcode
- [x] Hiển thị `phi_van_chuyen` thật từ DB trong modal chi tiết

---

### 6.3 Nghiệp vụ: Quản lý đơn hàng (Admin)

**Mô tả:** Admin xem tất cả đơn, đổi trạng thái, tạo vận đơn GHN, duyệt đổi trả.

| # | Bước | API/File | Trạng thái |
|---|------|----------|-----------|
| 1 | Danh sách đơn + search/filter/phân trang | GET `/api/admin/orders` | ✅ |
| 2 | Đổi trạng thái đơn hàng | PUT `/api/admin/orders` | ✅ |
| 3 | Tạo vận đơn GHN (khi xác nhận đơn) | POST `/api/ghn/create-order` | ✅ |
| 4 | Duyệt/từ chối đổi trả | PUT `/api/admin/orders` (action: HANDLE_RETURN) | ✅ |
| 5 | Ghi lịch sử đơn hàng khi đổi trạng thái | `lich_su_don_hang` table | ✅ Đã thêm (chỉ API, không có UI riêng) |

**Đã hoàn thành (08/05/2026):**
- [x] Insert `lich_su_don_hang` mỗi khi admin đổi trạng thái (trong transaction PUT admin orders)

---

### 6.4 Nghiệp vụ: Giao hàng (GHN — toàn bộ)

**Mô tả:** Mọi đơn hàng đều giao qua GHN, bất kể gần hay xa.

| # | Bước | API/File | Trạng thái |
|---|------|----------|-----------|
| 1 | Checkout: chọn địa chỉ từ GHN master-data | `/api/ghn/master-data` | ✅ |
| 2 | Tính phí ship GHN (realtime) | `/api/ghn/fee` | ✅ |
| 3 | Admin tạo vận đơn GHN sau khi xác nhận | `/api/ghn/create-order` | ✅ |
| 4 | Webhook GHN tự động cập nhật trạng thái | `/api/ghn/webhook` | ✅ |
| 5 | Khách tra cứu vận đơn | `/api/ghn/tracking` + TrackingTimeline | ✅ |
| 6 | Hủy vận đơn (nếu cần) | POST `/api/ghn/cancel` | ✅ Done (API + nút UI admin) |

**Đã hoàn thành (08/05/2026):**
- [x] API hủy vận đơn GHN (`src/app/api/ghn/cancel/route.ts`) — gọi GHN switch-status/cancel
- [x] Nút "Hủy vận đơn" trên UI admin drawer (hiển thị khi vận đơn chưa delivered/cancel)

**Còn lại:**
- [ ] Đăng ký tài khoản GHN sandbox + điền env (bạn làm)

---

### 6.5 Nghiệp vụ: Đổi trả & Hoàn tiền

**Mô tả:** Khách yêu cầu đổi/trả → Admin duyệt → Hoàn tiền (nếu có).

| # | Bước | API/File | Trạng thái |
|---|------|----------|-----------|
| 1 | Khách gửi yêu cầu (lý do + ảnh) | PUT `/api/store/orders` (action: RETURN) | ✅ Đã fix (lưu lý do + ảnh vào DB) |
| 2 | Admin xem yêu cầu đổi trả | `/admin/orders` → drawer | ✅ |
| 3 | Admin duyệt / từ chối | PUT `/api/admin/orders` (action: HANDLE_RETURN) | ✅ |
| 4 | Hoàn tiền (nếu duyệt + thanh toán online) | Bảng `lich_su_hoan_tien` | ✅ Done (tự động khi admin duyệt) |
| 5 | Hoàn kho (trả số lượng tồn kho) | `ton_kho_tong` (qua lo_hang) | ✅ Done (increment khi admin duyệt) |

**Đã hoàn thành (08/05/2026):**
- [x] Fix lưu `ly_do_hoan_tra` + `anh_minh_chung` trong API store/orders
- [x] Logic hoàn tiền: tạo record `lich_su_hoan_tien` khi admin duyệt (cho đơn đã thanh toán online)
- [x] Logic hoàn kho: increment `ton_kho_tong.so_luong` khi admin duyệt trả hàng

---

## 7. Ưu Tiên Triển Khai

| Ưu tiên | Việc cần làm | Trạng thái |
|---------|-------------|-----------|
| 🔴 P0 | Fix userId từ session | ✅ Done |
| 🔴 P0 | Fix lưu lý do + ảnh đổi trả | ✅ Done |
| 🟡 P1 | Thêm nút hủy đơn (khách) | ✅ Done |
| 🟡 P1 | Ghi lịch sử đơn hàng | ✅ Done |
| 🟡 P1 | Hiển thị phí ship thật trong modal | ✅ Done |
| 🟡 P1 | API + UI hủy vận đơn GHN | ✅ Done |
| 🟠 P2 | Logic hoàn tiền + hoàn kho | ✅ Done |
| ⚪ P3 | Đăng ký GHN sandbox + cấu hình env | ⏳ Bạn tự làm |

---

## 8. Cấu Hình Cần Thiết (`.env`)

```env
# GHN
GHN_TOKEN=your_token_here
GHN_SHOP_ID=your_shop_id_here
GHN_BASE_URL=https://dev-online-gateway.ghn.vn/shiip/public-api
GHN_FROM_DISTRICT_ID=1542   # District ID kho của shop tại Đà Nẵng
```

**Việc bạn cần làm:**
1. Đăng ký tại https://dev.ghn.vn → lấy Token + ShopId
2. Điền vào `.env`
3. Đăng ký webhook URL trong GHN Dashboard: `https://yourdomain.com/api/ghn/webhook`
4. Khi deploy production: đổi `GHN_BASE_URL` sang `https://online-gateway.ghn.vn/shiip/public-api`
