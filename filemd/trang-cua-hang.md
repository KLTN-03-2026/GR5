# Module Trang Cua Hang (Store Frontend)

## 1. Tong quan
Module trang cua hang bao gom cac trang public phuc vu khach hang: Trang chu, gioi thieu, trang nong dan (farmers marketplace), va layout chung cua store. Day la bo mat chinh cua ung dung, noi khach hang tuong tac voi thuong hieu "NongSan Viet".

## 2. Cac chuc nang hien co

### 2.1 Trang chu (Homepage)
- **File**: `src/app/(store)/page.tsx`
- **Hero Carousel**: Banner dong tu CMS (`/api/admin/content`)
- **2 loai san pham noi bat**:
  - Tuoi moi ngay: Rau cu, trai cay, nam, rau gia vi → Giao 2h noi thanh Da Nang
  - Dac san: Nuoc mam, gao, gia vi, ca phe, hai san kho → Giao toan quoc 2-3 ngay
- **Cam ket giao hang**:
  - Giao 2h noi thanh Da Nang (don tu 150k)
  - Giao 4-6h khu vuc lan can (phi 25k)
  - Giao 2-3 ngay toan quoc (san pham kho)
- **Product grid**: 12 san pham noi bat voi tags (tuoi hom nay, moi, ban chay)
- **Newsletter**: Dang ky email nhan goi y thuc don hang tuan
- **Trust bar**: 0% hoa chat doc hai, 100% truy xuat QR, 24h doi tra
- **Bento section**: Gioi thieu su menh, khuyen mai don dau

### 2.2 Trang nong dan (Farmers)
- **File**: `src/app/(store)/farmers/page.tsx`
- Trang marketing/storytelling (khong ban hang truc tiep)
- **6 ho so nong dan** (hardcoded) voi:
  - Avatar, anh nong trai, ten, tuoi, dia phuong
  - San pham chuyen canh, chung chi (VietGAP, Organic, GlobalGAP)
  - Quote (loi chia se)
  - Cau chuyen day du
  - % tang thu nhap (VD: +320%)
  - Rating, so danh gia
  - Tags: Bestseller, Top rated, Rising star, Heritage
- **Sections**:
  - Hero parallax scrolling
  - Stats bar: 300+ nong trai, 70% thu nhap nong dan, 6 tinh, 4.8★
  - Grid card nong dan (responsive 3/2/1 col)
  - Featured story: "Mot ngay cua Chu Tam"
  - Cam ket: "Ban mua, nong dan duoc loi"
- **Modal chi tiet**: Anh lon, stats, quote, cau chuyen, san pham
- **Animation**: Fade-in on scroll, parallax, hover effects

### 2.3 Trang B2B(không làm) (bỏ)
- **File**: `src/app/(store)/b2b/page.tsx`
- Trang "Coming Soon" (placeholder)
- Preview tinh nang sap co:
  - Dat hang so luong lon (50kg+/tuan)
  - Hoa don VAT tu dong
  - Hop dong quy voi gia co dinh
- CTA: Lien he doi B2B qua email

### 2.4 Trang gioi thieu (About)
- **File**: `src/app/(store)/about/page.tsx`
- Gioi thieu ve su menh cong ty
- Gia tri cot loi

### 2.5 Layout Store
- **File**: `src/app/(store)/layout.tsx`
- Header voi navigation: Trang chu, San pham, Danh muc, Nong dan
- Gio hang icon voi badge so luong
- User menu (dang nhap/dang ky hoac tai khoan)
- Footer: Thong tin cong ty, lien ket, social media
- Chatbot AI "Freshy" (fixed button)
- Responsive design

### 2.6 Models lien quan
- `banner_quang_cao` - Banner homepage (tieu_de, mo_ta, anh, lien_ket, loai, thu_tu, thoi_han)
- `san_pham` - San pham hien thi tren homepage
- `danh_muc` - Danh muc cho navigation

## 3. Tinh nang con thieu & Lo hong

### 3.1 Van de noi dung
- **Nong dan hardcoded**: Du lieu 6 nong dan nam trong code, khong quan ly duoc tu admin
- **Khong co blog/tin tuc**: Thieu noi dung SEO va gia tri cho khach

### 3.2 Van de SEO & Performance
- Khong co meta tags dong cho moi trang
- Khong co sitemap.xml tu dong
- Khong co robots.txt toi uu
- Hinh anh san pham tu Unsplash (khong optimize, khong self-hosted)
- Khong co ISR/revalidation cho trang tinh
- Khong co Schema.org structured data
- Khong co Open Graph tags cho chia se social

### 3.3 Thieu tinh nang
- Khong co tinh nang tim kiem tren homepage
- Khong co personalization dua tren vi tri/lich su
- Khong co recently viewed products
- Khong co "Flash Deal" section
- Khong co countdown timer cho khuyen mai
- Khong co social proof (so nguoi dang xem, so da mua)
- Khong co live chat/support widget (ngoai chatbot AI)
- Khong co multi-language support
- Khong co dark mode
- Khong co PWA support (offline, install)

### 3.4 Van de UX
- Homepage khong co lazy loading cho hinh anh phia duoi
- Khong co skeleton loading khi fetch san pham
- Khong co back-to-top button
- Khong co breadcrumb navigation
- Newsletter khong co backend xu ly (chi UI)

## 4. Cong viec can lam (TODOs)

### Uu tien cao
- [ ] Chuyen du lieu nong dan vao database + tao admin CRUD (thay vi hardcode)
- [ ] Them meta tags dong cho moi trang (title, description, OG tags)
- [ ] Them sitemap.xml va robots.txt tu dong (next-sitemap)
- [ ] Them trang tim kiem voi ket qua realtime

### Uu tien trung binh
- [ ] Them ISR cho trang san pham va danh muc (revalidate moi 5 phut)
- [ ] Them backend xu ly newsletter (luu email vao DB, gui email chao mung)
- [ ] Them lazy loading hinh anh + skeleton loading

### Uu tien thap
- [ ] Them recently viewed products section
- [ ] Them back-to-top button va breadcrumb navigation
