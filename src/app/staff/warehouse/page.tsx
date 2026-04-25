"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  PackageOpen,
  AlertTriangle,
  FileInput,
  Plus,
  QrCode,
  Camera,
  X,
  Upload,
  ImagePlus,
  Loader2,
  CheckCircle2,
  Trash2,
  ShoppingBag,
  ClipboardList,
  RefreshCw,
  Send,
  ChevronDown,
  ArrowUpFromLine,
  Warehouse,
  Clock,
  ScanLine,
  Inbox,
} from "lucide-react";

import WarehouseMapView from "@/components/admin/warehouse/WarehouseMapView";
import IssueHistory from "@/components/admin/warehouse/IssueHistory";

// ─── Types ──────────────────────────────────────────────────────────────
type AlertItem = {
  id: number;
  ma_lo: string;
  san_pham: string;
  so_luong: number;
  vi_tri: string;
  han_su_dung: string;
  days_left: number | null;
  loai_canh_bao: string;
};

type ProposeModal = {
  alertItem: AlertItem;
  actionType: "TIEU_HUY" | "XA_KHO";
  actionText: string;
};

type NCC = { id: number; ten_ncc: string };
type BienThe = { id: number; ten_bien_the: string; ma_sku: string };
type PhieuNhap = {
  id: number;
  ma_phieu: string;
  ncc_ten: string;
  trang_thai: string;
  ngay_tao: string;
  tong_san_pham: number;
  tong_so_luong: number;
};

// ─── Status badge ────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    CHO_GIAO_HANG: { label: "Chờ Giao Hàng", cls: "bg-orange-100 text-orange-700" },
    CHO_DUYET: { label: "Chờ Duyệt", cls: "bg-amber-100 text-amber-700" },
    CHO_KIEM_TRA: { label: "Chờ Kiểm Tra", cls: "bg-blue-100 text-blue-700" },
    DA_DUYET: { label: "Đã Duyệt", cls: "bg-green-100 text-green-700" },
    HOAN_THANH: { label: "Hoàn Thành", cls: "bg-emerald-100 text-emerald-700" },
    DA_HUY: { label: "Đã Hủy", cls: "bg-red-100 text-red-700" },
  };
  const s = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function StaffWarehousePage() {
  const [activeTab, setActiveTab] = useState("TON_KHO");

  // --- Alerts state ---
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertCount, setAlertCount] = useState(0);
  const [proposeModal, setProposeModal] = useState<ProposeModal | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // --- Phiếu nhập state ---
  const [phieus, setPhieus] = useState<PhieuNhap[]>([]);
  const [loadingPhieu, setLoadingPhieu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // --- Xuất Kho state ---
  const [xuatMode, setXuatMode] = useState<"MANUAL" | "QR">("MANUAL");
  const [xuatForm, setXuatForm] = useState({ ma_bien_the: "", so_luong: "" });
  const [xuatSuggestions, setXuatSuggestions] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");

  // Form tạo phiếu
  const [nccList, setNccList] = useState<NCC[]>([]);
  const [bienTheList, setBienTheList] = useState<BienThe[]>([]);
  const [form, setForm] = useState({
    ma_ncc: "",
    ma_bien_the: "",
    so_luong_thung: "",
    han_su_dung: "",
    ngay_nhap_kho: new Date().toISOString().slice(0, 10),
    ngay_thu_hoach: "",
    ghi_chu: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createDone, setCreateDone] = useState<{ ma_phieu: string } | null>(null);

  // --- Lịch sử state ---
  const [historyData, setHistoryData] = useState<{ imports: any[], exports: any[] }>({ imports: [], exports: [] });
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ─── Load data ─────────────────────────────────────────────────────────
  const loadAlerts = useCallback(() => {
    fetch("/api/admin/warehouse/alerts?filter=action-needed")
      .then((r) => r.json())
      .then((d) => {
        if (d.items) { setAlerts(d.items); setAlertCount(d.items.length); }
      });
  }, []);

  const loadPhieus = useCallback(() => {
    setLoadingPhieu(true);
    fetch("/api/admin/warehouse/import?status=all")
      .then((r) => r.json())
      .then((d) => { if (d.phieus) setPhieus(d.phieus); })
      .finally(() => setLoadingPhieu(false));
  }, []);

  const loadNCC = useCallback(() => {
    fetch("/api/admin/ncc?limit=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setNccList(d.data.map((n: any) => ({ id: n.id, ten_ncc: n.ten_ncc })));
      });
  }, []);

  const loadBienThe = useCallback(() => {
    fetch("/api/admin/products?limit=200")
      .then((r) => r.json())
      .then((d) => {
        const variants: BienThe[] = [];
        (d.products || d.data || d.items || []).forEach((p: any) => {
          (p.bien_the_san_pham || []).forEach((bt: any) => {
            variants.push({ id: bt.id, ten_bien_the: bt.ten_bien_the || p.ten_san_pham, ma_sku: bt.ma_sku || "" });
          });
        });
        setBienTheList(variants);
      })
      .catch(() => {});
  }, []);

  const loadHistory = useCallback(() => {
    setLoadingHistory(true);
    fetch("/api/admin/warehouse/history")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setHistoryData(d);
      })
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);
  useEffect(() => { 
    if (activeTab === "NHAP_KHO") { loadPhieus(); } 
    if (activeTab === "XUAT_KHO") { loadBienThe(); }
    if (activeTab === "LICH_SU") { loadHistory(); }
  }, [activeTab, loadPhieus, loadBienThe, loadHistory]);

  // ─── Alert propose logic ────────────────────────────────────────────────
  const openModal = (alertItem: AlertItem, actionType: "TIEU_HUY" | "XA_KHO", actionText: string) => {
    setImages([]); setPreviews([]); setNote(""); setSubmitDone(false);
    setProposeModal({ alertItem, actionType, actionText });
  };

  const closeModal = () => {
    if (submitting) return;
    previews.forEach((u) => URL.revokeObjectURL(u));
    setImages([]); setPreviews([]); setNote(""); setSubmitDone(false);
    setProposeModal(null);
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - images.length);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setImages((p) => [...p, ...newFiles]);
    setPreviews((p) => [...p, ...newPreviews]);
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setImages((p) => p.filter((_, i) => i !== idx));
    setPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const handleSubmitPropose = async () => {
    if (!proposeModal) return;
    if (images.length === 0) { alert("Vui lòng chụp hoặc chọn ít nhất 1 ảnh minh chứng!"); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      images.forEach((f) => fd.append("files", f));
      const upRes = await fetch("/api/staff/warehouse/upload", { method: "POST", body: fd });
      if (!upRes.ok) throw new Error("Upload ảnh thất bại");
      const { urls } = await upRes.json();
      const origin = window.location.origin;
      const absoluteUrls = (urls as string[]).map((u) => `${origin}${u}`);
      const proposeRes = await fetch(`/api/staff/warehouse/alerts/${proposeModal.alertItem.id}/propose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: proposeModal.actionType, imageUrls: absoluteUrls, note }),
      });
      if (!proposeRes.ok) throw new Error("Gửi đề xuất thất bại");
      setSubmitDone(true);
      setAlerts((p) => p.filter((a) => a.id !== proposeModal.alertItem.id));
      setAlertCount((p) => Math.max(0, p - 1));
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Staff Receive Goods Logic ─────────────────────────────────────────────────
  const [receiveModal, setReceiveModal] = useState<any>(null);
  const [receiveForm, setReceiveForm] = useState({ so_luong_thuc_nhan: "", ghi_chu: "" });
  
  const openReceiveModal = (phieu: any) => {
    setImages([]); setPreviews([]);
    setReceiveForm({ so_luong_thuc_nhan: phieu.tong_so_luong.toString(), ghi_chu: "" });
    setReceiveModal(phieu);
  };

  const handleReceive = async () => {
    if (!receiveForm.so_luong_thuc_nhan) {
      alert("Vui lòng nhập số lượng thực nhận");
      return;
    }
    setSubmitting(true);
    let finalGhiChu = receiveForm.ghi_chu;

    try {
      if (images.length > 0) {
        const fd = new FormData();
        images.forEach((f) => fd.append("files", f));
        const upRes = await fetch("/api/staff/warehouse/upload", { method: "POST", body: fd });
        if (upRes.ok) {
          const { urls } = await upRes.json();
          finalGhiChu += `\n[Hình ảnh đính kèm: ${urls.join(", ")}]`;
        }
      }

      const res = await fetch(`/api/admin/warehouse/import/${receiveModal.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "receive", 
          so_luong_thuc_nhan: Number(receiveForm.so_luong_thuc_nhan),
          ghi_chu_kiem_tra: finalGhiChu
        }),
      });

      if (!res.ok) throw new Error("Thất bại khi nhận hàng");
      
      setReceiveModal(null);
      loadPhieus();
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Xuất Kho Logic ──────────────────────────────────────────────────────
  const handleSuggestFefo = async () => {
    if (!xuatForm.ma_bien_the || !xuatForm.so_luong) return alert("Vui lòng chọn sản phẩm và nhập số lượng xuất.");
    setIsSuggesting(true);
    try {
      const res = await fetch(`/api/admin/warehouse/issue/suggest?ma_bien_the=${xuatForm.ma_bien_the}&so_luong=${xuatForm.so_luong}`);
      const json = await res.json();
      setXuatSuggestions(json.lo_list || []);
      if (json.thieu > 0) alert(`LƯU Ý: Kho không đủ hàng. Thiếu ${json.thieu} kiện.`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleExportSubmit = async () => {
    if (xuatMode === "QR") {
      if (!qrCodeData) return alert("Vui lòng nhập / quét mã QR");
      setIsExporting(true);
      try {
        const res = await fetch("/api/admin/warehouse/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "qr", qrCode: qrCodeData })
        });
        const json = await res.json();
        if (res.ok) { alert("Xuất kho thành công!"); setQrCodeData(""); }
        else alert(json.error || "Lỗi xuất kho");
      } finally { setIsExporting(false); }
    } else {
      if (!xuatForm.ma_bien_the || !xuatForm.so_luong) return;
      setIsExporting(true);
      try {
        const res = await fetch("/api/admin/warehouse/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "manual", ma_bien_the: xuatForm.ma_bien_the, so_luong: xuatForm.so_luong, force_partial: true })
        });
        const json = await res.json();
        if (res.ok) { alert(json.message || "Xuất kho thành công!"); setXuatForm({ ma_bien_the: "", so_luong: "" }); setXuatSuggestions([]); }
        else alert(json.error || "Lỗi xuất kho");
      } finally { setIsExporting(false); }
    }
  };

  // ─── Tạo Phiếu Nhập Logic ─────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.ma_ncc || !form.ma_bien_the || !form.so_luong_thung || !form.han_su_dung || !form.ngay_nhap_kho) {
      setCreateError("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/admin/warehouse/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ma_ncc: Number(form.ma_ncc),
          ma_bien_the: Number(form.ma_bien_the),
          so_luong_thung: Number(form.so_luong_thung),
          han_su_dung: form.han_su_dung,
          ngay_nhap_kho: form.ngay_nhap_kho,
          ngay_thu_hoach: form.ngay_thu_hoach || undefined,
          ghi_chu: form.ghi_chu || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Tạo phiếu thất bại");
      setCreateDone({ ma_phieu: json.ma_phieu || json.phieu?.ma_phieu || "N/A" });
      loadPhieus();
    } catch (err: any) {
      setCreateError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setCreating(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Tabs ── */}
      <div className="flex space-x-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        {[
          { key: "TON_KHO", label: "Tồn kho tổng", Icon: PackageOpen, activeColor: "bg-blue-600" },
          { key: "NHAP_KHO", label: "Phiếu Nhập", Icon: FileInput, activeColor: "bg-blue-600" },
          { key: "XUAT_KHO", label: "Xuất Kho", Icon: ArrowUpFromLine, activeColor: "bg-amber-600" },
          { key: "CANH_BAO", label: "Cảnh Báo HSD", Icon: AlertTriangle, activeColor: "bg-red-600" },
          { key: "SO_DO_KHO", label: "Sơ Đồ Kho", Icon: Warehouse, activeColor: "bg-emerald-600" },
          { key: "LICH_SU", label: "Lịch sử", Icon: Clock, activeColor: "bg-blue-600" },
        ].map(({ key, label, Icon, activeColor }) => {
          const isActive = activeTab === key;
          return (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive ? `${activeColor} text-white shadow-md` : "text-gray-600 hover:bg-gray-50"}`}>
              <Icon size={18} className={isActive ? "text-white" : key === "CANH_BAO" ? "text-red-500" : key === "NHAP_KHO" ? "text-green-500" : key === "XUAT_KHO" ? "text-amber-500" : key === "SO_DO_KHO" ? "text-emerald-500" : "text-blue-500"} />
              {label}
              {key === "CANH_BAO" && alertCount > 0 && (
                <span className={`ml-1 text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"}`}>{alertCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

        {/* TỒN KHO */}
        {activeTab === "TON_KHO" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Danh Sách Lô Hàng</h2>
              <input type="text" placeholder="Tra cứu tên sản phẩm, mã lô..." className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50" />
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-4 py-3">Mã Lô</th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Số Lượng CÒN</th>
                  <th className="px-4 py-3">Vị trí</th>
                  <th className="px-4 py-3">HSD (Còn lại)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">LO-RM-001</td><td className="px-4 py-3">Rau muống thủy canh</td><td className="px-4 py-3 font-bold text-blue-600">80 bó</td><td className="px-4 py-3 font-mono text-gray-600">A-D1-K1</td><td className="px-4 py-3 text-green-600 font-medium">10 ngày</td></tr>
                <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">LO-DT-002</td><td className="px-4 py-3">Dâu Tây Đà Lạt</td><td className="px-4 py-3 font-bold text-amber-600">15 hộp</td><td className="px-4 py-3 font-mono text-gray-600">B-D2-K1</td><td className="px-4 py-3 text-red-600 font-medium whitespace-nowrap"><AlertTriangle size={14} className="inline mr-1" />2 ngày</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {/* NHẬP KHO */}
        {activeTab === "NHAP_KHO" && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ClipboardList size={20} className="text-blue-600" />
                Danh sách Phiếu Nhập
              </h2>
              <div className="flex gap-2">
                <button onClick={loadPhieus} className="flex items-center gap-1.5 border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <RefreshCw size={15} /> Làm mới
                </button>
              </div>
            </div>

            {/* Phiếu list */}
            {loadingPhieu ? (
              <div className="flex justify-center py-10">
                <Loader2 size={24} className="animate-spin text-blue-500" />
              </div>
            ) : phieus.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <ClipboardList size={40} className="mb-3 opacity-40" />
                <p className="text-sm">Chưa có đơn đặt hàng nào cần tiếp nhận.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {phieus.map((p) => (
                  <div key={p.id} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:shadow-sm transition-shadow">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800 text-sm">{p.ma_phieu}</span>
                        <StatusBadge status={p.trang_thai} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        NCC: <span className="font-medium text-gray-700">{p.ncc_ten}</span>
                        {" "}• {p.tong_so_luong} thùng
                        {" "}• {p.ngay_tao ? new Date(p.ngay_tao).toLocaleDateString("vi-VN") : ""}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {p.trang_thai === "CHO_GIAO_HANG" && (
                        <button onClick={() => openReceiveModal(p)}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                          <Inbox size={13} /> Nhận hàng
                        </button>
                      )}
                      {p.trang_thai === "DA_DUYET" && (
                        <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                          <QrCode size={13} /> In Mã QR
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CẢNH BÁO */}
        {activeTab === "CANH_BAO" && (
          <div>
            <h2 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-4">
              <AlertTriangle size={24} /> Các lô hàng sắp hỏng / Hết hạn
            </h2>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <CheckCircle2 size={40} className="text-green-400 mb-3" />
                  <p className="text-sm font-medium text-gray-500">Không có lô hàng nào cần xử lý.</p>
                </div>
              ) : (
                alerts.map((alertItem) => {
                  const isExpired = alertItem.days_left !== null && alertItem.days_left <= 0;
                  const isSoon = alertItem.days_left !== null && alertItem.days_left > 0 && alertItem.days_left <= 3;
                  const isDestroyAction = isExpired || isSoon;
                  const boxClass = isDestroyAction ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50";
                  const titleClass = isDestroyAction ? "text-red-800" : "text-amber-800";
                  const textClass = isDestroyAction ? "text-red-600" : "text-amber-700";
                  const btnClass = isDestroyAction ? "bg-red-600 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600";
                  const actionText = isDestroyAction ? "Đề xuất Tiêu Hủy" : "Đề xuất Xả Kho (-50%)";
                  const actionType = isDestroyAction ? "TIEU_HUY" : "XA_KHO" as "TIEU_HUY" | "XA_KHO";
                  const Icon = isDestroyAction ? Trash2 : ShoppingBag;
                  return (
                    <div key={alertItem.id} className={`border ${boxClass} p-4 rounded-xl`}>
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold ${titleClass} truncate`}>{alertItem.san_pham} • Mã Lô: {alertItem.ma_lo}</h3>
                          <p className={`text-sm ${textClass} mt-1`}>
                            {isExpired ? `ĐÃ HẾT HẠN (Quá ${Math.abs(alertItem.days_left!)} ngày)` : alertItem.days_left !== null ? `Còn ${alertItem.days_left} ngày sử dụng` : "Không xác định HSD"}
                            {" "}• Tồn: {alertItem.so_luong} • {alertItem.vi_tri}
                          </p>
                        </div>
                        <button onClick={() => openModal(alertItem, actionType, actionText)}
                          className={`flex items-center gap-1.5 ${btnClass} text-white font-bold py-2 px-3 rounded-lg text-xs shadow-md transition-all whitespace-nowrap`}>
                          <Icon size={14} /> {actionText}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* XUẤT KHO */}
        {activeTab === "XUAT_KHO" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <ArrowUpFromLine size={24} className="text-amber-600" />
              Tiến Hành Xuất Kho
            </h2>

            {/* Mode selection toggle */}
            <div className="flex gap-2">
              <button onClick={() => setXuatMode("MANUAL")}
                className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${xuatMode === "MANUAL" ? "bg-amber-600 text-white shadow-md" : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"}`}>
                <PackageOpen size={18} /> Lấy hàng thủ công (FEFO)
              </button>
              <button onClick={() => setXuatMode("QR")}
                className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${xuatMode === "QR" ? "bg-amber-600 text-white shadow-md" : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"}`}>
                <QrCode size={18} /> Quét mã QR
              </button>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5">
              {xuatMode === "MANUAL" ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chọn Sản Phẩm <span className="text-red-500">*</span></label>
                      <select value={xuatForm.ma_bien_the} onChange={(e) => setXuatForm({ ...xuatForm, ma_bien_the: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white">
                        <option value="">-- Chọn biến thể sản phẩm --</option>
                        {bienTheList.map((bt) => <option key={bt.id} value={bt.id}>{bt.ten_bien_the} {bt.ma_sku ? `(${bt.ma_sku})` : ""}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số Lượng Cần Xuất (kiện/thùng) <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                        <input type="number" min={1} value={xuatForm.so_luong} onChange={(e) => setXuatForm({ ...xuatForm, so_luong: e.target.value })}
                          placeholder="VD: 50"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white" />
                        <button onClick={handleSuggestFefo} disabled={isSuggesting}
                          className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 flex items-center justify-center gap-2 rounded-xl text-sm font-bold min-w-[120px] shadow-sm disabled:opacity-50">
                          {isSuggesting ? <Loader2 size={16} className="animate-spin" /> : "Gợi ý kho"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {xuatSuggestions.length > 0 && (
                     <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm">
                       <h3 className="font-bold text-emerald-800 flex items-center gap-2 mb-3">
                         <CheckCircle2 size={18} className="text-emerald-500" />
                         Các lô hàng ưu tiên xuất (FEFO chuẩn)
                       </h3>
                       <div className="space-y-3">
                         {xuatSuggestions.map((s, idx) => (
                           <div key={idx} className={`p-3 rounded-lg border ${s.la_uu_tien ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-gray-50"}`}>
                             <div className="flex justify-between items-start">
                               <div>
                                 <div className="font-bold text-gray-800">{s.ma_lo_hang}</div>
                                 <div className="text-xs text-gray-600 mt-1">HSD: <span className="font-medium text-red-600">{s.han_su_dung}</span> • Vị trí: <span className="font-mono">{s.vi_tri}</span></div>
                               </div>
                               <div className="text-right">
                                 <div className="text-sm font-bold text-emerald-700">Lấy {s.so_luong_xuat_goi_y} kiện</div>
                                 <div className="text-xs text-gray-400">Tồn ở vị trí: {s.so_luong_ton}</div>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                       <button onClick={handleExportSubmit} disabled={isExporting}
                         className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-md flex justify-center items-center gap-2 transition-colors disabled:opacity-50">
                         {isExporting ? <Loader2 size={18} className="animate-spin" /> : <><ArrowUpFromLine size={18} /> Xác Nhận Xuất Kho Ngay</>}
                       </button>
                     </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 max-w-md mx-auto py-4">
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl aspect-square flex flex-col items-center justify-center text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors mx-8 cursor-pointer relative">
                     <QrCode size={64} className="mb-4 opacity-50" />
                     <p className="font-medium">Giả lập: Nhập dữ liệu mã vạch vào đây</p>
                     <input type="text" value={qrCodeData} onChange={e => setQrCodeData(e.target.value)} placeholder="Nhập mã QR của thủ kho..."
                        className="absolute bottom-6 w-3/4 px-4 py-2 border border-gray-300 rounded-lg text-sm text-center text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-sm" />
                  </div>
                  <button onClick={handleExportSubmit} disabled={isExporting}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl shadow-md flex justify-center items-center gap-2 transition-colors disabled:opacity-50">
                    {isExporting ? <Loader2 size={18} className="animate-spin" /> : <><ScanLine size={18} /> Xử Lý Xuất Mã Này</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SƠ ĐỒ KHO */}
        {activeTab === "SO_DO_KHO" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2">
              <Warehouse size={22} className="text-emerald-600" /> Bản Đồ Kho Hàng
            </h2>
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50/50 p-2 lg:p-4">
              <WarehouseMapView />
            </div>
          </div>
        )}

        {/* LỊCH SỬ */}
        {activeTab === "LICH_SU" && (
          <div className="space-y-4">
            {loadingHistory ? (
              <div className="flex justify-center py-10">
                <Loader2 size={24} className="animate-spin text-blue-500" />
              </div>
            ) : (
              <IssueHistory historyData={historyData.exports} importHistoryData={historyData.imports} />
            )}
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════
          MODAL TẠO PHIẾU NHẬP
      ═════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-blue-600 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <FileInput size={22} className="text-white" />
                <div>
                  <h3 className="font-bold text-white text-lg">Tạo Phiếu Nhập Kho</h3>
                  <p className="text-blue-100 text-xs">Điền đầy đủ thông tin, Admin sẽ kiểm tra và duyệt</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white"><X size={24} /></button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6">
              {createDone ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <CheckCircle2 size={56} className="text-green-500 mb-4" />
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Tạo phiếu thành công!</h4>
                  <p className="text-sm text-gray-500 text-center mb-1">Mã phiếu: <span className="font-bold text-blue-600">{createDone.ma_phieu}</span></p>
                  <p className="text-sm text-gray-500 text-center">Nhấn <strong>Nộp phiếu</strong> trong danh sách để gửi Admin kiểm tra.</p>
                  <button onClick={() => { setShowCreateModal(false); setActiveTab("NHAP_KHO"); }}
                    className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors">
                    Xem danh sách phiếu
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {createError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                      {createError}
                    </div>
                  )}

                  {/* NCC */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Nhà Cung Cấp <span className="text-red-500">*</span>
                    </label>
                    <select value={form.ma_ncc} onChange={(e) => setForm({ ...form, ma_ncc: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 appearance-none">
                      <option value="">-- Chọn nhà cung cấp --</option>
                      {nccList.map((n) => <option key={n.id} value={n.id}>{n.ten_ncc}</option>)}
                    </select>
                  </div>

                  {/* Biến thể sản phẩm */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Sản Phẩm / Biến Thể <span className="text-red-500">*</span>
                    </label>
                    <select value={form.ma_bien_the} onChange={(e) => setForm({ ...form, ma_bien_the: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 appearance-none">
                      <option value="">-- Chọn sản phẩm --</option>
                      {bienTheList.map((bt) => <option key={bt.id} value={bt.id}>{bt.ten_bien_the}{bt.ma_sku ? ` (${bt.ma_sku})` : ""}</option>)}
                    </select>
                    {bienTheList.length === 0 && (
                      <p className="text-xs text-gray-400 mt-1">Không tải được danh sách sản phẩm</p>
                    )}
                  </div>

                  {/* Số lượng */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Số Lượng (thùng) <span className="text-red-500">*</span>
                    </label>
                    <input type="number" min={1} value={form.so_luong_thung}
                      onChange={(e) => setForm({ ...form, so_luong_thung: e.target.value })}
                      placeholder="VD: 100"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                  </div>

                  {/* Ngày nhập kho & HSD */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Ngày Nhập Kho <span className="text-red-500">*</span>
                      </label>
                      <input type="date" value={form.ngay_nhap_kho}
                        onChange={(e) => setForm({ ...form, ngay_nhap_kho: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Hạn Sử Dụng <span className="text-red-500">*</span>
                      </label>
                      <input type="date" value={form.han_su_dung}
                        onChange={(e) => setForm({ ...form, han_su_dung: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                    </div>
                  </div>

                  {/* Ngày thu hoạch (tuỳ chọn) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ngày Thu Hoạch (tuỳ chọn)</label>
                    <input type="date" value={form.ngay_thu_hoach}
                      onChange={(e) => setForm({ ...form, ngay_thu_hoach: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!createDone && (
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
                <button onClick={() => setShowCreateModal(false)} disabled={creating}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Huỷ
                </button>
                <button onClick={handleCreate} disabled={creating}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {creating ? <><Loader2 size={16} className="animate-spin" /> Đang tạo...</> : <><Plus size={16} /> Tạo Phiếu</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════
          MODAL ĐỀ XUẤT + UPLOAD ẢNH
      ═════════════════════════════════════ */}
      {proposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className={`px-6 py-4 flex items-center justify-between ${proposeModal.actionType === "TIEU_HUY" ? "bg-red-600" : "bg-amber-500"}`}>
              <div className="flex items-center gap-3">
                {proposeModal.actionType === "TIEU_HUY" ? <Trash2 size={22} className="text-white" /> : <ShoppingBag size={22} className="text-white" />}
                <div>
                  <h3 className="font-bold text-white text-lg">{proposeModal.actionText}</h3>
                  <p className="text-white/80 text-sm">{proposeModal.alertItem.san_pham} • {proposeModal.alertItem.ma_lo}</p>
                </div>
              </div>
              <button onClick={closeModal} disabled={submitting} className="text-white/80 hover:text-white"><X size={24} /></button>
            </div>
            {submitDone ? (
              <div className="flex flex-col items-center justify-center py-14 px-6">
                <CheckCircle2 size={56} className="text-green-500 mb-4" />
                <h4 className="text-xl font-bold text-gray-800 mb-2">Đề xuất đã được gửi!</h4>
                <p className="text-sm text-gray-500 text-center">Admin sẽ xem và duyệt đề xuất của bạn. Cảm ơn!</p>
                <button onClick={closeModal} className="mt-6 bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-700">Đóng</button>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">📸 Ảnh minh chứng <span className="text-red-500">*</span> <span className="ml-1 text-xs font-normal text-gray-400">(Tối đa 5 ảnh)</span></p>
                  {previews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {previews.map((src, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5"><X size={12} /></button>
                        </div>
                      ))}
                      {previews.length < 5 && (
                        <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-400 hover:text-blue-400 flex items-center justify-center transition-colors">
                          <ImagePlus size={24} />
                        </button>
                      )}
                    </div>
                  )}
                  {previews.length === 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => cameraRef.current?.click()} className="flex flex-col items-center gap-2 py-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all">
                        <Camera size={28} /><span className="text-xs font-medium">Chụp ảnh</span>
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 py-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all">
                        <Upload size={28} /><span className="text-xs font-medium">Chọn từ thư viện</span>
                      </button>
                    </div>
                  )}
                  <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">📝 Ghi chú thêm (tuỳ chọn)</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder={proposeModal.actionType === "TIEU_HUY" ? "Mô tả tình trạng hàng hóa cần tiêu hủy..." : "Mô tả lý do đề xuất xả kho..."}
                    rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={closeModal} disabled={submitting} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">Huỷ</button>
                  <button onClick={handleSubmitPropose} disabled={submitting || images.length === 0}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 ${proposeModal.actionType === "TIEU_HUY" ? "bg-red-600 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600"} disabled:opacity-50 disabled:cursor-not-allowed`}>
                    {submitting ? <><Loader2 size={16} className="animate-spin" />Đang gửi...</> : <><Upload size={16} />Gửi đề xuất</>}
                  </button>
                </div>
                {images.length === 0 && <p className="text-center text-xs text-red-500">⚠ Bắt buộc phải có ít nhất 1 ảnh minh chứng</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
