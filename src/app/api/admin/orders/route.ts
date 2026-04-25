import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 

// Bắt buộc Next.js không cache kết quả của API này
export const dynamic = 'force-dynamic';

// ============================================================================
// 🚀 [GET] LẤY DANH SÁCH ĐƠN HÀNG CHO ADMIN
// ============================================================================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const date = searchParams.get("date") || "";

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { id: isNaN(Number(search)) ? undefined : Number(search) },
        { nguoi_dung: { email: { contains: search } } }
      ];
    }
    
    if (status && status !== 'Tất cả') {
      where.trang_thai = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.ngay_tao = {
        gte: startDate,
        lte: endDate
      };
    }

    const [total, orders] = await Promise.all([
      prisma.don_hang.count({ where }),
      prisma.don_hang.findMany({
        where,
        include: {
          nguoi_dung: {
            select: {
              id: true,
              email: true,
              ho_so_nguoi_dung: true 
            }
          },
          chi_tiet_don_hang: true,
          don_van_chuyen: true,
          yeu_cau_doi_tra: true 
        },
        orderBy: { 
          ngay_tao: 'desc' 
        },
        skip,
        take: limit,
      })
    ]);

    return NextResponse.json({
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
    
  } catch (error: any) {
    console.error("❌ Lỗi GET Admin Orders:", error.message);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tải đơn hàng" }, 
      { status: 500 }
    );
  }
}

// ============================================================================
// 🚀 [PUT] CẬP NHẬT TRẠNG THÁI ĐƠN & XỬ LÝ YÊU CẦU ĐỔI TRẢ
// ============================================================================
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    
    // Nhận thêm action và returnStatus để phân biệt luồng xử lý
    const { orderId, status, action, returnStatus, adminId = 1 } = body; 

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Thiếu ID đơn hàng" }, { status: 400 });
    }

    // 🔥 LUỒNG 1: XỬ LÝ DUYỆT / TỪ CHỐI ĐỔI TRẢ
    if (action === 'HANDLE_RETURN') {
      if (!returnStatus) return NextResponse.json({ success: false, message: "Thiếu trạng thái xử lý" }, { status: 400 });

      const returnResult = await prisma.$transaction(async (tx) => {
        // 1. Đổi trạng thái phiếu yêu cầu đổi trả
        await tx.yeu_cau_doi_tra.updateMany({
          where: { ma_don_hang: Number(orderId), trang_thai: 'CHO_DUYET' },
          data: { trang_thai: returnStatus } // 'DA_DUYET' hoặc 'TU_CHOI'
        });

        // 2. Định tuyến lại trạng thái của Đơn hàng gốc
        let newOrderStatus = '';
        if (returnStatus === 'DA_DUYET') {
          newOrderStatus = 'DA_HOAN_TRA'; // Hoặc trạng thái tương đương trong hệ thống của bạn
          
          /* (Tùy chọn) Logic hoàn kho nếu bạn muốn:
          const order = await tx.don_hang.findUnique({ where: { id: Number(orderId) }, include: { chi_tiet_don_hang: true }});
          for (const item of order!.chi_tiet_don_hang) {
            await tx.bien_the_san_pham.update({ where: { id: item.ma_bien_the }, data: { so_luong_ton: { increment: item.so_luong } }});
          }
          */
        } else if (returnStatus === 'TU_CHOI') {
          newOrderStatus = 'DA_GIAO'; // Bị từ chối thì đơn quay về trạng thái Đã giao
        }

        // 3. Cập nhật Đơn hàng
        const updatedOrder = await tx.don_hang.update({
          where: { id: Number(orderId) },
          data: { trang_thai: newOrderStatus }
        });

        return updatedOrder;
      });

      return NextResponse.json({ success: true, message: "Xử lý yêu cầu đổi trả thành công!", data: returnResult });
    }

    // 🔥 LUỒNG 2: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG BÌNH THƯỜNG (Code cũ của bạn)
    if (status) {
      const result = await prisma.$transaction(async (tx) => {
        const oldOrder = await tx.don_hang.findUnique({ 
          where: { id: Number(orderId) }
        });
        if (!oldOrder) throw new Error("Không tìm thấy đơn hàng");

        const updatedOrder = await tx.don_hang.update({
          where: { id: Number(orderId) },
          data: { trang_thai: status }
        });
        return updatedOrder; 
      });

      return NextResponse.json({ success: true, message: "Cập nhật trạng thái thành công!", data: result });
    }

    return NextResponse.json({ success: false, message: "Không có hành động nào được thực thi" }, { status: 400 });

  } catch (error: any) {
    console.error("🔥 LỖI TRANSACTION PUT ORDERS:", error.message);
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi hệ thống khi cập nhật DB" }, 
      { status: 500 }
    );
  }
}