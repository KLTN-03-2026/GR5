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

  // === Smart Related Products ===
  // Priority 1: Products frequently bought together (from order history)
  const frequentlyBoughtTogether = await prisma.$queryRaw<
    { ma_san_pham: number; frequency: bigint }[]
  >`
    SELECT bts2.ma_san_pham, COUNT(*) as frequency
    FROM chi_tiet_don_hang ct1
    JOIN bien_the_san_pham bts1 ON ct1.ma_bien_the = bts1.id
    JOIN chi_tiet_don_hang ct2 ON ct1.ma_don_hang = ct2.ma_don_hang AND ct1.id != ct2.id
    JOIN bien_the_san_pham bts2 ON ct2.ma_bien_the = bts2.id
    JOIN san_pham sp ON bts2.ma_san_pham = sp.id
    WHERE bts1.ma_san_pham = ${productId}
      AND bts2.ma_san_pham != ${productId}
      AND sp.trang_thai = 'DANG_BAN'
    GROUP BY bts2.ma_san_pham
    ORDER BY frequency DESC
    LIMIT 6
  `;

  const frequentIds = frequentlyBoughtTogether.map((r) => r.ma_san_pham);

  let relatedProducts: any[] = [];
  let relatedType: "bought_together" | "similar" = "similar";

  if (frequentIds.length > 0) {
    relatedProducts = await prisma.san_pham.findMany({
      where: { id: { in: frequentIds }, trang_thai: "DANG_BAN" },
      include: {
        anh_san_pham: { where: { la_anh_chinh: true }, take: 1 },
        bien_the_san_pham: { orderBy: { gia_ban: "asc" }, take: 1 },
      },
    });
    // Sort by frequency order
    relatedProducts.sort(
      (a, b) => frequentIds.indexOf(a.id) - frequentIds.indexOf(b.id)
    );
    if (relatedProducts.length > 0) relatedType = "bought_together";
  }

  // Priority 2: Same category with similar price range (+-30%)
  if (relatedProducts.length < 6) {
    const currentPrice = product.bien_the_san_pham[0]?.gia_ban
      ? Number(product.bien_the_san_pham[0].gia_ban)
      : 0;
    const minPrice = currentPrice * 0.7;
    const maxPrice = currentPrice * 1.3;
    const excludeIds = [productId, ...relatedProducts.map((p) => p.id)];

    const sameCategoryProducts = await prisma.san_pham.findMany({
      where: {
        ma_danh_muc: product.ma_danh_muc,
        id: { notIn: excludeIds },
        trang_thai: "DANG_BAN",
        bien_the_san_pham: {
          some: {
            gia_ban: { gte: minPrice, lte: maxPrice },
          },
        },
      },
      take: 6 - relatedProducts.length,
      include: {
        anh_san_pham: { where: { la_anh_chinh: true }, take: 1 },
        bien_the_san_pham: { orderBy: { gia_ban: "asc" }, take: 1 },
      },
    });
    relatedProducts = [...relatedProducts, ...sameCategoryProducts];
  }

  // Priority 3: Same origin (xuat_xu)
  if (relatedProducts.length < 6 && product.xuat_xu) {
    const excludeIds = [productId, ...relatedProducts.map((p) => p.id)];

    const sameOriginProducts = await prisma.san_pham.findMany({
      where: {
        xuat_xu: product.xuat_xu,
        id: { notIn: excludeIds },
        trang_thai: "DANG_BAN",
      },
      take: 6 - relatedProducts.length,
      include: {
        anh_san_pham: { where: { la_anh_chinh: true }, take: 1 },
        bien_the_san_pham: { orderBy: { gia_ban: "asc" }, take: 1 },
      },
    });
    relatedProducts = [...relatedProducts, ...sameOriginProducts];
  }

  // Fallback: Same category (no price filter) if still not enough
  if (relatedProducts.length < 4) {
    const excludeIds = [productId, ...relatedProducts.map((p) => p.id)];

    const fallbackProducts = await prisma.san_pham.findMany({
      where: {
        ma_danh_muc: product.ma_danh_muc,
        id: { notIn: excludeIds },
        trang_thai: "DANG_BAN",
      },
      take: 6 - relatedProducts.length,
      include: {
        anh_san_pham: { where: { la_anh_chinh: true }, take: 1 },
        bien_the_san_pham: { orderBy: { gia_ban: "asc" }, take: 1 },
      },
    });
    relatedProducts = [...relatedProducts, ...fallbackProducts];
  }

  // Limit to 6 max
  relatedProducts = relatedProducts.slice(0, 6);

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
    danh_muc: product.danh_muc ? { id: product.danh_muc.id, ten_danh_muc: product.danh_muc.ten_danh_muc } : null,
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

  const relatedSectionTitle = relatedType === "bought_together"
    ? "Thường mua cùng"
    : "Sản phẩm tương tự";

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
        relatedSectionTitle={relatedSectionTitle}
        isLoggedIn={!!session}
        daMua={!!daMua}
      />
    </>
  );
}
