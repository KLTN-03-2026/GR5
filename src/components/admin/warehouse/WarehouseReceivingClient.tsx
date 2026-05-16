"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck, Camera, CheckCircle, AlertTriangle,
  Package, ChevronRight, FileSignature, ArrowLeft,
  Clock, ClipboardCheck, BoxIcon, Users,
  RotateCcw, ShieldCheck, Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

type Step = "DASHBOARD" | "COUNT" | "CONFIRM" | "DONE";

const STEP_LABELS: Record<Step, string> = {
  DASHBOARD: "Bảng điều khiển",
  COUNT: "Kiểm đếm",
  CONFIRM: "Xác nhận",
  DONE: "Hoàn tất",
};

// don_vi_tinh đôi khi bị nhập lẫn khối lượng ("7Kg", "500g") thay vì đơn vị đếm ("Túi", "Kiện").
// Bỏ phần số ở đầu để tránh hiển thị kiểu "50 7Kg".
const normalizeUnit = (raw?: string | null) => {
  const cleaned = (raw || "").trim().replace(/^\d+(?:[.,]\d+)?\s*/, "").trim();
  return cleaned || "kg";
};

export default function WarehouseReceivingClient() {
  const [step, setStep] = useState<Step>("DASHBOARD");
  const [pos, setPos] = useState<any[]>([]);
  const [selectedPo, setSelectedPo] = useState<any>(null);


  const [actualQty, setActualQty] = useState<Record<number, number | "">>({});
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [evidence, setEvidence] = useState<Record<number, string>>({});
  const [packageStatus, setPackageStatus] = useState<Record<number, string>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => { fetchPOs(); }, []);

  const fetchPOs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/warehouse/receiving/today");
      const data = await res.json();
      if (!data.error) setPos(data);
    } catch { toast.error("Không thể tải dữ liệu"); }
    finally { setIsLoading(false); }
  };

  const handleOpenPO = (po: any) => {
    setSelectedPo(po);
    initCountState(po);
    setStep("COUNT");
  };


  const initCountState = (po: any) => {
    const initialQty: Record<number, number | ""> = {};
    const initialPkg: Record<number, string> = {};
    po.chi_tiet_phieu_nhap?.forEach((item: any) => {
      initialQty[item.id] = "";
      initialPkg[item.id] = "OK";
    });
    setActualQty(initialQty);
    setPackageStatus(initialPkg);
  };

  const handleUploadEvidence = async (itemId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/warehouse/upload/evidence", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setEvidence((prev) => ({ ...prev, [itemId]: data.url }));
        toast.success("Tải ảnh thành công!");
      }
    } catch { toast.error("Upload thất bại"); }
  };

  const validateCount = () => {
    const items = selectedPo.chi_tiet_phieu_nhap;
    for (const item of items) {
      const expected = item.so_luong_yeu_cau;
      const actual = actualQty[item.id] === "" ? 0 : Number(actualQty[item.id]);
      const diffPct = Math.abs(expected - actual) / expected;
      if (diffPct > 0.05 && (!reasons[item.id] || !evidence[item.id])) {
        toast.error(`"${item.bien_the_san_pham?.san_pham?.ten_san_pham}" lệch >5% — cần ghi lý do & ảnh bằng chứng!`);
        return false;
      }
    }
    return true;
  };

  const handleProceedToConfirm = () => { if (validateCount()) setStep("CONFIRM"); };

  const handleSubmitFinal = async () => {
    if (!selectedPo) return;
    setIsSubmitting(true);
    const items = selectedPo.chi_tiet_phieu_nhap.map((item: any) => ({
      id: item.id,
      actualQty: actualQty[item.id] === "" ? 0 : Number(actualQty[item.id]),
      reason: reasons[item.id] || "",
      evidenceUrl: evidence[item.id] || "",
      packageStatus: packageStatus[item.id] || "OK",
    }));
    try {
      const res = await fetch("/api/admin/warehouse/receiving/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poId: selectedPo.id, items }),
      });
      const data = await res.json();
      if (data.success) { setStep("DONE"); toast.success("Tiếp nhận hoàn tất!"); }
      else toast.error(data.error || "Lỗi xử lý");
    } catch { toast.error("Lỗi kết nối"); }
    finally { setIsSubmitting(false); }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "CHO_GIAO_HANG": return { label: "Chờ xe đến", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200", icon: Clock };
      case "DANG_NHAN": case "RECEIVING": return { label: "Đang dỡ hàng", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: Truck };
      case "WAITING_FOR_QC": case "CHO_KIEM_TRA": return { label: "Chờ QC kiểm", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: ShieldCheck };
      case "HOAN_THANH": case "DA_DUYET": return { label: "Hoàn thành", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle };
      default: return { label: status, color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", icon: AlertTriangle };
    }
  };

  const filteredPos = filterStatus === "ALL" ? pos : pos.filter((p) => {
    if (filterStatus === "PENDING") return p.trang_thai === "CHO_GIAO_HANG";
    if (filterStatus === "RECEIVING") return p.trang_thai === "DANG_NHAN" || p.trang_thai === "RECEIVING";
    if (filterStatus === "WAITING_FOR_QC") return p.trang_thai === "WAITING_FOR_QC" || p.trang_thai === "CHO_KIEM_TRA";
    if (filterStatus === "COMPLETED") return p.trang_thai === "HOAN_THANH" || p.trang_thai === "DA_DUYET";
    return p.trang_thai === filterStatus;
  });

  // ═══════════════════════════════════════════════
  // STEP: DASHBOARD
  // ═══════════════════════════════════════════════
  if (step === "DASHBOARD") {
    const totalPOs = pos.length;
    const pending = pos.filter((p) => p.trang_thai === "CHO_GIAO_HANG").length;
    const processing = pos.filter((p) => ["DANG_NHAN", "RECEIVING", "WAITING_FOR_QC", "CHO_KIEM_TRA"].includes(p.trang_thai)).length;
    const completed = pos.filter((p) => ["HOAN_THANH", "DA_DUYET"].includes(p.trang_thai)).length;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tiếp Nhận Hàng Hóa</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={fetchPOs}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition text-sm"
          >
            <RotateCcw size={16} /> Làm mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Tổng phiếu", value: totalPOs, icon: ClipboardCheck, color: "text-gray-700", bg: "bg-gray-50" },
            { label: "Chờ xe đến", value: pending, icon: Clock, color: "text-slate-600", bg: "bg-slate-50" },
            { label: "Đang xử lý", value: processing, icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Hoàn thành", value: completed, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                  <s.icon size={20} className={s.color} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: "ALL", label: "Tất cả" },
            { key: "PENDING", label: "Chờ xe" },
            { key: "RECEIVING", label: "Đang dỡ" },
            { key: "WAITING_FOR_QC", label: "Chờ QC" },
            { key: "COMPLETED", label: "Xong" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                filterStatus === f.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* PO List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 size={24} className="animate-spin mr-3" /> Đang tải...
            </div>
          ) : filteredPos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <BoxIcon size={48} className="mb-3 opacity-30" />
              <p className="font-medium">Không có phiếu nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPos.map((po) => {
                const cfg = getStatusConfig(po.trang_thai);
                const StatusIcon = cfg.icon;
                return (
                  <div
                    key={po.id}
                    onClick={() => handleOpenPO(po)}
                    className="p-4 hover:bg-gray-50 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0 border ${cfg.border}`}>
                        <StatusIcon size={20} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-gray-900">PN-{String(po.id).padStart(4, "0")}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users size={14} className="shrink-0" />
                          <span className="truncate">{po.nha_cung_cap?.ten_ncc || "NCC chưa xác định"}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {po.chi_tiet_phieu_nhap?.slice(0, 3).map((item: any) => (
                            <span key={item.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                              {item.bien_the_san_pham?.san_pham?.ten_san_pham?.slice(0, 20)} × {item.so_luong_yeu_cau}
                            </span>
                          ))}
                          {po.chi_tiet_phieu_nhap?.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                              +{po.chi_tiet_phieu_nhap.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs text-gray-400">
                          {new Date(po.ngay_tao).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // Breadcrumb / Steps indicator
  // ═══════════════════════════════════════════════
  const StepsBar = () => {
    const steps: Step[] = ["COUNT", "CONFIRM", "DONE"];
    const currentIdx = steps.indexOf(step);
    return (
      <div className="flex items-center gap-1 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
              i <= currentIdx ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
            }`}>
              {i < currentIdx ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${i <= currentIdx ? "text-blue-700" : "text-gray-400"}`}>
              {STEP_LABELS[s]}
            </span>
            {i < steps.length - 1 && <div className={`w-6 h-0.5 ${i < currentIdx ? "bg-blue-400" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>
    );
  };

  // ═══════════════════════════════════════════════
  // STEP: COUNT (Kiểm đếm)
  // ═══════════════════════════════════════════════
  if (step === "COUNT") {
    const items = selectedPo?.chi_tiet_phieu_nhap || [];
    const totalItems = items.length;
    let checkedCount = 0;
    items.forEach((item: any) => {
      if (actualQty[item.id] !== undefined && String(actualQty[item.id]) !== "") checkedCount++;
    });
    const progressPct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <button onClick={() => setStep("DASHBOARD")} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition">
          <ArrowLeft size={16} /> Lưu tạm & quay lại
        </button>
        <StepsBar />

        {/* PO Info + Progress */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">PN-{String(selectedPo?.id).padStart(4, "0")}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Đang kiểm đếm</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{selectedPo?.nha_cung_cap?.ten_ncc}</p>
            </div>
            <div className="w-full sm:w-48">
              <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                <span>{checkedCount}/{totalItems} mặt hàng</span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {items.map((item: any, idx: number) => {
            const expected = item.so_luong_yeu_cau;
            const actual = actualQty[item.id] ?? "";
            const unit = normalizeUnit(item.bien_the_san_pham?.don_vi_tinh);
            const isFilled = actual !== "";
            const diffPct = isFilled ? Math.abs(expected - Number(actual)) / expected : 0;
            const pkgStatus = packageStatus[item.id] || "OK";

            let borderColor = "border-gray-200";
            let bgColor = "bg-white";
            let statusTag = null;

            if (isFilled) {
              if (Number(actual) === expected) {
                borderColor = "border-emerald-300";
                bgColor = "bg-emerald-50/30";
                statusTag = <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Khớp</span>;
              } else if (diffPct <= 0.05) {
                borderColor = "border-amber-300";
                bgColor = "bg-amber-50/30";
                statusTag = <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Lệch nhẹ</span>;
              } else {
                borderColor = "border-red-300";
                bgColor = "bg-red-50/30";
                statusTag = <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Lệch lớn</span>;
              }
            }

            return (
              <div key={item.id} className={`rounded-xl border ${borderColor} ${bgColor} shadow-sm overflow-hidden transition-all`}>
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-6 h-6 rounded-md bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                        <h3 className="font-bold text-gray-900 truncate">{item.bien_the_san_pham?.san_pham?.ten_san_pham}</h3>
                        {statusTag}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">{item.bien_the_san_pham?.ma_sku}</span>
                        <span>{item.bien_the_san_pham?.ten_bien_the}</span>
                      </div>
                    </div>

                    {/* Count Input */}
                    <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-3 border border-gray-200 w-full sm:w-auto">
                      <div className="text-center">
                        <div className="text-[10px] font-semibold text-gray-400 uppercase">Yêu cầu</div>
                        <div className="text-lg font-bold text-gray-500">{expected} <span className="text-xs font-normal">{unit}</span></div>
                      </div>
                      <div className="w-px h-8 bg-gray-300" />
                      <div>
                        <div className="text-[10px] font-semibold text-blue-600 uppercase">Thực đếm</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={actual}
                            onChange={(e) => { const v = e.target.value.replace(/^-/, ''); setActualQty({ ...actualQty, [item.id]: v === "" ? "" : Number(v) }); }}
                            onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                            className="w-20 text-right text-xl font-bold text-blue-700 bg-white border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-500 font-medium">{unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Package Status + Evidence Row */}
                  <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500">Bao bì:</span>
                      <select
                        value={pkgStatus}
                        onChange={(e) => setPackageStatus({ ...packageStatus, [item.id]: e.target.value })}
                        className={`text-xs font-medium px-2 py-1 rounded-lg border focus:outline-none ${
                          pkgStatus !== "OK" ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-white border-gray-200 text-gray-600"
                        }`}
                      >
                        <option value="OK">Bình thường</option>
                        <option value="MOP">Móp / rách nhẹ</option>
                        <option value="UOT">Ướt / ẩm</option>
                        <option value="LOI">Bất thường</option>
                      </select>
                    </div>

                    {isFilled && (diffPct > 0.05 || pkgStatus !== "OK") && (
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <input
                          type="text"
                          placeholder="Lý do lệch / ghi chú..."
                          value={reasons[item.id] || ""}
                          onChange={(e) => setReasons({ ...reasons, [item.id]: e.target.value })}
                          className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                        <label className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                          evidence[item.id]
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                            : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                        }`}>
                          {evidence[item.id] ? <><CheckCircle size={12} /> Có ảnh</> : <><Camera size={12} /> Ảnh</>}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            if (e.target.files?.[0]) handleUploadEvidence(item.id, e.target.files[0]);
                          }} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <button
          onClick={handleProceedToConfirm}
          disabled={checkedCount < totalItems}
          className="w-full py-4 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {checkedCount < totalItems
            ? `Còn ${totalItems - checkedCount} mặt hàng chưa đếm`
            : <><ClipboardCheck size={18} /> Chuyển bước xác nhận</>}
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // STEP: CONFIRM
  // ═══════════════════════════════════════════════
  if (step === "CONFIRM") {
    const items = selectedPo?.chi_tiet_phieu_nhap || [];
    const totalExpected = items.reduce((s: number, i: any) => s + i.so_luong_yeu_cau, 0);
    const totalActual = items.reduce((s: number, i: any) => s + (actualQty[i.id] === "" ? 0 : Number(actualQty[i.id])), 0);
    const hasIssues = items.some((i: any) => {
      const a = actualQty[i.id] === "" ? 0 : Number(actualQty[i.id]);
      return a !== i.so_luong_yeu_cau || packageStatus[i.id] !== "OK";
    });

    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button onClick={() => setStep("COUNT")} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition">
          <ArrowLeft size={16} /> Quay lại sửa
        </button>
        <StepsBar />

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
            <h2 className="text-lg font-bold">Biên Bản Tiếp Nhận Hàng Hóa</h2>
            <p className="text-blue-100 text-sm mt-0.5">PN-{String(selectedPo?.id).padStart(4, "0")} · {selectedPo?.nha_cung_cap?.ten_ncc}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Summary info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400 text-xs font-medium block">Thời gian</span>
                <span className="font-semibold text-gray-800">{new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs font-medium block">NCC</span>
                <span className="font-semibold text-gray-800">{selectedPo?.nha_cung_cap?.ten_ncc?.slice(0, 20)}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs font-medium block">Tổng YC</span>
                <span className="font-semibold text-gray-800">{totalExpected}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs font-medium block">Tổng thực nhận</span>
                <span className={`font-bold ${totalActual === totalExpected ? "text-emerald-600" : "text-amber-600"}`}>{totalActual}</span>
              </div>
            </div>

            {/* Items table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Sản phẩm</th>
                    <th className="text-center px-3 py-2.5 font-semibold text-gray-600 w-20">Bao bì</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-gray-600 w-20">YC</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-600 w-24">Thực nhận</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any) => {
                    const expected = item.so_luong_yeu_cau;
                    const actual = actualQty[item.id] === "" ? 0 : Number(actualQty[item.id]);
                    const pkg = packageStatus[item.id];
                    const unit = normalizeUnit(item.bien_the_san_pham?.don_vi_tinh);
                    return (
                      <tr key={item.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800">{item.bien_the_san_pham?.san_pham?.ten_san_pham}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{item.bien_the_san_pham?.ten_bien_the}</div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {pkg === "OK" ? (
                            <span className="text-emerald-600 text-xs font-bold">OK</span>
                          ) : (
                            <span className="text-amber-600 text-xs font-bold">Lỗi</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right text-gray-500 font-medium">{expected} {unit}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-gray-900">{actual}</span>
                          <span className="text-xs text-gray-400 ml-1">{unit}</span>
                          {actual !== expected && (
                            <div className={`text-xs font-bold mt-0.5 ${actual > expected ? "text-emerald-600" : "text-red-600"}`}>
                              {actual > expected ? "+" : ""}{actual - expected}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Warning */}
            {hasIssues && (
              <div className="flex gap-3 items-start bg-amber-50 border border-amber-200 rounded-lg p-4">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Có mục lệch số lượng hoặc bao bì bất thường. Biên bản sẽ được gửi đến QC để kiểm định.
                </p>
              </div>
            )}

            {/* Confirm note */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 border border-gray-200">
              Bằng việc xác nhận, nhân viên cam kết số liệu kiểm đếm là chính xác. Hàng sẽ chuyển sang Staging Area và gửi thông báo cho đội QC.
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep("COUNT")}
                className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition text-sm flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} /> Sửa lại
              </button>
              <button
                onClick={handleSubmitFinal}
                disabled={isSubmitting}
                className="flex-[2] py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <FileSignature size={16} />}
                {isSubmitting ? "Đang xử lý..." : "Ký xác nhận & Hoàn tất"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // STEP: DONE
  // ═══════════════════════════════════════════════
  if (step === "DONE") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tiếp Nhận Hoàn Tất!</h2>
        <p className="text-gray-500 mb-3">
          Lô hàng đã được chuyển vào Staging Area. Hệ thống đã gửi yêu cầu kiểm định tới đội QC.
        </p>
        <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 flex items-start gap-2 text-left">
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[13px] text-amber-700">
            <strong>Bước tiếp theo:</strong> hàng chỉ vào tồn kho & sơ đồ kho sau khi <strong>QC duyệt</strong>. Hãy sang trang Kiểm Định để xử lý.
          </p>
        </div>
        <div className="flex flex-col w-full gap-3">
          <Link
            href="/staff/warehouse/qc"
            className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition text-sm flex items-center justify-center gap-2"
          >
            <ShieldCheck size={16} /> Đi đến Kiểm Định (QC)
          </Link>
          <button
            onClick={() => { setStep("DASHBOARD"); fetchPOs(); }}
            className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition text-sm"
          >
            Quay về bảng điều khiển
          </button>
          <button
            onClick={() => { setStep("DASHBOARD"); setSelectedPo(null); fetchPOs(); }}
            className="w-full py-3.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
          >
            Tiếp nhận phiếu khác
          </button>
        </div>
      </div>
    );
  }

  return null;
}
