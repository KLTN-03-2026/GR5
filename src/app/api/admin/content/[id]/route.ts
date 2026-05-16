import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const contentId = parseInt(id);
    const body = await request.json();
    const thu_tu = parseInt(body.thu_tu_sap_xep);

    const updated = await prisma.banner_quang_cao.update({
      where: { id: contentId },
      data: {
        tieu_de: body.tieu_de,
        mo_ta: body.mo_ta ?? null,
        duong_dan_anh: body.duong_dan_anh,
        lien_ket: body.lien_ket ?? null,
        loai_banner: body.loai_banner ?? "hero",
        thu_tu_sap_xep: isNaN(thu_tu) ? 0 : thu_tu,
        dang_hoat_dong: Boolean(body.dang_hoat_dong),
        ngay_bat_dau: body.ngay_bat_dau ? new Date(body.ngay_bat_dau) : null,
        ngay_ket_thuc: body.ngay_ket_thuc ? new Date(body.ngay_ket_thuc) : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi cập nhật" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await prisma.banner_quang_cao.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi khi xóa" }, { status: 500 });
  }
}
