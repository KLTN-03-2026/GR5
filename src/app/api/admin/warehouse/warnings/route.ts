import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ==========================================
// GET — Lấy tất cả cảnh báo với đầy đủ thông tin
// ==========================================
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Auto-check: tạo cảnh báo mới cho lô sắp hết hạn (thay cron khi demo)
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + 7);

    const loHangCanCanhBao = await prisma.lo_hang.findMany({
      where: {
        han_su_dung: { lte: targetDate },
        trang_thai: { notIn: ["DA_TIEU_HUY", "TRA_NCC"] },
        ton_kho_tong: { some: { so_luong: { gt: 0 } } },
      },
      select: { id: true, han_su_dung: true },
    });

    for (const lo of loHangCanCanhBao) {
      const existing = await prisma.canh_bao_lo_hang.findFirst({
        where: { ma_lo_hang: lo.id, da_xu_ly: false },
      });
      if (!existing) {
        const diffDays = Math.ceil(
          (new Date(lo.han_su_dung).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        const loai = diffDays <= 0 ? "DA_HET_HAN" : `CON_${diffDays}_NGAY`;
        await prisma.canh_bao_lo_hang.create({
          data: { ma_lo_hang: lo.id, loai_canh_bao: loai },
        });
      }
    }

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
      // daysLeft <= 0 đã hết hạn (gồm cả "0 ngày" — hết hạn trong hôm nay)
      let loai_hien_tai = w.loai_canh_bao;
      if (hsd && !w.da_xu_ly) {
        if (daysLeft !== null && daysLeft <= 0) loai_hien_tai = "HET_HAN";
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

      const tenSP = w.lo_hang?.bien_the_san_pham?.san_pham?.ten_san_pham?.trim() || "";
      const tenBT = w.lo_hang?.bien_the_san_pham?.ten_bien_the?.trim() || "";
      const sanPhamDisplay = tenSP
        ? (tenBT && tenBT.toLowerCase() !== tenSP.toLowerCase() ? `${tenSP} — ${tenBT}` : tenSP)
        : (tenBT || "N/A");

      return {
        id: w.id,
        ma_lo_hang_id: w.lo_hang?.id,
        ma_lo: w.lo_hang?.ma_lo_hang,
        san_pham: sanPhamDisplay,
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
