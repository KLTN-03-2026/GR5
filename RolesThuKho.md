Luồng thực tế — Thủ kho kiêm kế toán (doanh nghiệp nhỏ)
Với doanh nghiệp nhỏ bán nông sản, thực tế thường chỉ có 2 người quản lý:

Admin/Chủ — quyết định chiến lược, xem báo cáo tổng
Thủ kho kiêm kế toán — lo toàn bộ vận hành kho + sổ sách tiền nong


Phân chia công việc thực tế
Admin/Chủ làm gì:

Xem doanh thu, báo cáo tổng hợp
Duyệt các khoản chi lớn (thanh toán NCC lớn, nhập hàng số lượng lớn)
Quyết định chiến lược khuyến mãi
Quản lý nhân sự (xếp ca, duyệt nghỉ phép, tính lương)

Thủ kho kiêm kế toán làm gì:

Gọi điện đặt hàng NCC
Tạo đơn đặt hàng trong hệ thống
Duyệt phiếu nhập từ nhân viên
Theo dõi và ghi nhận công nợ NCC
Xử lý cảnh báo hàng sắp hết hạn
Theo dõi tồn kho, sơ đồ kho
Xem báo cáo nhập xuất hàng ngày


Luồng đầy đủ
Luồng nhập hàng
Hệ thống cảnh báo tồn kho thấp HOẶC thủ kho tự nhận thấy
↓
Thủ kho gọi điện NCC đặt hàng
↓
Thủ kho tạo đơn đặt hàng trong hệ thống
  → Chọn NCC, sản phẩm, số lượng dự kiến, ngày giao dự kiến
  → Trạng thái: CHO_GIAO_HANG
↓
NCC giao hàng đến kho
↓
Nhân viên nhận hàng
  → Mở đơn đặt hàng tương ứng trên /staff
  → Điền số lượng thực nhận, HSD từng sản phẩm
  → Chụp ảnh nếu hàng có vấn đề
  → Gửi phiếu nhập lên thủ kho
↓
Thủ kho nhận thông báo → vào duyệt
  → Xem chênh lệch đặt vs thực nhận
  → Nếu ổn: duyệt → hàng vào kho → nhân viên in QR dán thùng
  → Nếu thiếu/hỏng: duyệt số thực nhận + ghi chú gọi NCC giao bù
  → Nếu số liệu nghi sai: từ chối → nhân viên đếm lại
↓
Sau khi duyệt
  → Tồn kho tự động cộng vào
  → Công nợ NCC tự động phát sinh
  → Nhân viên nhận thông báo vào in QR
Luồng thanh toán NCC
Thủ kho xem tab Công nợ của từng NCC
↓
Đến hạn thanh toán (theo chu kỳ đã cấu hình)
↓
Nếu số tiền nhỏ (dưới ngưỡng cấu hình)
  → Thủ kho tự ghi nhận thanh toán luôn
Nếu số tiền lớn (trên ngưỡng)
  → Thủ kho tạo "Yêu cầu thanh toán" → Admin duyệt
  → Admin duyệt → Thủ kho thực hiện chuyển khoản
  → Ghi nhận vào hệ thống kèm mã giao dịch
Luồng xử lý hàng sắp hết hạn
Hệ thống tự động quét mỗi sáng → tạo cảnh báo
↓
Thủ kho thấy thông báo → vào tab Cảnh báo HSD
↓
Với hàng đã hết hạn hoặc hỏng
  → Nhân viên đã đề xuất tiêu hủy
  → Thủ kho duyệt tiêu hủy (không cần lên Admin)
  → Nhân viên thực hiện → xác nhận hoàn tất → tồn kho trừ
↓
Với hàng sắp hết hạn còn dùng được
  → Thủ kho quyết định xả kho giảm giá
  → Tự tạo khuyến mãi luôn, không cần Admin duyệt
  → Hoặc báo Admin nếu muốn chạy campaign lớn hơn

Giao diện cho Thủ kho
Thủ kho không dùng /staff vì phức tạp hơn nhân viên vận hành, cũng không dùng Admin vì không cần hết mọi thứ. Làm route riêng /warehouse-manager với sidebar gồm:

Đơn đặt hàng NCC
Duyệt phiếu nhập
Sơ đồ & Tồn kho
Cảnh báo HSD
Nhà cung cấp & Công nợ
Báo cáo nhập xuất

Gọn hơn Admin, nhiều hơn nhân viên vận hành — đúng với vai trò thực tế.