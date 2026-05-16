"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit, Trash2, X, Image as ImageIcon, Eye, EyeOff,
  AlertTriangle, GripVertical, Link as LinkIcon, ExternalLink,
  Calendar, Tag, ToggleLeft, ToggleRight, Search, Filter,
  CheckCircle2, Clock, XCircle, LayoutTemplate, Rows3,
} from "lucide-react";
import toast from "react-hot-toast";

const BANNER_TYPES: { value: string; label: string; color: string; bg: string }[] = [
  { value: "hero",       label: "Hero / Slider",     color: "#6366f1", bg: "#eef2ff" },
  { value: "popup",      label: "Popup",             color: "#f59e0b", bg: "#fef9c3" },
  { value: "sidebar",    label: "Sidebar",           color: "#06b6d4", bg: "#ecfeff" },
  { value: "inline",     label: "Inline / Giữa trang", color: "#8b5cf6", bg: "#f5f3ff" },
  { value: "khuyen_mai", label: "Khuyến mãi",        color: "#ef4444", bg: "#fef2f2" },
];

function typeMeta(val: string) {
  return BANNER_TYPES.find(t => t.value === val) ?? BANNER_TYPES[0];
}

function statusOf(item: any): "active" | "scheduled" | "expired" | "off" {
  if (!item.dang_hoat_dong) return "off";
  const now = new Date();
  if (item.ngay_bat_dau && new Date(item.ngay_bat_dau) > now) return "scheduled";
  if (item.ngay_ket_thuc && new Date(item.ngay_ket_thuc) < now) return "expired";
  return "active";
}

const STATUS_META = {
  active:    { label: "Đang hiển thị", color: "#16a34a", bg: "#dcfce7", Icon: CheckCircle2 },
  scheduled: { label: "Chờ kích hoạt", color: "#f59e0b", bg: "#fef9c3", Icon: Clock },
  expired:   { label: "Hết hạn",       color: "#9ca3af", bg: "#f3f4f6", Icon: XCircle },
  off:       { label: "Đã tắt",        color: "#ef4444", bg: "#fef2f2", Icon: EyeOff },
};

const EMPTY_FORM = {
  tieu_de: "", mo_ta: "", duong_dan_anh: "", lien_ket: "",
  loai_banner: "hero", thu_tu_sap_xep: "1",
  dang_hoat_dong: true, ngay_bat_dau: "", ngay_ket_thuc: "",
};

export default function ContentPage() {
  const [banners, setBanners]       = useState<any[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [viewMode, setViewMode]     = useState<"list" | "grid">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [formData, setFormData]       = useState({ ...EMPTY_FORM });
  const [imgUploading, setImgUploading] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false, id: null as number | null, name: "",
  });

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/content?t=${Date.now()}`);
      if (res.ok) setBanners(await res.json());
    } catch { toast.error("Lỗi lấy dữ liệu!"); }
    finally   { setIsLoading(false); }
  };

  useEffect(() => { fetchBanners(); }, []);

  const filtered = useMemo(() => banners.filter(b => {
    if (searchTerm && !b.tieu_de?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (typeFilter !== "ALL" && b.loai_banner !== typeFilter) return false;
    if (statusFilter !== "ALL" && statusOf(b) !== statusFilter) return false;
    return true;
  }), [banners, searchTerm, typeFilter, statusFilter]);

  const stats = useMemo(() => ({
    total:     banners.length,
    active:    banners.filter(b => statusOf(b) === "active").length,
    scheduled: banners.filter(b => statusOf(b) === "scheduled").length,
    expired:   banners.filter(b => statusOf(b) === "expired").length,
    off:       banners.filter(b => statusOf(b) === "off").length,
  }), [banners]);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, thu_tu_sap_xep: String(banners.length + 1) });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      tieu_de: item.tieu_de || "",
      mo_ta: item.mo_ta || "",
      duong_dan_anh: item.duong_dan_anh || "",
      lien_ket: item.lien_ket || "",
      loai_banner: item.loai_banner || "hero",
      thu_tu_sap_xep: item.thu_tu_sap_xep?.toString() || "0",
      dang_hoat_dong: !!item.dang_hoat_dong,
      ngay_bat_dau: item.ngay_bat_dau ? item.ngay_bat_dau.slice(0, 16) : "",
      ngay_ket_thuc: item.ngay_ket_thuc ? item.ngay_ket_thuc.slice(0, 16) : "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tieu_de.trim()) { toast.error("Vui lòng nhập tiêu đề banner!"); return; }
    if (!formData.duong_dan_anh.trim()) { toast.error("Vui lòng chọn hoặc nhập link hình ảnh!"); return; }
    const url    = editingId ? `/api/admin/content/${editingId}` : "/api/admin/content";
    const method = editingId ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          thu_tu_sap_xep: parseInt(formData.thu_tu_sap_xep) || 0,
          ngay_bat_dau: formData.ngay_bat_dau || null,
          ngay_ket_thuc: formData.ngay_ket_thuc || null,
        }),
      });
      if (res.ok) {
        toast.success(editingId ? "Cập nhật thành công!" : "Thêm banner thành công!");
        setIsModalOpen(false);
        fetchBanners();
      } else {
        const err = await res.json();
        toast.error(err.error || "Lỗi lưu dữ liệu!");
      }
    } catch { toast.error("Lỗi hệ thống!"); }
  };

  const toggleStatus = async (id: number, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dang_hoat_dong: !current }),
      });
      if (res.ok) {
        fetchBanners();
        toast.success(!current ? "Đã bật hiển thị" : "Đã tắt hiển thị");
      }
    } catch { toast.error("Lỗi hệ thống!"); }
  };

  const executeDelete = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`/api/admin/content/${deleteModal.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Đã xóa banner!");
        setDeleteModal({ isOpen: false, id: null, name: "" });
        fetchBanners();
      } else toast.error("Không thể xóa!");
    } catch { toast.error("Lỗi kết nối!"); }
  };

  const handleUpload = async (file: File) => {
    setImgUploading(true);
    const toastId = toast.loading("Đang tải ảnh...");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setFormData(prev => ({ ...prev, duong_dan_anh: url }));
        toast.success("Tải ảnh thành công!", { id: toastId });
      } else throw new Error();
    } catch { toast.error("Lỗi tải ảnh!", { id: toastId }); }
    finally { setImgUploading(false); }
  };

  const fmtDate = (d: string | null) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div style={{ background: "#f7f8f6", minHeight: "100vh", padding: "24px 28px", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}>

      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#111827", margin: 0 }}>Quản lý Banner</h1>
        <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>Admin / Nội dung / Banner</p>
      </div>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Tổng banner",    value: stats.total,     bt: "#6366f1", vc: "#111827", ic: "#6366f1", ib: "#eef2ff", Icon: LayoutTemplate },
          { label: "Đang hiển thị",  value: stats.active,    bt: "#16a34a", vc: "#15803d", ic: "#16a34a", ib: "#dcfce7", Icon: CheckCircle2 },
          { label: "Chờ kích hoạt",  value: stats.scheduled, bt: "#f59e0b", vc: "#92400e", ic: "#f59e0b", ib: "#fef9c3", Icon: Clock },
          { label: "Hết hạn",        value: stats.expired,   bt: "#9ca3af", vc: "#374151", ic: "#9ca3af", ib: "#f3f4f6", Icon: XCircle },
          { label: "Đã tắt",         value: stats.off,       bt: "#ef4444", vc: "#b91c1c", ic: "#ef4444", ib: "#fef2f2", Icon: EyeOff },
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
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", width: 260 }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9ca3af" }} />
            <input
              type="text" placeholder="Tìm tên banner..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ width: "100%", height: 38, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 12px 0 34px", outline: "none", color: "#374151", background: "#fff", boxSizing: "border-box" }}
            />
          </div>
          {/* Loại */}
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            style={{ height: 38, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 10px", color: "#374151", background: "#fff", outline: "none", minWidth: 160 }}>
            <option value="ALL">Tất cả loại</option>
            {BANNER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {/* Trạng thái */}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ height: 38, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 10px", color: "#374151", background: "#fff", outline: "none", minWidth: 160 }}>
            <option value="ALL">Tất cả trạng thái</option>
            <option value="active">Đang hiển thị</option>
            <option value="scheduled">Chờ kích hoạt</option>
            <option value="expired">Hết hạn</option>
            <option value="off">Đã tắt</option>
          </select>
          {/* View mode */}
          <div style={{ display: "flex", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            {(["list", "grid"] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                style={{ width: 38, height: 38, border: "none", background: viewMode === m ? "#f0fdf4" : "#fff", color: viewMode === m ? "#16a34a" : "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {m === "list" ? <Rows3 style={{ width: 15, height: 15 }} /> : <LayoutTemplate style={{ width: 15, height: 15 }} />}
              </button>
            ))}
          </div>
        </div>
        <button onClick={openAdd}
          style={{ display: "flex", alignItems: "center", gap: 6, height: 38, padding: "0 16px", background: "#16a34a", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#15803d")}
          onMouseLeave={e => (e.currentTarget.style.background = "#16a34a")}>
          <Plus style={{ width: 15, height: 15 }} /> Thêm banner mới
        </button>
      </div>

      {/* Table card */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "64px 0" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#16a34a", animation: "spin 0.7s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <ImageIcon style={{ width: 40, height: 40, color: "#d1d5db", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, fontWeight: 500, color: "#374151", margin: "0 0 4px" }}>
              {banners.length === 0 ? "Chưa có banner nào" : "Không tìm thấy banner phù hợp"}
            </p>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 16px" }}>
              {banners.length === 0 ? "Thêm banner đầu tiên để bắt đầu" : "Thử điều chỉnh bộ lọc"}
            </p>
            {banners.length === 0 && (
              <button onClick={openAdd} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Plus style={{ width: 14, height: 14 }} /> Thêm banner ngay
              </button>
            )}
          </div>
        ) : viewMode === "list" ? (
          /* ── LIST VIEW ── */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["#", "Ảnh xem trước", "Tiêu đề & Mô tả", "Loại", "Liên kết", "Thời hạn", "Thứ tự", "Trạng thái", "Thao tác"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", fontSize: 12, fontWeight: 500, color: "#9ca3af", textAlign: h === "Thứ tự" || h === "#" ? "center" : "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const st   = statusOf(item);
                  const smeta = STATUS_META[st];
                  const tmeta = typeMeta(item.loai_banner);
                  const isLast = idx === filtered.length - 1;
                  return (
                    <tr key={item.id}
                      style={{ borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 12px", textAlign: "center", fontSize: 12, color: "#9ca3af" }}>{idx + 1}</td>
                      <td style={{ padding: "12px 12px" }}>
                        <div style={{ width: 120, height: 60, borderRadius: 8, overflow: "hidden", background: "#f3f4f6", flexShrink: 0, position: "relative" }}>
                          {item.duong_dan_anh ? (
                            <img src={item.duong_dan_anh} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <ImageIcon style={{ width: 18, height: 18, color: "#d1d5db" }} />
                            </div>
                          )}
                          {!item.dang_hoat_dong && (
                            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <EyeOff style={{ width: 14, height: 14, color: "#fff" }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px 12px", maxWidth: 240 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.tieu_de || "—"}</p>
                        {item.mo_ta && <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.mo_ta}</p>}
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 99, background: tmeta.bg, color: tmeta.color, whiteSpace: "nowrap" }}>{tmeta.label}</span>
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        {item.lien_ket ? (
                          <a href={item.lien_ket} target="_blank" rel="noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6366f1", textDecoration: "none", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <LinkIcon style={{ width: 12, height: 12, flexShrink: 0 }} />
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.lien_ket}</span>
                            <ExternalLink style={{ width: 11, height: 11, flexShrink: 0 }} />
                          </a>
                        ) : <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 12px", whiteSpace: "nowrap" }}>
                        {(item.ngay_bat_dau || item.ngay_ket_thuc) ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {item.ngay_bat_dau && <span style={{ fontSize: 11, color: "#6b7280" }}>Từ: {fmtDate(item.ngay_bat_dau)}</span>}
                            {item.ngay_ket_thuc && <span style={{ fontSize: 11, color: "#6b7280" }}>Đến: {fmtDate(item.ngay_ket_thuc)}</span>}
                          </div>
                        ) : <span style={{ fontSize: 12, color: "#d1d5db" }}>Không giới hạn</span>}
                      </td>
                      <td style={{ padding: "12px 12px", textAlign: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{item.thu_tu_sap_xep}</span>
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, padding: "4px 8px", borderRadius: 99, background: smeta.bg, color: smeta.color, whiteSpace: "nowrap" }}>
                          <smeta.Icon style={{ width: 11, height: 11 }} />
                          {smeta.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                          {/* Toggle */}
                          <button onClick={() => toggleStatus(item.id, item.dang_hoat_dong)}
                            title={item.dang_hoat_dong ? "Tắt hiển thị" : "Bật hiển thị"}
                            style={{ width: 30, height: 30, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: item.dang_hoat_dong ? "#16a34a" : "#9ca3af" }}
                            onMouseEnter={e => (e.currentTarget.style.background = item.dang_hoat_dong ? "#dcfce7" : "#f3f4f6")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                            {item.dang_hoat_dong ? <ToggleRight style={{ width: 18, height: 18 }} /> : <ToggleLeft style={{ width: 18, height: 18 }} />}
                          </button>
                          {/* Edit */}
                          <button onClick={() => openEdit(item)}
                            style={{ width: 30, height: 30, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.color = "#16a34a"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7280"; }}>
                            <Edit style={{ width: 14, height: 14 }} />
                          </button>
                          {/* Delete */}
                          <button onClick={() => setDeleteModal({ isOpen: true, id: item.id, name: item.tieu_de })}
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
        ) : (
          /* ── GRID VIEW ── */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, padding: 16 }}>
            {filtered.map(item => {
              const st   = statusOf(item);
              const smeta = STATUS_META[st];
              const tmeta = typeMeta(item.loai_banner);
              return (
                <div key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                  <div style={{ height: 140, background: "#f3f4f6", position: "relative" }}>
                    {item.duong_dan_anh && (
                      <img src={item.duong_dan_anh} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    )}
                    {!item.dang_hoat_dong && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <EyeOff style={{ width: 24, height: 24, color: "#fff" }} />
                      </div>
                    )}
                    <div style={{ position: "absolute", top: 8, left: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 7px", borderRadius: 99, background: tmeta.bg, color: tmeta.color }}>{tmeta.label}</span>
                    </div>
                    <div style={{ position: "absolute", top: 8, right: 8 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, padding: "3px 7px", borderRadius: 99, background: smeta.bg, color: smeta.color }}>
                        <smeta.Icon style={{ width: 10, height: 10 }} />
                        {smeta.label}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.tieu_de || "Không có tiêu đề"}</p>
                    {item.mo_ta && <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.mo_ta}</p>}
                    {item.lien_ket && (
                      <p style={{ fontSize: 11, color: "#6366f1", margin: "0 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
                        <LinkIcon style={{ width: 11, height: 11, flexShrink: 0 }} />{item.lien_ket}
                      </p>
                    )}
                    {(item.ngay_bat_dau || item.ngay_ket_thuc) && (
                      <p style={{ fontSize: 11, color: "#6b7280", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar style={{ width: 11, height: 11 }} />
                        {item.ngay_bat_dau && fmtDate(item.ngay_bat_dau)}
                        {item.ngay_bat_dau && item.ngay_ket_thuc && " → "}
                        {item.ngay_ket_thuc && fmtDate(item.ngay_ket_thuc)}
                      </p>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>Thứ tự: {item.thu_tu_sap_xep}</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => toggleStatus(item.id, item.dang_hoat_dong)}
                          style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: item.dang_hoat_dong ? "#dcfce7" : "#f3f4f6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: item.dang_hoat_dong ? "#16a34a" : "#9ca3af" }}>
                          {item.dang_hoat_dong ? <ToggleRight style={{ width: 15, height: 15 }} /> : <ToggleLeft style={{ width: 15, height: 15 }} />}
                        </button>
                        <button onClick={() => openEdit(item)}
                          style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "#f0fdf4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
                          <Edit style={{ width: 13, height: 13 }} />
                        </button>
                        <button onClick={() => setDeleteModal({ isOpen: true, id: item.id, name: item.tieu_de })}
                          style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "#fef2f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626" }}>
                          <Trash2 style={{ width: 13, height: 13 }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div style={{ padding: "10px 16px", borderTop: "1px solid #f3f4f6", fontSize: 12, color: "#9ca3af" }}>
            Hiển thị {filtered.length} / {banners.length} banner
          </div>
        )}
      </div>

      {/* ── MODAL THÊM / SỬA ── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: 0 }}>{editingId ? "Chỉnh sửa banner" : "Thêm banner mới"}</h3>
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>{editingId ? "Cập nhật thông tin banner" : "Điền đầy đủ thông tin để tạo banner"}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#f3f4f6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#e5e7eb")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#f3f4f6")}>
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {/* Modal body */}
              <form onSubmit={handleSave} style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Tiêu đề */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Tiêu đề banner <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="text" value={formData.tieu_de} onChange={e => setFormData(p => ({ ...p, tieu_de: e.target.value }))}
                    placeholder="VD: Khuyến mãi Tết Nguyên Đán 2026"
                    style={{ width: "100%", height: 40, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 12px", outline: "none", color: "#374151", boxSizing: "border-box" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#16a34a")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                </div>

                {/* Mô tả */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Mô tả ngắn</label>
                  <input type="text" value={formData.mo_ta} onChange={e => setFormData(p => ({ ...p, mo_ta: e.target.value }))}
                    placeholder="Mô tả ngắn về nội dung banner"
                    style={{ width: "100%", height: 40, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 12px", outline: "none", color: "#374151", boxSizing: "border-box" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#16a34a")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                </div>

                {/* Hình ảnh */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Hình ảnh banner <span style={{ color: "#ef4444" }}>*</span></label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {/* Upload button */}
                    <label style={{ position: "relative", width: 40, height: 40, borderRadius: 8, border: "1px dashed #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: imgUploading ? "#f3f4f6" : "#fff", flexShrink: 0 }}>
                      {imgUploading
                        ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #e5e7eb", borderTopColor: "#16a34a", animation: "spin 0.7s linear infinite" }} />
                        : <ImageIcon style={{ width: 16, height: 16, color: "#9ca3af" }} />}
                      <input type="file" accept="image/*" style={{ display: "none" }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                    </label>
                    <input type="text" value={formData.duong_dan_anh} onChange={e => setFormData(p => ({ ...p, duong_dan_anh: e.target.value }))}
                      placeholder="Hoặc dán URL ảnh..."
                      style={{ flex: 1, height: 40, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 12px", outline: "none", color: "#374151", boxSizing: "border-box" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "#16a34a")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                  </div>
                  {formData.duong_dan_anh && (
                    <img src={formData.duong_dan_anh} alt="preview"
                      style={{ marginTop: 8, width: "100%", height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }}
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  )}
                </div>

                {/* Liên kết */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Liên kết khi click</label>
                  <div style={{ position: "relative" }}>
                    <LinkIcon style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#9ca3af" }} />
                    <input type="text" value={formData.lien_ket} onChange={e => setFormData(p => ({ ...p, lien_ket: e.target.value }))}
                      placeholder="/san-pham hoặc https://..."
                      style={{ width: "100%", height: 40, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 12px 0 32px", outline: "none", color: "#374151", boxSizing: "border-box" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "#16a34a")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                  </div>
                </div>

                {/* Loại + Thứ tự */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Loại banner</label>
                    <select value={formData.loai_banner} onChange={e => setFormData(p => ({ ...p, loai_banner: e.target.value }))}
                      style={{ width: "100%", height: 40, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 10px", color: "#374151", background: "#fff", outline: "none" }}>
                      {BANNER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Thứ tự</label>
                    <input type="number" min={0} value={formData.thu_tu_sap_xep} onChange={e => setFormData(p => ({ ...p, thu_tu_sap_xep: e.target.value.replace(/-/g, '') }))}
                      onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                      style={{ width: "100%", height: 40, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, padding: "0 12px", outline: "none", color: "#374151", textAlign: "center", boxSizing: "border-box" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "#16a34a")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                  </div>
                </div>

                {/* Thời hạn hiển thị */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                    <Calendar style={{ width: 12, height: 12, display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                    Thời hạn hiển thị <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400 }}>(để trống = không giới hạn)</span>
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { field: "ngay_bat_dau" as const, label: "Từ ngày" },
                      { field: "ngay_ket_thuc" as const, label: "Đến ngày" },
                    ].map(({ field, label }) => (
                      <div key={field}>
                        <label style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4, display: "block" }}>{label}</label>
                        <input type="datetime-local" value={formData[field]} onChange={e => setFormData(p => ({ ...p, [field]: e.target.value }))}
                          style={{ width: "100%", height: 40, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, padding: "0 10px", outline: "none", color: "#374151", boxSizing: "border-box" }}
                          onFocus={e => (e.currentTarget.style.borderColor = "#16a34a")}
                          onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trạng thái */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fafafa" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", margin: 0 }}>Bật hiển thị</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>Banner sẽ xuất hiện trên trang người dùng</p>
                  </div>
                  <button type="button" onClick={() => setFormData(p => ({ ...p, dang_hoat_dong: !p.dang_hoat_dong }))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: formData.dang_hoat_dong ? "#16a34a" : "#9ca3af" }}>
                    {formData.dang_hoat_dong
                      ? <ToggleRight style={{ width: 36, height: 36 }} />
                      : <ToggleLeft style={{ width: 36, height: 36 }} />}
                  </button>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    style={{ flex: 1, height: 42, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 14, fontWeight: 500, color: "#374151", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
                    Hủy
                  </button>
                  <button type="submit"
                    style={{ flex: 2, height: 42, border: "none", borderRadius: 8, background: "#16a34a", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#15803d")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#16a34a")}>
                    {editingId ? "Lưu thay đổi" : "Tạo banner"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL XÓA ── */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#fff", maxWidth: 400, width: "100%", borderRadius: 16, padding: "28px 24px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <AlertTriangle style={{ width: 24, height: 24, color: "#ef4444" }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: "0 0 8px" }}>Xác nhận xóa banner</h3>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
                Bạn có chắc muốn xóa banner <strong style={{ color: "#111827" }}>"{deleteModal.name || "này"}"</strong>? Hành động này không thể hoàn tác.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
                  style={{ flex: 1, height: 40, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 14, fontWeight: 500, color: "#374151", cursor: "pointer" }}>
                  Hủy
                </button>
                <button onClick={executeDelete}
                  style={{ flex: 1, height: 40, border: "none", borderRadius: 8, background: "#ef4444", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
                  Xóa banner
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
