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
          select: { ho_ten: true, email: true }
        }
      },
      orderBy: { id: 'desc' } // Sắp xếp mới nhất lên đầu
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("LỖI LẤY ĐÁNH GIÁ:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}