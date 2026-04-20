"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CalendarDays, FileText, Send, Clock, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Props {
  userId: number | null;
}

interface DonXinNghi {
  id: number;
  loai_nghi: string;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  ly_do: string | null;
  trang_thai: string;
  ngay_tao: string;
}

const LOAI_NGHI_LABEL: Record<string, string> = {
  PHEP: "Nghỉ Phép Năm (Có Lương)",
  BENH: "Nghỉ Bệnh",
  VIEC_RIENG: "Nghỉ Việc Riêng",
};

const TRANG_THAI_CONFIG: Record<string, { label: string; cls: string }> = {
  CHO_DUYET: { label: "Chờ duyệt", cls: "bg-amber-100 text-amber-700" },
  DA_DUYET:  { label: "Đã duyệt",  cls: "bg-green-100 text-green-700" },
  TU_CHOI:   { label: "Từ chối",   cls: "bg-red-100 text-red-700" },
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function HRClient({ userId }: Props) {
  const [activeTab, setActiveTab] = useState("LICH_CA");

  // Form state
  const [form, setForm] = useState({
    loai_nghi: "PHEP",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
    ly_do: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // History state
  const [donList, setDonList] = useState<DonXinNghi[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ── Fetch history ────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/nghi-phep?ma_nguoi_dung=${userId}`);
      const json = await res.json();
      if (json.success) setDonList(json.data as DonXinNghi[]);
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  }, [userId]);

  useEffect(() => {
    if (activeTab === "NGHI_PHEP") fetchHistory();
  }, [activeTab, fetchHistory]);

  // ── Submit form ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.ngay_bat_dau || !form.ngay_ket_thuc) {
      setFormError("Vui lòng chọn ngày bắt đầu và ngày kết thúc.");
      return;
    }
    if (new Date(form.ngay_ket_thuc) < new Date(form.ngay_bat_dau)) {
      setFormError("Ngày kết thúc không thể trước ngày bắt đầu.");
      return;
    }
    if (!userId) {
      setFormError("Không xác định được người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/nghi-phep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ma_nguoi_dung: userId,
          loai_nghi: form.loai_nghi,
          ngay_bat_dau: form.ngay_bat_dau,
          ngay_ket_thuc: form.ngay_ket_thuc,
          ly_do: form.ly_do || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Gửi đơn thất bại");

      setForm({ loai_nghi: "PHEP", ngay_bat_dau: "", ngay_ket_thuc: "", ly_do: "" });
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 4000);
      fetchHistory();
    } catch (err: any) {
      setFormError(err.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const calcDays = (start: string, end: string) =>
    Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
        <button
          onClick={() => setActiveTab("LICH_CA")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "LICH_CA" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <CalendarDays size={18} className={activeTab === "LICH_CA" ? "text-white" : "text-blue-500"} />
          Lịch Làm Việc Cá Nhân
        </button>
        <button
          onClick={() => setActiveTab("NGHI_PHEP")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "NGHI_PHEP" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FileText size={18} className={activeTab === "NGHI_PHEP" ? "text-white" : "text-green-500"} />
          Đơn Xin Nghỉ Phép
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─── LỊCH CA ──────────────────────────────────────────────────────── */}
        {activeTab === "LICH_CA" && (
          <div className="col-span-3 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  Lịch biểu tuần này <span className="font-normal text-gray-500 text-sm ml-2">(12/04/2026 - 18/04/2026)</span>
                </h2>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md">Tuần trước</button>
                  <button className="px-3 py-1.5 text-sm font-medium bg-white text-gray-900 rounded-md shadow-sm">Tuần này</button>
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md">Tuần tới</button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => (
                  <div key={day} className={`bg-white p-3 text-center border-b border-gray-200 ${idx === 2 ? 'relative' : ''}`}>
                    {idx === 2 && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>}
                    <span className={`text-xs font-medium uppercase ${idx === 2 ? 'text-blue-600' : 'text-gray-500'}`}>{day}</span>
                    <span className={`block text-xl font-bold mt-1 ${idx === 2 ? 'text-blue-700' : 'text-gray-900'}`}>{12 + idx}</span>
                  </div>
                ))}

                <div className="bg-green-50/20 min-h-[300px] p-2 space-y-2">
                  <div className="bg-white border-l-4 border-l-green-500 border-y border-r border-gray-200 rounded-md p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <p className="font-bold text-gray-800 text-sm mb-1">Ca Sáng</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> 06:00 - 14:00</p>
                    <div className="mt-2 text-[11px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded inline-block">✓ Đã chấm (05:55)</div>
                  </div>
                </div>
                <div className="bg-green-50/20 min-h-[300px] p-2 space-y-2">
                  <div className="bg-white border-l-4 border-l-green-500 border-y border-r border-gray-200 rounded-md p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <p className="font-bold text-gray-800 text-sm mb-1">Ca Chiều</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> 14:00 - 22:00</p>
                    <div className="mt-2 text-[11px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded inline-block">✓ Đã chấm (13:50)</div>
                  </div>
                </div>
                <div className="bg-blue-50/30 min-h-[300px] p-2 space-y-2 relative border-x border-blue-100">
                  <div className="absolute top-10 left-0 w-full h-px bg-red-400">
                    <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                  <div className="bg-white border-l-4 border-l-blue-500 border-y border-r border-gray-200 rounded-md p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative z-10 mt-6 ring-2 ring-blue-500/20">
                    <p className="font-bold text-gray-800 text-sm mb-1">Ca Sáng</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> 06:00 - 14:00</p>
                    <div className="mt-2 text-[11px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded inline-block">Đang làm việc</div>
                  </div>
                </div>
                <div className="bg-white min-h-[300px] p-2 space-y-2">
                  <div className="bg-white border border-gray-200 rounded-md p-2 shadow-sm opacity-70">
                    <p className="font-bold text-gray-600 text-sm mb-1 mt-1">Ca Tối</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> 22:00 - 06:00</p>
                  </div>
                </div>
                <div className="bg-white min-h-[300px] p-2 flex flex-col items-center justify-center">
                  <p className="text-xs text-gray-400">Nghỉ (OFF)</p>
                </div>
                <div className="bg-white min-h-[300px] p-2 space-y-2">
                  <div className="bg-white border border-gray-200 rounded-md p-2 shadow-sm opacity-70">
                    <p className="font-bold text-gray-600 text-sm mb-1">Ca Sáng</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> 06:00 - 14:00</p>
                  </div>
                </div>
                <div className="bg-white min-h-[300px] p-2 flex flex-col items-center justify-center">
                  <p className="text-xs text-gray-400">Nghỉ (OFF)</p>
                </div>
              </div>

              <div className="mt-6 bg-blue-600 rounded-xl p-6 text-white shadow-sm relative overflow-hidden flex items-center gap-6">
                <Clock size={64} className="opacity-20 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-100 mb-1 text-lg">Quy định chấm công</h3>
                  <p className="text-sm leading-relaxed text-blue-50">
                    Việc chấm công được thực hiện hoàn toàn tự động bằng Facial Recognition tại cửa kho. Thiết bị Kiosk hoạt động độc lập và tự động đồng bộ kết quả (Đã Chấm / Vắng / Trễ) vào lịch biểu này của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── NGHỈ PHÉP ────────────────────────────────────────────────────── */}
        {activeTab === "NGHI_PHEP" && (
          <>
            {/* Form gửi đơn */}
            <div className="col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Mẫu Đơn Xin Nghỉ</h2>

                {formSuccess && (
                  <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm font-medium">
                    <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                    Đơn của bạn đã được gửi thành công. Vui lòng chờ phê duyệt từ trưởng bộ phận.
                  </div>
                )}

                {formError && (
                  <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{formError}</span>
                    <button onClick={() => setFormError(null)} className="ml-auto"><X size={16} /></button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loại Nghỉ</label>
                      <select
                        value={form.loai_nghi}
                        onChange={(e) => setForm({ ...form, loai_nghi: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg bg-gray-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="PHEP">Nghỉ Phép Năm (Có Lương)</option>
                        <option value="BENH">Nghỉ Bệnh</option>
                        <option value="VIEC_RIENG">Nghỉ Việc Riêng</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phép năm còn lại</label>
                      <div className="w-full border border-gray-200 rounded-lg bg-green-50 p-2.5 text-sm font-bold text-green-700 text-center">
                        5 ngày
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Từ ngày <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={form.ngay_bat_dau}
                        onChange={(e) => setForm({ ...form, ngay_bat_dau: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full border border-gray-200 rounded-lg bg-gray-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đến ngày <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={form.ngay_ket_thuc}
                        onChange={(e) => setForm({ ...form, ngay_ket_thuc: e.target.value })}
                        min={form.ngay_bat_dau || new Date().toISOString().split("T")[0]}
                        className="w-full border border-gray-200 rounded-lg bg-gray-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {form.ngay_bat_dau && form.ngay_ket_thuc && (
                    <p className="text-xs text-blue-600 font-medium">
                      Tổng số ngày nghỉ: <strong>{calcDays(form.ngay_bat_dau, form.ngay_ket_thuc)} ngày</strong>
                    </p>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lý do chi tiết</label>
                    <textarea
                      rows={3}
                      value={form.ly_do}
                      onChange={(e) => setForm({ ...form, ly_do: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg bg-gray-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-400"
                      placeholder="Trình bày lý do xin nghỉ của bạn..."
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                      {submitting ? (
                        <><Loader2 size={16} className="animate-spin" /> Đang gửi...</>
                      ) : (
                        <><Send size={16} /> Gửi Lên Trưởng Bộ Phận</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Lịch sử */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Lịch sử nghỉ phép</h3>

                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8 text-gray-400">
                    <Loader2 size={22} className="animate-spin mr-2" /> Đang tải...
                  </div>
                ) : donList.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">Chưa có đơn nào được gửi.</p>
                ) : (
                  <div className="space-y-3">
                    {donList.map((don) => {
                      const cfg = TRANG_THAI_CONFIG[don.trang_thai] ?? { label: don.trang_thai, cls: "bg-gray-100 text-gray-600" };
                      return (
                        <div key={don.id} className="border border-gray-100 p-3 rounded-lg text-sm">
                          <p className="font-semibold text-gray-800">{LOAI_NGHI_LABEL[don.loai_nghi] ?? don.loai_nghi}</p>
                          <p className="text-gray-500 mt-0.5">
                            {formatDate(don.ngay_bat_dau)} → {formatDate(don.ngay_ket_thuc)}
                            {" "}({calcDays(don.ngay_bat_dau, don.ngay_ket_thuc)} ngày)
                          </p>
                          {don.ly_do && <p className="text-gray-400 text-xs mt-1 italic">{don.ly_do}</p>}
                          <span className={`inline-block mt-2 font-bold px-2 py-0.5 rounded text-xs ${cfg.cls}`}>
                            {cfg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
