"use client";

import React, { useState, useEffect } from "react";
import {
  Plus, Edit2, Trash2, TicketPercent, X, Calendar,
  AlertTriangle, Search, Tag, TrendingDown, Clock,
  CheckCircle2, XCircle, Infinity, Copy, Check,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

type Promotion = {
  id: number;
  ma_code: string;
  loai_giam_gia: "PHAN_TRAM" | "TIEN_MAT";
  gia_tri_giam: number | null;
  don_toi_thieu: number | null;
  gioi_han_su_dung: number | null;
  ngay_bat_dau: string | null;
  ngay_ket_thuc: string | null;
  _count?: { don_hang: number };
};

type Status = "DANG_CHAY" | "HET_HAN" | "CHUA_BAT_DAU" | "VO_THOI_HAN";

const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

function getStatus(p: Promotion): Status {
  const now = Date.now();
  if (!p.ngay_ket_thuc && !p.ngay_bat_dau) return "VO_THOI_HAN";
  if (p.ngay_ket_thuc && new Date(p.ngay_ket_thuc).getTime() < now) return "HET_HAN";
  if (p.ngay_bat_dau && new Date(p.ngay_bat_dau).getTime() > now) return "CHUA_BAT_DAU";
  return "DANG_CHAY";
}

const STATUS_CFG: Record<Status, { label: string; bg: string; text: string; border: string; dot: string; icon: React.ElementType }> = {
  DANG_CHAY:    { label: "Đang chạy",     bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle2 },
  HET_HAN:      { label: "Hết hạn",       bg: "bg-gray-100",   text: "text-gray-500",   border: "border-gray-200",   dot: "bg-gray-400",   icon: XCircle },
  CHUA_BAT_DAU: { label: "Chưa bắt đầu", bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-400",   icon: Clock },
  VO_THOI_HAN:  { label: "Vô thời hạn",  bg: "bg-violet-50",  text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-400", icon: Infinity },
};

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="ml-1 p-0.5 text-gray-400 hover:text-gray-600 transition-colors" title="Sao chép">
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
    </button>
  );
}

const EMPTY_FORM = {
  ma_code: "", loai_giam_gia: "PHAN_TRAM", gia_tri_giam: "",
  don_toi_thieu: "", gioi_han_su_dung: "", ngay_bat_dau: "", ngay_ket_thuc: "",
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | Status>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 15;

  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null; code: string }>({ open: false, id: null, code: "" });
  const [deleting, setDeleting] = useState(false);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/promotions?page=${currentPage}&limit=${itemsPerPage}&t=${Date.now()}`);
      if (res.ok) {
        const result = await res.json();
        setPromotions(result.data || []);
        setTotalPages(result.meta?.totalPages || 1);
        setTotal(result.meta?.total || 0);
      }
    } catch {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromotions(); }, [currentPage]);

  useEffect(() => {
    if (!highlightId) return;
    const el = document.getElementById(`promo-${highlightId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId, promotions]);

  const filtered = promotions.filter((p) => {
    const matchSearch = p.ma_code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || getStatus(p) === filterStatus;
    return matchSearch && matchStatus;
  });

  const countByStatus = (s: Status) => promotions.filter((p) => getStatus(p) === s).length;

  const openAdd = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setIsModalOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditingId(p.id);
    setFormData({
      ma_code: p.ma_code,
      loai_giam_gia: p.loai_giam_gia || "PHAN_TRAM",
      gia_tri_giam: p.gia_tri_giam?.toString() || "",
      don_toi_thieu: p.don_toi_thieu?.toString() || "",
      gioi_han_su_dung: p.gioi_han_su_dung?.toString() || "",
      ngay_bat_dau: formatDateForInput(p.ngay_bat_dau || ""),
      ngay_ket_thuc: formatDateForInput(p.ngay_ket_thuc || ""),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ma_code.trim()) { toast.error("Vui lòng nhập Mã Code!"); return; }
    if (!formData.gia_tri_giam) { toast.error("Vui lòng nhập Giá trị giảm!"); return; }
    if (Number(formData.gia_tri_giam) < 0 || Number(formData.don_toi_thieu) < 0) {
      toast.error("Giá trị không được là số âm!"); return;
    }
    if (formData.loai_giam_gia === "PHAN_TRAM" && Number(formData.gia_tri_giam) > 100) {
      toast.error("Giảm % không được vượt quá 100!"); return;
    }
    const now = new Date();
    const startDate = formData.ngay_bat_dau ? new Date(formData.ngay_bat_dau) : null;
    const endDate = formData.ngay_ket_thuc ? new Date(formData.ngay_ket_thuc) : null;
    if (!editingId && startDate && startDate < now) { toast.error("Ngày bắt đầu không được ở trong quá khứ!"); return; }
    if (startDate && endDate && startDate >= endDate) { toast.error("Ngày kết thúc phải sau ngày bắt đầu!"); return; }

    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/admin/promotions/${editingId}` : "/api/admin/promotions",
        { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) }
      );
      if (res.ok) {
        toast.success(editingId ? "Cập nhật thành công!" : "Tạo mã thành công!");
        setIsModalOpen(false);
        fetchPromotions();
      } else {
        const d = await res.json();
        toast.error(d.error || "Lỗi hệ thống!");
      }
    } catch { toast.error("Lỗi kết nối!"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/promotions/${deleteModal.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Đã xóa mã khuyến mãi!");
        setDeleteModal({ open: false, id: null, code: "" });
        fetchPromotions();
      } else {
        const d = await res.json();
        toast.error(d.error || "Không thể xóa!");
      }
    } catch { toast.error("Lỗi hệ thống!"); }
    finally { setDeleting(false); }
  };

  const statCards = [
    { label: "Tổng mã", value: total, icon: Tag, bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { label: "Đang chạy", value: countByStatus("DANG_CHAY"), icon: CheckCircle2, bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { label: "Vô thời hạn", value: countByStatus("VO_THOI_HAN"), icon: Infinity, bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-700", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
    { label: "Hết hạn", value: countByStatus("HET_HAN"), icon: TrendingDown, bg: "bg-red-50", border: "border-red-100", text: "text-red-700", iconBg: "bg-red-100", iconColor: "text-red-600" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khuyến Mãi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý mã giảm giá và chương trình ưu đãi</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition shadow-sm text-sm"
        >
          <Plus size={16} />
          Tạo Mã Mới
        </button>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className={`${s.bg} ${s.border} border rounded-xl p-4 flex items-center gap-3`}>
              <div className={`${s.iconBg} rounded-xl p-2.5 flex-shrink-0`}>
                <s.icon size={18} className={s.iconColor} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                <p className={`text-xl font-bold ${s.text}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã code..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 bg-gray-50"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {([
              { key: "ALL", label: `Tất cả (${promotions.length})` },
              { key: "DANG_CHAY", label: `Đang chạy (${countByStatus("DANG_CHAY")})` },
              { key: "VO_THOI_HAN", label: `Vô thời hạn (${countByStatus("VO_THOI_HAN")})` },
              { key: "CHUA_BAT_DAU", label: `Chưa bắt đầu (${countByStatus("CHUA_BAT_DAU")})` },
              { key: "HET_HAN", label: `Hết hạn (${countByStatus("HET_HAN")})` },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                  filterStatus === tab.key
                    ? "bg-rose-600 text-white border-rose-600"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Đang tải dữ liệu...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
              <TicketPercent size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">Không tìm thấy mã nào</p>
            <p className="text-sm text-gray-400">Thử thay đổi bộ lọc hoặc tạo mã mới</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Loại & Giá Trị</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Điều Kiện</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sử Dụng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời Gian</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => {
                  const status = getStatus(p);
                  const cfg = STATUS_CFG[status];
                  const StatusIcon = cfg.icon;
                  const isExpired = status === "HET_HAN";
                  const soLanDaDung = p._count?.don_hang ?? 0;
                  const usagePercent = p.gioi_han_su_dung
                    ? Math.min(100, Math.round((soLanDaDung / p.gioi_han_su_dung) * 100))
                    : null;

                  return (
                    <tr
                      key={p.id}
                      id={`promo-${p.id}`}
                      className={`hover:bg-gray-50/50 transition-colors ${
                        highlightId === String(p.id) ? "bg-amber-50 border-l-2 border-amber-400" : ""
                      } ${isExpired ? "opacity-60" : ""}`}
                    >
                      {/* Mã code */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded border ${
                            isExpired ? "bg-gray-100 text-gray-500 border-gray-200" : "bg-rose-50 text-rose-600 border-rose-200"
                          }`}>
                            {p.ma_code}
                          </span>
                          <CopyButton code={p.ma_code} />
                        </div>
                      </td>

                      {/* Loại & giá trị */}
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-bold text-gray-900">
                            {p.loai_giam_gia === "TIEN_MAT"
                              ? `−${fmt(p.gia_tri_giam ?? 0)}đ`
                              : `−${p.gia_tri_giam}%`}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {p.loai_giam_gia === "TIEN_MAT" ? "Tiền mặt" : "Phần trăm"}
                          </p>
                        </div>
                      </td>

                      {/* Điều kiện */}
                      <td className="px-4 py-3.5">
                        <p className="text-gray-700 text-xs">
                          {p.don_toi_thieu ? `Đơn từ ${fmt(p.don_toi_thieu)}đ` : "Không yêu cầu"}
                        </p>
                      </td>

                      {/* Sử dụng */}
                      <td className="px-4 py-3.5">
                        {p.gioi_han_su_dung ? (
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-700 font-medium">
                                {soLanDaDung}/{p.gioi_han_su_dung}
                              </span>
                              <span className="text-gray-400">{usagePercent}%</span>
                            </div>
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${usagePercent! >= 90 ? "bg-red-400" : usagePercent! >= 60 ? "bg-amber-400" : "bg-emerald-400"}`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Infinity size={11} /> Không giới hạn
                          </span>
                        )}
                      </td>

                      {/* Thời gian */}
                      <td className="px-4 py-3.5">
                        <div className="text-xs text-gray-600 space-y-0.5">
                          {p.ngay_bat_dau ? (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-400">Từ:</span>
                              {new Date(p.ngay_bat_dau).toLocaleDateString("vi-VN")}
                            </div>
                          ) : null}
                          {p.ngay_ket_thuc ? (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-400">Đến:</span>
                              <span className={isExpired ? "text-red-500 font-medium" : ""}>
                                {new Date(p.ngay_ket_thuc).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Không có hạn</span>
                          )}
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, id: p.id, code: p.ma_code })}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Trang {currentPage}/{totalPages} — {total} mã
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (page < 1 || page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition border ${
                      page === currentPage ? "bg-rose-600 text-white border-rose-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b bg-rose-50">
              <div className="w-9 h-9 bg-rose-100 rounded-xl flex items-center justify-center">
                <TicketPercent size={18} className="text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{editingId ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}</h3>
                <p className="text-xs text-gray-500">{editingId ? "Cập nhật thông tin mã" : "Điền thông tin để phát hành mã"}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-rose-100 text-gray-500 transition">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Mã code */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Mã Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ma_code"
                  value={formData.ma_code}
                  onChange={(e) => setFormData({ ...formData, ma_code: e.target.value.toUpperCase() })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-rose-600 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
                  placeholder="VD: TET2026"
                />
              </div>

              {/* Loại + Giá trị */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Hình thức giảm</label>
                  <select
                    name="loai_giam_gia"
                    value={formData.loai_giam_gia}
                    onChange={(e) => setFormData({ ...formData, loai_giam_gia: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  >
                    <option value="PHAN_TRAM">Giảm theo % (phần trăm)</option>
                    <option value="TIEN_MAT">Giảm tiền mặt (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Giá trị giảm <span className="text-red-500">*</span>
                    <span className="ml-1 text-gray-400 font-normal">
                      {formData.loai_giam_gia === "PHAN_TRAM" ? "(%)" : "(VNĐ)"}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.loai_giam_gia === "PHAN_TRAM" ? 100 : undefined}
                    name="gia_tri_giam"
                    value={formData.gia_tri_giam}
                    onChange={(e) => {
                      let v = e.target.value.replace(/-/g, '');
                      if (formData.loai_giam_gia === "PHAN_TRAM" && Number(v) > 100) v = '100';
                      setFormData({ ...formData, gia_tri_giam: v });
                    }}
                    onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    placeholder={formData.loai_giam_gia === "PHAN_TRAM" ? "VD: 10" : "VD: 50000"}
                  />
                </div>
              </div>

              {/* Điều kiện */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Đơn tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    name="don_toi_thieu"
                    value={formData.don_toi_thieu}
                    onChange={(e) => setFormData({ ...formData, don_toi_thieu: e.target.value.replace(/-/g, '') })}
                    onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                    className="w-full border bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    placeholder="Không yêu cầu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Giới hạn lượt dùng</label>
                  <input
                    type="number"
                    min="1"
                    name="gioi_han_su_dung"
                    value={formData.gioi_han_su_dung}
                    onChange={(e) => setFormData({ ...formData, gioi_han_su_dung: e.target.value.replace(/-/g, '') })}
                    onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                    className="w-full border bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    placeholder="Không giới hạn"
                  />
                </div>
              </div>

              {/* Thời gian */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    <span className="flex items-center gap-1"><Calendar size={11} />Ngày bắt đầu</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="ngay_bat_dau"
                    value={formData.ngay_bat_dau}
                    onChange={(e) => setFormData({ ...formData, ngay_bat_dau: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    <span className="flex items-center gap-1"><Calendar size={11} />Ngày kết thúc</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="ngay_ket_thuc"
                    value={formData.ngay_ket_thuc}
                    onChange={(e) => setFormData({ ...formData, ngay_ket_thuc: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {editingId ? "Cập nhật" : "Phát hành mã"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setDeleteModal({ open: false, id: null, code: "" })}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b bg-red-50">
              <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Xóa mã giảm giá</h3>
                <p className="text-xs text-gray-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600">
                Bạn có chắc muốn xóa mã{" "}
                <span className="font-mono font-bold text-rose-600 px-1.5 py-0.5 bg-rose-50 rounded border border-rose-200">
                  {deleteModal.code}
                </span>
                ?
              </p>
              <p className="text-xs text-gray-400 mt-2">Các đơn hàng đã áp dụng mã này sẽ không bị ảnh hưởng.</p>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setDeleteModal({ open: false, id: null, code: "" })}
                className="flex-1 py-2.5 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
              >
                {deleting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Xóa mã
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
