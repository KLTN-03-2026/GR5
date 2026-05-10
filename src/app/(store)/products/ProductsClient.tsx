"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/store/products/ProductCard";
import gsap from "gsap";

interface ProductData {
  id: number;
  ten_san_pham: string;
  mo_ta: string;
  xuat_xu: string;
  anh_chinh: string;
  gia_ban: number;
  gia_goc: number | null;
  ma_bien_the: number | null;
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

  const sidebarRef = useRef<HTMLElement>(null);
  const breadcrumbRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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

  const currentOrigins =
    searchParams.get("origin")?.split(",").filter(Boolean) || [];

  // Mount animation: sidebar slide-in, breadcrumb + toolbar fade down, cards stagger
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(sidebarRef.current, {
        x: -32, opacity: 0, duration: 0.5, ease: "power3.out",
      });
      gsap.from(breadcrumbRef.current, {
        y: -12, opacity: 0, duration: 0.4, ease: "power2.out",
      });
      gsap.from(toolbarRef.current, {
        y: -8, opacity: 0, duration: 0.4, delay: 0.08, ease: "power2.out",
      });
      if (gridRef.current) {
        gsap.from(gridRef.current.children, {
          y: 24, opacity: 0, duration: 0.45, stagger: 0.06, ease: "power3.out", delay: 0.12,
        });
      }
    });
    return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-animate product grid whenever products list changes (filter/page/sort)
  useEffect(() => {
    if (!gridRef.current) return;
    gsap.fromTo(
      gridRef.current.children,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.38, stagger: 0.055, ease: "power3.out" },
    );
  }, [products]);

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
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchValue, searchParams, pathname, router]);

  const toggleCategory = (id: number) =>
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleOrigin = (origin: string) => {
    let newOrigins = [...currentOrigins];
    if (newOrigins.includes(origin)) {
      newOrigins = newOrigins.filter((o) => o !== origin);
    } else {
      newOrigins.push(origin);
    }

    const params = new URLSearchParams(searchParams.toString());
    if (newOrigins.length > 0) {
      params.set("origin", newOrigins.join(","));
    } else {
      params.delete("origin");
    }
    params.set("page", "1");
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
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const RATING_FILTERS = [5, 4, 3];

  const generatePagination = () => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2)
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };
  const paginationItems = generatePagination();

  let pageTitle = "Tất cả sản phẩm";
  if (currentSearch) {
    pageTitle = `Kết quả tìm kiếm cho "${currentSearch}"`;
  } else if (currentCategoryId) {
    for (const cat of categories) {
      if (cat.id === currentCategoryId) { pageTitle = cat.ten_danh_muc; break; }
      const child = cat.children?.find((c) => c.id === currentCategoryId);
      if (child) { pageTitle = child.ten_danh_muc; break; }
    }
  }

  return (
    <div style={{ background: "#f7f8f6", minHeight: "100vh", fontFamily: "var(--font-sans)", width: "100%", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 48px", boxSizing: "border-box" }}>

        {/* BREADCRUMB */}
        <div ref={breadcrumbRef} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>
          <a href="/" style={{ color: "#9ca3af", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#16a34a")}
            onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
          >
            Trang chủ
          </a>
          <span style={{ color: "#d1d5db", margin: "0 2px" }}>›</span>
          <button
            onClick={() => router.push(pathname, { scroll: false })}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 13, padding: 0 }}
          >
            Sản phẩm
          </button>
          {(currentCategoryId || currentSearch) && (
            <>
              <span style={{ color: "#d1d5db", margin: "0 2px" }}>›</span>
              <span style={{ color: "#374151", fontWeight: 500 }}>{pageTitle}</span>
            </>
          )}
        </div>

        {/* Mobile filter button */}
        <button
          style={{ display: "none" }}
          className="products-mobile-filter-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Filter style={{ width: 16, height: 16, color: "#374151" }} />
          Bộ lọc sản phẩm
        </button>

        <div style={{ display: "flex", gap: 24, alignItems: "start" }}>

          {/* SIDEBAR */}
          <aside ref={sidebarRef} style={{ width: 240, flexShrink: 0 }} className={isSidebarOpen ? "" : "products-sidebar"}>

            {/* Danh mục */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: "#111827", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                  <ShoppingBasket style={{ width: 14, height: 14, color: "#16a34a" }} /> Danh mục
                </h3>
                {currentCategoryId && (
                  <button onClick={() => updateFilters("category", null)}
                    style={{ fontSize: 11, color: "#dc2626", background: "#fef2f2", border: "none", padding: "2px 8px", borderRadius: 4, cursor: "pointer", fontWeight: 500 }}>
                    Xóa lọc
                  </button>
                )}
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                {categories.map((cat) => {
                  const isOpen = expandedCats[cat.id];
                  const hasChildren = cat.children && cat.children.length > 0;
                  const isParentActive = currentCategoryId === cat.id;
                  return (
                    <li key={cat.id}>
                      <button
                        onClick={() => hasChildren ? toggleCategory(cat.id) : updateFilters("category", cat.id.toString())}
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, fontWeight: 500, padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", background: isParentActive ? "#16a34a" : "transparent", color: isParentActive ? "#fff" : "#374151", textAlign: "left" }}
                      >
                        {cat.ten_danh_muc}
                        {hasChildren && <ChevronDown style={{ width: 14, height: 14, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />}
                      </button>
                      {isOpen && hasChildren && (
                        <ul style={{ listStyle: "none", margin: "4px 0 4px 16px", padding: "0 0 0 12px", borderLeft: "2px solid #d1fae5", display: "flex", flexDirection: "column", gap: 2 }}>
                          {cat.children.map((child) => (
                            <li key={child.id}
                              onClick={() => updateFilters("category", child.id.toString())}
                              style={{ fontSize: 12, padding: "5px 8px", cursor: "pointer", borderRadius: 6, color: currentCategoryId === child.id ? "#16a34a" : "#6b7280", fontWeight: currentCategoryId === child.id ? 600 : 400 }}
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

            {/* Xuất xứ */}
            {origins.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: "#111827", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                    <MapPin style={{ width: 14, height: 14, color: "#16a34a" }} /> Xuất xứ
                  </h3>
                  {currentOrigins.length > 0 && (
                    <button onClick={() => updateFilters("origin", null)}
                      style={{ fontSize: 11, color: "#dc2626", background: "#fef2f2", border: "none", padding: "2px 8px", borderRadius: 4, cursor: "pointer", fontWeight: 500 }}>
                      Xóa lọc
                    </button>
                  )}
                </div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "auto" }}>
                  {origins.map((origin, idx) => {
                    const isActive = currentOrigins.includes(origin);
                    return (
                      <li key={idx}>
                        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                          <input type="checkbox" checked={isActive} onChange={() => toggleOrigin(origin)} style={{ display: "none" }} />
                          <div style={{ width: 16, height: 16, borderRadius: 4, border: isActive ? "none" : "2px solid #d1d5db", background: isActive ? "#16a34a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {isActive && <Check style={{ width: 10, height: 10, color: "#fff" }} />}
                          </div>
                          <span style={{ fontSize: 13, color: isActive ? "#16a34a" : "#6b7280", fontWeight: isActive ? 600 : 400 }}>{origin}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Khoảng giá */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: "0 0 12px" }}>Khoảng giá</h3>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {PRICE_RANGES.map((range, idx) => {
                  const isActive = currentMinPrice === range.min && currentMaxPrice === range.max;
                  return (
                    <li key={idx}>
                      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                        <input type="radio" name="priceFilter" checked={isActive} onChange={() => handlePriceSelect(range.min, range.max)} style={{ display: "none" }} />
                        <div style={{ width: 16, height: 16, borderRadius: "50%", border: isActive ? "none" : "2px solid #d1d5db", background: isActive ? "#16a34a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {isActive && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                        </div>
                        <span style={{ fontSize: 13, color: isActive ? "#16a34a" : "#6b7280", fontWeight: isActive ? 600 : 400 }}>{range.label}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Đánh giá */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>Đánh giá</h3>
                {currentRating && (
                  <button onClick={() => updateFilters("rating", null)}
                    style={{ fontSize: 11, color: "#dc2626", background: "#fef2f2", border: "none", padding: "2px 8px", borderRadius: 4, cursor: "pointer", fontWeight: 500 }}>
                    Xóa lọc
                  </button>
                )}
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {RATING_FILTERS.map((starCount) => {
                  const isActive = currentRating === starCount;
                  return (
                    <li key={starCount}>
                      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                        <input type="radio" name="ratingFilter" checked={isActive} onChange={() => updateFilters("rating", starCount.toString())} style={{ display: "none" }} />
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: isActive ? "none" : "2px solid #d1d5db", background: isActive ? "#16a34a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {isActive && <Check style={{ width: 10, height: 10, color: "#fff" }} />}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} style={{ width: 13, height: 13, fill: i < starCount ? "#fbbf24" : "#e5e7eb", color: i < starCount ? "#fbbf24" : "#e5e7eb" }} />
                          ))}
                          {starCount < 5 && <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 2 }}>trở lên</span>}
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* CỘT PHẢI */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Toolbar row */}
            <div ref={toolbarRef} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="products-filter-toggle"
                  style={{ display: "none", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 18px", fontSize: 14, color: "#374151", fontWeight: 500, cursor: "pointer" }}
                >
                  <Filter style={{ width: 14, height: 14 }} /> Bộ lọc sản phẩm
                </button>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: "#111827", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 300 }}>
                  {pageTitle}
                </h1>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ position: "relative" }}>
                  <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9ca3af" }} />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Nhập tên nông sản..."
                    style={{ width: 260, height: 38, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, padding: "0 12px 0 34px", outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}
                  />
                  {searchValue && (
                    <button type="button" onClick={() => setSearchValue("")}
                      style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 11, fontWeight: 600 }}>
                      ✕
                    </button>
                  )}
                </div>
                <select
                  value={currentSort}
                  onChange={(e) => updateFilters("sort", e.target.value)}
                  style={{ height: 38, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, padding: "0 12px", outline: "none", color: "#374151", background: "#fff", cursor: "pointer", fontFamily: "var(--font-sans)" }}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá: Thấp → Cao</option>
                  <option value="price_desc">Giá: Cao → Thấp</option>
                </select>
              </div>
            </div>

            {/* Empty state */}
            {products.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center", background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111827", margin: "0 0 8px" }}>Không tìm thấy sản phẩm</h3>
                <p style={{ fontSize: 14, color: "#6b7280", maxWidth: 400, margin: "0 0 20px", lineHeight: 1.6 }}>
                  {currentSearch ? (
                    <>Không tìm thấy kết quả nào cho <strong style={{ color: "#16a34a" }}>"{currentSearch}"</strong>.</>
                  ) : (
                    "Không có nông sản nào khớp với bộ lọc hiện tại."
                  )}
                </p>
                <button
                  onClick={() => { setSearchValue(""); router.push(pathname, { scroll: false }); }}
                  style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* PHÂN TRANG */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 40 }}>
                <button
                  onClick={() => updateFilters("page", (currentPage - 1).toString())}
                  disabled={currentPage === 1}
                  style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#fff", border: "1px solid #e5e7eb", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1, color: "#6b7280" }}
                >
                  <ChevronRight style={{ width: 16, height: 16, transform: "rotate(180deg)" }} />
                </button>
                {paginationItems.map((item, index) =>
                  item === "..." ? (
                    <span key={`ellipsis-${index}`} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>...</span>
                  ) : (
                    <button
                      key={`page-${item}`}
                      onClick={() => updateFilters("page", item.toString())}
                      style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", background: currentPage === item ? "#16a34a" : "#fff", color: currentPage === item ? "#fff" : "#374151", border: currentPage === item ? "none" : "1px solid #e5e7eb" }}
                    >
                      {item}
                    </button>
                  )
                )}
                <button
                  onClick={() => updateFilters("page", (currentPage + 1).toString())}
                  disabled={currentPage === totalPages}
                  style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#fff", border: "1px solid #e5e7eb", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.4 : 1, color: "#6b7280" }}
                >
                  <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
