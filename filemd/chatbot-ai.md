# Module Chatbot AI (Tro Ly Mua Sam)

## 1. Tong quan
Module chatbot AI "Freshy" cung cap tro ly mua sam thong minh cho khach hang, su dung Google Gemini 2.5 Flash de tra loi cau hoi, goi y san pham, tinh phi ship, va dieu huong nguoi dung. Ket hop fast-path (xu ly nhanh khong can AI) va AI-powered responses voi nhan biet ngu canh gio hang.

## 2. Cac chuc nang hien co

### 2.1 Giao dien chatbot
- **File**: `src/components/store/chatbot/ChatbotAI.tsx`
- Nut bot noi (fixed bottom-right) voi animation bounce
- Cua so chat truot len (380x580px)
- Phan biet tin nhan bot/nguoi dung
- Hien thi "dang go..." khi cho phan hoi
- Card san pham trong chat voi link xem nhanh
- Nut dieu huong cho cac trang goi y

### 2.2 Backend API
- **File**: `src/app/api/chat/route.ts`
- Endpoint: POST `/api/chat`
- Rate limiting: Toi da 18 cuoc goi Gemini/phut (in-memory tracker)
- Gui context gio hang (so luong, trong luong) cho AI
- Inject catalog 50 san pham dang ban voi gia + mo ta
- Lich su hoi thoai: Gui toi 10 tin nhan truoc cho AI

### 2.3 Fast-path Responses (Khong can AI)

#### Tinh phi van chuyen
- Nhan dien dia chi tu tin nhan (Phuong X, Quan Y, TP Z)
- Goi GHN API de resolve ward codes
- Tinh phi ship dua tren gio hang hien tai (trong luong)
- Tra ve phi + thoi gian giao du kien

#### Chao hoi don gian
- Regex detect "xin chao", "hello", "hi"...
- Tra loi chao mung co san

#### Dieu huong thong minh
- Detect tu khoa va chuyen huong:
  - "gio hang" → `/cart`
  - "thanh toan" → `/checkout`
  - "don hang" → `/account/orders`
  - "tai khoan" / "profile" → `/account/profile`
  - "dia chi" → `/account/addresses`
  - "yeu thich" → `/account/favorites`
  - "nong dan" → `/farmers`
  - "gioi thieu" → `/about`
  - "tim kiem {keyword}" → `/search?q={keyword}`

#### Tim kiem san pham co ban
- Query database tim san pham theo tu khoa
- Tra ve toi da 3 san pham voi anh/gia
- Hien thi dang card trong chat

### 2.4 AI-powered Responses (Google Gemini)
- Goi y san pham dua tren hoi thoai
- Tu van: Cach bao quan, che bien, dinh duong
- Hoi gia san pham
- Nhan biet ngu canh tu gio hang va dia chi mac dinh
- Format response: JSON voi text + san pham goi y (max 3) + URL dieu huong

### 2.5 Kho tri thuc AI
- **Model**: `kho_tri_thuc_ai`
- Luu tru noi dung van ban va vector du lieu
- Phan loai theo loai_du_lieu va ma_thuc_the
- Phuc vu cho RAG (Retrieval-Augmented Generation) trong tuong lai

### 2.6 Phien chat
- **Model**: `phien_chat_ai` + `tin_nhan_chat_ai`
- Luu tru lich su chat theo phien
- Lien ket voi nguoi dung (neu da dang nhap)

### 2.7 Models lien quan
- `phien_chat_ai` - Phien chat (ma_phien_chat, ma_nguoi_dung)
- `tin_nhan_chat_ai` - Tin nhan (vai_tro_nguoi_gui, noi_dung)
- `kho_tri_thuc_ai` - Kho tri thuc (loai_du_lieu, noi_dung_van_ban, vector)

## 3. Tinh nang con thieu & Lo hong

### 3.1 Van de ky thuat
- **Khong luu phien chat**: Reset khi tai lai trang → mat lich su hoi thoai
- **Rate limiter in-memory**: Restart server = reset counter, khong chia se giua instances
- **Khong co fallback khi Gemini down**: Neu API Gemini loi, khong co phan hoi thay the tot
- **Catalog hardcode 50 SP**: Khong tu dong cap nhat khi san pham thay doi
- **Khong handle concurrent requests**: Nhieu nguoi hoi cung luc co the vuot rate limit

### 3.2 Thieu tinh nang
- Khong co chuyen sang nhan vien that (human handoff)
- Khong co tinh nang theo doi don hang qua chat
- Khong co suggested questions (cau hoi goi y)
- Khong co phan hoi danh gia chat luong bot (thumbs up/down)
- Khong co tinh nang dat hang truc tiep qua chat
- Khong co hinh anh/voice input
- Khong co lich su chat khi quay lai (persistent history)
- Khong tich hop voi he thong thong bao
- Khong co admin dashboard theo doi hoi thoai

### 3.3 Van de bao mat
- Khong validate input length (co the gui tin nhan cuc dai)
- Khong sanitize output tu AI (co the bi prompt injection)
- API key Gemini trong env nhung khong co fallback key
- Khong co rate limit per user (chi global)

### 3.4 Van de UX
- Cua so chat co dinh, khong resize duoc
- Khong co typing indicator cua user
- Khong ho tro markdown trong phan hoi
- Khong co sound notification khi co tin nhan moi

## 4. Cong viec can lam (TODOs)

### Uu tien cao
- [ ] Luu lich su chat vao database (su dung model phien_chat_ai da co)
- [ ] Them rate limiting per user (khong chi global) - su dung user session
- [ ] Them fallback response khi Gemini API loi (message co san huu ich)
- [ ] Validate + gioi han do dai input (max 500 ky tu)
- [ ] Tu dong cap nhat catalog san pham (moi 1h hoac khi co thay doi)

### Uu tien trung binh
- [ ] Them tinh nang "Chuyen sang nhan vien" khi bot khong tra loi duoc
- [ ] Them suggested questions dau cuoc tro chuyen
- [ ] Them tinh nang theo doi don hang qua chat ("Don hang cua toi dang o dau?")

### Uu tien thap
- [ ] Ho tro gui hinh anh (nhan dien san pham tu anh)
- [ ] Them tinh nang dat hang nhanh qua chat
- [ ] Tich hop thong bao push khi bot co phan hoi (neu user tat cua so)
