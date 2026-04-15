import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: { id: string };
}

// DELETE: Hủy phân ca
export async function DELETE(req: Request, context: RouteContext) {
  try {
    const maLich = Number(context.params.id);
    if (isNaN(maLich)) {
      return NextResponse.json({ success: false, message: 'ID không hợp lệ' }, { status: 400 });
    }

    // Lấy thông tin lịch phân ca trước khi xóa
    const lich = await prisma.lich_phan_cong_ca.findUnique({
      where: { id: maLich }
    });

    if (!lich) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy lịch phân ca' }, { status: 404 });
    }

    // Optional: Nếu bạn muốn cấm admin xóa lịch của ngày hôm qua
    const targetDate = new Date(lich.ngay_lam_viec!);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (targetDate < startOfToday) {
      return NextResponse.json({ success: false, message: 'Không thể hủy lịch phân ca của ngày trong quá khứ' }, { status: 403 });
    }

    await prisma.lich_phan_cong_ca.delete({
      where: { id: maLich }
    });

    return NextResponse.json({ success: true, message: 'Hủy phân ca thành công' }, { status: 200 });

  } catch (error) {
    console.error('[API_DELETE_PHAN_CA] Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống khi hủy phân ca' }, { status: 500 });
  }
}