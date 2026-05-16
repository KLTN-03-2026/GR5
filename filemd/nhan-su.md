# Module Nhan Su (HR - Human Resources)

## 1. Tong quan
Module nhan su quan ly thong tin nhan vien, phan ca lam viec, cham cong (Face ID), nghi phep, tinh luong, va nhiem vu cong viec. Phuc vu ca goc nhin admin (quan ly toan bo) va staff (tu quan ly ca nhan). Su dung nhan dien khuon mat de xac thuc cham cong.

## 2. Cac chuc nang hien co

### 2.1 Quan ly nhan vien (Admin)
- **Trang**: `src/app/admin/hr/employees/page.tsx`
- **API**: `/api/nhan-vien/route.ts`
- Danh sach nhan vien voi trang thai
- Thong tin ho so: Ho ten, SDT, CCCD, bo phan, chuc vu, anh dai dien
- Thong tin hop dong: Loai hop dong, ngay vao lam, ngay het han
- Luong theo gio
- Gioi tinh, ngay sinh

### 2.2 Phan ca lam viec (Shift Management)
- **Trang**: `src/app/admin/hr/shifts/page.tsx`
- **API**: `/api/phan-ca/route.ts`
- GET: Lay lich ca theo khoang ngay (`tu_ngay`, `den_ngay`)
- POST: Phan ca cho nhieu nhan vien dong thoi
- Phat hien xung dot:
  - Khong phan ca cho nguoi dang nghi phep (da duyet)
  - Khong phan ca trung ngay
- Ca lam viec: Sang (06:00-14:00), Chieu (14:00-22:00)

### 2.3 Cham cong (Attendance)
- **Trang**: `src/app/admin/hr/attendance/page.tsx`
- **Model**: `lich_su_cham_cong`
- Phuong thuc xac thuc: Face ID (mac dinh)
- Ghi nhan: Gio vao, gio ra, so phut tre
- Trang thai: CHUA_VAO, DA_VAO, DA_RA
- Lien ket voi ca lam viec

### 2.4 Nghi phep (Leave Management)

#### Phia Admin
- **Trang**: `src/app/admin/hr/leave/page.tsx`
- Duyet/tu choi don xin nghi
- Xem tat ca don nghi cua nhan vien
- Ghi ly do tu choi

#### Phia Staff
- **File**: `src/app/staff/hr/HRClient.tsx` (tab Nghi Phep)
- **API**: `/api/nghi-phep/route.ts`
- Loai nghi: Phep nam, nghi benh, khong luong, nghi le, viec rieng
- Form gui don: Loai nghi, ngay bat dau/ket thuc, ly do
- Tu dong tinh so ngay nghi
- Hien thi so ngay phep con lai
- Lich su don nghi voi trang thai (cho duyet/da duyet/tu choi)
- Validation: Ngay ket thuc >= ngay bat dau, khong chon ngay qua khu

### 2.5 Tinh luong (Payroll)
- **Trang**: `src/app/admin/hr/payroll/page.tsx`
- **API**: `/api/luong/route.ts`
- **Model**: `bang_luong_thang`
- Tinh luong theo thang:
  - `tong_gio_thuc_te` - Tong gio lam
  - `luong_co_ban` = gio lam * luong_theo_gio
  - `phu_cap_ca_toi` - Phu cap ca dem
  - `thuong_chuyen_can` - Thuong khong nghi
  - `khau_tru_tre` - Tru tien di tre
  - `thuc_nhan` = luong_co_ban + phu_cap + thuong - khau_tru
- Co the chot luong (`da_chot = true`)
- Rang buoc unique: [ma_nguoi_dung, thang, nam]

### 2.6 Nhiem vu cong viec (Tasks)
- **Trang**: `src/app/admin/hr/tasks/page.tsx`
- **API**: `/api/task/route.ts`
- **Model**: `nhiem_vu_cong_viec`
- Gan nhiem vu cho nhan vien (VD: xu ly don hang)
- Trang thai: CHUA_THUC_HIEN, DANG_THUC_HIEN, HOAN_THANH
- Lien ket voi don hang (neu co)

### 2.7 Giao dien Staff (Tu quan ly)
- **File**: `src/app/staff/hr/HRClient.tsx`
- **Cac tab**:
  - **Lich Ca**: Lich ca lam viec theo tuan, chi bao ngay nghi/dang lam/sap toi
  - **Nghi Phep**: Gui don + xem lich su
  - **Doi Mat Khau**: Form doi mat khau voi kiem tra do manh
  - **Face ID**: Dang ky/cap nhat/xoa du lieu khuon mat

### 2.8 Models lien quan
- `ho_so_nguoi_dung` - Ho so NV (ho_ten, SDT, CCCD, bo_phan, chuc_vu, luong_theo_gio, loai_hop_dong, ngay_vao_lam)
- `ca_lam_viec` - Dinh nghia ca (ten_ca, gio_bat_dau, gio_ket_thuc)
- `lich_phan_cong_ca` - Lich phan ca (nguoi_dung, ca_lam, ngay_lam_viec)
- `lich_su_cham_cong` - Cham cong (gio_vao, gio_ra, so_phut_tre, phuong_thuc_xac_thuc)
- `don_xin_nghi` - Don nghi (loai_nghi, ngay_bat_dau, ngay_ket_thuc, trang_thai, ly_do_tu_choi)
- `bang_luong_thang` - Bang luong (thang, nam, cac khoan thu nhap/khau tru, da_chot)
- `nhiem_vu_cong_viec` - Nhiem vu (loai_nhiem_vu, trang_thai, thoi_gian_giao/hoan_thanh)

## 3. Tinh nang con thieu & Lo hong

### 3.1 Van de nghiem trong
- **Nhan vien khong xem duoc luong**: Staff khong co giao dien xem chi tiet luong cua minh
- **So ngay phep hardcode**: Hien thi "5 ngay" co dinh, khong tinh toan thuc te tu don da duyet
- **Khong co lich su cham cong cho staff xem**: NV khong tu kiem tra duoc gio vao/ra
- **Khong co overtime tracking**: Khong tinh gio lam them
- **Khong co chinh sach phep nam theo tham nien**: Tat ca NV cung so ngay phep

### 3.2 Thieu validation
- Khong kiem tra trung ca khi phan ca (cung nguoi, cung ngay, khac ca)
- Khong gioi han so ngay nghi lien tiep toi da
- Khong kiem tra so ngay phep con truoc khi duyet
- Khong validate ngay vao lam vs ngay het han hop dong
- Khong co xac thuc 2 buoc khi sua thong tin luong

### 3.3 Thieu tinh nang quan trong
- Khong co phieu luong (pay stub) de nhan vien xem
- Khong co tinh nang huy don nghi dang cho
- Khong co tinh nang doi ca (shift swap) giua nhan vien
- Khong co dang ky lich lam viec uu tien
- Khong co thong bao khi duyet/tu choi don nghi
- Khong co bao cao cham cong tong hop
- Khong co quan ly hop dong (gia han, cham dut)
- Khong co KPI/danh gia hieu suat
- Khong co quan ly phuc loi (bao hiem, thuong le)
- Khong co tinh nang in bang luong hang loat
- Khong co tich hop BHXH/thue TNCN

### 3.4 Van de UX
- Giao dien staff khong responsive tren mobile
- Khong co offline mode cho quet QR/Face ID o kho
- Khong co dark mode

## 4. Cong viec can lam (TODOs)

### Uu tien cao
- [ ] Them giao dien xem luong cho staff (chi tiet tung thang, khong cho sua)
- [ ] Tinh so ngay phep con lai tu thuc te (tong phep nam - so ngay da dung)
- [ ] Them giao dien lich su cham cong cho staff tu xem
- [ ] Kiem tra so du phep truoc khi duyet don nghi
- [ ] Them thong bao khi don nghi duoc duyet/tu choi

### Uu tien trung binh
- [ ] Implement overtime tracking (gio lam > gio ca = OT)
- [ ] Them chinh sach phep nam theo tham nien (VD: 1-3 nam: 12 ngay, >3 nam: 15 ngay)
- [ ] Them tinh nang huy don nghi dang cho duyet
- [ ] Them tinh nang doi ca giua nhan vien (can 2 ben dong y)
- [ ] Tao phieu luong PDF cho tung nhan vien
- [ ] Them bao cao cham cong tong hop (theo thang, theo phong ban)
- [ ] Them quan ly hop dong (canh bao sap het han)

### Uu tien thap
- [ ] Tich hop tinh BHXH, thue TNCN vao bang luong
- [ ] Them KPI/he thong danh gia hieu suat
- [ ] Ho tro tu dong lich ca (auto-scheduling dua tren uu tien NV)
- [ ] Them mobile-responsive cho giao dien staff
- [ ] Tich hop thong bao push/email cho lich ca moi
- [ ] Them bao cao nang suat nhan vien (so don xu ly, thoi gian trung binh)
- [ ] Ho tro in bang luong hang loat (all-in-one PDF)
