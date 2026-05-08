import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const secret = req.headers.get('x-cron-secret') || req.headers.get('authorization');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const suppliers = await prisma.nha_cung_cap.findMany({
      where: { trang_thai: 'DANG_HOP_TAC' },
      select: { id: true, ten_ncc: true, chu_ky_thanh_toan: true, cong_no_ncc: {
        orderBy: { ngay_giao_dich: 'desc' },
        take: 1,
        select: { ngay_giao_dich: true }
      }},
    });

    let count = 0;

    for (const ncc of suppliers) {
      // ✅ FIX ĐIỂM 4: Tính công nợ bằng SUM thay vì lấy dòng cuối
      const [phatSinh, thanhToan] = await Promise.all([
        prisma.cong_no_ncc.aggregate({
          _sum: { so_tien: true },
          where: { ma_ncc: ncc.id, loai_giao_dich: 'PHAT_SINH_NO' },
        }),
        prisma.cong_no_ncc.aggregate({
          _sum: { so_tien: true },
          where: { ma_ncc: ncc.id, loai_giao_dich: 'THANH_TOAN' },
        }),
      ]);
      const soDu = Number(phatSinh._sum.so_tien ?? 0) - Number(thanhToan._sum.so_tien ?? 0);

      if (soDu <= 0) continue; // Không nợ thì bỏ qua

      // Kiểm tra đã quá hạn theo chu kỳ thanh toán
      const lastTx = ncc.cong_no_ncc[0];
      if (!lastTx?.ngay_giao_dich) continue;

      let maxDays = 30; // default
      if (ncc.chu_ky_thanh_toan === '7_NGAY') maxDays = 7;
      else if (ncc.chu_ky_thanh_toan === '15_NGAY') maxDays = 15;
      else if (ncc.chu_ky_thanh_toan === 'NGAY_GIAO') maxDays = 1;

      const diffDays = Math.ceil(
        (Date.now() - new Date(lastTx.ngay_giao_dich).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays >= maxDays) {
        // Kiểm tra thông báo trùng lập (tránh spam mỗi lần chạy cron)
        const existingAlert = await prisma.thong_bao.findFirst({
          where: {
            loai_thong_bao: 'CONG_NO_NCC_DEN_HAN',
            noi_dung: { contains: ncc.ten_ncc },
            ngay_tao: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // trong 24h gần nhất
          },
        });
        if (existingAlert) continue; // Đã có thông báo trong ngày, bỏ qua

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

    return NextResponse.json({ success: true, message: `Created ${count} debt notifications.` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Cron error' }, { status: 500 });
  }
}
