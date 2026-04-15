import prisma from "@/lib/prisma";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const currentPage = Number(params?.page) || 1;
  const PAGE_SIZE = 6;
  const categoryId = params?.category ? Number(params.category) : undefined;
  const sortParam = params?.sort || "newest";
  const searchKeyword = params?.search ? String(params.search) : undefined;

  const minPrice = params?.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params?.maxPrice ? Number(params.maxPrice) : undefined;
  const minRating = params?.rating ? Number(params.rating) : undefined;

  // TÍNH NĂNG MỚI: Lấy danh sách nhiều xuất xứ từ URL (ngăn cách bằng dấu phẩy)
  const originParam = params?.origin ? String(params.origin) : undefined;

  // 1. ĐIỀU KIỆN LỌC DATABASE
  const whereCondition: any = { trang_thai: "DANG_BAN" };

  if (searchKeyword) {
    whereCondition.ten_san_pham = { contains: searchKeyword };
  }

  if (categoryId) {
    whereCondition.OR = [
      { ma_danh_muc: categoryId },
      { danh_muc: { ma_danh_muc_cha: categoryId } },
    ];
  }

  // Nếu khách chọn nhiều nơi (VD: Đà Lạt, Gia Lai), tìm SP thuộc 1 trong các nơi đó (toán tử 'in')
  if (originParam) {
    const originArray = originParam.split(",").filter(Boolean);
    if (originArray.length > 0) {
      whereCondition.xuat_xu = { in: originArray };
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    whereCondition.bien_the_san_pham = {
      some: {
        gia_ban: {
          ...(minPrice !== undefined ? { gte: minPrice } : {}),
          ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
        },
      },
    };
  }

  // 2. KÉO DỮ LIỆU SẢN PHẨM TỪ DB
  const rawProducts = await prisma.san_pham.findMany({
    where: whereCondition,
    include: {
      anh_san_pham: { where: { la_anh_chinh: true }, take: 1 },
      bien_the_san_pham: { orderBy: { gia_ban: "asc" } },
      danh_gia_san_pham: { select: { so_sao: true } },
    },
  });

  // 3. XÀO NẤU DỮ LIỆU & TÍNH SAO ĐÁNH GIÁ
  let formattedProducts = rawProducts.map((p: any) => {
    const defaultVariant = p.bien_the_san_pham[0];
    const soLuotDanhGia = p.danh_gia_san_pham.length;
    const tongSao = p.danh_gia_san_pham.reduce(
      (sum: any, dg: any) => sum + (dg.so_sao || 0),
      0,
    );
    const trungBinhSao =
      soLuotDanhGia > 0 ? (tongSao / soLuotDanhGia).toFixed(1) : 0;

    return {
      id: p.id,
      ten_san_pham: p.ten_san_pham,
      mo_ta: p.mo_ta || "",
      xuat_xu: p.xuat_xu || "Đặc sản Việt Nam",
      anh_chinh:
        p.anh_san_pham[0]?.duong_dan_anh ||
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
      gia_ban: Number(defaultVariant?.gia_ban || 0),
      gia_goc: defaultVariant?.gia_goc ? Number(defaultVariant.gia_goc) : null,
      danh_gia: Number(trungBinhSao),
      luot_danh_gia: soLuotDanhGia,
    };
  });

  // 4. LỌC THEO SAO ĐÁNH GIÁ
  if (minRating) {
    formattedProducts = formattedProducts.filter(
      (p) => p.danh_gia >= minRating,
    );
  }

  // 5. THUẬT TOÁN SẮP XẾP
  if (sortParam === "price_asc") {
    formattedProducts.sort((a, b) => a.gia_ban - b.gia_ban);
  } else if (sortParam === "price_desc") {
    formattedProducts.sort((a, b) => b.gia_ban - a.gia_ban);
  } else {
    formattedProducts.sort((a, b) => b.id - a.id);
  }

  // 6. CẮT PHÂN TRANG
  const totalProducts = formattedProducts.length;
  const totalPages = Math.ceil(totalProducts / PAGE_SIZE) || 1;
  const skip = (currentPage - 1) * PAGE_SIZE;
  const paginatedProducts = formattedProducts.slice(skip, skip + PAGE_SIZE);

  // 7. KÉO MENU DANH MỤC TỪ DB THẬT
  const rawCategories = await prisma.danh_muc.findMany({
    where: { ma_danh_muc_cha: null },
    include: { other_danh_muc: true },
  });

  const formattedCategories = rawCategories.map((c: any) => ({
    id: c.id,
    ten_danh_muc: c.ten_danh_muc,
    children: c.other_danh_muc.map((child: any) => ({
      id: child.id,
      ten_danh_muc: child.ten_danh_muc,
    })),
  }));

  // 8. KÉO XUẤT XỨ TỪ DB THẬT (FIX LỖI TYPE SCRIPT Ở ĐÂY)
  const uniqueOriginsRaw = await prisma.san_pham.findMany({
    where: { trang_thai: "DANG_BAN", xuat_xu: { not: "" } },
    select: { xuat_xu: true },
    distinct: ["xuat_xu"],
  });

  // Dùng Type Guard (x is string) để nói cho TypeScript biết mảng này cam đoan 100% là chữ, ko có null
  const formattedOrigins: string[] = uniqueOriginsRaw
    .map((o) => o.xuat_xu)
    .filter((x): x is string => typeof x === "string" && x.trim() !== "");

  return (
    <ProductsClient
      products={paginatedProducts}
      categories={formattedCategories}
      origins={formattedOrigins}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}

