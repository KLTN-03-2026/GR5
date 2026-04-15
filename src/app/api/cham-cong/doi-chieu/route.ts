import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const thang = searchParams.get('thang'); // Format: YYYY-MM
    const ma_nv = searchParams.get('ma_nv');

    if (!thang) {
      return NextResponse.json({ success: false, message: 'Vui lòng cung cấp tháng (YYYY-MM)' }, { status: 400 });
    }

    const [year, month] = thang.split('-').map(Number);
    if (isNaN(year) || isNaN(month)) {
      return NextResponse.json({ success: false, message: 'Định dạng tháng không hợp lệ' }, { status: 400 });
    }

    // Xác định ngày đầu và ngày cuối tháng
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Build điều kiện query
    const whereCondition: any = {
      ngay_lam_viec: { gte: startDate, lte: endDate },
    };
    if (ma_nv && !isNaN(Number(ma_nv))) {
      whereCondition.ma_nguoi_dung = Number(ma_nv);
    }

    // Lấy lịch phân ca và include dữ liệu chấm công tương ứng
    const lichPhanCa = await prisma.lich_phan_cong_ca.findMany({
      where: whereCondition,
      include: {
        nguoi_dung: { select: { ho_so_nguoi_dung: { select: { ho_ten: true } } } },
        ca_lam_viec: true,
      },
      orderBy: { ngay_lam_viec: 'asc' },
    });

    // Lấy lịch sử chấm công thực tế trong tháng
    const chamCongThucTe = await prisma.lich_su_cham_cong.findMany({
      where: {
        gio_vao: { gte: startDate, lte: endDate },
        ...(ma_nv && !isNaN(Number(ma_nv)) ? { ma_nguoi_dung: Number(ma_nv) } : {}),
      },
    });

    // Map dữ liệu để đối chiếu
    const doiChieu = lichPhanCa.map((lich) => {
      // Tìm bản ghi chấm công khớp với ngày và người dùng
      const chamCong = chamCongThucTe.find(
        (cc) =>
          cc.ma_nguoi_dung === lich.ma_nguoi_dung &&
          cc.gio_vao &&
          lich.ngay_lam_viec &&
          cc.gio_vao.getDate() === lich.ngay_lam_viec.getDate()
      );

      let tongGioThucTe = 0;
      if (chamCong?.gio_vao && chamCong?.gio_ra) {
        const diffMs = chamCong.gio_ra.getTime() - chamCong.gio_vao.getTime();
        tongGioThucTe = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
      }

      return {
        ma_nguoi_dung: lich.ma_nguoi_dung,
        ho_ten: lich.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || 'Không xác định',
        ngay_lam_viec: lich.ngay_lam_viec,
        ca_lam_viec: lich.ca_lam_viec?.ten_ca || 'N/A',
        gio_vao_thuc_te: chamCong?.gio_vao || null,
        gio_ra_thuc_te: chamCong?.gio_ra || null,
        tong_gio_thuc_te: tongGioThucTe,
        trang_thai: chamCong?.trang_thai || 'VANG_MAT',
        so_phut_tre: chamCong?.so_phut_tre || 0,
      };
    });

    return NextResponse.json({ success: true, data: doiChieu }, { status: 200 });
  } catch (error) {
    console.error('[API_DOI_CHIEU] Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi đối chiếu chấm công' }, { status: 500 });
  }
}