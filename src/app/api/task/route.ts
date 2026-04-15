import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Lấy danh sách Task (Có thể lọc theo nhân viên)
export async function GET(req: Request) {
  try {
    const tasks = await prisma.nhiem_vu_cong_viec.findMany({
      include: {
        nguoi_dung: {
          select: { ho_so_nguoi_dung: { select: { ho_ten: true, anh_dai_dien: true } } }
        }
      },
      orderBy: { id: 'desc' }
    });
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi lấy danh sách task' }, { status: 500 });
  }
}

// POST: Giao việc mới
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ma_nguoi_dung, tieu_de, mo_ta, han_hoan_thanh } = body;

    const newTask = await prisma.nhiem_vu_cong_viec.create({
      data: {
        ma_nguoi_dung: Number(ma_nguoi_dung),
        tieu_de,
        mo_ta,
        trang_thai: 'TODO', // Mặc định là Cần làm
        han_hoan_thanh: han_hoan_thanh ? new Date(han_hoan_thanh) : null
      }
    });

    return NextResponse.json({ success: true, data: newTask }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi tạo task' }, { status: 500 });
  }
}