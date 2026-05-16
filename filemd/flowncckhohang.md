# Flow Nhập hàng NCC → Kho (Phân tích nghiệp vụ)

## 1. Flow chi tiết từng bước (sau khi fix)

### Tổng quan:

```
Bước 1          Bước 2           Bước 3            Bước 4           Bước 5          Bước 6
[Tạo PO]  →  [NCC giao]  →  [Nhận hàng]  →  [Kiểm tra QC]  →  [Nhập kho]  →  [Ghi nợ NCC]
 Admin/         (ngoài          Staff/             Staff/            Hệ thống        Hệ thống
 Thu kho        hệ thống)       Thu kho            QC Staff          (auto)          (auto)
```

---

### Bước 1: Tạo đơn đặt hàng NCC (Purchase Order)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Ai thực hiện** | ADMIN hoặc THU_KHO (warehouse-manager) |
| **Màn hình** | `/warehouse-manager/receiving` hoặc `/admin/warehouse/receiving` |
| **API** | `POST /api/admin/warehouse/import` |
| **Input** | NCC, ngày giao dự kiến, danh sách sản phẩm (hỗ trợ multi-item) |
| **Output** | `phieu_nhap_kho` trạng thái `CHO_GIAO_HANG` + N `chi_tiet_phieu_nhap` |
| **Ghi nhận** | `ma_nguoi_tao` = user hiện tại |

**Body request mẫu:**
```json
{
  "ma_ncc": 52,
  "ngay_giao_du_kien": "2026-05-20",
  "nguoi_tao_id": 17,
  "items": [
    { "ma_bien_the": 930, "so_luong": 10, "don_gia": 50000 },
    { "ma_bien_the": 929, "so_luong": 5, "don_gia": 30000 }
  ]
}
```

---

### Bước 2: NCC giao hàng (ngoài hệ thống)

- NCC chuẩn bị hàng và vận chuyển đến kho theo `ngay_du_kien_giao`
- Hệ thống không can thiệp bước này
- Thủ kho theo dõi danh sách phiếu `CHO_GIAO_HANG` để biết lịch nhận hàng

---

### Bước 3: Nhận hàng tại kho

| Thuộc tính | Chi tiết |
|------------|----------|
| **Ai thực hiện** | STAFF hoặc THU_KHO |
| **Màn hình** | `/staff/warehouse/receiving` hoặc `/warehouse-manager/receiving` |
| **API** | `POST /api/admin/warehouse/receiving/submit` |
| **Hành động** | Kiểm đếm số lượng thực nhận, ghi nhận chênh lệch, chụp ảnh bằng chứng |
| **Output** | Cập nhật `so_luong_thuc_nhan` + tạo `nhiem_vu_kiem_dinh` (QC task) |
| **Trạng thái phiếu** | `CHO_GIAO_HANG` → `DANG_KIEM_TRA` |
| **Ghi nhận** | `lich_su_nhan_hang` (ai nhận, thời gian), `ma_nguoi_kiem_tra`, `ly_do_chenh_lech` nếu thiếu hàng |

**Body request mẫu:**
```json
{
  "poId": 39,
  "nguoi_nhan_id": 17,
  "items": [
    { "id": 74, "actualQty": 10 },
    { "id": 75, "actualQty": 3, "reason": "Thiếu 2 gói" }
  ]
}
```

**Validation:**
- Phiếu phải ở trạng thái `CHO_GIAO_HANG` hoặc `DANG_KIEM_TRA` (chống submit trùng)
- Nếu tổng thực nhận < tổng yêu cầu → ghi nhận partial receiving

---

### Bước 4: Kiểm tra chất lượng (QC)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Ai thực hiện** | STAFF (QC) hoặc THU_KHO |
| **Màn hình** | `/warehouse-manager/qc` hoặc `/admin/warehouse/map` (tab QC) |
| **API** | `PUT /api/admin/warehouse/qc/tasks/[id]/start` → bắt đầu QC |
|  | `POST /api/admin/warehouse/qc/tasks/[id]/decision` → ra quyết định |
| **Hành động** | Kiểm tra ngoại quan, nhiệt độ, chứng từ. Ra quyết định: |
|  | - `ACCEPT_ALL`: toàn bộ đạt chất lượng |
|  | - `PARTIAL_ACCEPT`: một phần lỗi (nhập `damagedQty`) |
|  | - `REJECT_ALL`: toàn bộ hàng lỗi |
| **Trạng thái QC task** | `WAITING_FOR_QC` → `QC_IN_PROGRESS` → `DONE` |

**Body request mẫu (decision):**
```json
{
  "action": "PARTIAL_ACCEPT",
  "damagedQty": 2,
  "reason": "2 gói bị mốc",
  "han_su_dung": "2026-06-15"
}
```

---

### Bước 5: Nhập kho (tự động sau QC pass)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Ai thực hiện** | Hệ thống (auto trigger khi QC quyết định) |
| **Điều kiện** | QC decision = ACCEPT_ALL hoặc PARTIAL_ACCEPT (passQty > 0) |
| **Tạo dữ liệu** | |
| - `lo_hang` | Lô hàng mới (mã lô, biến thể, NCC, HSD từ input, trạng thái BINH_THUONG) |
| - `ton_kho_tong` | Tổng tồn kho tại vị trí kho (smart zone: Khu Lạnh/Khô/Tổng Hợp) |
| - `kien_hang_chi_tiet` | Mã QR cho kiện hàng (max 50 QR/lô) |
| **Nếu có hàng lỗi** | Tạo `phieu_tra_nha_cung_cap` (DANG_XU_LY) để trả NCC |
| **Smart zone** | Rau/quả/tươi → Khu Lạnh, Khô/gia vị/ngũ cốc → Khu Khô, còn lại → Khu Tổng Hợp |

---

### Bước 6: Hoàn thành + Ghi nợ NCC (tự động)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Ai thực hiện** | Hệ thống (auto khi TẤT CẢ QC tasks của phiếu = DONE) |
| **Điều kiện** | Mọi `nhiem_vu_kiem_dinh` liên quan phiếu đều `trang_thai = 'DONE'` |
| **Trạng thái phiếu** | `DANG_KIEM_TRA` → `HOAN_THANH` |
| **Tạo dữ liệu** | |
| - `cong_no_ncc` | Ghi nợ NCC: tổng tiền = SUM(so_luong_thuc_nhan x don_gia) |
| - `tong_tien` | Cập nhật tổng tiền trên phiếu nhập |
| **Ghi nhận** | `loai_giao_dich = 'NHAP_HANG'`, `phuong_thuc = 'CONG_NO'` |

---

### Tổng hợp roles tham gia:

| Role | Bước tham gia | Quyền |
|------|---------------|-------|
| ADMIN | 1, 4 | Tạo PO, xem QC, toàn quyền |
| THU_KHO (warehouse-manager) | 1, 3, 4 | Tạo PO, nhận hàng, QC |
| STAFF | 3, 4 | Nhận hàng, kiểm tra QC |
| Hệ thống (auto) | 5, 6 | Nhập kho, ghi nợ NCC |

### Trạng thái phiếu nhập qua từng bước:

```
CHO_GIAO_HANG → DANG_KIEM_TRA → HOAN_THANH
    (Bước 1)        (Bước 3)       (Bước 6)
```

### API tham gia:

| Bước | API | Method |
|------|-----|--------|
| 1 | `/api/admin/warehouse/import` | POST |
| 3 | `/api/admin/warehouse/receiving/submit` | POST |
| 4 | `/api/admin/warehouse/qc/tasks` | GET |
| 4 | `/api/admin/warehouse/qc/tasks/[id]/start` | PUT |
| 4 | `/api/admin/warehouse/qc/tasks/[id]/decision` | POST |

---

## 2. Điểm yếu nghiệp vụ cần cải thiện

### 2.1. Chỉ hỗ trợ 1 dòng sản phẩm / phiếu nhập
**Vấn đề:** API `POST /import` chỉ tạo 1 `chi_tiet_phieu_nhap` (1 biến thể sản phẩm).  
**Thực tế:** NCC thường giao nhiều loại sản phẩm trong 1 chuyến (VD: 5 thùng rau muống + 3 thùng cà chua).  
**Ảnh hưởng:** Phải tạo nhiều phiếu nhập riêng cho cùng 1 chuyến giao → khó đối soát, tốn thời gian.  
**Đề xuất:** Cho phép tạo PO nhiều dòng (`chi_tiet_phieu_nhap[]`).

### 2.2. Không kiểm tra trạng thái phiếu trước khi nhận
**Vấn đề:** API `/receiving/submit` tìm phiếu bằng `findUnique` nhưng KHÔNG check `trang_thai === 'CHO_GIAO_HANG'`.  
**Ảnh hưởng:** Có thể submit lại phiếu đã `HOAN_THANH` → tạo lô hàng trùng, tồn kho sai.  
**Đề xuất:** Thêm guard: `if (phieu.trang_thai !== 'CHO_GIAO_HANG') throw Error('Phiếu đã xử lý')`.

### 2.3. Vị trí kho được gán ngẫu nhiên
**Vấn đề:** `vi_tri_kho.findFirst()` lấy vị trí đầu tiên tìm được (không có điều kiện sắp xếp).  
**Thực tế:** Kho có nhiều vùng (lạnh, khô, mát). Rau quả cần vùng lạnh, hàng khô cần vùng khô.  
**Ảnh hưởng:** Hàng có thể bị đặt sai khu vực → hư hỏng, mất chất lượng.  
**Đề xuất:** Mapping loại sản phẩm ↔ khu vực phù hợp (VD: loai_bao_quan trên biến thể → khu_vuc kho).

### 2.4. Hạn sử dụng mặc định +30 ngày không hợp lý
**Vấn đề:** `han_su_dung: phieu.han_su_dung_thuc_te || new Date(Date.now() + 30 * 86400000)`  
**Thực tế:** Rau lá 3-5 ngày, trái cây 7-14 ngày, hàng khô 6-12 tháng. +30 ngày mặc định là sai hoàn toàn cho rau lá (quá dài) lẫn hàng khô (quá ngắn).  
**Ảnh hưởng:** Cảnh báo hết hạn sai thời điểm, có thể bán hàng hết hạn mà không hay biết.  
**Đề xuất:** Bắt buộc nhập HSD khi nhận hàng, hoặc lấy `thoi_gian_bao_quan` từ biến thể sản phẩm.

### 2.5. Không có bước kiểm tra chất lượng (QC)
**Vấn đề:** Flow đi thẳng từ "nhận hàng" → `HOAN_THANH`. Không có bước QC trung gian.  
**Thực tế:** Nông sản cần kiểm: ngoại quan, nhiệt độ, chứng từ GAP, mẫu kiểm vi sinh.  
**Ảnh hưởng:** Hàng kém chất lượng vào kho → bán cho khách → rủi ro sức khỏe, uy tín.  
**Đề xuất:** Thêm trạng thái `DANG_KIEM_TRA` giữa nhận hàng và hoàn thành. Cho phép từ chối lô (partial reject).

### 2.6. Không tạo công nợ NCC
**Vấn đề:** Sau khi nhận hàng, không có logic tạo `cong_no_ncc` (nợ phải trả NCC).  
**Thực tế:** Đa số NCC bán nông sản cho phép trả chậm 7-30 ngày.  
**Ảnh hưởng:** Không theo dõi được tiền nợ NCC → quên thanh toán → mất uy tín, NCC ngưng cung cấp.  
**Đề xuất:** Tự động tạo bản ghi công nợ khi phiếu `HOAN_THANH` (số tiền = actualQty × don_gia).

### 2.7. Tạo QR theo đơn vị lẻ — không scale
**Vấn đề:** `Array.from({ length: item.actualQty })` tạo 1 mã QR cho mỗi đơn vị.  
**Thực tế:** Nếu nhận 500 kg rau muống → tạo 500 QR codes trong 1 request → chậm, đầy DB.  
**Ảnh hưởng:** Timeout khi nhận hàng lớn, DB phình nhanh.  
**Đề xuất:** QR theo kiện/thùng thay vì đơn vị lẻ. Hoặc batch insert với giới hạn (VD: max 100 QR/lô).

### 2.8. Không có idempotency (chống submit trùng)
**Vấn đề:** Nếu user bấm "Xác nhận" 2 lần (double-click, mạng chậm) → chạy logic 2 lần.  
**Ảnh hưởng:** Vì mục 2.2 cũng thiếu → có thể tạo duplicate lô hàng.  
**Đề xuất:** Dùng unique constraint trên `ma_phieu_nhap` trong `lo_hang`, hoặc check `trang_thai` (mục 2.2 đã fix).

### 2.9. Không ghi nhận người thực hiện
**Vấn đề:** Cả 2 API đều không lưu `nguoi_tao` / `nguoi_nhan`.  
**Thực tế:** Cần biết ai tạo PO, ai nhận hàng để quy trách nhiệm khi có vấn đề.  
**Ảnh hưởng:** Không truy vết được khi hàng hư, thiếu hụt.  
**Đề xuất:** Lấy session user và lưu vào `nguoi_tao_id`, `nguoi_nhan_id`.

### 2.10. Không hỗ trợ nhận hàng một phần (partial receiving)
**Vấn đề:** Phiếu chuyển thẳng sang `HOAN_THANH` dù `so_luong_thuc_nhan < so_luong_yeu_cau`.  
**Thực tế:** NCC có thể giao thiếu (VD: yêu cầu 100, giao 80). Cần cho phép "nhận trước 80, đợi 20 sau".  
**Ảnh hưởng:** Không theo dõi được hàng còn thiếu → NCC quên giao phần còn lại.  
**Đề xuất:** Nếu tổng thực nhận < yêu cầu → trạng thái `NHAN_MOT_PHAN`, tạo phiếu bổ sung tự động.

---

## 3. Ưu tiên sửa

| Mức | Vấn đề | Lý do |
|-----|--------|-------|
| 🔴 Cao | 2.2 (check trạng thái) | Bug nghiêm trọng - dữ liệu sai |
| 🔴 Cao | 2.4 (HSD mặc định) | Rủi ro an toàn thực phẩm |
| 🔴 Cao | 2.5 (QC) | Rủi ro chất lượng sản phẩm |
| 🟡 Trung bình | 2.1 (multi-item PO) | UX kém, tốn thời gian vận hành |
| 🟡 Trung bình | 2.6 (công nợ NCC) | Mất kiểm soát tài chính |
| 🟡 Trung bình | 2.3 (vị trí kho) | Hàng hư do đặt sai khu vực |
| 🟡 Trung bình | 2.10 (partial receiving) | Không theo dõi hàng thiếu |
| 🟢 Thấp | 2.9 (người thực hiện) | Audit trail |

---

## 4. Trạng thái hoàn thành (2026-05-14)

### Flow mới sau khi fix:

```
[Tạo PO multi-item]  →  [NCC giao hàng]  →  [Nhận hàng + ghi nhận]  →  [QC kiểm tra]  →  [Nhập kho]
     │                                            │                          │                 │
     ▼                                            ▼                          ▼                 ▼
phieu_nhap_kho            chi_tiet_phieu_nhap   nhiem_vu_kiem_dinh     lo_hang + ton_kho_tong
(CHO_GIAO_HANG)           (update actualQty)    (WAITING_FOR_QC)       + kien_hang_chi_tiet
+ multi chi_tiet           + lich_su_nhan_hang   → QC_IN_PROGRESS      + cong_no_ncc
                           → DANG_KIEM_TRA       → DONE                → HOAN_THANH
```

### Kết quả test API (2026-05-14):

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 1 | Multi-item PO (2 sản phẩm) | PASS | Phiếu #39: 2 chi_tiet_phieu_nhap |
| 2 | Receiving → QC tasks | PASS | 2 nhiem_vu_kiem_dinh tạo, status=DANG_KIEM_TRA |
| 3 | Idempotency (re-submit) | PASS | Không tạo QC duplicate |
| 4 | QC ACCEPT_ALL | PASS | lo_hang + ton_kho + QR tạo đúng |
| 5 | QC PARTIAL_ACCEPT | PASS | 2 pass / 1 reject → phieu_tra_ncc |
| 6 | All QC done → HOAN_THANH | PASS | Phiếu auto chuyển HOAN_THANH |
| 7 | Công nợ NCC | PASS | 590,000đ (10x50k + 3x30k) |
| 8 | Status guard (HOAN_THANH block) | PASS | "Phiếu đã xử lý" |
| 9 | Backward compat (single-item) | PASS | Phiếu #40 tạo OK |
| 10 | HSD đúng theo input | PASS | 2026-05-20 và 2026-06-15 |
| 11 | QR capped (max 50/lô) | PASS | 22 QR (10+10+2) |
| 12 | Partial receiving ghi nhận | PASS | "Nhận 13/15 (thiếu 2)" |
| 13 | Smart zone (Khu Lạnh/Khô) | PASS | Regex match category → zone |

### Chi tiết fix đã triển khai:

| Mục | File đã sửa | Nội dung |
|-----|-------------|----------|
| 2.1 | `src/app/api/admin/warehouse/import/route.ts` | Hỗ trợ `items[]` array + backward compat single-item |
| 2.2 | `src/app/api/admin/warehouse/receiving/submit/route.ts` | Guard: chỉ cho phép CHO_GIAO_HANG hoặc DANG_KIEM_TRA |
| 2.3 | `src/app/api/admin/warehouse/qc/tasks/[id]/decision/route.ts` | Smart zone: regex category → Khu Lạnh/Khô/Tổng Hợp |
| 2.4 | `src/app/api/admin/warehouse/receiving/submit/route.ts` | Bỏ default +30 ngày, HSD lấy từ phiếu hoặc QC input |
| 2.5 | `src/app/api/admin/warehouse/receiving/submit/route.ts` | Tạo nhiem_vu_kiem_dinh thay vì nhập kho trực tiếp |
| 2.6 | `src/app/api/admin/warehouse/qc/tasks/[id]/decision/route.ts` | Auto tạo cong_no_ncc khi all QC done + tính tong_tien |
| 2.7 | `src/app/api/admin/warehouse/qc/tasks/[id]/decision/route.ts` | QR batch: Math.min(passQty, 50) |
| 2.8 | `src/app/api/admin/warehouse/receiving/submit/route.ts` | Status guard + QC findUnique check = idempotent |
| 2.9 | `import/route.ts` + `receiving/submit/route.ts` | ma_nguoi_tao, lich_su_nhan_hang, ma_nguoi_kiem_tra |
| 2.10 | `src/app/api/admin/warehouse/receiving/submit/route.ts` | So sánh totalReceived vs totalRequested → ghi ly_do_chenh_lech |
