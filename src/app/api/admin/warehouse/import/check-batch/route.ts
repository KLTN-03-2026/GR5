import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/warehouse/import/check-batch?code=LO-xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim();

  if (!code) return NextResponse.json({ exists: false });

  const lo = await prisma.lo_hang.findFirst({
    where: { ma_lo_hang: { contains: code } },
    include: {
      bien_the_san_pham: true,
      nha_cung_cap: true,
      ton_kho_tong: {
        where: { so_luong: { gt: 0 } },
        include: { vi_tri_kho: true },
      },
    },
  });

  if (!lo) return NextResponse.json({ exists: false });

  return NextResponse.json({
    exists: true,
    lo: {
      id: lo.id,
      ma_lo_hang: lo.ma_lo_hang,
      san_pham: lo.bien_the_san_pham?.ten_bien_the,
      han_su_dung: lo.han_su_dung?.toLocaleDateString("vi-VN"),
      trang_thai: lo.trang_thai,
      so_luong_ton: lo.ton_kho_tong.reduce((s, t) => s + (t.so_luong ?? 0), 0),
      vi_tri: lo.ton_kho_tong
        .map((t) => [t.vi_tri_kho?.khu_vuc, t.vi_tri_kho?.day, t.vi_tri_kho?.ke].filter(Boolean).join("-"))
        .join(", "),
    },
  });
}
