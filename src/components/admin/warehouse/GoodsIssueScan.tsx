"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ScanBarcode, CheckCircle2, XCircle, AlertCircle, Package,
  List, ShoppingCart, AlertTriangle, ChevronRight, X,
  Clock, MapPin, Layers, RefreshCw, ArrowRight,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────
interface LoGoi {
  ma_lo_hang: string; lo_hang_id: number; san_pham: string;
  han_su_dung: string; days_left: number | null;
  so_luong_ton: number; so_luong_xuat_goi_y: number;
  vi_tri: string; la_uu_tien: boolean; urgent: boolean;
}
interface SuggestResult {
  lo_list: LoGoi[]; total_ton: number; du_hang: boolean; thieu: number;
}

// ─── Mode definitions ────────────────────────────────────────────────
const MODES = [
  { id: "qr",     label: "Quét QR",       icon: ScanBarcode, desc: "Súng quét FEFO" },
  { id: "manual", label: "Chọn thủ công", icon: List,         desc: "Chọn lô từ danh sách" },
  { id: "order",  label: "Theo đơn hàng", icon: ShoppingCart, desc: "FEFO tự động theo đơn" },
];

// ─── FEFO Suggestion Card ────────────────────────────────────────────
function LoCard({ lo, index, soLuongIn, onSelect }: {
  lo: LoGoi; index: number; soLuongIn?: number; onSelect?: () => void;
}) {
  const urgent = lo.days_left !== null && lo.days_left <= 7;
  const expired = lo.days_left !== null && lo.days_left < 0;
  return (
    <div className={`border-2 rounded-xl p-4 transition-all ${lo.la_uu_tien ? "border-[#1D9E75] bg-green-50/50 shadow-sm" : "border-gray-100 bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {lo.la_uu_tien && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#1D9E75] text-white rounded-full uppercase tracking-wide">
              ← Xuất trước
            </span>
          )}
          {!lo.la_uu_tien && index === 1 && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Dự phòng</span>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          {expired && <span className="text-[10px] font-bold px-2 py-0.5 bg-red-600 text-white rounded-full animate-pulse">HẾT HẠN</span>}
          {!expired && urgent && <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-white rounded-full">Còn {lo.days_left}N</span>}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="font-mono font-bold text-[#1D9E75] text-sm">{lo.ma_lo_hang}</div>
          <div className="text-gray-500 truncate">{lo.san_pham}</div>
        </div>
        <div className="text-right">
          <div className={`font-bold text-sm ${expired ? "text-red-600" : urgent ? "text-amber-600" : "text-gray-700"}`}>{lo.han_su_dung}</div>
          <div className="text-gray-400">HSD</div>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <MapPin size={11} /> <span className="truncate">{lo.vi_tri}</span>
        </div>
        <div className="flex items-center gap-1 justify-end">
          <Layers size={11} className="text-gray-400" />
          <span className="font-semibold text-gray-700">{lo.so_luong_ton.toLocaleString()} thùng</span>
        </div>
      </div>

      {soLuongIn !== undefined && lo.so_luong_xuat_goi_y > 0 && (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">Cần xuất từ lô này:</span>
          <span className="text-sm font-bold text-[#1D9E75]">{lo.so_luong_xuat_goi_y} thùng</span>
        </div>
      )}

      {onSelect && (
        <button onClick={onSelect}
          className="mt-3 w-full py-1.5 bg-[#1D9E75] text-white text-xs font-bold rounded-lg hover:bg-[#158a63] transition-colors flex items-center justify-center gap-1.5">
          Chọn lô này <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────
export default function GoodsIssueScan() {
  const [mode, setMode] = useState<"qr" | "manual" | "order">("qr");

  // QR mode
  const [qrResult, setQrResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Manual mode
  const [maBienThe, setMaBienThe] = useState("");
  const [soLuong, setSoLuong] = useState("");
  const [suggest, setSuggest] = useState<SuggestResult | null>(null);
  const [sugLoading, setSugLoading] = useState(false);
  const [issueResult, setIssueResult] = useState<any>(null);
  const [issueLoading, setIssueLoading] = useState(false);

  // Order mode
  const [donHangId, setDonHangId] = useState("");
  const [orderSuggest, setOrderSuggest] = useState<any>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderIssuing, setOrderIssuing] = useState(false);

  // Partial shortage modal
  const [shortageModal, setShortageModal] = useState<{ thieu: number; ton: number; yeuCau: number } | null>(null);

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // Focus QR input on tab switch
  useEffect(() => { if (mode === "qr") setTimeout(() => inputRef.current?.focus(), 100); }, [mode]);

  // ── QR scan ──────────────────────────────────────────────────────
  const handleQrScan = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const val = e.currentTarget.value.trim();
    if (!val) return;
    setQrLoading(true); setQrResult(null);
    try {
      const res = await fetch("/api/admin/warehouse/issue", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "qr", qrCode: val }),
      });
      const data = await res.json();
      setQrResult({ type: res.ok ? "success" : "error", msg: data.message || data.error });
      e.currentTarget.value = "";
    } catch { setQrResult({ type: "error", msg: "Lỗi kết nối" }); }
    finally { setQrLoading(false); setTimeout(() => inputRef.current?.focus(), 100); }
  };

  // ── Manual fetch FEFO suggestions ──────────────────────────────────
  const fetchSuggest = useCallback(async () => {
    if (!maBienThe) return;
    setSugLoading(true); setSuggest(null); setIssueResult(null);
    const res = await fetch(`/api/admin/warehouse/issue?ma_bien_the=${maBienThe}&so_luong=${soLuong || 0}`);
    const d = await res.json();
    setSuggest(d);
    setSugLoading(false);
  }, [maBienThe, soLuong]);

  // ── Manual issue ──────────────────────────────────────────────────
  const handleManualIssue = async (forcePartial = false) => {
    setIssueLoading(true); setIssueResult(null); setShortageModal(null);
    try {
      const res = await fetch("/api/admin/warehouse/issue", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: forcePartial ? "partial" : "manual",
          ma_bien_the: Number(maBienThe), so_luong: Number(soLuong),
          force_partial: forcePartial,
        }),
      });
      const data = await res.json();
      if (res.status === 409 && data.insufficient) {
        setShortageModal({ thieu: data.thieu, ton: data.ton_kho, yeuCau: data.yeu_cau });
        return;
      }
      if (!res.ok) { showToast("error", data.error || "Lỗi"); return; }
      setIssueResult(data);
      showToast("success", data.message);
      setSuggest(null); setSoLuong(""); setMaBienThe("");
    } catch { showToast("error", "Lỗi kết nối"); }
    finally { setIssueLoading(false); }
  };

  // ── Order mode: fetch FEFO suggestions for order ──────────────────
  const fetchOrderSuggest = async () => {
    if (!donHangId) return;
    setOrderLoading(true); setOrderSuggest(null);
    const res = await fetch("/api/admin/warehouse/issue", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "order", ma_don_hang: Number(donHangId) }),
    });
    const d = await res.json();
    if (!res.ok) { showToast("error", d.error || "Lỗi"); setOrderLoading(false); return; }
    setOrderSuggest(d);
    setOrderLoading(false);
  };

  // ─── RENDER ──────────────────────────────────────────────────────
  return (
    <div className="space-y-5 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold animate-in slide-in-from-top-3 ${toast.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Shortage Modal */}
      {shortageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-800">Không đủ hàng!</h3>
                <p className="text-xs text-amber-600">Tồn kho không đủ để xuất toàn bộ</p>
              </div>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Yêu cầu", val: shortageModal.yeuCau, color: "text-gray-800" },
                  { label: "Tồn kho", val: shortageModal.ton, color: "text-blue-600" },
                  { label: "Thiếu", val: shortageModal.thieu, color: "text-red-600" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="bg-gray-50 rounded-xl py-3 px-2">
                    <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                    <div className={`text-xl font-bold ${color}`}>{val}</div>
                    <div className="text-[10px] text-gray-400">thùng</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 text-center">Bạn muốn xuất <strong className="text-[#1D9E75]">{shortageModal.ton} thùng</strong> (một phần) hay hủy yêu cầu này?</p>
              <div className="flex gap-2">
                <button onClick={() => handleManualIssue(true)}
                  className="flex-1 py-2.5 bg-[#1D9E75] text-white text-sm font-bold rounded-xl hover:bg-[#158a63] transition-colors">
                  Xuất {shortageModal.ton} thùng (1 phần)
                </button>
                <button onClick={() => setShortageModal(null)}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Selector */}
      <div className="grid grid-cols-3 gap-3">
        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <button key={m.id} onClick={() => setMode(m.id as any)}
              className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${mode === m.id ? "border-[#1D9E75] bg-green-50/40 shadow-sm" : "border-gray-100 bg-white hover:border-gray-200"}`}>
              <div className={`flex items-center gap-2 mb-1.5 ${mode === m.id ? "text-[#1D9E75]" : "text-gray-600"}`}>
                <Icon size={18} />
                <span className="font-bold text-sm">{m.label}</span>
              </div>
              <p className="text-xs text-gray-400">{m.desc}</p>
            </button>
          );
        })}
      </div>

      {/* ═══════════ MODE: QR SCAN ═══════════ */}
      {mode === "qr" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
          <div className="text-center">
            <div className="inline-flex w-16 h-16 bg-[#1D9E75]/10 rounded-full items-center justify-center mb-3">
              <ScanBarcode size={30} className="text-[#1D9E75]" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Quét mã QR thùng hàng</h3>
            <p className="text-sm text-gray-400 mt-1">FEFO được thực thi tự động</p>
          </div>

          <div className="relative">
            <input ref={inputRef} type="text" autoFocus disabled={qrLoading}
              placeholder="Nhấp vào đây rồi bóp cò súng quét..."
              onKeyDown={handleQrScan}
              className="w-full text-center text-base font-mono px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/10 outline-none transition-all disabled:bg-gray-50" />
            {qrLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {qrResult ? (
            <div className={`p-4 rounded-xl flex items-start gap-3 border-2 ${qrResult.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
              {qrResult.type === "success" ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> : <XCircle size={20} className="shrink-0 mt-0.5" />}
              <div>
                <div className="font-bold">{qrResult.type === "success" ? "✅ Hợp lệ — Đã xuất kho!" : "❌ Từ chối xuất kho!"}</div>
                <p className="text-sm mt-0.5">{qrResult.msg}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3 text-blue-700 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <div className="font-bold mb-0.5">Quy tắc FEFO đang kích hoạt</div>
                <p>Hệ thống từ chối nếu scan thùng không phải HSD sớm nhất của sản phẩm.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ MODE: MANUAL ═══════════ */}
      {mode === "manual" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <List size={18} className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Xuất kho thủ công</h3>
              <p className="text-xs text-gray-400">Hệ thống tự chọn lô FEFO, bạn xác nhận số lượng</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Mã sản phẩm (ID) <span className="text-red-500">*</span></label>
                <input type="number" value={maBienThe} onChange={(e) => setMaBienThe(e.target.value)}
                  placeholder="VD: 3" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/10" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Số lượng cần xuất (thùng) <span className="text-red-500">*</span></label>
                <input type="number" min={1} value={soLuong} onChange={(e) => setSoLuong(e.target.value)}
                  placeholder="VD: 10" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/10" />
              </div>
            </div>

            <button onClick={fetchSuggest} disabled={!maBienThe || sugLoading}
              className="w-full py-2.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
              {sugLoading ? <RefreshCw size={14} className="animate-spin" /> : <Layers size={14} />}
              Xem gợi ý lô FEFO
            </button>

            {/* Gợi ý lô */}
            {suggest && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Clock size={12} /> Gợi ý xuất theo FEFO
                  </h4>
                  <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${suggest.du_hang ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {suggest.du_hang ? `✓ Đủ hàng (tổng ${suggest.total_ton})` : `⚠ Thiếu ${suggest.thieu} thùng`}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggest.lo_list.slice(0, 4).map((lo, i) => (
                    <LoCard key={lo.ma_lo_hang} lo={lo} index={i} soLuongIn={Number(soLuong)} />
                  ))}
                </div>
              </div>
            )}

            {/* Xuất button */}
            {suggest && (
              <button onClick={() => handleManualIssue(false)} disabled={issueLoading || !soLuong}
                className="w-full py-3 bg-[#1D9E75] text-white font-bold rounded-xl hover:bg-[#158a63] disabled:opacity-40 transition-colors flex items-center justify-center gap-2 text-sm">
                {issueLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={16} />}
                Xác nhận xuất {soLuong} thùng (FEFO)
              </button>
            )}

            {issueResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
                <div className="font-bold flex items-center gap-2 mb-1"><CheckCircle2 size={15} /> Xuất kho thành công!</div>
                <p>{issueResult.message}</p>
                {issueResult.partial && (
                  <p className="mt-1 text-amber-700 font-medium">⚠ Xuất một phần — thiếu {issueResult.thieu} thùng</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ MODE: ORDER ═══════════ */}
      {mode === "order" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
              <ShoppingCart size={18} className="text-purple-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Xuất theo đơn hàng</h3>
              <p className="text-xs text-gray-400">Hệ thống tự gợi ý lô FEFO cho từng sản phẩm trong đơn</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex gap-3">
              <input type="number" value={donHangId} onChange={(e) => setDonHangId(e.target.value)}
                placeholder="Nhập ID đơn hàng..." className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400" />
              <button onClick={fetchOrderSuggest} disabled={!donHangId || orderLoading}
                className="px-5 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-40 transition-colors flex items-center gap-2">
                {orderLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ChevronRight size={14} />}
                Xem gợi ý
              </button>
            </div>

            {orderSuggest && (
              <div className="space-y-4">
                <div className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-2 flex items-center justify-between">
                  <span>Đơn #{orderSuggest.don_hang?.id} • {orderSuggest.suggestions?.length} sản phẩm</span>
                  <span className={`font-semibold ${orderSuggest.don_hang?.trang_thai === "CHO_XAC_NHAN" ? "text-amber-600" : "text-gray-600"}`}>
                    {orderSuggest.don_hang?.trang_thai}
                  </span>
                </div>
                {orderSuggest.suggestions?.map((s: any, idx: number) => (
                  <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm text-gray-800">{s.ten_san_pham}</div>
                        <div className="text-xs text-gray-400">Yêu cầu: <strong>{s.so_luong_yeu_cau}</strong> thùng • Tồn: <strong className={s.total_ton < s.so_luong_yeu_cau ? "text-red-600" : "text-green-600"}>{s.total_ton}</strong></div>
                      </div>
                      {s.total_ton < s.so_luong_yeu_cau && (
                        <span className="text-[10px] font-bold px-2 py-1 bg-red-100 text-red-700 rounded-full">THIẾU {s.so_luong_yeu_cau - s.total_ton}</span>
                      )}
                    </div>
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {s.fefo_suggestions?.map((lo: any, i: number) => (
                        <div key={i} className={`p-3 rounded-xl border text-xs ${i === 0 ? "border-[#1D9E75] bg-green-50" : "border-gray-100 bg-white"}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            {i === 0 && <span className="text-[9px] font-bold bg-[#1D9E75] text-white px-1.5 py-0.5 rounded-full">XUẤT TRƯỚC</span>}
                            <span className="font-mono font-bold text-[#1D9E75]">{lo.ma_lo}</span>
                          </div>
                          <div className="text-gray-500">HSD: <strong>{lo.han_su_dung}</strong></div>
                          <div className="text-gray-500 flex items-center gap-1"><MapPin size={9} />{lo.vi_tri}</div>
                          <div className="mt-1 font-semibold text-gray-700">{lo.so_luong_ton} thùng tồn</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>Sau khi xác nhận xuất từng sản phẩm, dùng tab <strong>Quét QR</strong> hoặc <strong>Chọn thủ công</strong> để thực hiện xuất kho thực tế.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
