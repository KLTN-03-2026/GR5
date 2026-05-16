import prisma from '@/lib/prisma';

async function syncTonKhoTong(tx: any, ma_lo_hang: number, ma_vi_tri: number) {
  const actualCount = await tx.kien_hang_chi_tiet.count({
    where: { ma_lo_hang, ma_vi_tri, trang_thai: 'TRONG_KHO' }
  });

  await tx.ton_kho_tong.updateMany({
    where: { ma_lo_hang, ma_vi_tri },
    data: { so_luong: actualCount }
  });
}

export const WarehouseService = {
  async createDraftReceipt(data: {
    ma_ncc: number;
    ma_bien_the: number;
    so_luong: number;
    don_gia: number;
    ma_nguoi_tao?: number;
    ma_kho?: number;
  }) {
    return await prisma.phieu_nhap_kho.create({
      data: {
        ma_ncc: data.ma_ncc,
        ma_nguoi_tao: data.ma_nguoi_tao,
        ma_kho: data.ma_kho,
        trang_thai: 'CHO_DUYET',
        tong_tien: data.so_luong * data.don_gia,
        chi_tiet_phieu_nhap: {
          create: {
            ma_bien_the: data.ma_bien_the,
            so_luong_yeu_cau: data.so_luong,
            don_gia: data.don_gia,
          }
        }
      },
      include: { chi_tiet_phieu_nhap: true }
    });
  },

  async approveReceipt(phieuId: number, options?: { han_su_dung: Date; vi_tri_id?: number }) {
    return await prisma.$transaction(async (tx) => {
      const phieu = await tx.phieu_nhap_kho.findUnique({
        where: { id: phieuId },
        include: { chi_tiet_phieu_nhap: true }
      });

      if (!phieu) throw new Error("Phiếu không tồn tại!");
      if (!['CHO_DUYET', 'DA_DUYET'].includes(phieu.trang_thai || '')) {
        throw new Error("Phiếu không hợp lệ hoặc đã được xử lý!");
      }

      const chiTiet = phieu.chi_tiet_phieu_nhap[0];
      if (!chiTiet) throw new Error("Phiếu nhập không có chi tiết!");

      const hanSuDung = options?.han_su_dung || new Date(Date.now() + 30 * 86400000);
      const maLoHang = `LO-${Date.now().toString().slice(-6)}`;
      const soLuong = chiTiet.so_luong_thuc_nhan || chiTiet.so_luong_yeu_cau;

      const loHang = await tx.lo_hang.create({
        data: {
          ma_phieu_nhap: phieu.id,
          ma_bien_the: chiTiet.ma_bien_the,
          ma_ncc: phieu.ma_ncc,
          ma_lo_hang: maLoHang,
          ngay_nhap_kho: new Date(),
          han_su_dung: hanSuDung,
        }
      });

      let viTriId = options?.vi_tri_id;
      if (!viTriId) {
        const viTri = await tx.vi_tri_kho.findFirst({
          where: phieu.ma_kho ? { ma_kho: phieu.ma_kho } : {},
          orderBy: { id: 'asc' },
        });
        if (!viTri) throw new Error("Không tìm thấy vị trí kho nào trong hệ thống");
        viTriId = viTri.id;
      }

      await tx.ton_kho_tong.create({
        data: { ma_lo_hang: loHang.id, ma_vi_tri: viTriId, so_luong: soLuong }
      });

      const qrCodes = Array.from({ length: soLuong }).map((_, i) => ({
        ma_lo_hang: loHang.id,
        ma_vi_tri: viTriId!,
        ma_vach_quet: `QR-${maLoHang}-${String(i + 1).padStart(3, '0')}`,
        trang_thai: 'TRONG_KHO'
      }));

      await tx.kien_hang_chi_tiet.createMany({ data: qrCodes });

      await tx.phieu_nhap_kho.update({
        where: { id: phieu.id },
        data: { trang_thai: 'HOAN_THANH', ngay_duyet: new Date() }
      });

      return { qrCodes, message: `Đã duyệt và nhập ${soLuong} kiện vào kho!` };
    });
  },

  async scanAndIssueItem(scannedQR: string, phieuXuatId: number) {
    return await prisma.$transaction(async (tx) => {
      const kienHang = await tx.kien_hang_chi_tiet.findFirst({
        where: { ma_vach_quet: scannedQR, trang_thai: 'TRONG_KHO' },
        include: { lo_hang: true }
      });

      if (!kienHang) throw new Error("Kiện hàng không tồn tại hoặc đã xuất!");
      if (!kienHang.lo_hang) throw new Error("Dữ liệu lỗi: kiện hàng thiếu thông tin lô!");

      const oldestInStock = await tx.kien_hang_chi_tiet.findFirst({
        where: {
          trang_thai: 'TRONG_KHO',
          lo_hang: { ma_bien_the: kienHang.lo_hang.ma_bien_the }
        },
        include: { lo_hang: true },
        orderBy: { lo_hang: { han_su_dung: 'asc' } }
      });

      if (oldestInStock?.lo_hang && kienHang.lo_hang.han_su_dung > oldestInStock.lo_hang.han_su_dung) {
        throw new Error(
          `[FEFO] Còn kiện cũ hơn (HSD: ${oldestInStock.lo_hang.han_su_dung.toLocaleDateString('vi-VN')}) cần xuất trước. Mã: ${oldestInStock.ma_vach_quet}`
        );
      }

      await tx.kien_hang_chi_tiet.update({
        where: { id: kienHang.id },
        data: { trang_thai: 'DA_XUAT' }
      });

      const chiTietXuat = await tx.chi_tiet_phieu_xuat.create({
        data: {
          ma_phieu_xuat: phieuXuatId,
          ma_bien_the: kienHang.lo_hang.ma_bien_the!,
          so_luong_yeu_cau: 1,
          so_luong_thuc_xuat: 1,
        },
      });

      await tx.kien_hang_da_xuat.create({
        data: { ma_chi_tiet_xuat: chiTietXuat.id, ma_kien_hang: kienHang.id },
      });

      if (kienHang.ma_lo_hang && kienHang.ma_vi_tri) {
        await syncTonKhoTong(tx, kienHang.ma_lo_hang, kienHang.ma_vi_tri);
      }

      return { message: `Đã xuất kiện ${scannedQR} thành công!` };
    });
  },

  async resolveAllWarnings() {
    await prisma.canh_bao_lo_hang.updateMany({
      where: { da_xu_ly: false },
      data: { da_xu_ly: true, ngay_xu_ly: new Date() }
    });
    return { success: true, message: "Đã xử lý toàn bộ cảnh báo!" };
  }
};
