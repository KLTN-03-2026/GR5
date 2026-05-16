# Module Nha Cung Cap (Supplier Management)

## 1. Tong quan
Module nha cung cap quan ly toan bo thong tin va quan he voi cac nha cung cap nong san, bao gom ho so NCC, hop dong, danh gia chat luong giao hang, cong no, lich dat hang, va quy trinh tra hang. Day la module phuc tap voi nhieu sub-module lien ket chat che voi module kho hang.

## 2. Cac chuc nang hien co

### 2.1 Quan ly danh sach NCC
- **Trang**: `src/app/admin/suppliers/page.tsx`
- **API**: `/api/admin/ncc/route.ts`
- Danh sach NCC voi: Ten, loai, diem uy tin, trang thai, tinh thanh
- Tim kiem, loc theo trang thai (DANG_HOP_TAC, NGUNG_HOP_TAC, TAM_NGUNG)
- Tao NCC moi voi day du thong tin

### 2.2 Chi tiet NCC (Multi-tab Layout)
- **Layout**: `src/app/admin/suppliers/[id]/layout.tsx`
- **Cac trang con**:

#### Tab Thong tin co ban
- **File**: `src/app/admin/suppliers/[id]/info/page.tsx`
- **API**: `/api/admin/ncc/[id]/route.ts`
- Ho so: Ten, MST, dia chi, SDT, email, Zalo, nguoi lien he
- Loai NCC, tinh thanh
- Phan loai: Nong trai, Hop tac xa, Dai ly, Doanh nghiep
- Tai khoan ngan hang: So TK, ten ngan hang
- Hinh thuc thanh toan, chu ky thanh toan
- Co hoa don VAT
- Ngay bat dau hop tac
- Ghi chu noi bo
- Diem uy tin (1.0 - 5.0)

#### Tab Hop dong
- **File**: `src/app/admin/suppliers/[id]/history/page.tsx`
- **API**: `/api/admin/ncc/[id]/hop-dong/route.ts`
- Danh sach hop dong: So HD, loai, ngay ky, ngay het han, gia tri, trang thai
- Tao hop dong moi
- Upload file hop dong
- Trang thai: HIEU_LUC, HET_HAN, DA_HUY
- Dieu khoan phat

#### Tab Danh gia chat luong giao hang
- **File**: `src/app/admin/suppliers/[id]/quality/page.tsx`
- **API**: `/api/admin/ncc/[id]/danh-gia/route.ts`
- Danh gia sau moi lan nhap hang:
  - Diem chat luong (1-5)
  - Diem dung so luong (1-5)
  - Diem dung han (1-5)
  - Diem dong goi (1-5)
  - Diem trung binh tu dong tinh
- Ghi nhan van de + anh minh chung
- Trang thai xu ly van de (da xu ly / chua)

#### Tab Cong no
- **File**: `src/app/admin/suppliers/[id]/debt/page.tsx`
- **API**: `/api/admin/ncc/[id]/thanh-toan/route.ts`
- Lich su giao dich: Nhap hang (no), Thanh toan (giam no)
- So du hien tai
- Phuong thuc thanh toan: Tien mat, Chuyen khoan, The
- Ma giao dich tham chieu

#### Tab Tra hang
- **File**: `src/app/admin/suppliers/[id]/returns/page.tsx`
- **API**: `/api/admin/ncc/[id]/tra-hang/route.ts`
- Phieu tra hang cho NCC
- Ly do: Hang loi, khong dat chat luong, het han
- Lien ket voi phieu xuat kho

### 2.3 Chot gia NCC
- **API**: `/api/admin/ncc/[id]/chot-gia/route.ts`
- Cap nhat gia nhap gan nhat cho tung san pham/NCC
- Quan ly bang gia theo thoi gian

### 2.4 Lo hang trong kho (theo NCC)
- **API**: `/api/admin/ncc/[id]/lo-hang-trong-kho/route.ts`
- Xem cac lo hang trong kho thuoc NCC
- Theo doi so luong, HSD, trang thai

### 2.5 Cap nhat trang thai NCC
- **API**: `/api/admin/ncc/[id]/trang-thai/route.ts`
- Chuyen trang thai: Dang hop tac ↔ Tam ngung ↔ Ngung hop tac

### 2.6 San pham cua NCC
- **Model**: `ncc_san_pham`
- Lien ket NCC voi san pham cung cap
- Thong tin: Gia nhap gan nhat, don vi tinh, so luong toi thieu, thoi gian giao
- Lich dat hang tu dong: `lich_dat_hang_ncc` (tan suat, ngay trong tuan, gio giao)

### 2.7 API Endpoints
| Endpoint | Method | Chuc nang |
|----------|--------|-----------|
| `/api/admin/ncc` | GET/POST | Danh sach + tao NCC |
| `/api/admin/ncc/[id]` | GET/PUT/DELETE | CRUD chi tiet NCC |
| `/api/admin/ncc/[id]/hop-dong` | GET/POST | Quan ly hop dong |
| `/api/admin/ncc/[id]/danh-gia` | GET/POST | Danh gia giao hang |
| `/api/admin/ncc/[id]/thanh-toan` | GET/POST | Cong no & thanh toan |
| `/api/admin/ncc/[id]/tra-hang` | GET/POST | Phieu tra hang |
| `/api/admin/ncc/[id]/chot-gia` | POST | Cap nhat gia nhap |
| `/api/admin/ncc/[id]/lo-hang-trong-kho` | GET | Lo hang trong kho |
| `/api/admin/ncc/[id]/trang-thai` | PATCH | Doi trang thai |

### 2.8 Models lien quan
- `nha_cung_cap` - Thong tin NCC (ten, MST, dia chi, diem uy tin, trang thai, TK ngan hang)
- `ncc_san_pham` - San pham cua NCC (gia nhap, don vi, SL toi thieu, thoi gian giao)
- `hop_dong_ncc` - Hop dong (so HD, loai, ngay ky, het han, gia tri, file)
- `danh_gia_giao_hang_ncc` - Danh gia (diem 4 tieu chi, van de, anh)
- `cong_no_ncc` - Cong no (loai giao dich, so tien, so du sau)
- `lich_dat_hang_ncc` - Lich dat hang (tan suat, ngay, gio, SL mac dinh)
- `phieu_tra_nha_cung_cap` - Phieu tra (tong tien hoan, trang thai)
- `lo_hang` - Lo hang lien ket NCC

## 3. Tinh nang con thieu & Lo hong

### 3.1 Van de logic nghiep vu
- **Khong tu dong tinh diem uy tin**: Diem uy tin nhap thu cong, khong tu dong cap nhat tu danh gia
- **Khong lien ket lich dat hang voi phieu nhap**: Lich dat tu dong khong tao phieu nhap

### 3.2 Thieu validation
- Khong validate MST (Mã số thuế) format (10 hoac 13 chu so)
- Khong kiem tra trung lap NCC (cung email/SDT)
- Khong validate gia nhap (cho phep gia am?)

### 3.3 Thieu tinh nang
- Khong co dashboard tong quan NCC (top NCC, NCC co van de)
- Khong co canh bao tu dong khi diem uy tin thap
- Khong co tinh nang gui email/thong bao cho NCC
- Khong co portal cho NCC tu quan ly (NCC xem don hang, cap nhat gia)
- Khong co bao cao chi phi nhap hang theo thoi gian
- Khong co tinh nang dat hang tu dong (auto PO) khi ton kho thap
- Khong co lich su thay doi gia (price trend)
- Khong co tinh nang xuat bao cao cong no
- Khong co workflow duyet thanh toan (require manager approval)

### 3.4 Van de bao mat
- Khong co phan quyen chi tiet (ai duoc xem cong no, ai duoc thanh toan)
- API khong kiem tra vai tro cu the (chi kiem tra la admin)
- File hop dong upload khong co virus scan

## 4. Cong viec can lam (TODOs)

### Uu tien cao
- [ ] Tu dong tinh diem uy tin tu trung binh cac lan danh gia giao hang
- [ ] Validate MST format (10 hoac 13 so, kiem tra check digit)
### Uu tien trung binh
- [ ] Them dashboard NCC: Top 5 NCC tot nhat, NCC co van de, tong cong no
- [ ] Export cong no ra Excel/PDF
- [ ] Them lich su thay doi gia (price trend chart)


