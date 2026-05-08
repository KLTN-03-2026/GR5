"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Package, CheckCircle2, XCircle, TriangleAlert,
  ChevronLeft, ChevronRight, Image as ImageIcon, Eye,
  RefreshCw,
} from "lucide-react";

const CATEGORY_BADGE: Record<string, { bg: string; color: string }> = {
  "Trà & Hoa thảo mộc": { bg: "#fef9c3", color: "#854d0e" },
  "Hạt & Đậu":           { bg: "#fef3c7", color: "#92400e" },
  "Gia vị & Mật ong":    { bg: "#fff7ed", color: "#c2410c" },
  "Củ & Quả":            { bg: "#dcfce7", color: "#15803d" },
  "Nấm tươi":            { bg: "#f0fdf4", color: "#166534" },
  "Rau củ":              { bg: "#ecfdf5", color: "#047857" },
};
const defaultBadge = { bg: "#f3f4f6", color: "#374151" };
const getCatBadge = (name: string) => CATEGORY_BADGE[name] || defaultBadge;
const fmt = (n: any) => Number(n).toLocaleString("vi-VN") + "đ";

function StockCell({ variants }: { variants: any[] }) {
  const [hover, setHover] = useState(false);
  if (!variants?.length) return <span style={{ fontSize: 12, color: "#9ca3af" }}>—</span>;

  const total = variants.reduce((s, v) => s + (v.ton_kho ?? 0), 0);
  const color = total === 0 ? "#991b1b" : total < 10 ? "#92400e" : "#15803d";
  const bg    = total === 0 ? "#fee2e2" : total < 10 ? "#fef9c3" : "#dcfce7";

  return (
    <div style={{ position: "relative" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span style={{ fontSize: 13, fontWeight: 600, padding: "2px 10px", borderRadius: 99, background: bg, color }}>
        {total === 0 ? "Hết hàng" : total}
      </span>
      {hover && variants.length > 1 && (
        <div style={{ position: "absolute", left: 0, top: "100%", zIndex: 20, marginTop: 4, background: "#1e293b", color: "#fff", borderRadius: 8, padding: "10px 14px", minWidth: 220, boxShadow: "0 8px 24px rgba(0,0,0,0.18)" }}>
          {variants.map((v, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12, padding: "4px 0", borderBottom: i < variants.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
              <span style={{ color: "#94a3b8" }}>{v.don_vi_tinh}{v.ten_bien_the ? ` · ${v.ten_bien_the}` : ""}</span>
              <span style={{ fontWeight: 600, color: v.ton_kho === 0 ? "#f87171" : v.ton_kho < 10 ? "#fbbf24" : "#86efac" }}>
                {v.ton_kho} thùng
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PriceCell({ variants }: { variants: any[] }) {
  if (!variants?.length) return <span style={{ fontSize: 12, color: "#9ca3af" }}>—</span>;
  if (variants.length === 1) {
    const v = variants[0];
    return <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{v.don_vi_tinh}{v.ten_bien_the ? ` · ${v.ten_bien_the}` : ""} · {fmt(v.gia_ban)}</span>;
  }
  const prices = variants.map((v) => Number(v.gia_ban)).filter(Boolean);
  const min = Math.min(...prices), max = Math.max(...prices);
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 500, color: "#111827", margin: 0 }}>{fmt(min)} – {fmt(max)}</p>
      <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>{variants.length} phân loại</p>
    </div>
  );
}

export default function InventoryPage() {
  const [products, setProducts]         = useState<any[]>([]);
  const [categories, setCategories]     = useState<any[]>([]);
  const [searchTerm, setSearchTerm]     = useState("");
  const [isLoading, setIsLoading]       = useState(true);
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalCount, setTotalCount]     = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [catFilter, setCatFilter]       = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchData = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(itemsPerPage),
        search,
        ...(catFilter !== "ALL" ? { cat: catFilter } : {}),
      });
      const [invRes, catRes] = await Promise.all([
        fetch(`/api/admin/warehouse/inventory?${params}&t=${Date.now()}`),
        fetch("/api/admin/categories"),
      ]);
      if (invRes.ok) {
        const inv = await invRes.json();
        setProducts(inv.data);
        setTotalPages(inv.meta.totalPages || 1);
        setCurrentPage(inv.meta.page);
        setTotalCount(inv.meta.total || inv.data.length);
      }
      if (catRes.ok) {
        const catJson = await catRes.json();
        setCategories(catJson.data || catJson);
      }
    } catch {}
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchData(1, searchTerm), 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, catFilter, itemsPerPage]);

  const stats = useMemo(() => {
    const total = totalCount;
    const out   = products.filter((p) => p.ton_kho_tong === 0).length;
    const low   = products.filter((p) => p.ton_kho_tong > 0 && p.ton_kho_tong < 10).length;
    const ok    = products.filter((p) => p.ton_kho_tong >= 10).length;
    const cats  = new Set(products.map((p) => p.ma_danh_muc)).size;
    return { total, out, low, ok, cats };
  }, [products, totalCount]);

  const filteredProducts = useMemo(() => {
    if (statusFilter === "ALL") return products;
    if (statusFilter === "out") return products.filter((p) => p.ton_kho_tong === 0);
    if (statusFilter === "low") return products.filter((p) => p.ton_kho_tong > 0 && p.ton_kho_tong < 10);
    return products.filter((p) => p.ton_kho_tong >= 10);
  }, [products, statusFilter]);

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem   = Math.min(currentPage * itemsPerPage, totalCount);

  const generatePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  return (
    <div style={{ background: "#f7f8f6", minHeight: "100vh", padding: "24px 28px", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#111827", margin: 0 }}>Quản lý tồn kho</h1>
        <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>Admin / Kho hàng / Tồn kho</p>
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Tổng sản phẩm",  value: stats.total, sub: `${stats.cats} danh mục`,  Icon: Package,       ic: "#6366f1", ib: "#eef2ff", bt: "#6366f1", vc: "#111827" },
          { label: "Còn hàng",       value: stats.ok,    sub: "Tồn kho ≥ 10",           Icon: CheckCircle2,  ic: "#16a34a", ib: "#dcfce7", bt: "#16a34a", vc: "#15803d" },
          { label: "Sắp hết",        value: stats.low,   sub: "Tồn kho 1–9 thùng",      Icon: TriangleAlert, ic: "#f59e0b", ib: "#fef9c3", bt: "#f59e0b", vc: "#92400e" },
          { label: "Hết hàng",       value: stats.out,   sub: "Cần nhập thêm",           Icon: XCircle,       ic: "#ef4444", ib: "#fef2f2", bt: "#ef4444", vc: "#b91c1c" },
        ].map((c) => (
          <div key={c.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, borderTop: `3px solid ${c.bt}`, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af", margin: 0 }}>{c.label}</p>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: c.ib, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <c.Icon style={{ width: 15, height: 15, color: c.ic }} />
              </div>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: c.vc, margin: 0 }}>{c.value}</p>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: 280 }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9ca3af" }} />
            <input
              type="text"
              placeholder="Tìm tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ width: "100%", height: 38, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 12px 0 34px", outline: "none", color: "#374151", background: "#fff", boxSizing: "border-box" }}
            />
          </div>
          <select
            value={catFilter}
            onChange={(e) => { setCatFilter(e.target.value); setCurrentPage(1); }}
            style={{ height: 38, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 10px", color: "#374151", background: "#fff", outline: "none", minWidth: 160 }}
          >
            <option value="ALL">Tất cả danh mục</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.ten_danh_muc}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ height: 38, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 10px", color: "#374151", background: "#fff", outline: "none" }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ok">Còn hàng (≥10)</option>
            <option value="low">Sắp hết (1–9)</option>
            <option value="out">Hết hàng</option>
          </select>
        </div>
        <button
          onClick={() => fetchData(currentPage, searchTerm)}
          style={{ display: "flex", alignItems: "center", gap: 6, height: 38, padding: "0 14px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, color: "#374151", cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#16a34a")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
        >
          <RefreshCw style={{ width: 14, height: 14 }} /> Làm mới
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "64px 0" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#16a34a", animation: "spin 0.7s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {[
                      { h: "Sản phẩm",      align: "left"   },
                      { h: "Danh mục",      align: "left"   },
                      { h: "Phân loại / Giá", align: "left" },
                      { h: "Tồn kho",       align: "center" },
                      { h: "Lô hàng",       align: "center" },
                      { h: "Cập nhật",      align: "left"   },
                      { h: "Xem",           align: "right"  },
                    ].map((col) => (
                      <th key={col.h} style={{ padding: "10px 12px", fontSize: 12, fontWeight: 500, color: "#9ca3af", textAlign: col.align as any, whiteSpace: "nowrap" }}>
                        {col.h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "60px 0" }}>
                        <Package style={{ width: 40, height: 40, color: "#d1d5db", margin: "0 auto 12px" }} />
                        <p style={{ fontSize: 15, fontWeight: 500, color: "#374151", margin: "0 0 4px" }}>Không có sản phẩm phù hợp</p>
                        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Thử chọn bộ lọc khác</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p, idx) => {
                      const isLast    = idx === filteredProducts.length - 1;
                      const catName   = p.danh_muc?.ten_danh_muc || "";
                      const badge     = getCatBadge(catName);
                      const imgSrc    = p.anh_san_pham?.[0]?.duong_dan_anh || "";
                      const loCount   = p.bien_the_san_pham?.reduce((s: number, bt: any) => s + (bt.lo_hang?.length ?? 0), 0) ?? 0;

                      return (
                        <tr
                          key={p.id}
                          style={{ borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          {/* Sản phẩm */}
                          <td style={{ padding: "12px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 48, height: 48, borderRadius: 8, background: "#f3f4f6", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {imgSrc
                                  ? <img src={imgSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.currentTarget as any).style.display = "none"; }} />
                                  : <ImageIcon style={{ width: 20, height: 20, color: "#d1d5db" }} />}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: 14, fontWeight: 500, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{p.ten_san_pham}</p>
                                <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", fontFamily: "monospace" }}>SP-{String(p.id).padStart(5, "0")}</p>
                              </div>
                            </div>
                          </td>

                          {/* Danh mục */}
                          <td style={{ padding: "12px 12px" }}>
                            {catName
                              ? <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 99, background: badge.bg, color: badge.color, whiteSpace: "nowrap" }}>{catName}</span>
                              : <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>}
                          </td>

                          {/* Phân loại / Giá */}
                          <td style={{ padding: "12px 12px" }}>
                            <PriceCell variants={p.bien_the_san_pham} />
                          </td>

                          {/* Tồn kho */}
                          <td style={{ padding: "12px 12px", textAlign: "center" }}>
                            <StockCell variants={p.bien_the_san_pham} />
                          </td>

                          {/* Số lô */}
                          <td style={{ padding: "12px 12px", textAlign: "center" }}>
                            {loCount > 0
                              ? <span style={{ fontSize: 12, fontWeight: 500, color: "#6366f1", background: "#eef2ff", padding: "2px 8px", borderRadius: 99 }}>{loCount} lô</span>
                              : <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>}
                          </td>

                          {/* Cập nhật */}
                          <td style={{ padding: "12px 12px" }}>
                            <span style={{ fontSize: 12, color: "#9ca3af" }}>
                              {p.ngay_tao ? new Date(p.ngay_tao).toLocaleDateString("vi-VN") : "—"}
                            </span>
                          </td>

                          {/* Xem */}
                          <td style={{ padding: "12px 12px" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                              <button
                                style={{ width: 30, height: 30, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#eef2ff"; e.currentTarget.style.color = "#6366f1"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                                title="Xem chi tiết"
                              >
                                <Eye style={{ width: 14, height: 14 }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalCount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: "1px solid #f3f4f6", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>Hiển thị {startItem}–{endItem} trong {totalCount} sản phẩm</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    style={{ height: 32, border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, padding: "0 8px", color: "#374151", background: "#fff", outline: "none" }}
                  >
                    {[10, 15, 25, 50].map((n) => <option key={n} value={n}>{n} / trang</option>)}
                  </select>
                  {totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button
                        onClick={() => { const p = Math.max(1, currentPage - 1); setCurrentPage(p); fetchData(p, searchTerm); }}
                        disabled={currentPage === 1}
                        style={{ height: 32, minWidth: 32, padding: "0 8px", border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" }}
                      >
                        <ChevronLeft style={{ width: 14, height: 14 }} />
                      </button>
                      {generatePages().map((pg, i) =>
                        pg === "..." ? (
                          <span key={`e-${i}`} style={{ padding: "0 4px", color: "#9ca3af", fontSize: 13 }}>…</span>
                        ) : (
                          <button
                            key={pg}
                            onClick={() => { setCurrentPage(Number(pg)); fetchData(Number(pg), searchTerm); }}
                            style={{ height: 32, minWidth: 32, padding: "0 6px", border: currentPage === pg ? "1px solid #16a34a" : "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, cursor: "pointer", background: currentPage === pg ? "#16a34a" : "#fff", color: currentPage === pg ? "#fff" : "#374151", fontWeight: currentPage === pg ? 600 : 400 }}
                          >
                            {pg}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => { const p = Math.min(totalPages, currentPage + 1); setCurrentPage(p); fetchData(p, searchTerm); }}
                        disabled={currentPage === totalPages}
                        style={{ height: 32, minWidth: 32, padding: "0 8px", border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" }}
                      >
                        <ChevronRight style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
