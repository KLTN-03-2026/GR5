import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📦 Dữ liệu FE gửi lên:", JSON.stringify(body, null, 2));

    // BƯỚC 1: Lấy User ID (Tạm thời fix cứng hoặc lấy từ body)
    const maNguoiDung = Number(body.ma_nguoi_dung) || 1;

    // Kiểm tra xem User này có tồn tại không
    const userExists = await prisma.nguoi_dung.findUnique({
      where: { id: maNguoiDung }
    });

    if (!userExists) {
      return NextResponse.json({ 
        success: false, 
        message: `Người dùng có ID ${maNguoiDung} không tồn tại trong CSDL.` 
      }, { status: 400 });
    }

    // BƯỚC 2: TẠO ĐƠN HÀNG (Sử dụng đúng các trường trong Schema)
    const newOrder = await prisma.don_hang.create({
      data: {
        // Nối với bảng nguoi_dung
        nguoi_dung: {
          connect: { id: maNguoiDung }
        },
        tong_tien: Number(body.tong_tien),
        phi_van_chuyen: 15000, // Cứng phí ship như FE
        trang_thai: "CHO_XAC_NHAN",
        
        // --- CHÚ Ý ---
        // Không có các cột: ghi_chu, phuong_thuc_thanh_toan, ma_dia_chi trong bảng don_hang
        // Nên chúng ta không truyền vào đây để tránh lỗi Prisma.
      }
    });

    console.log("✅ Đã tạo đơn hàng thành công, ID:", newOrder.id);

    // BƯỚC 3: TẠO GIAO DỊCH THANH TOÁN
    // Vì bảng don_hang không lưu phương thức, ta phải tạo một dòng bên bảng giao_dich_thanh_toan
    // Lưu ý: ma_phuong_thuc = 1 (Tiền mặt), 2 (MoMo), 3 (VNPay) - Tùy bạn quy định trong DB
    let phuongThucId = 1; 
    if (body.phuong_thuc_thanh_toan === 'momo') phuongThucId = 2;
    if (body.phuong_thuc_thanh_toan === 'vnpay') phuongThucId = 3;

    try {
      await prisma.giao_dich_thanh_toan.create({
        data: {
          don_hang: { connect: { id: newOrder.id } },
          // Chú ý: Cần chắc chắn trong bảng phuong_thuc_thanh_toan đã có các id 1, 2, 3
          // Nếu bảng đó trống, Prisma sẽ báo lỗi khóa ngoại ở đây.
          // Tạm thời mình comment lại nếu bạn chưa thiết lập data cho bảng phuong_thuc_thanh_toan
          /* phuong_thuc_thanh_toan: { connect: { id: phuongThucId } },
          */
          so_tien: newOrder.tong_tien,
          trang_thai: "CHO_THANH_TOAN",
        }
      });
      console.log("✅ Đã tạo giao dịch thanh toán chờ xử lý.");
    } catch (e) {
      console.warn("⚠️ Không tạo được giao dịch thanh toán (Có thể do bảng phuong_thuc_thanh_toan trống).");
      // Cứ bỏ qua lỗi này để test VNPay trước
    }

    // BƯỚC 4: LƯU CHI TIẾT ĐƠN HÀNG (Nếu ID biến thể có thật)
    try {
        if (body.items && body.items.length > 0) {
            for (const item of body.items) {
                // Kiểm tra xem ID biến thể này có thật không
                const bienTheExists = await prisma.bien_the_san_pham.findUnique({
                    where: { id: Number(item.id) }
                });

                if (bienTheExists) {
                    await prisma.chi_tiet_don_hang.create({
                        data: {
                            don_hang: { connect: { id: newOrder.id } },
                            bien_the_san_pham: { connect: { id: bienTheExists.id } },
                            so_luong: item.qty,
                            don_gia: item.price
                        }
                    });
                }
            }
            console.log("✅ Đã lưu chi tiết món hàng.");
        }
    } catch (e) {
         console.warn("⚠️ Bỏ qua lỗi lưu chi tiết đơn hàng.");
    }

    // TRẢ VỀ ORDER ID ĐỂ FRONTEND GỌI TIẾP VNPAY
    return NextResponse.json({ 
      success: true, 
      orderId: newOrder.id 
    });

  } catch (error: any) {
    console.error("🔥 LỖI TẠO ĐƠN PRISMA CHI TIẾT:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Lỗi tạo đơn: " + error.message 
    }, { status: 500 });
  }
}