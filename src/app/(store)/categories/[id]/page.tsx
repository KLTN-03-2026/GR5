import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryProductCard from "./CategoryProductCard";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoryId = Number(id);

  if (isNaN(categoryId)) {
    notFound();
  }

  // Fetch category with parent and children
  const category = await prisma.danh_muc.findUnique({
    where: { id: categoryId },
    include: {
      danh_muc: true, // parent category
      other_danh_muc: true, // child categories
    },
  });

  if (!category) {
    notFound();
  }

  // Get all category IDs to fetch products (this category + children)
  const childCategoryIds = (category as any).other_danh_muc?.map(
    (c: any) => c.id
  ) || [];
  const allCategoryIds = [categoryId, ...childCategoryIds];

  // Fetch all products in this category and subcategories
  const rawProducts = await prisma.san_pham.findMany({
    where: {
      trang_thai: "DANG_BAN",
      ma_danh_muc: { in: allCategoryIds },
    },
    include: {
      anh_san_pham: { where: { la_anh_chinh: true }, take: 1 },
      bien_the_san_pham: { orderBy: { gia_ban: "asc" } },
      danh_gia_san_pham: { select: { so_sao: true } },
    },
  });

  // Format products
  const allProducts = rawProducts.map((p: any) => {
    const defaultVariant = p.bien_the_san_pham[0];
    const soLuotDanhGia = p.danh_gia_san_pham.length;
    const tongSao = p.danh_gia_san_pham.reduce(
      (sum: number, dg: any) => sum + (dg.so_sao || 0),
      0
    );
    const trungBinhSao =
      soLuotDanhGia > 0 ? Number((tongSao / soLuotDanhGia).toFixed(1)) : 0;

    return {
      id: p.id,
      ten_san_pham: p.ten_san_pham,
      mo_ta: p.mo_ta || "",
      xuat_xu: p.xuat_xu || "Viet Nam",
      anh_chinh:
        p.anh_san_pham[0]?.duong_dan_anh ||
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
      gia_ban: Number(defaultVariant?.gia_ban || 0),
      gia_goc: defaultVariant?.gia_goc ? Number(defaultVariant.gia_goc) : null,
      ma_bien_the: defaultVariant?.id || null,
      danh_gia: trungBinhSao,
      luot_danh_gia: soLuotDanhGia,
      ngay_tao: p.ngay_tao,
    };
  });

  // Featured products: top 4 by rating (minimum 1 review), fallback to newest
  const featuredProducts = [...allProducts]
    .filter((p) => p.luot_danh_gia > 0)
    .sort((a, b) => b.danh_gia - a.danh_gia || b.luot_danh_gia - a.luot_danh_gia)
    .slice(0, 4);

  // If not enough rated products, fill with newest
  const featured =
    featuredProducts.length >= 2
      ? featuredProducts
      : [...allProducts]
          .sort(
            (a, b) =>
              new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime()
          )
          .slice(0, 4);

  // All products sorted by newest
  const products = [...allProducts].sort(
    (a, b) =>
      new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime()
  );

  const parentCategory = (category as any).danh_muc;
  const childCategories = (category as any).other_danh_muc || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-emerald-100 mb-6">
            <Link
              href="/"
              className="hover:text-white transition-colors"
            >
              Trang chu
            </Link>
            <span className="text-emerald-200">/</span>
            <Link
              href="/products"
              className="hover:text-white transition-colors"
            >
              San pham
            </Link>
            {parentCategory && (
              <>
                <span className="text-emerald-200">/</span>
                <Link
                  href={`/categories/${parentCategory.id}`}
                  className="hover:text-white transition-colors"
                >
                  {parentCategory.ten_danh_muc}
                </Link>
              </>
            )}
            <span className="text-emerald-200">/</span>
            <span className="text-white font-medium">
              {category.ten_danh_muc}
            </span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {category.ten_danh_muc}
          </h1>

          <div className="flex items-center gap-4 mt-4">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              {allProducts.length} san pham
            </span>
            {childCategories.length > 0 && (
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                {childCategories.length} danh muc con
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Sub-categories pills */}
        {childCategories.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Danh muc con
            </h2>
            <div className="flex flex-wrap gap-3">
              {childCategories.map((child: any) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-emerald-200 text-emerald-700 rounded-full text-sm font-medium hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm hover:shadow"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  {child.ten_danh_muc}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products Section */}
        {featured.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  San pham noi bat
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Duoc danh gia cao nhat trong danh muc
                </p>
              </div>
              <div className="hidden md:flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Top san pham
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((product) => (
                <CategoryProductCard
                  key={`featured-${product.id}`}
                  product={product}
                  featured
                />
              ))}
            </div>
          </section>
        )}

        {/* All Products Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Tat ca san pham
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({products.length} san pham)
              </span>
            </h2>
            <Link
              href={`/products?category=${categoryId}`}
              className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors flex items-center gap-1"
            >
              Xem voi bo loc
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chua co san pham nao
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Danh muc nay hien chua co san pham. Vui long quay lai sau.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Xem tat ca san pham
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <CategoryProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
