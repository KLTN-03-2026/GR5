import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "5");

  if (!q.trim()) {
    return NextResponse.json([]);
  }

  try {
    const products = await prisma.san_pham.findMany({
      where: {
        AND: [
          { trang_thai: "DANG_BAN" }, // chỉ lấy sản phẩm đang bán
          {
            OR: [
              { ten_san_pham: { contains: q } },
              { xuat_xu: { contains: q } },
              { mo_ta: { contains: q } },
            ],
          },
        ],
      },
      take: limit,
      select: {
        id: true,
        ten_san_pham: true,
        xuat_xu: true,
        // Lấy ảnh chính
        anh_san_pham: {
          where: { la_anh_chinh: true },
          take: 1,
          select: { duong_dan_anh: true },
        },
        // Lấy biến thể đầu tiên để lấy giá
        bien_the_san_pham: {
          take: 1,
          orderBy: { gia_ban: "asc" },
          select: {
            gia_ban: true,
            don_vi_tinh: true,
          },
        },
      },
    });

    // Format lại response cho gọn
    const result = products.map((p) => ({
      id: p.id,
      ten_san_pham: p.ten_san_pham,
      xuat_xu: p.xuat_xu,
      anh_chinh: p.anh_san_pham[0]?.duong_dan_anh || null,
      gia_ban: Number(p.bien_the_san_pham[0]?.gia_ban || 0),
      don_vi: p.bien_the_san_pham[0]?.don_vi_tinh || null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Lỗi tìm kiếm sản phẩm:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
