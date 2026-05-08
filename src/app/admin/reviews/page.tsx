"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Eye, EyeOff, Trash2, Search, MessageSquare, AlertTriangle,
  X, CheckCircle2, Clock, MessageCircle, Send, ChevronLeft, ChevronRight,
  ThumbsUp, ThumbsDown, Filter, Image as ImageIcon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

/* ────────────────── helpers ────────────────── */
const STATUS_META: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  DA_DUYET:  { label: "Đã duyệt",     color: "#16a34a", bg: "#dcfce7", Icon: CheckCircle2 },
  DA_AN:     { label: "Đã ẩn",        color: "#ef4444", bg: "#fef2f2", Icon: EyeOff },
  CHO_DUYET: { label: "Chờ duyệt",    color: "#f59e0b", bg: "#fef9c3", Icon: Clock },
};
const statusMeta = (s: string) => STATUS_META[s] ?? STATUS_META["CHO_DUYET"];

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} style={{ width: size, height: size, flexShrink: 0,
          fill: i <= value ? "#f59e0b" : "#e5e7eb", color: i <= value ? "#f59e0b" : "#e5e7eb" }} />
      ))}
    </div>
  );
}

function Avatar({ name, src, size = 36 }: { name: string; src?: string | null; size?: number }) {
  const initials = name?.charAt(0)?.toUpperCase() || "?";
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />;
  const colors = ["#f59e0b", "#6366f1", "#16a34a", "#ef4444", "#06b6d4", "#8b5cf6"];
  const bg = colors[name.charCodeAt(0) % colors.length] || "#9ca3af";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, color: "#6b7280", width: 8, textAlign: "right" }}>{star}</span>
      <Star style={{ width: 11, height: 11, fill: "#f59e0b", color: "#f59e0b", flexShrink: 0 }} />
      <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#f59e0b", borderRadius: 99, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 11, color: "#9ca3af", width: 28, textAlign: "right" }}>{count}</span>
    </div>
  );
}

/* ────────────────── page ────────────────── */
export default function ReviewsPage() {
  const [reviews, setReviews]     = useState<any[]>([]);
  const [stats, setStats]         = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // filters
  const [search, setSearch]       = useState("");
  const [starFilter, setStarFilter]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // pagination
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const LIMIT = 15;

  // modals
  const [viewModal, setViewModal]   = useState<{ open: boolean; data: any }>({ open: false, data: null });
  const [replyModal, setReplyModal] = useState<{ open: boolean; data: any }>({ open: false, data: null });
  const [replyText, setReplyText]   = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [deleteModal, setDeleteModal]   = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  /* ── fetch ── */
  const fetchReviews = async (p = page) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: p.toString(), limit: LIMIT.toString(),
        search, star: starFilter, status: statusFilter,
        t: Date.now().toString(),
      });
      const res = await fetch(`/api/admin/reviews?${params}`);
      if (res.ok) {
        const json = await res.json();
        setReviews(json.data || []);
        setTotalPages(json.meta?.totalPages || 1);
        setTotal(json.meta?.total || 0);
        if (json.stats) setStats(json.stats);
      }
    } catch { toast.error("Lỗi tải dữ liệu!"); }
    finally   { setIsLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchReviews(1); }, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, starFilter, statusFilter]);

  useEffect(() => { fetchReviews(page); }, [page]);  // eslint-disable-line

  /* ── actions ── */
  const toggleStatus = async (id: number, current: string) => {
    const next = current === "DA_AN" ? "DA_DUYET" : "DA_AN";
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trang_thai: next }),
      });
      if (res.ok) {
        toast.success(next === "DA_DUYET" ? "Đã duyệt hiển thị" : "Đã ẩn đánh giá");
        fetchReviews(page);
      } else toast.error("Lỗi cập nhật!");
    } catch { toast.error("Lỗi hệ thống!"); }
  };

  const approveReview = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trang_thai: "DA_DUYET" }),
      });
      if (res.ok) { toast.success("Đã duyệt!"); fetchReviews(page); }
    } catch { toast.error("Lỗi hệ thống!"); }
  };

  const submitReply = async () => {
    if (!replyModal.data || !replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${replyModal.data.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phan_hoi_admin: replyText.trim() }),
      });
      if (res.ok) {
        toast.success("Đã gửi phản hồi!");
        setReplyModal({ open: false, data: null });
        setReplyText("");
        fetchReviews(page);
      } else toast.error("Lỗi gửi phản hồi!");
    } catch { toast.error("Lỗi hệ thống!"); }
    finally { setReplyLoading(false); }
  };

  const executeDelete = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`/api/admin/reviews/${deleteModal.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Đã xóa đánh giá!");
        setDeleteModal({ open: false, id: null });
        fetchReviews(page);
      } else toast.error("Không thể xóa!");
    } catch { toast.error("Lỗi hệ thống!"); }
  };

  /* ── derived ── */
  const pendingCount = stats?.byStatus?.["CHO_DUYET"] ?? stats?.byStatus?.["null"] ?? 0;
  const hiddenCount  = stats?.byStatus?.["DA_AN"] ?? 0;
  const avgRating    = stats?.avgRating ?? 0;

  const generatePages = () => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (page >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  /* ─────────────────────────── RENDER ─────────────────────────── */
  return (
    <div style={{ background: "#f7f8f6", minHeight: "100vh", padding: "24px 28px", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}>
      <Toaster />

      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#111827", margin: 0 }}>Quản lý bình luận</h1>
        <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>Admin / Bình luận & đánh giá</p>
      </div>

      {/* ── Metric cards + Rating distribution ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 300px", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Tổng đánh giá",   value: stats?.total ?? 0, bt: "#6366f1", vc: "#111827", ic: "#6366f1", ib: "#eef2ff", Icon: MessageSquare },
          { label: "Đã duyệt",        value: stats?.byStatus?.["DA_DUYET"] ?? 0, bt: "#16a34a", vc: "#15803d", ic: "#16a34a", ib: "#dcfce7", Icon: CheckCircle2 },
          { label: "Chờ duyệt",       value: pendingCount, bt: "#f59e0b", vc: "#92400e", ic: "#f59e0b", ib: "#fef9c3", Icon: Clock },
          { label: "Đang ẩn",         value: hiddenCount,  bt: "#ef4444", vc: "#b91c1c", ic: "#ef4444", ib: "#fef2f2", Icon: EyeOff },
        ].map(c => (
          <div key={c.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, borderTop: `3px solid ${c.bt}`, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af", margin: 0 }}>{c.label}</p>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: c.ib, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <c.Icon style={{ width: 14, height: 14, color: c.ic }} />
              </div>
            </div>
            <p style={{ fontSize: 24, fontWeight: 700, color: c.vc, margin: 0 }}>{c.value}</p>
          </div>
        ))}

        {/* Rating distribution card */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, borderTop: "3px solid #f59e0b", padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1 }}>{avgRating}</p>
            <div>
              <Stars value={Math.round(avgRating)} size={13} />
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "3px 0 0" }}>Điểm trung bình</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[5, 4, 3, 2, 1].map(s => (
              <RatingBar key={s} star={s} count={stats?.byStar?.[s] ?? 0} total={stats?.total ?? 0} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Pending alert ── */}
      {pendingCount > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
          <Clock style={{ width: 16, height: 16, color: "#d97706", flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: "#92400e", margin: 0, fontWeight: 500 }}>
            Có <strong>{pendingCount}</strong> đánh giá chờ duyệt — hãy kiểm tra và phê duyệt sớm.
          </p>
          <button onClick={() => { setStatusFilter("CHO_DUYET"); }}
            style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#d97706", background: "none", border: "1px solid #fde68a", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
            Xem ngay
          </button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", width: 280 }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9ca3af" }} />
            <input type="text" placeholder="Tên khách, nội dung, sản phẩm..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", height: 38, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 12px 0 34px", outline: "none", color: "#374151", background: "#fff", boxSizing: "border-box" }} />
          </div>
          {/* Star filter */}
          <select value={starFilter} onChange={e => { setStarFilter(e.target.value); setPage(1); }}
            style={{ height: 38, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 10px", color: "#374151", background: "#fff", outline: "none", minWidth: 140 }}>
            <option value="">Tất cả sao</option>
            {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{'★'.repeat(s)} {s} sao</option>)}
          </select>
          {/* Status filter */}
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ height: 38, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 10px", color: "#374151", background: "#fff", outline: "none", minWidth: 150 }}>
            <option value="">Tất cả trạng thái</option>
            <option value="DA_DUYET">Đã duyệt</option>
            <option value="CHO_DUYET">Chờ duyệt</option>
            <option value="DA_AN">Đã ẩn</option>
          </select>
          {/* Clear filters */}
          {(search || starFilter || statusFilter) && (
            <button onClick={() => { setSearch(""); setStarFilter(""); setStatusFilter(""); }}
              style={{ height: 38, padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <X style={{ width: 13, height: 13 }} /> Xóa lọc
            </button>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Tổng {total} đánh giá</p>
      </div>

      {/* ── Table card ── */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "64px 0" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#f59e0b", animation: "spin 0.7s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {["Khách hàng", "Sản phẩm", "Đánh giá & Nội dung", "Ngày", "Trạng thái", "Thao tác"].map((h, i) => (
                      <th key={h} style={{ padding: "10px 14px", fontSize: 12, fontWeight: 500, color: "#9ca3af", textAlign: i === 5 ? "right" : "left", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "56px 0" }}>
                        <MessageSquare style={{ width: 36, height: 36, color: "#d1d5db", margin: "0 auto 10px" }} />
                        <p style={{ fontSize: 14, color: "#374151", margin: "0 0 4px", fontWeight: 500 }}>Không có đánh giá nào</p>
                        <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Thử điều chỉnh bộ lọc</p>
                      </td>
                    </tr>
                  ) : reviews.map((r, idx) => {
                    const sm     = statusMeta(r.trang_thai);
                    const isLast = idx === reviews.length - 1;
                    const isPending = !r.trang_thai || r.trang_thai === "CHO_DUYET";
                    return (
                      <tr key={r.id}
                        style={{ borderBottom: isLast ? "none" : "1px solid #f3f4f6", background: isPending ? "#fffbeb" : "transparent" }}
                        onMouseEnter={e => { if (!isPending) e.currentTarget.style.background = "#fafafa"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = isPending ? "#fffbeb" : "transparent"; }}
                      >
                        {/* Khách hàng */}
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar name={r.nguoi_dung?.ho_ten || "?"} src={r.nguoi_dung?.anh_dai_dien} />
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0, whiteSpace: "nowrap" }}>{r.nguoi_dung?.ho_ten || "Ẩn danh"}</p>
                              <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{r.nguoi_dung?.email || ""}</p>
                            </div>
                          </div>
                        </td>

                        {/* Sản phẩm */}
                        <td style={{ padding: "12px 14px", maxWidth: 180 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {r.san_pham?.anh_san_pham?.[0]?.duong_dan_anh ? (
                              <img src={r.san_pham.anh_san_pham[0].duong_dan_anh} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0, border: "1px solid #f3f4f6" }}
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <div style={{ width: 36, height: 36, borderRadius: 6, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <ImageIcon style={{ width: 16, height: 16, color: "#d1d5db" }} />
                              </div>
                            )}
                            <p style={{ fontSize: 13, fontWeight: 500, color: "#16a34a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {r.san_pham?.ten_san_pham || "Sản phẩm đã xóa"}
                            </p>
                          </div>
                        </td>

                        {/* Đánh giá & nội dung */}
                        <td style={{ padding: "12px 14px", maxWidth: 280 }}>
                          <Stars value={r.so_sao || 0} size={13} />
                          <p style={{ fontSize: 13, color: r.trang_thai === "DA_AN" ? "#d1d5db" : "#374151", margin: "4px 0 0",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            textDecoration: r.trang_thai === "DA_AN" ? "line-through" : "none" }}>
                            {r.noi_dung || <span style={{ color: "#d1d5db", fontStyle: "italic" }}>Không có nội dung</span>}
                          </p>
                          {r.anh_danh_gia?.length > 0 && (
                            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                              {r.anh_danh_gia.slice(0, 3).map((a: any, i: number) => (
                                <img key={i} src={a.duong_dan_anh} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: "cover", border: "1px solid #f3f4f6" }} />
                              ))}
                              {r.anh_danh_gia.length > 3 && <span style={{ fontSize: 11, color: "#9ca3af", alignSelf: "center" }}>+{r.anh_danh_gia.length - 3}</span>}
                            </div>
                          )}
                          {r.phan_hoi_admin && (
                            <div style={{ marginTop: 5, display: "flex", alignItems: "flex-start", gap: 5, padding: "5px 8px", background: "#f0fdf4", borderRadius: 6, borderLeft: "2px solid #16a34a" }}>
                              <MessageCircle style={{ width: 11, height: 11, color: "#16a34a", marginTop: 1, flexShrink: 0 }} />
                              <p style={{ fontSize: 11, color: "#15803d", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{r.phan_hoi_admin}</p>
                            </div>
                          )}
                        </td>

                        {/* Ngày */}
                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                          <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                            {r.ngay_tao ? new Date(r.ngay_tao).toLocaleDateString("vi-VN") : "—"}
                          </p>
                          <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>
                            {r.ngay_tao ? new Date(r.ngay_tao).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}
                          </p>
                        </td>

                        {/* Trạng thái */}
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, padding: "4px 9px", borderRadius: 99, background: sm.bg, color: sm.color, whiteSpace: "nowrap" }}>
                            <sm.Icon style={{ width: 11, height: 11 }} />
                            {sm.label}
                          </span>
                        </td>

                        {/* Thao tác */}
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                            {/* Duyệt nhanh (chỉ hiện khi chờ) */}
                            {isPending && (
                              <button onClick={() => approveReview(r.id)} title="Duyệt ngay"
                                style={{ height: 30, padding: "0 10px", borderRadius: 6, border: "none", background: "#dcfce7", color: "#16a34a", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#bbf7d0")}
                                onMouseLeave={e => (e.currentTarget.style.background = "#dcfce7")}>
                                <CheckCircle2 style={{ width: 13, height: 13 }} /> Duyệt
                              </button>
                            )}
                            {/* Xem */}
                            <button onClick={() => setViewModal({ open: true, data: r })} title="Xem chi tiết"
                              style={{ width: 30, height: 30, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#eef2ff"; e.currentTarget.style.color = "#6366f1"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7280"; }}>
                              <Eye style={{ width: 14, height: 14 }} />
                            </button>
                            {/* Phản hồi */}
                            <button onClick={() => { setReplyModal({ open: true, data: r }); setReplyText(r.phan_hoi_admin || ""); }} title="Phản hồi admin"
                              style={{ width: 30, height: 30, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.color = "#16a34a"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7280"; }}>
                              <MessageCircle style={{ width: 14, height: 14 }} />
                            </button>
                            {/* Ẩn/Hiện */}
                            <button onClick={() => toggleStatus(r.id, r.trang_thai)} title={r.trang_thai === "DA_AN" ? "Bật hiển thị" : "Ẩn đánh giá"}
                              style={{ width: 30, height: 30, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: r.trang_thai === "DA_AN" ? "#16a34a" : "#9ca3af" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                              {r.trang_thai === "DA_AN" ? <Eye style={{ width: 14, height: 14 }} /> : <EyeOff style={{ width: 14, height: 14 }} />}
                            </button>
                            {/* Xóa */}
                            <button onClick={() => setDeleteModal({ open: true, id: r.id })} title="Xóa vĩnh viễn"
                              style={{ width: 30, height: 30, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7280"; }}>
                              <Trash2 style={{ width: 14, height: 14 }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: "1px solid #f3f4f6", flexWrap: "wrap", gap: 8 }}>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                  Trang {page}/{totalPages} · {total} đánh giá
                </p>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ width: 32, height: 32, borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: page === 1 ? "#d1d5db" : "#374151" }}>
                    <ChevronLeft style={{ width: 14, height: 14 }} />
                  </button>
                  {generatePages().map((p, i) => (
                    <button key={i} onClick={() => typeof p === "number" && setPage(p)} disabled={p === "..."}
                      style={{ minWidth: 32, height: 32, borderRadius: 7, border: `1px solid ${p === page ? "#16a34a" : "#e5e7eb"}`, background: p === page ? "#16a34a" : "#fff", color: p === page ? "#fff" : p === "..." ? "#9ca3af" : "#374151", fontSize: 13, fontWeight: p === page ? 600 : 400, cursor: p === "..." ? "default" : "pointer", padding: "0 6px" }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ width: 32, height: 32, borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: page === totalPages ? "#d1d5db" : "#374151" }}>
                    <ChevronRight style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ════ MODAL XEM CHI TIẾT ════ */}
      <AnimatePresence>
        {viewModal.open && viewModal.data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => setViewModal({ open: false, data: null })}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>Chi tiết đánh giá</h3>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>#{viewModal.data.id} · {viewModal.data.ngay_tao ? new Date(viewModal.data.ngay_tao).toLocaleString("vi-VN") : "—"}</p>
                </div>
                <button onClick={() => setViewModal({ open: false, data: null })}
                  style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: "#f3f4f6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
                  <X style={{ width: 15, height: 15 }} />
                </button>
              </div>
              {/* Body */}
              <div style={{ overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Customer */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={viewModal.data.nguoi_dung?.ho_ten || "?"} src={viewModal.data.nguoi_dung?.anh_dai_dien} size={48} />
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>{viewModal.data.nguoi_dung?.ho_ten || "Ẩn danh"}</p>
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 4px" }}>{viewModal.data.nguoi_dung?.email || ""}</p>
                    <Stars value={viewModal.data.so_sao || 0} size={15} />
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    {(() => { const sm = statusMeta(viewModal.data.trang_thai);
                      return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, padding: "4px 9px", borderRadius: 99, background: sm.bg, color: sm.color }}><sm.Icon style={{ width: 11, height: 11 }} />{sm.label}</span>;
                    })()}
                  </div>
                </div>

                {/* Product */}
                <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  {viewModal.data.san_pham?.anh_san_pham?.[0]?.duong_dan_anh && (
                    <img src={viewModal.data.san_pham.anh_san_pham[0].duong_dan_anh} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover" }} />
                  )}
                  <div>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 2px" }}>Sản phẩm đánh giá</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#16a34a", margin: 0 }}>{viewModal.data.san_pham?.ten_san_pham || "Sản phẩm đã xóa"}</p>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>Nội dung bình luận</p>
                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 14px" }}>
                    <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.6 }}>
                      {viewModal.data.noi_dung || <span style={{ color: "#d1d5db", fontStyle: "italic" }}>Không có nội dung</span>}
                    </p>
                  </div>
                </div>

                {/* Review images */}
                {viewModal.data.anh_danh_gia?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>Hình ảnh đính kèm</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {viewModal.data.anh_danh_gia.map((a: any, i: number) => (
                        <img key={i} src={a.duong_dan_anh} alt="" style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover", border: "1px solid #e5e7eb", cursor: "pointer" }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin reply */}
                {viewModal.data.phan_hoi_admin && (
                  <div style={{ border: "1px solid #d1fae5", borderRadius: 8, padding: "12px 14px", background: "#f0fdf4" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <MessageCircle style={{ width: 13, height: 13, color: "#16a34a" }} />
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Phản hồi của Admin</p>
                      {viewModal.data.ngay_phan_hoi && <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 0 auto" }}>{new Date(viewModal.data.ngay_phan_hoi).toLocaleDateString("vi-VN")}</p>}
                    </div>
                    <p style={{ fontSize: 13, color: "#15803d", margin: 0, lineHeight: 1.6 }}>{viewModal.data.phan_hoi_admin}</p>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div style={{ padding: "12px 22px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 8 }}>
                <button onClick={() => { setViewModal({ open: false, data: null }); setReplyModal({ open: true, data: viewModal.data }); setReplyText(viewModal.data.phan_hoi_admin || ""); }}
                  style={{ flex: 1, height: 38, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 500, color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <MessageCircle style={{ width: 14, height: 14 }} /> Phản hồi
                </button>
                <button onClick={() => setViewModal({ open: false, data: null })}
                  style={{ flex: 1, height: 38, border: "none", borderRadius: 8, background: "#16a34a", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════ MODAL PHẢN HỒI ════ */}
      <AnimatePresence>
        {replyModal.open && replyModal.data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 65, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => setReplyModal({ open: false, data: null })}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>Phản hồi đánh giá</h3>
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>{replyModal.data.nguoi_dung?.ho_ten || "Ẩn danh"} · <Stars value={replyModal.data.so_sao || 0} /></p>
                </div>
                <button onClick={() => setReplyModal({ open: false, data: null })}
                  style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: "#f3f4f6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
                  <X style={{ width: 15, height: 15 }} />
                </button>
              </div>

              <div style={{ padding: "16px 22px 20px" }}>
                {/* Nội dung gốc */}
                <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 12px", marginBottom: 14, borderLeft: "3px solid #e5e7eb" }}>
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px" }}>Đánh giá của khách:</p>
                  <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.5 }}>{replyModal.data.noi_dung || <span style={{ fontStyle: "italic", color: "#d1d5db" }}>Không có nội dung</span>}</p>
                </div>

                {/* Reply textarea */}
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Nội dung phản hồi</label>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                  placeholder="Xin chào quý khách, cảm ơn bạn đã đánh giá sản phẩm..."
                  rows={4}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "10px 12px", outline: "none", color: "#374151", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#16a34a")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                <p style={{ fontSize: 11, color: "#9ca3af", margin: "4px 0 14px", textAlign: "right" }}>{replyText.length} ký tự</p>

                <div style={{ display: "flex", gap: 10 }}>
                  {replyModal.data.phan_hoi_admin && (
                    <button onClick={async () => {
                      setReplyText("");
                      const res = await fetch(`/api/admin/reviews/${replyModal.data.id}`, {
                        method: "PUT", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ phan_hoi_admin: "" }),
                      });
                      if (res.ok) { toast.success("Đã xóa phản hồi"); setReplyModal({ open: false, data: null }); fetchReviews(page); }
                    }}
                      style={{ height: 40, padding: "0 14px", border: "1px solid #fecaca", borderRadius: 8, background: "#fff", fontSize: 13, color: "#ef4444", cursor: "pointer" }}>
                      Xóa phản hồi cũ
                    </button>
                  )}
                  <button type="button" onClick={() => setReplyModal({ open: false, data: null })}
                    style={{ flex: 1, height: 40, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 500, color: "#374151", cursor: "pointer" }}>
                    Hủy
                  </button>
                  <button onClick={submitReply} disabled={!replyText.trim() || replyLoading}
                    style={{ flex: 2, height: 40, border: "none", borderRadius: 8, background: !replyText.trim() ? "#e5e7eb" : "#16a34a", fontSize: 13, fontWeight: 600, color: !replyText.trim() ? "#9ca3af" : "#fff", cursor: !replyText.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {replyLoading
                      ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                      : <><Send style={{ width: 13, height: 13 }} /> Gửi phản hồi</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════ MODAL XÓA ════ */}
      <AnimatePresence>
        {deleteModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => setDeleteModal({ open: false, id: null })}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#fff", maxWidth: 400, width: "100%", borderRadius: 16, padding: "28px 24px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <AlertTriangle style={{ width: 24, height: 24, color: "#ef4444" }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: "0 0 8px" }}>Xóa đánh giá</h3>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>Đánh giá sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setDeleteModal({ open: false, id: null })}
                  style={{ flex: 1, height: 40, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 14, fontWeight: 500, color: "#374151", cursor: "pointer" }}>
                  Hủy
                </button>
                <button onClick={executeDelete}
                  style={{ flex: 1, height: 40, border: "none", borderRadius: 8, background: "#ef4444", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
                  Xóa vĩnh viễn
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
