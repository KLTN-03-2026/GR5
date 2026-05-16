import prisma from "@/lib/prisma";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const [categories, products, banners] = await Promise.all([
    prisma.danh_muc.findMany({
      select: {
        id: true,
        ten_danh_muc: true,
        ma_danh_muc_cha: true,
        _count: { select: { san_pham: true } },
      },
      orderBy: { id: "asc" },
    }),
    prisma.san_pham.findMany({
      where: { trang_thai: "DANG_BAN" },
      select: {
        id: true,
        ten_san_pham: true,
        xuat_xu: true,
        danh_muc: { select: { id: true, ten_danh_muc: true } },
        anh_san_pham: { where: { la_anh_chinh: true }, take: 1 },
        bien_the_san_pham: {
          select: { id: true, gia_ban: true, gia_goc: true, don_vi_tinh: true, ten_bien_the: true },
          orderBy: { gia_ban: "asc" },
          take: 1,
        },
      },
      orderBy: { ngay_tao: "desc" },
      take: 12,
    }),
    prisma.banner_quang_cao.findMany({
      where: {
        dang_hoat_dong: true,
        AND: [
          { OR: [{ ngay_bat_dau: null }, { ngay_bat_dau: { lte: new Date() } }] },
          { OR: [{ ngay_ket_thuc: null }, { ngay_ket_thuc: { gte: new Date() } }] },
        ],
      },
      orderBy: { thu_tu_sap_xep: "asc" },
    }),
  ]);

  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.ten_san_pham,
    origin: p.xuat_xu || "Việt Nam",
    category: p.danh_muc?.ten_danh_muc || "",
    categoryId: p.danh_muc?.id || 0,
    image: p.anh_san_pham[0]?.duong_dan_anh || "/placeholder.jpg",
    price: p.bien_the_san_pham[0]?.gia_ban ? Number(p.bien_the_san_pham[0].gia_ban) : 0,
    originalPrice: p.bien_the_san_pham[0]?.gia_goc ? Number(p.bien_the_san_pham[0].gia_goc) : null,
    unit: p.bien_the_san_pham[0]?.don_vi_tinh || "kg",
    variantId: p.bien_the_san_pham[0]?.id || 0,
    variantName: p.bien_the_san_pham[0]?.ten_bien_the || "",
  }));

  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.ten_danh_muc,
    parentId: c.ma_danh_muc_cha,
    productCount: c._count.san_pham,
  }));

  // Banner cho hero slider: tất cả loại trừ popup
  const serializedBanners = banners
    .filter((b) => b.loai_banner !== "popup")
    .map((b) => ({
      id: b.id,
      title: b.tieu_de || "",
      image: b.duong_dan_anh || "",
    }));

  // Banner popup: chỉ loại "popup", lấy cái thứ tự nhỏ nhất nếu có nhiều
  const popupBanners = banners
    .filter((b) => b.loai_banner === "popup")
    .map((b) => ({
      id: b.id,
      title: b.tieu_de || "",
      description: b.mo_ta || "",
      image: b.duong_dan_anh || "",
      link: b.lien_ket || "",
    }));

  return (
    <HomeClient
      products={serializedProducts}
      categories={serializedCategories}
      banners={serializedBanners}
      popupBanners={popupBanners}
    />
  );
}
