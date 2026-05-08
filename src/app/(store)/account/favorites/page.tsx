"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Search,
  SlidersHorizontal,
  Star,
  Tag,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const discount = (sale: number, origin: number) =>
  origin > sale ? Math.round(((origin - sale) / origin) * 100) : 0;

function Stars({ value }: { value: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          fill={s <= Math.round(value) ? "#f59e0b" : "none"}
          color={s <= Math.round(value) ? "#f59e0b" : "#d1d5db"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

// ─── types ───────────────────────────────────────────────────────────────────
interface FavoriteItem {
  favoriteId: number;
  ngay_them: string;
  id: number;
  ten_san_pham: string;
  trang_thai: string | null;
  xuat_xu: string | null;
  danh_muc: string | null;
  anh_chinh: string | null;
  gia_ban: number | null;
  gia_goc: number | null;
  don_vi_tinh: string | null;
  so_sao: number;
  luot_danh_gia: number;
}

// ─── constants ───────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "newest",     label: "Mới thêm nhất" },
  { value: "oldest",     label: "Cũ nhất" },
  { value: "price_asc",  label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
];

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400";

const LIMIT = 12;

// ─── component ───────────────────────────────────────────────────────────────
export default function FavoritesPage() {
  const router = useRouter();

  const [items, setItems]           = useState<FavoriteItem[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [sort, setSort]             = useState("newest");
  const [search, setSearch]         = useState("");
  const [removing, setRemoving]     = useState<number[]>([]);
  const [selected, setSelected]     = useState<number[]>([]);
  const [confirmAll, setConfirmAll] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const topRef    = useRef<HTMLDivElement>(null);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchFavorites = useCallback(async (pg = 1, s = sort) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/store/account/favorites?page=${pg}&limit=${LIMIT}&sort=${s}`
      );
      if (!res.ok) throw new Error();
      const json = await res.json();
      setItems(json.data);
      setTotal(json.meta.total);
      setTotalPages(json.meta.totalPages);
      setPage(pg);
    } catch {
      toast.error("Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => { fetchFavorites(1, sort); }, [sort]);

  // ── remove single ──────────────────────────────────────────────────────────
  const handleRemove = async (productId: number) => {
    setRemoving((p) => [...p, productId]);
    try {
      const res = await fetch(
        `/api/store/account/favorites?ma_san_pham=${productId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      toast.success("Đã xoá khỏi danh sách yêu thích");
      // optimistic remove
      setItems((prev) => prev.filter((i) => i.id !== productId));
      setTotal((t) => t - 1);
      setSelected((s) => s.filter((id) => id !== productId));
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setRemoving((p) => p.filter((id) => id !== productId));
    }
  };

  // ── remove selected ────────────────────────────────────────────────────────
  const handleRemoveSelected = async () => {
    if (!selected.length) return;
    setConfirmAll(false);
    const toRemove = [...selected];
    setRemoving((p) => [...p, ...toRemove]);
    try {
      await Promise.all(
        toRemove.map((id) =>
          fetch(`/api/store/account/favorites?ma_san_pham=${id}`, { method: "DELETE" })
        )
      );
      toast.success(`Đã xoá ${toRemove.length} sản phẩm`);
      setItems((prev) => prev.filter((i) => !toRemove.includes(i.id)));
      setTotal((t) => t - toRemove.length);
      setSelected([]);
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setRemoving((p) => p.filter((id) => !toRemove.includes(id)));
    }
  };

  // ── add to cart ────────────────────────────────────────────────────────────
  const handleAddToCart = (item: FavoriteItem) => {
    router.push(`/products/${item.id}`);
  };

  // ── pagination ─────────────────────────────────────────────────────────────
  const goPage = (pg: number) => {
    fetchFavorites(pg, sort);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ── filtered (client-side search within loaded page) ──────────────────────
  const displayed = search.trim()
    ? items.filter((i) =>
        i.ten_san_pham.toLowerCase().includes(search.toLowerCase()) ||
        (i.danh_muc || "").toLowerCase().includes(search.toLowerCase())
      )
    : items;

  // ── select all ─────────────────────────────────────────────────────────────
  const allSelected = displayed.length > 0 && displayed.every((i) => selected.includes(i.id));
  const toggleSelectAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(displayed.map((i) => i.id));
  };

  // ── page numbers ───────────────────────────────────────────────────────────
  const pageNums = () => {
    const pages: (number | "…")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("…");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div ref={topRef} style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
          <Heart size={22} color="#e11d48" fill="#e11d48" />
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#111" }}>
            Sản phẩm yêu thích
          </h1>
        </div>
        <p style={{ margin: 0, color: "#6b7280", fontSize: "0.875rem" }}>
          {total > 0 ? `${total} sản phẩm trong danh sách của bạn` : "Danh sách trống"}
        </p>
      </div>

      {/* ── Toolbar ── */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: "0.875rem 1rem",
        marginBottom: "1.25rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,.07)",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 0 }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm trong danh sách yêu thích…"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem 0.5rem 2.1rem",
              border: "1.5px solid #e5e7eb",
              borderRadius: 8,
              fontSize: "0.85rem",
              outline: "none",
              background: "#f9fafb",
              boxSizing: "border-box",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <ArrowUpDown size={15} color="#6b7280" />
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            style={{
              padding: "0.5rem 0.75rem",
              border: "1.5px solid #e5e7eb",
              borderRadius: 8,
              fontSize: "0.85rem",
              background: "#f9fafb",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}
          >
            <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              Đã chọn {selected.length}
            </span>
            <button
              onClick={() => setConfirmAll(true)}
              style={{
                display: "flex", alignItems: "center", gap: "0.35rem",
                padding: "0.4rem 0.85rem",
                background: "#fff1f2",
                border: "1.5px solid #fecdd3",
                borderRadius: 8,
                color: "#e11d48",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Trash2 size={14} />
              Xoá đã chọn
            </button>
          </motion.div>
        )}
      </div>

      {/* ── Select-all bar (only when items exist) ── */}
      {displayed.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem", paddingLeft: "0.25rem" }}>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#16a34a" }}
          />
          <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>
            {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả trên trang"}
          </span>
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.07)" }}>
              <div style={{ height: 200, background: "#f3f4f6", animation: "pulse 1.5s infinite" }} />
              <div style={{ padding: "0.875rem" }}>
                <div style={{ height: 14, background: "#f3f4f6", borderRadius: 6, marginBottom: 8, animation: "pulse 1.5s infinite" }} />
                <div style={{ height: 14, background: "#f3f4f6", borderRadius: 6, width: "60%", animation: "pulse 1.5s infinite" }} />
              </div>
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        /* ── Empty state ── */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "4rem 2rem",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,.07)",
          }}
        >
          {search ? (
            <>
              <PackageSearch size={52} color="#d1d5db" style={{ marginBottom: "1rem" }} />
              <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "#374151", margin: "0 0 0.5rem" }}>
                Không tìm thấy kết quả
              </p>
              <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: "0 0 1.25rem" }}>
                Thử tìm kiếm với từ khoá khác
              </p>
              <button onClick={() => setSearch("")} style={{ padding: "0.5rem 1.25rem", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
                Xoá tìm kiếm
              </button>
            </>
          ) : (
            <>
              <Heart size={52} color="#fca5a5" style={{ marginBottom: "1rem" }} />
              <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "#374151", margin: "0 0 0.5rem" }}>
                Chưa có sản phẩm yêu thích
              </p>
              <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>
                Khám phá sản phẩm và nhấn ♥ để lưu vào đây
              </p>
              <Link
                href="/products"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.6rem 1.5rem",
                  background: "#16a34a", color: "#fff",
                  textDecoration: "none", borderRadius: 8, fontWeight: 600, fontSize: "0.9rem",
                }}
              >
                <ShoppingCart size={16} />
                Khám phá ngay
              </Link>
            </>
          )}
        </motion.div>
      ) : (
        /* ── Grid ── */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
          <AnimatePresence mode="popLayout">
            {displayed.map((item) => {
              const isRemoving  = removing.includes(item.id);
              const isSelected  = selected.includes(item.id);
              const disc        = item.gia_goc ? discount(item.gia_ban!, item.gia_goc) : 0;
              const unavailable = item.trang_thai !== "DANG_BAN";

              return (
                <motion.div
                  key={item.favoriteId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: isRemoving ? 0.4 : 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: isSelected
                      ? "0 0 0 2px #16a34a, 0 4px 12px rgba(0,0,0,.08)"
                      : "0 1px 4px rgba(0,0,0,.08)",
                    transition: "box-shadow 0.15s",
                    position: "relative",
                    opacity: unavailable ? 0.75 : 1,
                  }}
                >
                  {/* Checkbox overlay */}
                  <div
                    onClick={() =>
                      setSelected((s) =>
                        s.includes(item.id) ? s.filter((x) => x !== item.id) : [...s, item.id]
                      )
                    }
                    style={{
                      position: "absolute", top: 10, left: 10, zIndex: 10,
                      width: 20, height: 20,
                      background: isSelected ? "#16a34a" : "rgba(255,255,255,0.9)",
                      borderRadius: 5,
                      border: `2px solid ${isSelected ? "#16a34a" : "#d1d5db"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {isSelected && <CheckCircle2 size={13} color="#fff" strokeWidth={3} />}
                  </div>

                  {/* Discount badge */}
                  {disc > 0 && (
                    <div style={{
                      position: "absolute", top: 10, right: 10, zIndex: 10,
                      background: "#e11d48", color: "#fff",
                      fontSize: "0.7rem", fontWeight: 700,
                      padding: "2px 7px", borderRadius: 20,
                    }}>
                      -{disc}%
                    </div>
                  )}

                  {/* Unavailable badge */}
                  {unavailable && (
                    <div style={{
                      position: "absolute", top: 10, right: disc > 0 ? 58 : 10, zIndex: 10,
                      background: "#6b7280", color: "#fff",
                      fontSize: "0.68rem", fontWeight: 600,
                      padding: "2px 7px", borderRadius: 20,
                    }}>
                      Ngừng bán
                    </div>
                  )}

                  {/* Image */}
                  <Link href={`/products/${item.id}`} style={{ display: "block", textDecoration: "none" }}>
                    <div style={{ position: "relative", paddingBottom: "75%", background: "#f9fafb", overflow: "hidden" }}>
                      <img
                        src={item.anh_chinh || PLACEHOLDER}
                        alt={item.ten_san_pham}
                        style={{
                          position: "absolute", inset: 0, width: "100%", height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div style={{ padding: "0.875rem" }}>
                    {/* Category tag */}
                    {item.danh_muc && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 3,
                        fontSize: "0.7rem", color: "#16a34a",
                        background: "#f0fdf4", padding: "2px 8px", borderRadius: 20,
                        marginBottom: "0.4rem",
                      }}>
                        <Tag size={10} />
                        {item.danh_muc}
                      </span>
                    )}

                    {/* Name */}
                    <Link href={`/products/${item.id}`} style={{ textDecoration: "none" }}>
                      <h3 style={{
                        margin: "0 0 0.35rem",
                        fontSize: "0.88rem", fontWeight: 600, color: "#111",
                        lineHeight: 1.4,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {item.ten_san_pham}
                      </h3>
                    </Link>

                    {/* Rating */}
                    {item.luot_danh_gia > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.4rem" }}>
                        <Stars value={item.so_sao} />
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          {item.so_sao.toFixed(1)} ({item.luot_danh_gia})
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div style={{ marginBottom: "0.75rem" }}>
                      {item.gia_ban !== null ? (
                        <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#16a34a" }}>
                            {fmt(item.gia_ban)}
                          </span>
                          {item.don_vi_tinh && (
                            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>/ {item.don_vi_tinh}</span>
                          )}
                          {item.gia_goc && item.gia_goc > item.gia_ban && (
                            <span style={{ fontSize: "0.78rem", color: "#9ca3af", textDecoration: "line-through" }}>
                              {fmt(item.gia_goc)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>Liên hệ</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={unavailable || isRemoving}
                        style={{
                          flex: 1,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem",
                          padding: "0.5rem",
                          background: unavailable ? "#f3f4f6" : "#16a34a",
                          color: unavailable ? "#9ca3af" : "#fff",
                          border: "none", borderRadius: 8,
                          fontSize: "0.8rem", fontWeight: 600,
                          cursor: unavailable ? "not-allowed" : "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { if (!unavailable) (e.currentTarget as HTMLButtonElement).style.background = "#15803d"; }}
                        onMouseLeave={(e) => { if (!unavailable) (e.currentTarget as HTMLButtonElement).style.background = "#16a34a"; }}
                      >
                        <ShoppingCart size={14} />
                        {unavailable ? "Hết hàng" : "Xem & mua"}
                      </button>

                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={isRemoving}
                        title="Xoá khỏi yêu thích"
                        style={{
                          width: 36, height: 36,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: "#fff1f2",
                          border: "1.5px solid #fecdd3",
                          borderRadius: 8,
                          color: "#e11d48",
                          cursor: isRemoving ? "wait" : "pointer",
                          flexShrink: 0,
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#ffe4e6"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff1f2"; }}
                      >
                        {isRemoving ? (
                          <span style={{ width: 14, height: 14, border: "2px solid #fca5a5", borderTopColor: "#e11d48", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Added date footer */}
                  <div style={{
                    padding: "0.4rem 0.875rem",
                    borderTop: "1px solid #f3f4f6",
                    fontSize: "0.72rem", color: "#9ca3af",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <span>
                      Thêm {new Date(item.ngay_them).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </span>
                    <Link href={`/products/${item.id}`} style={{ display: "flex", alignItems: "center", gap: 3, color: "#9ca3af", textDecoration: "none", fontSize: "0.72rem" }}>
                      <ExternalLink size={11} /> Xem
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.4rem", marginTop: "2rem" }}>
          <button
            onClick={() => goPage(page - 1)}
            disabled={page === 1}
            style={{
              width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1.5px solid #e5e7eb", borderRadius: 8,
              background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer",
              color: page === 1 ? "#d1d5db" : "#374151",
            }}
          >
            <ChevronLeft size={16} />
          </button>

          {pageNums().map((p, i) =>
            p === "…" ? (
              <span key={`e${i}`} style={{ padding: "0 4px", color: "#9ca3af" }}>…</span>
            ) : (
              <button
                key={p}
                onClick={() => goPage(p as number)}
                style={{
                  width: 36, height: 36,
                  border: `1.5px solid ${p === page ? "#16a34a" : "#e5e7eb"}`,
                  borderRadius: 8,
                  background: p === page ? "#16a34a" : "#fff",
                  color: p === page ? "#fff" : "#374151",
                  fontWeight: p === page ? 700 : 400,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => goPage(page + 1)}
            disabled={page === totalPages}
            style={{
              width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1.5px solid #e5e7eb", borderRadius: 8,
              background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer",
              color: page === totalPages ? "#d1d5db" : "#374151",
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Confirm bulk delete modal ── */}
      <AnimatePresence>
        {confirmAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
              zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
              padding: "1rem",
            }}
            onClick={() => setConfirmAll(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff", borderRadius: 16, padding: "2rem",
                maxWidth: 420, width: "100%",
                boxShadow: "0 20px 60px rgba(0,0,0,.15)",
                textAlign: "center",
              }}
            >
              <div style={{ width: 52, height: 52, background: "#fff1f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <AlertCircle size={26} color="#e11d48" />
              </div>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700 }}>
                Xoá {selected.length} sản phẩm?
              </h3>
              <p style={{ margin: "0 0 1.5rem", color: "#6b7280", fontSize: "0.875rem" }}>
                Các sản phẩm này sẽ bị xoá khỏi danh sách yêu thích của bạn.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                <button
                  onClick={() => setConfirmAll(false)}
                  style={{ padding: "0.6rem 1.5rem", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontWeight: 600 }}
                >
                  Huỷ
                </button>
                <button
                  onClick={handleRemoveSelected}
                  style={{ padding: "0.6rem 1.5rem", border: "none", borderRadius: 8, background: "#e11d48", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                >
                  Xoá tất cả
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── keyframes ── */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes spin  { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
