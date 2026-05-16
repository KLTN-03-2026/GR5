import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page   = parseInt(searchParams.get("page")  || "1");
    const limit  = parseInt(searchParams.get("limit") || "15");
    const search = searchParams.get("search") || "";
    const cat    = searchParams.get("cat")    || "";

    const where: any = {};
    if (search) where.ten_san_pham = { contains: search };
    if (cat)    where.ma_danh_muc = parseInt(cat);

    const [total, products] = await Promise.all([
      prisma.san_pham.count({ where }),
      prisma.san_pham.findMany({
        where,
        orderBy: { ngay_tao: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          danh_muc:    { select: { id: true, ten_danh_muc: true } },
          anh_san_pham: { take: 1, select: { duong_dan_anh: true } },
          bien_the_san_pham: {
            select: {
              id: true,
              ma_sku: true,
              ten_bien_the: true,
              don_vi_tinh: true,
              gia_ban: true,
              gia_goc: true,
              lo_hang: {
                select: {
                  id: true,
                  ma_lo_hang: true,
                  trang_thai: true,
                  han_su_dung: true,
                  ton_kho_tong: {
                    select: {
                      so_luong: true,
                      vi_tri_kho: {
                        select: {
                          khu_vuc: true,
                          day: true,
                          ke: true,
                          tang: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const data = products.map((p) => {
      const variants = p.bien_the_san_pham.map((bt) => {
        const ton_kho = bt.lo_hang.reduce(
          (sum, lo) => sum + lo.ton_kho_tong.reduce((s2, t) => s2 + (t.so_luong ?? 0), 0),
          0
        );
        const so_lo = bt.lo_hang.length;
        return { ...bt, ton_kho, so_lo };
      });

      const ton_kho_tong = variants.reduce((s, v) => s + v.ton_kho, 0);
      const so_lo_tong   = variants.reduce((s, v) => s + v.so_lo, 0);

      return { ...p, bien_the_san_pham: variants, ton_kho_tong, so_lo_tong };
    });

    return NextResponse.json({
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error("[GET /api/admin/warehouse/inventory]", error);
    return NextResponse.json(
      { error: "Lỗi server", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}
