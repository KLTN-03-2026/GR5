export const dynamic = 'force-dynamic'; // Tắt cache vĩnh viễn

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Lấy toàn bộ đánh giá, kèm theo tên Sản phẩm và tên Người dùng
    const reviews = await prisma.danh_gia_san_pham.findMany({
      include: {
        san_pham: {
          select: { ten_san_pham: true, anh_san_pham: { take: 1 } }
        },
        nguoi_dung: {
          // ĐÃ XÓA ho_ten. CHỈ LẤY EMAIL VÀ HO_SO_NGUOI_DUNG
          select: { 
            email: true,
            ho_so_nguoi_dung: true 
          }
        }
      },
      orderBy: { id: 'desc' }
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("LỖI LẤY ĐÁNH GIÁ:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}