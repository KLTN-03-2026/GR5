import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const secret = req.headers.get('x-cron-secret') || req.headers.get('authorization');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const suppliers = await prisma.nha_cung_cap.findMany({
      include: {
        cong_no_ncc: {
          orderBy: { ngay_giao_dich: 'desc' },
          take: 1,
        },
      },
    });

    let count = 0;

    for (const ncc of suppliers) {
      if (ncc.cong_no_ncc.length === 0) continue;
      const lastDebt = ncc.cong_no_ncc[0];
      const soDu = Number(lastDebt.so_du_sau ?? 0);

      if (soDu > 0) {
        let maxDays = 30; // default
        if (ncc.chu_ky_thanh_toan === '7_NGAY') maxDays = 7;
        else if (ncc.chu_ky_thanh_toan === '15_NGAY') maxDays = 15;
        else if (ncc.chu_ky_thanh_toan === 'NGAY_GIAO') maxDays = 1;

        const diffDays = Math.ceil((Date.now() - new Date(lastDebt.ngay_giao_dich || Date.now()).getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= maxDays) {
          // create a notification
          await prisma.thong_bao.create({
            data: {
              ma_nguoi_dung: null,
              tieu_de: 'Công nợ NCC đến hạn',
              noi_dung: `Nhà cung cấp ${ncc.ten_ncc} có công nợ ${soDu.toLocaleString('vi-VN')}đ đã đến hạn thanh toán (${diffDays} ngày).`,
              loai_thong_bao: 'CONG_NO_NCC_DEN_HAN',
            },
          });
          count++;
        }
      }
    }

    return NextResponse.json({ success: true, message: `Created ${count} debt notifications.` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Cron error' }, { status: 500 });
  }
}
