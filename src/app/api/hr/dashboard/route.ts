import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const in30Days = new Date(now);
    in30Days.setDate(in30Days.getDate() + 30);

    // Nhân viên (STAFF / THU_KHO)
    const allEmployees = await prisma.nguoi_dung.findMany({
      where: {
        trang_thai: 1,
        vai_tro_nguoi_dung: { some: { vai_tro: { ten_vai_tro: { in: ['STAFF', 'THU_KHO'] } } } },
        ho_so_nguoi_dung: { isNot: null },
      },
      include: {
        ho_so_nguoi_dung: true,
        lich_phan_cong_ca: {
          where: { ngay_lam_viec: { gte: startOfDay, lte: endOfDay } },
          include: { ca_lam_viec: true },
        },
        lich_su_cham_cong: {
          where: { gio_vao: { gte: startOfDay, lte: endOfDay } },
        },
        don_xin_nghi_tao: {
          where: {
            ngay_bat_dau: { lte: endOfDay },
            ngay_ket_thuc: { gte: startOfDay },
            trang_thai: 'DA_DUYET',
          },
        },
      },
    });

    const tongNhanVien = allEmployees.length;
    let coMat = 0, diTre = 0, vangKhongPhep = 0, nghiPhep = 0;

    for (const nv of allEmployees) {
      const daNghi = nv.don_xin_nghi_tao.length > 0;
      if (daNghi) { nghiPhep++; continue; }
      const cc = nv.lich_su_cham_cong[0];
      const lich = nv.lich_phan_cong_ca[0];
      if (cc) {
        coMat++;
        if ((cc.so_phut_tre || 0) > 0) diTre++;
      } else if (lich) {
        const caStart = lich.ca_lam_viec?.gio_bat_dau
          ? new Date(lich.ca_lam_viec.gio_bat_dau) : null;
        if (caStart) {
          const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
            caStart.getUTCHours(), caStart.getUTCMinutes());
          if (now > target) vangKhongPhep++;
        }
      }
    }

    // Lịch ca hôm nay
    const lichHomNay = await prisma.lich_phan_cong_ca.findMany({
      where: { ngay_lam_viec: { gte: startOfDay, lte: endOfDay } },
      include: {
        ca_lam_viec: true,
        nguoi_dung: { select: { id: true, ho_so_nguoi_dung: { select: { ho_ten: true, anh_dai_dien: true } } } },
      },
    });

    const chamCongHom = await prisma.lich_su_cham_cong.findMany({
      where: { gio_vao: { gte: startOfDay, lte: endOfDay } },
    });

    // Chỉ giữ lại các bản ghi có ngay_lam_viec đúng ngày hôm nay (theo local date)
    const todayLocalKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const lichHomNayFiltered = lichHomNay.filter((l) => {
      if (!l.ngay_lam_viec) return false;
      const d = new Date(l.ngay_lam_viec);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      return key === todayLocalKey;
    });

    const danhSachCa = await prisma.ca_lam_viec.findMany({ orderBy: { gio_bat_dau: 'asc' } });
    const lichCaHomNay = danhSachCa
      .map((ca) => {
        // Dedupe theo ma_nguoi_dung để 1 NV không xuất hiện 2 lần trong cùng 1 ca
        const seen = new Set<number>();
        const nvTrongCa = lichHomNayFiltered.filter((l) => {
          if (l.ma_ca_lam !== ca.id) return false;
          const uid = l.nguoi_dung?.id;
          if (!uid || seen.has(uid)) return false;
          seen.add(uid);
          return true;
        });
        return {
          ma_ca: ca.id,
          ten_ca: ca.ten_ca,
          gio_bat_dau: ca.gio_bat_dau,
          gio_ket_thuc: ca.gio_ket_thuc,
          so_nguoi: nvTrongCa.length,
          nhan_vien: nvTrongCa.slice(0, 5).map((l) => ({
            id: l.nguoi_dung?.id,
            ho_ten: l.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || 'N/A',
            anh: l.nguoi_dung?.ho_so_nguoi_dung?.anh_dai_dien,
            da_cham_cong: chamCongHom.some(
              (cc) => cc.ma_nguoi_dung === l.nguoi_dung?.id && cc.ma_ca_lam === ca.id
            ),
          })),
        };
      })
      .filter((ca) => ca.so_nguoi > 0);

    // Đơn xin nghỉ chờ duyệt
    const donChoDuyet = await prisma.don_xin_nghi.findMany({
      where: { trang_thai: 'CHO_DUYET' },
      include: {
        nguoi_dung: { select: { ho_so_nguoi_dung: { select: { ho_ten: true, chuc_vu: true, anh_dai_dien: true } } } },
      },
      orderBy: { ngay_tao: 'desc' },
      take: 5,
    });

    // Sinh nhật trong tháng
    const profiles = await prisma.ho_so_nguoi_dung.findMany({
      where: {
        ngay_sinh: { not: null },
        nguoi_dung: {
          trang_thai: 1,
          vai_tro_nguoi_dung: { some: { vai_tro: { ten_vai_tro: { in: ['STAFF', 'THU_KHO'] } } } },
        },
      },
      select: { ho_ten: true, ngay_sinh: true, anh_dai_dien: true, chuc_vu: true },
    });

    const currentMonth = now.getMonth() + 1;
    const sinhNhatThang = profiles
      .filter((p) => p.ngay_sinh && new Date(p.ngay_sinh).getMonth() + 1 === currentMonth)
      .map((p) => ({ ho_ten: p.ho_ten, ngay_sinh: p.ngay_sinh, chuc_vu: p.chuc_vu, anh: p.anh_dai_dien }));

    // Chi phí lương tháng
    const chamCongThang = await prisma.lich_su_cham_cong.findMany({
      where: { gio_vao: { gte: startOfMonth, lte: endOfMonth }, gio_ra: { not: null } },
    });

    const nhanSuLuong = await prisma.nguoi_dung.findMany({
      where: { ho_so_nguoi_dung: { luong_theo_gio: { not: null } } },
      select: { id: true, ho_so_nguoi_dung: { select: { luong_theo_gio: true } } },
    });

    let chiPhiLuong = 0;
    for (const nv of nhanSuLuong) {
      const luongGio = Number(nv.ho_so_nguoi_dung?.luong_theo_gio) || 0;
      for (const cc of chamCongThang.filter((c) => c.ma_nguoi_dung === nv.id)) {
        if (cc.gio_vao && cc.gio_ra) {
          chiPhiLuong += (cc.gio_ra.getTime() - cc.gio_vao.getTime()) / 3600000 * luongGio;
        }
      }
    }
    chiPhiLuong = Math.round(chiPhiLuong);

    // Biểu đồ chuyên cần 30 ngày
    const chamCong30 = await prisma.lich_su_cham_cong.findMany({
      where: {
        gio_vao: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29),
          lte: endOfDay,
        },
      },
      select: { gio_vao: true, trang_thai: true },
    });

    const bieuDoChuvenCan = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().split('T')[0];
      const records = chamCong30.filter(
        (cc) => cc.gio_vao && cc.gio_vao.toISOString().split('T')[0] === dateStr
      );
      return {
        ngay: `${d.getDate()}/${d.getMonth() + 1}`,
        dung_gio: records.filter((r) => r.trang_thai === 'DUNG_GIO').length,
        di_tre: records.filter((r) => r.trang_thai === 'DI_TRE').length,
        tong: records.length,
      };
    });

    // Top 5 nhân viên tháng
    const nhanSuAll = await prisma.nguoi_dung.findMany({
      where: {
        vai_tro_nguoi_dung: { some: { vai_tro: { ten_vai_tro: { in: ['STAFF', 'THU_KHO'] } } } },
        ho_so_nguoi_dung: { isNot: null },
      },
      select: {
        id: true,
        ho_so_nguoi_dung: { select: { ho_ten: true, anh_dai_dien: true, chuc_vu: true } },
      },
    });

    const topNhanVien = nhanSuAll
      .map((nv) => {
        let tongGio = 0;
        let soNgayCong = 0;
        for (const cc of chamCongThang.filter((c) => c.ma_nguoi_dung === nv.id)) {
          if (cc.gio_vao && cc.gio_ra) {
            tongGio += (cc.gio_ra.getTime() - cc.gio_vao.getTime()) / 3600000;
            soNgayCong++;
          }
        }
        return {
          id: nv.id,
          ho_ten: nv.ho_so_nguoi_dung?.ho_ten || 'N/A',
          chuc_vu: nv.ho_so_nguoi_dung?.chuc_vu,
          anh: nv.ho_so_nguoi_dung?.anh_dai_dien,
          tong_gio: Number(tongGio.toFixed(1)),
          so_ngay_cong: soNgayCong,
        };
      })
      .sort((a, b) => b.tong_gio - a.tong_gio)
      .slice(0, 5);

    // Hợp đồng sắp hết hạn
    const hopDongSapHetHan = await prisma.ho_so_nguoi_dung.findMany({
      where: {
        hop_dong_het_han: { gte: now, lte: in30Days },
        nguoi_dung: {
          trang_thai: 1,
          vai_tro_nguoi_dung: { some: { vai_tro: { ten_vai_tro: { in: ['STAFF', 'THU_KHO'] } } } },
        },
      },
      select: { ho_ten: true, chuc_vu: true, hop_dong_het_han: true, anh_dai_dien: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        metrics: { tongNhanVien, coMat, diTre, vangKhongPhep, nghiPhep, chiPhiLuong },
        lichCaHomNay,
        donChoDuyet: donChoDuyet.map((d) => ({
          id: d.id,
          loai_nghi: d.loai_nghi,
          ngay_bat_dau: d.ngay_bat_dau,
          ngay_ket_thuc: d.ngay_ket_thuc,
          ly_do: d.ly_do,
          ho_ten: d.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || 'N/A',
          chuc_vu: d.nguoi_dung?.ho_so_nguoi_dung?.chuc_vu,
          anh: d.nguoi_dung?.ho_so_nguoi_dung?.anh_dai_dien,
        })),
        sinhNhatThang,
        bieuDoChuvenCan,
        topNhanVien,
        hopDongSapHetHan,
      },
    });
  } catch (error) {
    console.error('[API_HR_DASHBOARD]', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
