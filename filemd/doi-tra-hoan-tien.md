# Module Doi Tra & Hoan Tien (Returns & Refunds)

## 1. Tong quan
Module doi tra va hoan tien xu ly quy trinh khach hang yeu cau doi/tra san pham sau khi nhan hang, bao gom gui yeu cau voi bang chung, duyet/tu choi tu staff/admin, va tien hanh hoan tien. Lien ket chat che voi module don hang va thanh toan.

## 2. Cac chuc nang hien co

### 2.1 Gui yeu cau doi tra (Khach hang)
- **Tich hop trong**: `src/app/(store)/orders/page.tsx`
- Chi cho phep khi don hang co trang thai `DA_GIAO`
- Form modal:
  - Dropdown ly do doi tra (cac ly do dinh san)
  - Textarea mo ta chi tiet
  - Upload anh minh chung: Toi da 5 anh, chuyen Base64
  - Dinh dang ho tro: JPG, PNG, WebP (client-side check)
- API: PUT `/api/store/orders` voi `action: "RETURN"`
- Ket qua:
  - Tao ban ghi `yeu_cau_doi_tra` (loai_yeu_cau, ly_do, anh_minh_chung JSON)
  - Cap nhat don hang thanh `YEU_CAU_DOI_TRA`

### 2.2 Duyet yeu cau doi tra (Staff)
- **Tich hop trong**: `src/app/staff/orders/[id]/page.tsx` (Tab Doi/Tra)
- Xem chi tiet yeu cau: San pham, so luong, ly do, anh minh chung
- 2 hanh dong:
  - **Duyet**: Xac nhan doi tra → Chuyen don sang trang thai duyet
  - **Tu choi**: Nhap ly do tu choi → Thong bao khach hang
- Tinh toan so tien hoan

### 2.3 Xu ly doi tra (Admin)
- **Tich hop trong**: `src/app/admin/orders/page.tsx` (Drawer)
- Tab "YEU_CAU_DOI_TRA" hien thi cac don can xu ly
- Duyet/tu choi voi workflow chi tiet
- Phe duyet → Tien hanh hoan tien

### 2.4 Hoan tien
- **API**: `/api/admin/payments/refunds/route.ts`
- **Model**: `lich_su_hoan_tien`
- Tao ban ghi hoan tien lien ket voi giao_dich_thanh_toan va yeu_cau_doi_tra
- Trang thai: DANG_XU_LY → DA_HOAN → THAT_BAI

### 2.5 Phieu tra NCC (Return to Supplier)
- **API**: `/api/admin/ncc/[id]/tra-hang/route.ts`
- **Model**: `phieu_tra_nha_cung_cap`
- Khi hang bi loi do NCC → Tao phieu tra
- Lien ket voi phieu xuat kho
- Trang thai: DANG_XU_LY, DA_TRA, HOAN_THANH

### 2.6 Models lien quan
- `yeu_cau_doi_tra` - Yeu cau doi tra (ma_don_hang, ma_nguoi_dung, loai_yeu_cau, trang_thai, so_tien_hoan, anh_minh_chung, ly_do)
- `chi_tiet_doi_tra` - Chi tiet san pham doi tra (ma_bien_the, so_luong, ly_do, anh)
- `lich_su_hoan_tien` - Lich su hoan (ma_giao_dich, ma_yeu_cau, so_tien, trang_thai)
- `phieu_tra_nha_cung_cap` - Tra hang cho NCC (ma_ncc, tong_tien_hoan, trang_thai)
- `phieu_xuat_kho` - Phieu xuat lien ket tra hang

### 2.7 Trang thai yeu cau doi tra
```
CHO_DUYET → DA_DUYET → DANG_HOAN_TIEN → HOAN_THANH
    ↓
TU_CHOI
```

## 3. Tinh nang con thieu & Lo hong

### 3.1 Van de nghiem trong
- **Khong gioi han thoi gian doi tra**: Khong co deadline (VD: 7 ngay sau khi nhan)
- **Anh Base64 trong DB**: Luu truc tiep JSON chuoi Base64 → database phong to, query cham
- **Khong validate kich thuoc anh server-side**: 5 anh * vài MB = hang chuc MB/yeu cau
- **Khong co quy trinh nhan lai hang**: Chi xu ly yeu cau, chua co flow nhan hang tra ve
- **Hoan tien khong tu dong**: Phai thu cong, khong goi API VNPay/MoMo refund

### 3.2 Thieu nghiep vu
- Khong co phan biet DOI (exchange) va TRA (return refund)
- Khong co tinh phi van chuyen tra hang (ai chiu?)
- Khong co kiem tra san pham tra ve (quality check)
- Khong co partial return (tra 1 phan don hang)
- Khong co timeline hien thi cho khach theo doi yeu cau
- Khong co thong bao khi trang thai doi tra thay doi
- Khong co chinh sach doi tra ro rang hien thi cho khach
- Khong co ly do tu choi template (admin phai tu go)

### 3.3 Thieu tich hop
- Khong lien ket voi kho hang (hang tra ve nhap lai kho?)
- Khong lien ket voi NCC (hang loi do NCC → auto tao phieu tra NCC)
- Khong co bao cao ti le doi tra theo san pham/NCC
- Khong tich hop hoan tien tu dong qua VNPay API / MoMo refund API

### 3.4 Van de UX
- Khach khong biet trang thai yeu cau dang o dau (khong co tracking)
- Khong co chat/trao doi giua khach va staff ve yeu cau
- Form yeu cau khong cho chon cu the san pham nao muon tra (tra ca don)

## 4. Cong viec can lam (TODOs)

### Uu tien cao
- [ ] Them deadline doi tra (chi cho phep trong 7 ngay sau DA_GIAO)
- [ ] Chuyen luu tru anh tu Base64 trong DB sang file storage (S3/local) + URL
- [ ] Validate kich thuoc anh server-side (max 2MB/anh, max 5 anh)
- [ ] Implement hoan tien tu dong qua VNPay/MoMo refund API
- [ ] Them quy trinh nhan hang tra ve (staff xac nhan nhan duoc hang)

### Uu tien trung binh
- [ ] Phan biet ro DOI (doi san pham khac) va TRA (hoan tien)
- [ ] Cho phep partial return (chon cu the san pham + so luong muon tra)
- [ ] Them timeline tracking cho khach theo doi trang thai yeu cau
- [ ] Gui thong bao khi trang thai doi tra thay doi (email/push)
- [ ] Lien ket hang tra ve voi nhap lai kho (neu con chat luong)
- [ ] Them bao cao ti le doi tra theo san pham va NCC
- [ ] Them chinh sach doi tra hien thi tren trang san pham

### Uu tien thap
- [ ] Them tinh nang chat/trao doi giua khach va staff ve yeu cau doi tra
- [ ] Tu dong tao phieu tra NCC khi hang loi xac dinh do NCC
- [ ] Them tinh nang in nhan gui tra hang cho khach
- [ ] Ho tro video minh chung (ngoai anh)
- [ ] Them workflow phuc tap hon: Don vi van chuyen den lay hang tra
- [ ] Bao cao chi phi doi tra (anh huong loi nhuan)
