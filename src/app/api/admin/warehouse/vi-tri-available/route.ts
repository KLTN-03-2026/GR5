import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ma_kho = searchParams.get("ma_kho");
    const so_luong = searchParams.get("so_luong");

    if (!ma_kho || !so_luong) {
      return NextResponse.json({ error: "Thiếu ma_kho hoặc so_luong" }, { status: 400 });
    }

    const viTris = await prisma.vi_tri_kho.findMany({
      where: { ma_kho: Number(ma_kho) },
      include: { ton_kho_tong: true }
    });

    const results = viTris.map(vt => {
      const used = vt.ton_kho_tong.reduce((sum, tk) => sum + (tk.so_luong || 0), 0);
      const available = (vt.suc_chua_toi_da || 100) - used;
      const pct = vt.suc_chua_toi_da ? Math.round((used / vt.suc_chua_toi_da) * 100) : 0;
      return {
        id: vt.id,
        khu_vuc: vt.khu_vuc,
        day: vt.day,
        ke: vt.ke,
        tang: vt.tang,
        suc_chua_toi_da: vt.suc_chua_toi_da || 100,
        used,
        available,
        pct
      };
    }).filter(vt => vt.available >= Number(so_luong));

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
