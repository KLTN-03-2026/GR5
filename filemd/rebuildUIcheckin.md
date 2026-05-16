**THIẾT KẾ LẠI GIAO DIỆN**

**Module Nhận Hàng & Check-in Cổng Kho**

NôngSản WMS --- Tài liệu thiết kế UX/UI

*Tháng 5/2026*

**1. Vấn đề với giao diện hiện tại**

Giao diện Check-in Cổng Kho hiện tại chỉ có một ô nhập PO và một nút xác nhận --- quá tối giản so với nghiệp vụ thực tế. Nhân viên kho phải tự nhớ và xử lý nhiều thông tin quan trọng bên ngoài màn hình, dẫn đến sai sót và thiếu kiểm soát.

**Các vấn đề cụ thể:**

-   Không hiển thị thông tin xe và NCC đang chờ --- nhân viên không biết mình đang check-in cho ai

-   Không có danh sách PO đang hoạt động trong ngày để chọn nhanh

-   Không phân biệt được trạng thái: xe đã đến, đang dỡ hàng, hay chờ QC

-   Thiếu bước ghi nhận biển số xe, tài xế, cổng vào --- không có audit trail

-   Không có cảnh báo khi hàng sắp đến mà chưa chuẩn bị slot

**2. Nguyên tắc thiết kế lại**

Mục tiêu chính: Nhân viên kho thao tác được nhanh, ít nhập liệu thủ công, hệ thống tự điền những gì đã biết.

-   Tối giản thao tác: Scan QR \> Xác nhận là luồng chính, nhập tay chỉ khi ngoại lệ

-   Context trước --- action sau: Hiện thông tin lô hàng đầy đủ TRƯỚC khi cho nhập

-   Trạng thái rõ ràng: Mỗi lô hàng phải có trạng thái màu sắc dễ đọc từ xa

-   Phù hợp môi trường kho: Font to, button lớn, đủ dùng trên tablet và mobile

-   Không bỏ qua bước: Một số trường bắt buộc trước khi qua màn hình tiếp theo

**3. Luồng nghiệp vụ đơn giản hóa**

Toàn bộ module Nhận Hàng gồm 4 màn hình chính, theo thứ tự tuyến tính:

  ---------------------------------------------------------------------------------------------------
  **Bước**   **Màn hình**                       **Ai thực hiện**              **Thời gian dự kiến**
  ---------- ---------------------------------- ----------------------------- -----------------------
  1          Tổng quan lịch nhận hàng hôm nay   Trưởng kho / Nhân viên cổng   Đầu ca

  2          Check-in xe vào cổng               Nhân viên cổng / Bảo vệ       2--3 phút/xe

  3          Kiểm đếm & ghi nhận dỡ hàng        Đội dỡ hàng                   15--30 phút/lô

  4          Xác nhận và chuyển QC              Nhân viên nhận hàng           5 phút/lô
  ---------------------------------------------------------------------------------------------------

**4. Màn hình 1 --- Lịch nhận hàng hôm nay (Dashboard)**

**4.1 Mục đích**

Màn hình mặc định khi nhân viên mở module. Cho cái nhìn tổng quan ngay: hôm nay có bao nhiêu xe, xe nào đến lúc nào, trạng thái từng lô ra sao.

**4.2 Bố cục màn hình**

**Phần trên --- Thống kê nhanh (4 ô nhỏ ngang hàng):**

-   Tổng PO hôm nay: số lô dự kiến nhận

-   Đã check-in: số xe đã vào cổng

-   Đang trong kho / staging: số lô đang dỡ hoặc chờ QC

-   Hoàn thành: số lô đã QC pass và nhập kho

**Phần giữa --- Danh sách PO theo dạng thẻ (card):**

Mỗi thẻ PO hiển thị đủ thông tin cần thiết trong một cái nhìn:

  -------------------------------------------- ------------------------------------ ----------------------
  **Mẫu thẻ PO --- Màn hình Lịch nhận hàng**                                        

  **PO Number**                                PO-2026-0512-034                     *Bấm để mở chi tiết*

  **Nhà cung cấp**                             HTX Rau Đà Lạt --- Nguyễn Văn A      

  **Giờ dự kiến**                              08:30 --- Cổng B2                    *⚠️ Còn 15 phút*

  **Hàng hóa**                                 Xà lách cuộn 200kg · Rau cải 150kg   

  **Trạng thái**                               🟡 Chờ xe đến                        *Badge màu vàng*

  **Ưu tiên QC**                               Cao --- Rau ăn lá tươi               *Badge đỏ*
  -------------------------------------------- ------------------------------------ ----------------------

**Nhãn trạng thái dùng màu chuẩn:**

  ------------------------------------------------------------------------------
  **Badge**          **Màu**       **Ý nghĩa**
  ------------------ ------------- ---------------------------------------------
  ⚪ Chờ xe đến      Xám nhạt      Xe chưa xuất phát hoặc chưa check-in

  🟡 Xe đang đến     Vàng          Xe đã check-out khỏi NCC, ETA trong 60 phút

  🔵 Đang dỡ hàng    Xanh dương    Xe đã vào cổng, đang dỡ hàng

  🟠 Chờ QC          Cam           Dỡ xong, hàng ở staging chờ kiểm định

  🟢 Hoàn thành      Xanh lá       QC pass, đã nhập kho WMS

  🔴 Từ chối / Lỗi   Đỏ            QC fail hoặc có vấn đề cần xử lý
  ------------------------------------------------------------------------------

**Phần dưới --- Thanh hành động nhanh:**

-   Nút lớn: \"+ Check-in xe mới\" --- cho phép check-in xe không có trong lịch (trường hợp ngoại lệ)

-   Bộ lọc nhanh: Tất cả \| Hôm nay \| Trễ \| Cần xử lý

> *💡 Không hiển thị PO của ngày khác để tránh nhầm. Nếu cần tra cứu lịch sử, vào mục Lịch sử riêng.*

**5. Màn hình 2 --- Check-in xe vào cổng**

**5.1 Mục đích**

Thay thế màn hình hiện tại --- ghi nhận xe đến, liên kết xe với PO, tạo transaction trong hệ thống. Bước này không cần QC, chỉ cần xác nhận vật lý.

**5.2 Luồng check-in**

**Bước 1 --- Nhận diện PO (chọn một trong hai cách):**

-   Cách A --- Scan QR: Nhân viên quét QR trên phiếu giao hàng của tài xế. Hệ thống tự điền toàn bộ thông tin PO.

-   Cách B --- Nhập PO: Gõ mã PO vào ô tìm kiếm. Hệ thống gợi ý PO đang chờ trong ngày.

> *💡 Ưu tiên scan QR --- giảm nhập tay và lỗi. Nút scan phải nổi bật, đặt trên cùng.*

**Bước 2 --- Xác nhận thông tin tự động điền:**

Sau khi nhận diện PO, hệ thống hiển thị thông tin để nhân viên xác nhận trước khi ghi nhận:

  -------------------------------------------------------- -------------------------------- ------------------------------
  **Màn hình Check-in --- Thông tin tự động điền từ PO**                                    

  **PO Number**                                            PO-2026-0512-034                 *Auto từ scan*

  **Nhà cung cấp**                                         HTX Rau Đà Lạt                   *Auto*

  **Hàng dự kiến**                                         Xà lách 200kg · Rau cải 150kg    *Auto*

  **Giờ dự kiến**                                          08:30 (Đúng giờ ✓)               *So sánh tự động*

  **Cổng vào**                                             \[Dropdown\] B2 ▼                *Nhân viên chọn*

  **Biển số xe**                                           \[Nhập\] 51C - 12345             *Bắt buộc nhập*

  **Tên tài xế**                                           \[Nhập --- tùy chọn\]            *Không bắt buộc*

  **Ghi chú cổng**                                         \[Nhập --- tùy chọn\]            *Ví dụ: xe đến muộn 20 phút*
  -------------------------------------------------------- -------------------------------- ------------------------------

**Bước 3 --- Xác nhận và cấp thẻ:**

-   Nút \"Xác Nhận Check-in\" --- lớn, màu xanh, ở cuối màn hình

-   Sau khi xác nhận: hệ thống in phiếu cổng tự động (nếu có máy in) hoặc hiển thị mã QR cho tài xế chụp

-   Thông báo tự động gửi đến đội dỡ hàng: \"Xe PO-034 đã vào cổng B2, chuẩn bị dỡ hàng\"

-   Màn hình tự reset về Bước 1 sau 5 giây để sẵn sàng cho xe tiếp theo

**5.3 Trường hợp ngoại lệ**

-   Xe đến không có trong lịch: Hiển thị cảnh báo màu vàng, yêu cầu liên hệ Trưởng kho trước khi cho vào

-   PO đã hết hiệu lực hoặc bị hủy: Hiển thị lỗi màu đỏ, không cho check-in, hướng dẫn liên hệ Mua hàng

-   Scan không nhận được: Chuyển sang chế độ nhập tay tự động, không để nhân viên tắc lại

**6. Màn hình 3 --- Kiểm đếm & ghi nhận dỡ hàng**

**6.1 Mục đích**

Ghi nhận số lượng thực tế dỡ xuống, so sánh với PO, đánh dấu các bao bì bất thường. Đây là bước quan trọng nhất --- mọi lệch lượng phải được ghi rõ tại đây.

**6.2 Bố cục màn hình**

**Phần trên --- Thông tin PO (chỉ đọc, thu gọn):**

-   Dòng đầu: PO-034 \| HTX Rau Đà Lạt \| Cổng B2

-   Dòng hai: Xe 51C-12345 \| Check-in 08:27 \| Đang dỡ hàng 🔵

**Phần giữa --- Bảng kiểm đếm theo từng SKU:**

  ---------------------------------------------------------------------------------
  **Mặt hàng**     **PO (kg)**   **Thực nhận**   **Lệch**   **Tình trạng bao bì**
  ---------------- ------------- --------------- ---------- -----------------------
  Xà lách cuộn     200           \[ \] kg        ---        \[Bình thường ▼\]

  Rau cải xanh     150           \[ \] kg        ---        \[Bình thường ▼\]

  Rau mùi          30            \[ \] kg        ---        \[Bình thường ▼\]
  ---------------------------------------------------------------------------------

**Cột \"Lệch\" tự tính và hiển thị màu:**

-   Xanh lá: Khớp đúng với PO

-   Vàng: Lệch dưới 5% --- chấp nhận được, ghi chú tự động

-   Đỏ: Lệch trên 5% --- bắt buộc nhập lý do và upload ảnh chứng minh

> *💡 Khi cột Lệch chuyển đỏ, ô ghi chú lý do và nút Upload ảnh tự động mở ra ngay bên dưới dòng đó --- không cần nhân viên tìm ở đâu khác.*

**Dropdown tình trạng bao bì gồm:**

-   Bình thường --- không cần action

-   Móp / rách nhẹ --- ghi chú, ưu tiên QC kiểm trước

-   Ướt / ẩm --- ghi chú, flag QC

-   Dấu hiệu bất thường --- bắt buộc chụp ảnh và mô tả

**6.3 Thanh trạng thái dỡ hàng**

Thanh tiến trình đơn giản ở đầu màn hình:

-   \"Đã nhập 2/3 mặt hàng\" --- trực quan, tránh bỏ sót SKU

-   Nút \"Xong --- Chuyển staging\" chỉ sáng lên khi tất cả SKU đã được nhập số lượng

**7. Màn hình 4 --- Xác nhận & chuyển QC**

**7.1 Mục đích**

Bước tổng kết trước khi xe NCC rời đi và lô hàng được chuyển sang QC. Cả hai bên ký xác nhận tại đây.

**7.2 Nội dung màn hình**

**Màn hình này hiển thị tóm tắt để xác nhận lần cuối:**

  ---------------------------------------------------- -------------------------------------- ----------------
  **Màn hình Xác nhận --- Biên bản tiếp nhận sơ bộ**                                          

  **PO Number**                                        PO-2026-0512-034                       

  **Thời gian nhận**                                   08:27 --- 09:15 (48 phút)              

  **Xà lách cuộn**                                     195 kg / PO 200 kg (Lệch -2.5%)        *🟡 Nhẹ*

  **Rau cải xanh**                                     150 kg / PO 150 kg (Khớp)              *🟢 Đạt*

  **Rau mùi**                                          28 kg / PO 30 kg (Lệch -6.7%)          *🔴 Ghi nhận*

  **Bao bì bất thường**                                3 thùng rau cải --- móp nhẹ (đã ảnh)   *QC ưu tiên*

  **Tổng trọng lượng**                                 373 kg / PO 380 kg                     

  **Cổng / Slot**                                      B2 --- Staging khu S3                  
  ---------------------------------------------------- -------------------------------------- ----------------

**Xác nhận điện tử:**

-   Nhân viên kho: Nhấn \"Xác nhận & ký\" --- nhập mã PIN hoặc ký tay trên màn hình cảm ứng

-   Tài xế NCC: Quét QR hiển thị trên màn hình bằng điện thoại để ký xác nhận phía NCC (không cần cài app)

-   Hệ thống tự tạo PDF biên bản và gửi email cho cả hai bên

> *💡 Xe NCC chỉ được phép rời đi sau khi bước ký xác nhận hoàn tất và hệ thống ghi nhận thành công.*

**Sau khi xác nhận:**

-   Lô hàng tự động chuyển trạng thái: Đang dỡ hàng → Chờ QC 🟠

-   Thông báo đẩy đến app của đội QC: \"Lô PO-034 đang chờ kiểm định tại S3\"

-   Đội QC thấy lô này trong hàng đợi với mức ưu tiên tương ứng (cao / trung / thấp)

**8. Chi tiết UX quan trọng**

**8.1 Thiết kế cho môi trường kho**

-   Font tối thiểu 16px cho label, 20px cho số liệu --- đủ đọc khi tay đeo găng

-   Tất cả button tác vụ chính cao tối thiểu 56px --- dễ bấm trên tablet

-   Tránh hover state --- không có ý nghĩa trên touchscreen

-   Chế độ high-contrast tùy chọn cho kho thiếu sáng

-   Màn hình không tự timeout khi đang nhập liệu --- tránh mất dữ liệu giữa chừng

**8.2 Xử lý offline / mất mạng**

-   Dữ liệu nhập tay được cache local --- đồng bộ lên server khi có mạng trở lại

-   Hiển thị icon cảnh báo rõ ràng khi đang ở chế độ offline

-   Không block thao tác vì mất mạng --- chỉ cảnh báo

> *💡 Môi trường kho thường có WiFi không ổn định. Thiết kế phải chịu được gián đoạn mạng ngắn.*

**8.3 Các tính năng bỏ hoặc đơn giản hóa**

So với tài liệu nghiệp vụ gốc, các tính năng sau được đơn giản hóa hoặc bỏ khỏi luồng chính:

  ------------------------------------------------------------------------------------------------------------------------------------
  **Tính năng**                         **Quyết định**             **Lý do**
  ------------------------------------- -------------------------- -------------------------------------------------------------------
  Kiểm nghiệm lab (4.4)                 Bỏ khỏi UI kho             Do lab riêng xử lý, không cần nhân viên kho thao tác

  AQL sampling phức tạp                 Đơn giản hóa thành %       Nhân viên kho không cần biết AQL, chỉ cần biết lấy bao nhiêu mẫu

  Farming log / traceability chi tiết   Tách sang module riêng     Thông tin này dành cho quản lý, không phải nhân viên nhận hàng

  Xếp bin location thủ công             Hệ thống đề xuất tự động   WMS tự gán slot dựa trên SKU và nhiệt độ yêu cầu

  Ký tên tài xế bắt buộc                Tùy chọn                   Nhiều trường hợp tài xế vội, thông tin xe và PO đủ làm bằng chứng
  ------------------------------------------------------------------------------------------------------------------------------------

**9. Tóm tắt cải tiến**

  ---------------------------------------------------------------------------------------------
  **Tiêu chí**           **Giao diện cũ**      **Giao diện mới**
  ---------------------- --------------------- ------------------------------------------------
  Số màn hình            1 màn hình duy nhất   4 màn hình theo luồng rõ ràng

  Thông tin hiển thị     Chỉ ô nhập PO         Đầy đủ thông tin NCC, hàng hóa, trạng thái

  Nhập liệu              Nhập tay 100%         Scan QR chính, nhập tay chỉ khi ngoại lệ

  Kiểm soát lệch lượng   Không có              Tự động so sánh, màu sắc cảnh báo, yêu cầu ảnh

  Bao bì bất thường      Không có              Dropdown + flag sang QC

  Thông báo đội QC       Không có              Tự động push notification

  Biên bản điện tử       Không có              Ký số 2 bên, PDF tự động

  Trạng thái lô hàng     Không có              Badge màu, realtime, nhìn thấy từ Dashboard
  ---------------------------------------------------------------------------------------------

*Tài liệu này mô tả thiết kế giao diện --- không bao gồm code implementation.*