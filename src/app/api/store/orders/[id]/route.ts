import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ma_nguoi_dung, ma_dia_chi, tong_tien, items, ghi_chu, phuong_thuc_thanh_toan } = body;

    // Dùng 'as any' để bỏ qua lỗi TS của ma_dia_chi nếu bạn chưa npx prisma generate thành công
    const newOrder = await (prisma.don_hang as any).create({
      data: {
        // SỬA LỖI UNKNOWN ARGUMENT: Dùng connect thay vì gán trực tiếp ID
        nguoi_dung: {
          connect: { id: Number(ma_nguoi_dung || 1) } 
        },
        // ma_dia_chi nếu đã db push thì gán trực tiếp được
        ma_dia_chi: ma_dia_chi ? Number(ma_dia_chi) : null,
        
        tong_tien: Number(tong_tien),
        ghi_chu: ghi_chu || "",
        phuong_thuc_thanh_toan: phuong_thuc_thanh_toan || "cod",
        trang_thai: "CHO_XAC_NHAN",

        chi_tiet_don_hang: {
          create: items.map((item: any) => ({
            ma_bien_the: Number(item.ma_bien_the || item.id),
            so_luong: Number(item.so_luong),
            don_gia: Number(item.gia_ban), // Lưu vào DB là don_gia
          }))
        }
      }
    });

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error: any) {
    console.error("❌ Lỗi POST đơn hàng:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || "1";

    const orders = await prisma.don_hang.findMany({
      where: { 
        ma_nguoi_dung: Number(userId) 
      },
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
      orderBy: {
        id: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("❌ Lỗi GET đơn hàng:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}