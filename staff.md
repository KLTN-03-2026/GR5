# Thiết Kế Lại: Quản Lý Đơn Hàng — NôngSản

> **Phiên bản:** 2.0 · **Vai trò:** NV Vận Hành · **Môi trường:** Web Desktop

---

## 1. Vấn Đề Của Giao Diện Cũ

| #   | Vấn đề                                                                             | Mức độ     |
| --- | ---------------------------------------------------------------------------------- | ---------- |
| 1   | Cảnh báo tồn kho & trạng thái đơn nằm lẫn lộn, khó phân biệt                       | Cao        |
| 2   | Bảng điều khiển (sidebar phải) không có thứ tự ưu tiên hành động rõ ràng           | Cao        |
| 3   | Tab trạng thái (Chờ xác nhận / Đã thanh toán...) không hiển thị số lượng trực quan | Trung bình |
| 4   | Màu sắc tuỳ tiện, không có hệ thống semantic (đỏ / vàng / xanh không nhất quán)    | Trung bình |
| 5   | Thiếu hierarchy thông tin — mọi thứ cùng kích thước chữ                            | Thấp       |
| 6   | Nút hành động chính (Xác nhận / Huỷ) không đủ rõ sự khác biệt về mức độ nguy hiểm  | Cao        |

---

## 2. Nguyên Tắc Thiết Kế Mới

### 2.1 Color Semantic System

```
✅ Xanh lá  (#3B6D11 / bg: #EAF3DE) → Thành công, đã xác nhận, đủ hàng
⚠️ Vàng      (#BA7517 / bg: #FAEEDA) → Cần hành động, chờ xử lý
🔴 Đỏ        (#A32D2D / bg: #FCEBEB) → Lỗi, cảnh báo nghiêm trọng, thiếu hàng
🔵 Xanh dương (#185FA5 / bg: #E6F1FB) → Thông tin, chuyển khoản
⬜ Xám        (#5F5E5A / bg: #F1EFE8) → Trung tính, chờ giao hàng
```

### 2.2 Typography Scale

```
Tiêu đề trang    → 20px / weight 600
Tiêu đề section  → 15px / weight 600
Nhãn / label     → 12px / weight 500 / uppercase / letter-spacing 0.06em
Body text        → 14px / weight 400
Số tiền          → 16px / weight 600 / font-mono
Mã đơn           → 13px / font-mono
```

### 2.3 Spacing Grid

- Base unit: `4px`
- Component padding: `16px / 20px`
- Section gap: `12px`
- Card border-radius: `10px`

---

## 3. Layout Tổng Thể

```
┌─────────────────────────────────────────────────────────────┐
│  TOPBAR: Logo · Tìm kiếm · Thông báo · Avatar              │
├──────────┬──────────────────────────────────────────────────┤
│          │  BREADCRUMB: Đơn hàng > #DH1001                 │
│ SIDEBAR  ├──────────────────────────────────────────────────┤
│          │  ALERT BANNER (nếu có vấn đề tồn kho)           │
│ • Kho    ├─────────────────────────────┬────────────────────┤
│ • Đơn    │                             │  BẢNG ĐIỀU KHIỂN  │
│   hàng ◀ │  THÔNG TIN ĐƠN HÀNG        │                    │
│ • Cá     │  (main content)             │  Trạng thái        │
│   nhân   │                             │  → Hành động       │
│          │                             │                    │
└──────────┴─────────────────────────────┴────────────────────┘
```

**Tỷ lệ cột:** Sidebar `220px` · Main `auto` · Control Panel `300px`

---

## 4. Màn Hình 1: Danh Sách Đơn Hàng

### 4.1 Header Section

```
┌──────────────────────────────────────────────────────────────┐
│ Quản Lý Đơn Hàng                          [ + Tạo đơn mới ] │
│ Xác nhận thanh toán và xử lý đơn hàng                       │
├──────────────────────────────────────────────────────────────┤
│ 🔵 Có 1 đơn chờ xác nhận chuyển khoản MB Bank (0935462720)  │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Tab Bar (Redesign)

Thay vì text đơn thuần, mỗi tab hiển thị **badge số lượng inline**:

```
[ ⏳ Chờ xác nhận  2 ] [ ✅ Đã thanh toán  1 ] [ 🚚 Chờ giao  0 ] [ ✓ Đã giao  0 ] [ ⚠ Thất bại  1 ]
                ^^^                       ^^^                                                      ^^^
           pill màu vàng            pill màu xanh                                         pill màu đỏ
```

**Quy tắc màu badge:**

- `Chờ xác nhận` → Amber bg
- `Đã thanh toán` → Green bg
- `Chờ giao / Đã giao` → Gray bg
- `Thất bại` → Red bg

### 4.3 Bảng Đơn Hàng

**Cột:** Mã Đơn · Khách Hàng · Sản Phẩm · Phương Thức TT · Trạng Thái · Tổng Tiền · Thời Gian · Thao Tác

**Cải tiến so với cũ:**

| Cũ                                      | Mới                                                |
| --------------------------------------- | -------------------------------------------------- |
| Trạng thái: text badge "Chờ thanh toán" | Badge có icon: `⏳ Chờ thanh toán`                 |
| Tổng tiền: `345,000đ` màu cam           | Tổng tiền: `345.000 ₫` màu mực, font-mono          |
| Thời gian: "10 phút trước"              | Thời gian: "08/05 09:17" + tooltip "10 phút trước" |
| Nút "Chi tiết" link text                | Nút `[ Chi tiết → ]` outline button                |

**Row hover state:** Highlight nền `#F1EFE8` + hiện action buttons

---

## 5. Màn Hình 2: Chi Tiết Đơn Hàng #DH1001

### 5.1 Alert Banner (Cảnh Báo Tồn Kho)

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  Cảnh báo trước khi xác nhận                                 │
│                                                                  │
│  • Cải Kale Khủng Long: yêu cầu 5 bó, kho còn 3 bó  [Xem kho] │
│  • Lô Dâu Tây hết hạn sau 2 ngày — ưu tiên xuất trước          │
└─────────────────────────────────────────────────────────────────┘
```

**Màu:** Background `#FAEEDA` (Amber 50) · Border-left `4px solid #BA7517` · Icon `⚠️`  
**Nút "Xem kho":** Link nhỏ màu amber dẫn đến module Quản Lý Kho

### 5.2 Layout 2 Cột

```
┌─────────────────────────────────────┬──────────────────────────┐
│  THÔNG TIN ĐƠN HÀNG                 │  BẢNG ĐIỀU KHIỂN         │
│  #DH1001                            │                          │
│                                     │  ┌──────────────────┐   │
│  Khách hàng                         │  │ Trạng thái       │   │
│  Trần Đại Nghĩa · 0901234567        │  │ ⏳ Chờ thanh toán │   │
│                                     │  └──────────────────┘   │
│  Giao đến                           │                          │
│  123 Đường Rau Sạch, Phường Xanh,  │  Bước tiếp theo:        │
│  Đà Nẵng                            │  Kiểm tra thanh toán,   │
│                                     │  tồn kho → xác nhận đơn │
│  Ghi chú của khách                  │                          │
│  "Giao giờ hành chính,              │  [ ✅ Xác nhận đơn hàng ]│
│   gọi trước khi đến"                │  [ ❌ Huỷ & Hoàn tiền  ] │
│                                     │                          │
│  ─────────────────────────────────  │  Tab: Thanh Toán ●       │
│  DANH SÁCH SẢN PHẨM                 │  [xem chi tiết CK]       │
│                                     │                          │
│  Dâu tây Đà Lạt VietGAP (500g) x2  │                          │
│  Kho: 15 ✅                         │                          │
│                                     │                          │
│  Cải Kale Khủng Long (300g) x5      │                          │
│  Kho: 3 ⚠️ Thiếu 2 bó              │                          │
└─────────────────────────────────────┴──────────────────────────┘
```

### 5.3 Danh Sách Sản Phẩm (Chi Tiết)

Mỗi dòng sản phẩm hiển thị:

```
┌────────────────────────────────────────────────────────────┐
│ [IMG]  Dâu tây Đà Lạt chuẩn VietGAP (Hộp 500g)    × 2   │
│        SKU: DT-500G                                        │
│        Kho còn: 15  ✅ Đủ hàng                   85.000 ₫ │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ [IMG]  Cải Kale Khủng Long (Bó 300g)              × 5    │
│        SKU: CK-300G                                        │
│        Kho còn: 3  ⚠️ Thiếu 2 bó               175.000 ₫ │
└────────────────────────────────────────────────────────────┘
                                           ──────────────────
                                 Tạm tính:       260.000 ₫
                                 Phí giao hàng:   15.000 ₫
                                 ──────────────────────────
                                 Tổng cộng:       275.000 ₫
```

**Trạng thái tồn kho inline:**

- `✅ Đủ hàng` → text màu `#3B6D11`
- `⚠️ Thiếu N bó` → text màu `#BA7517` + tooltip giải thích

### 5.4 Bảng Điều Khiển — Nút Hành Động

```
TRẠNG THÁI HIỆN TẠI
┌─────────────────────────────┐
│  ⏳  Chờ xác nhận           │
│  Tiền mặt · 10 phút trước   │
└─────────────────────────────┘

HÀNH ĐỘNG
┌─────────────────────────────┐
│ ✅ Xác nhận đơn hàng        │  ← Primary: nền xanh đậm (#3B6D11), text trắng
└─────────────────────────────┘

┌─────────────────────────────┐
│ ❌ Huỷ đơn & Hoàn tiền      │  ← Danger: border đỏ, text đỏ, nền trắng
└─────────────────────────────┘
    ↑ Nhấn sẽ mở confirm dialog
```

**Confirm Dialog trước khi Huỷ:**

```
┌──────────────────────────────────────────┐
│  Xác nhận huỷ đơn #DH1001?              │
│                                          │
│  Hành động này không thể hoàn tác.      │
│  Số tiền 275.000 ₫ sẽ được hoàn lại.   │
│                                          │
│  [ Giữ đơn hàng ]   [ Huỷ & Hoàn tiền ]│
└──────────────────────────────────────────┘
```

---

## 6. Tab Thanh Toán (Cải Tiến)

```
┌─────────────────────────────────────────────────────────────┐
│  THÔNG TIN THANH TOÁN                                        │
│                                                              │
│  Phương thức:  💵 Tiền mặt khi nhận hàng                    │
│  Trạng thái:   ⏳ Chờ thu tiền                               │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Lịch sử:                                                    │
│  08/05 09:17  Đơn hàng được tạo                             │
│  08/05 09:17  Khách chọn thanh toán tiền mặt                │
│               [ Chờ NV xác nhận ]                           │
└─────────────────────────────────────────────────────────────┘
```

Với đơn **chuyển khoản** (DH1002), tab này hiển thị thêm:

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ HÌNH ẢNH CHUYỂN KHOẢN                                    │
│  [Thumbnail ảnh CK]  Tải lên lúc 09:00                      │
│  Số tiền CK: 450.000 ₫  ·  MB Bank                         │
│                                                              │
│  [ Xác nhận đã nhận tiền ]    [ Từ chối - CK không hợp lệ ] │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Sidebar Navigation (Redesign)

```
┌────────────────────┐
│  🌿 NôngSản        │
│     NV Vận Hành    │
├────────────────────┤
│  NGHIỆP VỤ         │
│  📦 Quản Lý Kho    │
│     Tồn kho · Nhập/│
│     Xuất · Cảnh báo│
│                    │
│  📋 Đơn Hàng  ● 2 │  ← Badge số đơn cần xử lý
│     Xác nhận &     │
│     xử lý          │
│                    │
│  👤 Cá Nhân        │
│     Hồ sơ · Nghỉ   │
│     phép · FaceID  │
├────────────────────┤
│  staff@nongsa...   │
│  Nhân viên    [→]  │
└────────────────────┘
```

**Active state:** Background `#EAF3DE` · Text `#3B6D11` · Border-left `3px solid #3B6D11`

---

## 8. Component Library (Quick Reference)

### Badge Trạng Thái Đơn Hàng

| Trạng thái          | Background | Text color | Icon |
| ------------------- | ---------- | ---------- | ---- |
| Chờ xác nhận        | `#FAEEDA`  | `#BA7517`  | ⏳   |
| Chờ xác nhận CK     | `#E6F1FB`  | `#185FA5`  | 🏦   |
| Đã thanh toán       | `#EAF3DE`  | `#3B6D11`  | ✅   |
| Chờ giao hàng       | `#F1EFE8`  | `#5F5E5A`  | 🚚   |
| Đã giao             | `#EAF3DE`  | `#3B6D11`  | ✓    |
| Thanh toán thất bại | `#FCEBEB`  | `#A32D2D`  | ⚠️   |

### Tồn Kho Inline

| Tình trạng  | Hiển thị                                 |
| ----------- | ---------------------------------------- |
| Đủ hàng     | `✅ Kho còn: 15` — text `#3B6D11`        |
| Sắp hết     | `⚠️ Kho còn: 3` — text `#BA7517`         |
| Hết hàng    | `❌ Hết hàng` — text `#A32D2D`           |
| Sắp hết hạn | `⏰ Hết hạn sau 2 ngày` — text `#BA7517` |

---

## 9. Responsive & Accessibility

- **Minimum width:** 1024px (desktop-only tool cho NV vận hành)
- **Focus ring:** `2px solid #3B6D11` với `offset: 2px` cho mọi interactive element
- **Loading state:** Skeleton placeholder thay vì spinner cho bảng đơn hàng
- **Toast notifications:** Góc phải trên, auto-dismiss 4s
  - Xác nhận thành công: `✅ Đơn #DH1001 đã xác nhận`
  - Lỗi: `❌ Không thể xác nhận — vui lòng thử lại`

---

## 10. Tóm Tắt Thay Đổi Chính

| Thành phần     | Cũ                            | Mới                                                  |
| -------------- | ----------------------------- | ---------------------------------------------------- |
| Alert cảnh báo | Nằm giữa trang, nền vàng nhạt | Banner có border-left, nhóm theo mức độ nghiêm trọng |
| Tab trạng thái | Text + số                     | Icon + text + badge màu semantic                     |
| Bảng đơn hàng  | Flat, thiếu hierarchy         | Row hover, action buttons ẩn hiện                    |
| Tổng tiền      | Màu cam tuỳ tiện              | Font-mono, màu mực chuẩn                             |
| Nút Xác nhận   | Màu cam chung                 | Xanh đậm rõ ràng là hành động chính                  |
| Nút Huỷ        | Viền đỏ giống danger          | Outline đỏ + confirm dialog bắt buộc                 |
| Tồn kho        | "Kho còn: 3" plain text       | Badge inline với màu semantic + icon                 |
| Sidebar        | Active state màu xanh dương   | Active state màu xanh lá (đồng bộ brand)             |
