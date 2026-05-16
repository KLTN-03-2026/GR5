"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  PackageOpen, AlertTriangle, FileInput, Plus, QrCode,
  X, Loader2, CheckCircle2, ClipboardList, RefreshCw,
  ArrowUpFromLine, Warehouse, Clock, ScanLine, Inbox,
  Search, Eye, Printer, ChevronRight, Info, CheckCircle,
  XCircle, Package, MapPin, AlertCircle, TrendingDown,
  Calendar, BarChart3, Boxes,
} from "lucide-react";

import WarehouseMapView from "@/components/admin/warehouse/WarehouseMapView";
import IssueHistory from "@/components/admin/warehouse/IssueHistory";
import ExpirationWarnings from "@/components/admin/warehouse/ExpirationWarnings";
import PurchaseOrderCreation from "@/components/warehouse-manager/PurchaseOrderCreation";
import toast from "react-hot-toast";

// ─── Types ───────────────────────────────────────────────────────────
type PhieuNhap = {
  id: number;
  ma_phieu: string;
  trang_thai: string;
  nha_cung_cap?: { ten_ncc: string };
  chi_tiet?: any[];
  tong_so_luong?: number;
  ngay_tao?: string;
};

type TonKhoItem = {
  id: number;
  ma_lo: string;
  san_pham: string;
  bien_the?: string;
  so_luong_ton: number;
  don_vi: string;
  vi_tri: string;
  han_su_dung: string;
  days_left: number | null;
  trang_thai_hsd: "GOOD" | "WARNING" | "EXPIRED";
};

type BienThe = { id: number; ten_bien_the: string; ma_sku: string };

// ─── Status badge ─────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  CHO_GIAO_HANG: { label: "Chờ giao hàng", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", dot: "bg-orange-400" },
  CHO_KIEM_TRA:  { label: "Chờ kiểm tra",  color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",   dot: "bg-blue-400" },
  DA_DUYET:      { label: "Đã duyệt",       color: "text-green-700",  bg: "bg-green-50 border-green-200",  dot: "bg-green-500" },
  HOAN_THANH:    { label: "Hoàn thành",     color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200",dot: "bg-emerald-500" },
  DA_HUY:        { label: "Đã hủy",         color: "text-red-700",    bg: "bg-red-50 border-red-200",     dot: "bg-red-400" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, color: "text-gray-600", bg: "bg-gray-50 border-gray-200", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s.bg} ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── HSD badge ────────────────────────────────────────────────────────
function HsdBadge({ days }: { days: number | null }) {
  if (days === null) return <span className="text-xs text-gray-400">—</span>;
  if (days < 0) return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><AlertTriangle size={10} />Hết hạn</span>;
  if (days <= 3) return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><AlertTriangle size={10} />{days} ngày</span>;
  if (days <= 7) return <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full"><AlertCircle size={10} />{days} ngày</span>;
  return <span className="text-xs font-medium text-emerald-600">{days} ngày</span>;
}

// ─── PrintModal (in QR phiếu đã duyệt) ───────────────────────────────
function PrintModal({ phieuId, onClose }: { phieuId: number; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/admin/warehouse/import/${phieuId}/review`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [phieuId]);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Phiếu nhập kho</title>
      <style>body{font-family:monospace;font-size:12px;margin:0;padding:0}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:16px}.qr-card{border:1px solid #ccc;border-radius:6px;padding:8px;text-align:center;break-inside:avoid}.qr-img{width:120px;height:120px}.info{font-size:10px;margin-top:4px;line-height:1.4}h2{text-align:center;margin:12px 0 4px}.header-info{text-align:center;font-size:11px;color:#555}@media print{body{-webkit-print-color-adjust:exact}}</style></head>
      <body>${content}</body></html>`);
    win.document.close(); win.focus(); win.print(); win.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Printer size={16} className="text-emerald-600" /> In phiếu nhập & QR Code</h3>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5">
              <Printer size={13} /> In ngay
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={15} className="text-gray-400" /></button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-emerald-500" /></div>
          ) : data?.qrItems ? (
            <div ref={printRef}>
              <h2>PHIẾU NHẬP KHO — {data.phieu?.ma_phieu}</h2>
              <div className="header-info">NCC: {data.phieu?.ncc} • SP: {data.phieu?.san_pham} • HSD: {data.phieu?.han_su_dung} • SL: {data.total} thùng</div>
              <div className="grid">
                {data.qrItems.map((item: any, i: number) => (
                  <div key={i} className="qr-card">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(item.qr)}`} alt={item.qr} className="qr-img" />
                    <div className="info">
                      <div><strong>{item.ma_lo}</strong></div>
                      <div>{item.san_pham}</div>
                      <div>HSD: {item.han_su_dung}</div>
                      <div>Vị trí: {item.vi_tri}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-10 text-sm">Phiếu chưa được duyệt hoặc chưa có QR code.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ReceiveModal (nhân viên xác nhận nhận hàng) ──────────────────────
function ReceiveModal({ phieu, onClose, onDone }: { phieu: PhieuNhap; onClose: () => void; onDone: () => void }) {
  const chiTiet = phieu.chi_tiet?.[0];
  const soLuongYC = chiTiet?.so_luong_yeu_cau ?? phieu.tong_so_luong ?? 0;
  const [soLuong, setSoLuong] = useState(String(soLuongYC));
  const [ghiChu, setGhiChu] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const chenh = soLuongYC > 0 ? Math.abs((Number(soLuong) - soLuongYC) / soLuongYC) * 100 : 0;

  const handle = async () => {
    if (!soLuong || Number(soLuong) < 0) { setError("Vui lòng nhập số lượng thực nhận"); return; }
    setSubmitting(true); setError("");
    try {
      const res = await fetch(`/api/admin/warehouse/import/${phieu.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "receive", so_luong_thuc_nhan: Number(soLuong), ghi_chu_kiem_tra: ghiChu }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Có lỗi xảy ra"); return; }
      onDone();
    } catch { setError("Lỗi kết nối"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Inbox size={15} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Xác nhận nhận hàng</h3>
              <p className="text-xs text-gray-400">Phiếu {phieu.ma_phieu}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
            <X size={15} className="text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Thông tin phiếu */}
          <div className="bg-gray-50 rounded-xl p-3.5 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Nhà cung cấp</span>
              <span className="font-semibold text-gray-800">{phieu.nha_cung_cap?.ten_ncc || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sản phẩm</span>
              <span className="font-semibold text-gray-800">{chiTiet?.bien_the_san_pham?.ten_bien_the || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Số lượng yêu cầu</span>
              <span className="font-bold text-gray-800">{soLuongYC} thùng</span>
            </div>
          </div>

          {/* Số lượng thực nhận */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Số lượng thực nhận <span className="text-red-500">*</span>
            </label>
            <input
              type="number" min={0} value={soLuong}
              onChange={e => { const v = e.target.value.replace(/^-/, ''); setSoLuong(v); }}
              onKeyDown={e => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-gray-50"
            />
            {chenh > 0 && (
              <div className={`mt-1.5 text-xs flex items-center gap-1.5 font-medium ${chenh > 5 ? "text-red-600" : "text-amber-600"}`}>
                <AlertTriangle size={11} />
                Chênh lệch {chenh.toFixed(1)}% {chenh > 5 ? "— cần báo cáo với quản lý" : "— trong mức cho phép"}
              </div>
            )}
          </div>

          {/* Ghi chú */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Ghi chú kiểm tra</label>
            <textarea
              rows={2} value={ghiChu}
              onChange={e => setGhiChu(e.target.value)}
              placeholder="Chất lượng, bao bì, hình ảnh đính kèm..."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-gray-50 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
              <AlertTriangle size={12} /> {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Huỷ
          </button>
          <button onClick={handle} disabled={submitting}
            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Xác nhận nhận hàng
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────
export default function StaffWarehousePage() {
  const [activeTab, setActiveTab] = useState("TON_KHO");

  // Tồn kho
  const [tonKho, setTonKho] = useState<TonKhoItem[]>([]);
  const [loadingTon, setLoadingTon] = useState(false);
  const [searchTon, setSearchTon] = useState("");

  // Phiếu nhập
  const [phieus, setPhieus] = useState<PhieuNhap[]>([]);
  const [loadingPhieu, setLoadingPhieu] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [receiveModal, setReceiveModal] = useState<PhieuNhap | null>(null);
  const [printPhieuId, setPrintPhieuId] = useState<number | null>(null);

  // Xuất kho
  const [bienTheList, setBienTheList] = useState<BienThe[]>([]);
  const [xuatMode, setXuatMode] = useState<"MANUAL" | "QR">("MANUAL");
  const [xuatForm, setXuatForm] = useState({ ma_bien_the: "", so_luong: "" });
  const [xuatSuggestions, setXuatSuggestions] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [xuatDone, setXuatDone] = useState<string | null>(null);

  // Alerts badge
  const [alertCount, setAlertCount] = useState(0);

  // ─── Loaders ────────────────────────────────────────────────────────
  const loadTonKho = useCallback(async () => {
    setLoadingTon(true);
    try {
      const res = await fetch("/api/admin/warehouse/inventory");
      const d = await res.json();
      // Flatten lô hàng từ inventory
      const items: TonKhoItem[] = [];
      (d.data || d.inventory || d.items || []).forEach((product: any) => {
        (product.bien_the_san_pham || []).forEach((variant: any) => {
          (variant.lo_hang || []).forEach((lo: any) => {
            const tonKhoTong = lo.ton_kho_tong || [];
            const soLuongTon = tonKhoTong.reduce((a: number, t: any) => a + (t.so_luong || t.so_luong_ton || 0), 0);
            if (soLuongTon <= 0) return;

            const hsd = lo.han_su_dung ? new Date(lo.han_su_dung) : null;
            const daysLeft = hsd ? Math.floor((hsd.getTime() - Date.now()) / 86400000) : null;
            const viTri = tonKhoTong
              .map((t: any) => {
                const vt = t.vi_tri_kho;
                return vt ? [vt.khu_vuc, vt.day, vt.ke, vt.tang].filter(Boolean).join("-") : "";
              })
              .filter(Boolean)
              .join(", ");

            items.push({
              id: lo.id,
              ma_lo: lo.ma_lo_hang || `LO-${lo.id}`,
              san_pham: product.ten_san_pham || "—",
              bien_the: variant.ten_bien_the || product.ten_san_pham,
              so_luong_ton: soLuongTon,
              don_vi: variant.don_vi_tinh || "thùng",
              vi_tri: viTri || "—",
              han_su_dung: hsd ? hsd.toLocaleDateString("vi-VN") : "—",
              days_left: daysLeft,
              trang_thai_hsd: daysLeft === null ? "GOOD" : daysLeft <= 0 ? "EXPIRED" : daysLeft <= 7 ? "WARNING" : "GOOD",
            });
          });
        });
      });
      setTonKho(items);
    } catch { setTonKho([]); }
    finally { setLoadingTon(false); }
  }, []);

  const loadPhieus = useCallback(async () => {
    setLoadingPhieu(true);
    try {
      const res = await fetch("/api/admin/warehouse/import?status=all&limit=50");
      const d = await res.json();
      setPhieus(d.phieus || []);
    } catch { setPhieus([]); }
    finally { setLoadingPhieu(false); }
  }, []);

  const loadBienThe = useCallback(async () => {
    if (bienTheList.length > 0) return;
    try {
      const res = await fetch("/api/admin/products?limit=200");
      const d = await res.json();
      const variants: BienThe[] = [];
      (d.products || d.data || d.items || []).forEach((p: any) => {
        (p.bien_the_san_pham || []).forEach((bt: any) => {
          variants.push({ id: bt.id, ten_bien_the: bt.ten_bien_the || p.ten_san_pham, ma_sku: bt.ma_sku || "" });
        });
      });
      setBienTheList(variants);
    } catch {}
  }, [bienTheList.length]);

  const loadAlertCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/warehouse/alerts?filter=action-needed");
      const d = await res.json();
      setAlertCount(d.items?.length || 0);
    } catch {}
  }, []);

  useEffect(() => {
    loadAlertCount();
    loadTonKho();
  }, []);

  useEffect(() => {
    if (activeTab === "NHAP_KHO") loadPhieus();
    if (activeTab === "XUAT_KHO") loadBienThe();
  }, [activeTab]);

  // ─── Xuất kho logic ─────────────────────────────────────────────────
  const handleSuggestFefo = async () => {
    if (!xuatForm.ma_bien_the || !xuatForm.so_luong) return;
    setIsSuggesting(true);
    try {
      const res = await fetch(`/api/admin/warehouse/issue?ma_bien_the=${xuatForm.ma_bien_the}&so_luong=${xuatForm.so_luong}`);
      const json = await res.json();
      setXuatSuggestions(json.lo_list || []);
      if (json.thieu > 0) toast.error(`Kho không đủ hàng — thiếu ${json.thieu} kiện`);
    } catch {}
    finally { setIsSuggesting(false); }
  };

  const handleExportSubmit = async () => {
    setIsExporting(true);
    setXuatDone(null);
    try {
      const body = xuatMode === "QR"
        ? { mode: "qr", qrCode: qrCodeData }
        : { mode: "manual", ma_bien_the: xuatForm.ma_bien_the, so_luong: Number(xuatForm.so_luong), force_partial: true };

      const res = await fetch("/api/admin/warehouse/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok) {
        setXuatDone(json.message || "Xuất kho thành công!");
        setXuatForm({ ma_bien_the: "", so_luong: "" });
        setXuatSuggestions([]);
        setQrCodeData("");
        loadTonKho();
      } else {
        toast.error(json.error || "Lỗi xuất kho");
      }
    } catch { toast.error("Lỗi kết nối"); }
    finally { setIsExporting(false); }
  };

  // ─── Derived ────────────────────────────────────────────────────────
  const filteredTon = tonKho.filter(item =>
    !searchTon || item.ma_lo.toLowerCase().includes(searchTon.toLowerCase()) ||
    item.san_pham.toLowerCase().includes(searchTon.toLowerCase())
  );

  const filteredPhieus = phieus.filter(p =>
    filterStatus === "all" || p.trang_thai === filterStatus
  );

  const pendingCount = phieus.filter(p => ["CHO_GIAO_HANG", "CHO_KIEM_TRA"].includes(p.trang_thai)).length;

  // ─── formOptions cho PurchaseOrderCreation ──────────────────────────
  const [formOptions, setFormOptions] = useState<any>({ ncc: [], sp: [] });
  useEffect(() => {
    if (activeTab !== "NHAP_KHO") return;
    Promise.all([
      fetch("/api/admin/ncc?limit=100").then(r => r.json()),
      fetch("/api/admin/products?limit=200").then(r => r.json()),
    ]).then(([nccData, spData]) => {
      const ncc = (nccData.data || []).map((n: any) => ({ id: n.id, name: n.ten_ncc }));
      const sp: any[] = [];
      (spData.products || spData.data || []).forEach((p: any) => {
        (p.bien_the_san_pham || []).forEach((bt: any) => {
          sp.push({ id: bt.id, name: bt.ten_bien_the || p.ten_san_pham });
        });
      });
      setFormOptions({ ncc, sp });
    }).catch(() => {});
  }, [activeTab]);

  // ─── Tabs config ────────────────────────────────────────────────────
  const TABS = [
    { key: "TON_KHO",   label: "Tồn Kho",      Icon: Boxes },
    { key: "NHAP_KHO",  label: "Nhập Kho",      Icon: FileInput,       badge: pendingCount },
    { key: "XUAT_KHO",  label: "Xuất Kho",      Icon: ArrowUpFromLine },
    { key: "CANH_BAO",  label: "Cảnh Báo",      Icon: AlertTriangle,   badge: alertCount, danger: true },
    { key: "SO_DO_KHO", label: "Sơ Đồ Kho",     Icon: Warehouse },
    { key: "LICH_SU",   label: "Lịch Sử",       Icon: Clock },
  ];

  return (
    <div className="space-y-5">
      {/* Modals */}
      {receiveModal && (
        <ReceiveModal
          phieu={receiveModal}
          onClose={() => setReceiveModal(null)}
          onDone={() => { setReceiveModal(null); loadPhieus(); }}
        />
      )}
      {printPhieuId && <PrintModal phieuId={printPhieuId} onClose={() => setPrintPhieuId(null)} />}

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        {TABS.map(({ key, label, Icon, badge, danger }) => {
          const isActive = activeTab === key;
          return (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap
                ${isActive
                  ? danger ? "bg-red-600 text-white shadow-sm" : "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
              <Icon size={15} className={isActive ? "text-white" : danger ? "text-red-500" : "text-slate-400"} />
              {label}
              {badge && badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center
                  ${isActive ? "bg-white/25 text-white" : danger ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"}`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* CẢNH BÁO */}
      {activeTab === "CANH_BAO" && (
        <ExpirationWarnings />
      )}

      {/* ── Tab Content ── */}
      {activeTab !== "CANH_BAO" && (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

        {/* TỒN KHO */}
        {activeTab === "TON_KHO" && (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-800">Danh sách lô hàng</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {tonKho.length} lô · {tonKho.filter(t => t.trang_thai_hsd === "WARNING").length} sắp hết hạn
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" value={searchTon}
                    onChange={e => setSearchTon(e.target.value)}
                    placeholder="Tìm mã lô, sản phẩm..."
                    className="pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50 w-52"
                  />
                </div>
                <button onClick={loadTonKho} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors">
                  <RefreshCw size={14} className={loadingTon ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Summary chips */}
            <div className="flex gap-3 mb-5">
              {[
                { label: "Tổng lô", value: tonKho.length, color: "bg-slate-50 text-slate-700 border-slate-200" },
                { label: "Còn hạn", value: tonKho.filter(t => t.trang_thai_hsd === "GOOD").length, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                { label: "Cảnh báo", value: tonKho.filter(t => t.trang_thai_hsd === "WARNING").length, color: "bg-orange-50 text-orange-700 border-orange-200" },
                { label: "Hết hạn", value: tonKho.filter(t => t.trang_thai_hsd === "EXPIRED").length, color: "bg-red-50 text-red-700 border-red-200" },
              ].map(c => (
                <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${c.color}`}>
                  {c.label}: <span className="font-bold">{c.value}</span>
                </div>
              ))}
            </div>

            {/* Table */}
            {loadingTon ? (
              <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Đang tải dữ liệu kho...</span>
              </div>
            ) : filteredTon.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Boxes size={32} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">Chưa có dữ liệu tồn kho</p>
                <p className="text-xs mt-1">Nhập kho để bắt đầu quản lý lô hàng</p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Mã Lô</th>
                      <th className="px-4 py-3 text-left">Sản phẩm</th>
                      <th className="px-4 py-3 text-right">Tồn</th>
                      <th className="px-4 py-3 text-left">Vị trí</th>
                      <th className="px-4 py-3 text-left">HSD</th>
                      <th className="px-4 py-3 text-center">Còn lại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredTon.map(item => (
                      <tr key={item.id}
                        className={`hover:bg-slate-50/60 transition-colors ${item.trang_thai_hsd === "EXPIRED" ? "bg-red-50/30" : item.trang_thai_hsd === "WARNING" ? "bg-orange-50/20" : ""}`}>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[12px]">{item.ma_lo}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{item.san_pham}</div>
                          {item.bien_the && <div className="text-[11px] text-slate-400">{item.bien_the}</div>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-bold ${item.so_luong_ton === 0 ? "text-red-500" : item.so_luong_ton < 10 ? "text-orange-600" : "text-emerald-600"}`}>
                            {item.so_luong_ton}
                          </span>
                          <span className="text-slate-400 ml-1 text-[11px]">{item.don_vi}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500 text-[12px]">{item.vi_tri}</td>
                        <td className="px-4 py-3 text-slate-600 text-[12px]">{item.han_su_dung}</td>
                        <td className="px-4 py-3 text-center"><HsdBadge days={item.days_left} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* NHẬP KHO */}
        {activeTab === "NHAP_KHO" && (
          <div className="p-6">
            {showCreatePanel ? (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <button onClick={() => setShowCreatePanel(false)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                      <ChevronRight size={16} className="rotate-180" />
                    </button>
                    <div>
                      <h2 className="text-base font-bold text-slate-800">Tạo đơn đặt hàng NCC</h2>
                      <p className="text-xs text-slate-400">Đơn tạo xong sẽ chờ NCC giao hàng</p>
                    </div>
                  </div>
                </div>
                <PurchaseOrderCreation formOptions={formOptions} />
              </div>
            ) : (
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <ClipboardList size={17} className="text-emerald-600" /> Phiếu Nhập Kho
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">{phieus.length} phiếu · {pendingCount} đang xử lý</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={loadPhieus} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors">
                      <RefreshCw size={14} className={loadingPhieu ? "animate-spin" : ""} />
                    </button>
                    <button onClick={() => setShowCreatePanel(true)}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors">
                      <Plus size={14} /> Tạo đơn mới
                    </button>
                  </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { key: "all", label: "Tất cả" },
                    { key: "CHO_GIAO_HANG", label: "Chờ giao hàng" },
                    { key: "CHO_KIEM_TRA", label: "Chờ kiểm tra" },
                    { key: "DA_DUYET", label: "Đã duyệt" },
                    { key: "HOAN_THANH", label: "Hoàn thành" },
                    { key: "DA_HUY", label: "Đã hủy" },
                  ].map(f => (
                    <button key={f.key} onClick={() => setFilterStatus(f.key)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors
                        ${filterStatus === f.key ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"}`}>
                      {f.label}
                      {f.key !== "all" && (
                        <span className="ml-1.5 opacity-70">{phieus.filter(p => p.trang_thai === f.key).length}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Phiếu list */}
                {loadingPhieu ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
                    <Loader2 size={20} className="animate-spin" /><span className="text-sm">Đang tải...</span>
                  </div>
                ) : filteredPhieus.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <ClipboardList size={32} className="mb-3 opacity-30" />
                    <p className="text-sm font-medium">Không có phiếu nào</p>
                    <button onClick={() => setShowCreatePanel(true)}
                      className="mt-4 flex items-center gap-1.5 text-emerald-600 text-sm font-semibold hover:underline">
                      <Plus size={14} /> Tạo đơn đặt hàng đầu tiên
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPhieus.map(p => {
                      const chiTiet = p.chi_tiet?.[0];
                      return (
                        <div key={p.id}
                          className="border border-slate-100 rounded-xl p-4 flex items-center gap-4 hover:border-slate-200 hover:shadow-sm transition-all bg-white">
                          {/* Icon */}
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <FileInput size={16} className="text-emerald-600" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-800 text-[13px] font-mono">{p.ma_phieu}</span>
                              <StatusBadge status={p.trang_thai} />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              <span className="text-slate-600 font-medium">{p.nha_cung_cap?.ten_ncc || "—"}</span>
                              {chiTiet && <> · <span>{chiTiet.bien_the_san_pham?.ten_bien_the || "—"}</span></>}
                              {p.tong_so_luong && <> · <span className="font-medium">{p.tong_so_luong} thùng</span></>}
                              {p.ngay_tao && <> · {new Date(p.ngay_tao).toLocaleDateString("vi-VN")}</>}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-shrink-0">
                            {p.trang_thai === "CHO_GIAO_HANG" && (
                              <button onClick={() => setReceiveModal(p)}
                                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold px-3 py-2 rounded-lg transition-colors">
                                <Inbox size={13} /> Nhận hàng
                              </button>
                            )}
                            {["DA_DUYET", "HOAN_THANH"].includes(p.trang_thai) && (
                              <button onClick={() => setPrintPhieuId(p.id)}
                                className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[12px] font-medium px-3 py-2 rounded-lg transition-colors">
                                <QrCode size={13} /> In QR
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* XUẤT KHO */}
        {activeTab === "XUAT_KHO" && (
          <div className="p-6">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <ArrowUpFromLine size={16} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Xuất Kho</h2>
                <p className="text-xs text-slate-400">Hệ thống tự động gợi ý lô hàng theo nguyên tắc FEFO</p>
              </div>
            </div>

            {/* Link đến trang xuất kho theo đơn */}
            <a href="/staff/warehouse/issue"
              className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5 hover:bg-emerald-100 transition-colors group">
              <div className="flex items-center gap-2.5">
                <Boxes size={16} className="text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Xuất kho theo đơn hàng (FEFO + khoảng cách)</span>
              </div>
              <ChevronRight size={14} className="text-emerald-400 group-hover:text-emerald-600 transition-colors" />
            </a>

            {/* Success banner */}
            {xuatDone && (
              <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5 text-sm text-emerald-700 font-medium">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                {xuatDone}
                <button onClick={() => setXuatDone(null)} className="ml-auto"><X size={14} /></button>
              </div>
            )}

            {/* Mode toggle */}
            <div className="flex gap-2 mb-5">
              {[
                { key: "MANUAL", label: "Chọn thủ công (FEFO)", Icon: PackageOpen },
                { key: "QR", label: "Quét mã QR", Icon: QrCode },
              ].map(m => (
                <button key={m.key} onClick={() => setXuatMode(m.key as any)}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors border
                    ${xuatMode === m.key
                      ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  <m.Icon size={16} /> {m.label}
                </button>
              ))}
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-100 p-5">
              {xuatMode === "MANUAL" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sản phẩm <span className="text-red-500">*</span></label>
                      <select value={xuatForm.ma_bien_the}
                        onChange={e => { setXuatForm(f => ({ ...f, ma_bien_the: e.target.value })); setXuatSuggestions([]); }}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 bg-white appearance-none">
                        <option value="">— Chọn biến thể sản phẩm —</option>
                        {bienTheList.map(bt => <option key={bt.id} value={bt.id}>{bt.ten_bien_the}{bt.ma_sku ? ` (${bt.ma_sku})` : ""}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Số lượng xuất (thùng/kiện) <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                        <input type="number" min={1} value={xuatForm.so_luong}
                          onChange={e => { const v = e.target.value.replace(/^-/, '').replace(/^0+(?=\d)/, ''); setXuatForm(f => ({ ...f, so_luong: v })); setXuatSuggestions([]); }}
                          onKeyDown={e => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                          placeholder="VD: 20"
                          className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 bg-white" />
                        <button onClick={handleSuggestFefo}
                          disabled={isSuggesting || !xuatForm.ma_bien_the || !xuatForm.so_luong}
                          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-40 transition-colors whitespace-nowrap">
                          {isSuggesting ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />}
                          Gợi ý FEFO
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* FEFO suggestions */}
                  {xuatSuggestions.length > 0 && (
                    <div className="bg-white border border-emerald-100 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                        <TrendingDown size={15} className="text-emerald-600" />
                        Gợi ý xuất theo FEFO (lô sắp hết hạn trước)
                      </h3>
                      <div className="space-y-2">
                        {xuatSuggestions.map((s, idx) => (
                          <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${s.la_uu_tien ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-slate-50"}`}>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-sm">{s.ma_lo_hang}</span>
                                {s.la_uu_tien && <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded">ƯU TIÊN</span>}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                HSD: <span className="font-semibold text-red-600">{s.han_su_dung}</span>
                                {s.vi_tri && <> · Vị trí: <span className="font-mono">{s.vi_tri}</span></>}
                                {s.so_luong_ton !== undefined && <> · Tồn: {s.so_luong_ton}</>}
                              </div>
                            </div>
                            <div className="text-right text-sm font-bold text-emerald-700">
                              Xuất {s.so_luong_xuat_goi_y} kiện
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={handleExportSubmit} disabled={isExporting}
                        className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpFromLine size={16} />}
                        Xác nhận xuất kho
                      </button>
                    </div>
                  )}

                  {/* Nút xuất khi chưa có gợi ý */}
                  {xuatSuggestions.length === 0 && xuatForm.ma_bien_the && xuatForm.so_luong && (
                    <p className="text-xs text-slate-400 text-center">
                      Nhấn <strong>"Gợi ý FEFO"</strong> để xem danh sách lô hàng cần xuất trước
                    </p>
                  )}
                </div>
              ) : (
                /* QR mode */
                <div className="max-w-sm mx-auto py-4 space-y-4">
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl aspect-square flex flex-col items-center justify-center text-slate-400 hover:border-amber-300 transition-colors cursor-pointer relative p-8">
                    <QrCode size={56} className="mb-4 opacity-30" />
                    <p className="text-sm font-medium text-center">Đưa mã QR vào camera<br />hoặc nhập thủ công bên dưới</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mã QR kiện hàng</label>
                    <input
                      type="text" value={qrCodeData}
                      onChange={e => setQrCodeData(e.target.value)}
                      placeholder="Quét hoặc nhập mã vạch..."
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 bg-white font-mono"
                    />
                  </div>
                  <button onClick={handleExportSubmit}
                    disabled={isExporting || !qrCodeData}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                    {isExporting ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
                    Xử lý xuất QR này
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SƠ ĐỒ KHO */}
        {activeTab === "SO_DO_KHO" && (
          <div className="p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                <Warehouse size={16} className="text-slate-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Sơ Đồ Kho Hàng</h2>
                <p className="text-xs text-slate-400">Xem trực quan vị trí các lô hàng trong kho</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
              <WarehouseMapView readOnly />
            </div>
          </div>
        )}

        {/* LỊCH SỬ */}
        {activeTab === "LICH_SU" && (
          <div className="p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                <Clock size={16} className="text-slate-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Lịch Sử Nhập / Xuất</h2>
                <p className="text-xs text-slate-400">Toàn bộ giao dịch kho trong hệ thống</p>
              </div>
            </div>
            <IssueHistory />
          </div>
        )}
      </div>
      )}
    </div>
  );
}
