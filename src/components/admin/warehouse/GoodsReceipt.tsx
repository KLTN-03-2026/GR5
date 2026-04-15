"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Package, Calendar, MapPin, CheckCircle2, AlertTriangle,
  FileText, Search, Lightbulb, X, Printer, ChevronRight,
  Info, Eye, CheckCircle, XCircle, Clock,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────
interface Suggestion { type: string; label: string; khu: string; day: string; ke: string; tang: string; vi_tri_id?: number; note: string }
interface Phieu { id: number; ma_phieu: string; trang_thai: string; nha_cung_cap?: { ten_ncc: string }; chi_tiet?: any[] }

// ─── STATUS BADGE ──────────────────────────────────────────────────
const statusMeta: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  CHO_DUYET:    { label: "Chờ duyệt",     color: "text-amber-700",  bg: "bg-amber-50",  icon: Clock },
  CHO_KIEM_TRA: { label: "Chờ kiểm tra",  color: "text-blue-700",   bg: "bg-blue-50",   icon: Eye },
  DA_DUYET:     { label: "Đã duyệt",       color: "text-green-700",  bg: "bg-green-50",  icon: CheckCircle },
  HOAN_THANH:   { label: "Hoàn thành",     color: "text-green-900",  bg: "bg-emerald-50", icon: CheckCircle2 },
  DA_HUY:       { label: "Đã hủy",         color: "text-red-700",    bg: "bg-red-50",    icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const m = statusMeta[status] || statusMeta.CHO_DUYET;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${m.bg} ${m.color}`}>
      <Icon size={11} /> {m.label}
    </span>
  );
}

// ─── PRINT QR MODAL ────────────────────────────────────────────────
function PrintModal({ phieuId, onClose }: { phieuId: number; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/admin/warehouse/import/${phieuId}/review`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [phieuId]);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Phiếu nhập kho</title>
      <style>
        body{font-family:monospace;font-size:12px;margin:0;padding:0}
        .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:16px}
        .qr-card{border:1px solid #ccc;border-radius:6px;padding:8px;text-align:center;break-inside:avoid}
        .qr-img{width:120px;height:120px}
        .info{font-size:10px;margin-top:4px;line-height:1.4}
        h2{text-align:center;margin:12px 0 4px}
        .header-info{text-align:center;font-size:11px;color:#555}
        @media print{body{-webkit-print-color-adjust:exact}}
      </style></head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Printer size={18} className="text-[#1D9E75]" /> In phiếu nhập & QR Code</h3>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="px-4 py-2 bg-[#1D9E75] text-white text-sm font-semibold rounded-lg hover:bg-[#158a63] transition-colors flex items-center gap-2">
              <Printer size={14} /> In ngay
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={16} className="text-gray-400" /></button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data?.qrItems ? (
            <div ref={printRef}>
              <h2>PHIẾU NHẬP KHO — {data.phieu?.ma_phieu}</h2>
              <div className="header-info">
                NCC: {data.phieu?.ncc} • SP: {data.phieu?.san_pham} • HSD: {data.phieu?.han_su_dung} • Số lượng: {data.total} thùng
              </div>
              <div className="grid">
                {data.qrItems.map((item: any, i: number) => (
                  <div key={i} className="qr-card">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(item.qr)}`}
                      alt={item.qr} className="qr-img" />
                    <div className="info">
                      <div><strong>{item.ma_lo}</strong></div>
                      <div>{item.san_pham}</div>
                      <div>HSD: {item.han_su_dung}</div>
                      <div>Vị trí: {item.vi_tri}</div>
                      <div style={{ fontSize: "9px", color: "#999" }}>{item.qr}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-10">Phiếu chưa được duyệt hoặc chưa có QR code.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── REVIEW MODAL (Người kiểm tra duyệt) ──────────────────────────
function ReviewModal({ phieu, onClose, onDone }: { phieu: Phieu; onClose: () => void; onDone: () => void }) {
  const chiTiet = phieu.chi_tiet?.[0];
  const soLuongYC = chiTiet?.so_luong_yeu_cau || chiTiet?.so_luong_thung || 0;
  const [form, setForm] = useState({ so_luong_thuc_nhan: String(soLuongYC), ghi_chu: "", ly_do: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<"approve" | "reject">("approve");

  const chenh = soLuongYC > 0 ? Math.abs((Number(form.so_luong_thuc_nhan) - soLuongYC) / soLuongYC) * 100 : 0;

  const handle = async () => {
    if (action === "approve" && chenh > 5 && !form.ly_do) {
      setError(`Chênh lệch ${chenh.toFixed(1)}% — bắt buộc nhập lý do!`);
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/admin/warehouse/import/${phieu.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          so_luong_thuc_nhan: Number(form.so_luong_thuc_nhan),
          ghi_chu_kiem_tra: form.ghi_chu,
          ly_do_chenh_lech: form.ly_do,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Lỗi"); return; }
      onDone();
    } catch { setError("Lỗi kết nối"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2"><Eye size={16} className="text-blue-500" /> Kiểm tra phiếu {phieu.ma_phieu}</h3>
          <button onClick={onClose}><X size={16} className="text-gray-400" /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
            <div className="font-medium text-gray-700">NCC: {phieu.nha_cung_cap?.ten_ncc || "N/A"}</div>
            <div className="text-gray-500">SP: {chiTiet?.bien_the_san_pham?.ten_bien_the || "N/A"}</div>
            <div className="text-gray-500 font-bold">Yêu cầu: {soLuongYC} thùng</div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Số lượng thực nhận <span className="text-red-500">*</span></label>
            <input type="number" min={0} value={form.so_luong_thuc_nhan}
              onChange={(e) => setForm((p) => ({ ...p, so_luong_thuc_nhan: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
            {chenh > 0 && (
              <div className={`mt-1.5 text-xs flex items-center gap-1.5 font-semibold ${chenh > 5 ? "text-red-600" : "text-amber-600"}`}>
                <AlertTriangle size={12} />
                Chênh lệch: {chenh.toFixed(1)}% {chenh > 5 ? "— BẮT BUỘC nhập lý do" : "— trong phạm vi cho phép"}
              </div>
            )}
          </div>

          {chenh > 5 && action === "approve" && (
            <div>
              <label className="text-xs font-semibold text-red-600 block mb-1.5">Lý do chênh lệch <span className="text-red-500">*</span></label>
              <textarea rows={2} value={form.ly_do} onChange={(e) => setForm((p) => ({ ...p, ly_do: e.target.value }))}
                placeholder="Ví dụ: Hàng bị hư hỏng trong vận chuyển, thiếu 3 thùng..."
                className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:border-red-400 bg-red-50" />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Ghi chú kiểm tra</label>
            <input value={form.ghi_chu} onChange={(e) => setForm((p) => ({ ...p, ghi_chu: e.target.value }))}
              placeholder="Nhận xét về chất lượng, bao bì..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
          </div>

          {error && <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-1.5"><AlertTriangle size={12} />{error}</div>}

          <div className="flex gap-2 pt-1">
            <button onClick={() => { setAction("approve"); handle(); }} disabled={loading}
              className="flex-1 py-2.5 bg-[#1D9E75] text-white text-sm font-bold rounded-xl hover:bg-[#158a63] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
              {loading && action === "approve" ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={14} />}
              Duyệt & Nhập kho
            </button>
            <button onClick={() => { setAction("reject"); handle(); }} disabled={loading}
              className="px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 text-sm font-bold rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors">
              Từ chối
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────
export default function GoodsReceipt({ formOptions }: { formOptions: any }) {
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [formData, setFormData] = useState({
    ma_ncc: "", ma_bien_the: "", so_luong_thung: "",
    ngay_thu_hoach: "", ngay_nhap_kho: new Date().toISOString().split("T")[0],
    han_su_dung: "", ma_lo_hang_tuy_chinh: "",
    vi_tri: { khu: "", day: "", ke: "", tang: "" },
  });

  const [batchCheck, setBatchCheck] = useState<{ exists: boolean; lo?: any } | null>(null);
  const [batchChecking, setBatchChecking] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggLoading, setSuggLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdPhieu, setCreatedPhieu] = useState<any>(null);
  const [printPhieuId, setPrintPhieuId] = useState<number | null>(null);
  const [phieuList, setPhieuList] = useState<Phieu[]>([]);
  const [reviewTarget, setReviewTarget] = useState<Phieu | null>(null);
  const [activeTab, setActiveTab] = useState<"form" | "list">("form");
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // Load phiếu list
  const loadPhieus = useCallback(async () => {
    const res = await fetch("/api/admin/warehouse/import?status=all");
    const d = await res.json();
    setPhieuList(d.phieus || []);
  }, []);

  useEffect(() => { loadPhieus(); }, [loadPhieus]);

  // Real-time batch duplicate check (debounced 600ms)
  const batchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkBatch = (code: string) => {
    if (batchTimer.current) clearTimeout(batchTimer.current);
    if (!code.trim()) { setBatchCheck(null); return; }
    batchTimer.current = setTimeout(async () => {
      setBatchChecking(true);
      const res = await fetch(`/api/admin/warehouse/import/check-batch?code=${encodeURIComponent(code)}`);
      const d = await res.json();
      setBatchCheck(d);
      setBatchChecking(false);
    }, 600);
  };

  // Suggest location when product changes
  const fetchSuggestions = useCallback(async (maBienThe: string) => {
    if (!maBienThe) { setSuggestions([]); return; }
    setSuggLoading(true);
    const res = await fetch(`/api/admin/warehouse/import/suggest-location?ma_bien_the=${maBienThe}`);
    const d = await res.json();
    setSuggestions(d.suggestions || []);
    setSuggLoading(false);
  }, []);

  const applySuggestion = (s: Suggestion) => {
    setFormData((p) => ({ ...p, vi_tri: { khu: s.khu, day: s.day, ke: s.ke, tang: s.tang } }));
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (["khu", "day", "ke", "tang"].includes(name)) {
      setFormData((p) => ({ ...p, vi_tri: { ...p.vi_tri, [name]: value } }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
      if (name === "ma_lo_hang_tuy_chinh") checkBatch(value);
      if (name === "ma_bien_the") fetchSuggestions(value);
    }
  };

  const handleSubmit = async () => {
    if (batchCheck?.exists) return showToast("error", "Mã lô đã tồn tại — hãy dùng mã khác");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/warehouse/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ma_ncc: Number(formData.ma_ncc),
          ma_bien_the: Number(formData.ma_bien_the),
          so_luong_thung: Number(formData.so_luong_thung),
        }),
      });
      const data = await res.json();
      if (!res.ok) return showToast("error", data.error || "Lỗi tạo phiếu");
      setCreatedPhieu(data.phieu);
      setStep("success");
      loadPhieus();
    } catch { showToast("error", "Lỗi kết nối"); }
    finally { setSubmitting(false); }
  };

  const submitForReview = async (phieuId: number) => {
    const res = await fetch(`/api/admin/warehouse/import/${phieuId}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit" }),
    });
    const d = await res.json();
    if (!res.ok) return showToast("error", d.error || "Lỗi");
    showToast("success", "Đã nộp phiếu — đang chờ kiểm tra");
    loadPhieus();
  };

  // Input field style
  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/10 bg-gray-50/50 text-sm transition-colors";

  return (
    <div className="space-y-5 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold animate-in slide-in-from-top-3 ${toast.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Review Modal */}
      {reviewTarget && (
        <ReviewModal phieu={reviewTarget} onClose={() => setReviewTarget(null)}
          onDone={() => { setReviewTarget(null); loadPhieus(); showToast("success", "Phiếu đã được duyệt và hàng đã nhập kho!"); }} />
      )}

      {/* Print Modal */}
      {printPhieuId && <PrintModal phieuId={printPhieuId} onClose={() => setPrintPhieuId(null)} />}

      {/* Tabs */}
      <div className="flex gap-0 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <button onClick={() => setActiveTab("form")} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === "form" ? "border-[#1D9E75] text-[#1D9E75] bg-green-50/30" : "border-transparent text-gray-500 hover:bg-gray-50"}`}>
          <FileText size={16} /> Tạo phiếu mới
        </button>
        <button onClick={() => setActiveTab("list")} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === "list" ? "border-[#1D9E75] text-[#1D9E75] bg-green-50/30" : "border-transparent text-gray-500 hover:bg-gray-50"}`}>
          <Eye size={16} /> Phiếu đang chờ
          {phieuList.filter((p) => ["CHO_DUYET", "CHO_KIEM_TRA"].includes(p.trang_thai)).length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {phieuList.filter((p) => ["CHO_DUYET", "CHO_KIEM_TRA"].includes(p.trang_thai)).length}
            </span>
          )}
        </button>
      </div>

      {/* ── TAB 1: Form tạo phiếu ── */}
      {activeTab === "form" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="w-9 h-9 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center">
              <FileText size={18} className="text-[#1D9E75]" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-base">Tạo Phiếu Nhập Kho</h2>
              <p className="text-xs text-gray-400">Phiếu sẽ chờ kiểm tra trước khi hàng vào kho (4-eyes)</p>
            </div>
          </div>

          {step === "success" ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Phiếu đã được tạo!</h3>
                <p className="text-sm text-gray-500 mt-1">Mã phiếu: <span className="font-mono font-bold text-[#1D9E75]">{createdPhieu?.ma_phieu}</span></p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-sm text-amber-700 flex items-start gap-2 text-left max-w-md mx-auto">
                <Info size={15} className="shrink-0 mt-0.5" />
                <span>Phiếu đang ở trạng thái <strong>CHỜ DUYỆT</strong>. Nhấn "Nộp kiểm tra" để chuyển sang người kiểm hàng xác nhận.</span>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={() => submitForReview(createdPhieu?.id)}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <ChevronRight size={14} /> Nộp kiểm tra ngay
                </button>
                <button onClick={() => { setStep("form"); setCreatedPhieu(null); setActiveTab("list"); }}
                  className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                  Xem danh sách phiếu
                </button>
                <button onClick={() => { setStep("form"); setCreatedPhieu(null); }}
                  className="px-5 py-2.5 bg-[#1D9E75] text-white text-sm font-bold rounded-xl hover:bg-[#158a63] transition-colors">
                  Tạo phiếu mới
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Block 1: Mã lô + kiểm tra trùng */}
              <section>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Search size={12} /> Mã lô hàng (tùy chọn)
                </h3>
                <div className="relative">
                  <input name="ma_lo_hang_tuy_chinh" value={formData.ma_lo_hang_tuy_chinh}
                    onChange={handleInput} placeholder="Để trống = hệ thống tự sinh; hoặc nhập mã riêng (VD: LO-2026-001)"
                    className={`${inputCls} ${batchCheck?.exists ? "border-red-400 bg-red-50" : batchCheck?.exists === false && formData.ma_lo_hang_tuy_chinh ? "border-green-400" : ""}`} />
                  {batchChecking && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1D9E75] rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {batchCheck?.exists && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-1">
                    <div className="font-bold flex items-center gap-1.5"><AlertTriangle size={12} /> Mã lô đã tồn tại trong hệ thống!</div>
                    <div>SP: {batchCheck.lo?.san_pham} • Tồn: {batchCheck.lo?.so_luong_ton} thùng • Vị trí: {batchCheck.lo?.vi_tri}</div>
                    <div className="flex gap-2 mt-2">
                      <button className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-[11px] font-semibold hover:bg-amber-200 transition-colors">
                        Nhập bổ sung vào lô cũ
                      </button>
                      <button onClick={() => { setFormData((p) => ({ ...p, ma_lo_hang_tuy_chinh: "" })); setBatchCheck(null); }}
                        className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-[11px] font-semibold hover:bg-gray-50 transition-colors">
                        Đặt mã khác
                      </button>
                    </div>
                  </div>
                )}
                {batchCheck?.exists === false && formData.ma_lo_hang_tuy_chinh && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-green-600 font-medium">
                    <CheckCircle2 size={12} /> Mã lô hợp lệ — chưa tồn tại
                  </div>
                )}
              </section>

              {/* Block 2: NCC + SP + Số lượng */}
              <section>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Package size={12} /> Thông tin hàng hóa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">Nhà cung cấp <span className="text-red-500">*</span></label>
                    <select name="ma_ncc" value={formData.ma_ncc} onChange={handleInput} required className={inputCls}>
                      <option value="">-- Chọn NCC --</option>
                      {formOptions?.ncc?.map((n: any) => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">Sản phẩm <span className="text-red-500">*</span></label>
                    <select name="ma_bien_the" value={formData.ma_bien_the} onChange={handleInput} required className={inputCls}>
                      <option value="">-- Chọn SP --</option>
                      {formOptions?.sp?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">Số lượng (thùng) <span className="text-red-500">*</span></label>
                    <input type="number" min={1} name="so_luong_thung" value={formData.so_luong_thung} onChange={handleInput}
                      placeholder="VD: 50" required className={inputCls} />
                  </div>
                </div>
              </section>

              {/* Block 3: Ngày */}
              <section>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Calendar size={12} /> Thời gian
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "ngay_thu_hoach", label: "Ngày thu hoạch" },
                    { name: "ngay_nhap_kho",  label: "Ngày nhập kho" },
                    { name: "han_su_dung",    label: "Hạn sử dụng *", required: true },
                  ].map(({ name, label, required }) => (
                    <div key={name}>
                      <label className="text-xs font-semibold text-gray-600 block mb-1.5">{label}</label>
                      <input type="date" name={name} value={(formData as any)[name]} onChange={handleInput}
                        required={required} className={inputCls} />
                    </div>
                  ))}
                </div>
              </section>

              {/* Block 4: Vị trí + gợi ý */}
              <section>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <MapPin size={12} /> Vị trí cất trữ dự kiến
                </h3>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mb-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#1D9E75] font-semibold">
                      <Lightbulb size={12} /> Gợi ý vị trí thông minh
                    </div>
                    {suggestions.map((s, i) => (
                      <button key={i} onClick={() => applySuggestion(s)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs text-left transition-all hover:shadow-sm ${s.type === "same_product" ? "bg-green-50 border-green-200 hover:bg-green-100" : "bg-blue-50 border-blue-200 hover:bg-blue-100"}`}>
                        <div>
                          <div className={`font-semibold ${s.type === "same_product" ? "text-green-700" : "text-blue-700"}`}>{s.label}</div>
                          <div className="text-gray-500">{s.note}</div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 shrink-0 ml-2">Dùng →</span>
                      </button>
                    ))}
                  </div>
                )}
                {suggLoading && <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-2"><div className="w-3 h-3 border border-gray-300 border-t-[#1D9E75] rounded-full animate-spin" /> Đang tìm gợi ý...</div>}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: "khu", placeholder: "Khu A" },
                    { name: "day", placeholder: "D1" },
                    { name: "ke",  placeholder: "K2" },
                    { name: "tang", placeholder: "T1" },
                  ].map(({ name, placeholder }) => (
                    <div key={name}>
                      <label className="text-[10px] font-semibold text-gray-500 block mb-1 uppercase">{name === "khu" ? "Khu vực" : name === "day" ? "Dãy" : name === "ke" ? "Kệ" : "Tầng"}</label>
                      <input name={name} value={(formData.vi_tri as any)[name]} onChange={handleInput}
                        placeholder={placeholder} className={inputCls} />
                    </div>
                  ))}
                </div>
              </section>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button onClick={handleSubmit} disabled={submitting || !!batchCheck?.exists || !formData.ma_ncc || !formData.ma_bien_the || !formData.so_luong_thung || !formData.han_su_dung}
                  className="px-8 py-3 bg-[#1D9E75] text-white font-bold rounded-xl hover:bg-[#158a63] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                  {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileText size={16} />}
                  Tạo Phiếu Nhập
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: Danh sách phiếu ── */}
      {activeTab === "list" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2"><Eye size={16} className="text-blue-500" /> Danh sách phiếu nhập</h2>
            <button onClick={loadPhieus} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search size={14} className="text-gray-400" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wide bg-gray-50/50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left">Mã phiếu</th>
                  <th className="px-4 py-3 text-left">NCC</th>
                  <th className="px-4 py-3 text-left">Sản phẩm</th>
                  <th className="px-4 py-3 text-right">Số lượng</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {phieuList.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm">Chưa có phiếu nhập nào</td></tr>
                ) : (
                  phieuList.map((p) => {
                    const chiTiet = (p as any).chi_tiet?.[0];
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-[#1D9E75]">{p.ma_phieu}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{(p as any).nha_cung_cap?.ten_ncc || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-700 max-w-[150px] truncate">{chiTiet?.bien_the_san_pham?.ten_bien_the || "—"}</td>
                        <td className="px-4 py-3 text-right text-xs font-bold text-gray-700">{chiTiet?.so_luong_yeu_cau || chiTiet?.so_luong_thung || 0}</td>
                        <td className="px-4 py-3 text-center"><StatusBadge status={p.trang_thai} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {p.trang_thai === "CHO_DUYET" && (
                              <button onClick={() => submitForReview(p.id)}
                                className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                                Nộp KT
                              </button>
                            )}
                            {p.trang_thai === "CHO_KIEM_TRA" && (
                              <button onClick={() => setReviewTarget(p)}
                                className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 text-[11px] font-semibold rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1">
                                <Eye size={10} /> Kiểm tra
                              </button>
                            )}
                            {["DA_DUYET", "HOAN_THANH"].includes(p.trang_thai) && (
                              <button onClick={() => setPrintPhieuId(p.id)}
                                className="px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-200 text-[11px] font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1">
                                <Printer size={10} /> In QR
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
