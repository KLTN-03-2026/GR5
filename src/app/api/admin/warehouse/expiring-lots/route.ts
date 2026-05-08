import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const zone = searchParams.get("zone");
    const day = searchParams.get("day");
    const ke = searchParams.get("ke");
    const daysThreshold = Number(searchParams.get("days_threshold")) || 30;

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysThreshold);

    const conditions: any = {
      so_luong: { gt: 0 },
      lo_hang: {
        han_su_dung: {
          lte: futureDate,
          gte: today,
        }
      }
    };

    if (zone || day || ke) {
      conditions.vi_tri_kho = {};
      if (zone) conditions.vi_tri_kho.khu_vuc = zone;
      if (day) conditions.vi_tri_kho.day = day;
      if (ke) conditions.vi_tri_kho.ke = ke;
    }

    const tonKhoData = await prisma.ton_kho_tong.findMany({
      where: conditions,
      include: {
        lo_hang: {
          include: { bien_the_san_pham: { include: { san_pham: true } } }
        },
        vi_tri_kho: true
      }
    });

    const lots = tonKhoData.map((tk: any) => {
      const hsd = new Date(tk.lo_hang?.han_su_dung || new Date());
      const diffTime = hsd.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        lo_hang: {
          ma_lo: tk.lo_hang?.ma_lo_hang,
          san_pham: tk.lo_hang?.bien_the_san_pham?.san_pham?.ten_san_pham || "Sản phẩm",
          so_luong: tk.so_luong,
          han_su_dung: tk.lo_hang?.han_su_dung
        },
        vi_tri: {
          khu: tk.vi_tri_kho?.khu_vuc,
          day: tk.vi_tri_kho?.day,
          ke: tk.vi_tri_kho?.ke,
          tang: tk.vi_tri_kho?.tang
        },
        days_left: daysLeft
      };
    }).sort((a: any, b: any) => a.days_left - b.days_left);

    return NextResponse.json({ lots, total: lots.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi server" }, { status: 500 });
  }
}
