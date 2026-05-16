import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    const { trang_thai, ma_nguoi_duyet, phan_hoi_admin } = await req.json();

    if (!trang_thai || !['DA_DUYET', 'TU_CHOI'].includes(trang_thai)) {
      return NextResponse.json({ success: false, message: 'Trạng thái không hợp lệ' }, { status: 400 });
    }

    await prisma.don_xin_nghi.update({
      where: { id },
      data: {
        trang_thai,
        nguoi_duyet_id: ma_nguoi_duyet ?? null,
        ly_do_tu_choi: trang_thai === 'TU_CHOI' ? (phan_hoi_admin || null) : null,
      }
    });

    return NextResponse.json({ success: true, message: 'Cập nhật trạng thái đơn thành công' });
  } catch (error) {
    console.error('[API_NGHI_PHEP_UPDATE]', error);
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật đơn' }, { status: 500 });
  }
}