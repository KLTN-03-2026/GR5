"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Image as ImageIcon,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle2,
  XCircle,
  Download,
  Upload,
  TriangleAlert,
} from "lucide-react";
import toast from "react-hot-toast";

const CATEGORY_BADGE: Record<string, { bg: string; color: string }> = {
  "Trà & Hoa thảo mộc": { bg: "#fef9c3", color: "#854d0e" },
  "Hạt & Đậu":           { bg: "#fef3c7", color: "#92400e" },
  "Gia vị & Mật ong":    { bg: "#fff7ed", color: "#c2410c" },
  "Củ & Quả":            { bg: "#dcfce7", color: "#15803d" },
  "Nấm tươi":            { bg: "#f0fdf4", color: "#166534" },
  "Rau củ":              { bg: "#ecfdf5", color: "#047857" },
};
const defaultBadge = { bg: "#f3f4f6", color: "#374151" };
function getCatBadge(name: string) { return CATEGORY_BADGE[name] || defaultBadge; }
function formatPrice(n: any) { return Number(n).toLocaleString("vi-VN") + "đ"; }

function PriceCell({ variants }: { variants: any[] }) {
  const [hover, setHover] = useState(false);
  if (!variants || variants.length === 0) return <span style={{ fontSize: 12, color: "#9ca3af" }}>—</span>;
  if (variants.length === 1) {
    const v = variants[0];
    return (
      <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
        {v.don_vi_tinh}{v.ten_bien_the ? ` · ${v.ten_bien_the}` : ""} · {formatPrice(v.gia_ban)}
      </span>
    );
  }
  const prices = variants.map((v: any) => Number(v.gia_ban)).filter(Boolean);
  const min = Math.min(...prices), max = Math.max(...prices);
  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <p style={{ fontSize: 13, fontWeight: 500, color: "#111827", margin: 0 }}>{formatPrice(min)} – {formatPrice(max)}</p>
      <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>{variants.length} phân loại</p>
      {hover && (
        <div style={{ position: "absolute", left: 0, top: "100%", zIndex: 20, marginTop: 4, background: "#1e293b", color: "#fff", borderRadius: 8, padding: "10px 14px", minWidth: 200, boxShadow: "0 8px 24px rgba(0,0,0,0.18)" }}>
          {variants.map((v: any, i: number) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12, padding: "3px 0", borderBottom: i < variants.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
              <span style={{ color: "#94a3b8" }}>{v.don_vi_tinh}{v.ten_bien_the ? ` · ${v.ten_bien_the}` : ""}</span>
              <span style={{ fontWeight: 600, color: "#86efac" }}>{formatPrice(v.gia_ban)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts]           = useState<any[]>([]);
  const [categories, setCategories]       = useState<any[]>([]);
  const [searchTerm, setSearchTerm]       = useState("");
  const [isLoading, setIsLoading]         = useState(true);
  const [currentPage, setCurrentPage]     = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [totalCount, setTotalCount]       = useState(0);
  const [itemsPerPage, setItemsPerPage]   = useState(15);
  const [catFilter, setCatFilter]         = useState("ALL");
  const [statusFilter, setStatusFilter]   = useState("ALL");
  const [sortBy, setSortBy]               = useState("newest");
  const [selectedIds, setSelectedIds]     = useState<number[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId]           = useState<number | null>(null);
  const [formData, setFormData]             = useState({ ten_san_pham: "", ma_danh_muc: "", xuat_xu: "", mo_ta: "" });
  const [images, setImages]                 = useState<string[]>([""]);
  const [variations, setVariations]         = useState<any[]>([{ ma_sku: "", ten_bien_the: "", don_vi_tinh: "Kg", gia_goc: "", gia_ban: "" }]);
  const [deleteModal, setDeleteModal]       = useState({ isOpen: false, id: null as number | null, name: "" });

  const fetchData = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/admin/products?page=${page}&limit=${itemsPerPage}&search=${search}&t=${Date.now()}`),
        fetch("/api/admin/categories"),
      ]);
      if (prodRes.ok && catRes.ok) {
        const prodData = await prodRes.json();
        const catJson  = await catRes.json();
        setProducts(prodData.data);
        setTotalPages(prodData.meta.totalPages || 1);
        setCurrentPage(prodData.meta.page);
        setTotalCount(prodData.meta.total || prodData.data.length);
        setCategories(catJson.data || catJson);
      }
    } catch {}
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchData(currentPage, searchTerm), 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, itemsPerPage]);

  const stats = useMemo(() => {
    const total  = totalCount;
    const active = products.length;
    const low    = products.filter(p => { const s = p.ton_kho ?? p.bien_the_san_pham?.reduce((a: number, b: any) => a + (Number(b.ton_kho) || 0), 0) ?? 0; return s > 0 && s < 10; }).length;
    const out    = products.filter(p => (p.ton_kho ?? p.bien_the_san_pham?.reduce((a: number, b: any) => a + (Number(b.ton_kho) || 0), 0) ?? 0) === 0).length;
    const cats   = new Set(products.map(p => p.ma_danh_muc)).size;
    const pct    = active > 0 ? Math.round(((active - out) / active) * 100) : 0;
    return { total, active, pct, low, out, cats };
  }, [products, totalCount]);

  const filteredProducts = useMemo(() => {
    let list = products.filter(p => {
      if (catFilter !== "ALL" && String(p.ma_danh_muc) !== String(catFilter)) return false;
      if (statusFilter !== "ALL") {
        const stock = p.ton_kho ?? p.bien_the_san_pham?.reduce((s: number, b: any) => s + (Number(b.ton_kho) || 0), 0) ?? 0;
        if (statusFilter === "out" && stock !== 0) return false;
        if (statusFilter === "low" && !(stock > 0 && stock < 10)) return false;
        if (statusFilter === "active" && stock < 10) return false;
      }
      return true;
    });

    if (sortBy === "price_asc")  list = [...list].sort((a, b) => (Number(a.bien_the_san_pham?.[0]?.gia_ban) || 0) - (Number(b.bien_the_san_pham?.[0]?.gia_ban) || 0));
    if (sortBy === "price_desc") list = [...list].sort((a, b) => (Number(b.bien_the_san_pham?.[0]?.gia_ban) || 0) - (Number(a.bien_the_san_pham?.[0]?.gia_ban) || 0));
    if (sortBy === "stock_asc")  list = [...list].sort((a, b) => {
      const sa = a.ton_kho ?? a.bien_the_san_pham?.reduce((s: number, bt: any) => s + (Number(bt.ton_kho) || 0), 0) ?? 0;
      const sb = b.ton_kho ?? b.bien_the_san_pham?.reduce((s: number, bt: any) => s + (Number(bt.ton_kho) || 0), 0) ?? 0;
      return sa - sb;
    });

    return list;
  }, [products, catFilter, statusFilter, sortBy]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ ten_san_pham: "", ma_danh_muc: "", xuat_xu: "", mo_ta: "" });
    setVariations([{ ma_sku: "", ten_bien_the: "", don_vi_tinh: "Kg", gia_goc: "", gia_ban: "" }]);
    setImages([""]);
    setIsAddModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingId(product.id);
    setFormData({ ten_san_pham: product.ten_san_pham, ma_danh_muc: product.ma_danh_muc?.toString() || "", xuat_xu: product.xuat_xu || "", mo_ta: product.mo_ta || "" });
    setImages(product.anh_san_pham?.length > 0 ? product.anh_san_pham.map((a: any) => a.duong_dan_anh) : [""]);
    setVariations(product.bien_the_san_pham?.length > 0 ? product.bien_the_san_pham : [{ ma_sku: "", ten_bien_the: "", don_vi_tinh: "Kg", gia_goc: "", gia_ban: "" }]);
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ten_san_pham.trim()) { toast.error("Vui lòng nhập Tên sản phẩm!"); return; }
    if (!formData.ma_danh_muc) { toast.error("Vui lòng chọn Danh mục!"); return; }
    if (variations.some(v => !v.don_vi_tinh.trim() || !v.gia_ban)) { toast.error("Vui lòng nhập đủ Đơn vị tính và Giá bán!"); return; }
    const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, bien_the: variations, anh_san_pham: images.filter(i => i.trim()) }) });
      if (res.ok) { toast.success(editingId ? "Cập nhật thành công!" : "Thêm thành công!"); setIsAddModalOpen(false); fetchData(currentPage, searchTerm); }
      else toast.error("Có lỗi xảy ra khi lưu!");
    } catch { toast.error("Lỗi Server!"); }
  };

  const executeDelete = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`/api/admin/products/${deleteModal.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Đã xóa sản phẩm!");
        setDeleteModal({ isOpen: false, id: null, name: "" });
        if (products.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
        else fetchData(currentPage, searchTerm);
      } else toast.error("Không thể xóa sản phẩm này!");
    } catch { toast.error("Lỗi hệ thống!"); }
  };

  const toggleStatus = async (product: any) => {
    const newStatus = product.trang_thai === "DANG_BAN" ? "NGUNG_BAN" : "DANG_BAN";
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ten_san_pham: product.ten_san_pham, ma_danh_muc: product.ma_danh_muc, xuat_xu: product.xuat_xu, mo_ta: product.mo_ta, trang_thai: newStatus, bien_the: product.bien_the_san_pham || [], anh_san_pham: product.anh_san_pham?.map((a: any) => a.duong_dan_anh) || [] }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, trang_thai: newStatus } : p));
        toast.success(newStatus === "DANG_BAN" ? "Đã bật bán sản phẩm" : "Đã tạm ngưng bán");
      } else toast.error("Không thể cập nhật trạng thái");
    } catch { toast.error("Lỗi hệ thống"); }
  };

  const allChecked = filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.includes(p.id));
  const toggleAll  = () => setSelectedIds(allChecked ? [] : filteredProducts.map(p => p.id));
  const toggleOne  = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleExportExcel = (onlySelected = false) => {
    const source = onlySelected
      ? products.filter((p: any) => selectedIds.includes(p.id))
      : filteredProducts;
    if (source.length === 0) { toast.error("Không có sản phẩm để xuất"); return; }
    const rows = source.map((p: any, i: number) => {
      const stock = p.ton_kho ?? p.bien_the_san_pham?.reduce((s: number, b: any) => s + (Number(b.ton_kho) || 0), 0) ?? 0;
      const firstVariant = p.bien_the_san_pham?.[0];
      return {
        STT: i + 1,
        "Mã SP": p.id,
        "Tên sản phẩm": p.ten_san_pham || "",
        "Danh mục": p.danh_muc?.ten_danh_muc || "",
        "Xuất xứ": p.xuat_xu || "",
        "Số biến thể": p.bien_the_san_pham?.length || 0,
        "Giá bán (đ)": firstVariant?.gia_ban ? Number(firstVariant.gia_ban) : 0,
        "Đơn vị": firstVariant?.don_vi_tinh || "",
        "Tồn kho": stock,
        "Trạng thái": p.trang_thai === "DANG_BAN" ? "Đang bán" : p.trang_thai === "TAM_NGUNG" ? "Tạm ngưng" : (p.trang_thai || ""),
        "Ngày tạo": p.ngay_tao ? new Date(p.ngay_tao).toLocaleDateString("vi-VN") : "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SanPham");
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `SanPham_${today}.xlsx`);
    toast.success(`Đã xuất ${source.length} sản phẩm`);
  };

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem   = Math.min(currentPage * itemsPerPage, totalCount);

  const generatePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  type BtnState = { base: React.CSSProperties; enter: (e: React.MouseEvent<HTMLButtonElement>) => void; leave: (e: React.MouseEvent<HTMLButtonElement>) => void };
  const makeBtn = (color: string, hBg: string, hColor: string): BtnState => ({
    base: { width: 30, height: 30, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color },
    enter: e => { e.currentTarget.style.background = hBg; e.currentTarget.style.color = hColor; },
    leave: e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = color; },
  });
  const btnEdit   = makeBtn("#6b7280", "#f0fdf4", "#16a34a");
  const btnDelete = makeBtn("#6b7280", "#fef2f2", "#dc2626");

  return (
    <div style={{ background: "#f7f8f6", minHeight: "100vh", padding: "24px 28px", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}>

      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#111827", margin: 0 }}>Kho sản phẩm</h1>
        <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>Admin / Sản phẩm</p>
      </div>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Tổng sản phẩm", value: stats.total,  sub: `${stats.cats} danh mục`,    Icon: Package,       ic: "#6366f1", ib: "#eef2ff", bt: "#6366f1", vc: "#111827" },
          { label: "Đang bán",      value: stats.active, sub: `${stats.pct}% tổng kho`,    Icon: CheckCircle2,  ic: "#16a34a", ib: "#dcfce7", bt: "#16a34a", vc: "#15803d" },
          { label: "Sắp hết hàng",  value: stats.low,    sub: "Cần nhập thêm",             Icon: TriangleAlert, ic: "#f59e0b", ib: "#fef9c3", bt: "#f59e0b", vc: "#92400e" },
          { label: "Hết hàng",      value: stats.out,    sub: "Tạm ngưng bán",             Icon: XCircle,       ic: "#ef4444", ib: "#fef2f2", bt: "#ef4444", vc: "#b91c1c" },
        ].map(c => (
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

      {/* Toolbar / Bulk action */}
      {selectedIds.length > 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#1e293b", color: "#fff", borderRadius: 8, padding: "10px 16px", marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Đã chọn {selectedIds.length} sản phẩm</span>
          {["Ẩn sản phẩm", "Xóa", "Xuất Excel"].map(lbl => (
            <button
              key={lbl}
              onClick={lbl === "Xuất Excel" ? () => handleExportExcel(true) : undefined}
              style={{ height: 32, padding: "0 14px", background: lbl === "Xóa" ? "#7f1d1d" : "#334155", border: "none", borderRadius: 6, fontSize: 13, color: "#fff", cursor: "pointer" }}
            >
              {lbl}
            </button>
          ))}
          <button onClick={() => setSelectedIds([])} style={{ marginLeft: "auto", height: 32, padding: "0 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, fontSize: 13, color: "#94a3b8", cursor: "pointer" }}>
            Bỏ chọn
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: 280 }}>
              <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9ca3af" }} />
              <input type="text" placeholder="Tìm tên, mã sản phẩm..." value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ width: "100%", height: 38, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 12px 0 34px", outline: "none", color: "#374151", background: "#fff", boxSizing: "border-box" }} />
            </div>
            <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setSelectedIds([]); }} style={{ height: 38, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 10px", color: "#374151", background: "#fff", outline: "none", minWidth: 160 }}>
              <option value="ALL">Tất cả danh mục</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.ten_danh_muc}</option>)}
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); setSelectedIds([]); }} style={{ height: 38, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 10px", color: "#374151", background: "#fff", outline: "none" }}>
              <option value="ALL">Tất cả trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="out">Hết hàng</option>
              <option value="low">Sắp hết</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ height: 38, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 10px", color: "#374151", background: "#fff", outline: "none" }}>
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="stock_asc">Tồn kho thấp nhất</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => handleExportExcel(false)}
              style={{ display: "flex", alignItems: "center", gap: 6, height: 38, padding: "0 14px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, color: "#374151", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#16a34a")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
            >
              <Download style={{ width: 14, height: 14 }} />Xuất Excel
            </button>
            <button
              onClick={() => toast("Tính năng nhập Excel sẽ được bổ sung sau", { icon: "ℹ️" })}
              style={{ display: "flex", alignItems: "center", gap: 6, height: 38, padding: "0 14px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, color: "#374151", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#16a34a")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
            >
              <Upload style={{ width: 14, height: 14 }} />Nhập Excel
            </button>
            <button onClick={openAddModal} style={{ display: "flex", alignItems: "center", gap: 6, height: 38, padding: "0 16px", background: "#16a34a", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#15803d")} onMouseLeave={e => (e.currentTarget.style.background = "#16a34a")}>
              <Plus style={{ width: 15, height: 15 }} /> Thêm sản phẩm
            </button>
          </div>
        </div>
      )}

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
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 940 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "10px 16px", width: 40 }}>
                      <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ cursor: "pointer", width: 15, height: 15, accentColor: "#16a34a" }} />
                    </th>
                    {[
                      { h: "Sản phẩm", align: "left" }, { h: "Danh mục", align: "left" },
                      { h: "Variants / Giá", align: "left" }, { h: "Tồn kho", align: "center" },
                      { h: "Trạng thái", align: "left" }, { h: "Cập nhật", align: "left" },
                      { h: "Thao tác", align: "right" },
                    ].map(col => (
                      <th key={col.h} style={{ padding: "10px 12px", fontSize: 12, fontWeight: 500, color: "#9ca3af", textAlign: col.align as any, whiteSpace: "nowrap" }}>{col.h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "60px 0" }}>
                        <Package style={{ width: 40, height: 40, color: "#d1d5db", margin: "0 auto 12px" }} />
                        <p style={{ fontSize: 15, fontWeight: 500, color: "#374151", margin: "0 0 4px" }}>
                          {catFilter !== "ALL" || statusFilter !== "ALL" ? "Không có sản phẩm phù hợp" : "Chưa có sản phẩm nào"}
                        </p>
                        <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 16px" }}>
                          {catFilter !== "ALL" || statusFilter !== "ALL" ? "Thử chọn bộ lọc khác" : "Thêm sản phẩm đầu tiên để bắt đầu kinh doanh"}
                        </p>
                        {catFilter === "ALL" && statusFilter === "ALL" && (
                          <button onClick={openAddModal} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <Plus style={{ width: 14, height: 14 }} /> Thêm sản phẩm ngay
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p, idx) => {
                      const isSelected = selectedIds.includes(p.id);
                      const isLast     = idx === filteredProducts.length - 1;
                      const catName    = p.danh_muc?.ten_danh_muc || "";
                      const badge      = getCatBadge(catName);
                      const stock      = p.ton_kho ?? p.bien_the_san_pham?.reduce((s: number, b: any) => s + (Number(b.ton_kho) || 0), 0) ?? 0;
                      const imgSrc     = p.anh_san_pham?.[0]?.duong_dan_anh || "";
                      const updatedAt  = p.cap_nhat_luc || p.ngay_tao || "";
                      return (
                        <tr key={p.id}
                          style={{ borderBottom: isLast ? "none" : "1px solid #f3f4f6", background: isSelected ? "#f0fdf4" : "transparent" }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#fafafa"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = isSelected ? "#f0fdf4" : "transparent"; }}
                        >
                          <td style={{ padding: "12px 16px" }}>
                            <input type="checkbox" checked={isSelected} onChange={() => toggleOne(p.id)} style={{ cursor: "pointer", width: 15, height: 15, accentColor: "#16a34a" }} />
                          </td>
                          <td style={{ padding: "12px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 48, height: 48, borderRadius: 8, background: "#f3f4f6", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {imgSrc ? (
                                  <img src={imgSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                  />
                                ) : (
                                  <ImageIcon style={{ width: 20, height: 20, color: "#d1d5db" }} />
                                )}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: 14, fontWeight: 500, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{p.ten_san_pham}</p>
                                <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", fontFamily: "monospace" }}>SP-{String(p.id).padStart(5, "0")}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 12px" }}>
                            {catName
                              ? <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 99, background: badge.bg, color: badge.color, whiteSpace: "nowrap" }}>{catName}</span>
                              : <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>}
                          </td>
                          <td style={{ padding: "12px 12px" }}>
                            <PriceCell variants={p.bien_the_san_pham} />
                          </td>
                          <td style={{ padding: "12px 12px", textAlign: "center" }}>
                            {stock === 0
                              ? <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 99, background: "#fee2e2", color: "#991b1b" }}>Hết hàng</span>
                              : stock < 10
                                ? <span style={{ fontSize: 13, fontWeight: 500, color: "#f59e0b", display: "inline-flex", alignItems: "center", gap: 3 }}><TriangleAlert style={{ width: 13, height: 13 }} />{stock}</span>
                                : <span style={{ fontSize: 13, fontWeight: 500, color: "#16a34a" }}>{stock}</span>}
                          </td>
                          <td style={{ padding: "12px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div
                                onClick={(e) => { e.stopPropagation(); toggleStatus(p); }}
                                style={{ width: 32, height: 18, borderRadius: 99, background: p.trang_thai === "NGUNG_BAN" ? "#d1d5db" : "#16a34a", position: "relative", flexShrink: 0, cursor: "pointer", transition: "background 0.2s" }}
                              >
                                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: p.trang_thai === "NGUNG_BAN" ? 2 : 16, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                              </div>
                              <span style={{ fontSize: 12, color: p.trang_thai === "NGUNG_BAN" ? "#9ca3af" : "#15803d" }}>
                                {p.trang_thai === "NGUNG_BAN" ? "Ngưng bán" : "Đang bán"}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 12px" }}>
                            <span style={{ fontSize: 12, color: "#9ca3af" }}>{updatedAt ? new Date(updatedAt).toLocaleDateString("vi-VN") : "—"}</span>
                          </td>
                          <td style={{ padding: "12px 12px" }}>
                            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                              <button onClick={() => openEditModal(p)} style={btnEdit.base} onMouseEnter={btnEdit.enter} onMouseLeave={btnEdit.leave}><Edit style={{ width: 14, height: 14 }} /></button>
                              <button onClick={() => setDeleteModal({ isOpen: true, id: p.id, name: p.ten_san_pham })} style={btnDelete.base} onMouseEnter={btnDelete.enter} onMouseLeave={btnDelete.leave}><Trash2 style={{ width: 14, height: 14 }} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {totalCount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: "1px solid #f3f4f6", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>Hiển thị {startItem}–{endItem} trong {totalCount} sản phẩm</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ height: 32, border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, padding: "0 8px", color: "#374151", background: "#fff", outline: "none" }}>
                    {[10, 15, 25, 50, 100].map(n => <option key={n} value={n}>{n} / trang</option>)}
                  </select>
                  {totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ height: 32, minWidth: 32, padding: "0 8px", border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" }}>
                        <ChevronLeft style={{ width: 14, height: 14 }} />
                      </button>
                      {generatePages().map((pg, i) =>
                        pg === "..." ? <span key={`e-${i}`} style={{ padding: "0 4px", color: "#9ca3af", fontSize: 13 }}>…</span> : (
                          <button key={pg} onClick={() => setCurrentPage(Number(pg))} style={{ height: 32, minWidth: 32, padding: "0 6px", border: currentPage === pg ? "1px solid #16a34a" : "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, cursor: "pointer", background: currentPage === pg ? "#16a34a" : "#fff", color: currentPage === pg ? "#fff" : "#374151", fontWeight: currentPage === pg ? 600 : 400 }}>{pg}</button>
                        )
                      )}
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ height: 32, minWidth: 32, padding: "0 8px", border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" }}>
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

      {/* Delete modal */}
      {deleteModal.isOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setDeleteModal({ isOpen: false, id: null, name: "" })}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "#fff", maxWidth: 380, width: "100%", borderRadius: 16, padding: 24, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, background: "#fef2f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <AlertTriangle style={{ width: 24, height: 24, color: "#dc2626" }} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: "#111827", margin: "0 0 8px" }}>Xác nhận xóa</h3>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px", lineHeight: 1.5 }}>Xóa sản phẩm "<strong style={{ color: "#111827" }}>{deleteModal.name}</strong>"?</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteModal({ isOpen: false, id: null, name: "" })} style={{ flex: 1, height: 40, background: "#f3f4f6", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#374151" }} onMouseEnter={e => (e.currentTarget.style.background = "#e5e7eb")} onMouseLeave={e => (e.currentTarget.style.background = "#f3f4f6")}>Hủy</button>
              <button onClick={executeDelete} style={{ flex: 1, height: 40, background: "#dc2626", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#fff" }} onMouseEnter={e => (e.currentTarget.style.background = "#b91c1c")} onMouseLeave={e => (e.currentTarget.style.background = "#dc2626")}>Xóa</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add/Edit modal */}
      {isAddModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, boxSizing: "border-box" }} onClick={() => setIsAddModalOpen(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ background: "#fff", maxWidth: 680, width: "100%", borderRadius: 16, maxHeight: "92vh", overflowY: "auto", display: "flex", flexDirection: "column" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: "#111827", margin: 0 }}>{editingId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ width: 32, height: 32, borderRadius: 8, background: "#f3f4f6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} noValidate style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Tên sản phẩm *</label>
                  <input type="text" name="ten_san_pham" value={formData.ten_san_pham} onChange={handleInputChange} placeholder="VD: Gạo ST25"
                    style={{ width: "100%", height: 40, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, padding: "0 12px", outline: "none", boxSizing: "border-box", color: "#111827" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#16a34a")} onBlur={e => (e.currentTarget.style.borderColor = "#d1d5db")} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Danh mục *</label>
                  <select name="ma_danh_muc" value={formData.ma_danh_muc} onChange={handleInputChange}
                    style={{ width: "100%", height: 40, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, padding: "0 12px", outline: "none", color: "#374151", background: "#fff" }}>
                    <option value="">-- Chọn --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.ten_danh_muc}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Xuất xứ</label>
                  <input type="text" name="xuat_xu" value={formData.xuat_xu} onChange={handleInputChange} placeholder="VD: Việt Nam"
                    style={{ width: "100%", height: 40, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, padding: "0 12px", outline: "none", boxSizing: "border-box", color: "#111827" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#16a34a")} onBlur={e => (e.currentTarget.style.borderColor = "#d1d5db")} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Mô tả</label>
                  <textarea name="mo_ta" value={formData.mo_ta} onChange={handleInputChange} rows={3} placeholder="Giới thiệu về sản phẩm..."
                    style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, padding: "10px 12px", outline: "none", resize: "vertical", fontFamily: "var(--font-sans)", boxSizing: "border-box", color: "#111827" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#16a34a")} onBlur={e => (e.currentTarget.style.borderColor = "#d1d5db")} />
                </div>
              </div>

              {/* Variants */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>Phân loại & Giá bán</label>
                  <button type="button" onClick={() => setVariations([...variations, { ma_sku: "", ten_bien_the: "", don_vi_tinh: "Kg", gia_goc: "", gia_ban: "" }])}
                    style={{ fontSize: 12, fontWeight: 500, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
                    + Thêm mức giá
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.2fr 1.2fr 1.2fr 32px", gap: 6, padding: "0 0 6px", fontSize: 11, fontWeight: 500, color: "#9ca3af" }}>
                  {["Mã SKU", "ĐVT *", "Cụ thể", "Giá nhập", "Giá bán *", ""].map(h => <span key={h}>{h}</span>)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {variations.map((v, index) => (
                    <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.2fr 1.2fr 1.2fr 32px", gap: 6, alignItems: "center", background: "#f9fafb", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                      {[
                        { val: v.ma_sku,       key: "ma_sku",       ph: "Tự sinh nếu trống" },
                        { val: v.don_vi_tinh,   key: "don_vi_tinh",  ph: "VD: Kg" },
                        { val: v.ten_bien_the,  key: "ten_bien_the", ph: "VD: 5 kg" },
                        { val: v.gia_goc,       key: "gia_goc",      ph: "0", type: "number" },
                        { val: v.gia_ban,       key: "gia_ban",      ph: "0", type: "number" },
                      ].map(field => (
                        <input key={field.key} type={field.type || "text"} value={field.val ?? ""} placeholder={field.ph}
                          min={field.type === "number" ? "0" : undefined}
                          onKeyDown={field.type === "number" ? (e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); } : undefined}
                          onChange={e => { const nv = [...variations]; nv[index][field.key] = field.type === "number" ? e.target.value.replace(/^-/, '') : e.target.value; setVariations(nv); }}
                          style={{ height: 36, border: field.key === "gia_ban" ? "1px solid #fca5a5" : "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, padding: "0 10px", outline: "none", background: "#fff", color: field.key === "gia_ban" ? "#dc2626" : "#374151", fontWeight: field.key === "gia_ban" ? 600 : 400, width: "100%", boxSizing: "border-box" }} />
                      ))}
                      {variations.length > 1 ? (
                        <button type="button" onClick={() => setVariations(variations.filter((_, i) => i !== index))}
                          style={{ width: 32, height: 36, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.color = "#dc2626"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#9ca3af"; }}>
                          <X style={{ width: 14, height: 14 }} />
                        </button>
                      ) : <div />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>Hình ảnh</label>
                  <button type="button" onClick={() => setImages([...images, ""])} style={{ fontSize: 12, fontWeight: 500, color: "#16a34a", background: "none", border: "none", cursor: "pointer" }}>+ Thêm ảnh</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {images.map((img, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", background: "#f9fafb", padding: "8px 10px", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                      <div style={{ width: 38, height: 38, borderRadius: 8, background: "#fff", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", cursor: "pointer", flexShrink: 0 }}>
                        <ImageIcon style={{ width: 16, height: 16, color: "#d1d5db" }} />
                        <input type="file" accept="image/*" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const tid = toast.loading("Đang tải lên...");
                            const fd = new FormData(); fd.append("file", file);
                            try {
                              const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                              if (res.ok) { const ni = [...images]; ni[idx] = (await res.json()).url; setImages(ni); toast.success("Xong!", { id: tid }); }
                              else throw new Error();
                            } catch { toast.error("Lỗi tải ảnh!", { id: tid }); }
                          }} />
                      </div>
                      <input type="text" value={img} onChange={e => { const ni = [...images]; ni[idx] = e.target.value; setImages(ni); }} placeholder="Hoặc dán URL ảnh vào đây"
                        style={{ flex: 1, height: 36, border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, padding: "0 10px", outline: "none", background: "#fff", boxSizing: "border-box" }} />
                      {img && <img src={img} style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", border: "1px solid #e5e7eb" }} />}
                      {images.length > 1 && (
                        <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <X style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, paddingTop: 16, borderTop: "1px solid #e5e7eb", position: "sticky", bottom: 0, background: "#fff" }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ flex: 1, height: 40, background: "#f3f4f6", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#374151" }} onMouseEnter={e => (e.currentTarget.style.background = "#e5e7eb")} onMouseLeave={e => (e.currentTarget.style.background = "#f3f4f6")}>Hủy</button>
                <button type="submit" style={{ flex: 1, height: 40, background: "#16a34a", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#fff" }} onMouseEnter={e => (e.currentTarget.style.background = "#15803d")} onMouseLeave={e => (e.currentTarget.style.background = "#16a34a")}>
                  {editingId ? "Lưu thay đổi" : "Thêm vào kho"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
