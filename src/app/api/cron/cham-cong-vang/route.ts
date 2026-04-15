import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// API này nên được gọi vào lúc 23:50 mỗi ngày
export async function GET(req: Request) {
  try {
    // 1. Bảo mật: Chỉ cho phép chạy nếu có Secret Key đúng (Tránh bị hacker gọi bậy)
    const url = new URL(req.url);
    const secret = url.searchParams.get('secret');
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // 2. Tìm tất cả nhân viên CÓ LỊCH LÀM VIỆC hôm nay
    const lichHomNay = await prisma.lich_phan_cong_ca.findMany({
      where: { ngay_lam_viec: { gte: startOfDay, lte: endOfDay } }
    });

    if (lichHomNay.length === 0) {
      return NextResponse.json({ success: true, message: 'Hôm nay không có ai có lịch làm việc.' });
    }

    let countVangMat = 0;

    // 3. Quét từng người
    for (const lich of lichHomNay) {
      // Kiểm tra xem người này có đang nghỉ phép CÓ PHÉP không?
      const dangNghiPhep = await prisma.don_xin_nghi.findFirst({
        where: {
          ma_nguoi_dung: lich.ma_nguoi_dung as number,
          trang_thai: 'DA_DUYET',
          ngay_bat_dau: { lte: endOfDay },
          ngay_ket_thuc: { gte: startOfDay },
        }
      });

      if (dangNghiPhep) continue; // Có phép thì bỏ qua

      // Kiểm tra xem người này có chấm công không?
      const daChamCong = await prisma.lich_su_cham_cong.findFirst({
        where: {
          ma_nguoi_dung: lich.ma_nguoi_dung,
          ma_ca_lam: lich.ma_ca_lam,
          gio_vao: { gte: startOfDay, lte: endOfDay }
        }
      });

      // 4. Nếu KHÔNG có đơn xin nghỉ & KHÔNG chấm công -> Đánh Vắng Mặt
      if (!daChamCong) {
        await prisma.lich_su_cham_cong.create({
          data: {
            ma_nguoi_dung: lich.ma_nguoi_dung,
            ma_ca_lam: lich.ma_ca_lam,
            gio_vao: new Date(), // Ghi nhận thời điểm hệ thống tự tạo
            gio_ra: new Date(),  // Ghi ra luôn để chốt ca
            trang_thai: 'VANG_MAT',
            so_phut_tre: 0 
          }
        });
        countVangMat++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Cronjob chạy thành công. Đã đánh vắng mặt ${countVangMat} nhân viên.` 
    });

  } catch (error) {
    console.error('[CRONJOB_ERROR]:', error);
    return NextResponse.json({ success: false, message: 'Lỗi chạy Cronjob' }, { status: 500 });
  }
}