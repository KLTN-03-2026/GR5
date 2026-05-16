import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    const bienTheIds = items.map((item: any) => Number(item.ma_bien_the)).filter(Boolean);

    const bienTheList = await prisma.bien_the_san_pham.findMany({
      where: { id: { in: bienTheIds } },
      include: {
        san_pham: { select: { trang_thai: true } },
        lo_hang: {
          include: {
            ton_kho_tong: { select: { so_luong: true } },
          },
        },
      },
    });

    const result = bienTheIds.map((id) => {
      const bienThe = bienTheList.find((bt) => bt.id === id);
      if (!bienThe) {
        return { ma_bien_the: id, ton_tai: false, ton_kho: 0, gia_ban: 0, het_hang: true };
      }

      const tongTonKho = bienThe.lo_hang.reduce((sum, lh) => {
        return sum + lh.ton_kho_tong.reduce((s, tk) => s + (tk.so_luong || 0), 0);
      }, 0);

      const clientItem = items.find((i: any) => Number(i.ma_bien_the) === id);
      const clientPrice = clientItem?.gia_ban || 0;
      const serverPrice = Number(bienThe.gia_ban);

      return {
        ma_bien_the: id,
        ton_tai: true,
        gia_ban: serverPrice,
        gia_goc: Number(bienThe.gia_goc || 0),
        ton_kho: tongTonKho,
        het_hang: tongTonKho <= 0,
        gia_thay_doi: clientPrice > 0 && clientPrice !== serverPrice,
        gia_cu: clientPrice,
        san_pham_active: bienThe.san_pham?.trang_thai === "DANG_BAN",
      };
    });

    return NextResponse.json({ items: result });
  } catch (error) {
    console.error("Lỗi kiểm tra tồn kho:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
