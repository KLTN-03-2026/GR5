import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
  }

  try {
    const product = await prisma.san_pham.findUnique({
      where: { id: Number(id) },
      include: {
        anh_san_pham: true,
        bien_the_san_pham: {
          orderBy: { gia_ban: "asc" },
          include: {
            lo_hang: {
              where: { trang_thai: "BINH_THUONG" },
              include: { ton_kho_tong: { select: { so_luong: true } } },
            },
          },
        },
        danh_muc: true,
        danh_gia_san_pham: {
          where: { trang_thai: "DA_DUYET" },
          orderBy: { ngay_tao: "desc" },
          take: 5,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    const soLuotDanhGia = product.danh_gia_san_pham.length;
    const tongSao = product.danh_gia_san_pham.reduce((sum, dg) => sum + (dg.so_sao || 0), 0);
    const trungBinhSao = soLuotDanhGia > 0 ? Number((tongSao / soLuotDanhGia).toFixed(1)) : 0;

    const result = {
      id: product.id,
      ten_san_pham: product.ten_san_pham,
      mo_ta: product.mo_ta || "",
      xuat_xu: product.xuat_xu || "Nông sản Việt",
      danh_muc: product.danh_muc
        ? { id: product.danh_muc.id, ten_danh_muc: product.danh_muc.ten_danh_muc }
        : null,
      hinh_anh: product.anh_san_pham.length > 0
        ? product.anh_san_pham.map((a) => a.duong_dan_anh)
        : [],
      anh_chinh: product.anh_san_pham.find((a) => a.la_anh_chinh)?.duong_dan_anh
        || product.anh_san_pham[0]?.duong_dan_anh
        || "",
      bien_the: product.bien_the_san_pham.map((bt) => {
        const tonKho = bt.lo_hang?.reduce(
          (sum, lh) =>
            sum + (lh.ton_kho_tong?.reduce((s, tk) => s + (tk.so_luong || 0), 0) || 0),
          0
        ) || 0;
        return {
          id: bt.id,
          ten_bien_the: bt.ten_bien_the,
          don_vi_tinh: bt.don_vi_tinh,
          gia_ban: Number(bt.gia_ban),
          gia_goc: bt.gia_goc ? Number(bt.gia_goc) : null,
          ton_kho: tonKho,
        };
      }),
      danh_gia: trungBinhSao,
      luot_danh_gia: soLuotDanhGia,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Lỗi lấy chi tiết sản phẩm:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
