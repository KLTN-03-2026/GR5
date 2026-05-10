# Module Quan Tri He Thong (System Administration)

## 1. Tong quan
Module quan tri he thong bao gom dashboard tong quan, quan ly khach hang, phan quyen vai tro, quan ly noi dung (banner/CMS), upload file, va cac tien ich he thong. Cung cap goc nhin toan canh hoat dong kinh doanh cho admin.

## 2. Cac chuc nang hien co

### 2.1 Dashboard Tong Quan (Overview)
- **Trang**: `src/app/admin/overview/page.tsx`
- **API**: `/api/admin/overview/route.ts`
- KPI cards chinh:
  - Lo hang sap het han
  - Don cho xac nhan
  - Don da giao
  - Doanh thu
- KPI phu: Tong san pham, tong khach hang, ton kho thap, tong don hang
- Loc theo thoi gian: Hom nay, Tuan nay, Thang nay
- Bieu do:
  - Area chart: Doanh thu theo ngay + so don hang overlay
  - Pie chart: Phan bo doanh thu theo danh muc
  - Breakdown trang thai don hang
  - Top san pham ban chay
  - Danh sach don hang gan day

### 2.2 Quan ly khach hang
- **Trang**: `src/app/admin/customers/page.tsx`, `src/app/admin/customers/[id]/page.tsx`
- **API**: `/api/admin/customers/route.ts`, `/api/admin/customers/[id]/route.ts`
- Bang khach hang phan trang (15/trang)
- Tim kiem theo ten, email, SDT
- Sap xep: Moi nhat, chi tieu cao nhat
- Phan loai khach hang: VIP, Trung thanh, Moi (dua tren chi tieu/so don)
- KPI: Tong KH, KH moi thang nay, Ti le mua lai
- Panel chi tiet:
  - Tong chi tieu, so don, don da giao, trung binh/don
  - Thong tin ca nhan
  - Don hang gan nhat
  - Trang thai tai khoan (Active/Blocked)
- Xuat Excel

### 2.3 He thong phan quyen (RBAC)
- **File**: `src/lib/rbac.ts`
- **Models**: `vai_tro`, `vai_tro_nguoi_dung`, `chi_tiet_phan_quyen`, `quyen_han`, `chuc_nang_he_thong`, `phan_he_he_thong`
- Cau truc phan quyen:
  - Phan he → Chuc nang → Quyen (Xem/Them/Sua/Xoa)
  - Nguoi dung → Vai tro → Chi tiet quyen
- Vai tro co ban: ADMIN, STAFF, CUSTOMER
- Kiem tra quyen tai component level

### 2.4 Layout & Navigation
- **Sidebar**: `src/components/admin/layout/AdminSidebar.tsx`
  - Menu phan cap voi submenu (HR section)
  - Dark theme, branding Verdant
  - Role badge, user footer, logout
  - Menu items: Overview, Products, Warehouse, Suppliers, Orders, Customers, Categories, Payments, Content, Promotions, Reviews, HR
- **Topbar**: `src/components/admin/layout/AdminTopbar.tsx`
  - Tieu de trang dong (theo route)
  - O tim kiem
  - Notification bell (dot do)
  - Profile button

### 2.5 Quan ly noi dung (CMS)
- **Trang**: `src/app/admin/content/page.tsx`
- **API**: `/api/admin/content/route.ts`, `/api/admin/content/[id]/route.ts`
- Banner quang cao: hero, sidebar, popup
- Thuoc tinh: Tieu de, mo ta, anh, lien ket, thu tu, thoi gian hieu luc

### 2.6 Upload file
- **API**: `/api/admin/upload/route.ts`
- Upload hinh anh san pham, banner, avatar
- Luu duong dan vao `quan_ly_file_tai_len`

### 2.7 He thong thong bao
- **Model**: `thong_bao`
- Thong bao in-app (tieu_de, noi_dung, loai_thong_bao, da_doc)
- Hien thi tren topbar voi dot do (chua doc)

### 2.8 API Endpoints chinh
| Endpoint | Chuc nang |
|----------|-----------|
| `/api/admin/overview` | Du lieu dashboard |
| `/api/admin/customers` | CRUD khach hang |
| `/api/admin/content` | CRUD banner/CMS |
| `/api/admin/upload` | Upload file |
| `/api/admin/seed-reviews` | Seed data danh gia (dev) |

### 2.9 Thu vien & Tien ich
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/auth.ts` - Cau hinh NextAuth
- `src/lib/rbac.ts` - He thong kiem tra quyen
- `src/lib/format.ts` - Format tien te, ngay thang
- `src/lib/utils.ts` - Tien ich chung
- `src/lib/constants.ts` - Hang so he thong
- `src/lib/api-response.ts` - Chuan hoa response API
- `src/lib/api.ts` - HTTP client wrapper
- `src/lib/axios.ts` - Axios instance

## 3. Tinh nang con thieu & Lo hong

### 3.1 Van de bao mat nghiem trong
- **RBAC chua duoc ap dung day du**: He thong phan quyen co trong DB nhung khong kiem tra o moi API route
- **Khong co audit log**: Khong ghi lai ai lam gi, khi nao (quan trong cho compliance)
- **Khong co 2FA cho admin**: Tai khoan admin chi can email/password → nguy hiem
- **Khong co IP whitelist cho admin panel**: Bat ky ai cung truy cap duoc /admin
- **Session admin khong co thoi gian idle timeout rieng**: Dung chung 30 phut voi user thuong

### 3.2 Thieu tinh nang quan tri
- Khong co quan ly vai tro/quyen dong (UI de tao/sua vai tro)
- Khong co bao cao phan tich nang cao (custom date range, export)
- Khong co notification management (gui thong bao push/email cho nhom KH)
- Khong co system settings page (cau hinh he thong: email, API keys, thresholds)
- Khong co activity log (lich su hoat dong cua admin)
- Khong co backup/restore data
- Khong co health check/monitoring dashboard
- Khong co batch operations (import/export hang loat)

### 3.3 Van de dashboard
- Du lieu chi realtime khi tai trang (khong tu dong refresh)
- Khong co custom date range (chi Today/Week/Month)
- Khong co so sanh voi ky truoc (month-over-month, year-over-year)
- Khong co alert/threshold tuy chinh

### 3.4 Van de UX
- Topbar co o tim kiem nhung khong co chuc nang global search
- Notification bell khong co dropdown list thong bao
- Khong co dark mode cho admin
- Khong responsive tren tablet/mobile

## 4. Cong viec can lam (TODOs)

### Uu tien cao
- [ ] Ap dung RBAC middleware cho tat ca API routes admin (kiem tra quyen cu the)
- [ ] Them audit log: Ghi lai moi hanh dong admin (ai, lam gi, luc nao, doi tuong nao)
- [ ] Them trang quan ly vai tro/quyen (UI tao/sua/xoa vai tro + gan quyen)

### Uu tien trung binh
- [ ] Implement global search (tim kiem don hang, KH, san pham tu 1 o)
- [ ] Them activity log (lich su hanh dong cua tung admin)

### Uu tien thap
- [ ] Ho tro batch import/export (san pham, KH, don hang)
- [ ] Them tinh nang gui push notification cho nhom khach hang
