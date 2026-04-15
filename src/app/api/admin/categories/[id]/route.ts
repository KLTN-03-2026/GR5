import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// SỬA DANH MỤC
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params; 
    const categoryId = parseInt(params.id);
    const body = await request.json();
    const { ten_danh_muc } = body;

    if (isNaN(categoryId) || !ten_danh_muc) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    const updated = await prisma.danh_muc.update({
      where: { id: categoryId },
      data: { ten_danh_muc },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

// XÓA DANH MỤC
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params; 
    const categoryId = parseInt(params.id);

    await prisma.danh_muc.delete({ where: { id: categoryId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2003') {
      return NextResponse.json({ error: "Không thể xóa vì đang có sản phẩm bên trong!" }, { status: 400 });
    }
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}