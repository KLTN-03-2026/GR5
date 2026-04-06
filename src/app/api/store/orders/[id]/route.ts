import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Phải dùng findUnique vì mình chỉ lấy 1 đơn hàng theo ID
    const order = await prisma.don_hang.findUnique({
      where: { id: Number(id) }, // Ép kiểu ID về số
      include: {
        nguoi_dung: { 
          include: { 
            ho_so_nguoi_dung: true, 
            dia_chi_nguoi_dung: { where: { la_mac_dinh: true } } 
          } 
        },
        chi_tiet_don_hang: { 
          include: { 
            bien_the_san_pham: { include: { san_pham: true } } 
          } 
        },
        ma_giam_gia: true
      }
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    // 2. QUAN TRỌNG: Trả về biến tên là 'order' (không có chữ s) để khớp với Frontend
    return NextResponse.json({ success: true, order });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}