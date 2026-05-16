import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = 1;

    const phieu = await prisma.phieu_nhap_kho.findUnique({
      where: { id: Number(id) },
      include: { chi_tiet_phieu_nhap: true }
    });

    if (!phieu) return NextResponse.json({ error: "Không tìm thấy phiếu" }, { status: 404 });
    if (phieu.trang_thai !== "DA_KIEM_TRA") {
      return NextResponse.json({ error: "Chỉ phiếu DA_KIEM_TRA mới được duyệt" }, { status: 400 });
    }
    if (!phieu.ma_vi_tri_cat) {
      return NextResponse.json({ error: "Chưa chọn vị trí cất hàng" }, { status: 400 });
    }

    const tong_so_luong_thuc_nhan = phieu.chi_tiet_phieu_nhap.reduce((sum, item) => sum + (item.so_luong_thuc_nhan || 0), 0);

    await prisma.$transaction(async (tx) => {
      await tx.phieu_nhap_kho.update({
        where: { id: Number(id) },
        data: { trang_thai: "HOAN_THANH", ngay_duyet: new Date() }
      });

      // Existing: create lo hang
      const maNgayHom = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const loHang = await tx.lo_hang.create({
        data: {
          ma_lo_hang: `LH-${maNgayHom}-${id}`,
          ma_phieu_nhap: Number(id),
          ma_ncc: phieu.ma_ncc || undefined,
          ma_bien_the: phieu.chi_tiet_phieu_nhap[0]?.ma_bien_the || undefined,
          ngay_thu_hoach: phieu.ngay_thu_hoach_tt ?? undefined,
          han_su_dung: phieu.han_su_dung_thuc_te ?? new Date(),
          ngay_nhap_kho: new Date(),
          trang_thai: "BINH_THUONG"
        }
      });

      // Update ton_kho_tong
      const existingTonKho = await tx.ton_kho_tong.findFirst({
        where: { ma_lo_hang: loHang.id, ma_vi_tri: phieu.ma_vi_tri_cat! }
      });
      if (existingTonKho) {
        await tx.ton_kho_tong.update({
          where: { id: existingTonKho.id },
          data: { so_luong: { increment: tong_so_luong_thuc_nhan } }
        });
      } else {
        await tx.ton_kho_tong.create({
          data: {
            ma_lo_hang: loHang.id,
            ma_vi_tri: phieu.ma_vi_tri_cat!,
            so_luong: tong_so_luong_thuc_nhan
          }
        });
      }

      // Create kien_hang_chi_tiet
      for (let i = 0; i < tong_so_luong_thuc_nhan; i++) {
        await tx.kien_hang_chi_tiet.create({
          data: {
            ma_lo_hang: loHang.id,
            ma_vi_tri: phieu.ma_vi_tri_cat!,
            ma_vach_quet: `KH-${loHang.id}-${Date.now()}-${i}`,
            trang_thai: "TRONG_KHO"
          }
        });
      }

      // Existing: create cong no ncc
      const tongTien = phieu.chi_tiet_phieu_nhap.reduce((sum, item) => sum + (item.so_luong_thuc_nhan || 0) * Number(item.don_gia), 0);
      if (phieu.ma_ncc && tongTien > 0) {
        await tx.cong_no_ncc.create({
          data: {
            ma_ncc: phieu.ma_ncc,
            loai_giao_dich: "PHAT_SINH_NO",
            so_tien: tongTien,
            nguoi_thuc_hien_id: userId,
            ghi_chu: `Nhập kho phiếu #${id} — ${tong_so_luong_thuc_nhan} thùng`
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
