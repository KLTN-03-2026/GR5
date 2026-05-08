# Quản Lý Đơn Hàng — Nhân Viên Kho (`/staff/orders`)

> Redesign ngày 2026-05-08 · Trang xử lý đơn hàng dành cho nhân viên kho NôngSản Việt

---

## 1. Tổng quan thay đổi

### Trước (phiên bản cũ):
- KPI chỉ đếm từ trang hiện tại (limit 50), không phản ánh đúng toàn bộ DB
- Không có phân trang → load hết 50 đơn rồi dừng
- Không lọc theo ngày, không sắp xếp
- Không tích hợp GHN trực tiếp từ trang chi tiết
- Không export dữ liệu
- Không có ghi chú nội bộ cho nhân viên
- Cột vận đơn không hiển thị trên danh sách

### Sau (phiên bản mới):

| # | Tính năng | Mô tả |
|---|-----------|-------|
| 1 | KPI từ DB toàn cục | Count trực tiếp từ database, không phụ thuộc trang hiện tại |
| 2 | KPI doanh thu hôm nay | Hiển thị số đơn giao thành công + tổng doanh thu trong ngày |
| 3 | Lọc theo ngày (dateFrom/dateTo) | Cho phép staff lọc đơn trong khoảng thời gian cụ thể |
| 4 | Sắp xếp (sortBy) | Mới nhất / Cũ nhất / Giá cao / Giá thấp |
| 5 | Phân trang đầy đủ | UI phân trang với page numbers, 20 đơn/trang |
| 6 | Cột vận đơn GHN | Hiển thị mã vận đơn ngay trên bảng danh sách |
| 7 | Tạo vận đơn GHN tự động | Nút "Tạo vận đơn GHN" gọi API GHN create-order |
| 8 | Nhập mã vận đơn thủ công | Fallback nếu GHN không khả dụng |
| 9 | Export CSV | Xuất danh sách đơn hàng hiện tại ra file CSV (có BOM UTF-8) |
| 10 | Ghi chú nội bộ | Nhân viên thêm ghi chú vào đơn, lưu kèm timestamp |
| 11 | In phiếu giao hàng | Nút mở trang chi tiết ở tab mới để in |

---

## 2. Cấu trúc file đã thay đổi

```
src/app/staff/orders/page.tsx          ← Trang danh sách (rewrite hoàn toàn)
src/app/staff/orders/[id]/page.tsx     ← Trang chi tiết (thêm GHN + ghi chú)
src/app/api/staff/orders/route.ts      ← API list (thêm dateFrom, dateTo, sortBy, KPI global)
src/app/api/staff/orders/[id]/route.ts ← API detail (thêm CREATE_GHN_ORDER, ADD_NOTE)
```

---

## 3. API Changes

### GET `/api/staff/orders`

**Query params mới:**
- `dateFrom` (string, ISO date) — lọc đơn từ ngày
- `dateTo` (string, ISO date) — lọc đơn đến ngày
- `sortBy` (string) — `newest` | `oldest` | `highest` | `lowest`

**Response KPI mở rộng:**
```json
{
  "kpi": {
    "choXacNhan": 5,
    "choXacNhanCK": 2,
    "dangGiao": 8,
    "choGiao": 3,
    "daGiao": 120,
    "daHuy": 4,
    "tongDonHomNay": 12,
    "doanhThuHomNay": 5400000,
    "daGiaoHomNay": 7
  }
}
```

**Response data thêm trường:**
- `maVanDon` (string | null) — mã vận đơn từ bảng don_van_chuyen
- `shippingStatus` (string | null) — trạng thái vận chuyển

### PATCH `/api/staff/orders/[id]`

**Actions mới:**

| Action | Payload | Mô tả |
|--------|---------|-------|
| `CREATE_GHN_ORDER` | — | Tự động tạo vận đơn qua API GHN, lưu mã vào don_van_chuyen |
| `ADD_NOTE` | `{ data: { note: "..." } }` | Thêm ghi chú nội bộ (append, có timestamp) |

---

## 4. Luồng nghiệp vụ đơn hàng (hoàn chỉnh)

```
[Khách đặt hàng]
  ↓
CHO_XAC_NHAN
  ├── Nếu CK/VNPAY/MOMO → kiểm tra thanh toán trước
  ├── Nếu COD → xác nhận trực tiếp
  ├── Kiểm tra tồn kho → cảnh báo nếu thiếu
  └── Nhân viên bấm "Xác nhận đơn"
  ↓
CHO_GIAO_HANG
  ├── Nhân viên nhặt hàng (quét QR từng kiện)
  ├── Khi đủ hàng → "Tạo vận đơn GHN" (tự động)
  │   └── Hoặc nhập mã vận đơn thủ công
  └── Hệ thống chuyển trạng thái → DANG_GIAO_HANG
  ↓
DANG_GIAO_HANG
  ├── GHN webhook cập nhật trạng thái
  ├── Nhân viên có thể tracking qua mã vận đơn
  └── Xác nhận giao thành công
  ↓
DA_GIAO (hoàn thành)
  └── Nếu COD → tự động cập nhật DA_THANH_TOAN
```

---

## 5. Tích hợp GHN (Giao Hàng Nhanh)

### Khi nhân viên bấm "Tạo vận đơn GHN":

1. API lấy thông tin đơn hàng (người nhận, địa chỉ, sản phẩm)
2. Gọi `POST /v2/shipping-order/create` đến GHN
3. Nhận `order_code` từ GHN
4. Lưu `order_code` vào bảng `don_van_chuyen`
5. Cập nhật trạng thái đơn → `DANG_GIAO_HANG`
6. Trả mã vận đơn cho frontend hiển thị

### Yêu cầu biến môi trường:
```env
GHN_TOKEN=xxx
GHN_SHOP_ID=xxx
GHN_BASE_URL=https://dev-online-gateway.ghn.vn/shiip/public-api
GHN_FROM_DISTRICT_ID=1542
```

---

## 6. Các cải tiến UX

- **Badge "MỚI"**: đơn dưới 30 phút, hiệu ứng pulse
- **Cột vận đơn**: hiển thị 8 ký tự cuối mã GHN, click vào xem chi tiết
- **Pagination**: hiện "1-20 / 145 đơn" + page numbers
- **Ghi chú stack**: append nhiều ghi chú với timestamp, hiển thị dạng pre-line
- **Export CSV**: BOM UTF-8 để Excel Việt Nam đọc đúng encoding
- **Responsive filters**: flex-wrap trên màn hình nhỏ

---

## 7. Database models liên quan

- `don_hang` — đơn hàng chính
- `chi_tiet_don_hang` — sản phẩm trong đơn
- `giao_dich_thanh_toan` — giao dịch thanh toán (COD/CK/VNPAY/MOMO)
- `don_van_chuyen` — thông tin vận đơn (ma_van_don, trang_thai, ngay_giao_du_kien)
- `lich_su_don_hang` — timeline trạng thái
- `yeu_cau_doi_tra` — yêu cầu đổi trả hàng

---

_Cập nhật bởi: Hệ thống · 2026-05-08_
