import prisma from '@/lib/prisma';
import IssueHistory from '@/components/admin/warehouse/IssueHistory';
// ==========================================
// HÀM TIỆN ÍCH (HELPER)
// ==========================================

/**
 * Hàm đồng bộ lại bảng Tồn Kho Tổng (Cache) 
 * Đếm số lượng thùng thực tế TRONG_KHO để đảm bảo không bao giờ bị lệch số
 */
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
 // ==========================================
  // 1. NGHIỆP VỤ NHẬP KHO (TẠO PHIẾU NHÁP CHỜ DUYỆT)
  // ==========================================
  async createDraftReceipt(data: any) {
    return await prisma.phieu_nhap_kho.create({
      data: {
        ma_phieu: `PN-${Date.now()}`, 
        ma_ncc: data.ma_ncc,
        trang_thai: 'CHO_DUYET',
        chi_tiet: {
          create: {
            ma_bien_the: data.ma_bien_the,
            so_luong_thung: data.so_luong_thung,
            
            // THÊM 2 DÒNG NÀY VÀO ĐỂ FIX LỖI THIẾU TRƯỜNG:
            so_luong_yeu_cau: data.so_luong_thung, 
            don_gia: 0, // Tạm để 0 vì module kho không ưu tiên tính giá, module kế toán sẽ lo

            ngay_thu_hoach: new Date(data.ngay_thu_hoach),
            ngay_nhap_kho: new Date(data.ngay_nhap_kho),
            han_su_dung: new Date(data.han_su_dung),
            khu_du_kien: data.vi_tri.khu,
            day_du_kien: data.vi_tri.day,
            ke_du_kien: data.vi_tri.ke,
            tang_du_kien: data.vi_tri.tang,
          }
        }
      }
    });
  },
  // ==========================================
  // 2. NGHIỆP VỤ DUYỆT PHIẾU & ĐẨY HÀNG VÀO KHO
  // ==========================================
  async approveReceipt(phieuId: number) {
    return await prisma.$transaction(async (tx) => {
      const phieu = await tx.phieu_nhap_kho.findUnique({
        where: { id: phieuId }, 
        include: { chi_tiet: true }
      });

      if (!phieu) throw new Error("Phiếu không tồn tại!");
      // Allow DA_DUYET (set by review API before calling this) or CHO_DUYET (direct approve)
      if (!['CHO_DUYET', 'DA_DUYET'].includes(phieu.trang_thai || '')) {
        throw new Error("Phiếu không hợp lệ hoặc đã được xử lý!");
      }

      const chiTiet = phieu.chi_tiet[0]; 

      if (!chiTiet?.han_su_dung) {
        throw new Error("Dữ liệu lỗi: Chi tiết phiếu nhập thiếu Hạn sử dụng!");
      }


      const maLoHang = `LO-${Date.now().toString().slice(-6)}`;

      // Tạo Lô hàng chính thức
      const loHang = await tx.lo_hang.create({
        data: {
          ma_phieu_nhap: phieu.id, 
          ma_bien_the: chiTiet.ma_bien_the,
          ma_ncc: phieu.ma_ncc,
          ma_lo_hang: maLoHang,
          ngay_thu_hoach: chiTiet.ngay_thu_hoach,
          ngay_nhap_kho: chiTiet.ngay_nhap_kho,
          han_su_dung: chiTiet.han_su_dung, // Hết báo lỗi null !
        }
      });
      
      // ... (Phần code dưới giữ nguyên không đổi)

      // 3. Tìm hoặc tạo vị trí kho
      let viTri = await tx.vi_tri_kho.findFirst({
        where: { 
          khu_vuc: chiTiet.khu_du_kien, 
          day: chiTiet.day_du_kien, 
          ke: chiTiet.ke_du_kien, 
          tang: chiTiet.tang_du_kien 
        }
      });

      if (!viTri) {
        viTri = await tx.vi_tri_kho.create({
          data: { 
            khu_vuc: chiTiet.khu_du_kien, 
            day: chiTiet.day_du_kien, 
            ke: chiTiet.ke_du_kien, 
            tang: chiTiet.tang_du_kien 
          }
        });
      }

      // 4. Khởi tạo tồn kho cache
      await tx.ton_kho_tong.create({
        data: { 
          ma_lo_hang: loHang.id, 
          ma_vi_tri: viTri.id, 
          so_luong: chiTiet.so_luong_thung 
        }
      });

      // 5. Sinh QR Code cho từng thùng
      const qrCodes = Array.from({ length: chiTiet.so_luong_thung || chiTiet.so_luong_yeu_cau || 0 }).map((_, index) =>
      ({ma_lo_hang: loHang.id,
        ma_vi_tri: viTri!.id,
        ma_vach_quet: `QR-${maLoHang}-${String(index + 1).padStart(3, '0')}`,
        trang_thai: 'TRONG_KHO'
      }));

      await tx.kien_hang_chi_tiet.createMany({ data: qrCodes });

      // 6. Cập nhật trạng thái phiếu nhập thành ĐÃ DUYỆT
      await tx.phieu_nhap_kho.update({
        where: { id: phieu.id }, 
        data: { trang_thai: 'DA_DUYET', ngay_duyet: new Date() }
      });

      return { qrCodes, message: `Đã duyệt và nhập ${chiTiet.so_luong_thung} thùng vào kho thành công!` };
    });
  },

  // ==========================================
  // 3. NGHIỆP VỤ XUẤT KHO (KIỂM TRA FEFO & LƯU LỊCH SỬ)
  // ==========================================
  async scanAndIssueItem(scannedQR: string, phieuXuatId: number = 1) { // Mặc định ID 1 để dễ test
    return await prisma.$transaction(async (tx) => {
      // 1. Tìm thùng hàng vừa quét trong kho
      const kienHangQuet = await tx.kien_hang_chi_tiet.findFirst({
        where: { ma_vach_quet: scannedQR, trang_thai: 'TRONG_KHO' },
        include: { lo_hang: true }
      });

      if (!kienHangQuet) {
        throw new Error("Thùng hàng không tồn tại hoặc đã được xuất khỏi kho!");
      }

      // 2. KIỂM TRA FEFO: Tìm thùng cũ nhất của loại sản phẩm này đang ở trong kho
      const thungCuNhat = await tx.kien_hang_chi_tiet.findFirst({
        where: { 
          trang_thai: 'TRONG_KHO',
          lo_hang: { ma_bien_the: kienHangQuet.lo_hang.ma_bien_the } 
        },
        include: { lo_hang: true },
        orderBy: { lo_hang: { han_su_dung: 'asc' } } 
      });

      // 3. Chặn xuất nếu phát hiện thùng khác sắp hết hạn hơn (FEFO Violated)
      if (thungCuNhat && kienHangQuet.lo_hang.han_su_dung > thungCuNhat.lo_hang.han_su_dung) {
        throw new Error(`[FEFO ERROR] Từ chối xuất! Vẫn còn thùng cũ hơn (HSD: ${thungCuNhat.lo_hang.han_su_dung.toLocaleDateString('vi-VN')}) cần xuất trước. Mã yêu cầu: ${thungCuNhat.ma_vach_quet}`);
      }

      // 4. Xác nhận xuất: Cập nhật trạng thái DA_XUAT
      await tx.kien_hang_chi_tiet.update({
        where: { id: kienHangQuet.id },
        data: { trang_thai: 'DA_XUAT' }
      });

   // Ép TypeScript hiểu rằng ma_bien_the chắc chắn tồn tại
      if (!kienHangQuet.lo_hang || !kienHangQuet.lo_hang.ma_bien_the) {
        throw new Error("Lỗi dữ liệu: Thùng hàng này không có mã biến thể (sản phẩm)!");
      }

      // 5. LƯU LỊCH SỬ: Ghi log truy vết vào bảng kien_hang_da_xuat
      await tx.kien_hang_da_xuat.create({
        data: {
          ma_phieu_xuat: phieuXuatId, 
          ma_vach_quet: scannedQR,
          ma_bien_the: kienHangQuet.lo_hang.ma_bien_the, // Hết báo lỗi null
          ngay_xuat: new Date()
        }
      });

      // 6. ĐỒNG BỘ CACHE TỒN KHO 
      // Ép kiểu TypeScript để đảm bảo ma_lo_hang và ma_vi_tri không bị null
      if (!kienHangQuet.ma_lo_hang || !kienHangQuet.ma_vi_tri) {
        throw new Error("Dữ liệu lỗi: Kiện hàng không có thông tin lô hoặc vị trí!");
      }
      
      await syncTonKhoTong(tx, kienHangQuet.ma_lo_hang, kienHangQuet.ma_vi_tri);

      return { message: `Đã xác nhận xuất thùng ${scannedQR} thành công!` };
    });
  },

  // ==========================================
  // 4. NGHIỆP VỤ XỬ LÝ CẢNH BÁO
  // ==========================================
  async resolveAllWarnings() {
    await prisma.canh_bao_lo_hang.updateMany({
      where: { da_xu_ly: false },
      data: { da_xu_ly: true, ngay_xu_ly: new Date() }
    });
    
    return { success: true, message: "Đã xử lý toàn bộ cảnh báo!" };
  }
};