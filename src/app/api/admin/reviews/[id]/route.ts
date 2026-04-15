import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const reviewId = parseInt(params.id);
    const body = await request.json();

    // Giả sử bảng danh_gia_san_pham có cột trang_thai (VD: "HIEN_THI" hoặc "DA_AN")
    // Nếu team sếp dùng cột boolean (VD: hien_thi: true/false) thì sếp sửa lại chỗ này nhé.
    const updated = await prisma.danh_gia_san_pham.update({
      where: { id: reviewId },
      data: { trang_thai: body.trang_thai } 
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi cập nhật trạng thái" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const reviewId = parseInt(params.id);

    await prisma.danh_gia_san_pham.delete({ where: { id: reviewId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi khi xóa đánh giá" }, { status: 500 });
  }
}