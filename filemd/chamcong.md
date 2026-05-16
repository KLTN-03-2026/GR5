# Chấm Công + Geofencing (GPS)

## Tổng quan hệ thống hiện tại

- Nhân viên chấm công bằng **Face ID** (face-api.js, Euclidean distance < 0.5)
- API: `POST /api/cham-cong/vao` (vào) và `POST /api/cham-cong/ra` (ra)
- Trạng thái: DUNG_GIO, TRE, VANG_MAT, KHONG_CO_LICH
- Tự động đánh VANG_MAT cuối ngày nếu không chấm (cron job)

## Vấn đề

Hiện tại **không kiểm tra vị trí** → nhân viên ở nhà vẫn chấm công được → cần thêm Geofencing.

---

## Giải pháp: Geofencing (Kiểm tra GPS)

### Cơ chế hoạt động

```
1. Admin set tọa độ công ty (lat, lng) + bán kính cho phép (mặc định 500m)
2. Nhân viên bấm chấm công trên điện thoại:
   - Browser lấy GPS hiện tại (navigator.geolocation)
   - Xác thực Face ID
3. Server nhận GPS → tính khoảng cách (Haversine formula) → cho phép/từ chối
4. Kết quả:
   - Trong bán kính → ✅ Chấm công thành công
   - Ngoài bán kính → ❌ Từ chối + hiện khoảng cách thực tế
```

### Haversine Formula (tính khoảng cách 2 điểm trên Trái Đất)

```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
c = 2 × atan2(√a, √(1−a))
distance = R × c    (R = 6,371,000 mét)
```

---

## Database Schema

### Model mới: `cai_dat_vi_tri` (Lưu tọa độ công ty)

| Field | Type | Mô tả |
|-------|------|--------|
| id | Int (PK) | Auto increment |
| ten_vi_tri | VarChar(255) | Tên địa điểm ("Kho Nông Sản HCM") |
| vi_do | Decimal(10,7) | Latitude |
| kinh_do | Decimal(10,7) | Longitude |
| ban_kinh | Int | Bán kính cho phép (mét), default 500 |
| dang_kich_hoat | Boolean | Bật/tắt geofencing |
| ngay_tao | DateTime | Ngày tạo |
| cap_nhat_luc | DateTime | Lần cập nhật cuối |

### Thêm fields vào `lich_su_cham_cong`

| Field | Type | Mô tả |
|-------|------|--------|
| vi_do_cham_cong | Decimal(10,7)? | Latitude lúc chấm công |
| kinh_do_cham_cong | Decimal(10,7)? | Longitude lúc chấm công |
| khoang_cach_met | Int? | Khoảng cách đến công ty (mét) |
| vi_tri_hop_le | Boolean? | Có trong phạm vi không |

---

## API Endpoints

### 1. Cài đặt vị trí (Admin)

```
GET  /api/cai-dat-vi-tri     → Lấy vị trí active
POST /api/cai-dat-vi-tri     → Tạo/cập nhật vị trí
Body: { ten_vi_tri, vi_do, kinh_do, ban_kinh }
```

### 2. Chấm công Vào (sửa)

```
POST /api/cham-cong/vao
Body: { ma_nguoi_dung, vi_do, kinh_do, phuong_thuc_xac_thuc }

Logic thêm:
1. Fetch cai_dat_vi_tri (active)
2. Nếu geofencing ON + có GPS:
   - Tính distance = haversine(employee, company)
   - distance > ban_kinh → 403 "Bạn cách công ty X mét"
   - distance <= ban_kinh → proceed, lưu GPS vào record
3. Nếu geofencing OFF → bỏ qua, hoạt động như cũ
```

### 3. Chấm công Ra (sửa)

```
POST /api/cham-cong/ra
Body: { ma_nguoi_dung, vi_do, kinh_do }
Logic tương tự check-in.
```

---

## Frontend

### Client GPS Utility (`/src/lib/geolocation.ts`)

```typescript
getCurrentPosition(): Promise<GeoResponse>
// Options:
//   enableHighAccuracy: true   (dùng GPS chip, không dùng WiFi/IP)
//   timeout: 10000ms           (10 giây chờ)
//   maximumAge: 60000ms        (cache 1 phút)
```

### Staff UI - Section Chấm Công

Thêm vào `/src/app/staff/hr/HRClient.tsx`:
- Section "CHAM_CONG" trong NAV_ITEMS
- Hiển thị: trạng thái GPS (xanh/đỏ), khoảng cách, nút Vào/Ra
- Flow: Bấm → Lấy GPS → Face ID → Gửi API → Kết quả

### Admin UI - Geofencing Settings

Page mới `/src/app/admin/hr/geofencing/page.tsx`:
- Form: tên, vĩ độ, kinh độ, bán kính
- Toggle bật/tắt
- Button "Lấy vị trí hiện tại" (auto-fill GPS từ browser)

---

## Xử lý lỗi GPS

| Lỗi | Message | Giải pháp |
|------|---------|-----------|
| PERMISSION_DENIED | "Vui lòng cấp quyền vị trí để chấm công" | Hướng dẫn bật |
| POSITION_UNAVAILABLE | "Không thể xác định vị trí. Kiểm tra GPS" | Nút Thử lại |
| TIMEOUT | "Hết thời gian xác định vị trí" | Nút Thử lại |
| Ngoài phạm vi | "Bạn cách công ty X mét (cho phép: Y mét)" | Hiện khoảng cách |

---

## Demo Strategy

- **Bán kính**: Set 500m cho thoải mái (GPS indoor có thể sai 20-50m)
- **Setup nhanh**: Admin bấm "Lấy vị trí hiện tại" tại nơi demo → save
- **Kịch bản demo**:
  1. Ở tại nơi demo → chấm công OK ✅
  2. Đổi tọa độ công ty sang nơi khác → chấm công bị từ chối ❌ (hiện khoảng cách)
  3. Toggle tắt geofencing → chấm công không cần GPS (backward compatible)
- **Thiết bị**: Demo trên điện thoại (Chrome/Safari) → GPS chính xác 5-20m ngoài trời

---

## Files cần tạo/sửa

| # | File | Action |
|---|------|--------|
| 1 | `/prisma/schema.prisma` | Sửa - thêm model + fields |
| 2 | `/src/lib/geofencing.ts` | Tạo mới - Haversine formula |
| 3 | `/src/lib/geolocation.ts` | Tạo mới - Client GPS utility |
| 4 | `/src/app/api/cai-dat-vi-tri/route.ts` | Tạo mới - Admin API |
| 5 | `/src/app/api/cham-cong/vao/route.ts` | Sửa - thêm validate GPS |
| 6 | `/src/app/api/cham-cong/ra/route.ts` | Sửa - thêm validate GPS |
| 7 | `/src/app/admin/hr/geofencing/page.tsx` | Tạo mới - Admin UI |
| 8 | `/src/app/admin/hr/page.tsx` | Sửa - thêm link menu |
| 9 | `/src/app/staff/hr/HRClient.tsx` | Sửa - thêm section chấm công |

---

## Thứ tự implement

1. Schema → `npx prisma db push`
2. Server utility (Haversine)
3. Client utility (GPS)
4. Admin API
5. Sửa API chấm công vào/ra
6. Admin UI geofencing
7. Staff UI chấm công


 Thứ tự implement

 1. Schema + npx prisma db push
 2. /src/lib/geofencing.ts (Haversine)
 3. /src/lib/geolocation.ts (Client GPS)
 4. /src/app/api/cai-dat-vi-tri/route.ts (Admin API)
 5. Sửa /src/app/api/cham-cong/vao/route.ts
 6. Sửa /src/app/api/cham-cong/ra/route.ts
 7. /src/app/admin/hr/geofencing/page.tsx (Admin UI)
 8. Sửa /src/app/admin/hr/page.tsx (link menu)
 9. Sửa /src/app/staff/hr/HRClient.tsx (Staff check-in UI)

 ---
 Verification

 1. Chạy npx prisma db push - không lỗi
 2. Admin page: mở /admin/hr/geofencing, bấm "Lấy vị trí hiện tại", save
 3. Staff page: mở trên DT, section Chấm Công, cho phép GPS, Face ID → chấm công thành công
 4. Test reject: đổi tọa độ admin sang nơi khác xa → chấm công bị từ chối, hiện khoảng cách
 5. Test toggle off: tắt geofencing → chấm công không cần GPS

 ---

## Implementation Status - 2026-05-15

### Đã hoàn thành:

| # | File | Action | Status |
|---|------|--------|--------|
| 1 | `/prisma/schema.prisma` | Thêm model `cai_dat_vi_tri` + 4 fields GPS vào `lich_su_cham_cong` | DONE |
| 2 | `/src/lib/geofencing.ts` | Tạo mới - Haversine formula tính khoảng cách | DONE |
| 3 | `/src/lib/geolocation.ts` | Tạo mới - Client GPS utility (getCurrentPosition) | DONE |
| 4 | `/src/app/api/cai-dat-vi-tri/route.ts` | Tạo mới - GET/POST Admin API quản lý vị trí | DONE |
| 5 | `/src/app/api/cham-cong/vao/route.ts` | Sửa - thêm validate GPS geofencing, lưu tọa độ | DONE |
| 6 | `/src/app/api/cham-cong/ra/route.ts` | Sửa - thêm validate GPS geofencing khi chấm ra | DONE |
| 7 | `/src/app/admin/hr/geofencing/page.tsx` | Tạo mới - Admin UI cài đặt geofencing | DONE |
| 8 | `/src/app/admin/hr/page.tsx` | Sửa - thêm link "Geofencing GPS" vào Quick Links | DONE |
| 9 | `/src/app/staff/hr/HRClient.tsx` | Sửa - thêm tab "Chấm Công" với GPS + nút Vào/Ra | DONE |

### Tọa độ mặc định: 16.049401, 108.159954 (Đà Nẵng)
### Bán kính mặc định: 500 mét
### Database: `npx prisma db push` đã chạy thành công
