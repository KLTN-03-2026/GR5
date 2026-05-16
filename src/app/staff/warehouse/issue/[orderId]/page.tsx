"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft, Package, QrCode, CheckCircle2, Loader2,
  AlertTriangle, MapPin, Phone, User, Truck,
  ScanLine, X, Clock, Boxes, ChevronRight,
} from "lucide-react";

type LoSuggestion = {
  ton_kho_id: number;
  lo_hang_id: number;
  ma_lo_hang: string;
  han_su_dung: string;
  days_left: number | null;
  so_luong_ton: number;
  so_luong_xuat_goi_y: number;
  vi_tri: string;
  la_uu_tien: boolean;
  urgent: boolean;
};

type ChiTietSuggestion = {
  chi_tiet_id: number;
  ma_bien_the: number;
  ten_san_pham: string;
  ten_bien_the: string;
  so_luong_yeu_cau: number;
  so_luong_da_xuat: number;
  total_ton_phu_hop: number;
  du_hang: boolean;
  lo_list: LoSuggestion[];
};

type IssueData = {
  phieu_xuat: { id: number; trang_thai: string; ngay_tao: string; ly_do_xuat: string };
  don_hang: { id: number; ma_hien_thi: string; ho_ten_nguoi_nhan: string; sdt_nguoi_nhan: string; dia_chi_giao_hang: string; trang_thai: string };
  loai_don: "GAN" | "TRUNG" | "XA";
  min_days_left: number;
  canh_bao_dong_goi: string | null;
  tien_do: { da_xuat: number; tong: number };
  suggestions: ChiTietSuggestion[];
};

const LOAI_CONFIG = {
  GAN: { label: "Gần — Nội thành Đà Nẵng", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  TRUNG: { label: "Trung — Miền Trung", color: "bg-amber-50 text-amber-700 border-amber-200" },
  XA: { label: "Xa — Toàn quốc", color: "bg-red-50 text-red-700 border-red-200" },
};

export default function StaffWarehouseIssueDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();

  const [data, setData] = useState<IssueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrInput, setQrInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [daDongGoiDacBiet, setDaDongGoiDacBiet] = useState(false);
  const [forceReason, setForceReason] = useState("");
  const [showForceModal, setShowForceModal] = useState(false);
  const [issuingLo, setIssuingLo] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/staff/warehouse/issue?ma_don_hang=${orderId}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        toast.error(json.error || "Lỗi tải dữ liệu");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleScan = async () => {
    if (!qrInput.trim() || !data) return;
    setScanning(true);
    try {
      const res = await fetch("/api/staff/warehouse/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SCAN", qrCode: qrInput.trim(), ma_phieu_xuat: data.phieu_xuat.id }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || "Quét thành công");
        if (json.fefo_warning) {
          toast(json.fefo_warning, { icon: "⚠️", duration: 5000 });
        }
        setQrInput("");
        loadData();
      } else {
        toast.error(json.error || "Lỗi quét");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setScanning(false);
    }
  };

  const handleComplete = async (force = false) => {
    if (!data) return;
    setCompleting(true);
    try {
      const action = force ? "FORCE_COMPLETE" : "COMPLETE";
      const res = await fetch("/api/staff/warehouse/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ma_phieu_xuat: data.phieu_xuat.id, ly_do: forceReason }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message);
        setShowForceModal(false);
        loadData();
      } else {
        toast.error(json.error || "Lỗi");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setCompleting(false);
    }
  };

  const handleQuickIssue = async (chiTiet: ChiTietSuggestion, lo: LoSuggestion) => {
    if (!data || lo.so_luong_xuat_goi_y <= 0) return;
    setIssuingLo(lo.ton_kho_id);
    try {
      const res = await fetch("/api/staff/warehouse/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "QUICK_ISSUE",
          ma_phieu_xuat: data.phieu_xuat.id,
          ma_bien_the: chiTiet.ma_bien_the,
          lo_hang_id: lo.lo_hang_id,
          so_luong: lo.so_luong_xuat_goi_y,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || "Xuất thành công");
        loadData();
      } else {
        toast.error(json.error || "Lỗi xuất");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setIssuingLo(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-emerald-500" size={28} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-3">Không tìm thấy phiếu xuất cho đơn này</p>
        <Link href="/staff/warehouse/issue" className="text-emerald-600 text-sm font-medium hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const { phieu_xuat, don_hang, loai_don, canh_bao_dong_goi, tien_do, suggestions } = data;
  const loaiCfg = LOAI_CONFIG[loai_don];
  const progress = tien_do.tong > 0 ? (tien_do.da_xuat / tien_do.tong) * 100 : 0;
  const isComplete = tien_do.da_xuat >= tien_do.tong;
  const canComplete = isComplete && (loai_don !== "XA" || daDongGoiDacBiet);
  const isPhieuDone = phieu_xuat.trang_thai === "HOAN_THANH";

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Back */}
      <Link href="/staff/warehouse/issue" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 transition-colors">
        <ArrowLeft size={14} /> Danh sách xuất kho
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-base font-bold text-slate-800 font-mono">{don_hang.ma_hien_thi}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${loaiCfg.color}`}>
                {loaiCfg.label}
              </span>
              {isPhieuDone && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={10} /> HOÀN THÀNH
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1"><User size={11} /> {don_hang.ho_ten_nguoi_nhan || "—"}</span>
              <span className="flex items-center gap-1"><Phone size={11} /> {don_hang.sdt_nguoi_nhan || "—"}</span>
            </div>
            {don_hang.dia_chi_giao_hang && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin size={11} /> {don_hang.dia_chi_giao_hang}</p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Tiến độ nhặt hàng</span>
            <span className="font-bold text-emerald-600">{tien_do.da_xuat}/{tien_do.tong} kiện</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Cảnh báo đóng gói */}
      {canh_bao_dong_goi && !isPhieuDone && (
        <div className={`rounded-xl p-4 border flex items-start gap-3 ${loai_don === "XA" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
          <AlertTriangle size={16} className={loai_don === "XA" ? "text-red-500 mt-0.5" : "text-amber-500 mt-0.5"} />
          <div>
            <p className={`text-sm font-semibold ${loai_don === "XA" ? "text-red-700" : "text-amber-700"}`}>
              {canh_bao_dong_goi}
            </p>
            {loai_don === "XA" && (
              <p className="text-xs text-red-600 mt-1">Phải tick xác nhận đóng gói trước khi hoàn thành</p>
            )}
          </div>
        </div>
      )}

      {/* Danh sách sản phẩm + gợi ý lô */}
      {!isPhieuDone && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Boxes size={15} className="text-emerald-600" /> Sản phẩm cần xuất
          </h2>

          {suggestions.map((s) => (
            <div key={s.chi_tiet_id} className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{s.ten_san_pham}</p>
                  {s.ten_bien_the && <p className="text-xs text-slate-400">{s.ten_bien_the}</p>}
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${s.so_luong_da_xuat >= s.so_luong_yeu_cau ? "text-emerald-600" : "text-slate-700"}`}>
                    {s.so_luong_da_xuat}/{s.so_luong_yeu_cau}
                  </span>
                  <p className="text-[10px] text-slate-400">đã xuất/yêu cầu</p>
                </div>
              </div>

              {!s.du_hang && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg mb-2">
                  <AlertTriangle size={11} /> Không đủ hàng phù hợp (tồn: {s.total_ton_phu_hop}, cần: {s.so_luong_yeu_cau - s.so_luong_da_xuat})
                </div>
              )}

              {/* Lô gợi ý */}
              {s.lo_list.length > 0 && s.so_luong_da_xuat < s.so_luong_yeu_cau && (
                <div className="space-y-1.5 mt-2">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Lô gợi ý FEFO:</p>
                  {s.lo_list.map((lo) => (
                    <div key={lo.ton_kho_id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${lo.la_uu_tien ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-slate-50"}`}>
                      <div>
                        <span className="font-bold text-slate-700">{lo.ma_lo_hang}</span>
                        {lo.la_uu_tien && <span className="ml-1.5 text-[9px] font-bold bg-amber-500 text-white px-1 py-0.5 rounded">ƯU TIÊN</span>}
                        <div className="text-slate-500 mt-0.5">
                          HSD: <span className={`font-semibold ${lo.urgent ? "text-red-600" : "text-slate-700"}`}>{lo.han_su_dung}</span>
                          {lo.days_left !== null && <span className="ml-1">({lo.days_left}d)</span>}
                          {lo.vi_tri && <> · <span className="font-mono">{lo.vi_tri}</span></>}
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <span className="font-bold text-emerald-700">Xuất {lo.so_luong_xuat_goi_y}</span>
                          <div className="text-slate-400">Tồn: {lo.so_luong_ton}</div>
                        </div>
                        {lo.so_luong_xuat_goi_y > 0 && (
                          <button
                            onClick={() => handleQuickIssue(s, lo)}
                            disabled={issuingLo === lo.ton_kho_id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap"
                          >
                            {issuingLo === lo.ton_kho_id ? "..." : "Xuất"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {s.so_luong_da_xuat >= s.so_luong_yeu_cau && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-2">
                  <CheckCircle2 size={12} /> Đã xuất đủ
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quét QR */}
      {!isPhieuDone && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <ScanLine size={15} className="text-emerald-600" /> Quét kiện hàng
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              placeholder="Quét hoặc nhập mã QR kiện hàng..."
              className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-slate-50 font-mono"
              disabled={scanning}
              autoFocus
            />
            <button
              onClick={handleScan}
              disabled={!qrInput.trim() || scanning}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition-colors flex items-center gap-2">
              {scanning ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}
              Quét
            </button>
          </div>
        </div>
      )}

      {/* Đóng gói đặc biệt (XA) */}
      {loai_don === "XA" && !isPhieuDone && (
        <label className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 cursor-pointer">
          <input
            type="checkbox"
            checked={daDongGoiDacBiet}
            onChange={(e) => setDaDongGoiDacBiet(e.target.checked)}
            className="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500"
          />
          <span className="text-sm font-semibold text-red-700">Đã đóng gói lạnh (túi giữ nhiệt + đá khô)</span>
        </label>
      )}

      {/* Actions */}
      {!isPhieuDone && (
        <div className="flex gap-3">
          {isComplete ? (
            <button
              onClick={() => handleComplete(false)}
              disabled={!canComplete || completing}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
              {completing ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              Hoàn thành xuất kho
            </button>
          ) : (
            <button
              onClick={() => setShowForceModal(true)}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
              <AlertTriangle size={15} /> Xuất thiếu (chưa đủ kiện)
            </button>
          )}
        </div>
      )}

      {/* Phiếu đã hoàn thành → link tạo vận đơn */}
      {isPhieuDone && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
          <CheckCircle2 size={32} className="text-emerald-600 mx-auto mb-2" />
          <p className="font-bold text-emerald-700">Xuất kho hoàn thành</p>
          <p className="text-xs text-emerald-600 mt-1">Tiếp tục tạo vận đơn GHN tại trang chi tiết đơn hàng</p>
          <Link href={`/staff/orders/${orderId}`}
            className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
            <Truck size={14} /> Tạo vận đơn GHN <ChevronRight size={12} />
          </Link>
        </div>
      )}

      {/* Force complete modal */}
      {showForceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowForceModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> Xuất thiếu hàng
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Đã xuất {tien_do.da_xuat}/{tien_do.tong} kiện. Nhập lý do xuất thiếu:
            </p>
            <textarea
              value={forceReason}
              onChange={(e) => setForceReason(e.target.value)}
              placeholder="VD: Hết hàng biến thể X, đã thông báo khách..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-3 resize-none focus:outline-none focus:border-amber-400"
              rows={3}
            />
            <div className="flex gap-2">
              <button onClick={() => setShowForceModal(false)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600">
                Hủy
              </button>
              <button
                onClick={() => handleComplete(true)}
                disabled={completing}
                className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                {completing ? <Loader2 size={13} className="animate-spin mx-auto" /> : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
