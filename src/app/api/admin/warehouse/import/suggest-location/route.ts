import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/warehouse/import/suggest-location?ma_bien_the=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const maBienThe = Number(searchParams.get("ma_bien_the"));

  if (!maBienThe) return NextResponse.json({ suggestions: [] });

  // Priority 1: Vị trí của các lô cùng sản phẩm đang lưu (FIFO về vị trí)
  const existingPositions = await prisma.ton_kho_tong.findMany({
    where: {
      so_luong: { gt: 0 },
      lo_hang: { ma_bien_the: maBienThe },
    },
    include: {
      vi_tri_kho: true,
      lo_hang: { select: { han_su_dung: true, ma_lo_hang: true } },
    },
    orderBy: { ngay_cap_nhat: "desc" },
    take: 5,
  });

  // Priority 2: Vị trí có sức chứa còn trống nhiều nhất
  const allPositions = await prisma.vi_tri_kho.findMany({
    include: {
      _count: { select: { kien_hang_chi_tiet: { where: { trang_thai: "TRONG_KHO" } } } },
    },
    orderBy: [{ khu_vuc: "asc" }, { day: "asc" }, { ke: "asc" }, { tang: "asc" }],
  });

  const emptySlots = allPositions
    .map((pos) => {
      const capacity = pos.suc_chua_toi_da ?? 100;
      const used = pos._count.kien_hang_chi_tiet;
      const pct = capacity > 0 ? Math.round((used / capacity) * 100) : 100;
      return { pos, capacity, used, pct };
    })
    .filter((s) => s.pct < 90)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 5);

  const suggestions = [
    // Gợi ý từ lô cùng sản phẩm
    ...existingPositions.map((t) => ({
      type: "same_product",
      label: `Cùng SP hiện tại: ${[t.vi_tri_kho?.khu_vuc, t.vi_tri_kho?.day, t.vi_tri_kho?.ke, t.vi_tri_kho?.tang].filter(Boolean).join(" — ")}`,
      khu: t.vi_tri_kho?.khu_vuc || "",
      day: t.vi_tri_kho?.day || "",
      ke: t.vi_tri_kho?.ke || "",
      tang: t.vi_tri_kho?.tang || "",
      vi_tri_id: t.vi_tri_kho?.id,
      note: `Lô ${t.lo_hang?.ma_lo_hang} — HSD ${t.lo_hang?.han_su_dung?.toLocaleDateString("vi-VN")}`,
    })),
    // Gợi ý ô trống
    ...emptySlots
      .filter((s) => !existingPositions.find((e) => e.vi_tri_kho?.id === s.pos.id))
      .slice(0, 3)
      .map((s) => ({
        type: "available",
        label: `Còn trống: ${[s.pos.khu_vuc, s.pos.day, s.pos.ke, s.pos.tang].filter(Boolean).join(" — ")} (còn ${100 - s.pct}% sức chứa)`,
        khu: s.pos.khu_vuc || "",
        day: s.pos.day || "",
        ke: s.pos.ke || "",
        tang: s.pos.tang || "",
        vi_tri_id: s.pos.id,
        note: `${s.used}/${s.capacity} thùng — còn ${100 - s.pct}%`,
      })),
  ];

  return NextResponse.json({ suggestions });
}
