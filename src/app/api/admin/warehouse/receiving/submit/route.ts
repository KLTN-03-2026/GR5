import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { poId, items, nguoi_nhan_id } = body;

    if (!poId || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const phieu = await tx.phieu_nhap_kho.findUnique({
        where: { id: poId },
        include: { chi_tiet_phieu_nhap: true }
      });
      if (!phieu) throw new Error('Không tìm thấy phiếu nhập');

      if (phieu.trang_thai !== 'CHO_GIAO_HANG' && phieu.trang_thai !== 'DANG_KIEM_TRA') {
        throw new Error('Phiếu đã được xử lý (trạng thái: ' + phieu.trang_thai + ')');
      }

      // Update chi_tiet_phieu_nhap with actual received quantities
      for (const item of items) {
        await tx.chi_tiet_phieu_nhap.update({
          where: { id: item.id },
          data: {
            so_luong_thuc_nhan: item.actualQty,
            ly_do_lech: item.reason || null,
            anh_bang_chung: item.evidenceUrl ? [item.evidenceUrl] : undefined
          }
        });
      }

      // Create QC tasks for items with received quantity > 0
      for (const item of items) {
        if (item.actualQty > 0) {
          const chiTiet = phieu.chi_tiet_phieu_nhap.find((ct: any) => ct.id === item.id);
          if (!chiTiet) continue;

          // Check if QC task already exists (idempotency)
          const existingQC = await tx.nhiem_vu_kiem_dinh.findUnique({
            where: { ma_chi_tiet_nhap: chiTiet.id }
          });
          if (!existingQC) {
            await tx.nhiem_vu_kiem_dinh.create({
              data: {
                ma_chi_tiet_nhap: chiTiet.id,
                trang_thai: 'WAITING_FOR_QC',
                temp_batch_id: `BATCH-${poId}-${Date.now()}`
              }
            });
          }
        }
      }

      // Update phieu to DANG_KIEM_TRA (QC pending)
      const po = await tx.phieu_nhap_kho.update({
        where: { id: poId },
        data: {
          trang_thai: 'DANG_KIEM_TRA',
          ngay_kiem_tra: new Date(),
        }
      });

      // Log receiving action (audit trail)
      if (nguoi_nhan_id) {
        await tx.lich_su_nhan_hang.create({
          data: {
            ma_phieu_nhap: poId,
            ma_nguoi_dung: Number(nguoi_nhan_id),
            hanh_dong: 'NHAN_HANG',
            ghi_chu: `Nhận hàng: ${items.filter((i: any) => i.actualQty > 0).length} dòng`
          }
        });

        // Update phieu with receiver info
        await tx.phieu_nhap_kho.update({
          where: { id: poId },
          data: { ma_nguoi_kiem_tra: Number(nguoi_nhan_id) }
        });
      }

      // Check partial receiving
      const totalRequested = phieu.chi_tiet_phieu_nhap.reduce((s: number, ct: any) => s + ct.so_luong_yeu_cau, 0);
      const totalReceived = items.reduce((s: number, i: any) => s + (i.actualQty || 0), 0);

      if (totalReceived < totalRequested && totalReceived > 0) {
        // Note partial receiving in ly_do_chenh_lech
        await tx.phieu_nhap_kho.update({
          where: { id: poId },
          data: {
            ly_do_chenh_lech: `Nhận ${totalReceived}/${totalRequested} (thiếu ${totalRequested - totalReceived})`,
          }
        });
      }

      return po;
    });

    return NextResponse.json({ success: true, po: result });
  } catch (error: any) {
    console.error('[POST /api/admin/warehouse/receiving/submit]', error);
    return NextResponse.json({ error: error.message || 'Lỗi máy chủ' }, { status: 500 });
  }
}
