
# Module Thanh Toan (Payment)
# 💳 Tài Liệu Tích Hợp Thanh Toán

> Cập nhật lần cuối: 23/04/2026

---

## 📋 Tổng Quan Các Phương Thức

| Phương thức            | Trạng thái    | Môi trường       | Ghi chú                         |
| ---------------------- | ------------- | ---------------- | ------------------------------- |
| Tiền mặt (COD)         | ✅ Hoàn chỉnh | Production       | Không cần cấu hình bên ngoài    |
| Ví MoMo                | ✅ Hoàn chỉnh | **Sandbox/Test** | Cần cấu hình Production Key     |
| VNPay                  | ✅ Hoàn chỉnh | **Sandbox/Test** | Cần cấu hình Production Key     |
| Chuyển khoản ngân hàng | ✅ Hoàn chỉnh | Production       | QR từ VietQR, xác nhận thủ công |

---

## 🏦 Thông Tin Ngân Hàng

| Trường                | Giá trị                      |
| --------------------- | ---------------------------- |
| **Ngân hàng**         | MB Bank                      |
| **Số tài khoản**      | 0935462720                   |
| **Tên chủ tài khoản** | LE VIET QUOC HUNG            |
| **Nội dung CK mẫu**   | `DH{orderId}` (ví dụ: DH123) |

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
# Base URL — QUAN TRỌNG: phải khớp với port đang chạy
NEXT_PUBLIC_BASE_URL=http://localhost:3001   # đổi thành domain thật khi deploy

# MoMo Sandbox (đang dùng)
MOMO_PARTNER_CODE=MOMOBKUN20180529
MOMO_ACCESS_KEY=klm05TvNCzjOaHU1
MOMO_SECRET_KEY=at67qH6mk8w5Y1nAwMovdPTlcjTA21kH

# VNPay Sandbox (đang dùng)
VNPAY_TMN_CODE=N2FLX63Y
VNPAY_SECRET_KEY=GM2XYUP38PA43ASTS8YU4MD2AT22JL8N
# VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html  ← mặc định, uncomment để override

# GHN
GHN_TOKEN=your_token_here
GHN_SHOP_ID=your_shop_id_here
GHN_BASE_URL=https://dev-online-gateway.ghn.vn/shiip/public-api
GHN_FROM_DISTRICT_ID=1542
```

---

## 📁 Các File Đã Tạo/Sửa

| File                                              | Thay đổi                                                     |
| ------------------------------------------------- | ------------------------------------------------------------ |
| `src/app/(store)/payment/page.tsx`                | Thêm phương thức chuyển khoản, QR VietQR, sửa luồng đặt hàng |
| `src/app/(store)/payment/check/page.tsx`          | Viết lại: xử lý 3 trạng thái (success/failed/pending)        |
| `src/app/api/store/payment/route.ts`              | Fix URL callback dùng `NEXT_PUBLIC_BASE_URL`                 |
| `src/app/api/store/payment/momo-ipn/route.ts`     | **[MỚI]** Webhook IPN từ MoMo, verify chữ ký, cập nhật DB    |
| `src/app/api/store/payment/vnpay-return/route.ts` | **[MỚI]** Xử lý callback VNPay, verify chữ ký, redirect      |

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

| Giá trị               | Ý nghĩa                                     |
| --------------------- | ------------------------------------------- |
| `CHO_XAC_NHAN`        | Đơn mới tạo (COD hoặc Bank Transfer)        |
| `DA_THANH_TOAN`       | Đã thanh toán online hoặc Admin xác nhận CK |
| `THANH_TOAN_THAT_BAI` | Thanh toán MoMo/VNPay thất bại              |
| `CHO_GIAO_HANG`       | Đang chuẩn bị giao                          |
| `DA_GIAO`             | Giao thành công                             |

---

## ⚠️ Lưu Ý Khi Deploy Lên Production

1. **QUAN TRỌNG:** Đổi `NEXT_PUBLIC_BASE_URL` thành domain thật (VD: `https://nongsansach.vn`)
2. Đăng ký MoMo Business và VNPay Merchant để lấy Production Keys
3. Trong Dashboard MoMo: thêm domain production vào whitelist
4. Với VNPay: đổi URL từ `sandbox.vnpayment.vn` → `pay.vnpay.vn`
5. Test kỹ trước khi go-live với số tiền nhỏ thật
   ✅ MoMo đã được tích hợp đầy đủ
   Trạng thái theo tài liệu (dòng 12):
   Phương thức Trạng thái Môi trường
   Ví MoMo ✅ Hoàn chỉnh Sandbox/Test
   Các file MoMo đã có:
   File Mô tả
   src/app/(store)/payment/page.tsx UI chọn phương thức thanh toán (có MoMo)
   src/app/api/store/payment/route.ts API tạo link thanh toán MoMo
   src/app/api/store/payment/momo-ipn/route.ts ✅ [MỚI] Webhook IPN nhận callback từ MoMo, verify chữ ký, cập nhật DB
   Luồng MoMo (dòng 148–153):
   Khách chọn MoMo → Tạo đơn → Gọi API MoMo sandbox → Redirect sang app MoMo
   → [Thanh toán thành công] → MoMo redirect về /payment/check?resultCode=0&orderId=...
   → MoMo gọi IPN tới /api/store/payment/momo-ipn → Server verify chữ ký → Cập nhật trang_thai: DA_THANH_TOAN
   ⚠️ Lưu ý quan trọng:
   Hiện đang dùng môi trường Sandbox/Test với test keys có sẵn (dòng 61–65)
   Để lên Production cần đăng ký tài khoản merchant tại business.momo.vn và thay thế 3 biến env: MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY
   Tài khoản test MoMo: SĐT 0000000001, OTP 000000
   Tóm lại: MoMo đã được add vào hệ thống thanh toán từ conversation trước (23/04/2026), hoàn chỉnh cả frontend lẫn backend IPN webhook. 🎉

## 1. Tong quan
Module thanh toan xu ly toan bo quy trinh thanh toan cho don hang, ho tro nhieu phuong thuc: COD, VNPay, MoMo, chuyen khoan ngan hang. Bao gom tao giao dich, xac nhan thanh toan, xu ly callback tu cong thanh toan, va hien thi ket qua.

## 2. Cac chuc nang hien co

### 2.1 Phuong thuc thanh toan

#### COD (Tien mat khi nhan hang)
- Mac dinh, khong can tich hop ben ngoai
- Don giu trang thai `CHO_XAC_NHAN` den khi giao thanh cong
- Nhan vien xac nhan thu tien khi giao hang

#### VNPay (The ATM/QR/Quoc te)
- **Endpoint**: POST `/api/store/payment` voi `type: 'vnpay'`
- So tien toi thieu: 5,000 VND
- Tao chu ky SHA512-HMAC voi secret key
- URL thanh toan co tham so sap xep theo thu tu
- Callback: `/api/store/payment/vnpay-return`
- Xac thuc chu ky VNPay khi nhan ket qua
- Ma phan hoi `00` = thanh cong

#### MoMo (Vi dien tu)
- **Endpoint**: POST `/api/store/payment` voi `type: 'momo'`
- Tao chu ky HMAC-SHA256 (tham so sap xep alphabet)
- Goi API test MoMo de tao URL thanh toan
- IPN Webhook: `/api/store/payment/momo-ipn`
- Xac thuc HMAC-SHA256 khi nhan IPN
- Result code `0` = thanh cong

#### Chuyen khoan ngan hang (Manual)
- Hien thi ma QR VietQR + thong tin tai khoan
- Ngan hang: MB Bank, STK: 0935462720, CTK: LE VIET QUOC HUNG
- Noi dung chuyen khoan: `DH{orderId}`
- Nhan vien xac nhan thu cong sau khi nhan tien
- Don giu trang thai `CHO_XAC_NHAN_CK` cho nhan vien doi chieu

### 2.2 Trang ket qua thanh toan
- **File**: `src/app/(store)/payment/check/page.tsx`
- 3 trang thai hien thi:
  - **Thanh cong** (xanh): Ma don, timeline, san pham goi y, nut tiep tuc mua sam
  - **Dang xu ly** (vang): Cho chuyen khoan, hien lai noi dung CK
  - **That bai** (do): Nut thu lai hoac xem don

### 2.3 Quan ly thanh toan (Admin)
- **Trang**: `/admin/payments`
- **API**: `/api/admin/payments/route.ts`
- Danh sach giao dich thanh toan
- Chi tiet giao dich: `/api/admin/payments/detail/route.ts`
- Xu ly hoan tien: `/api/admin/payments/refunds/route.ts`

### 2.4 API Endpoints
| Endpoint | Method | Chuc nang | File |
|----------|--------|-----------|------|
| `/api/store/payment` | POST | Tao URL thanh toan (VNPay/MoMo) | `src/app/api/store/payment/route.ts` |
| `/api/store/payment/vnpay-return` | GET | Callback tu VNPay | `src/app/api/store/payment/vnpay-return/route.ts` |
| `/api/store/payment/momo-ipn` | POST | Webhook tu MoMo | `src/app/api/store/payment/momo-ipn/route.ts` |
| `/api/admin/payments` | GET | Danh sach giao dich | `src/app/api/admin/payments/route.ts` |
| `/api/admin/payments/detail` | GET | Chi tiet giao dich | `src/app/api/admin/payments/detail/route.ts` |
| `/api/admin/payments/refunds` | POST | Xu ly hoan tien | `src/app/api/admin/payments/refunds/route.ts` |

### 2.5 Models lien quan
- `giao_dich_thanh_toan` - Giao dich (ma_don_hang, so_tien, trang_thai, ma_giao_dich_ben_ngoai, phuong_thuc)
- `phuong_thuc_thanh_toan` - Danh sach phuong thuc (COD, VNPay, MoMo, Bank)
- `lich_su_hoan_tien` - Lich su hoan tien (ma_giao_dich, so_tien, trang_thai)

### 2.6 Trang thai giao dich
```
CHO_THANH_TOAN → DA_THANH_TOAN
       ↓
THANH_TOAN_THAT_BAI
       ↓
DA_HOAN_TIEN (khi doi tra)
```

## 3. Tinh nang con thieu & Lo hong

### 3.1 Lo hong bao mat
- **Khong doi chieu so tien**: Server khong kiem tra so tien callback = so tien don hang goc → de bi thao tung amount
- **Test credentials trong code**: MoMo/VNPay dung credentials test hardcode lam fallback
- **Khong co IP whitelist**: Webhook MoMo/VNPay khong kiem tra IP nguon → bat ky ai cung co the goi
- **Khong xac thuc user**: Endpoint POST `/api/store/payment` khong bat buoc dang nhap

### 3.2 Thieu logic nghiep vu
- **Khong co hoan tien tu dong**: Khi don bi huy hoac doi tra, khong tu dong tao yeu cau hoan tien
- **Khong co retry payment**: Thanh toan that bai khong co co che thu lai de dang
- **Khong co timeout URL thanh toan**: URL VNPay/MoMo khong theo doi het han
- **Khong co webhook retry**: Neu IPN MoMo that bai, khong co retry logic
- **Bank transfer khong tu dong**: Hoan toan phu thuoc nhan vien kiem tra thu cong
- **Khong co doi chieu tu dong**: Khong co cron job doi chieu giao dich voi ngan hang

### 3.3 Thieu tinh nang
- Khong ho tro nhieu loai tien te
- Khong co hoa don dien tu tu dong
- Khong co lich su thanh toan chi tiet cho khach hang
- Khong co thong bao thanh toan thanh cong/that bai (email/push)
- Khong co bao cao doanh thu theo phuong thuc thanh toan
- Khong co co che xac nhan chuyen khoan tu dong (bank API)

### 3.4 Edge cases chua xu ly
- Khach thanh toan 2 lan cho 1 don (double payment)
- Don het han nhung thanh toan van thanh cong (race condition)
- Callback den truoc khi don duoc tao xong (timing issue)
- So tien lam tron sai do Decimal precision

## 4. Cong viec can lam (TODOs)

### Uu tien cao
- [ ] Doi chieu so tien trong callback voi so tien don hang goc truoc khi cap nhat trang thai
- [ ] Them IP whitelist cho webhook endpoints (VNPay: 113.160.x.x, MoMo: theo tai lieu)
- [ ] Xac thuc session user truoc khi tao URL thanh toan
- [ ] Implement hoan tien tu dong khi don huy/doi tra (goi API VNPay refund)
- [ ] Loai bo hardcoded test credentials, dua het vao env vars

### Uu tien trung binh
- [ ] Them timeout cho URL thanh toan (15 phut)
- [ ] Implement retry logic cho webhook MoMo (3 lan, backoff 5-10-30 giay)
- [ ] Them cron job doi chieu giao dich hang ngay
- [ ] Gui thong bao email khi thanh toan thanh cong/that bai
- [ ] Xu ly truong hop double payment (detect va tu dong hoan 1 lan)
- [ ] Them lich su thanh toan chi tiet cho trang ca nhan khach hang

### Uu tien thap
- [ ] Tich hop xac nhan chuyen khoan tu dong qua Bank API (Casso/PayOS)
- [ ] Ho tro them phuong thuc: ZaloPay, Apple Pay, Google Pay
- [ ] Bao cao doanh thu theo phuong thuc thanh toan
- [ ] Tao hoa don dien tu tu dong sau khi thanh toan
