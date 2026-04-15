"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  ChevronRight,
  ChevronDown,
  ShoppingBasket,
  Filter,
  Search,
  Check,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

interface ProductData {
  id: number;
  ten_san_pham: string;
  mo_ta: string;
  xuat_xu: string;
  anh_chinh: string;
  gia_ban: number;
  gia_goc: number | null;
  danh_gia: number;
  luot_danh_gia: number;
}

interface CategoryData {
  id: number;
  ten_danh_muc: string;
  children: { id: number; ten_danh_muc: string }[];
}

export default function ProductsClient({
  products,
  categories,
  origins,
  currentPage,
  totalPages,
}: {
  products: ProductData[];
  categories: CategoryData[];
  origins: string[];
  currentPage: number;
  totalPages: number;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Record<number, boolean>>({
    1: true,
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || "",
  );

  const currentCategoryId = searchParams.get("category")
    ? Number(searchParams.get("category"))
    : null;
  const currentSort = searchParams.get("sort") || "newest";
  const currentSearch = searchParams.get("search") || "";
  const currentMinPrice = searchParams.get("minPrice");
  const currentMaxPrice = searchParams.get("maxPrice");
  const currentRating = searchParams.get("rating")
    ? Number(searchParams.get("rating"))
    : null;

  // TÍNH NĂNG MỚI: Biến chuỗi xuất xứ trên URL thành Mảng để Checkbox nhận diện
  const currentOrigins =
    searchParams.get("origin")?.split(",").filter(Boolean) || [];

  // TÌM KIẾM THEO TÊN CÓ CHỐNG GIẬT SCROLL
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const trimmedSearch = searchValue.trim();
      const paramsSearch = searchParams.get("search") || "";

      if (
        trimmedSearch !== paramsSearch &&
        !(trimmedSearch === "" && paramsSearch === "")
      ) {
        const params = new URLSearchParams(searchParams.toString());
        if (trimmedSearch) params.set("search", trimmedSearch);
        else params.delete("search");
        params.set("page", "1");
        // THÊM SCROLL: FALSE
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchValue, searchParams, pathname, router]);

  const toggleCategory = (id: number) =>
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));

  // HÀM UPDATE FILTER CHUNG CHỐNG GIẬT
  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.set("page", "1");
    // THÊM SCROLL: FALSE
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // HÀM XỬ LÝ CHỌN NHIỀU XUẤT XỨ (MULTI-SELECT)
  const toggleOrigin = (origin: string) => {
    let newOrigins = [...currentOrigins];
    if (newOrigins.includes(origin)) {
      newOrigins = newOrigins.filter((o) => o !== origin); // Bỏ chọn
    } else {
      newOrigins.push(origin); // Chọn thêm
    }

    const params = new URLSearchParams(searchParams.toString());
    if (newOrigins.length > 0) {
      params.set("origin", newOrigins.join(",")); // Nối lại bằng dấu phẩy
    } else {
      params.delete("origin");
    }
    params.set("page", "1");
    // THÊM SCROLL: FALSE
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const PRICE_RANGES = [
    { label: "Tất cả giá", min: null, max: null },
    { label: "Dưới 50.000đ", min: null, max: "50000" },
    { label: "50.000đ - 100.000đ", min: "50000", max: "100000" },
    { label: "100.000đ - 200.000đ", min: "100000", max: "200000" },
    { label: "Từ 200.000đ trở lên", min: "200000", max: null },
  ];

  const handlePriceSelect = (min: string | null, max: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set("minPrice", min);
    else params.delete("minPrice");
    if (max) params.set("maxPrice", max);
    else params.delete("maxPrice");
    params.set("page", "1");
    // THÊM SCROLL: FALSE
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const RATING_FILTERS = [5, 4, 3];

  const generatePagination = () => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2)
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };
  const paginationItems = generatePagination();

  let pageTitle = "Tất cả sản phẩm";
  if (currentSearch) {
    pageTitle = `Kết quả tìm kiếm cho "${currentSearch}"`;
  } else if (currentCategoryId) {
    for (const cat of categories) {
      if (cat.id === currentCategoryId) {
        pageTitle = cat.ten_danh_muc;
        break;
      }
      const child = cat.children?.find((c) => c.id === currentCategoryId);
      if (child) {
        pageTitle = child.ten_danh_muc;
        break;
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 font-sans bg-gray-50/30">
      {/* BREADCRUMB */}
      <div className="flex items-center text-sm text-gray-500 mb-8 font-medium">
        <a href="/" className="hover:text-emerald-600 transition-colors">
          Trang chủ
        </a>
        <ChevronRight className="w-4 h-4 mx-2" />
        <button
          onClick={() => router.push(pathname, { scroll: false })}
          className="hover:text-emerald-600 transition-colors"
        >
          Sản phẩm
        </button>
        {(currentCategoryId || currentSearch) && (
          <>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900 font-bold line-clamp-1">
              {pageTitle}
            </span>
          </>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <button
          className="lg:hidden flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold shadow-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Filter className="w-5 h-5" /> Bộ Lọc Sản Phẩm
        </button>

        {/* --- SIDEBAR BÊN TRÁI --- */}
        <aside
          className={`w-full lg:w-1/4 flex-shrink-0 ${isSidebarOpen ? "block" : "hidden lg:block"}`}
        >
          {/* LỌC DANH MỤC */}
          <div className="mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-emerald-800 flex items-center gap-2">
                <ShoppingBasket className="w-5 h-5" /> Danh Mục
              </h3>
              {currentCategoryId && (
                <button
                  onClick={() => updateFilters("category", null)}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded"
                >
                  Xóa lọc
                </button>
              )}
            </div>
            <ul className="space-y-3">
              {categories.map((cat) => {
                const isOpen = expandedCats[cat.id];
                const hasChildren = cat.children && cat.children.length > 0;
                const isParentActive = currentCategoryId === cat.id;

                return (
                  <li key={cat.id}>
                    <button
                      onClick={() =>
                        hasChildren
                          ? toggleCategory(cat.id)
                          : updateFilters("category", cat.id.toString())
                      }
                      className={`w-full flex items-center justify-between font-bold px-4 py-3 rounded-xl transition-all duration-200 ${isParentActive ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-emerald-50"}`}
                    >
                      {cat.ten_danh_muc}
                      {hasChildren && (
                        <ChevronDown
                          className={`w-4 h-4 ${isOpen ? "rotate-180" : ""} transition-transform`}
                        />
                      )}
                    </button>
                    {isOpen && hasChildren && (
                      <ul className="pl-6 mt-2 border-l-2 border-emerald-100 ml-4 space-y-2 text-gray-500 font-medium text-sm">
                        {cat.children.map((child) => (
                          <li
                            key={child.id}
                            onClick={() =>
                              updateFilters("category", child.id.toString())
                            }
                            className={`cursor-pointer py-1.5 ${currentCategoryId === child.id ? "text-emerald-600 font-bold" : "hover:text-emerald-600"}`}
                          >
                            {child.ten_danh_muc}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* LỌC NƠI XUẤT XỨ (NHIỀU LỰA CHỌN) */}
          {origins.length > 0 && (
            <div className="mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-extrabold text-emerald-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> Xuất Xứ
                </h3>
                {currentOrigins.length > 0 && (
                  <button
                    onClick={() => updateFilters("origin", null)}
                    className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded"
                  >
                    Xóa lọc
                  </button>
                )}
              </div>
              <ul className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {origins.map((origin, idx) => {
                  const isActive = currentOrigins.includes(origin);
                  return (
                    <li key={idx}>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => toggleOrigin(origin)}
                          className="hidden"
                        />
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isActive ? "bg-emerald-600 border-emerald-600" : "border-gray-300 border-2 group-hover:border-emerald-500"}`}
                        >
                          {isActive && (
                            <Check className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium ${isActive ? "text-emerald-700 font-bold" : "text-gray-600 group-hover:text-emerald-600"}`}
                        >
                          {origin}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* LỌC MỨC GIÁ CHỌN NHANH */}
          <div className="mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-extrabold text-emerald-800 mb-5">
              Khoảng Giá
            </h3>
            <ul className="space-y-3">
              {PRICE_RANGES.map((range, idx) => {
                const isActive =
                  currentMinPrice === range.min &&
                  currentMaxPrice === range.max;
                return (
                  <li key={idx}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="priceFilter"
                        checked={isActive}
                        onChange={() => handlePriceSelect(range.min, range.max)}
                        className="hidden"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isActive ? "border-emerald-600 bg-emerald-600" : "border-gray-300 group-hover:border-emerald-500"}`}
                      >
                        {isActive && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${isActive ? "text-emerald-700 font-bold" : "text-gray-600 group-hover:text-emerald-600"}`}
                      >
                        {range.label}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* LỌC THEO SAO ĐÁNH GIÁ */}
          <div className="mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-emerald-800">
                Đánh Giá
              </h3>
              {currentRating && (
                <button
                  onClick={() => updateFilters("rating", null)}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded"
                >
                  Xóa lọc
                </button>
              )}
            </div>
            <ul className="space-y-4">
              {RATING_FILTERS.map((starCount) => {
                const isActive = currentRating === starCount;
                return (
                  <li key={starCount}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="ratingFilter"
                        checked={isActive}
                        onChange={() =>
                          updateFilters("rating", starCount.toString())
                        }
                        className="hidden"
                      />
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isActive ? "bg-emerald-600 border-emerald-600" : "border-gray-300 border-2 group-hover:border-emerald-500"}`}
                      >
                        {isActive && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < starCount ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                          />
                        ))}
                        {starCount < 5 && (
                          <span className="text-sm font-medium text-gray-500 ml-1 group-hover:text-emerald-600">
                            trở lên
                          </span>
                        )}
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* --- CỘT PHẢI: SẢN PHẨM --- */}
        <div className="flex-1">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-headline line-clamp-1 w-full lg:w-1/3">
              {pageTitle}
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-2/3 justify-end">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Nhập tên nông sản..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-12 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => setSearchValue("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 font-bold text-[10px] bg-gray-200 px-1.5 py-0.5 rounded"
                  >
                    XÓA
                  </button>
                )}
              </div>
              <select
                value={currentSort}
                onChange={(e) => updateFilters("sort", e.target.value)}
                className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="newest">Sắp xếp: Mới nhất</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Không tìm thấy sản phẩm!
              </h3>
              <p className="text-gray-500 font-medium mb-6">
                Không có nông sản nào khớp với yêu cầu của bạn.
              </p>
              <button
                onClick={() => {
                  setSearchValue("");
                  router.push(pathname, { scroll: false });
                }}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-emerald-700"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const discountPercent = product.gia_goc
                  ? Math.round(
                      ((product.gia_goc - product.gia_ban) / product.gia_goc) *
                        100,
                    )
                  : 0;
                return (
                  <Link href={`/products/${product.id}`} key={product.id}>
                    <motion.div
                      whileHover={{ y: -6 }}
                      className="bg-white rounded-[20px] p-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 border border-gray-100 flex flex-col h-full cursor-pointer"
                    >
                      <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-50">
                        <img
                          src={product.anh_chinh}
                          alt={product.ten_san_pham}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        />
                        {discountPercent > 0 && (
                          <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                            -{discountPercent}%
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col px-1">
                        <p className="text-xs text-gray-500 mb-1 font-medium capitalize flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />{" "}
                          {product.xuat_xu}
                        </p>
                        <h3 className="font-bold text-gray-900 text-[17px] mb-2 leading-tight">
                          {product.ten_san_pham}
                        </h3>
                        <div className="mb-3">
                          <span className="font-extrabold text-emerald-600 text-lg block">
                            {product.gia_ban.toLocaleString("vi-VN")}đ
                          </span>
                          {product.gia_goc && (
                            <span className="text-xs text-gray-400 line-through block mt-0.5">
                              {product.gia_goc.toLocaleString("vi-VN")}đ
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                          {product.mo_ta}
                        </p>
                        <div className="flex items-center gap-1 bg-gray-50 w-max px-2.5 py-1.5 rounded-lg">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < Math.floor(product.danh_gia) ? "fill-yellow-400" : "fill-gray-200"}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-gray-500 ml-1.5">
                            ({product.luot_danh_gia})
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* PHÂN TRANG */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-14 mb-8">
              <button
                onClick={() =>
                  updateFilters("page", (currentPage - 1).toString())
                }
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-500 border border-gray-200 hover:border-emerald-600 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              {paginationItems.map((item, index) =>
                item === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 font-bold"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${item}`}
                    onClick={() => updateFilters("page", item.toString())}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${currentPage === item ? "bg-emerald-600 text-white shadow-md scale-105" : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-600"}`}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  updateFilters("page", (currentPage + 1).toString())
                }
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-500 border border-gray-200 hover:border-emerald-600 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
