# Module San Pham (Product Management)

## 1. Tong quan
Module san pham quan ly danh muc san pham nong san, bao gom thong tin san pham, bien the (kich thuoc/dong goi), hinh anh, danh muc, the tu khoa, chung chi chat luong, danh gia khach hang va SEO. Phuc vu ca giao dien khach hang (duyet/mua) va admin (quan ly CRUD).

## 2. Cac chuc nang hien co

### 2.1 Trang san pham (Store - Khach hang)

#### Trang danh sach san pham
- **File**: `src/app/(store)/products/page.tsx` + `ProductsClient.tsx`
- Loc server-side theo: Danh muc (cha + con), khoang gia, danh gia, xuat xu (nhieu gia tri)
- Sap xep: Moi nhat, gia tang/giam, danh gia
- Phan trang: 6 san pham/trang
- Card san pham: Ten, xuat xu, anh chinh, gia khuyen mai/gia goc, badge giam gia, rating, nut them gio
- Sidebar bo loc: Cay danh muc, xuat xu (tu database), thanh truot gia, rating sao

#### Trang chi tiet san pham
- **File**: `src/app/(store)/products/[id]/page.tsx` + `ProductDetailClient.tsx`
- Gallery anh voi thumbnail slider
- Thong tin: Ten, mo ta, xuat xu
- Nhieu bien the/SKU voi gia va don vi khac nhau (kg, 500g, hop...)
- Tinh giam gia tu gia_goc vs gia_ban
- Danh gia: Rating trung binh, 5 danh gia moi nhat (da duyet), anh danh gia, phan hoi admin
- Nguoi dung co the danh gia neu da mua
- San pham lien quan: 3 san pham cung danh muc
- Kiem tra lich su mua hang truoc khi cho phep danh gia

#### Trang danh muc
- **File**: `src/app/(store)/categories/[id]/page.tsx`
- Redirect nhe: `/categories/[id]` → `/products?category=[id]`

### 2.2 Quan ly san pham (Admin)

#### Trang quan ly
- **File**: `src/app/admin/products/page.tsx`, `src/app/admin/products/[id]/page.tsx`
- Danh sach san pham voi tim kiem, loc trang thai
- Chi tiet/chinh sua: Thong tin, bien the, hinh anh, SEO

#### API Admin
| Endpoint | Method | Chuc nang |
|----------|--------|-----------|
| `/api/admin/products` | GET | Danh sach san pham (search, filter, pagination) |
| `/api/admin/products` | POST | Tao san pham moi |
| `/api/admin/products/[id]` | GET | Chi tiet san pham |
| `/api/admin/products/[id]` | PUT | Cap nhat san pham |
| `/api/admin/products/[id]` | DELETE | Xoa san pham |
| `/api/admin/categories` | GET/POST | CRUD danh muc |
| `/api/admin/categories/[id]` | PUT/DELETE | Cap nhat/xoa danh muc |
| `/api/admin/reviews` | GET | Danh sach danh gia |
| `/api/admin/reviews/[id]` | PATCH | Duyet/tu choi/phan hoi danh gia |

### 2.3 He thong danh gia
- **Trang admin**: `src/app/admin/reviews/page.tsx`
- **API**: `/api/admin/reviews/route.ts`, `/api/admin/reviews/[id]/route.ts`
- Khach danh gia 1-5 sao + noi dung + toi da nhieu anh
- Admin duyet/tu choi danh gia
- Admin phan hoi danh gia
- Chi nguoi da mua moi duoc danh gia
- Trang thai: DA_DUYET (mac dinh), CHO_DUYET, TU_CHOI

### 2.4 San pham yeu thich (Wishlist)
- **File**: `src/app/(store)/account/favorites/page.tsx`
- Phan trang 12 san pham/trang
- Sap xep: Moi nhat, cu nhat, gia tang/giam
- Tim kiem client-side theo ten/danh muc
- Chon nhieu + xoa hang loat
- Hien thi trang thai ton kho (het hang)
- Them vao gio tu wishlist

### 2.5 Khuyen mai & Ma giam gia
- **Trang**: `src/app/admin/promotions/page.tsx`
- **API**: `/api/admin/promotions/route.ts`, `/api/admin/promotions/[id]/route.ts`
- Quan ly ma giam gia: Tao, sua, xoa, kich hoat/vo hieu
- Thuoc tinh: ma_code, loai (TIEN_MAT/PHAN_TRAM), gia_tri, don_toi_thieu, gioi_han_su_dung, thoi han
- Co the ap dung cho bien the cu the

### 2.6 Quan ly noi dung (CMS)
- **Trang**: `src/app/admin/content/page.tsx`
- **API**: `/api/admin/content/route.ts`, `/api/admin/content/[id]/route.ts`
- Quan ly banner quang cao (hero, sidebar, popup)
- Thuoc tinh: tieu_de, mo_ta, anh, lien_ket, thu_tu, thoi gian hoat dong

### 2.7 Models lien quan
- `san_pham` - San pham chinh (ten, mo_ta, xuat_xu, trang_thai, SEO)
- `bien_the_san_pham` - Bien the (ma_sku, ten, don_vi_tinh, gia_ban, gia_goc)
- `anh_san_pham` - Hinh anh (duong_dan, la_anh_chinh)
- `danh_muc` - Danh muc phan cap (cha-con)
- `the_san_pham` + `the_tu_khoa` - Tag/The tu khoa
- `chung_chi_san_pham` - Chung chi (VietGAP, Organic...)
- `danh_gia_san_pham` - Danh gia khach hang
- `anh_danh_gia` - Anh kem danh gia
- `san_pham_yeu_thich` - Danh sach yeu thich
- `ma_giam_gia` - Ma khuyen mai
- `banner_quang_cao` - Banner CMS

## 3. Tinh nang con thieu & Lo hong

### 3.1 Van de bao mat & Logic
- **Khong hien thi ton kho realtime**: Khach khong biet con hang hay khong truoc khi dat
- **Khong kiem tra quyen danh gia**: API co the bi goi truc tiep ma khong can da mua
- **Khong rate limit danh gia**: 1 nguoi co the spam nhieu danh gia
- **Hinh anh san pham khong optimize**: Khong resize/compress khi upload
- **SEO chua day du**: Meta tags co nhung chua co structured data (JSON-LD)

### 3.2 Thieu tinh nang
- Khong co lich su gia san pham (price history)
- Khong co tinh nang so sanh san pham
- Khong co "Thuong mua cung" (frequently bought together)
- Khong co thong bao khi san pham het hang co lai (back in stock)
- Khong co san pham theo mua vu (seasonal products)
- Khong co tinh nang "Flash Sale" / dat gia theo thoi gian
- Khong co bulk import/export san pham (Excel/CSV)
- Khong co tinh nang nhan xet hoi dap (Q&A section)
- Khong co video san pham
- Khong co bien the ket hop (VD: kich thuoc + mau sac)
- Khong co min/max order quantity per bien the

### 3.3 Van de UX
- Trang danh muc chi redirect, khong co landing page rieng
- Khong co quick view (xem nhanh san pham)
- Khong co breadcrumb navigation
- Khong co bo loc theo chung chi (VietGAP, Organic)
- Khong co "Recently Viewed" (san pham da xem)

## 4. Cong viec can lam (TODOs)

### Uu tien cao
- [x] Hien thi trang thai ton kho tren trang san pham (Con hang / Het hang / Con X san pham)
  - Hien thi badge "Con hang" / "Chi con X san pham" (<=10) / "Het hang"
  - Disable nut mua & bien the het hang
  - File: `products/[id]/page.tsx`, `ProductDetailClient.tsx`
- [x] Validate server-side: chi user da mua moi duoc danh gia (kiem tra don DA_GIAO)
  - Check trang_thai in ["DA_GIAO", "HOAN_THANH"]
  - File: `api/store/reviews/route.ts`, `products/[id]/page.tsx`
- [x] Them gioi han: moi user chi danh gia 1 lan/san pham
  - Da co san: API tra 409 neu user da danh gia
  - File: `api/store/reviews/route.ts`
- [x] Optimize hinh anh khi upload (resize max 1200px, compress WebP)
  - Dung sharp: resize 1200px, convert WebP quality 80%
  - File: `api/admin/upload/route.ts`
- [x] Them structured data JSON-LD cho san pham (ho tro Google Rich Results)
  - Schema.org Product: name, image, brand, offers, aggregateRating
  - File: `products/[id]/page.tsx`

### Uu tien trung binh
- [ ] Them landing page cho danh muc (mo ta, banner, san pham noi bat)
- [ ] Them tinh nang "San pham lien quan" thong minh hon (dua tren hanh vi mua)
- [ ] Them tinh nang "Thong bao khi co hang" (back in stock notification)
- [ ] Them bo loc theo chung chi (VietGAP, Organic, GlobalGAP)
- [ ] Them breadcrumb navigation tren trang san pham
- [ ] Them quick view popup tren danh sach san pham

### Uu tien thap
- [ ] Them tinh nang so sanh san pham (max 3-4 san pham)
- [ ] Ho tro san pham subscription (giao hang dinh ky)
