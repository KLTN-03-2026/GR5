  import { NextResponse } from "next/server";
  import prisma from "@/lib/prisma";

  export const dynamic = 'force-dynamic';

  // ============================================================================
  // 🚀 [POST] TẠO ĐƠN HÀNG MỚI (CỦA KHÁCH HÀNG)
  // ============================================================================
  export async function POST(req: Request) {
    try {
      const body = await req.json();
      const { ma_nguoi_dung, tong_tien, items, ghi_chu } = body;

      const newOrder = await prisma.don_hang.create({
        // 💡 Dùng 'as any' để ép TypeScript bỏ qua lỗi cache của Prisma với cột ghi_chu
        data: {
          nguoi_dung: {
            connect: { id: Number(ma_nguoi_dung || 1) }
          },
          // ghi_chu: ghi_chu || null,
          tong_tien: Number(tong_tien || 0),
          trang_thai: "CHO_XAC_NHAN",
          chi_tiet_don_hang: {
            create: items.map((item: any) => ({
              ma_bien_the: Number(item.ma_bien_the || item.id),
              so_luong: Number(item.so_luong || 1),
              don_gia: Number(item.gia_ban || item.don_gia || 0), 
            }))
          }
        } as any 
      });

      return NextResponse.json({ success: true, orderId: newOrder.id });
    } catch (error: any) {
      console.error("❌ Lỗi POST đơn hàng:", error.message);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  // ============================================================================
  // 🚀 [GET] LẤY DANH SÁCH ĐƠN HÀNG (ĐỂ HIỂN THỊ TRÊN TRANG CỦA KHÁCH)
  // ============================================================================
  export async function GET(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get('userId') || "1";

      const orders = await prisma.don_hang.findMany({
        where: { ma_nguoi_dung: Number(userId) },
        include: {
          chi_tiet_don_hang: {
            include: {
              bien_the_san_pham: {
                include: {
                  san_pham: true,
                }
              }
            }
          },
          don_van_chuyen: true, 
          yeu_cau_doi_tra: true // Kéo thông tin đổi trả ra để giao diện hiển thị
        },
        orderBy: { id: 'desc' }
      });

      return NextResponse.json(orders);
    } catch (error: any) {
      console.error("❌ Lỗi GET đơn hàng:", error.message);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  // ============================================================================
  // 🚀 [PUT] CẬP NHẬT ĐƠN HÀNG (DÙNG ĐỂ GỬI YÊU CẦU ĐỔI TRẢ)
  // ============================================================================
  export async function PUT(req: Request) {
    try {
      const body = await req.json();
      
      // Nhận thêm mảng images (Base64) từ Frontend gửi lên
      const { orderId, action, reason, images } = body; 

      if (!orderId) {
        return NextResponse.json({ success: false, message: "Thiếu ID đơn hàng" }, { status: 400 });
      }

      // NẾU LÀ YÊU CẦU ĐỔI TRẢ TỪ KHÁCH HÀNG
      if (action === "RETURN") {
        // 1. Lấy thông tin đơn hàng để biết ma_nguoi_dung là ai
        const order = await prisma.don_hang.findUnique({
          where: { id: Number(orderId) },
          select: { ma_nguoi_dung: true } 
        });

        if (!order) {
          return NextResponse.json({ success: false, message: "Đơn hàng không tồn tại" }, { status: 404 });
        }

        // 2. Chuyển mảng ảnh Base64 thành chuỗi JSON để lưu vào cột anh_minh_chung
        const hinhAnhJson = images && images.length > 0 ? JSON.stringify(images) : null;

        // 3. Dùng Nested Update của Prisma: Đổi trạng thái đơn + Tạo phiếu đổi trả
     const updatedOrder = await prisma.don_hang.update({
  where: { id: Number(orderId) },
  data: {
    trang_thai: "YEU_CAU_DOI_TRA",
    yeu_cau_doi_tra: {
      create: {
        nguoi_dung: order.ma_nguoi_dung ? {
          connect: { id: Number(order.ma_nguoi_dung) }
        } : undefined,
        loai_yeu_cau: "HOAN_TRA", 
        // ly_do_hoan_tra: reason,      // Sẽ không còn báo lỗi gạch đỏ nữa
        // anh_minh_chung: hinhAnhJson, 
        trang_thai: "CHO_DUYET" 
      }
    }
  } // KHÔNG CẦN 'as any' NỮA
});
        return NextResponse.json({ 
          success: true, 
          message: "Đã gửi yêu cầu thành công!",
          data: updatedOrder
        });
      }

      return NextResponse.json({ success: false, message: "Hành động không hợp lệ" }, { status: 400 });
      
    } catch (error: any) {
      console.error("🔥 LỖI PUT đơn hàng:", error.message);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }