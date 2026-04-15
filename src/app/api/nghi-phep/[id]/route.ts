import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const { trang_thai, ma_nguoi_duyet, phan_hoi_admin } = await req.json();

    const updateDon = await prisma.don_xin_nghi.update({
      where: { id },
      data: {
        trang_thai,
        ma_nguoi_duyet,
        phan_hoi_admin,
        ngay_duyet: new Date()
      }
    });

    return NextResponse.json({ success: true, message: 'Cập nhật trạng thái đơn thành công' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật đơn' }, { status: 500 });
  }
}