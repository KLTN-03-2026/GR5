import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.code);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Mã PO không hợp lệ' }, { status: 400 });
    }

    const { status } = await request.json();

    const po = await prisma.phieu_nhap_kho.update({
      where: { id },
      data: {
        trang_thai: status // PENDING -> RECEIVING
      }
    });

    const user = await prisma.nguoi_dung.findFirst();

    // Ghi log receiving (giả định ma_nguoi_dung = 1 cho demo)
    await prisma.lich_su_nhan_hang.create({
      data: {
        ma_phieu_nhap: id,
        ma_nguoi_dung: user?.id || 1, // Lấy từ auth session trong thực tế
        hanh_dong: 'CHECK_IN',
        ghi_chu: `Đổi trạng thái sang ${status}`,
      }
    });

    return NextResponse.json({ success: true, po });
  } catch (error: any) {
    console.error('[PUT /api/admin/warehouse/receiving/po/[code]/status]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
