# Module Xac Thuc (Authentication)

## 1. Tong quan
Module xac thuc quan ly toan bo quy trinh dang nhap, dang ky, khoi phuc mat khau va xac thuc sinh trac hoc (Face ID) cho he thong. Su dung NextAuth.js v5 voi chien luoc JWT, tich hop dang nhap qua Google, Facebook, email/mat khau va nhan dien khuon mat.

## 2. Cac chuc nang hien co

### 2.1 Trang frontend (Client Components)
| Route | Chuc nang | File |
|-------|-----------|------|
| `/login` | Dang nhap bang email/mat khau | `src/app/(auth)/login/page.tsx` |
| `/register` | Dang ky tai khoan moi | `src/app/(auth)/register/page.tsx` |
| `/login/face-id` | Dang nhap bang nhan dien khuon mat | `src/app/(auth)/login/face-id/page.tsx` |
| `/register/face-id` | Dang ky du lieu khuon mat | `src/app/(auth)/register/face-id/page.tsx` |
| `/forgot-password` | Yeu cau khoi phuc mat khau | `src/app/(auth)/forgot-password/page.tsx` |
| `/verify-otp` | Xac thuc ma OTP | `src/app/(auth)/verify-otp/page.tsx` |
| `/reset-password` | Dat mat khau moi | `src/app/(auth)/reset-password/page.tsx` |

### 2.2 API Routes
| Endpoint | Method | Chuc nang | File |
|----------|--------|-----------|------|
| `/api/auth/[...nextauth]` | ALL | Handler NextAuth | `src/app/api/auth/[...nextauth]/route.ts` |
| `/api/auth/register` | POST | Dang ky tai khoan | `src/app/api/auth/register/route.ts` |
| `/api/auth/forgot-password` | POST | Gui OTP qua email | `src/app/api/auth/forgot-password/route.ts` |
| `/api/auth/verify-otp` | POST | Xac thuc OTP | `src/app/api/auth/verify-otp/route.ts` |
| `/api/auth/reset-password` | POST | Cap nhat mat khau | `src/app/api/auth/reset-password/route.ts` |
| `/api/auth/face-login` | POST/GET | Xac thuc khuon mat | `src/app/api/auth/face-login/route.ts` |

### 2.3 Phuong thuc xac thuc
- **Email/Mat khau**: Bcrypt hash 10 rounds, xac thuc qua Prisma
- **Google OAuth**: Tu dong tao tai khoan + ho so + gan vai tro CUSTOMER
- **Facebook OAuth**: Tuong tu Google OAuth
- **Face ID**: face-api.js (TinyFaceDetector), nguong Euclidean distance < 0.5, JWT token 30 giay

### 2.4 Quy trinh OTP
- Ma 6 chu so ngau nhien (100000-999999)
- Luu trong bang `ma_otp` voi thoi han 5 phut
- Gui qua Nodemailer (Gmail SMTP)
- Tu dong xoa OTP cu truoc khi tao moi
- Xoa OTP sau khi xac thuc thanh cong (su dung 1 lan)

### 2.5 Cau hinh NextAuth
- Session strategy: JWT
- Session max age: 30 phut
- Providers: Credentials, Face ID, Google, Facebook
- Callback: Gan roles vao JWT token
- Redirect theo vai tro: ADMIN → `/admin/overview`, STAFF → `/staff`

### 2.6 Models lien quan
- `nguoi_dung` - Tai khoan nguoi dung (email, mat_khau, trang_thai)
- `vai_tro_nguoi_dung` - Gan vai tro cho nguoi dung
- `vai_tro` - Danh sach vai tro (ADMIN, STAFF, CUSTOMER)
- `du_lieu_khuon_mat` - Vector khuon mat (1-1 voi nguoi_dung)
- `ma_otp` - Ma xac thuc tam thoi
- `ho_so_nguoi_dung` - Thong tin ca nhan
- `lich_su_dang_nhap` - Lich su dang nhap

### 2.7 Thu vien su dung
- `next-auth` v5 - Framework xac thuc
- `bcryptjs` - Hash mat khau
- `jsonwebtoken` - JWT cho Face ID token
- `nodemailer` - Gui email OTP
- `face-api.js` - Nhan dien khuon mat phia client

## 3. Tinh nang con thieu & Lo hong

### 3.1 Van de nghiem trong
- **Khong co Rate Limiting**: Cac endpoint login/register/OTP khong gioi han so lan goi → de bi tan cong brute force
- **Khong co Middleware bao ve route**: Khong co file `middleware.ts` de chan truy cap trai phep o edge level
- **Thieu cau hinh email**: Bien moi truong `EMAIL_USER` va `EMAIL_PASS` chua duoc thiet lap → OTP se khong gui duoc
- **Face ID khong co Liveness Detection**: De bi lua boi anh hoac video → can kiem tra do sau hoac yeu cau quay dau
- **OTP luu dang plaintext**: Nen hash ma OTP truoc khi luu vao database

### 3.2 Van de bao mat
- **Mat khau yeu**: Chi yeu cau toi thieu 6 ky tu, khong bat buoc chu hoa/thuong/so/ky tu dac biet
- **Khong co lich su mat khau**: Nguoi dung co the dat lai mat khau giong mat khau cu
- **Session khong bi vo hieu khi doi mat khau**: Phien dang nhap cu van con hieu luc
- **Du lieu khuon mat khong ma hoa**: Luu dang JSON plaintext trong database
- **Khong co CAPTCHA**: Form dang ky/dang nhap de bi bot spam
- **Khong kiem tra thiet bi/vi tri**: Khong co canh bao dang nhap tu thiet bi la

### 3.3 Thieu tinh nang
- Khong co "Remember Me" thuc su (checkbox ton tai nhung khong hoat dong)
- Khong co co che refresh token
- Khong co xac thuc 2 yeu to (2FA) ngoai Face ID
- Khong co kha nang khoa tai khoan sau nhieu lan dang nhap that bai
- Khong co log theo doi dang nhap that bai
- Khong co canh bao hoat dong dang ngo
- Dang ky khong yeu cau xac thuc email truoc
- Khong co dong y dieu khoan su dung va chinh sach bao mat

## 4. Cong viec can lam (TODOs)

### Uu tien cao
- [x ] Them rate limiting (5 lan/phut cho login, 3 lan/phut cho OTP)
- [x ] Tao file `middleware.ts` bao ve cac route `/admin/*`, `/staff/*`, `/account/*`
- [ x] Cau hinh bien moi truong email (EMAIL_USER, EMAIL_PASS)
- [ x] Them liveness detection cho Face ID (yeu cau nhay mat/quay dau)
- [ x] Hash ma OTP truoc khi luu database
- [ x] Bat buoc mat khau manh (toi thieu 8 ky tu, bao gom chu hoa + so + ky tu dac biet)

### Uu tien trung binh
- [ ] Them CAPTCHA (Google reCAPTCHA) vao form dang ky/dang nhap
- [ ] Them co che refresh token de keo dai phien
- [ ] Ghi log lich su dang nhap (thanh cong va that bai)

### Uu tien thap
- [ ] Them tinh nang huy lien ket tai khoan social
- [ ] Canh bao dang nhap tu thiet bi/vi tri moi
