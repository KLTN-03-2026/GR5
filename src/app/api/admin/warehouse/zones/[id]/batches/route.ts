import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET — Lấy danh sách lô hàng tại một vị trí kệ cụ thể
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const viTri = await prisma.vi_tri_kho.findUnique({
      where: { id: Number(id) },
    });
    if (!viTri) return NextResponse.json({ error: "Không tìm thấy vị trí" }, { status: 404 });

    const batches = await prisma.ton_kho_tong.findMany({
      where: { ma_vi_tri: Number(id), so_luong: { gt: 0 } },
      include: {
        lo_hang: {
          include: {
            bien_the_san_pham: {
              include: { san_pham: { select: { ten_san_pham: true } } },
            },
          },
        },
      },
      orderBy: { lo_hang: { han_su_dung: "asc" } },
    });

    const today = new Date();
    const data = batches.map((b) => {
      const hsd = b.lo_hang?.han_su_dung ? new Date(b.lo_hang.han_su_dung) : null;
      const daysLeft = hsd ? Math.ceil((hsd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

      return {
        id: b.id,
        ma_lo: b.lo_hang?.ma_lo_hang || "N/A",
        san_pham: b.lo_hang?.bien_the_san_pham?.ten_bien_the || b.lo_hang?.bien_the_san_pham?.san_pham?.ten_san_pham || "N/A",
        so_luong: b.so_luong,
        han_su_dung: hsd ? hsd.toLocaleDateString("vi-VN") : "N/A",
        days_left: daysLeft,
        ma_lo_hang_id: b.lo_hang?.id,
        vi_tri: `${viTri.khu_vuc}-${viTri.day}-${viTri.ke}-${viTri.tang}`,
      };
    });

    return NextResponse.json({ viTri, batches: data });
  } catch (err) {
    console.error("[GET /api/admin/warehouse/zones/[id]/batches]", err);
    return NextResponse.json({ error: "Lỗi lấy dữ liệu" }, { status: 500 });
  }
}
