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
            trang_thai: { in: ["DA_GIAO", "HOAN_THANH"] },
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
    bien_the: product.bien_the_san_pham.map((bt: any) => {
      const tonKho = bt.lo_hang?.reduce((sum: number, lh: any) =>
        sum + (lh.ton_kho_tong?.reduce((s: number, tk: any) => s + (tk.so_luong || 0), 0) || 0), 0) || 0;
      return {
        id: bt.id,
        ten_bien_the: bt.ten_bien_the,
        don_vi_tinh: bt.don_vi_tinh,
        gia_ban: Number(bt.gia_ban),
        gia_goc: bt.gia_goc ? Number(bt.gia_goc) : null,
        ton_kho: tonKho,
      };
    }),
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

  const totalStock = formattedProduct.bien_the.reduce((s: number, bt: any) => s + (bt.ton_kho || 0), 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: formattedProduct.ten_san_pham,
    description: formattedProduct.mo_ta,
    image: formattedProduct.hinh_anh,
    brand: { "@type": "Brand", name: formattedProduct.xuat_xu },
    offers: formattedProduct.bien_the.length > 0 ? {
      "@type": "AggregateOffer",
      priceCurrency: "VND",
      lowPrice: Math.min(...formattedProduct.bien_the.map((bt: any) => bt.gia_ban)),
      highPrice: Math.max(...formattedProduct.bien_the.map((bt: any) => bt.gia_ban)),
      offerCount: formattedProduct.bien_the.length,
      availability: totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    } : undefined,
    ...(Number(trungBinhSao) > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: trungBinhSao,
        reviewCount: soLuotDanhGia,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={formattedProduct}
        relatedProducts={formattedRelated}
        isLoggedIn={!!session}
        daMua={!!daMua}
      />
    </>
  );
}
