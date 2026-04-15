import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    
    // Chỉ lấy những mã Đang chạy và Còn hạn sử dụng
    const coupons = await prisma.ma_giam_gia.findMany({
      where: {
        OR: [
          { ngay_ket_thuc: null },
          { ngay_ket_thuc: { gte: now } }
        ]
      },
      orderBy: { id: 'desc' }
    });
    
    return NextResponse.json(coupons);
  } catch (error) {
    console.error("LỖI LẤY VOUCHER:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}