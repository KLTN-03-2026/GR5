# 💳 Tài Liệu Tích Hợp Thanh Toán

> Cập nhật lần cuối: 23/04/2026

---

## 📋 Tổng Quan Các Phương Thức

| Phương thức | Trạng thái | Môi trường | Ghi chú |
|---|---|---|---|
| Tiền mặt (COD) | ✅ Hoàn chỉnh | Production | Không cần cấu hình bên ngoài |
| Ví MoMo | ✅ Hoàn chỉnh | **Sandbox/Test** | Cần cấu hình Production Key |
| VNPay | ✅ Hoàn chỉnh | **Sandbox/Test** | Cần cấu hình Production Key |
| Chuyển khoản ngân hàng | ✅ Hoàn chỉnh | Production | QR từ VietQR, xác nhận thủ công |

---

## 🏦 Thông Tin Ngân Hàng

| Trường | Giá trị |
|---|---|
| **Ngân hàng** | MB Bank |
| **Số tài khoản** | 0935462720 |
| **Tên chủ tài khoản** | LE VIET QUOC HUNG |
| **Nội dung CK mẫu** | `DH{orderId}` (ví dụ: DH123) |

QR code được tạo tự động từ **VietQR** (miễn phí, không cần đăng ký) theo URL:
```
https://img.vietqr.io/image/MB-0935462720-compact2.png?amount={total}&addInfo=DH{orderId}&accountName=LE VIET QUOC HUNG
```

---

## 🔴 Cần Bạn Làm — MoMo

> **Hiện đang chạy môi trường SANDBOX (test). Cần làm các bước sau để dùng Production:**

### Bước 1: Đăng ký tài khoản Merchant MoMo
- Truy cập: https://business.momo.vn
- Đăng ký tài khoản doanh nghiệp
- Chọn gói "Cổng thanh toán"

### Bước 2: Lấy Production Keys
Sau khi được duyệt, vào **Dashboard → Cấu hình → API Key** để lấy:
- `MOMO_PARTNER_CODE`
- `MOMO_ACCESS_KEY`  
- `MOMO_SECRET_KEY`

### Bước 3: Cấu hình IPN URL trong Dashboard MoMo
- **IPN URL (Production):** `https://yourdomain.com/api/store/payment/momo-ipn`
- **Redirect URL:** `https://yourdomain.com/payment/check`

### Bước 4: Thêm vào file `.env`
```env
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
```

### Test Keys (Sandbox — hiện đang dùng)
```
partnerCode: MOMOBKUN20180529
accessKey:   klm05TvNCzjOaHU1
secretKey:   at67qH6mk8w5Y1nAwMovdPTlcjTA21kH
```
**Tài khoản test MoMo:**
- SĐT: `0000000001`
- OTP: `000000`

---

## 🔵 Cần Bạn Làm — VNPay

> **Hiện đang chạy môi trường SANDBOX (test). Cần làm các bước sau để dùng Production:**

### Bước 1: Đăng ký tài khoản VNPay Merchant
- Truy cập: https://sandbox.vnpayment.vn/devreg/
- Đăng ký và chờ duyệt

### Bước 2: Lấy Production Keys
Vào **Merchant Portal → Quản lý website → Thông tin kỹ thuật**:
- `VNP_TMN_CODE` (Terminal Code)
- `VNP_HASH_SECRET` (Hash Secret Key)

### Bước 3: Cập nhật vào file `.env`
```env
VNPAY_TMN_CODE=your_tmn_code
VNPAY_SECRET_KEY=your_hash_secret
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Bước 4: Đổi URL từ Sandbox → Production
Trong file `src/app/api/store/payment/route.ts`, đổi:
```diff
- const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
+ const vnpUrl = "https://pay.vnpay.vn/vpcpay.html";
```

### Test Keys (Sandbox — hiện đang dùng)
```
tmnCode:   N2FLX63Y
secretKey: GM2XYUP38PA43ASTS8YU4MD2AT22JL8N
```
**Thẻ test VNPay ATM (NCB):**
- Số thẻ: `9704198526191432198`
- Tên chủ thẻ: `NGUYEN VAN A`
- Ngày phát hành: `07/15`
- OTP: `123456`

---

## ⚙️ Biến Môi Trường Cần Có (`.env`)

```env
# Base URL (QUAN TRỌNG - dùng để tạo callback URL)
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Đổi thành domain thật khi deploy

# MoMo
MOMO_PARTNER_CODE=MOMOBKUN20180529
MOMO_ACCESS_KEY=klm05TvNCzjOaHU1
MOMO_SECRET_KEY=at67qH6mk8w5Y1nAwMovdPTlcjTA21kH

# VNPay
VNPAY_SECRET_KEY=GM2XYUP38PA43ASTS8YU4MD2AT22JL8N
```

---

## 📁 Các File Đã Tạo/Sửa

| File | Thay đổi |
|---|---|
| `src/app/(store)/payment/page.tsx` | Thêm phương thức chuyển khoản, QR VietQR, sửa luồng đặt hàng |
| `src/app/(store)/payment/check/page.tsx` | Viết lại: xử lý 3 trạng thái (success/failed/pending) |
| `src/app/api/store/payment/route.ts` | Fix URL callback dùng `NEXT_PUBLIC_BASE_URL` |
| `src/app/api/store/payment/momo-ipn/route.ts` | **[MỚI]** Webhook IPN từ MoMo, verify chữ ký, cập nhật DB |
| `src/app/api/store/payment/vnpay-return/route.ts` | **[MỚI]** Xử lý callback VNPay, verify chữ ký, redirect |

---

## 🔄 Luồng Thanh Toán Chi Tiết

### COD (Tiền mặt)
```
Khách đặt hàng → Tạo đơn hàng (trang_thai: CHO_XAC_NHAN) → Redirect /payment/check?status=success
```

### MoMo
```
Khách chọn MoMo → Tạo đơn → Gọi API MoMo sandbox → Redirect sang app MoMo
→ [Thanh toán thành công] → MoMo redirect về /payment/check?resultCode=0&orderId=...
→ MoMo gọi IPN tới /api/store/payment/momo-ipn → Server verify chữ ký → Cập nhật trang_thai: DA_THANH_TOAN
```

### VNPay
```
Khách chọn VNPay → Tạo đơn → Gọi API tạo link VNPay → Redirect sang cổng VNPay
→ [Thanh toán thành công] → VNPay redirect về /api/store/payment/vnpay-return
→ Server verify chữ ký vnp_SecureHash → Cập nhật trang_thai: DA_THANH_TOAN
→ Redirect về /payment/check?status=success
```

### Chuyển Khoản Ngân Hàng
```
Khách chọn Bank Transfer → Hiển thị QR VietQR ngay trong trang
→ Khách nhấn "Tạo đơn & Xem QR" → Tạo đơn (trang_thai: CHO_XAC_NHAN)
→ Hiển thị màn hình QR + thông tin TK → Khách chuyển khoản
→ Nhấn "Tôi đã chuyển khoản" → Redirect /payment/check?status=pending
→ Admin vào /admin/orders → Tìm đơn → Nhấn "Xác nhận đã nhận tiền" → trang_thai: DA_THANH_TOAN
```

---

## 📊 Trạng Thái Đơn Hàng (`don_hang.trang_thai`)

| Giá trị | Ý nghĩa |
|---|---|
| `CHO_XAC_NHAN` | Đơn mới tạo (COD hoặc Bank Transfer) |
| `DA_THANH_TOAN` | Đã thanh toán online hoặc Admin xác nhận CK |
| `THANH_TOAN_THAT_BAI` | Thanh toán MoMo/VNPay thất bại |
| `CHO_GIAO_HANG` | Đang chuẩn bị giao |
| `DA_GIAO` | Giao thành công |

---

## ⚠️ Lưu Ý Khi Deploy Lên Production

1. **QUAN TRỌNG:** Đổi `NEXT_PUBLIC_BASE_URL` thành domain thật (VD: `https://nongsansach.vn`)
2. Đăng ký MoMo Business và VNPay Merchant để lấy Production Keys
3. Trong Dashboard MoMo: thêm domain production vào whitelist
4. Với VNPay: đổi URL từ `sandbox.vnpayment.vn` → `pay.vnpay.vn`
5. Test kỹ trước khi go-live với số tiền nhỏ thật
