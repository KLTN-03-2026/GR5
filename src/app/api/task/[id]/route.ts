import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT: Cập nhật trạng thái Task (Dùng khi kéo thả)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const { trang_thai } = await req.json(); // TODO, IN_PROGRESS, DONE

    const updateTask = await prisma.nhiem_vu_cong_viec.update({
      where: { id },
      data: { trang_thai }
    });

    return NextResponse.json({ success: true, data: updateTask });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật task' }, { status: 500 });
  }
}