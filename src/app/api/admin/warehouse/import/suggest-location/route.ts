import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/warehouse/import/suggest-location?ma_bien_the=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const maBienThe = Number(searchParams.get("ma_bien_the"));

  if (!maBienThe) return NextResponse.json({ suggestions: [] });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Priority 1: Vị trí có lô cùng sản phẩm — HSD còn hạn (FEFO)
  const existingPositions = await prisma.ton_kho_tong.findMany({
    where: {
      so_luong: { gt: 0 },
      lo_hang: {
        ma_bien_the: maBienThe,
        han_su_dung: { gte: today }, // P0: filter expired lots
      },
    },
    include: {
      vi_tri_kho: true,
      lo_hang: { select: { han_su_dung: true, ma_lo_hang: true } },
    },
  });

  // Priority 2: Vị trí có sức chứa còn trống
  const allPositions = await prisma.vi_tri_kho.findMany({
    include: {
      _count: { select: { kien_hang_chi_tiet: { where: { trang_thai: "TRONG_KHO" } } } },
    },
    orderBy: [{ khu_vuc: "asc" }, { day: "asc" }, { ke: "asc" }, { tang: "asc" }],
  });

  // Build Group 1: same_product — deduplicated by vi_tri_id, sorted FEFO
  // For each vi_tri_id keep the entry with the nearest HSD
  const group1Map = new Map<number, {
    type: "same_product";
    label: string; khu: string; day: string; ke: string; tang: string;
    vi_tri_id: number;
    note: string;
    hsd: Date;
    daysUntilExpiry: number;
    availableCapacity: number;
    warehouseType: string;
  }>();

  for (const t of existingPositions) {
    const vid = t.vi_tri_kho?.id;
    if (!vid) continue;
    const hsd = t.lo_hang?.han_su_dung ? new Date(t.lo_hang.han_su_dung) : null;
    if (!hsd) continue;
    const daysUntilExpiry = Math.ceil((hsd.getTime() - today.getTime()) / 86400000);
    // capacity info for this vi_tri
    const posInfo = allPositions.find((p) => p.id === vid);
    const capacity = posInfo?.suc_chua_toi_da ?? 100;
    const used = posInfo?._count.kien_hang_chi_tiet ?? 0;
    const availableCapacity = Math.max(0, capacity - used);
    const warehouseType = (posInfo as any)?.loai_kho || "Kho thường";

    const existing = group1Map.get(vid);
    if (!existing || daysUntilExpiry < existing.daysUntilExpiry) {
      const maLo = t.lo_hang?.ma_lo_hang || "";
      group1Map.set(vid, {
        type: "same_product",
        label: [t.vi_tri_kho?.khu_vuc, t.vi_tri_kho?.day, t.vi_tri_kho?.ke, t.vi_tri_kho?.tang].filter(Boolean).join(" — "),
        khu: t.vi_tri_kho?.khu_vuc || "",
        day: t.vi_tri_kho?.day || "",
        ke: t.vi_tri_kho?.ke || "",
        tang: t.vi_tri_kho?.tang || "",
        vi_tri_id: vid,
        note: `Lô ${maLo} — HSD ${hsd.toLocaleDateString("vi-VN")} — Còn ${availableCapacity} thùng`,
        hsd,
        daysUntilExpiry,
        availableCapacity,
        warehouseType,
      });
    }
  }

  // Sort Group 1 by FEFO: daysUntilExpiry ASC, then availableCapacity DESC
  const group1 = Array.from(group1Map.values())
    .sort((a, b) => a.daysUntilExpiry !== b.daysUntilExpiry
      ? a.daysUntilExpiry - b.daysUntilExpiry
      : b.availableCapacity - a.availableCapacity)
    .slice(0, 5)
    .map(({ hsd, daysUntilExpiry, availableCapacity, ...rest }) => ({
      ...rest,
      hsd: hsd.toISOString().split("T")[0],
      daysUntilExpiry,
      availableCapacity,
    }));

  // Build Group 2: available (no same-product lot, or >50% capacity free) — exclude positions in Group 1
  const group1Ids = new Set(group1.map((s) => s.vi_tri_id));

  const group2 = allPositions
    .filter((pos) => !group1Ids.has(pos.id))
    .map((pos) => {
      const capacity = pos.suc_chua_toi_da ?? 100;
      const used = pos._count.kien_hang_chi_tiet;
      const pct = capacity > 0 ? Math.round((used / capacity) * 100) : 100;
      const availablePct = 100 - pct;
      const warehouseType = (pos as any)?.loai_kho || "Kho thường";
      return { pos, capacity, used, pct, availablePct, warehouseType };
    })
    .filter((s) => s.availablePct > 50) // >50% free
    .sort((a, b) => b.availablePct - a.availablePct)
    .slice(0, 5)
    .map((s) => ({
      type: "available" as const,
      label: [s.pos.khu_vuc, s.pos.day, s.pos.ke, s.pos.tang].filter(Boolean).join(" — "),
      khu: s.pos.khu_vuc || "",
      day: s.pos.day || "",
      ke: s.pos.ke || "",
      tang: s.pos.tang || "",
      vi_tri_id: s.pos.id,
      note: `${s.used}/${s.capacity} thùng — còn ${s.availablePct}%`,
      availablePct: s.availablePct,
      warehouseType: s.warehouseType,
    }));

  return NextResponse.json({ suggestions: [...group1, ...group2] });
}
