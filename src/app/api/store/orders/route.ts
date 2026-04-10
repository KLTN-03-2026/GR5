import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ma_nguoi_dung, tong_tien, items, ghi_chu } = body;

    // KHÔNG DÙNG "as any" NỮA, VIẾT CHUẨN ĐỂ PRISMA KHÔNG BÁO LỖI
    const newOrder = await prisma.don_hang.create({
      data: {
        // 1. Kết nối user đúng chuẩn Prisma
        nguoi_dung: {
          connect: { id: Number(ma_nguoi_dung || 1) }
        },
        
        // (Tạm thời KHÔNG LƯU ma_dia_chi ở đây để tránh lỗi Database)

        tong_tien: Number(tong_tien || 0),
        trang_thai: "CHO_XAC_NHAN",

        // 2. Lưu chi tiết đơn: Đảm bảo nhét tiền vào cột 'don_gia'
        chi_tiet_don_hang: {
          create: items.map((item: any) => ({
            ma_bien_the: Number(item.ma_bien_the || item.id),
            so_luong: Number(item.so_luong || 1),
            don_gia: Number(item.gia_ban || item.don_gia || 0), // Lấy đúng giá
          }))
        }
      }
    });

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error: any) {
    console.error("❌ Lỗi POST đơn hàng (Runtime):", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

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
                san_pham: true
              }
            }
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("❌ Lỗi GET đơn hàng:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// THÊM ĐOẠN NÀY VÀO CUỐI FILE route.ts

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { orderId, action, reason } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Thiếu ID đơn hàng" }, { status: 400 });
    }

    // NẾU LÀ YÊU CẦU ĐỔI TRẢ
    if (action === "RETURN") {
      // Vì mình không rõ chính xác các cột trong bảng yeu_cau_doi_tra của bạn, 
      // nên cách an toàn nhất (không bị đỏ code) là Cập nhật trực tiếp trạng thái của đơn hàng đó.
      const updatedOrder = await prisma.don_hang.update({
        where: { id: Number(orderId) },
        data: ({
          trang_thai: "YEU_CAU_DOI_TRA", // Đổi trạng thái đơn để Admin dễ thấy
        } as any)
      });

      // LƯU Ý: Nếu bảng yeu_cau_doi_tra của bạn có trường ly_do, bạn có thể thay đoạn data ở trên thành:
      /*
      data: {
        trang_thai: "YEU_CAU_DOI_TRA",
        yeu_cau_doi_tra: {
          create: {
            // Nhập tên cột lý do của bạn vào đây, ví dụ:
            ly_do_doi_tra: reason 
          }
        }
      }
      */

      return NextResponse.json({ success: true, message: "Đã gửi yêu cầu thành công!" });
    }

    return NextResponse.json({ success: false, message: "Hành động không hợp lệ" }, { status: 400 });
    
  } catch (error: any) {
    console.error("❌ Lỗi PUT đơn hàng:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}