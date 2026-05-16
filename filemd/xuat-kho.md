# Luong Xuat Kho (Goods Issue / Picking Flow)

> Plan ngay 2026-05-13

---

## 1. Phan tich hien trang

### Da co:
- API `/api/admin/warehouse/issue` (GET: goi y FEFO, POST: xuat thu cong/QR/theo don hang)
- `WarehouseService.scanAndIssueItem()` — xuat 1 kien bang QR
- Tab "Xuat Kho" trong `/staff/warehouse/page.tsx` — xuat thu cong/QR (khong lien ket don hang)
- Khi tao don hang (POST `/api/store/orders`) da tru `ton_kho_tong` theo FEFO

### Thieu (van de chinh):
1. **Khong tao phieu xuat kho khi xu ly don hang** — khi staff bam "Xac nhan don" (CONFIRM_ORDER), chi doi trang thai don → khong co phieu xuat, khong danh dau kien hang nao da xuat
2. **Buoc nhat hang (picking) chi la UI gia** — quet QR tren `/staff/orders/[id]` khong goi API, chi toggle state local
3. **Khong co trang xuat kho rieng theo don hang** — nhan vien kho can trang chuyen biet de xem danh sach don can xuat, pick hang, xac nhan xuat
4. **Khi huy don khong hoan phieu xuat** — chi hoan ton kho nhung khong tao phieu nhap bu / huy phieu xuat
5. **Khong co lich su/traceability** — khong biet kien hang nao thuoc don nao

---

## 2. Thiet ke luong xuat kho moi

### 2.1 Luong tong quat

```
Khach dat hang → Tru ton kho (ton_kho_tong) [da co]
      |
Staff xac nhan don (CONFIRM_ORDER)
      |
He thong phan loai don: GAN / TRUNG / XA (dua tren dia chi GHN)
      |
Don chuyen sang CHO_GIAO_HANG → Tao "Phieu xuat kho" (trang_thai: DANG_SOAN)
      |
Staff nhat hang (picking) — quet QR tung kien → Goi API danh dau kien DA_XUAT
      |
Nhat du → Phieu xuat chuyen HOAN_THANH → Cho phep tao van don GHN
      |
Tao van don → DANG_GIAO_HANG
```

### 2.2 Phan loai don theo khoang cach & chien luoc chon lo

He thong giao hang dung GHN cho tat ca don. Khoang cach anh huong toi **thoi gian van chuyen** → anh huong truc tiep toi **chat luong nong san khi toi tay khach**. Vi vay, chien luoc chon lo hang phai khac nhau:

| Loai don | Pham vi | Thoi gian giao | Chien luoc chon lo |
|----------|---------|----------------|-------------------|
| **GAN** | Noi thanh Da Nang | 1–4 gio | FEFO thuan tuy — uu tien lo sap het han nhat (tuoi nhat cho khach) |
| **TRUNG** | Mien Trung (Hue, Quang Nam...) | 1 ngay | FEFO nhung **loai bo lo con < 3 ngay HSD** (khong kip giao) |
| **XA** | Toan quoc | 2–4 ngay | FEFO nhung **loai bo lo con < 5 ngay HSD** + uu tien lo HSD dai hon |

#### Logic phan loai tu dong:
- Dua tren `ma_quan_huyen_ghn` (district_id) luu trong `don_hang`
- GAN: district_id thuoc Da Nang (tu GHN master-data, province_id = 48)
- TRUNG: province_id thuoc mien Trung (Thua Thien Hue, Quang Nam, Quang Ngai, Binh Dinh, Phu Yen, Khanh Hoa, Quang Binh, Quang Tri)
- XA: Tat ca cac tinh con lai

#### Dieu chinh FEFO theo khoang cach:
- Khi goi y lo hang (API GET `/api/staff/warehouse/issue`), he thong:
  1. Xac dinh loai don (GAN/TRUNG/XA)
  2. Tinh `min_days_left` = so ngay HSD toi thieu de dam bao chat luong:
     - GAN: min_days_left = 1 (chi loai het han)
     - TRUNG: min_days_left = 3
     - XA: min_days_left = 5
  3. Loc: chi goi y lo hang co `days_left >= min_days_left`
  4. Sap xep theo FEFO trong tap lo da loc (van uu tien lo sap het han truoc, nhung dam bao du thoi gian giao)
  5. Neu khong du hang sau khi loc → canh bao "Khong du hang dat chuan HSD cho don xa" + cho phep force (nhan vien quyet dinh)

#### Dong goi dac biet:
- Don TRUNG: hien thi canh bao "Khuyen nghi dong goi tui giu nhiet" tren UI nhat hang
- Don XA: hien thi canh bao "BAT BUOC dong goi lanh (tui giu nhiet + da kho)" tren UI nhat hang
- Thong tin dong goi luu vao `ghi_chu` phieu xuat de doi soat

#### Uu tien xu ly:
- Don GAN (thoi gian giao 1-4h) → do khan cap cao nhat vi GHN lay hang nhanh
- Don XA (thoi gian giao 2-4 ngay) → co the xu ly sau nhung phai dong goi ky
- Dashboard hien thi don sap xep theo:
  1. Thoi gian cho (don lau nhat len truoc)
  2. Loai don (GAN > TRUNG > XA) khi cung thoi gian cho

---

## 3. Cac buoc trien khai

### Phase 1: API Backend

#### 1.1 Sua `CONFIRM_ORDER` trong `/api/staff/orders/[id]/route.ts`
- Khi staff xac nhan don → tu dong tao `phieu_xuat_kho` voi `ma_don_hang`, `trang_thai: "DANG_SOAN"`, `ly_do_xuat: "XUAT_THEO_DON_HANG"`
- Tao `chi_tiet_phieu_xuat` cho tung item trong don (ma_bien_the, so_luong_yeu_cau)

#### 1.2 Tao API `/api/staff/warehouse/issue/route.ts` — Xuat kho theo don hang
- **GET** `?ma_don_hang=X` — Lay thong tin phieu xuat + danh sach kien can nhat (goi y FEFO co tinh khoang cach)
  - Xac dinh loai don (GAN/TRUNG/XA) tu `ma_quan_huyen_ghn` cua don hang
  - Loc lo hang theo `min_days_left` tuong ung voi loai don
  - Tra ve: phieu xuat, danh sach lo goi y, loai_don, canh_bao_dong_goi, min_days_left
- **POST** `{ action: "SCAN", qrCode, ma_phieu_xuat }` — Quet QR 1 kien → danh dau DA_XUAT, tao kien_hang_da_xuat, sync ton_kho
  - Validate: kien thuoc lo co HSD >= min_days_left (canh bao neu khong, van cho phep force)
- **POST** `{ action: "COMPLETE", ma_phieu_xuat }` — Hoan thanh phieu xuat (khi da nhat du)
- **POST** `{ action: "FORCE_COMPLETE", ma_phieu_xuat }` — Xuat thieu (partial) + ghi ly do

#### 1.3 Tao API `/api/staff/warehouse/issue/pending/route.ts`
- **GET** — Danh sach don hang dang cho xuat kho (CHO_GIAO_HANG + phieu xuat DANG_SOAN)
- Include: thong tin khach, san pham, so luong, tien do nhat, loai_don (GAN/TRUNG/XA)
- Sap xep: thoi gian cho giam dan, loai don GAN uu tien truoc

#### 1.4 Sua logic huy don
- Khi huy don co phieu xuat DANG_SOAN → huy phieu xuat (DA_HUY)
- Hoan lai kien hang da quet (neu co) → TRONG_KHO

---

### Phase 2: Trang Xuat Kho Nhan Vien

#### 2.1 Tao `/staff/warehouse/issue/page.tsx` — Dashboard xuat kho
- Filter tab: Tat ca | Gan | Trung | Xa
- Danh sach don cho xuat (cards): ma don, khach, so SP, thoi gian dat, loai don (badge mau)
  - Badge mau: GAN = xanh la, TRUNG = vang, XA = do
  - Priority: urgent neu don GAN cho > 1h, don TRUNG/XA cho > 4h
- Badge tien do: "0/3 kien", "2/5 kien"
- Nut "Bat dau nhat hang" → chuyen sang trang chi tiet
- Sap xep mac dinh: GAN truoc, trong cung loai thi lau nhat truoc

#### 2.2 Tao `/staff/warehouse/issue/[orderId]/page.tsx` — Nhat hang cho 1 don
- Header: Thong tin don hang (ma, khach, dia chi) + **Badge loai don (GAN/TRUNG/XA)**
- **Banner dong goi** (tuy loai don):
  - GAN: khong hien banner
  - TRUNG: banner vang "Khuyen nghi dong goi tui giu nhiet"
  - XA: banner do "BAT BUOC dong goi lanh — tui giu nhiet + da kho"
- Danh sach san pham can xuat: ten, so luong, lo goi y FEFO (da loc theo min_days_left), vi tri kho
  - Hien thi HSD cua lo goi y + so ngay con lai
  - Canh bao neu lo goi y gan nguong min_days_left
- Khu vuc quet QR (camera hoac input thu cong)
  - Khi quet: validate kien co HSD phu hop voi loai don, canh bao neu khong (van cho force)
- Progress bar: da quet / tong kien
- Validation FEFO: canh bao neu quet kien khong dung thu tu uu tien
- Nut "Hoan thanh xuat kho" (khi du) hoac "Xuat thieu" (khi khong du)
- Checkbox "Da dong goi dac biet" (bat buoc tick cho don XA truoc khi hoan thanh)
- Sau hoan thanh → enable nut "Tao van don GHN"

---

### Phase 3: Cap nhat trang hien co

#### 3.1 Sua `/staff/orders/[id]/page.tsx`
- Buoc CHO_GIAO_HANG: thay UI quet QR gia → link sang `/staff/warehouse/issue/[orderId]`
- Hien thi trang thai phieu xuat (DANG_SOAN / HOAN_THANH)
- Chi cho tao van don GHN khi phieu xuat = HOAN_THANH

#### 3.2 Cap nhat tab "Xuat Kho" trong `/staff/warehouse/page.tsx`
- Them section "Don hang cho xuat" o dau tab — danh sach don CHO_GIAO_HANG
- Giu nguyen xuat thu cong/QR cho truong hop xuat khong theo don (VD: tra NCC, thanh ly)

#### 3.3 Cap nhat sidebar staff
- Them menu "Xuat kho don hang" → `/staff/warehouse/issue`

---

### Phase 4: Tich hop & Traceability

#### 4.1 API lich su xuat kho theo don
- Mo rong `/api/admin/warehouse/history` — filter theo `ma_don_hang`
- Hien thi: don nao → phieu xuat nao → kien nao → lo nao → ai xuat → luc nao

#### 4.2 Hien thi tren admin
- Drawer chi tiet don hang admin → tab "Kho" hien thi phieu xuat + kien da xuat

---

### Phase 5: Cac nghiep vu xuat kho bo sung (Tam trung)

#### 5.1 Xuat kho tra hang NCC
- **Khi nao**: Hang loi / het han / khong dat chat luong → tra ve NCC
- **Luong**:
  1. Thu kho tao phieu tra NCC (`/warehouse-manager/suppliers/[id]` hoac `/admin/ncc/[id]/tra-hang`)
  2. He thong tu dong tao `phieu_xuat_kho` voi `ly_do_xuat = "TRA_NCC"`, `ma_phieu_tra_ncc`
  3. Nhan vien quet QR kien hang can tra (hoac he thong tu chon theo lo bi canh bao)
  4. Xac nhan xuat → danh dau kien_hang = TRA_NCC, tru ton_kho_tong
  5. Cap nhat cong_no_ncc (giam no tuong ung)
- **Da co API**: `/api/admin/ncc/[id]/tra-hang` + model `phieu_tra_nha_cung_cap`
- **Can lam**: Ket noi voi luong xuat kho moi (tao phieu xuat + quet QR kien cu the)

#### 5.2 Xuat kho thanh ly / tieu huy
- **Khi nao**: Hang het han, khong the ban, khong the tra NCC
- **Luong**:
  1. He thong canh bao HSD → Thu kho xem tab Canh bao
  2. Thu kho quyet dinh: thanh ly (ban giam gia) hoac tieu huy
  3. Neu tieu huy: tao `phieu_xuat_kho` voi `ly_do_xuat = "TIEU_HUY"`
  4. Nhan vien quet QR kien hang bi huy
  5. Xac nhan → kien_hang = DA_TIEU_HUY, tru ton_kho_tong
  6. Ghi log lich su (ai huy, bao nhieu, khi nao, ly do)
- **Da co**: API alerts + clearance/destroy
- **Can lam**: Ket noi voi phieu xuat kho chinh thuc de co traceability

#### 5.3 Xuat kho 1 phan (Partial Fulfillment)
- **Khi nao**: Don hang nhieu SP, 1 so SP het hang → xuat truoc phan co, cho phan con lai
- **Luong**:
  1. Staff bat dau nhat hang cho don
  2. Phat hien 1 SP khong du ton kho (hoac lo phu hop)
  3. Chon "Xuat 1 phan" → hoan thanh phieu xuat voi so luong thuc xuat < yeu cau
  4. He thong tao don van chuyen cho phan da xuat
  5. Phan chua xuat: tao phieu xuat phu (DANG_CHO_HANG) → cho nhap them hang
  6. Thong bao khach: "Don hang cua ban se duoc giao 2 dot"
- **Luu y**: Voi nong san, thuong KHONG chia don vi chi phi ship tang gap doi. Uu tien cho het hang roi giao 1 lan. Chi ap dung khi khach dong y hoac don gia tri cao.

#### 5.4 Xuat kho gop don (Batch Picking / Wave Picking)
- **Khi nao**: Nhieu don hang cung san pham → nhat 1 lan xong chia ra
- **Luong**:
  1. He thong gom nhom cac don chua xuat co cung san pham
  2. Tao "Wave" (dot nhat hang): gom 5-10 don
  3. Nhan vien nhat tong so kien can cho ca wave
  4. Sau khi nhat du → chia kien vao tung don (sorting)
  5. Xac nhan tung phieu xuat
- **Loi ich**: Giam so lan di lai trong kho (kho co so do rong)
- **Do uu tien**: Trung binh — huu ich khi co nhieu don/ngay (>30 don)

#### 5.5 Kiem tra truoc xuat (Pre-shipment QC)
- **Khi nao**: Don gia tri cao, hoac san pham nhay cam (rau cu tuoi)
- **Luong**:
  1. Sau khi nhat hang xong, truoc khi dong goi
  2. Nhan vien kiem tra nhanh: bao bi nguyen ven, khong mop, khong am moc
  3. Tick checklist (3-5 items): "Bao bi OK", "Khong dap", "Dung bien the", "HSD du"
  4. Neu FAIL → thay kien khac tu cung lo hoac lo ke tiep
  5. Pass → cho phep dong goi + tao van don
- **Do uu tien**: Cao — nong san de hu hong, kiem tra truoc giam ti le doi tra

#### 5.6 In phieu xuat kho + Phieu giao hang
- **Khi nao**: Sau khi hoan thanh xuat kho, truoc khi giao cho GHN
- **Noi dung in**:
  - Phieu xuat kho: Ma phieu, ngay, nguoi xuat, danh sach kien (QR + ten SP + so luong)
  - Phieu giao hang (packing slip): Ten khach, dia chi, danh sach SP, tong tien (neu COD)
- **Luong**:
  1. Hoan thanh phieu xuat → nut "In phieu"
  2. Mo print preview (popup): chon in phieu xuat / phieu giao / ca hai
  3. Dinh kem phieu giao vao thung hang
- **Da co 1 phan**: PrintModal trong staff/warehouse/page.tsx (in QR khi nhap)
- **Can lam**: Them template in cho xuat kho + packing slip

#### 5.7 Quan ly tra hang tu khach (Reverse Logistics → Nhap lai kho)
- **Khi nao**: Khach tra hang (yeu cau doi tra da duyet) → hang gui ve kho
- **Luong**:
  1. Admin duyet doi tra → don chuyen trang thai
  2. GHN lay hang tra tu khach → gui ve kho
  3. Nhan vien nhan hang tra: kiem tra chat luong
     - Con tot: nhap lai kho (tao lo hang moi hoac nhap vao lo cu)
     - Hu hong: tieu huy hoac tra NCC
  4. Cap nhat ton_kho_tong neu nhap lai
  5. Hoan tien cho khach (da co API)
- **Lien ket voi module doi-tra-hoan-tien**: `yeu_cau_doi_tra` → `phieu_nhap_kho` (hang tra ve)
- **Do uu tien**: Trung binh — can co de dong bo kho voi dong tien

---

## 4. Models lien quan (da co trong schema)

| Model | Vai tro |
|-------|---------|
| `phieu_xuat_kho` | Phieu xuat (ma_don_hang, trang_thai, ly_do_xuat) |
| `chi_tiet_phieu_xuat` | Chi tiet (ma_bien_the, so_luong_yeu_cau, so_luong_thuc_xuat) |
| `kien_hang_chi_tiet` | Kien vat ly (trang_thai: TRONG_KHO → DA_XUAT) |
| `kien_hang_da_xuat` | Link kien → chi_tiet_phieu_xuat |
| `ton_kho_tong` | Ton kho tong (tru khi xuat) |

---

## 5. Thu tu uu tien

### 5.1 Luong chinh (Xuat theo don hang B2C) — Bat buoc

| # | Viec | Impact | Trang thai |
|---|------|--------|-----------|
| 1 | Sua CONFIRM_ORDER tao phieu xuat + phan loai GAN/TRUNG/XA | Co phieu xuat chinh thuc | [x] Done 2026-05-13 |
| 2 | API staff/warehouse/issue (scan + complete + FEFO theo khoang cach) | Backend cho nhat hang | [x] Done 2026-05-13 |
| 3 | Trang `/staff/warehouse/issue/[orderId]` (nhat hang + banner dong goi) | UI nhat hang thuc te | [x] Done 2026-05-13 |
| 4 | Trang `/staff/warehouse/issue` (dashboard + filter GAN/TRUNG/XA) | Tong quan don cho xuat | [x] Done 2026-05-13 |
| 5 | Sua staff/orders/[id] link sang trang xuat | Lien ket 2 luong | [x] Done 2026-05-13 |
| 6 | Sua logic huy don + hoan phieu xuat | Consistency | [x] Done 2026-05-13 |
| 7 | In phieu xuat + packing slip | Chung tu | [ ] |

### 5.2 Nghiep vu bo sung — Nen co (tam trung)

> Tick [x] = lam, Tick [~] = bo, de [ ] = chua quyet dinh

| # | Viec | Do uu tien | Ly do | Trang thai |
|---|------|-----------|-------|-----------|
| 8 | Kiem tra truoc xuat (Pre-shipment QC checklist) | Cao | Giam ti le doi tra nong san | [~ ] |
| 9 | Xuat kho tra hang NCC (ket noi phieu xuat) | Cao | Da co API nhung chua lien ket kho | [x ] |
| 10 | Xuat kho thanh ly/tieu huy (ket noi phieu xuat) | Trung binh | Traceability cho hang huy | [x ] |
| 11 | Tra hang tu khach nhap lai kho | Trung binh | Dong bo kho voi dong tien | [ x] |
| 12 | Gop don / Wave picking | Thap | Chi can khi >30 don/ngay | [ ~] |
| 13 | Xuat 1 phan (partial fulfillment) | Thap | It dung voi nong san (phi ship x2) | [~ ] |

### 5.3 Lich su + Bao cao

| # | Viec | Do uu tien | Trang thai |
|---|------|-----------|-----------|
| 14 | Lich su xuat kho (filter theo don, NCC, ly do) | Trung binh | [ x] |
| 15 | Bao cao xuat kho: so luong/ngay, theo san pham, theo loai don | Thap | [ x] |
| 16 | Dashboard kho cho warehouse-manager | Thap | [ ~] |

---

## 6. Ghi chu ky thuat

- Ton kho da bi tru luc tao don (store/orders POST) → buoc xuat kho chi can danh dau kien hang DA_XUAT + tao phieu xuat de traceability, KHONG tru ton_kho_tong lan nua
- Neu don bi huy sau khi da tao phieu xuat → hoan ton_kho_tong + chuyen kien_hang ve TRONG_KHO
- FEFO validation: khi quet QR, kiem tra kien nay co thuoc lo uu tien khong, canh bao neu khong (nhung van cho phep xuat)
- Phieu xuat trang thai: DANG_SOAN → HOAN_THANH | DA_HUY

---

## 7. Phan loai khoang cach — Chi tiet ky thuat

### 7.1 Bang phan loai province_id (GHN)

```
GAN (noi thanh Da Nang):
  province_id = 48 (Da Nang)

TRUNG (Mien Trung):
  province_id in [46, 49, 51, 52, 54, 56, 44, 45]
  (Thua Thien Hue, Quang Nam, Quang Ngai, Binh Dinh, Phu Yen, Khanh Hoa, Quang Binh, Quang Tri)

XA (Toan quoc con lai):
  Tat ca province_id khac
```

### 7.2 Ham phan loai (pseudocode)

```ts
function classifyOrder(provinceId: number): "GAN" | "TRUNG" | "XA" {
  if (provinceId === 48) return "GAN"; // Da Nang
  const mienTrung = [46, 49, 51, 52, 54, 56, 44, 45];
  if (mienTrung.includes(provinceId)) return "TRUNG";
  return "XA";
}

function getMinDaysLeft(loaiDon: "GAN" | "TRUNG" | "XA"): number {
  switch (loaiDon) {
    case "GAN": return 1;
    case "TRUNG": return 3;
    case "XA": return 5;
  }
}
```

### 7.3 Truong can bo sung vao `don_hang` hoac `phieu_xuat_kho`

- `loai_khoang_cach`: ENUM("GAN", "TRUNG", "XA") — luu khi tao phieu xuat, de khong phai tinh lai
- `yeu_cau_dong_goi`: VARCHAR — "BINH_THUONG" | "GIU_NHIET" | "DONG_GOI_LANH"
- `da_dong_goi_dac_biet`: BOOLEAN — nhan vien tick xac nhan da dong goi dung yeu cau

### 7.4 Anh huong toi FEFO query

```sql
-- Query goi y lo hang cho don XA (min 5 ngay HSD con lai)
SELECT lh.*, tkt.so_luong
FROM ton_kho_tong tkt
JOIN lo_hang lh ON tkt.ma_lo_hang = lh.id
WHERE lh.ma_bien_the = ?
  AND tkt.so_luong > 0
  AND lh.trang_thai NOT IN ('DA_TIEU_HUY', 'TRA_NCC')
  AND DATEDIFF(lh.han_su_dung, NOW()) >= 5  -- min_days_left cho don XA
ORDER BY lh.han_su_dung ASC  -- van FEFO trong tap da loc
LIMIT 10;
```

---

## 8. Ket qua test (2026-05-13)

### API Tests (curl against dev server):

| API | Method | Test | Ket qua |
|-----|--------|------|---------|
| `/api/staff/warehouse/issue/pending` | GET | Goi khi chua co don cho xuat | ✅ 200 - `{"items":[],"total":0,"summary":{"gan":0,"trung":0,"xa":0,"urgent":0}}` |
| `/api/staff/warehouse/issue?ma_don_hang=179` | GET | Don khong co phieu xuat | ✅ 404 - `{"error":"Chua co phieu xuat cho don nay"}` |
| `/api/staff/warehouse/issue` | POST SCAN | Quet QR khong ton tai | ✅ 400 - `{"error":"Kien hang khong ton tai hoac da xuat"}` |
| `/api/staff/orders` | GET | Kiem tra don hang | ✅ 200 - tra ve danh sach don |

### TypeScript check:
- `npx tsc --noEmit` — 0 loi trong cac file xuat kho (staff/warehouse/issue/*, api/staff/warehouse/issue/*)
- Loi con lai la pre-existing (admin/payments Prisma schema mismatch — khong lien quan)

### Files da tao/sua:

**Tao moi:**
- `src/app/api/staff/warehouse/issue/route.ts` — API GET (FEFO suggestions) + POST (SCAN/COMPLETE/FORCE_COMPLETE)
- `src/app/api/staff/warehouse/issue/pending/route.ts` — API GET danh sach don cho xuat
- `src/app/staff/warehouse/issue/page.tsx` — Dashboard xuat kho (filter tabs, priority sorting)
- `src/app/staff/warehouse/issue/[orderId]/page.tsx` — Trang nhat hang (FEFO suggestions, QR scan, progress, packing warnings)

**Sua:**
- `src/app/api/staff/orders/[id]/route.ts` — CONFIRM_ORDER tao phieu_xuat_kho + chi_tiet_phieu_xuat; CANCEL_ORDER huy phieu xuat + hoan kien hang
- `src/app/staff/orders/[id]/page.tsx` — Thay UI quet QR gia bang link den trang xuat kho
- `src/app/staff/warehouse/page.tsx` — Them link "Xuat kho theo don hang" trong tab XUAT_KHO
- `src/components/staff/layout/StaffSidebar.tsx` — Them menu "Xuat Kho Don Hang"

### Luu y:
- Can tao don hang moi (CHO_XAC_NHAN → CONFIRM_ORDER) de test full flow end-to-end vi don hien tai da o trang thai DANG_GIAO_HANG truoc khi code moi duoc deploy
- Dev server can restart (rm -rf .next) de nhan dien route moi
