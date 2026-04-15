import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params; 
    const contentId = parseInt(params.id);
    const body = await request.json();
    
    const thu_tu = parseInt(body.thu_tu_sap_xep);
    const safeThuTu = isNaN(thu_tu) ? 0 : thu_tu;

    const updated = await prisma.banner_quang_cao.update({
      where: { id: contentId },
      data: {
        tieu_de: body.tieu_de,
        duong_dan_anh: body.duong_dan_anh,
        thu_tu_sap_xep: safeThuTu,
        dang_hoat_dong: Boolean(body.dang_hoat_dong)
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi cập nhật" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params; 
    const contentId = parseInt(params.id);

    await prisma.banner_quang_cao.delete({ where: { id: contentId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi khi xóa" }, { status: 500 });
  }
}