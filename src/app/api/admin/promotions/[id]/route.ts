import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const promoId = parseInt(params.id);
    const body = await request.json();

    const updated = await prisma.ma_giam_gia.update({
      where: { id: promoId },
      data: {
        ma_code: body.ma_code.toUpperCase(),
        loai_giam_gia: body.loai_giam_gia || "PHAN_TRAM",
        gia_tri_giam: body.gia_tri_giam ? parseFloat(body.gia_tri_giam) : null,
        don_toi_thieu: body.don_toi_thieu ? parseFloat(body.don_toi_thieu) : null,
        gioi_han_su_dung: body.gioi_han_su_dung ? parseInt(body.gioi_han_su_dung) : null,
        ngay_bat_dau: body.ngay_bat_dau ? new Date(body.ngay_bat_dau) : null,
        ngay_ket_thuc: body.ngay_ket_thuc ? new Date(body.ngay_ket_thuc) : null,
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi cập nhật mã giảm giá" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const promoId = parseInt(params.id);

    await prisma.ma_giam_gia.delete({ where: { id: promoId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Không thể xóa vì mã này đã được khách sử dụng!" }, { status: 500 });
  }
}