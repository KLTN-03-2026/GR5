import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ma_nguoi_dung } = body;

    // 1. Bảo vệ đầu vào
    if (!ma_nguoi_dung || isNaN(Number(ma_nguoi_dung))) {
      return NextResponse.json({ success: false, message: 'Mã người dùng không hợp lệ' }, { status: 400 });
    }

    const userId = Number(ma_nguoi_dung);
    const now = new Date();
    
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // 2. Tìm bản ghi chấm công vào gần nhất trong ngày chưa có giờ ra
    const activeLog = await prisma.lich_su_cham_cong.findFirst({
      where: {
        ma_nguoi_dung: userId,
        gio_vao: { gte: startOfDay, lte: endOfDay },
        gio_ra: null,
      },
      orderBy: { gio_vao: 'desc' }, // Lấy bản ghi mới nhất lỡ có bug đúp data
    });

    if (!activeLog) {
      return NextResponse.json({ 
        success: false, 
        message: 'Không tìm thấy dữ liệu chấm công vào hoặc bạn đã chấm ra rồi' 
      }, { status: 404 });
    }

    // 3. Cập nhật giờ ra
    const updatedLog = await prisma.lich_su_cham_cong.update({
      where: { id: activeLog.id },
      data: { gio_ra: now },
    });

    // Tính nhanh tổng số phút thực tế đã làm để FE có thể hiển thị dạng "Bạn đã làm X giờ Y phút"
    const workedMs = now.getTime() - new Date(updatedLog.gio_vao!).getTime();
    const workedMinutes = Math.floor(workedMs / 60000);

    return NextResponse.json({ 
      success: true, 
      data: {
        ...updatedLog,
        workedMinutes
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[API_CHAM_CONG_RA] Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống khi chấm công ra' }, { status: 500 });
  }
}