import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, message: "Thiếu dữ liệu" }, { status: 400 });
    }

    // Cập nhật trạng thái trong bảng giao_dich_thanh_toan
    const updatedPayment = await prisma.giao_dich_thanh_toan.update({
      where: { id: Number(id) },
      data: { trang_thai: status }
    });

    return NextResponse.json({ success: true, data: updatedPayment });

  } catch (error: any) {
    console.error("Lỗi cập nhật thanh toán:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi cập nhật DB" }, 
      { status: 500 }
    );
  }
}