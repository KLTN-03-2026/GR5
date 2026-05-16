import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;
    
    // ĐÃ FIX: Đưa về tìm kiếm bình thường, không lọc trạng thái Xóa
    const whereCondition = search ? { ten_san_pham: { contains: search } } : {};

    const [total, rawProducts] = await Promise.all([
      prisma.san_pham.count({ where: whereCondition }),
      prisma.san_pham.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          danh_muc: true,
          bien_the_san_pham: {
            include: {
              lo_hang: {
                include: { ton_kho_tong: { select: { so_luong: true } } }
              }
            }
          },
          anh_san_pham: { where: { la_anh_chinh: true }, take: 1 }
        }
      })
    ]);

    const products = rawProducts.map(p => {
      const ton_kho = p.bien_the_san_pham.reduce((sum, bt) => {
        return sum + bt.lo_hang.reduce((s, lh) => {
          return s + lh.ton_kho_tong.reduce((s2, tk) => s2 + (tk.so_luong || 0), 0);
        }, 0);
      }, 0);
      const bien_the_with_stock = p.bien_the_san_pham.map(bt => {
        const btStock = bt.lo_hang.reduce((s, lh) => s + lh.ton_kho_tong.reduce((s2, tk) => s2 + (tk.so_luong || 0), 0), 0);
        const { lo_hang, ...rest } = bt;
        return { ...rest, ton_kho: btStock };
      });
      return { ...p, ton_kho, bien_the_san_pham: bien_the_with_stock };
    });

    return NextResponse.json({
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ten_san_pham, ma_danh_muc, xuat_xu, mo_ta, trang_thai, bien_the, anh_san_pham } = body;

    const newProduct = await prisma.san_pham.create({
      data: {
        ten_san_pham,
        ma_danh_muc: ma_danh_muc ? parseInt(ma_danh_muc) : null,
        xuat_xu: xuat_xu || "",
        mo_ta: mo_ta || "",
        trang_thai: trang_thai || "DANG_BAN",
        
        bien_the_san_pham: {
          create: bien_the.map((bt: any) => ({
            ma_sku: bt.ma_sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 100)}`,
            ten_bien_the: bt.ten_bien_the,
            don_vi_tinh: bt.don_vi_tinh,
            gia_goc: bt.gia_goc ? parseFloat(bt.gia_goc) : null,
            gia_ban: parseFloat(bt.gia_ban),
          }))
        },

        ...(anh_san_pham && anh_san_pham.length > 0 && {
          anh_san_pham: {
            create: anh_san_pham.map((url: string, index: number) => ({
              duong_dan_anh: url,
              la_anh_chinh: index === 0 
            }))
          }
        })
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Lỗi tạo sản phẩm:", error);
    return NextResponse.json({ error: "Lỗi khi lưu sản phẩm" }, { status: 500 });
  }
}