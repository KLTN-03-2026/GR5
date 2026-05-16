# Module Van Chuyen (Shipping & Delivery)

## 1. Tong quan
Module van chuyen tich hop voi GHN (Giao Hang Nhanh) de tinh phi ship, lay du lieu dia chi (tinh/quan/phuong), tao don van chuyen, theo doi trang thai giao hang, va xu ly webhook cap nhat. Ho tro giao hang toan quoc voi cac muc thoi gian khac nhau tuy khu vuc.

## 2. Cac chuc nang hien co

### 2.1 Tinh phi van chuyen
- **File**: `src/app/api/ghn/fee/route.ts`
- **Endpoint**: POST `/api/ghn/fee`
- Tinh phi dua tren:
  - Dia chi nhan (district_id, ward_code)
  - Trong luong: `Math.max(so_luong_sp * 500g, 200g)` minimum
  - Gia tri bao hiem (insurance_value = tong tien don)
- Dia chi gui: Tu env var `GHN_FROM_DISTRICT_ID` (mac dinh: 1542)
- Response: phi ship, phi dich vu, phi bao hiem, thoi gian giao du kien

### 2.2 Du lieu dia chi (Master Data)
- **File**: `src/app/api/ghn/master-data/route.ts`
- **Endpoint**: GET `/api/ghn/master-data?type={type}`
- Cac loai du lieu:
  - `province` - Danh sach tinh/thanh pho
  - `district?province_id={id}` - Quan/huyen theo tinh
  - `ward?district_id={id}` - Phuong/xa theo quan
- Tra ve du lieu chuan hoa: ProvinceID/Name, DistrictID/Name, WardCode/Name
- Su dung cho cascading dropdown trong form dia chi

### 2.3 Tao don van chuyen GHN
- **File**: `src/app/api/ghn/create-order/route.ts` (inferred)
- Tao don GHN tu thong tin don hang
- Nhan ma van don (tracking code)
- Luu vao bang `don_van_chuyen`

### 2.4 Huy don van chuyen
- **File**: `src/app/api/ghn/cancel/route.ts`
- Huy don GHN khi don hang bi huy
- Cap nhat trang thai van chuyen

### 2.5 Theo doi don hang
- **File**: `src/app/api/ghn/tracking/route.ts` (inferred)
- Lay trang thai giao hang tu GHN
- Hien thi timeline van chuyen cho khach

### 2.6 Webhook GHN
- **File**: `src/app/api/ghn/webhook/route.ts` (inferred)
- Nhan cap nhat trang thai tu GHN
- Tu dong cap nhat trang thai don hang khi GHN thong bao

### 2.7 Quy tac giao hang
- Mien phi ship: Don tu 500,000 VND (trong pham vi Da Nang)
- Phi ship mac dinh: 30,000 VND (khi chua tinh GHN)
- Giao nhanh 2h: Noi thanh Da Nang (don tu 150,000 VND)
- Giao 4-6h: Khu vuc lan can
- Giao 2-3 ngay: Toan quoc (san pham kho)

### 2.8 API Endpoints
| Endpoint | Method | Chuc nang | File |
|----------|--------|-----------|------|
| `/api/ghn/fee` | POST | Tinh phi van chuyen | `src/app/api/ghn/fee/route.ts` |
| `/api/ghn/master-data` | GET | Lay dia chi tinh/quan/phuong | `src/app/api/ghn/master-data/route.ts` |
| `/api/ghn/create-order` | POST | Tao don van chuyen GHN | `src/app/api/ghn/create-order/route.ts` |
| `/api/ghn/cancel` | POST | Huy don van chuyen | `src/app/api/ghn/cancel/route.ts` |
| `/api/admin/shipping` | GET/POST | Quan ly van chuyen (admin) | `src/app/api/admin/shipping/route.ts` |

### 2.9 Models lien quan
- `don_van_chuyen` - Thong tin van chuyen (ma_van_don, trang_thai, ngay_giao_du_kien)
- `doi_tac_van_chuyen` - Doi tac (GHN, ...)
- `don_hang` - Lien ket dia chi giao (ma_tinh_ghn, ma_quan_huyen_ghn, ma_phuong_xa_ghn)
- `dia_chi_nguoi_dung` - Dia chi luu san co ma GHN

### 2.10 Database dia chi Viet Nam
- `tinh_thanh` - 63 tinh thanh
- `quan_huyen` - Quan/huyen theo tinh
- `phuong_xa` - Phuong/xa theo quan

## 3. Tinh nang con thieu & Lo hong

### 3.1 Van de ky thuat
- **Trong luong tinh toan don gian**: Chi dung `so_luong * 500g`, khong phan biet loai san pham (rau cu vs gao)
- **Khong cache du lieu master data**: Moi lan load form dia chi deu goi GHN API → cham
- **Khong xu ly GHN API downtime**: Neu GHN khong phan hoi, khong co fallback
- **Webhook khong xac thuc**: Khong kiem tra signature/IP nguon cua webhook GHN
- **Khong co nhieu doi tac**: Chi tich hop GHN, khong co lua chon khac

### 3.2 Thieu nghiep vu
- Khong ho tro nhieu goi hang cho 1 don (split shipment)
- Khong co co che giao lai (re-delivery) khi khach vang
- Khong tinh trong luong the tich (volumetric weight)
- Khong co lich giao hang yeu cau (hen gio giao)
- Khong co lua chon toc do giao (nhanh/tieu chuan/tiet kiem)
- Khong gui SMS/email thong bao khi shipper den
- Khong co tinh nang uoc tinh phi ship truoc khi them vao gio
- Khong luu lich su phi ship de doi chieu

### 3.3 Thieu bao cao
- Khong co thong ke ti le giao thanh cong
- Khong co bao cao thoi gian giao trung binh
- Khong co chi phi van chuyen theo khu vuc
- Khong co canh bao khi phi ship cao bat thuong

## 4. Cong viec can lam (TODOs)

### Uu tien cao
- [ ] Xac thuc webhook GHN (kiem tra signature hoac IP whitelist)
- [ ] Them fallback khi GHN API khong phan hoi (hien thi phi co dinh)
- [ ] Cache du lieu master data (tinh/quan/phuong) vao database hoac Redis (TTL 24h)
- [ ] Tinh trong luong chinh xac hon dua tren thuoc tinh san pham (kg/san pham)
- [ ] Xu ly truong hop giao that bai tu webhook (cap nhat don hang, thong bao khach)

### Uu tien trung binh
- [ ] Them lua chon toc do giao (nhanh/tieu chuan) voi gia khac nhau
- [ ] Gui thong bao (email/SMS) khi trang thai van chuyen thay doi
- [ ] Them tinh nang uoc tinh phi ship tren trang san pham
- [ ] Ho tro tinh trong luong the tich cho san pham lon nhung nhe
- [ ] Them bao cao thong ke van chuyen (ti le thanh cong, thoi gian TB)

### Uu tien thap
