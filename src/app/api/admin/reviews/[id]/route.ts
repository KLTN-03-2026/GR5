import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const reviewId = parseInt(id);
    const body = await request.json();

    const data: any = {};
    if (body.trang_thai    !== undefined) data.trang_thai   = body.trang_thai;
    if (body.phan_hoi_admin !== undefined) {
      data.phan_hoi_admin = body.phan_hoi_admin;
      data.ngay_phan_hoi  = body.phan_hoi_admin ? new Date() : null;
    }

    const updated = await prisma.danh_gia_san_pham.update({
      where: { id: reviewId },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi cập nhật" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await prisma.danh_gia_san_pham.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi khi xóa" }, { status: 500 });
  }
}
