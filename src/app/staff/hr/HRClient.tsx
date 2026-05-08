"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  CalendarDays, FileText, Send, Clock, AlertCircle, CheckCircle2,
  Loader2, X, KeyRound, ScanFace, ShieldCheck, Trash2, Eye, EyeOff,
  UserCircle, Check, Coffee, Moon
} from "lucide-react";

const FaceRegister = dynamic(() => import("@/components/FaceRegister"), { ssr: false });

interface Props {
  userId: number | null;
}

type Section = "LICH_CA" | "NGHI_PHEP" | "DOI_MAT_KHAU" | "FACE_ID";

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
  PHEP_NAM: "Nghỉ Phép Năm (Có Lương)",
  NGHI_BENH: "Nghỉ Bệnh",
  NGHI_KHONG_LUONG: "Nghỉ Không Lương",
  NGHI_LE: "Nghỉ Lễ",
  VIEC_RIENG: "Nghỉ Việc Riêng",
};

const TRANG_THAI_CONFIG: Record<string, { label: string; cls: string }> = {
  CHO_DUYET: { label: "Chờ duyệt", cls: "bg-amber-100 text-amber-700" },
  DA_DUYET: { label: "Đã duyệt", cls: "bg-green-100 text-green-700" },
  TU_CHOI: { label: "Từ chối", cls: "bg-red-100 text-red-700" },
};

export default function HRClient({ userId }: Props) {

  // Leave form state
  const [form, setForm] = useState({
    loai_nghi: "PHEP_NAM",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
    ly_do: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [donList, setDonList] = useState<DonXinNghi[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Week navigation
  const [weekOffset, setWeekOffset] = useState(0);

  // Expand section
  const [expandedSection, setExpandedSection] = useState<Section | null>(null);

  const toggleSection = (section: Section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Password change state
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // FaceID state
  const [hasFaceData, setHasFaceData] = useState<boolean | null>(null);
  const [faceLoading, setFaceLoading] = useState(false);
  const [showFaceScanner, setShowFaceScanner] = useState(false);
  const [faceMsg, setFaceMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Mật khẩu mới và xác nhận không khớp");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("Mật khẩu mới phải ít nhất 6 ký tự");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setPwSuccess(true);
      setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (err: any) {
      setPwError(err.message ?? "Lỗi không xác định");
    } finally {
      setPwLoading(false);
    }
  };

  const fetchFaceStatus = useCallback(async () => {
    const res = await fetch("/api/user/face-data");
    const json = await res.json();
    if (json.success) setHasFaceData(json.hasFaceData);
  }, []);

  useEffect(() => {
    if (expandedSection === "FACE_ID") fetchFaceStatus();
  }, [expandedSection, fetchFaceStatus]);

  const handleFaceSuccess = async (descriptor: number[]) => {
    setShowFaceScanner(false);
    setFaceLoading(true);
    setFaceMsg(null);
    try {
      const res = await fetch("/api/user/face-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setFaceMsg({ type: "success", text: "Đã lưu dữ liệu khuôn mặt thành công!" });
      setHasFaceData(true);
    } catch (err: any) {
      setFaceMsg({ type: "error", text: err.message ?? "Lưu thất bại" });
    } finally {
      setFaceLoading(false);
    }
  };

  const handleDeleteFace = async () => {
    if (!confirm("Bạn chắc muốn xóa dữ liệu FaceID?")) return;
    setFaceLoading(true);
    try {
      await fetch("/api/user/face-data", { method: "DELETE" });
      setHasFaceData(false);
      setFaceMsg({ type: "success", text: "Đã xóa dữ liệu FaceID" });
    } catch {
      setFaceMsg({ type: "error", text: "Xóa thất bại" });
    } finally {
      setFaceLoading(false);
    }
  };

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
    if (expandedSection === "NGHI_PHEP" || expandedSection === "LICH_CA") fetchHistory();
  }, [expandedSection, fetchHistory]);

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
      setForm({ loai_nghi: "PHEP_NAM", ngay_bat_dau: "", ngay_ket_thuc: "", ly_do: "" });
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 4000);
      fetchHistory();
    } catch (err: any) {
      setFormError(err.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const calcDays = (start: string, end: string) =>
    Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;

  // Weekly schedule data
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + weekOffset * 7);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const isToday = (d: Date) =>
    d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

  const isPast = (d: Date) => d < today && !isToday(d);

  type DayStatus = "completed" | "today" | "upcoming" | "off";

  const getDayStatus = (d: Date, idx: number): DayStatus => {
    if (idx >= 5) return "off";
    if (isToday(d)) return "today";
    if (isPast(d)) return "completed";
    return "upcoming";
  };

  // Glass card base class
  const glassCard = "backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 -m-4 p-6 lg:p-8">
      <div className="space-y-6 max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className={`${glassCard} p-6`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <UserCircle size={36} className="text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-800">Nhân Viên Kho</h1>
                <p className="text-sm text-gray-500">Nhân viên · NôngSản Việt</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-blue-100/80 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Đang hoạt động
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`${glassCard} p-6`}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Thao Tác Nhanh</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => toggleSection("LICH_CA")}
                className={`flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border hover:shadow-md hover:scale-[1.02] transition-all ${expandedSection === "LICH_CA" ? "border-blue-400 ring-2 ring-blue-200" : "border-blue-200/50"}`}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-md">
                  <CalendarDays size={22} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Lịch Làm Việc</span>
              </button>

              <button
                onClick={() => toggleSection("NGHI_PHEP")}
                className={`flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border hover:shadow-md hover:scale-[1.02] transition-all ${expandedSection === "NGHI_PHEP" ? "border-green-400 ring-2 ring-green-200" : "border-green-200/50"}`}
              >
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shadow-md">
                  <FileText size={22} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Đơn Xin Nghỉ Phép</span>
              </button>

              <button
                onClick={() => toggleSection("DOI_MAT_KHAU")}
                className={`flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border hover:shadow-md hover:scale-[1.02] transition-all ${expandedSection === "DOI_MAT_KHAU" ? "border-amber-400 ring-2 ring-amber-200" : "border-amber-200/50"}`}
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-md">
                  <KeyRound size={22} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Đổi Mật Khẩu</span>
              </button>

              <button
                onClick={() => toggleSection("FACE_ID")}
                className={`flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border hover:shadow-md hover:scale-[1.02] transition-all ${expandedSection === "FACE_ID" ? "border-purple-400 ring-2 ring-purple-200" : "border-purple-200/50"}`}
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-md">
                  <ScanFace size={22} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Đăng Nhập FaceID</span>
              </button>
            </div>
          </div>

          {/* ─── Expanded: Nghỉ Phép ─── */}
          {expandedSection === "NGHI_PHEP" && (
            <div className={`${glassCard} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FileText size={20} className="text-green-500" />
                  Đơn Xin Nghỉ Phép
                </h2>
                <button onClick={() => setExpandedSection(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {formSuccess && (
                    <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm font-medium">
                      <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                      Đơn của bạn đã được gửi thành công!
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
                          className="w-full border border-gray-200 rounded-lg bg-white/80 p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        >
                          <option value="PHEP_NAM">Nghỉ Phép Năm (Có Lương)</option>
                          <option value="NGHI_BENH">Nghỉ Bệnh</option>
                          <option value="NGHI_KHONG_LUONG">Nghỉ Không Lương</option>
                          <option value="NGHI_LE">Nghỉ Lễ</option>
                          <option value="VIEC_RIENG">Nghỉ Việc Riêng</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phép năm còn lại</label>
                        <div className="w-full border border-green-200 rounded-lg bg-green-50/80 p-2.5 text-sm font-bold text-green-700 text-center">
                          5 ngày
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          required
                          value={form.ngay_bat_dau}
                          onChange={(e) => setForm({ ...form, ngay_bat_dau: e.target.value })}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full border border-gray-200 rounded-lg bg-white/80 p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          required
                          value={form.ngay_ket_thuc}
                          onChange={(e) => setForm({ ...form, ngay_ket_thuc: e.target.value })}
                          min={form.ngay_bat_dau || new Date().toISOString().split("T")[0]}
                          className="w-full border border-gray-200 rounded-lg bg-white/80 p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        />
                      </div>
                    </div>

                    {form.ngay_bat_dau && form.ngay_ket_thuc && (
                      <p className="text-xs text-green-600 font-medium">
                        Tổng số ngày nghỉ: <strong>{calcDays(form.ngay_bat_dau, form.ngay_ket_thuc)} ngày</strong>
                      </p>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lý do chi tiết</label>
                      <textarea
                        rows={3}
                        value={form.ly_do}
                        onChange={(e) => setForm({ ...form, ly_do: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg bg-white/80 p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none placeholder:text-gray-400"
                        placeholder="Trình bày lý do xin nghỉ..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                      >
                        {submitting ? <><Loader2 size={16} className="animate-spin" /> Đang gửi...</> : <><Send size={16} /> Gửi Đơn</>}
                      </button>
                    </div>
                  </form>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-3 text-sm">Lịch sử đơn nghỉ</h3>
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-6 text-gray-400 text-sm">
                      <Loader2 size={18} className="animate-spin mr-2" /> Đang tải...
                    </div>
                  ) : donList.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">Chưa có đơn nào.</p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {donList.map((don) => {
                        const cfg = TRANG_THAI_CONFIG[don.trang_thai] ?? { label: don.trang_thai, cls: "bg-gray-100 text-gray-600" };
                        return (
                          <div key={don.id} className="border border-gray-100 bg-white/60 p-3 rounded-lg text-sm">
                            <p className="font-semibold text-gray-800 text-xs">{LOAI_NGHI_LABEL[don.loai_nghi] ?? don.loai_nghi}</p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {formatDate(don.ngay_bat_dau)} → {formatDate(don.ngay_ket_thuc)}
                            </p>
                            <span className={`inline-block mt-1 font-bold px-2 py-0.5 rounded text-[10px] ${cfg.cls}`}>
                              {cfg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── Expanded: Đổi Mật Khẩu ─── */}
          {expandedSection === "DOI_MAT_KHAU" && (
            <div className={`${glassCard} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md">
                    <KeyRound size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Đổi Mật Khẩu</h2>
                    <p className="text-xs text-gray-400">Bảo vệ tài khoản với mật khẩu mạnh</p>
                  </div>
                </div>
                <button onClick={() => setExpandedSection(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>

              <div className="max-w-md">
                {pwSuccess && (
                  <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm font-medium">
                    <CheckCircle2 size={18} className="text-green-600" /> Đổi mật khẩu thành công!
                  </div>
                )}
                {pwError && (
                  <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
                    <AlertCircle size={18} className="text-red-500 mt-0.5" /> <span>{pwError}</span>
                    <button onClick={() => setPwError(null)} className="ml-auto"><X size={14} /></button>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white/80 px-3 focus-within:ring-2 focus-within:ring-amber-500/30">
                      <input type={showOld ? "text" : "password"} required value={pwForm.oldPassword} onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })} placeholder="••••••••" className="flex-1 bg-transparent py-2.5 text-sm outline-none" />
                      <button type="button" onClick={() => setShowOld(!showOld)} className="text-gray-400 hover:text-gray-600">{showOld ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white/80 px-3 focus-within:ring-2 focus-within:ring-amber-500/30">
                      <input type={showNew ? "text" : "password"} required value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="Ít nhất 6 ký tự" className="flex-1 bg-transparent py-2.5 text-sm outline-none" />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="text-gray-400 hover:text-gray-600">{showNew ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white/80 px-3 focus-within:ring-2 focus-within:ring-amber-500/30">
                      <input type={showConfirm ? "text" : "password"} required value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} placeholder="Nhập lại" className="flex-1 bg-transparent py-2.5 text-sm outline-none" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600">{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                    {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && <p className="text-xs text-red-500 mt-1">Mật khẩu không khớp</p>}
                  </div>
                  <button type="submit" disabled={pwLoading} className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                    {pwLoading ? <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</> : <><KeyRound size={16} /> Đổi Mật Khẩu</>}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ─── Expanded: FaceID ─── */}
          {expandedSection === "FACE_ID" && (
            <div className={`${glassCard} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-md">
                    <ScanFace size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Đăng Nhập FaceID</h2>
                    <p className="text-xs text-gray-400">Đăng nhập nhanh bằng nhận diện khuôn mặt</p>
                  </div>
                </div>
                <button onClick={() => setExpandedSection(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>

              <div className="max-w-md">
                {faceMsg && (
                  <div className={`mb-4 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium border ${faceMsg.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                    {faceMsg.type === "success" ? <CheckCircle2 size={18} className="text-green-600" /> : <AlertCircle size={18} className="text-red-500" />}
                    {faceMsg.text}
                  </div>
                )}

                {hasFaceData === null ? (
                  <div className="flex items-center justify-center py-6 text-gray-400"><Loader2 size={20} className="animate-spin mr-2" /> Đang kiểm tra...</div>
                ) : (
                  <div className="space-y-4">
                    <div className={`rounded-xl p-4 flex items-center gap-4 border ${hasFaceData ? "bg-emerald-50/80 border-emerald-200" : "bg-gray-50/80 border-gray-200"}`}>
                      <div className={`p-3 rounded-full ${hasFaceData ? "bg-emerald-100" : "bg-gray-200"}`}>
                        <ShieldCheck size={24} className={hasFaceData ? "text-emerald-600" : "text-gray-400"} />
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${hasFaceData ? "text-emerald-800" : "text-gray-600"}`}>
                          {hasFaceData ? "Đã đăng ký FaceID" : "Chưa đăng ký FaceID"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {hasFaceData ? "Đăng nhập nhanh bằng khuôn mặt đã sẵn sàng." : "Đăng ký để đăng nhập không cần mật khẩu."}
                        </p>
                      </div>
                    </div>

                    {showFaceScanner && (
                      <FaceRegister onSuccess={handleFaceSuccess} onCancel={() => setShowFaceScanner(false)} />
                    )}

                    {!showFaceScanner && (
                      <div className="flex flex-col gap-3">
                        <button onClick={() => { setFaceMsg(null); setShowFaceScanner(true); }} disabled={faceLoading} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                          {faceLoading ? <><Loader2 size={16} className="animate-spin" /> Đang lưu...</> : <><ScanFace size={16} /> {hasFaceData ? "Cập nhật FaceID" : "Đăng ký khuôn mặt"}</>}
                        </button>
                        {hasFaceData && (
                          <button onClick={handleDeleteFace} disabled={faceLoading} className="w-full bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-600 font-bold py-3 rounded-xl text-sm border border-red-200 flex items-center justify-center gap-2">
                            <Trash2 size={16} /> Xóa dữ liệu FaceID
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── Expanded: Lịch Làm Việc ─── */}
          {expandedSection === "LICH_CA" && (
            <div className={`${glassCard} p-6`}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <CalendarDays size={20} className="text-blue-500" />
                  {weekOffset === 0 ? "Lịch Tuần Này" : weekOffset === -1 ? "Tuần Trước" : weekOffset === 1 ? "Tuần Sau" : `Tuần (${weekOffset > 0 ? "+" : ""}${weekOffset})`}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWeekOffset(weekOffset - 1)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-white/60 rounded-lg transition-colors"
                  >
                    ← Trước
                  </button>
                  {weekOffset !== 0 && (
                    <button
                      onClick={() => setWeekOffset(0)}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-lg shadow-sm"
                    >
                      Hôm nay
                    </button>
                  )}
                  <button
                    onClick={() => setWeekOffset(weekOffset + 1)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-white/60 rounded-lg transition-colors"
                  >
                    Sau →
                  </button>
                  <button onClick={() => setExpandedSection(null)} className="ml-2 text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-4">
                {monday.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} - {weekDays[6].toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {weekDays.slice(0, 5).map((d, idx) => {
                  const leaveForDay = donList.find((don) => {
                    const start = new Date(don.ngay_bat_dau);
                    const end = new Date(don.ngay_ket_thuc);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    const check = new Date(d);
                    check.setHours(12, 0, 0, 0);
                    return check >= start && check <= end;
                  });

                  const isLeaveApproved = leaveForDay?.trang_thai === "DA_DUYET";
                  const isLeavePending = leaveForDay?.trang_thai === "CHO_DUYET";
                  const isLeaveRejected = leaveForDay?.trang_thai === "TU_CHOI";

                  const status = getDayStatus(d, idx);
                  const borderColor = isLeaveApproved ? "border-red-200 bg-red-50/50"
                    : isLeavePending ? "border-amber-200 bg-amber-50/50"
                    : status === "completed" ? "border-green-200 bg-green-50/50"
                    : status === "today" ? "border-blue-300 bg-blue-50/50 ring-2 ring-blue-200"
                    : "border-gray-200 bg-white/50";

                  return (
                    <div key={idx} className={`rounded-xl border p-4 ${borderColor} transition-all`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase">{dayLabels[idx]}</span>
                          <p className="text-lg font-bold text-gray-800">
                            {d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                          </p>
                        </div>
                        {isLeaveApproved && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">OFF</span>
                        )}
                        {isLeavePending && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">Chờ duyệt</span>
                        )}
                        {isLeaveRejected && (
                          <span className="px-2 py-0.5 rounded-full bg-gray-400 text-white text-[10px] font-bold">Từ chối</span>
                        )}
                        {!leaveForDay && status === "completed" && (
                          <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                            <Check size={14} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                        {!leaveForDay && status === "today" && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold uppercase">
                            Hôm nay
                          </span>
                        )}
                      </div>

                      {isLeaveApproved ? (
                        <div className="text-center py-3">
                          <p className="text-red-600 font-bold text-sm">Nghỉ phép</p>
                          <p className="text-[11px] text-red-400 mt-1">{LOAI_NGHI_LABEL[leaveForDay.loai_nghi] ?? leaveForDay.loai_nghi}</p>
                        </div>
                      ) : isLeavePending ? (
                        <div className="text-center py-3">
                          <p className="text-amber-600 font-bold text-sm">Đang chờ duyệt</p>
                          <p className="text-[11px] text-amber-400 mt-1">{LOAI_NGHI_LABEL[leaveForDay.loai_nghi] ?? leaveForDay.loai_nghi}</p>
                        </div>
                      ) : isLeaveRejected ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <Coffee size={12} className="text-orange-500" />
                            <span className="font-medium text-gray-700">Ca Sáng</span>
                            <span className="ml-auto text-gray-400">06:00 - 14:00</span>
                          </div>
                          <p className="text-[11px] text-gray-400 pl-5 line-through">Đơn nghỉ bị từ chối</p>
                        </div>
                      ) : status === "off" ? (
                        <div className="text-center py-4 text-gray-400 text-sm">Nghỉ</div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <Coffee size={12} className="text-orange-500" />
                            <span className="font-medium text-gray-700">Ca Sáng</span>
                            <span className="ml-auto text-gray-400">06:00 - 14:00</span>
                          </div>
                          {status === "completed" && (
                            <p className="text-[11px] text-green-600 font-medium pl-5">Check-in: 05:55</p>
                          )}
                          {status === "today" && (
                            <p className="text-[11px] text-blue-600 font-medium pl-5">Đang làm việc</p>
                          )}
                          <div className="flex items-center gap-2 text-xs mt-1">
                            <Moon size={12} className="text-indigo-500" />
                            <span className="font-medium text-gray-700">Ca Chiều</span>
                            <span className="ml-auto text-gray-400">14:00 - 22:00</span>
                          </div>
                          {status === "completed" && (
                            <p className="text-[11px] text-green-600 font-medium pl-5">Check-in: 13:50</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Weekend cards */}
                {weekDays.slice(5).map((d, idx) => (
                  <div key={idx + 5} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase">{dayLabels[idx + 5]}</span>
                        <p className="text-lg font-bold text-gray-800">
                          {d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-center py-2 text-gray-400 text-sm">Nghỉ (OFF)</div>
                  </div>
                ))}
              </div>

              {/* Policy footer */}
              <div className="mt-5 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 rounded-xl p-4 text-white flex items-center gap-4">
                <Clock size={32} className="opacity-40 flex-shrink-0" />
                <p className="text-sm text-white/80">
                  Chấm công tự động bằng Facial Recognition tại cửa kho. Ngày có đơn nghỉ đã duyệt sẽ hiển thị OFF.
                </p>
              </div>
            </div>
          )}

      </div>
    </div>
  );
}
