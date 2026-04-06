import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  // 1. CƠ CHẾ BẢO VỆ: Kiểm tra Secret Key
  const secret = req.headers.get('x-cron-secret') || req.headers.get('authorization');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + 3);

    const loHangSapHetHan = await prisma.lo_hang.findMany({
      where: {
        han_su_dung: { lte: targetDate },
        ton_kho_tong: { some: { so_luong: { gt: 0 } } }
      }
    });

    let count = 0;

    for (const lo of loHangSapHetHan) {
      // 2. IDEMPOTENCY: Kiểm tra xem đã có cảnh báo CHƯA XỬ LÝ cho lô này chưa
      const existing = await prisma.canh_bao_lo_hang.findFirst({
        where: { ma_lo_hang: lo.id, da_xu_ly: false }
      });

      if (!existing) {
        const diffDays = Math.ceil((new Date(lo.han_su_dung).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const loai = diffDays <= 0 ? 'DA_HET_HAN' : `CON_${diffDays}_NGAY`;

        await prisma.canh_bao_lo_hang.create({
          data: { ma_lo_hang: lo.id, loai_canh_bao: loai }
        });
        count++;
      }
    }

    return NextResponse.json({ success: true, message: `Đã xử lý an toàn. Sinh ra ${count} cảnh báo mới.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi Cronjob" }, { status: 500 });
  }
}