import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Tắt cache mặc định của Next.js để luôn lấy data mới nhất

export async function GET() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // 1. Lấy tất cả ca làm việc trong hệ thống
    const danhSachCa = await prisma.ca_lam_viec.findMany();

    // 2. Lấy lịch phân ca ngày hôm nay
    const lichHomNay = await prisma.lich_phan_cong_ca.findMany({
      where: { ngay_lam_viec: { gte: startOfDay, lte: endOfDay } },
      include: {
        nguoi_dung: {
          select: { id: true, ho_so_nguoi_dung: { select: { ho_ten: true } } }
        }
      }
    });

    // 3. Lấy dữ liệu chấm công thực tế hôm nay
    const chamCongHomNay = await prisma.lich_su_cham_cong.findMany({
      where: { gio_vao: { gte: startOfDay, lte: endOfDay } }
    });

    // 4. Nhóm dữ liệu theo ca làm việc
    const ketQua = danhSachCa.map(ca => {
      // Tìm những ai có lịch trong ca này
      const nhanVienTrongCa = lichHomNay.filter(lich => lich.ma_ca_lam === ca.id);
      
      const chiTietNhanVien = nhanVienTrongCa.map(lich => {
        const maNV = lich.nguoi_dung?.id;
        const hoTen = lich.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || 'N/A';
        
        // Tìm lịch sử chấm công của nhân viên này trong ca tương ứng
        const chamCong = chamCongHomNay.find(cc => cc.ma_nguoi_dung === maNV && cc.ma_ca_lam === ca.id);

        let trangThai = 'CHUA_DEN_CA';
        
        // Logic xác định trạng thái UI
        if (ca.gio_bat_dau) {
          const caStart = new Date(ca.gio_bat_dau);
          const caStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), caStart.getUTCHours(), caStart.getUTCMinutes());
          
          if (chamCong) {
            trangThai = chamCong.trang_thai || 'DUNG_GIO';
          } else if (now > caStartTime) {
            trangThai = 'VANG_MAT'; // Quá giờ bắt đầu mà chưa thấy record chấm công
          }
        }

        return {
          ma_nguoi_dung: maNV,
          ho_ten: hoTen,
          gio_vao: chamCong?.gio_vao || null,
          gio_ra: chamCong?.gio_ra || null,
          trang_thai: trangThai,
          so_phut_tre: chamCong?.so_phut_tre || 0
        };
      });

      return {
        ma_ca: ca.id,
        ten_ca: ca.ten_ca,
        gio_bat_dau: ca.gio_bat_dau,
        gio_ket_thuc: ca.gio_ket_thuc,
        danh_sach_nhan_vien: chiTietNhanVien
      };
    });

    // Lọc bỏ những ca không có ai được phân lịch để giao diện đỡ rối
    const caCoNhanVien = ketQua.filter(ca => (ca.danh_sach_nhan_vien?.length || 0) > 0);

    return NextResponse.json({ success: true, data: caCoNhanVien }, { status: 200 });

  } catch (error) {
    console.error('[API_CHAM_CONG_HOM_NAY] Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi lấy dữ liệu' }, { status: 500 });
  }
}