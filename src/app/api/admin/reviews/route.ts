export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page    = parseInt(searchParams.get("page")   || "1");
    const limit   = parseInt(searchParams.get("limit")  || "15");
    const search  = searchParams.get("search")  || "";
    const star    = searchParams.get("star")    || "";   // "1"–"5"
    const status  = searchParams.get("status")  || "";   // "DA_DUYET" | "DA_AN" | "CHO_DUYET"
    const skip    = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { noi_dung: { contains: search } },
        { san_pham: { ten_san_pham: { contains: search } } },
        { nguoi_dung: { ho_so_nguoi_dung: { ho_ten: { contains: search } } } },
      ];
    }
    if (star)   where.so_sao    = parseInt(star);
    if (status) where.trang_thai = status;

    const [total, data] = await Promise.all([
      prisma.danh_gia_san_pham.count({ where }),
      prisma.danh_gia_san_pham.findMany({
        where,
        include: {
          san_pham: {
            select: {
              ten_san_pham: true,
              anh_san_pham: { where: { la_anh_chinh: true }, take: 1 },
            },
          },
          nguoi_dung: {
            select: {
              email: true,
              ho_so_nguoi_dung: { select: { ho_ten: true, anh_dai_dien: true } },
            },
          },
          anh_danh_gia: { select: { duong_dan_anh: true } },
        },
        orderBy: { ngay_tao: "desc" },
        skip,
        take: limit,
      }),
    ]);

    // Aggregate stats (toàn bộ, không phân trang)
    const [statAll, statByStatus, statByStar] = await Promise.all([
      prisma.danh_gia_san_pham.count(),
      prisma.danh_gia_san_pham.groupBy({ by: ["trang_thai"], _count: { id: true } }),
      prisma.danh_gia_san_pham.groupBy({ by: ["so_sao"],     _count: { id: true } }),
    ]);

    const avgRow = await prisma.danh_gia_san_pham.aggregate({ _avg: { so_sao: true } });

    const reviews = data.map(r => ({
      ...r,
      nguoi_dung: {
        ...r.nguoi_dung,
        ho_ten:      r.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || r.nguoi_dung?.email || "Ẩn danh",
        anh_dai_dien: r.nguoi_dung?.ho_so_nguoi_dung?.anh_dai_dien || null,
      },
    }));

    return NextResponse.json({
      data: reviews,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats: {
        total:     statAll,
        avgRating: Number(avgRow._avg.so_sao?.toFixed(1) || 0),
        byStatus:  Object.fromEntries(statByStatus.map(s => [s.trang_thai ?? "null", s._count.id])),
        byStar:    Object.fromEntries(statByStar.map(s => [s.so_sao ?? 0, s._count.id])),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/reviews:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}
