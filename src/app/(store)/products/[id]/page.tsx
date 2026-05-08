import prisma from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);

  const [session, product] = await Promise.all([
    auth(),
    prisma.san_pham.findUnique({
      where: { id: productId },
      include: {
        anh_san_pham: true,
        bien_the_san_pham: { orderBy: { gia_ban: "asc" } },
        danh_muc: true,
        danh_gia_san_pham: {
          where: { trang_thai: "DA_DUYET" },
          include: {
            nguoi_dung: {
              select: {
                email: true,
                ho_so_nguoi_dung: { select: { ho_ten: true, anh_dai_dien: true } },
              },
            },
            anh_danh_gia: { select: { duong_dan_anh: true } },
          },
          orderBy: { ngay_tao: "desc" },
          take: 5,
        },
      },
    }),
  ]);

  if (!product) return notFound();

  const relatedProducts = await prisma.san_pham.findMany({
    where: { ma_danh_muc: product.ma_danh_muc, id: { not: productId }, trang_thai: "DANG_BAN" },
    take: 3,
    include: {
      anh_san_pham: { where: { la_anh_chinh: true }, take: 1 },
      bien_the_san_pham: { orderBy: { gia_ban: "asc" }, take: 1 },
    },
  });

  const daMua = session?.user?.email
    ? await prisma.chi_tiet_don_hang.findFirst({
        where: {
          bien_the_san_pham: { ma_san_pham: productId },
          don_hang: {
            nguoi_dung: { email: session.user.email },
            trang_thai: "HOAN_THANH",
          },
        },
      })
    : null;

  const soLuotDanhGia = product.danh_gia_san_pham.length;
  const tongSao = product.danh_gia_san_pham.reduce((sum: number, dg: any) => sum + (dg.so_sao || 0), 0);
  const trungBinhSao = soLuotDanhGia > 0 ? (tongSao / soLuotDanhGia).toFixed(1) : "0";

  const formattedProduct = {
    id: product.id,
    ten_san_pham: product.ten_san_pham,
    mo_ta: product.mo_ta || "",
    xuat_xu: product.xuat_xu || "Nông sản Việt",
    hinh_anh: product.anh_san_pham.length > 0
      ? product.anh_san_pham.map((a: any) => a.duong_dan_anh)
      : ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"],
    bien_the: product.bien_the_san_pham.map((bt: any) => ({
      id: bt.id,
      ten_bien_the: bt.ten_bien_the,
      don_vi_tinh: bt.don_vi_tinh,
      gia_ban: Number(bt.gia_ban),
      gia_goc: bt.gia_goc ? Number(bt.gia_goc) : null,
    })),
    danh_gia: Number(trungBinhSao),
    luot_danh_gia: soLuotDanhGia,
    danh_sach_danh_gia: product.danh_gia_san_pham.map((dg: any) => ({
      id: dg.id,
      so_sao: dg.so_sao,
      noi_dung: dg.noi_dung,
      ngay_tao: dg.ngay_tao?.toISOString() || null,
      phan_hoi_admin: dg.phan_hoi_admin || null,
      ten_nguoi_dung: dg.nguoi_dung?.ho_so_nguoi_dung?.ho_ten
        || dg.nguoi_dung?.email?.split("@")[0]
        || "Khách hàng",
      anh_dai_dien: dg.nguoi_dung?.ho_so_nguoi_dung?.anh_dai_dien || null,
      anh_danh_gia: dg.anh_danh_gia?.map((a: any) => a.duong_dan_anh) || [],
    })),
  };

  const formattedRelated = relatedProducts.map((p: any) => ({
    id: p.id,
    ten_san_pham: p.ten_san_pham,
    anh_chinh: p.anh_san_pham[0]?.duong_dan_anh || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200",
    gia_ban: Number(p.bien_the_san_pham[0]?.gia_ban || 0),
  }));

  return (
    <ProductDetailClient
      product={formattedProduct}
      relatedProducts={formattedRelated}
      isLoggedIn={!!session}
      daMua={!!daMua}
    />
  );
}
