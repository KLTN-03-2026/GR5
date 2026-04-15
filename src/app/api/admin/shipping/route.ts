import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ============================================================================
// 🛠️ HÀM HELPER: TÍNH TOÁN NGÀY GIAO DỰ KIẾN THÔNG MINH
// ============================================================================
function calculateEstimatedDate(isInnerCity: boolean, partnerName: string): Date {
  const now = new Date();
  let transitDays = 0;

  // 1. Phân loại theo khu vực (Nội thành: 1 ngày, Ngoại thành: 3 ngày)
  transitDays += isInnerCity ? 1 : 3;

  // 2. Phân loại theo Đối tác (VD: GHTK giao nhanh hơn 1 ngày so với bưu điện)
  if (partnerName === 'GHTK') {
    transitDays -= 1; 
  }

  // 3. Thời gian đóng gói và lấy hàng (Lead time): Mặc định tốn 1 ngày
  const totalDays = transitDays + 1;
  
  now.setDate(now.getDate() + totalDays);
  return now;
}

// ============================================================================
// 🚀 [POST] GỬI BƯU TÁ VÀ TẠO VẬN ĐƠN MỚI
// ============================================================================
export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    // 1. Kiểm tra đơn hàng có tồn tại không
    const order = await prisma.don_hang.findUnique({
      where: { id: Number(orderId) },
      include: {
        nguoi_dung: { include: { ho_so_nguoi_dung: true } }
      }
    });

    if (!order) return NextResponse.json({ success: false, message: "Đơn hàng không tồn tại" }, { status: 404 });

    // 2. TÍNH TOÁN NGÀY DỰ KIẾN
    // (Trong thực tế, bạn sẽ lấy địa chỉ từ order để check xem là Nội hay Ngoại thành. Ở đây giả định là Nội thành)
    const isInnerCity = true; 
    const partnerName = "GHTK";
    const estimatedDate = calculateEstimatedDate(isInnerCity, partnerName);

    // 3. GIẢ LẬP GỌI API BƯU CỤC (Lấy mã vận đơn)
    const mockTrackingCode = "GHTK" + Math.random().toString(36).substring(2, 10).toUpperCase();

    // 4. TRANSACTION: Lưu dữ liệu đồng bộ vào MySQL
    const result = await prisma.$transaction(async (tx) => {
      
      // TẠO VẬN ĐƠN MỚI
      const shipment = await tx.don_van_chuyen.create({
        data: {
          ma_don_hang: order.id,
          ma_van_don: mockTrackingCode,
          trang_thai: "CHO_LAY_HANG",
          ngay_giao_du_kien: estimatedDate
          // 💡 Ghi chú: Khi nào bạn thêm data vào bảng doi_tac_van_chuyen thì mở dòng dưới ra
          // ma_doi_tac: 1, 
        }
      });

      // ĐỔI TRẠNG THÁI ĐƠN HÀNG CHÍNH SANG "ĐANG GIAO HÀNG"
      await tx.don_hang.update({
        where: { id: order.id },
        data: { trang_thai: "DANG_GIAO_HANG" }
      });

      return shipment;
    });

    return NextResponse.json({ success: true, data: result });

  } catch (error: any) {
    console.error("🔥 LỖI TẠO VẬN ĐƠN:", error.message); 
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ============================================================================
// 🚀 [PATCH] CẬP NHẬT LẠI NGÀY GIAO DỰ KIẾN
// ============================================================================
export async function PATCH(req: Request) {
  try {
    const { shipmentId, newDate } = await req.json();

    if (!shipmentId || !newDate) {
      return NextResponse.json({ success: false, message: "Thiếu dữ liệu cập nhật" }, { status: 400 });
    }

    // 💡 FIX LỖI 2: Kiểm tra xem ngày gửi lên có hợp lệ không trước khi đưa vào Prisma
    const parsedDate = new Date(newDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ success: false, message: "Định dạng ngày không hợp lệ" }, { status: 400 });
    }

    // Cập nhật ngày dự kiến mới vào database
    const updatedShipment = await prisma.don_van_chuyen.update({
      where: { id: Number(shipmentId) },
      data: { 
        ngay_giao_du_kien: parsedDate
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Đã cập nhật ngày dự kiến", 
      data: updatedShipment 
    });

  } catch (error: any) {
    console.error("🔥 LỖI CẬP NHẬT NGÀY:", error.message);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống: " + error.message }, { status: 500 });
  }
}



