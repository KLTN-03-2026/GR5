# Module Kho Hang (Warehouse Management)

## 1. Tong quan
Module kho hang quan ly toan bo hoat dong nhap kho, xuat kho, kiem ke, canh bao han su dung, va theo doi vi tri luu tru san pham. Ap dung nguyen tac FEFO (First Expiry First Out) cho hang nong san. Ho tro so do kho truc quan voi drill-down theo cap: Khu vuc → Day → Ke → Tang.

## 2. Cac chuc nang hien co

### 2.1 So do kho (Warehouse Map)
- **File**: `src/components/admin/warehouse/WarehouseMap.tsx`, `WarehouseMapView.tsx`
- **File trang**: `src/app/admin/warehouse/map/page.tsx`, `src/app/staff/map/page.tsx`
- Dieu huong phan cap drill-down:
  - Cap 0: Luoi khu vuc (zone) voi chi so cong suat
  - Cap 1: Danh sach day (row) trong khu vuc
  - Cap 2: Luoi ke (shelf) hien ti le su dung %
  - Cap 3: Chi tiet tang (floor) voi thong tin lo hang
- Ma mau cong suat:
  - Xanh (<75%) - Binh thuong
  - Vang (75-90%) - Gan day
  - Do (>90%) - Qua tai
  - Xam - Trong
- Card thong ke: Tong kien hang, kien sap het han, da xuat trong thang
- Popup chi tiet lo hang realtime (so lo, HSD, so luong)

### 2.2 Quan ly khu vuc kho (Zones) - Chi Admin
- **API**: `/api/admin/warehouse/zones/route.ts`, `/api/admin/warehouse/zones/[id]/route.ts`
- GET: Cay cau truc khu vuc voi cong suat
- POST: Tao khu vuc moi voi vi tri tu dong sinh
- PATCH: Cap nhat suc chua va ghi chu
- DELETE: Xoa khu vuc voi tuy chon chuyen hang sang khu vuc khac
- Chi ADMIN moi co quyen tao/xoa/sua khu vuc

### 2.3 Nhap kho (Goods Receipt)
- **Trang**: `src/app/admin/warehouse/receiving/page.tsx`
- **API chinh**:
  - `/api/admin/warehouse/import/route.ts` - Danh sach + tao phieu nhap
  - `/api/admin/warehouse/import/[id]/route.ts` - Chi tiet phieu nhap
  - `/api/admin/warehouse/import/[id]/review/route.ts` - Nhan hang + kiem tra
  - `/api/admin/warehouse/import/[id]/approve/route.ts` - Duyet phieu nhap
  - `/api/admin/warehouse/import/[id]/reject/route.ts` - Tu choi phieu nhap
  - `/api/admin/warehouse/import/check-batch/route.ts` - Kiem tra lo hang
  - `/api/admin/warehouse/import/suggest-location/route.ts` - Goi y vi tri cat
- Quy trinh nhap kho:
  1. Tao phieu nhap (NCC, san pham, so luong yeu cau, don gia)
  2. Nhan hang: Xac nhan so luong thuc nhan vs yeu cau
  3. Tinh chenh lech %: Neu >5% → canh bao quan ly
  4. Kiem tra chat luong (kem anh bang chung)
  5. Tao lo hang + kien hang chi tiet voi ma vach (QR)
  6. Goi y vi tri cat tru dua tren suc chua con
  7. Duyet phieu nhap → Cap nhat ton kho

### 2.4 Xuat kho (Goods Issue - FEFO)
- **Trang**: Trong WarehouseClient.tsx (tab Xuat kho)
- **API**: `/api/admin/warehouse/issue/route.ts`
- 2 che do:
  - **Thu cong (FEFO)**: Chon bien the + so luong → He thong goi y lo xuat theo thu tu HSD
  - **QR Code**: Quet ma vach kien hang de xuat nhanh
- Thuat toan FEFO:
  - Uu tien lo hang het han som nhat
  - Xet ton kho kha dung
  - Canh bao neu chi dap ung 1 phan
  - Ma mau cho lo khan cap (amber)
- Tao phieu xuat kho lien ket voi don hang hoac phieu tra NCC

### 2.5 Canh bao han su dung (Expiration Alerts)
- **API**:
  - `/api/admin/warehouse/alerts/route.ts` - Danh sach canh bao
  - `/api/admin/warehouse/alerts/[id]/clearance/route.ts` - Xu ly thanh ly
  - `/api/admin/warehouse/alerts/[id]/destroy/route.ts` - Xu ly huy
  - `/api/admin/warehouse/warnings/route.ts` - Canh bao chung
  - `/api/admin/warehouse/warnings/[id]/resolve/route.ts` - Danh dau da xu ly
- Phan loai canh bao:
  - Sap het han (con <= 7 ngay)
  - Da het han
  - Ton kho thap
- Phuong thuc xu ly: Thanh ly (giam gia ban), Huy (tieu huy), Tra NCC

### 2.6 Ton kho (Inventory)
- **Trang**: `src/app/admin/warehouse/inventory/page.tsx`
- **API**: `/api/admin/warehouse/inventory/route.ts`
- Hien thi: Ma lo, ten san pham, bien the, so luong, don vi, vi tri
- Ma mau HSD: Xanh (con nhieu), Vang (<=7 ngay), Do (het han)
- Tim kiem theo ma lo hoac ten san pham
- Chip tom tat: Tong, Binh thuong, Canh bao, Het han

### 2.7 Lich su giao dich (History)
- **Trang**: `src/app/admin/warehouse/history/page.tsx`
- **API**: `/api/admin/warehouse/history/route.ts`
- Log toan bo nhap/xuat/kiem ke
- Loc va tim kiem theo thoi gian

### 2.8 Kiem ke kho (Stocktake)
- Model `phieu_kiem_ke_kho` + `chi_tiet_luan_chuyen_kho`
- Kiem ke dinh ky theo khu vuc
- Doi chieu ton kho thuc te vs he thong

### 2.9 Xuat phieu (Receipt Export)
- **API**: `/api/admin/warehouse/export-receipt/route.ts`
- In phieu nhap/xuat kho
- Ma QR cho kien hang

### 2.10 Models lien quan
- `kho_hang` - Thong tin kho (ten, dia chi)
- `vi_tri_kho` - Vi tri cau truc (khu_vuc, day, ke, tang, suc_chua_toi_da)
- `lo_hang` - Lo hang (ma_lo, ngay_thu_hoach, han_su_dung, trang_thai)
- `kien_hang_chi_tiet` - Kien hang vat ly (ma_vach_quet, trang_thai, vi tri)
- `ton_kho_tong` - Tong ton kho (ma_lo_hang, ma_vi_tri, so_luong)
- `phieu_nhap_kho` - Phieu nhap (NCC, nguoi tao, tong tien, trang thai)
- `phieu_xuat_kho` - Phieu xuat (nguoi tao, don hang, ly do)
- `chi_tiet_phieu_nhap` - Chi tiet nhap (so_luong_yeu_cau, so_luong_thuc_nhan, chenh_lech)
- `chi_tiet_phieu_xuat` - Chi tiet xuat (so_luong_yeu_cau, so_luong_thuc_xuat)
- `chi_tiet_luan_chuyen_kho` - Lich su luan chuyen
- `kien_hang_da_xuat` - Kien hang da xuat (thoi_gian_xuat)
- `canh_bao_lo_hang` - Canh bao (loai, so ngay con, phuong thuc xu ly)
- `phieu_kiem_ke_kho` - Phieu kiem ke

## 3. Tinh nang con thieu & Lo hong

### 3.1 Van de logic
- **Khong tru ton kho khi tao don hang**: Don hang tao xong khong tu dong reserve/tru ton kho
- **Khong co reservation mechanism**: Hang co the ban vuot ton kho (oversell)
- **Khong tinh toan suc chua thuc te**: Khi nhap hang, chi goi y vi tri nhung khong chac chan con cho
- **Khong co batch number generation tu dong**: Ma lo hang nhap thu cong

### 3.2 Thieu tinh nang quan trong
- Khong co du bao ton kho (inventory forecasting)
- Khong co canh bao ton kho thap tu dong (reorder point)
- Khong co tich hop nhiet do/do am (quan trong cho nong san)
- Khong co quan ly serial number cho tung san pham
- Khong co multi-warehouse transfer (chuyen kho)
- Khong co barcode/QR scanner tich hop phia web (chi mobile)
- Khong co bao cao ABC analysis (phan loai hang theo doanh thu)

### 3.3 Van de hieu suat
- Khong co pagination cho danh sach ton kho lon
- Khong co caching cho warehouse map (tai lai moi lan)
- Query ton kho co the cham khi nhieu lo hang

### 3.4 Thieu bao cao
- Khong co bao cao hang ton lau (slow-moving)
- Khong co bao cao ty le hao hut
- Khong co bao cao hieu suat suc chua kho theo thoi gian
- Khong co export bao cao ton kho ra Excel/PDF

## 4. Cong viec can lam (TODOs)

### Uu tien cao
- [ ] Implement reservation: Tru/reserve ton kho khi tao don hang, hoan lai khi huy
- [ ] Them canh bao ton kho thap (reorder point) tu dong khi so luong duoi nguong
- [ ] Tu dong sinh ma lo hang theo quy tac (VD: LOT-{NCC}-{YYYYMMDD}-{SEQ})
- [ ] Validate suc chua con lai truoc khi nhap kho (khong chi goi y)
- [ ] Them cron job quet canh bao HSD hang ngay

### Uu tien trung binh
- [ ] Them tinh nang du bao ton kho (dua tren lich su ban hang 30 ngay)
- [ ] Export bao cao ton kho ra Excel
- [ ] Them pagination + search nang cao cho danh sach ton kho
- [ ] Cache warehouse map data (invalidate khi co thay doi)
- [ ] Them bao cao hang ton lau (>30 ngay khong xuat)
- [ ] Tich hop QR scanner tren web (su dung camera)

### Uu tien thap
- [ ] Ho tro multi-warehouse transfer
- [ ] Tich hop IoT sensor nhiet do/do am (quan trong cho rau cu tuoi)
- [ ] Them ABC analysis (phan loai A/B/C theo doanh thu)
- [ ] Ho tro cycle counting (kiem ke luan phien theo khu vuc)
- [ ] Bao cao ty le hao hut theo loai san pham
- [ ] Them dashboard truc quan hoa ton kho theo thoi gian (trend chart)
