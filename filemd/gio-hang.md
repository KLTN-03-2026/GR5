# Module Gio Hang (Shopping Cart)

## 1. Tong quan
Module gio hang quan ly trang thai gio hang cua khach hang, luu tru trong localStorage, ho tro them/xoa/cap nhat so luong san pham, ap dung ma giam gia, tinh phi van chuyen tu dong, va dong bo gio hang giua guest va user da dang nhap.

## 2. Cac chuc nang hien co

### 2.1 Cart Context (State Management)
- **File**: `src/lib/CartContext.tsx`
- Su dung React Context + localStorage
- Luu tru voi 2 key:
  - `verdant_cart_guest` - Gio hang khach vang lai
  - `verdant_cart_{email}` - Gio hang nguoi dung da dang nhap
- Tu dong merge gio hang guest vao user cart khi dang nhap
- Cac function chinh:
  - `addToCart()` - Them san pham (merge neu cung bien the)
  - `removeFromCart()` - Xoa theo product ID + variant
  - `updateQuantity()` - Cap nhat so luong (1-99)
  - `clearCart()` - Xoa toan bo gio hang
  - `applyVoucher()` - Ap dung ma giam gia
  - `removeVoucher()` - Huy ma giam gia

### 2.2 Trang gio hang
- **File**: `src/app/(store)/cart/page.tsx`
- Giao dien 2 cot: San pham (trai) + Tom tat (phai)
- Stepper so luong (-/+) voi gioi han 1-99
- Hien thi giam gia inline (text do)
- Banner tien trinh mien phi van chuyen
- Quan ly voucher: Ap dung, huy, xem danh sach kha dung
- Tinh toan tu dong:
  ```
  Tam tinh = TONG(gia_ban * so_luong)
  Phi ship = tam_tinh >= 500,000 ? 0 : 30,000
  Giam gia = theo quy tac coupon
  Tong = tam_tinh - giam_gia (toi thieu 0)
  ```

### 2.3 He thong ma giam gia (Voucher)
- Kiem tra don toi thieu (`don_toi_thieu`)
- 2 loai giam gia:
  - `TIEN_MAT` - Giam so tien co dinh
  - `PHAN_TRAM` - Giam theo % voi gioi han toi da (`giam_toi_da`)
- Tu dong tinh lai khi gia tri gio hang thay doi
- Hien thi danh sach voucher kha dung voi dieu kien ap dung
- API lay voucher: `/api/coupons`

### 2.4 Nguong mien phi van chuyen
- Tu dong mien phi ship khi don >= 500,000 VND
- Hien thi thanh tien trinh (progress bar) cho khach biet con thieu bao nhieu

### 2.5 Models lien quan
- `gio_hang` - Gio hang (1-1 voi nguoi_dung, co the lien ket ma_giam_gia)
- `chi_tiet_gio_hang` - Chi tiet san pham trong gio (ma_bien_the, so_luong)
- `ma_giam_gia` - Ma giam gia (ma_code, loai, gia_tri, dieu kien, thoi han)
- `bien_the_san_pham` - Thong tin bien the (ten, gia_ban, gia_goc, don_vi_tinh)

## 3. Tinh nang con thieu & Lo hong

### 3.1 Van de bao mat & Logic
- **Gio hang chi o localStorage**: Khong dong bo len server → mat khi xoa browser data
- **Khong validate gia server-side**: Gia san pham luu o client co the bi thao tung
- **Khong kiem tra ton kho**: Them vao gio khong kiem tra con hang hay khong
- **Voucher chi validate client-side**: Khong co validation phia server khi dat hang → de bi ap dung voucher het han/da su dung
- **Khong co gioi han so san pham**: Gio hang co the chua vo han loai san pham
- **Race condition**: 2 tab co the ghi de localStorage cua nhau

### 3.2 Thieu tinh nang
- Khong co tinh nang "Mua sau" (Save for Later)
- Khong co tinh nang chia se gio hang
- Khong co canh bao khi san pham trong gio het hang hoac thay doi gia
- Khong co gio hang server-side cho nguoi dung da dang nhap
- Khong tinh trong luong de uoc tinh phi ship chinh xac
- Khong co tinh nang so sanh san pham
- Khong hien thi thoi gian giao du kien tren trang gio hang

### 3.3 UX can cai thien
- Khong co animation khi them/xoa san pham
- Khong co nut "Them tat ca vao gio" tu danh sach yeu thich
- Khong co mini-cart (dropdown nho o header)
- Khong co dem nguoc het han voucher
- Khong hien thi so luong ton kho con lai

## 4. Cong viec can lam (TODOs)

### Uu tien cao
- [ ] Validate voucher server-side khi tao don hang (khong chi o client)
- [ ] Them canh bao khi san pham trong gio da het hang hoac thay doi gia
- [ ] Dong bo gio hang len server cho user da dang nhap (su dung model `gio_hang`)
- [ ] Validate gia san pham server-side khi checkout (tinh lai tu database)

### Uu tien trung binh
- [ ] Them gioi han so luong san pham theo ton kho thuc te
- [ ] Hien thi tinh trang con hang/het hang cho tung san pham trong gio
- [ ] Canh bao khi voucher sap het han

### Uu tien thap
- [ ] Them animation khi them/xoa san pham
- [ ] Hien thi so luong ton kho con lai ben canh stepper
