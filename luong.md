# Quy trình "Xem xét và phê duyệt phiếu nhập kho"

Quy trình này chia luồng nhập hàng thành **2 bước độc lập (2-step verification)** nhằm đảm bảo tính minh bạch, chính xác giữa số lượng đặt mua và số lượng thực nhận tại kho, đồng thời tránh thất thoát.

## 1. Bước 1: Nhân viên tiếp nhận và cập nhật số lượng (Kiểm đếm thực tế)
- **Ai thực hiện:** Nhân viên kho / Thủ kho.
- **Hoàn cảnh:** Khi xe tải của Nhà Cung Cấp (NCC) giao hàng tới kho dựa trên "Đơn đặt hàng" (Phiếu nhập đang ở trạng thái `CHO_GIAO_HANG` hoặc `CHO_KIEM_TRA`).
- **Hành động:** 
  - Nhân viên bốc dỡ hàng và đối chiếu số lượng thực tế so với số lượng ghi trên giấy tờ.
  - Nếu phát hiện hàng bị thiếu, hư hỏng, hoặc móp méo, nhân viên sẽ **cập nhật lại số lượng thực nhận** vào hệ thống (có thể ít hơn số lượng đặt mua).
  - Nhân viên phải điền **Ghi chú kiểm tra** (`ghi_chu_kiem_tra`) và **Lý do chênh lệch** (`ly_do_chenh_lech`) giải thích tại sao số lượng thực tế lại khác.
  - Sau khi hoàn tất, nhân viên "Xác nhận kiểm tra". Phiếu nhập lúc này vẫn **chưa** được cộng vào Tồn kho chính thức.

## 2. Bước 2: Xem xét và phê duyệt phiếu nhập (Quyết định cuối cùng)
- **Ai thực hiện:** Quản lý kho / Admin.
- **Hoàn cảnh:** Quản lý xem danh sách các phiếu nhập đã được nhân viên kho kiểm đếm xong.
- **Hành động:**
  - Quản lý sẽ nhìn thấy báo cáo chênh lệch: *Ví dụ: Đặt mua 100 thùng, nhưng nhân viên báo chỉ nhận được 90 thùng do 10 thùng bị móp méo*.
  - Dựa vào lý do chênh lệch và bằng chứng, Quản lý có quyền đưa ra quyết định:
    1. **Duyệt & Nhập kho (`HOAN_THANH`)**: Đồng ý với số lượng thực nhận (90 thùng). Hệ thống chính thức **cộng 90 thùng vào Tồn kho** (`ton_kho_tong`) và ghi nhận công nợ phải trả cho NCC tương ứng với 90 thùng. Cập nhật `ngay_duyet`.
    2. **Từ chối / Yêu cầu kiểm tra lại**: Nếu thấy lý do chênh lệch không hợp lý, Quản lý có thể từ chối phiếu nhập hoặc yêu cầu nhân viên kho đếm lại hàng.

### Tại sao cần luồng này?
- **Chống gian lận:** Tách biệt quyền "Người đếm hàng" và "Người duyệt công nợ", nhân viên kho không thể tự ý thay đổi số liệu tồn kho hoặc công nợ tài chính.
- **Minh bạch với NCC:** Chỉ thanh toán tiền cho NCC dựa trên số lượng hàng thực tế đạt chất lượng được Quản lý phê duyệt, không phải số lượng trên lý thuyết.
