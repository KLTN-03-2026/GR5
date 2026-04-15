import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const thang = searchParams.get('thang'); // YYYY-MM

    if (!thang) {
      return NextResponse.json({ success: false, message: 'Vui lòng cung cấp tháng (YYYY-MM)' }, { status: 400 });
    }

    const [year, month] = thang.split('-').map(Number);
    if (isNaN(year) || isNaN(month)) {
      return NextResponse.json({ success: false, message: 'Định dạng tháng lỗi' }, { status: 400 });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // 1. Lấy danh sách nhân sự có cấu hình lương
    const nhanSu = await prisma.nguoi_dung.findMany({
      where: {
        ho_so_nguoi_dung: { luong_theo_gio: { not: null } },
      },
      include: { ho_so_nguoi_dung: true },
    });

    // 2. Lấy dữ liệu chấm công tháng này
    const chamCongThang = await prisma.lich_su_cham_cong.findMany({
      where: { gio_vao: { gte: startDate, lte: endDate } },
      include: { ca_lam_viec: true },
    });

    // 3. Tính toán lương cho từng người
    const bangLuong = nhanSu.map((ns) => {
      const chamCongNhanVien = chamCongThang.filter((cc) => cc.ma_nguoi_dung === ns.id);
      
      const luongTheoGio = Number(ns.ho_so_nguoi_dung?.luong_theo_gio) || 0;
      let tongGioThucTe = 0;
      let gioCaToi = 0;
      let tongPhutTre = 0;

      chamCongNhanVien.forEach((cc) => {
        // Chỉ tính khi có giờ vào và giờ ra đàng hoàng
        if (cc.gio_vao && cc.gio_ra) {
          const diffMs = cc.gio_ra.getTime() - cc.gio_vao.getTime();
          const hours = diffMs / (1000 * 60 * 60);
          tongGioThucTe += hours;

          // Giả định ca tối có chữ "Tối" hoặc "Đêm" trong tên ca
          const tenCa = cc.ca_lam_viec?.ten_ca?.toLowerCase() || '';
          if (tenCa.includes('tối') || tenCa.includes('đêm')) {
            gioCaToi += hours;
          }
        }
        
        // Cộng dồn phút trễ
        tongPhutTre += cc.so_phut_tre || 0;
      });

      // Áp dụng công thức spec
      const luongCoBan = tongGioThucTe * luongTheoGio;
      const phuCapCaToi = gioCaToi * 1.3 * luongTheoGio; // X1.3 theo spec
      const khauTruTre = (tongPhutTre / 60) * luongTheoGio;
      
      // Tính thực nhận (có thể giả lập thưởng chuyên cần = 0 hiện tại)
      const thuongChuyenCan = 0; 
      const thucNhan = luongCoBan + phuCapCaToi + thuongChuyenCan - khauTruTre;

      return {
        ma_nguoi_dung: ns.id,
        ho_ten: ns.ho_so_nguoi_dung?.ho_ten || 'N/A',
        luong_theo_gio: luongTheoGio,
        tong_gio_thuc_te: Number(tongGioThucTe.toFixed(2)),
        tong_phut_tre: tongPhutTre,
        luong_co_ban: Number(luongCoBan.toFixed(0)),
        phu_cap_ca_toi: Number(phuCapCaToi.toFixed(0)),
        khau_tru_tre: Number(khauTruTre.toFixed(0)),
        thuc_nhan: Number(thucNhan.toFixed(0)),
      };
    });

    return NextResponse.json({ success: true, data: bangLuong }, { status: 200 });
  } catch (error) {
    console.error('[API_TINH_LUONG] Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi tính lương' }, { status: 500 });
  }
}