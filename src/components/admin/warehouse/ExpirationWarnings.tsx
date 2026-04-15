"use client";

import React, { useState, useMemo } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, X, ChevronRight,
  Flame, Package, RotateCcw, Truck, Trash2, Tag,
  Filter, RefreshCw, AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────
interface Warning {
  id: number;
  ma_lo: string;
  san_pham: string;
  so_luong: number;
  vi_tri: string;
  han_su_dung: string;
  han_su_dung_raw: string;
  days_left: number | null;
  loai_canh_bao: string;
  loai_goc: string;
  da_xu_ly: boolean;
  phuong_thuc_xu_ly: string | null;
  ncc_id: number | null;
  ncc_ten: string | null;
  ma_lo_hang_id: number | null;
  ma_bien_the: number | null;
}

// ─── Helpers ──────────────────────────────────────────────
const WARNING_META: Record<string, { label: string; color: string; bg: string; border: string; icon: any; pulse?: boolean }> = {
  HET_HAN:            { label: "ĐÃ HẾT HẠN",    color: "text-red-800",    bg: "bg-red-100",    border: "border-red-300",   icon: AlertTriangle, pulse: true },
  SAP_HET_HAN_3:      { label: "CÒN 1–3 NGÀY",   color: "text-red-700",   bg: "bg-red-50",     border: "border-red-200",   icon: Flame },
  SAP_HET_HAN_7:      { label: "CÒN 4–7 NGÀY",   color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", icon: AlertCircle },
  SAP_HET_HAN_30:     { label: "CÒN 8–30 NGÀY",  color: "text-amber-700", bg: "bg-amber-50",   border: "border-amber-200", icon: Clock },
  HANG_HONG:          { label: "HÀNG HỎNG",       color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", icon: Package },
  CANH_BAO_TON_KHO_THAP: { label: "TỒN THẤP",   color: "text-blue-700",  bg: "bg-blue-50",    border: "border-blue-200",  icon: AlertCircle },
};

const WORKFLOWS = [
  { id: "GIAM_GIA",   label: "Giảm giá khẩn cấp", icon: Tag,       color: "text-rose-600",   bg: "bg-rose-50",   border: "border-rose-200" },
  { id: "XUAT_NOI_BO", label: "Xuất nội bộ",       icon: Package,   color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
  { id: "TRA_NCC",    label: "Trả nhà cung cấp",   icon: Truck,     color: "text-cyan-600",   bg: "bg-cyan-50",   border: "border-cyan-200" },
  { id: "TIEU_HUY",  label: "Tiêu hủy",            icon: Trash2,    color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200" },
  { id: "XU_LY_LAI", label: "Xử lý lại",           icon: RotateCcw, color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
];

const FILTERS = [
  { key: "all",       label: "Tất cả" },
  { key: "chua_xu_ly", label: "Chưa xử lý" },
  { key: "HET_HAN",  label: "Đã HH" },
  { key: "SAP_HET_HAN_3", label: "1–3 ngày" },
  { key: "SAP_HET_HAN_7", label: "4–7 ngày" },
  { key: "SAP_HET_HAN_30", label: "8–30 ngày" },
  { key: "HANG_HONG", label: "Hàng hỏng" },
  { key: "da_xu_ly",  label: "Đã xử lý" },
];

// ─── Main Component ────────────────────────────────────────
export default function ExpirationWarnings({ warningsData }: { warningsData: Warning[] }) {
  const [filter, setFilter]   = useState("chua_xu_ly");
  const [resolving, setResolving] = useState<Warning | null>(null);
  const [workflow, setWorkflow] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]   = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [localWarnings, setLocalWarnings] = useState<Warning[]>(warningsData || []);
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // Refresh từ API
  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/warehouse/warnings");
      const d = await res.json();
      setLocalWarnings(d.warnings || []);
    } catch { /* silent */ }
    finally { setRefreshing(false); }
  };

  // Filtered list
  const filtered = useMemo(() => {
    if (filter === "all") return localWarnings;
    if (filter === "chua_xu_ly") return localWarnings.filter((w) => !w.da_xu_ly);
    if (filter === "da_xu_ly") return localWarnings.filter((w) => w.da_xu_ly);
    return localWarnings.filter((w) => !w.da_xu_ly && w.loai_canh_bao === filter);
  }, [localWarnings, filter]);

  // Count badges
  const counts = useMemo(() => {
    const c: Record<string, number> = { chua_xu_ly: 0, da_xu_ly: 0 };
    localWarnings.forEach((w) => {
      if (w.da_xu_ly) c.da_xu_ly = (c.da_xu_ly || 0) + 1;
      else {
        c.chua_xu_ly = (c.chua_xu_ly || 0) + 1;
        c[w.loai_canh_bao] = (c[w.loai_canh_bao] || 0) + 1;
      }
    });
    return c;
  }, [localWarnings]);

  // Submit xử lý
  const handleSubmit = async () => {
    if (!resolving || !workflow) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/warehouse/warnings/${resolving.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ huong: workflow, ...formData }),
      });
      const data = await res.json();
      if (!res.ok) return showToast("error", data.error || "Lỗi xử lý");
      showToast("success", data.message || "Xử lý thành công!");
      setResolving(null);
      setWorkflow(null);
      setFormData({});
      await refresh();
    } catch {
      showToast("error", "Lỗi kết nối máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  const meta = (loai: string) => WARNING_META[loai] || WARNING_META["SAP_HET_HAN_30"];

  return (
    <div className="space-y-5 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold animate-in slide-in-from-top-3 ${toast.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            Cảnh báo & Xử lý hàng hóa
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">Quản lý các lô hàng cần xử lý khẩn cấp</p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: "HET_HAN",   color: "red" },
          { key: "SAP_HET_HAN_3", color: "red" },
          { key: "SAP_HET_HAN_7", color: "orange" },
          { key: "SAP_HET_HAN_30", color: "amber" },
          { key: "HANG_HONG", color: "purple" },
          { key: "CANH_BAO_TON_KHO_THAP", color: "blue" },
        ].map(({ key }) => {
          const m = meta(key);
          const Icon = m.icon;
          const cnt = counts[key] || 0;
          return (
            <button key={key} onClick={() => setFilter(key)}
              className={`p-3 rounded-xl border-2 text-left transition-all hover:shadow-md ${filter === key ? `${m.bg} ${m.border}` : "bg-white border-gray-100"}`}>
              <div className={`flex items-center gap-1.5 mb-1 ${m.color}`}>
                <Icon size={13} />
                <span className="text-[10px] font-bold uppercase">{m.label}</span>
              </div>
              <div className={`text-2xl font-bold ${cnt > 0 ? m.color : "text-gray-300"}`}>{cnt}</div>
            </button>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto custom-scrollbar border-b border-gray-100">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`shrink-0 px-4 py-3 text-xs font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${filter === f.key ? "border-[#1D9E75] text-[#1D9E75] bg-green-50/30" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
              {f.label}
              {counts[f.key] !== undefined && counts[f.key] > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === f.key ? "bg-[#1D9E75] text-white" : "bg-gray-100 text-gray-500"}`}>
                  {counts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50/50 border-b border-gray-100">
                <th className="px-4 py-3">Mức độ</th>
                <th className="px-4 py-3">Lô hàng</th>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3 text-right">SL tồn</th>
                <th className="px-4 py-3">HSD</th>
                <th className="px-4 py-3">Vị trí</th>
                <th className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <CheckCircle2 size={36} className="mx-auto text-green-200 mb-3" />
                    <p className="text-sm font-medium text-gray-400">Không có cảnh báo nào</p>
                  </td>
                </tr>
              ) : (
                filtered.map((w) => {
                  const m = meta(w.loai_canh_bao);
                  const Icon = m.icon;
                  return (
                    <tr key={w.id} className={`transition-colors ${w.da_xu_ly ? "opacity-50 bg-gray-50/50" : "hover:bg-gray-50/40"}`}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${m.bg} ${m.color} ${m.pulse ? "animate-pulse" : ""}`}>
                          <Icon size={10} />
                          {w.da_xu_ly ? "ĐÃ XỬ LÝ" : m.label}
                        </span>
                        {w.da_xu_ly && w.phuong_thuc_xu_ly && (
                          <div className="text-[10px] text-gray-400 mt-1 font-mono">{w.phuong_thuc_xu_ly}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-[#1D9E75] text-xs">{w.ma_lo}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px] truncate">{w.san_pham}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-700">{(w.so_luong ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold text-xs ${w.days_left !== null && w.days_left < 0 ? "text-red-600" : w.days_left !== null && w.days_left <= 7 ? "text-orange-600" : "text-gray-700"}`}>
                          {w.han_su_dung}
                        </span>
                        {!w.da_xu_ly && w.days_left !== null && (
                          <div className="text-[10px] text-gray-400">
                            {w.days_left < 0 ? `Hết hạn ${Math.abs(w.days_left)} ngày` : `Còn ${w.days_left} ngày`}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">{w.vi_tri}</td>
                      <td className="px-4 py-3 text-center">
                        {!w.da_xu_ly ? (
                          <button
                            onClick={() => { setResolving(w); setWorkflow(null); setFormData({}); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1D9E75] text-white text-xs font-bold rounded-lg hover:bg-[#158a63] transition-colors active:scale-95"
                          >
                            Xử lý <ChevronRight size={12} />
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════ RESOLVE MODAL ══════════ */}
      {resolving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setResolving(null); setWorkflow(null); }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-800 text-base">Xử lý cảnh báo lô hàng</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono text-[#1D9E75]">{resolving.ma_lo}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500 truncate max-w-[200px]">{resolving.san_pham}</span>
                  {(() => { const m = meta(resolving.loai_canh_bao); const Icon = m.icon; return (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${m.bg} ${m.color}`}>
                      <Icon size={9} /> {m.label}
                    </span>
                  ); })()}
                </div>
              </div>
              <button onClick={() => { setResolving(null); setWorkflow(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {/* Info bar */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                {[
                  { label: "Số lượng tồn", value: `${resolving.so_luong} thùng`, color: "text-gray-800" },
                  { label: "Hạn sử dụng", value: resolving.han_su_dung, color: resolving.days_left !== null && resolving.days_left < 0 ? "text-red-600" : "text-amber-700" },
                  { label: "Vị trí kho", value: resolving.vi_tri, color: "text-gray-600" },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="text-gray-400 font-medium mb-0.5">{item.label}</div>
                    <div className={`font-bold ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Step 1: Chọn hướng xử lý */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Filter size={12} /> Bước 1: Chọn hướng xử lý
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {WORKFLOWS.map((w) => {
                    const Icon = w.icon;
                    const isDisabled = w.id === "XU_LY_LAI" && resolving.loai_canh_bao !== "HANG_HONG";
                    const isDisabledTra = w.id === "TRA_NCC" && !resolving.ncc_id;
                    const disabled = isDisabled || isDisabledTra;
                    return (
                      <button key={w.id} disabled={disabled}
                        onClick={() => { setWorkflow(w.id); setFormData({}); }}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${disabled ? "opacity-30 cursor-not-allowed bg-gray-50 border-gray-100" : workflow === w.id ? `${w.bg} ${w.border} shadow-sm` : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"}`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${workflow === w.id ? w.bg : "bg-gray-50"} ${w.border} border`}>
                          <Icon size={16} className={w.color} />
                        </div>
                        <div>
                          <div className={`font-semibold text-sm ${workflow === w.id ? w.color : "text-gray-700"}`}>{w.label}</div>
                          {isDisabled && <div className="text-[10px] text-gray-400">Chỉ cho hàng hỏng</div>}
                          {isDisabledTra && <div className="text-[10px] text-gray-400">Lô không có NCC</div>}
                        </div>
                        {workflow === w.id && <ChevronRight size={14} className={`ml-auto ${w.color}`} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Form theo workflow */}
              {workflow && (
                <div className="border-t border-gray-100 pt-5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Bước 2: Nhập thông tin</p>

                  {workflow === "GIAM_GIA" && (
                    <div className="space-y-3">
                      <FormField label="Phần trăm giảm giá (%)" required>
                        <input type="number" min={1} max={99} placeholder="VD: 30"
                          value={formData.phan_tram_giam || ""} onChange={(e) => setFormData((p) => ({ ...p, phan_tram_giam: e.target.value }))}
                          className="input-modal" />
                      </FormField>
                      <FormField label="Ghi chú (tùy chọn)">
                        <textarea rows={2} placeholder="Lý do giảm giá..." value={formData.ghi_chu || ""}
                          onChange={(e) => setFormData((p) => ({ ...p, ghi_chu: e.target.value }))} className="input-modal" />
                      </FormField>
                      <div className="bg-rose-50 rounded-xl p-3 text-xs text-rose-700 border border-rose-100">
                        ⚡ Hệ thống sẽ tạo mã Flash Sale và gửi thông báo tự động đến nhân viên bán hàng.
                      </div>
                    </div>
                  )}

                  {workflow === "XUAT_NOI_BO" && (
                    <div className="space-y-3">
                      <FormField label="Số lượng xuất" required>
                        <input type="number" min={1} max={resolving.so_luong} placeholder={`Tối đa: ${resolving.so_luong}`}
                          value={formData.so_luong || ""} onChange={(e) => setFormData((p) => ({ ...p, so_luong: e.target.value }))}
                          className="input-modal" />
                      </FormField>
                      <FormField label="Bộ phận nhận" required>
                        <input placeholder="VD: Phòng kinh doanh, Bếp ăn..." value={formData.bo_phan || ""}
                          onChange={(e) => setFormData((p) => ({ ...p, bo_phan: e.target.value }))} className="input-modal" />
                      </FormField>
                      <FormField label="Mục đích">
                        <input placeholder="VD: Ăn thử, tặng khách, sự kiện..." value={formData.muc_dich || ""}
                          onChange={(e) => setFormData((p) => ({ ...p, muc_dich: e.target.value }))} className="input-modal" />
                      </FormField>
                    </div>
                  )}

                  {workflow === "TRA_NCC" && (
                    <div className="space-y-3">
                      <FormField label="Nhà cung cấp">
                        <input value={resolving.ncc_ten || "N/A"} disabled className="input-modal bg-gray-50 text-gray-500" />
                      </FormField>
                      <FormField label="Số lượng trả" required>
                        <input type="number" min={1} max={resolving.so_luong} placeholder={`Tối đa: ${resolving.so_luong}`}
                          value={formData.so_luong || ""} onChange={(e) => setFormData((p) => ({ ...p, so_luong: e.target.value }))}
                          className="input-modal" />
                      </FormField>
                      <FormField label="Lý do trả hàng" required>
                        <textarea rows={2} placeholder="Hàng lỗi, sắp hết hạn..." value={formData.ly_do || ""}
                          onChange={(e) => setFormData((p) => ({ ...p, ly_do: e.target.value }))} className="input-modal" />
                      </FormField>
                    </div>
                  )}

                  {workflow === "TIEU_HUY" && (
                    <div className="space-y-3">
                      <FormField label="Lý do tiêu hủy" required>
                        <textarea rows={2} placeholder="Hàng hết hạn, không đảm bảo ATVS..." value={formData.ly_do || ""}
                          onChange={(e) => setFormData((p) => ({ ...p, ly_do: e.target.value }))} className="input-modal" />
                      </FormField>
                      <FormField label="Người chứng kiến">
                        <input placeholder="Tên nhân viên / quản lý chứng kiến" value={formData.nguoi_chung_kien || ""}
                          onChange={(e) => setFormData((p) => ({ ...p, nguoi_chung_kien: e.target.value }))} className="input-modal" />
                      </FormField>
                      <FormField label="Phương thức tiêu hủy" required>
                        <select value={formData.phuong_thuc_tieu_huy || ""}
                          onChange={(e) => setFormData((p) => ({ ...p, phuong_thuc_tieu_huy: e.target.value }))} className="input-modal">
                          <option value="">-- Chọn phương thức --</option>
                          <option value="CHON_LAP">Chôn lấp</option>
                          <option value="DOT">Đốt</option>
                          <option value="BAN_PHE_LIEU">Bán phế liệu</option>
                          <option value="KHAC">Khác</option>
                        </select>
                      </FormField>
                      <div className="bg-red-50 rounded-xl p-3 text-xs text-red-700 border border-red-100 flex gap-2">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <span>Hành động này sẽ đặt tồn kho về 0 và đánh dấu lô là <strong>ĐÃ TIÊU HỦY</strong>. Không thể hoàn tác!</span>
                      </div>
                    </div>
                  )}

                  {workflow === "XU_LY_LAI" && (
                    <div className="space-y-3">
                      <FormField label="Phương án xử lý lại" required>
                        <select value={formData.phuong_an || ""}
                          onChange={(e) => setFormData((p) => ({ ...p, phuong_an: e.target.value }))} className="input-modal">
                          <option value="">-- Chọn phương án --</option>
                          <option value="DONG_GOI_LAI">Đóng gói lại</option>
                          <option value="KIEM_TRA_LAI">Kiểm tra lại chất lượng</option>
                          <option value="HA_CAP">Hạ cấp chất lượng (loại 2)</option>
                        </select>
                      </FormField>
                      <FormField label="Ghi chú">
                        <textarea rows={2} placeholder="Mô tả tình trạng hàng và kế hoạch xử lý..." value={formData.ghi_chu || ""}
                          onChange={(e) => setFormData((p) => ({ ...p, ghi_chu: e.target.value }))} className="input-modal" />
                      </FormField>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
              <button onClick={() => { setResolving(null); setWorkflow(null); }}
                className="px-4 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Huỷ
              </button>
              <button onClick={handleSubmit} disabled={!workflow || submitting}
                className="px-6 py-2.5 bg-[#1D9E75] text-white text-sm font-bold rounded-xl hover:bg-[#158a63] disabled:opacity-40 transition-colors flex items-center gap-2">
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={15} />}
                Xác nhận xử lý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global styles for modal inputs */}
      <style jsx global>{`
        .input-modal {
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.625rem;
          outline: none;
          transition: border-color 0.15s;
          background: white;
        }
        .input-modal:focus { border-color: #1D9E75; box-shadow: 0 0 0 3px rgb(29 158 117 / 0.1); }
        .input-modal:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

// Helper sub-component
function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
