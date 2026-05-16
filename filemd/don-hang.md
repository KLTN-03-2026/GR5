# Module Don Hang (Order Management)

## 1. Tong quan
Module don hang quan ly toan bo vong doi cua don hang tu khi khach dat hang, xac nhan, dong goi, van chuyen den khi giao thanh cong hoac huy/doi tra. He thong co 3 goc nhin: khach hang (store), nhan vien xu ly (staff), va quan tri vien (admin).

## 2. Cac chuc nang hien co

### 2.1 Phia khach hang (Store)

#### Trang danh sach don hang
- **File**: `src/app/(store)/orders/page.tsx`
- Tab loc theo trang thai: Tat ca, Cho xac nhan, Dang giao, Da giao, Da huy, Yeu cau doi tra
- Hien thi so luong don moi tab
- Card don hang: Ma don, ngay tao, trang thai, 2 san pham dau tien, tong tien
- Nut hanh dong: Xem chi tiet, Huy don (neu CHO_XAC_NHAN), Hoan tra (neu DA_GIAO)

#### Trang chi tiet don hang
- **File**: `src/app/(store)/orders/[id]/page.tsx`
- Stepper trang thai voi thanh tien trinh
- Danh sach san pham day du (anh, ten, bien the, so luong, don gia)
- The tom tat thanh toan (nen xanh dam)
- Timeline lich su trang thai
- Tich hop theo doi GHN (neu co ma van don)
- Ngay giao du kien
- Lich su yeu cau doi tra

#### Chuc nang huy don
- Chi cho phep khi trang thai = `CHO_XAC_NHAN`
- Yeu cau xac nhan truoc khi huy
- Cap nhat trang thai thanh `DA_HUY`

#### Chuc nang yeu cau doi tra
- Chi cho phep khi trang thai = `DA_GIAO`
- Form modal: Ly do (dropdown), mo ta chi tiet, upload toi da 5 anh (Base64)
- Tao ban ghi `yeu_cau_doi_tra`
- Cap nhat don hang thanh `YEU_CAU_DOI_TRA`

### 2.2 Phia nhan vien (Staff)

#### Dashboard don hang
- **File**: `src/app/staff/orders/page.tsx`
- KPI cards: Don cho xac nhan, Cho xac nhan CK, Dang giao, Doanh thu hom nay
- Tab da trang thai: Tat ca, Cho xac nhan, Cho giao, Dang giao, Hoan thanh, That bai, Doi tra, Da huy
- Bo loc nang cao: Trang thai, phuong thuc thanh toan (COD/MOMO/VNPAY/BANK), khoang ngay, sap xep
- Tim kiem theo ma don, ten khach, so dien thoai
- Thao tac hang loat: Chon nhieu don va xac nhan thanh toan CK dong thoi
- Xuat CSV (ho tro tieng Viet voi BOM encoding)
- Phan trang 20 don/trang
- Giao dien chia doi: Bang (60%) + Panel xem nhanh (40%)

#### Chi tiet va xu ly don hang
- **File**: `src/app/staff/orders/[id]/page.tsx`
- **Tab Chi Tiet**: Thong tin khach, timeline, thong tin van chuyen, danh sach san pham voi kiem tra ton kho, QR scan
- **Tab Thanh Toan**: Thong tin thanh toan, xac nhan chuyen khoan, VietQR
- **Tab Doi/Tra**: Duyet/tu choi yeu cau doi tra

#### Quy trinh xu ly don hang
1. Kiem tra ton kho → Canh bao neu het hang hoac sap het han (3 ngay)
2. Xac nhan thanh toan (CK can kiem tra thu cong)
3. Dong goi (QR scan tung san pham, hien thi tien trinh)
4. Tao don van chuyen GHN hoac nhap ma van don thu cong
5. Xac nhan giao thanh cong

### 2.3 Phia quan tri (Admin)

#### Quan ly don hang
- **File**: `src/app/admin/orders/page.tsx`
- Bo loc nang cao: Tab trang thai, date picker, tim kiem
- Stat cards: Tong don, Doanh thu, Cho xu ly, Dang giao
- Bang chi tiet: Ma don, khach hang, dia chi, ngay, phuong thuc TT, tong tien, trang thai
- Drawer chi tiet don hang:
  - Timeline don hang
  - Xu ly yeu cau doi tra (Duyet/Tu choi)
  - Danh sach san pham
  - Thong tin khach hang
  - Theo doi thanh toan
  - Tich hop GHN: Tao/huy van don, theo doi, sua ngay giao
  - Cap nhat trang thai
  - Lich su giao dich

### 2.4 API Endpoints
| Endpoint | Method | Chuc nang | File |
|----------|--------|-----------|------|
| `/api/store/orders` | GET | Lay danh sach don cua khach | `src/app/api/store/orders/route.ts` |
| `/api/store/orders` | POST | Tao don hang moi | `src/app/api/store/orders/route.ts` |
| `/api/store/orders` | PUT | Huy don / Yeu cau doi tra | `src/app/api/store/orders/route.ts` |
| `/api/store/orders/[id]` | GET | Chi tiet don hang | `src/app/api/store/orders/[id]/route.ts` |
| `/api/staff/orders` | GET | Danh sach don cho staff | `src/app/api/staff/orders/route.ts` |
| `/api/staff/orders/[id]` | GET | Chi tiet don cho staff | `src/app/api/staff/orders/[id]/route.ts` |
| `/api/staff/orders/[id]` | PATCH | Xu ly don (xac nhan, giao, huy...) | `src/app/api/staff/orders/[id]/route.ts` |
| `/api/admin/orders` | GET | Danh sach don cho admin | `src/app/api/admin/orders/route.ts` |
| `/api/admin/orders/[id]` | GET/PATCH | Chi tiet + cap nhat don | `src/app/api/admin/orders/[id]/route.ts` |

### 2.5 Trang thai don hang (Flow)
```
CHO_XAC_NHAN → DA_XAC_NHAN → CHO_GIAO_HANG → DANG_GIAO_HANG → DA_GIAO → HOAN_THANH
     ↓                                                              ↓
  DA_HUY                                                    YEU_CAU_DOI_TRA
     ↓                                                              ↓
THANH_TOAN_THAT_BAI                                        DA_DUYET_DOI_TRA
```

### 2.6 Models lien quan
- `don_hang` - Don hang chinh (tong tien, phi ship, trang thai, dia chi giao)
- `chi_tiet_don_hang` - Chi tiet san pham trong don
- `lich_su_don_hang` - Lich su thay doi trang thai
- `giao_dich_thanh_toan` - Giao dich thanh toan
- `don_van_chuyen` - Thong tin van chuyen (ma van don, doi tac, trang thai)
- `yeu_cau_doi_tra` - Yeu cau doi/tra hang
- `chi_tiet_doi_tra` - Chi tiet san pham doi tra
- `nhiem_vu_cong_viec` - Nhiem vu gan cho nhan vien xu ly don

## 3. Tinh nang con thieu & Lo hong

### 3.1 Lo hong bao mat nghiem trong
- **Khong xac thuc user khi tao don**: API POST `/api/store/orders` khong kiem tra `ma_nguoi_dung` co khop voi session khong → co the tao don cho nguoi khac
- **Tong tien tu frontend**: Server chap nhan `tong_tien` tu client ma khong tinh lai → de bi thao tung gia
- **Khong kiem tra ton kho khi tao don**: Khong tru ton kho, khong validate so luong kha dung
- **Khong co idempotency key**: Bam nhieu lan co the tao nhieu don trung lap

### 3.2 Thieu validation
- Khong xac thuc quyen so huu khi xem chi tiet don (nguoi khac co the xem don cua minh)
- Khong gioi han so luong anh minh chung doi tra phia server (chi gioi han client)
- Khong validate kich thuoc anh upload (Base64 co the rat lon)
- Ghi chu don hang (`ghi_chu`) khong duoc sanitize → nguy co XSS

### 3.3 Thieu nghiep vu
- Khong co co che hoan tien tu dong khi huy don da thanh toan
- Khong co timeout cho don `CHO_XAC_NHAN` (don co the treo vinh vien)
- Khong gui thong bao (email/SMS) khi trang thai thay doi
- Khong co lich su ai da xu ly don (audit trail)
- Khong co co che thu hoi ma giam gia khi huy don
- Khong co logic xu ly don 1 phan (partial fulfillment)
- Khong co tinh nang in hoa don/phieu giao hang

## 4. Cong viec can lam (TODOs)

### Uu tien cao
- [x] Them kiem tra quyen so huu: chi user dung moi duoc xem/huy/doi tra don cua minh ✅ (09/05/2026)
- [x] Tinh lai tong tien server-side tu chi_tiet_don_hang + phi ship + giam gia ✅ (09/05/2026)
- [x] Tru ton kho khi tao don, hoan lai khi huy ✅ (09/05/2026)
- [x] Them idempotency key de chong tao don trung lap ✅ (09/05/2026)
- [ ] Implement co che timeout: tu dong huy don CHO_XAC_NHAN sau 24h
- [x] Them logic hoan tien tu dong khi huy don da thanh toan online ✅ (09/05/2026)

### Uu tien trung binh
- [ ] Gui email/thong bao khi trang thai don thay doi
- [ ] Them audit trail: ghi lai ai xu ly don, thoi gian, hanh dong
- [x] Validate va gioi han kich thuoc anh doi tra phia server (max 2MB/anh) ✅ (09/05/2026)
- [ ] Sanitize truong ghi_chu chong XSS
- [ ] Them tinh nang in phieu giao hang / hoa don
- [ ] Ho tro huy don 1 phan (partial cancellation)
- [ ] Thu hoi ma giam gia khi don bi huy

### Uu tien thap
- [ ] Them tinh nang dat lai don (reorder tu don cu)
- [ ] Them tinh nang theo doi don realtime (WebSocket)
- [ ] Tich hop danh gia san pham sau khi nhan hang
- [ ] Them bao cao thong ke don hang cho khach (tong chi tieu, so don...)
- [ ] Ho tro xuat hoa don dien tu (e-invoice)

## 5. Chi tiet cac thay doi (09/05/2026)

### 5.1 File: `src/app/api/store/orders/route.ts`
**POST — Tao don hang:**
- Xac thuc session (auth()) — khong cho phep tao don khi chua dang nhap
- Khong nhan `ma_nguoi_dung` va `tong_tien` tu client nua — lay userId tu session, tinh tong tien server-side tu gia bien the trong DB
- Kiem tra ton kho truoc khi tao don (aggregate ton_kho_tong cho tung bien the)
- Tru ton kho theo FEFO (First Expired First Out) — lo gan het han bi tru truoc
- Idempotency key: gui `idempotency_key` tu client, server kiem tra don trung trong 5 phut
- Ghi lich su don hang (CHO_XAC_NHAN) ngay khi tao
- Tra ve loi 409 khi het hang, 401 khi chua dang nhap

**GET — Lay danh sach don:**
- Xac thuc session — khong nhan userId tu query param nua
- Chi tra don hang cua chinh user dang dang nhap

**PUT — Huy don / Doi tra:**
- Xac thuc session + kiem tra quyen so huu (ma_nguoi_dung == session user)
- Tra 403 neu user khong phai chu don
- Huy don: hoan lai ton kho + tao lich_su_hoan_tien neu don da thanh toan online
- Doi tra: validate trang thai DA_GIAO truoc khi cho phep, gioi han anh 2MB + max 5 anh
- Ghi lich su don hang cho ca huy don va doi tra

### 5.2 File: `src/app/api/store/orders/[id]/route.ts`
- Viet lai hoan toan: chi con GET chi tiet 1 don hang
- Xac thuc session + kiem tra quyen so huu
- Include day du: chi_tiet_don_hang, don_van_chuyen, yeu_cau_doi_tra, giao_dich_thanh_toan, lich_su_don_hang

### 5.3 File: `src/app/(store)/payment/page.tsx`
- Bo `ma_nguoi_dung` va `tong_tien` khoi body gui len server
- Them `idempotency_key` de chong double-submit

### 5.4 File: `src/app/(store)/orders/page.tsx`
- GET don hang khong gui userId param nua (server tu lay tu session)

### 5.5 File: `src/components/store/account/Sidebar.tsx`
- Bo userId khoi URL fetch don hang

### 5.6 Fix UI: Cart truyen dung `ma_bien_the` (ID bien the san pham)

**Van de:** Cart items truoc do chi luu `product.id` (ID san pham), nhung API tao don can `ma_bien_the` (ID bien the) de truy xuat gia + tru ton kho chinh xac. Day la bug logic quan trong vi 1 san pham co the co nhieu bien the (VD: Gao 1kg, Gao 5kg).

**Cac file da sua:**
- `src/lib/CartContext.tsx` — Them truong `ma_bien_the: number` vao interface CartItem
- `src/components/store/products/ProductCard.tsx` — Truyen `ma_bien_the` khi add to cart nhanh tu listing
- `src/app/(store)/products/[id]/ProductDetailClient.tsx` — Truyen `selectedVariant.id` khi add to cart tu trang chi tiet
- `src/components/store/products/ProductDetail.tsx` — Tuong tu nhu tren
- `src/app/api/store/products/route.ts` — API listing tra them `ma_bien_the` (ID bien the dau tien)
- `src/app/(store)/products/page.tsx` — Server component truyen `ma_bien_the` cho ProductsClient
- `src/app/(store)/products/ProductsClient.tsx` — Them `ma_bien_the` vao interface ProductData

**Luu y backward-compatible:** API POST don hang van dung `item.ma_bien_the || item.id` lam fallback — gio hang cu (chua co ma_bien_the) van hoat dong duoc, chi la server se dung product.id lam bien_the ID (co the sai neu product co nhieu bien the). User can xoa gio hang cu va them lai de co du lieu dung.

### 5.7 Fix UI: Trang chi tiet don hang `/orders/[id]/page.tsx`

**Van de 1:** Trang client goi `data.success` + `data.order` nhung API cu tra truc tiep object.
- Fix: API `store/orders/[id]` bay gio tra `{ success: true, order: {...} }`

**Van de 2:** Trang hien thi thong tin nguoi nhan tu `order.nguoi_dung.ho_so_nguoi_dung` va `order.nguoi_dung.dia_chi_nguoi_dung[0]` — khong chinh xac vi don hang da luu snapshot dia chi rieng.
- Fix: Uu tien hien thi `order.ho_ten_nguoi_nhan`, `order.sdt_nguoi_nhan`, `order.dia_chi_giao_hang` (snapshot), fallback sang nguoi_dung neu khong co.

**Van de 3:** Trang dung `order.ngay_cap_nhat` — field nay khong ton tai trong model `don_hang`.
- Fix: Dung `order.lich_su_don_hang` (mang timeline) de hien thi lich su trang thai day du thay vi chi 1 dong.

**Van de 4:** Hien thi ten san pham chi dung `bien_the_san_pham.ten_bien_the` — khong ro rang.
- Fix: Hien thi `san_pham.ten_san_pham` + `ten_bien_the` phan cach boi dau "·"

**Van de 5:** API thieu include `nguoi_dung`, `ma_giam_gia` — trang chi tiet can de hien thi giam gia va thong tin khach.
- Fix: Them include `nguoi_dung` (voi ho_so + dia_chi mac dinh) va `ma_giam_gia`

### 5.8 Kiem tra cac trang tai khoan — Ket qua (09/05/2026)

| Trang | File | Ket qua | Ghi chu |
|-------|------|---------|---------|
| Profile | `account/profile/page.tsx` | ✅ OK | Server component, dung auth() + prisma truc tiep |
| Profile Form | `components/store/account/ProfileForm.tsx` | ✅ OK | Dung server action `updateProfile` — co auth |
| Addresses | `account/addresses/page.tsx` | ✅ OK | API da co auth + ownership check |
| Change Password | `account/change-password/page.tsx` | ✅ OK | API `/api/user/change-password` da co auth + rate limit |
| Favorites | `account/favorites/page.tsx` | ✅ OK | API da co auth |
| Notifications | `account/notifications/page.tsx` | ✅ OK | API da co auth |
| Orders list | `account/orders/page.tsx` | ✅ OK | Re-export tu `/orders/page.tsx` — da fix truoc do |
| Order detail | `orders/[id]/page.tsx` | ✅ Fixed | Da fix 5 van de UI (xem tren) |
| Sidebar | `components/store/account/Sidebar.tsx` | ✅ Fixed | Da bo userId khoi fetch URL |
| Layout | `account/layout.tsx` | ✅ OK | Dung auth() redirect neu chua login |

**Tong ket:** Tat ca cac component UI tai khoan nguoi dung deu da:
- Xac thuc session dung cach (hoac qua server component auth(), hoac qua API route auth())
- Khong truyen userId tu client (bo lo hong injection)
- Hien thi du lieu chinh xac tu response API moi
