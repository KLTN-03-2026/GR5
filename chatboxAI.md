# Chatbox AI - Trợ lý mua hàng NôngSản Việt

## Tổng quan

Chatbot AI tên "Freshy" hỗ trợ khách hàng mua nông sản trên website. Dùng **Gemini 2.5 Flash** để hiểu ngữ cảnh và tư vấn sản phẩm dựa trên dữ liệu thực từ database.

## Kiến trúc

```
[User] → ChatbotAI.tsx (Frontend) → /api/chat (API Route) → Gemini AI + Prisma DB
```

### Files liên quan

| File | Vai trò |
|------|---------|
| `src/components/store/chatbot/ChatbotAI.tsx` | Component UI chatbot (floating widget) |
| `src/app/api/chat/route.ts` | API route xử lý tin nhắn, gọi Gemini + query DB |
| `src/app/(store)/layout.tsx` | Import ChatbotAI vào layout store |

## Cách hoạt động

1. **User gửi tin nhắn** → Frontend POST `/api/chat` với `{ message }`
2. **API route**:
   - Query DB lấy danh sách sản phẩm đang bán (tên, giá, danh mục, xuất xứ)
   - Gửi prompt + dữ liệu sản phẩm cho Gemini AI
   - AI trả về JSON: `{ text, productIds[] }`
   - Nếu có productIds → query DB lấy thông tin đầy đủ (ảnh, giá, link)
3. **Frontend nhận** `{ text, products[] }` → hiển thị tin nhắn + card sản phẩm

## Cấu hình cần thiết

### Environment variable (.env)
```
GEMINI_API_KEY=your_gemini_api_key_here
```

Lấy key tại: https://aistudio.google.com/apikey

## Tính năng hiện tại

### 1. Tư vấn sản phẩm thông minh
- Tư vấn sản phẩm dựa trên dữ liệu thực trong DB (query 50 sản phẩm đang bán)
- Trả lời giá cả chính xác theo DB (lấy giá thấp nhất từ biến thể)
- Gợi ý sản phẩm phù hợp (tối đa 3 sản phẩm)
- Gợi ý combo, cách chế biến, bảo quản nông sản
- Nếu không có sản phẩm → thông báo + gợi ý thay thế

### 2. Hiển thị card sản phẩm
- Card sản phẩm với ảnh chính, tên, giá, đơn vị tính
- Click card → chuyển đến trang chi tiết `/products/{id}`
- Hiển thị "Liên hệ" nếu sản phẩm chưa có giá

### 3. Điều hướng trang (Navigate)
- AI nhận biết ý định điều hướng của khách (ví dụ: "đưa tôi đến giỏ hàng", "xem đơn hàng")
- Tự động chuyển trang sau 1.5 giây khi AI trả về navigate URL
- Hiển thị nút "Đi đến trang" để khách có thể click thủ công
- Các trang hỗ trợ: `/products`, `/cart`, `/checkout`, `/account/orders`, `/account/profile`, `/account/addresses`, `/account/favorites`, `/search?q={keyword}`, `/about`, `/farmers`, `/`

### 4. UI/UX
- Floating widget góc phải dưới màn hình
- Animation mượt: slide up khi mở, bounce nhẹ cho nút mở
- Loading indicator (3 chấm nhảy) khi chờ AI trả lời
- Auto scroll xuống tin nhắn mới
- Responsive width 380px, height 580px
- Gradient header xanh lá (emerald)
- Disable input khi đang xử lý, tránh gửi trùng

## Prompt Engineering

- Model: **Gemini 2.5 Flash** (response MIME: `application/json`, temperature: 0.7)
- Persona: "Freshy" — trợ lý bán hàng thân thiện, trả lời tiếng Việt
- Input: message khách + danh sách sản phẩm từ DB (ID, tên, giá, danh mục, xuất xứ)
- Output JSON: `{ text, productIds[], navigate }`
- Quy tắc: trả lời ngắn gọn, tìm sản phẩm trong DB, gợi ý combo/chế biến/bảo quản, điều hướng khi khách yêu cầu

## Những gì đã làm (2026-05-08)

### 1. Thêm Context Memory (lịch sử hội thoại)
- **Frontend** (`ChatbotAI.tsx`): Gửi kèm `history` (10 tin nhắn gần nhất) trong mỗi request
- **Backend** (`/api/chat/route.ts`): Đẩy history vào `contents[]` của Gemini để AI nhớ ngữ cảnh
- Ví dụ: hỏi "cho tôi xem củ khoai" → hỏi tiếp "giá bao nhiêu" → AI vẫn hiểu đang nói về khoai

### 2. Tính phí ship trực tiếp trong chatbot
- **Fast-path**: Regex detect câu hỏi về phí ship (không cần gọi Gemini → tiết kiệm quota)
- **Logic xử lý**:
  - Nếu user đã đăng nhập + có địa chỉ mặc định → tự tính phí ship bằng GHN API
  - Nếu user gửi kèm địa chỉ trong tin nhắn (regex parse phường/quận/tỉnh) → resolve + tính
  - Nếu không có địa chỉ → hỏi lại user kèm ví dụ format
- **Helpers trong `route.ts`**:
  - `resolveGhnWard(tinh, quan, phuong)` — map tên tỉnh/quận/phường sang mã GHN
  - `resolveGhnDistrict(tinh, quan)` — resolve chỉ đến cấp quận (khi user không cung cấp phường)
  - `calcShippingFee(districtId, wardCode, weight)` — gọi GHN fee API
- **Cải thiện (2026-05-08 v2)**:
  - Frontend gửi kèm `cart` summary (totalItems, totalWeight) → tính phí theo weight thực tế thay vì hardcode 1kg
  - Regex parse linh hoạt hơn: hỗ trợ viết tắt `P.`, `Q.`, `TP.` + format chỉ có quận/tỉnh (không phường)
  - Fallback khi GHN API lỗi: trả message rõ ràng + navigate đến `/cart`
  - Thêm rule AI prompt: hướng dẫn user cung cấp địa chỉ, thông tin giao hàng 2-5 ngày
  - Gửi thông tin giỏ hàng vào AI context để Gemini biết khách đang có gì trong giỏ
  - Frontend thêm `formatBotText()` render **bold**, *italic*, line breaks trong response

### 2b. Fix Gemini rate limit (quota exceeded 20 req/min)
- **Vấn đề**: Gemini free tier chỉ 20 req/min → chat liên tục bị "quota exceeded"
- **Giải pháp — thêm nhiều fast-path xử lý local, không cần gọi Gemini**:
  - **Chào hỏi**: regex detect `xin chào`, `hello`, `hi`, `alo`... → response cố định
  - **Điều hướng**: detect ý định + keyword (giỏ hàng, đơn hàng, tài khoản...) → navigate trực tiếp
  - **Tìm/hỏi giá sản phẩm** (khi bị rate limit): query DB bằng keyword → trả product cards
- **Rate limit tracking** (in-memory):
  - `geminiCallTimestamps[]` — track timestamps của mỗi lần gọi Gemini
  - `isRateLimited()` — check nếu >= 18 calls trong 60s → chặn trước khi gọi
  - `recordGeminiCall()` — ghi timestamp mỗi lần gọi thật
- **Ưu tiên xử lý**:
  1. Phí ship → fast-path (GHN API, không cần Gemini)
  2. Chào hỏi → response cố định
  3. Điều hướng → navigate trực tiếp
  4. Hỏi giá/tìm SP + đang bị rate limit → query DB local
  5. Đã rate limit + không match pattern → thông báo user đợi 1 phút
  6. Mọi thứ khác → gọi Gemini
- **Error handling**: Khi Gemini trả 429/quota error → message thân thiện thay vì "đang bận"

### 3. Fix proxy.ts (middleware) bị lỗi 500 toàn app
- **Vấn đề**: proxy.ts import `jose` → Turbopack edge runtime không resolve được → 500 mọi trang
- **Fix**: Thay bằng manual JWT decode dùng `Buffer.from(base64url)` — zero external deps
- Chỉ decode payload (không verify signature) vì môi trường dev/internal

### 4. Fix GHN shipping "to ward not found"
- **Vấn đề gốc**: `/api/ghn/master-data` đọc từ DB local (mã ward từ provinces.open-api.vn ≠ mã GHN sandbox)
- **Fix**: Đổi master-data route gọi trực tiếp GHN API thay vì đọc DB
- **Payment page**: Thêm `resolveGhnCodes()` — khi chọn địa chỉ đã lưu, match tên → lấy mã GHN realtime

### 5. Fix địa chỉ mặc định không trigger tính phí ship
- **Payment page**: Inline async resolve trong useEffect khi load default address
- Trước đó: chỉ tính khi user chọn thủ công, bỏ qua default address

### 6. Xóa fallback tính phí cứng
- File `api/ghn/fee/route.ts`: Bỏ logic fallback flat-rate (30k-65k theo vùng)
- Giờ chỉ dùng GHN API thật — nếu lỗi thì báo lỗi rõ ràng

---

## Sai sót & Kinh nghiệm rút ra

### Sai sót

1. **Import `jose` trong proxy.ts (edge runtime)**
   - Turbopack edge runtime KHÔNG hỗ trợ nhiều npm packages
   - Thử `next-auth/jwt` → lỗi, thử `jose` → cũng lỗi
   - Mất nhiều iteration vòng lặp sửa → test → sửa lại
   - **Bài học**: proxy/middleware chỉ dùng Web APIs + Node built-ins (Buffer, crypto). Không import thư viện ngoài.

2. **GHN_FROM_DISTRICT_ID=1542 không tồn tại**
   - Ban đầu set giá trị không hợp lệ trong .env
   - Phải tra danh sách district thật của GHN sandbox cho Đà Nẵng
   - **Bài học**: Luôn verify mã vùng với GHN API trước khi hardcode vào env

3. **Mã ward khác nhau giữa local DB và GHN sandbox**
   - DB seed dùng dữ liệu từ `provinces.open-api.vn` (ward code: 40101)
   - GHN sandbox dùng mã riêng (cùng phường nhưng code: 40111)
   - **Bài học**: Không tin ward code lưu sẵn — luôn resolve by NAME khi gọi GHN

4. **npm install trong container phá Prisma client**
   - Chạy `npm install react-icons` → xóa `.prisma/client/default` 
   - Phải chạy lại `npx prisma generate`
   - **Bài học**: Sau mỗi npm install trong container → chạy `prisma generate`

5. **Gemini free tier chỉ 20 req/min**
   - Test liên tục bị rate limit → không verify được chatbot
   - **Bài học**: Dùng fast-path cho các query đơn giản (ship fee) để tiết kiệm quota AI

### Kinh nghiệm Docker + Next.js 16

- Next.js 16 dùng `proxy.ts` thay `middleware.ts` (deprecated)
- Hot reload hoạt động cho pages/components, nhưng proxy.ts cần restart container
- Xóa `.next` cache khi đổi config lớn: stop container → `rm -rf .next` → start lại
- Container mount volume từ host → file sửa ngoài host tự reflect trong container
- Port mapping: container 3000 → host 3001

### Kinh nghiệm GHN API sandbox

- Sandbox URL: `https://dev-online-gateway.ghn.vn/shiip/public-api`
- Phí ship sandbox KHÔNG phản ánh thực tế (65k cho nội thành Đà Nẵng)
- Các district hợp lệ Đà Nẵng sandbox: 1526 (Hải Châu), 1527 (Thanh Khê), 1528 (Sơn Trà), 1529 (Ngũ Hành Sơn), 1530 (Liên Chiểu), 1531 (Cẩm Lệ), 1687 (Hòa Vang)
- Ward code sandbox ≠ production → luôn resolve by name, không cache code cứng

---

## TODO / Nâng cấp tương lai

- [ ] Thêm tính năng tra cứu đơn hàng (cần user login)
- [ ] Lưu lịch sử chat vào DB (hiện chỉ lưu trong state frontend)
- [ ] Thêm quick replies (nút gợi ý câu hỏi)
- [ ] Streaming response (hiển thị từng ký tự)
- [x] ~~Context memory (nhớ hội thoại trước đó)~~ — Đã làm (gửi 10 msg gần nhất)
- [x] ~~Tính phí ship trong chatbot~~ — Đã làm (fast-path + GHN API)
- [ ] Cache GHN master data (province/district/ward) để giảm API calls
- [ ] Fallback khi GHN API down (thông báo user thay vì crash)
