import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 

// Bắt buộc Next.js không cache kết quả của API này
export const dynamic = 'force-dynamic';

// ============================================================================
// 🚀 [GET] LẤY DANH SÁCH ĐƠN HÀNG CHO ADMIN
// ============================================================================
export async function GET() {
  try {
    const orders = await prisma.don_hang.findMany({
      include: {
        // Lấy thông tin user (Lội qua bảng ho_so_nguoi_dung như đã fix)
        nguoi_dung: {
          select: {
            id: true,
            email: true,
            ho_so_nguoi_dung: true 
          }
        },
        // Lấy chi tiết đơn hàng để Admin xem
        chi_tiet_don_hang: true 
      },
      orderBy: { 
        ngay_tao: 'desc' 
      }
    });

    return NextResponse.json(orders);
    
  } catch (error: any) {
    console.error("❌ Lỗi GET Admin Orders:", error.message);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tải đơn hàng" }, 
      { status: 500 }
    );
  }
}

// ============================================================================
// 🚀 [PUT] CẬP NHẬT TRẠNG THÁI + HOÀN KHO + GHI LỊCH SỬ (DÙNG TRANSACTION)
// ============================================================================
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    // adminId truyền từ fontend lên (nếu có hệ thống đăng nhập Admin)
    const { orderId, status, adminId = 1 } = body; 

    if (!orderId || !status) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin cập nhật" }, { status: 400 });
    }

    // 🔥 BẮT ĐẦU TRANSACTION: TẤT CẢ CÙNG THÀNH CÔNG HOẶC CÙNG THẤT BẠI
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Lấy thông tin đơn hàng hiện tại
      const oldOrder = await tx.don_hang.findUnique({ 
        where: { id: Number(orderId) },
        include: { chi_tiet_don_hang: true } // Lấy luôn chi tiết để lát nữa cần thì hoàn kho
      });

      if (!oldOrder) throw new Error("Không tìm thấy đơn hàng");

      // 2. Cập nhật trạng thái mới cho đơn hàng
      const updatedOrder = await tx.don_hang.update({
        where: { id: Number(orderId) },
        data: { trang_thai: status }
      });

      // 3. LOGIC HOÀN KHO KHI HỦY ĐƠN
      // Nếu trạng thái mới là DA_HUY và trạng thái cũ CHƯA PHẢI là DA_HUY
    //   if (status === 'DA_HUY' && oldOrder.trang_thai !== 'DA_HUY') {
    //     for (const item of oldOrder.chi_tiet_don_hang) {
    //       // Lưu ý: Đổi tên cột `ma_bien_the` và `so_luong` cho đúng với file schema.prisma của bạn
    //       await tx.bien_the_san_pham.update({
    //         where: { id: item.ma_bien_the },
    //         data: {
    //           so_luong_ton: {
    //             increment: item.so_luong // CỘNG TRẢ LẠI KHO
    //           }
    //         }
    //       });
    //     }
    //   }

      // 4. GHI LẠI NHẬT KÝ (LỊCH SỬ ĐƠN HÀNG)
      // ⚠️ Lưu ý: Nếu trong file schema.prisma của bạn CHƯA TẠO bảng lich_su_don_hang thì TẠM THỜI XÓA/COMMENT đoạn số 4 này đi để không bị lỗi nhé!
      /*
      await tx.lich_su_don_hang.create({
        data: {
          ma_don_hang: Number(orderId),
          ma_nguoi_thuc_hien: adminId,
          trang_thai_truoc: oldOrder.trang_thai,
          trang_thai_sau: status,
          ghi_chu: `Admin đã đổi trạng thái thành ${status}`,
        }
      });
      */

      return updatedOrder; // Trả về kết quả sau khi hoàn tất chuỗi logic
    });

    return NextResponse.json({ 
      success: true, 
      message: "Cập nhật và xử lý dữ liệu thành công!", 
      data: result 
    });

  } catch (error: any) {
    console.error("🔥 LỖI TRANSACTION PUT ORDERS:", error.message);
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi hệ thống khi cập nhật DB" }, 
      { status: 500 }
    );
  }
}