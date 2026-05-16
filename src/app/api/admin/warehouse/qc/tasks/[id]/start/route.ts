import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Mã task không hợp lệ' }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }
    const user = await prisma.nguoi_dung.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'Tài khoản không tồn tại' }, { status: 401 });
    }

    const task = await prisma.nhiem_vu_kiem_dinh.update({
      where: { id },
      data: {
        trang_thai: 'QC_IN_PROGRESS',
        ma_nguoi_kiem_tra: user.id,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error('[PUT /api/admin/warehouse/qc/tasks/[id]/start]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
