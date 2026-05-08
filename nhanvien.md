# Nghiệp Vụ Quản Lý Nhân Sự Kho — NôngSản Việt

> Phạm vi: 30 nhân viên kho · `/admin/hr` · B2C Đà Nẵng

---

## 1. Tổng quan module

Module HR kho không cần phức tạp như HR doanh nghiệp lớn.  
Với 30 nhân viên, cần tập trung vào **4 nghiệp vụ cốt lõi**:

| #   | Nghiệp vụ               | Mức độ ưu tiên |
| --- | ----------------------- | -------------- |
| 1   | Quản lý hồ sơ nhân viên | 🔴 Bắt buộc    |
| 2   | Chấm công & ca làm việc | 🔴 Bắt buộc    |
| 3   | Tính lương              | 🔴 Bắt buộc    |
| 4   | Phân công nhiệm vụ kho  | 🟡 Quan trọng  |
| 5   | Nghỉ phép & vắng mặt    | 🟡 Quan trọng  |
| 6   | Đánh giá hiệu suất      | 🟢 Nên có      |

---

## 2. Chi tiết từng nghiệp vụ

---

### 2.1 Quản lý hồ sơ nhân viên

**Mục đích:** Lưu trữ thông tin cơ bản của 30 nhân viên kho.

**Thông tin cần lưu:**

- Họ tên, ảnh đại diện, CCCD/CMND
- Ngày sinh, giới tính, số điện thoại
- Địa chỉ thường trú
- Ngày vào làm, loại hợp đồng (thử việc / chính thức / thời vụ)
- Vị trí: Nhân viên bốc xếp / Kiểm hàng / Đóng gói / Trưởng ca
- Mức lương cơ bản
- Số tài khoản ngân hàng (để chuyển lương)
- Trạng thái: Đang làm / Nghỉ phép / Đã nghỉ việc

**Tính năng UI cần có:**

- Danh sách nhân viên dạng bảng + avatar
- Filter theo vị trí, trạng thái, ca làm
- Tìm kiếm theo tên, mã NV
- Thêm / Sửa / Xem hồ sơ chi tiết
- Export danh sách ra Excel

---

### 2.2 Chấm công & Ca làm việc

**Đây là nghiệp vụ quan trọng nhất với kho hàng.**

#### 2.2.1 Ca làm việc

Kho nông sản tươi thường chạy 2–3 ca/ngày:

| Ca       | Giờ làm       | Ghi chú                 |
| -------- | ------------- | ----------------------- |
| Ca sáng  | 05:00 – 13:00 | Tiếp nhận hàng sáng sớm |
| Ca chiều | 13:00 – 21:00 | Đóng gói, xuất kho      |
| Ca tối   | 21:00 – 05:00 | Tùy nhu cầu (nếu có)    |

**Cần quản lý:**

- Lịch ca theo tuần (ai làm ca nào)
- Số nhân viên tối thiểu mỗi ca (ví dụ: ít nhất 5 người/ca)
- Cảnh báo khi ca thiếu người

#### 2.2.2 Chấm công

**3 hình thức chấm công (chọn 1 hoặc kết hợp):**

| Hình thức                    | Độ phức tạp | Phù hợp          |
| ---------------------------- | ----------- | ---------------- |
| Thủ công (admin nhập)        | Thấp        | MVP, đề tài      |
| QR Code check-in             | Trung bình  | Thực tế nhỏ      |
| FaceID _(có trong đề cương)_ | Cao         | Điểm sáng đề tài |

**Dữ liệu chấm công mỗi ngày:**

- Giờ vào / Giờ ra thực tế
- Ca được phân công
- Đi trễ (phút) / Về sớm (phút)
- Tăng ca (giờ OT)
- Ghi chú: có phép / không phép / lý do

**UI cần có:**

- Bảng chấm công theo tháng (grid: nhân viên × ngày)
- Màu sắc trực quan:
  - ✅ Xanh: Đúng giờ
  - 🟡 Vàng: Đi trễ / về sớm
  - 🔴 Đỏ: Vắng không phép
  - ⬜ Xám: Ngày nghỉ / lễ
- Tổng hợp cuối tháng: ngày công, ngày nghỉ, số giờ OT

---

### 2.3 Tính Lương

**Công thức lương cơ bản cho nhân viên kho:**

```
Lương thực nhận =
  (Lương cơ bản / Công chuẩn) × Ngày công thực tế
  + Lương tăng ca (giờ OT × hệ số 1.5)
  + Phụ cấp (ăn trưa, xăng xe, độc hại nếu có)
  - Khấu trừ (đi trễ, vắng không phép)
  - Bảo hiểm (nếu có hợp đồng chính thức)
```

**Các loại phụ cấp kho thường gặp:**

- Phụ cấp bốc xếp nặng: +200,000đ/tháng
- Phụ cấp ca đêm: +50,000đ/ca đêm
- Phụ cấp chuyên cần (đi đủ công): +300,000đ/tháng
- Ăn ca: +25,000đ/ngày làm

**Quy trình tính lương hàng tháng:**

1. Admin khóa bảng chấm công (ngày 25 hàng tháng)
2. Hệ thống tự tính lương theo công thức
3. Admin kiểm tra, điều chỉnh thủ công nếu cần
4. Xuất bảng lương PDF / Excel
5. Gửi thông báo lương cho từng nhân viên
6. Đánh dấu "Đã thanh toán" sau khi chuyển khoản

**UI cần có:**

- Bảng lương tháng: danh sách nhân viên × các khoản
- Xem chi tiết lương từng người
- Export bảng lương Excel / PDF
- Lịch sử lương các tháng trước
- Tổng chi phí nhân sự tháng (metric card)

---

### 2.4 Phân công nhiệm vụ kho

**Tại sao cần:** Kho nông sản có nhiều khu vực, cần biết ai chịu trách nhiệm khu nào.

**Các vị trí/khu vực trong kho:**

- Khu tiếp nhận hàng (nhập kho)
- Khu phân loại, kiểm tra chất lượng
- Khu đóng gói đơn hàng
- Khu xuất kho, giao hàng
- Khu bảo quản lạnh (nếu có)

**Cần quản lý:**

- Ai phụ trách khu nào trong ca hôm nay
- Nhiệm vụ đặc biệt: kiểm kê định kỳ, vệ sinh kho
- Lịch sử phân công để tránh thiên vị

**UI cần có:**

- Sơ đồ kho đơn giản (drag & drop phân công)
  hoặc bảng phân công đơn giản theo ca
- Lịch phân công tuần

---

### 2.5 Quản lý Nghỉ phép & Vắng mặt

**Các loại nghỉ:**

| Loại                   | Có lương | Số ngày/năm     |
| ---------------------- | -------- | --------------- |
| Nghỉ phép năm          | ✅       | 12 ngày         |
| Nghỉ bệnh (có giấy tờ) | ✅       | Tối đa 30 ngày  |
| Nghỉ không lương       | ❌       | Theo thỏa thuận |
| Nghỉ lễ Tết            | ✅       | Theo luật       |
| Nghỉ không phép        | ❌       | Trừ lương       |

**Quy trình xin nghỉ:**

1. Nhân viên đăng ký (qua app hoặc gặp trực tiếp)
2. Trưởng ca / Admin duyệt hoặc từ chối
3. Hệ thống tự cập nhật bảng chấm công
4. Cảnh báo nếu ca thiếu người do nghỉ nhiều

**UI cần có:**

- Lịch nghỉ phép dạng calendar view
- Danh sách đơn xin nghỉ chờ duyệt
- Số ngày phép còn lại từng nhân viên
- Thống kê tỷ lệ vắng mặt theo tháng

---

### 2.6 Đánh giá hiệu suất (KPI đơn giản)

**Không cần phức tạp — chỉ cần 5 tiêu chí cho kho:**

| Tiêu chí                | Trọng số | Cách đo              |
| ----------------------- | -------- | -------------------- |
| Chuyên cần (đi đủ công) | 30%      | Tự động từ chấm công |
| Đúng giờ                | 20%      | Tự động từ chấm công |
| Tốc độ xử lý đơn        | 20%      | Số đơn/ca            |
| Tỷ lệ lỗi đóng gói      | 20%      | Admin nhập thủ công  |
| Thái độ làm việc        | 10%      | Admin đánh giá       |

**Chu kỳ đánh giá:** Hàng tháng hoặc hàng quý

**UI cần có:**

- Form đánh giá đơn giản (1–5 sao hoặc %)
- Biểu đồ radar 5 tiêu chí
- Xếp hạng nhân viên tháng
- Lịch sử đánh giá

---

## 3. Màn hình UI cần xây dựng

| #   | Route                     | Tên màn hình                |
| --- | ------------------------- | --------------------------- |
| 1   | `/admin/hr`               | Dashboard tổng quan nhân sự |
| 2   | `/admin/hr/employees`     | Danh sách nhân viên         |
| 3   | `/admin/hr/employees/:id` | Hồ sơ chi tiết nhân viên    |
| 4   | `/admin/hr/attendance`    | Bảng chấm công tháng        |
| 5   | `/admin/hr/schedule`      | Lịch phân ca tuần           |
| 6   | `/admin/hr/payroll`       | Bảng lương tháng            |
| 7   | `/admin/hr/payroll/:id`   | Chi tiết lương 1 nhân viên  |
| 8   | `/admin/hr/leaves`        | Quản lý nghỉ phép           |
| 9   | `/admin/hr/tasks`         | Phân công nhiệm vụ kho      |
| 10  | `/admin/hr/performance`   | Đánh giá hiệu suất          |

---

## 4. Dashboard tổng quan `/admin/hr`

**Metric cards (hàng trên):**

- 👥 Tổng nhân viên: 30 (đang làm / nghỉ phép / nghỉ việc)
- 🟢 Có mặt hôm nay: X/30
- ⏰ Đi trễ hôm nay: X người
- 🔴 Vắng không phép: X người
- 💰 Chi phí lương tháng này: X.XXX.XXXđ

**Section giữa:**

- Lịch ca hôm nay: ai làm ca nào (3 ca)
- Danh sách đơn xin nghỉ chờ duyệt
- Sinh nhật nhân viên trong tháng (nhân văn 😄)

**Section dưới:**

- Biểu đồ tỷ lệ chuyên cần 30 ngày gần nhất
- Top 5 nhân viên xuất sắc tháng
- Cảnh báo: hợp đồng sắp hết hạn

---

## 5. Liên kết với module khác

| Module HR        | Kết nối với       | Dữ liệu chia sẻ                       |
| ---------------- | ----------------- | ------------------------------------- |
| Chấm công FaceID | Module bảo mật    | Camera, nhận diện khuôn mặt           |
| Tính lương       | Module Thanh toán | Chi phí nhân sự vào báo cáo tài chính |
| Phân công kho    | Module Kho hàng   | Ai đang phụ trách khu vực nào         |
| Đánh giá         | Module Đơn hàng   | Số đơn xử lý/ca của từng NV           |

---

## 6. Dữ liệu mẫu đề xuất (cho demo)

Để demo thuyết phục hội đồng, tạo sẵn:

- **30 nhân viên** với tên, ảnh, vị trí đa dạng
- **3 tháng chấm công** có đủ: đúng giờ, trễ, nghỉ phép, OT
- **2–3 tháng bảng lương** đã tính hoàn chỉnh
- **Lịch ca 2 tuần** có phân công rõ ràng

---

## 7. Độ phức tạp & Khuyến nghị cho đề tài

### Nên làm (2 tháng đủ):

- ✅ Hồ sơ nhân viên đầy đủ
- ✅ Chấm công thủ công hoặc QR
- ✅ Tính lương tự động theo công thức
- ✅ Nghỉ phép cơ bản
- ✅ Phân ca đơn giản

### Tính năng điểm cộng (nếu còn thời gian):

- 🌟 FaceID chấm công _(đã có trong đề cương — đây là điểm sáng nhất)_
- 🌟 Export bảng lương PDF đẹp
- 🌟 Biểu đồ KPI nhân viên

### Không cần làm cho đề tài:

- ❌ Bảo hiểm xã hội chi tiết
- ❌ Thuế TNCN phức tạp
- ❌ Hệ thống workflow duyệt nhiều cấp
- ❌ Tích hợp BHXH điện tử

---

_Tài liệu này phục vụ thiết kế module `/admin/hr`_  
_Dự án: Hệ thống hỗ trợ kinh doanh nông sản tích hợp AI_  
_Nhóm SCI_ITF_5 · GVHD: Phạm An Bình · 2026_
