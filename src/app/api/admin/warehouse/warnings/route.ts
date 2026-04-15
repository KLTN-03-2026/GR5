import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ==========================================
// GET — Lấy tất cả cảnh báo với đầy đủ thông tin
// ==========================================
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Lấy cảnh báo chưa xử lý, kèm full data
    const raw = await prisma.canh_bao_lo_hang.findMany({
      orderBy: [{ da_xu_ly: "asc" }, { ngay_tao: "desc" }],
      include: {
        lo_hang: {
          include: {
            bien_the_san_pham: {
              include: { san_pham: { select: { ten_san_pham: true } } },
            },
            nha_cung_cap: { select: { id: true, ten_ncc: true } },
            ton_kho_tong: {
              include: { vi_tri_kho: true },
              where: { so_luong: { gt: 0 } },
            },
          },
        },
      },
    });

    const warnings = raw.map((w) => {
      const hsd = w.lo_hang?.han_su_dung ? new Date(w.lo_hang.han_su_dung) : null;
      const daysLeft = hsd
        ? Math.ceil((hsd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Tính loại cảnh báo thực tế dựa trên ngày hôm nay
      let loai_hien_tai = w.loai_canh_bao;
      if (hsd && !w.da_xu_ly) {
        if (daysLeft !== null && daysLeft < 0) loai_hien_tai = "HET_HAN";
        else if (daysLeft !== null && daysLeft <= 3) loai_hien_tai = "SAP_HET_HAN_3";
        else if (daysLeft !== null && daysLeft <= 7) loai_hien_tai = "SAP_HET_HAN_7";
        else if (daysLeft !== null && daysLeft <= 30) loai_hien_tai = "SAP_HET_HAN_30";
      }

      const tonKho = w.lo_hang?.ton_kho_tong || [];
      const totalQty = tonKho.reduce((s, t) => s + (t.so_luong ?? 0), 0);
      const viTri = tonKho
        .map((t) =>
          [t.vi_tri_kho?.khu_vuc, t.vi_tri_kho?.day, t.vi_tri_kho?.ke, t.vi_tri_kho?.tang]
            .filter(Boolean)
            .join("-")
        )
        .filter(Boolean)
        .join(", ");

      return {
        id: w.id,
        ma_lo_hang_id: w.lo_hang?.id,
        ma_lo: w.lo_hang?.ma_lo_hang,
        san_pham:
          w.lo_hang?.bien_the_san_pham?.ten_bien_the ||
          w.lo_hang?.bien_the_san_pham?.san_pham?.ten_san_pham ||
          "N/A",
        ncc_id: w.lo_hang?.nha_cung_cap?.id,
        ncc_ten: w.lo_hang?.nha_cung_cap?.ten_ncc,
        so_luong: totalQty,
        vi_tri: viTri || "Chưa xác định",
        han_su_dung: hsd ? hsd.toLocaleDateString("vi-VN") : "N/A",
        han_su_dung_raw: hsd?.toISOString(),
        days_left: daysLeft,
        loai_canh_bao: loai_hien_tai,
        loai_goc: w.loai_canh_bao,
        da_xu_ly: w.da_xu_ly,
        phuong_thuc_xu_ly: w.phuong_thuc_xu_ly,
        ghi_chu_xu_ly: w.ghi_chu_xu_ly,
        ngay_xu_ly: w.ngay_xu_ly,
        lo_hang_trang_thai: w.lo_hang?.trang_thai,
        ma_bien_the: w.lo_hang?.ma_bien_the,
        ton_kho: tonKho.map((t) => ({ id: t.id, so_luong: t.so_luong, vi_tri_id: t.ma_vi_tri })),
      };
    });

    return NextResponse.json({ warnings });
  } catch (err) {
    console.error("[GET /api/admin/warehouse/warnings]", err);
    return NextResponse.json({ error: "Lỗi lấy dữ liệu" }, { status: 500 });
  }
}
