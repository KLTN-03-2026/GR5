# Module Tai Khoan Nguoi Dung (User Account)

## 1. Tong quan
Module tai khoan nguoi dung cung cap cac chuc nang tu quan ly cho khach hang sau khi dang nhap: cap nhat ho so ca nhan, quan ly dia chi giao hang, danh sach yeu thich, doi mat khau, va quan ly Face ID. Giao dien duoc to chuc trong layout `/account/*`.

## 2. Cac chuc nang hien co

### 2.1 Ho so ca nhan (Profile)
- **File**: `src/app/(store)/account/profile/page.tsx`
- Cap nhat thong tin: Ho ten, SDT, email, gioi tinh, ngay sinh
- Upload anh dai dien (avatar)
- Fetch du lieu tu session + database
- API: `/api/store/account/profile` (GET/PUT), `/api/store/account/profile/avatar` (POST)

### 2.2 Quan ly dia chi (Addresses)
- **File**: `src/app/(store)/account/addresses/page.tsx`
- CRUD dia chi giao hang day du
- Cascading dropdown: Tinh → Quan → Phuong (du lieu tu GHN API)
- Luu ma GHN (ma_tinh, ma_quan_huyen, ma_phuong_xa) cho tinh phi ship chinh xac
- Dat dia chi mac dinh
- Fields: Ho ten, SDT, dia chi chi tiet, tinh, quan, phuong
- Modal animated voi validation
- Preview dia chi day du
- API: `/api/store/account/addresses` (GET/POST/PUT/DELETE)

### 2.3 Danh sach yeu thich (Favorites/Wishlist)
- **File**: `src/app/(store)/account/favorites/page.tsx`
- Phan trang 12 san pham/trang voi pagination controls
- Sap xep: Moi nhat, cu nhat, gia tang/giam
- Tim kiem client-side theo ten/danh muc
- Chon nhieu san pham + xoa hang loat (bulk delete)
- Card san pham: Anh (hover zoom), tag danh muc, rating, gia (giam gia neu co)
- Chi bao "Het hang" cho san pham khong con
- Hanh dong: Them vao gio (redirect sang chi tiet), xoa khoi wishlist
- Empty state voi CTA mua sam
- API: `/api/store/account/favorites` (GET/POST/DELETE)

### 2.4 Doi mat khau (Change Password)
- **File**: `src/app/(store)/account/change-password/page.tsx`
- **2 tab giao dien**:

#### Tab Mat khau
- Form: Mat khau hien tai, mat khau moi, xac nhan mat khau
- Toggle hien/an mat khau (eye icon)
- Do manh mat khau realtime (visual bar + label)
- Validation: Toi thieu 6 ky tu, goi y 8+ voi chu hoa + so
- Error/success messages
- API: `/api/user/change-password` (POST)

#### Tab Face ID
- Hien thi trang thai dang ky (Da dang ky / Chua dang ky)
- Dynamic import thu vien face recognition
- Nut dang ky/cap nhat Face ID
- Nut xoa Face ID (voi xac nhan)
- Huong dan 5 buoc (emoji visual timeline)
- API: `/api/user/face-data` (GET/POST/DELETE)

### 2.5 Lich su don hang (Account Orders)
- **File**: `src/app/(store)/account/orders/page.tsx`, `src/app/(store)/account/orders/[id]/page.tsx`
- Xem danh sach don hang cua minh
- Xem chi tiet don hang

### 2.6 Layout tai khoan
- **File**: `src/app/(store)/account/layout.tsx`
- Sidebar navigation: Profile, Dia chi, Don hang, Yeu thich, Doi mat khau
- Responsive layout

### 2.7 Models lien quan
- `nguoi_dung` - Tai khoan (email, mat_khau, trang_thai)
- `ho_so_nguoi_dung` - Ho so (ho_ten, SDT, anh_dai_dien, gioi_tinh, ngay_sinh)
- `dia_chi_nguoi_dung` - Dia chi (chi_tiet, tinh, quan, phuong, ma GHN, la_mac_dinh)
- `san_pham_yeu_thich` - Wishlist (ma_nguoi_dung, ma_san_pham, unique pair)
- `du_lieu_khuon_mat` - Vector khuon mat (1-1 voi user)

## 3. Tinh nang con thieu & Lo hong

### 3.1 Van de bao mat
- **Khong xac thuc mat khau cu phia server khi doi MK**: Can verify current password truoc khi cho doi
- **Khong vo hieu session khi doi mat khau**: Session cu van dung duoc
- **Khong gioi han so lan doi mat khau**: Co the spam API
- **Profile update khong validate du**: SDT khong check format, ngay sinh khong check hop le
- **API dia chi khong kiem tra quyen so huu**: Co the doc/sua dia chi cua nguoi khac

### 3.2 Thieu tinh nang
- Khong co xoa tai khoan (right to be forgotten - GDPR)
- Khong co export du lieu ca nhan (data portability)
- Khong co lich su hoat dong tai khoan
- Khong co thong bao (notification center)
- Khong co cai dat thong bao (email preferences)
- Khong co tinh nang lien ket/huy lien ket tai khoan social
- Khong co xac thuc email khi doi email
- Khong co avatar crop/resize truoc khi upload
- Khong co so dia chi toi da (nguoi dung co the tao vo han)

### 3.3 Van de UX
- Khong co breadcrumb trong account pages
- Password strength meter chi visual, khong bat buoc
- Khong co toast notification nhat quan (mot so dung alert())
- Khong co loading skeleton khi fetch data
- Khong co confirm khi roi trang co data chua luu

## 4. Cong viec can lam (TODOs)

### Uu tien cao
- [x] Xac thuc mat khau hien tai phia server truoc khi cho doi mat khau
- [x] Vo hieu hoa tat ca session sau khi doi mat khau thanh cong
- [x] Kiem tra quyen so huu khi CRUD dia chi (chi user dung moi duoc sua/xoa)
- [x] Validate format SDT (10-11 so, bat dau 0)  phia server
- [x] Gioi han so dia chi toi da moi user (VD: 5 dia chi)

### Uu tien trung binh
- [ ] Them tinh nang xoa tai khoan (vo hieu hoa + xoa du lieu sau 30 ngay)
- [ ] Them xac thuc email khi thay doi email
- [x] Them rate limiting cho API doi mat khau (3 lan/5 phut)
- [x] Them notification center (danh sach thong bao, cai dat)
- [ ] Them avatar crop/resize truoc khi upload (client-side)
- [x] Them confirm dialog khi roi trang chua luu

### Uu tien thap
- [ ] Them cai dat email preferences (nhan thong bao don hang, khuyen mai...)
- [ ] Them tinh nang lien ket/huy tai khoan Google/Facebook
- [x] Them loading skeleton cho tat ca trang account

---

## 5. Ghi chu tien do (Cap nhat: 2026-05-09)

### Da hoan thanh

#### Uu tien cao (5/5)

1. **Xac thuc mat khau hien tai phia server**
   - File: `src/app/api/user/change-password/route.ts`
   - Da co san: dung `bcrypt.compare(oldPassword, user.mat_khau)` truoc khi cho doi

2. **Vo hieu hoa session sau khi doi mat khau**
   - File: `src/app/api/user/change-password/route.ts` — tra ve `forceLogout: true`
   - File: `src/app/(store)/account/change-password/page.tsx` — goi `signOut()` sau 2 giay, redirect ve `/login`

3. **Kiem tra quyen so huu dia chi (ownership check)**
   - File: `src/app/api/store/account/addresses/route.ts`
   - Them helper `verifyOwnership(addressId, userId)` — kiem tra `ma_nguoi_dung` cua dia chi co khop voi user hien tai
   - PUT va DELETE tra ve 403 neu dia chi khong thuoc user
   - GET chi tra dia chi cua user dang dang nhap

4. **Validate SDT phia server**
   - Regex: `/^0\d{9,10}$/` (10-11 so, bat dau bang 0)
   - Ap dung tai:
     - `src/app/api/store/account/addresses/route.ts` (POST + PUT)
     - `src/app/api/store/account/profile/route.ts` (POST)
     - `src/app/actions/profile.ts` (server action)
   - Them validate ngay sinh (khong qua tuong lai, tuoi 10-120)
   - Client-side: validate SDT trong form dia chi truoc khi gui

5. **Gioi han toi da 5 dia chi/user**
   - Server: `src/app/api/store/account/addresses/route.ts` — kiem tra count truoc khi create, tra 400 neu >= 5
   - Client: `src/app/(store)/account/addresses/page.tsx` — toast error khi nhan "Them dia chi" ma da du 5

#### Uu tien trung binh (3/6)

6. **Rate limiting API doi mat khau (3 lan / 5 phut)**
   - File: `src/app/api/user/change-password/route.ts`
   - In-memory Map: key = userId, value = {count, firstAttempt}
   - Tra ve HTTP 429 khi vuot qua gioi han
   - Reset sau khi doi thanh cong

7. **Notification center**
   - API: `src/app/api/store/account/notifications/route.ts`
     - GET: phan trang, loc unread, tra ve unreadCount
     - PUT: action "read" (1 thong bao) va "read-all" (tat ca) — co kiem tra quyen so huu
   - Page: `src/app/(store)/account/notifications/page.tsx`
     - Hien thi danh sach thong bao voi icon theo loai (don_hang, khuyen_mai, he_thong)
     - Danh dau da doc khi click, nut "Doc tat ca"
     - Time ago (vua xong, X phut truoc, X gio truoc...)
   - Sidebar: them link "Thong bao" voi icon Bell mau vang

8. **Confirm dialog khi roi trang chua luu**
   - Hook: `src/hooks/shared/useUnsavedChanges.ts` — dung `beforeunload` event
   - Tich hop vao ProfileForm — set `isDirty=true` khi thay doi input, reset khi luu thanh cong

#### Uu tien thap (1/3)

9. **Loading skeleton**
   - File: `src/components/shared/LoadingSkeleton.tsx`
   - Cac component: `Skeleton`, `ProfileSkeleton`, `AddressSkeleton`, `NotificationSkeleton`
   - CSS animation: `skeleton-shimmer` keyframe trong `globals.css`

### Kiem tra UI sau khi thay doi API (2026-05-09)

Da kiem tra tat ca component UI lien quan. **Ket qua: Khong co gi bi vo.**

| Component | API tuong ung | Ket qua |
|-----------|--------------|---------|
| `addresses/page.tsx` | `/api/store/account/addresses` (GET/POST/PUT/DELETE) | OK — payload khop, phone regex khop, max 5 xu ly 2 phia |
| `change-password/page.tsx` | `/api/user/change-password` (POST) | OK — gui oldPassword/newPassword, xu ly forceLogout + rate limit 429 |
| `ProfileForm.tsx` | `actions/profile.ts` (server action) | OK — validate SDT + ngay sinh, useUnsavedChanges tich hop |
| `Sidebar.tsx` | — | OK — them link Thong bao (Bell icon) vao nav |
| `notifications/page.tsx` | `/api/store/account/notifications` (GET/PUT) | OK — phan trang, doc 1/doc tat ca, ownership check |
| `LoadingSkeleton.tsx` | — | OK — 4 skeleton component + CSS animation |
| `useUnsavedChanges.ts` | — | OK — beforeunload event, cleanup dung |

### Chua lam

- Xoa tai khoan (can thiet ke flow: vo hieu hoa → cron job xoa sau 30 ngay)
- Xac thuc email khi doi email (can gui mail xac nhan)
- Avatar crop/resize (can thu vien nhu react-cropper)
- Email preferences (can them bang cai dat thong bao trong DB)
- Lien ket/huy tai khoan Google/Facebook (can UI + API unlink OAuth)
