import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Mã task không hợp lệ' }, { status: 400 });
    }

    const body = await request.json();
    const { action, damagedQty, reason, evidenceUrl, han_su_dung } = body;
    // action: 'ACCEPT_ALL', 'PARTIAL_ACCEPT', 'REJECT_ALL'

    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.nhiem_vu_kiem_dinh.findUnique({
        where: { id },
        include: { chi_tiet_nhap: { include: { phieu_nhap_kho: true } } }
      });

      if (!task) throw new Error('Không tìm thấy QC Task');

      const totalQty = task.chi_tiet_nhap.so_luong_thuc_nhan || 0;
      let passQty = 0;
      let failQty = 0;

      if (action === 'ACCEPT_ALL') {
        passQty = totalQty;
      } else if (action === 'REJECT_ALL') {
        failQty = totalQty;
      } else if (action === 'PARTIAL_ACCEPT') {
        failQty = damagedQty;
        passQty = totalQty - failQty;
      }

      // 1. Cập nhật QC Task
      const updatedTask = await tx.nhiem_vu_kiem_dinh.update({
        where: { id },
        data: {
          trang_thai: 'DONE',
          ket_qua_qc: action,
          so_luong_loi: failQty,
          ly_do_loi: reason || null,
          anh_bang_chung: evidenceUrl ? [evidenceUrl] : undefined
        }
      });

      // 2. Xử lý hàng Pass -> Tạo InventoryBatch (lo_hang)
      if (passQty > 0) {
        const lotCode = `LO-${task.chi_tiet_nhap.ma_phieu_nhap}-${task.ma_chi_tiet_nhap}-${Date.now().toString().slice(-4)}`;
        const loHang = await tx.lo_hang.create({
          data: {
            ma_lo_hang: lotCode,
            ma_bien_the: task.chi_tiet_nhap.ma_bien_the,
            ma_ncc: task.chi_tiet_nhap.phieu_nhap_kho.ma_ncc,
            ma_phieu_nhap: task.chi_tiet_nhap.ma_phieu_nhap,
            ngay_nhap_kho: new Date(),
            han_su_dung: han_su_dung ? new Date(han_su_dung) : task.chi_tiet_nhap.phieu_nhap_kho.han_su_dung_thuc_te ? new Date(task.chi_tiet_nhap.phieu_nhap_kho.han_su_dung_thuc_te) : new Date(Date.now() + 30 * 86400000),
            trang_thai: 'BINH_THUONG'
          }
        });
        
        // Smart zone assignment based on product category
        const bienThe = await tx.bien_the_san_pham.findUnique({
          where: { id: task.chi_tiet_nhap.ma_bien_the },
          include: { san_pham: { include: { danh_muc: true } } }
        });

        let targetZone = 'Khu Tổng Hợp';
        const catName = (bienThe?.san_pham?.danh_muc?.ten_danh_muc || '').toLowerCase();
        const productName = (bienThe?.san_pham?.ten_san_pham || '').toLowerCase();
        const combined = catName + ' ' + productName;

        if (/rau|quả|trái cây|tươi|lá/.test(combined)) {
          targetZone = 'Khu Lạnh';
        } else if (/khô|gia vị|ngũ cốc|hạt|bột/.test(combined)) {
          targetZone = 'Khu Khô';
        }

        let viTri = await tx.vi_tri_kho.findFirst({
          where: { khu_vuc: targetZone },
          orderBy: { id: 'asc' }
        });
        if (!viTri) {
          viTri = await tx.vi_tri_kho.findFirst({ orderBy: { id: 'asc' } });
        }
        if (!viTri) {
          viTri = await tx.vi_tri_kho.create({ data: { khu_vuc: targetZone } });
        }
        
        await tx.ton_kho_tong.create({
          data: {
            ma_lo_hang: loHang.id,
            ma_vi_tri: viTri.id,
            so_luong: passQty
          }
        });

        // Create QR codes (batch limit: max 50 per lot)
        const qrCount = Math.min(passQty, 50);
        const qrCodes = Array.from({ length: qrCount }).map((_, i) => ({
          ma_lo_hang: loHang.id,
          ma_vi_tri: viTri!.id,
          ma_vach_quet: `QR-${lotCode}-${String(i + 1).padStart(3, '0')}`,
          trang_thai: 'TRONG_KHO' as const
        }));
        if (qrCodes.length > 0) {
          await tx.kien_hang_chi_tiet.createMany({ data: qrCodes });
        }
      }

      // 3. Xử lý hàng Fail -> Đưa vào phiếu trả NCC
      if (failQty > 0) {
        await tx.phieu_tra_nha_cung_cap.create({
          data: {
            ma_ncc: task.chi_tiet_nhap.phieu_nhap_kho.ma_ncc,
            ma_nguoi_tao: task.ma_nguoi_kiem_tra,
            tong_tien_hoan_du_kien: failQty * Number(task.chi_tiet_nhap.don_gia),
            trang_thai: 'DANG_XU_LY'
          }
        });
        // Sẽ cần tạo chi tiết phiếu trả, nhưng mô hình cũ chưa có chi tiết phiếu trả
      }

      // 4. Kiểm tra xem tất cả QC Task của PO này đã DONE chưa, nếu rồi thì đổi trạng thái PO
      const allTasks = await tx.nhiem_vu_kiem_dinh.findMany({
        where: {
          chi_tiet_nhap: {
            ma_phieu_nhap: task.chi_tiet_nhap.ma_phieu_nhap
          }
        }
      });

      const allDone = allTasks.every((t: any) => t.trang_thai === 'DONE');
      if (allDone) {
        // Get all chi_tiet to calculate total cost
        const allChiTiet = await tx.chi_tiet_phieu_nhap.findMany({
          where: { ma_phieu_nhap: task.chi_tiet_nhap.ma_phieu_nhap }
        });

        const tongTien = allChiTiet.reduce((sum, ct) => {
          const qty = ct.so_luong_thuc_nhan || 0;
          const price = Number(ct.don_gia) || 0;
          return sum + qty * price;
        }, 0);

        await tx.phieu_nhap_kho.update({
          where: { id: task.chi_tiet_nhap.ma_phieu_nhap },
          data: { trang_thai: 'HOAN_THANH', tong_tien: tongTien }
        });

        // Create supplier debt record
        if (tongTien > 0 && task.chi_tiet_nhap.phieu_nhap_kho.ma_ncc) {
          await tx.cong_no_ncc.create({
            data: {
              ma_ncc: task.chi_tiet_nhap.phieu_nhap_kho.ma_ncc,
              ma_phieu_nhap: task.chi_tiet_nhap.ma_phieu_nhap,
              loai_giao_dich: 'NHAP_HANG',
              so_tien: tongTien,
              phuong_thuc: 'CONG_NO',
              ma_giao_dich: `CN-PN${task.chi_tiet_nhap.ma_phieu_nhap}-${Date.now().toString().slice(-6)}`,
              ghi_chu: `Công nợ nhập hàng phiếu #${task.chi_tiet_nhap.ma_phieu_nhap}`
            }
          });
        }
      }

      return updatedTask;
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('[POST /api/admin/warehouse/qc/tasks/[id]/decision]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
