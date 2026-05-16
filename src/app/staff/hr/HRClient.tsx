"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  CalendarDays, FileText, Send, Clock, AlertCircle, CheckCircle2,
  Loader2, X, KeyRound, ScanFace, ShieldCheck, Trash2, Eye, EyeOff,
  UserCircle, Check, Coffee, Moon, ChevronLeft, ChevronRight
} from "lucide-react";

const FaceRegister = dynamic(() => import("@/components/FaceRegister"), { ssr: false });
import ConfirmDialog from "@/components/shared/ConfirmDialog";

interface Props {
  userId: number | null;
}

type Section = "CHAM_CONG" | "LICH_CA" | "NGHI_PHEP" | "DOI_MAT_KHAU" | "FACE_ID";

interface DonXinNghi {
  id: number;
  loai_nghi: string;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  ly_do: string | null;
  trang_thai: string;
  ngay_tao: string;
}

interface CaLamViec {
  id: number;
  ten_ca: string;
  gio_bat_dau: string | null;
  gio_ket_thuc: string | null;
}

interface PhanCa {
  id: number;
  ma_nguoi_dung: number | null;
  ma_ca_lam: number | null;
  ngay_lam_viec: string | null;
  ca_lam_viec: CaLamViec | null;
}

const formatCaTime = (t: string | null | undefined) => {
  if (!t) return "--:--";
  const d = new Date(t);
  if (isNaN(d.getTime())) return "--:--";
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};

const sameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

const LOAI_NGHI_LABEL: Record<string, string> = {
  PHEP_NAM: "Nghỉ Phép Năm",
  NGHI_BENH: "Nghỉ Bệnh",
  NGHI_KHONG_LUONG: "Nghỉ Không Lương",
  NGHI_LE: "Nghỉ Lễ",
  VIEC_RIENG: "Việc Riêng",
};

const TRANG_THAI_CONFIG: Record<string, { label: string; cls: string }> = {
  CHO_DUYET: { label: "Chờ duyệt", cls: "bg-[#FAEEDA] text-[#BA7517] border border-[#BA7517]/30" },
  DA_DUYET: { label: "Đã duyệt", cls: "bg-[#E8F5F0] text-[#1D9E75] border border-[#1D9E75]/30" },
  TU_CHOI: { label: "Từ chối", cls: "bg-[#FCEBEB] text-[#A32D2D] border border-[#A32D2D]/30" },
};

export default function HRClient({ userId }: Props) {
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
  const [shifts, setShifts] = useState<PhanCa[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeSection, setActiveSection] = useState<Section>("CHAM_CONG");

  const [chamCongStatus, setChamCongStatus] = useState<{ loading: boolean; message: string | null; type: "success" | "error" | null; data: any }>({
    loading: false, message: null, type: null, data: null,
  });
  const [todayLog, setTodayLog] = useState<{ gio_vao: string | null; gio_ra: string | null; trang_thai: string } | null>(null);
  const [scannerLoai, setScannerLoai] = useState<"VAO" | "RA" | null>(null);

  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [hasFaceData, setHasFaceData] = useState<boolean | null>(null);
  const [faceLoading, setFaceLoading] = useState(false);
  const [showFaceScanner, setShowFaceScanner] = useState(false);
  const [faceMsg, setFaceMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean; title: string; message: string; onConfirm: () => void}>({isOpen: false, title: "", message: "", onConfirm: () => {}});

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
    if (activeSection === "FACE_ID") fetchFaceStatus();
  }, [activeSection, fetchFaceStatus]);

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

  const handleDeleteFace = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Xóa dữ liệu FaceID",
      message: "Bạn chắc muốn xóa dữ liệu FaceID?",
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
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
      },
    });
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
    if (activeSection === "NGHI_PHEP" || activeSection === "LICH_CA") fetchHistory();
  }, [activeSection, fetchHistory]);

  const fetchShifts = useCallback(async () => {
    if (!userId) return;
    setLoadingShifts(true);
    try {
      const now = new Date();
      const dow = now.getDay();
      const mon = new Date(now);
      mon.setHours(0, 0, 0, 0);
      mon.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1) + weekOffset * 7);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const res = await fetch(`/api/phan-ca?tu_ngay=${fmt(mon)}&den_ngay=${fmt(sun)}`);
      const json = await res.json();
      if (json.success) {
        const mine = (json.data as PhanCa[]).filter((s) => s.ma_nguoi_dung === userId);
        setShifts(mine);
      }
    } catch {
      // ignore
    } finally {
      setLoadingShifts(false);
    }
  }, [userId, weekOffset]);

  useEffect(() => {
    if (activeSection === "LICH_CA") fetchShifts();
  }, [activeSection, fetchShifts]);

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

  type DayStatus = "completed" | "today" | "upcoming";

  const getDayStatus = (d: Date): DayStatus => {
    if (isToday(d)) return "today";
    if (isPast(d)) return "completed";
    return "upcoming";
  };

  const fetchTodayLog = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/cham-cong/hom-nay?ma_nguoi_dung=${userId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const allCa = json.data as { danh_sach_nhan_vien: { ma_nguoi_dung: number; gio_vao: string | null; gio_ra: string | null; trang_thai: string }[] }[];
        let found = null;
        for (const ca of allCa) {
          const nv = ca.danh_sach_nhan_vien?.find((n) => n.ma_nguoi_dung === userId);
          if (nv && nv.gio_vao) { found = nv; break; }
        }
        setTodayLog(found ? { gio_vao: found.gio_vao, gio_ra: found.gio_ra, trang_thai: found.trang_thai } : null);
      } else {
        setTodayLog(null);
      }
    } catch {
      setTodayLog(null);
    }
  }, [userId]);

  useEffect(() => {
    if (activeSection === "CHAM_CONG") fetchTodayLog();
  }, [activeSection, fetchTodayLog]);

  const handleChamCongFace = async (descriptor: number[], snapshot?: string) => {
    const loai = scannerLoai;
    setScannerLoai(null);
    if (!loai) return;
    setChamCongStatus({ loading: true, message: null, type: null, data: null });
    try {
      const endpoint = loai === "VAO" ? "/api/cham-cong/vao" : "/api/cham-cong/ra";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ma_nguoi_dung: userId, descriptor, anh: snapshot }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Chấm công thất bại");
      }
      setChamCongStatus({ loading: false, message: loai === "VAO" ? "Chấm công VÀO thành công!" : "Chấm công RA thành công!", type: "success", data: json.data });
      fetchTodayLog();
    } catch (err: any) {
      setChamCongStatus({ loading: false, message: err.message || "Đã xảy ra lỗi", type: "error", data: null });
    }
  };

  const openChamCongScanner = (loai: "VAO" | "RA") => {
    setChamCongStatus({ loading: false, message: null, type: null, data: null });
    setScannerLoai(loai);
  };

  const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: "CHAM_CONG", label: "Chấm công", icon: Clock },
    { id: "LICH_CA", label: "Lịch làm việc", icon: CalendarDays },
    { id: "NGHI_PHEP", label: "Nghỉ phép", icon: FileText },
    { id: "DOI_MAT_KHAU", label: "Đổi mật khẩu", icon: KeyRound },
    { id: "FACE_ID", label: "FaceID", icon: ScanFace },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-gray-900 flex items-center gap-2">
            <UserCircle size={22} className="text-[#1D9E75]" />
            Hồ Sơ & Nhân Sự
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý lịch làm việc, nghỉ phép và tài khoản</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E8F5F0] text-[#1D9E75] rounded-[8px] text-[12px] font-semibold border border-[#1D9E75]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]"></span>
          Đang hoạt động
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-1.5 flex gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[8px] text-[14px] font-medium transition-colors ${
                isActive
                  ? "bg-[#1D9E75] text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ─── Section: Chấm Công ─── */}
      {activeSection === "CHAM_CONG" && (
        <div className="space-y-4">

          {/* Today's Attendance Status */}
          <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-5">
            <h2 className="text-[15px] font-semibold text-gray-800 mb-3">Chấm công hôm nay</h2>

            {todayLog ? (
              <div className="p-4 rounded-lg bg-[#F5F5F4] border border-gray-100 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1D9E75]/10 flex items-center justify-center">
                      <CheckCircle2 size={18} className="text-[#1D9E75]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {todayLog.gio_vao ? `Vào: ${new Date(todayLog.gio_vao).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}` : "Chưa chấm công vào"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {todayLog.gio_ra ? `Ra: ${new Date(todayLog.gio_ra).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}` : "Chưa chấm công ra"}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    todayLog.trang_thai === "DUNG_GIO" ? "bg-[#E8F5F0] text-[#1D9E75]" :
                    todayLog.trang_thai === "DI_TRE" ? "bg-[#FAEEDA] text-[#BA7517]" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {todayLog.trang_thai === "DUNG_GIO" ? "Đúng giờ" :
                     todayLog.trang_thai === "DI_TRE" ? "Đi trễ" :
                     todayLog.trang_thai}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 mb-4 text-center">
                <p className="text-sm text-gray-400">Chưa có dữ liệu chấm công hôm nay</p>
              </div>
            )}

            {/* Status Message */}
            {chamCongStatus.message && (
              <div className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium border ${
                chamCongStatus.type === "success"
                  ? "bg-[#E8F5F0] border-[#1D9E75]/20 text-[#1D9E75]"
                  : "bg-red-50 border-red-200 text-red-600"
              }`}>
                {chamCongStatus.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {chamCongStatus.message}
              </div>
            )}

            {/* Face Scanner Overlay */}
            {scannerLoai && (
              <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
                <div className="px-4 py-2.5 bg-[#E8F5F0] border-b border-[#1D9E75]/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1D9E75]">
                    <ScanFace size={15} />
                    Xác thực khuôn mặt để chấm công {scannerLoai === "VAO" ? "VÀO" : "RA"}
                  </div>
                </div>
                <FaceRegister
                  onSuccess={handleChamCongFace}
                  onCancel={() => setScannerLoai(null)}
                />
              </div>
            )}

            {/* Action Buttons */}
            {!scannerLoai && (
              <div className="grid grid-cols-2 gap-3">
                {(!todayLog || !todayLog.gio_vao) && (
                  <button
                    onClick={() => openChamCongScanner("VAO")}
                    disabled={chamCongStatus.loading}
                    className="col-span-2 bg-[#1D9E75] hover:bg-[#158a63] disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    {chamCongStatus.loading ? (
                      <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</>
                    ) : (
                      <><ScanFace size={16} /> Chấm công VÀO (Quét mặt)</>
                    )}
                  </button>
                )}
                {todayLog && todayLog.gio_vao && !todayLog.gio_ra && (
                  <button
                    onClick={() => openChamCongScanner("RA")}
                    disabled={chamCongStatus.loading}
                    className="col-span-2 bg-[#ea580c] hover:bg-[#c2410c] disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    {chamCongStatus.loading ? (
                      <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</>
                    ) : (
                      <><ScanFace size={16} /> Chấm công RA (Quét mặt)</>
                    )}
                  </button>
                )}
                {todayLog && todayLog.gio_vao && todayLog.gio_ra && (
                  <div className="col-span-2 text-center py-3 text-sm text-[#1D9E75] font-medium bg-[#E8F5F0] rounded-lg border border-[#1D9E75]/10">
                    <CheckCircle2 size={16} className="inline mr-1.5" />
                    Đã hoàn tất chấm công hôm nay
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Section: Lịch Làm Việc ─── */}
      {activeSection === "LICH_CA" && (
        <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-semibold text-gray-800">
                {weekOffset === 0 ? "Lịch tuần này" : weekOffset === -1 ? "Tuần trước" : weekOffset === 1 ? "Tuần sau" : `Tuần (${weekOffset > 0 ? "+" : ""}${weekOffset})`}
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                {monday.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} — {weekDays[6].toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setWeekOffset(weekOffset - 1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <ChevronLeft size={16} />
              </button>
              {weekOffset !== 0 && (
                <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 text-[12px] font-medium bg-[#1D9E75] text-white rounded-lg">
                  Hôm nay
                </button>
              )}
              <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Week grid */}
          {loadingShifts ? (
            <div className="flex items-center justify-center py-10 text-gray-400 text-[13px]">
              <Loader2 size={16} className="animate-spin mr-2" /> Đang tải lịch ca...
            </div>
          ) : (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((d, idx) => {
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
              const status = getDayStatus(d);

              const dayShifts = shifts
                .filter((s) => s.ngay_lam_viec && sameDay(new Date(s.ngay_lam_viec), d))
                .sort((a, b) => {
                  const ta = a.ca_lam_viec?.gio_bat_dau ? new Date(a.ca_lam_viec.gio_bat_dau).getUTCHours() : 99;
                  const tb = b.ca_lam_viec?.gio_bat_dau ? new Date(b.ca_lam_viec.gio_bat_dau).getUTCHours() : 99;
                  return ta - tb;
                });
              const hasShifts = dayShifts.length > 0;

              let borderCls = "border-gray-100";
              let bgCls = "bg-white";
              if (isLeaveApproved) { borderCls = "border-[#A32D2D]/20"; bgCls = "bg-[#FCEBEB]/50"; }
              else if (isLeavePending) { borderCls = "border-[#BA7517]/20"; bgCls = "bg-[#FAEEDA]/50"; }
              else if (status === "today") { borderCls = "border-[#1D9E75]"; bgCls = "bg-[#E8F5F0]/50"; }
              else if (status === "completed" && hasShifts) { borderCls = "border-[#1D9E75]/20"; bgCls = "bg-[#E8F5F0]/30"; }
              else if (!hasShifts) { bgCls = "bg-gray-50"; }

              return (
                <div key={idx} className={`rounded-[8px] border p-3 ${borderCls} ${bgCls} min-h-[120px]`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase">{dayLabels[idx]}</span>
                    <span className={`text-[13px] font-bold ${
                      status === "today" ? "text-[#1D9E75]" : "text-gray-700"
                    }`}>
                      {d.getDate()}/{d.getMonth() + 1}
                    </span>
                  </div>

                  {isLeaveApproved ? (
                    <div className="mt-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#A32D2D] text-white">OFF</span>
                      <p className="text-[11px] text-[#A32D2D] mt-1.5">{LOAI_NGHI_LABEL[leaveForDay!.loai_nghi] ?? "Nghỉ"}</p>
                    </div>
                  ) : isLeavePending ? (
                    <div className="mt-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#BA7517] text-white">Chờ duyệt</span>
                      <p className="text-[11px] text-[#BA7517] mt-1.5">{LOAI_NGHI_LABEL[leaveForDay!.loai_nghi] ?? ""}</p>
                    </div>
                  ) : hasShifts ? (
                    <div className="space-y-1.5 mt-1">
                      {dayShifts.map((s) => {
                        const startH = s.ca_lam_viec?.gio_bat_dau ? new Date(s.ca_lam_viec.gio_bat_dau).getUTCHours() : 0;
                        const Icon = startH < 12 ? Coffee : Moon;
                        return (
                          <div key={s.id} className="flex items-center gap-1.5" title={s.ca_lam_viec?.ten_ca ?? ""}>
                            <Icon size={10} className="text-gray-400 shrink-0" />
                            <span className="text-[11px] text-gray-600">
                              {formatCaTime(s.ca_lam_viec?.gio_bat_dau)}–{formatCaTime(s.ca_lam_viec?.gio_ket_thuc)}
                            </span>
                          </div>
                        );
                      })}
                      {status === "today" && (
                        <p className="text-[10px] text-[#1D9E75] font-medium pl-4">Đang làm</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 text-center mt-4">Nghỉ</p>
                  )}

                  {hasShifts && !leaveForDay && status === "completed" && (
                    <div className="mt-2 flex justify-end">
                      <div className="w-4 h-4 rounded-full bg-[#1D9E75] flex items-center justify-center">
                        <Check size={10} className="text-white" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}

          <div className="mt-4 flex items-center gap-3 px-3 py-2.5 bg-[#F5F5F4] rounded-[8px] text-[12px] text-gray-500">
            <Clock size={14} className="text-gray-400 shrink-0" />
            Chấm công tự động bằng Facial Recognition tại cửa kho. Ngày nghỉ đã duyệt hiển thị OFF.
          </div>
        </div>
      )}

      {/* ─── Section: Nghỉ Phép ─── */}
      {activeSection === "NGHI_PHEP" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-[10px] shadow-sm border border-gray-100 p-5">
            <h2 className="text-[15px] font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Gửi đơn xin nghỉ</h2>

            {formSuccess && (
              <div className="mb-4 flex items-center gap-2 bg-[#E8F5F0] border border-[#1D9E75]/20 text-[#1D9E75] rounded-[8px] px-4 py-3 text-[13px] font-medium">
                <CheckCircle2 size={16} /> Đơn đã được gửi thành công!
              </div>
            )}
            {formError && (
              <div className="mb-4 flex items-start gap-2 bg-[#FCEBEB] border border-[#A32D2D]/20 text-[#A32D2D] rounded-[8px] px-4 py-3 text-[13px]">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span className="flex-1">{formError}</span>
                <button onClick={() => setFormError(null)}><X size={14} /></button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 uppercase tracking-[0.04em] mb-1.5">Loại nghỉ</label>
                  <select
                    value={form.loai_nghi}
                    onChange={(e) => setForm({ ...form, loai_nghi: e.target.value })}
                    className="w-full border border-gray-200 rounded-[8px] bg-white p-2.5 text-[14px] focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] outline-none"
                  >
                    <option value="PHEP_NAM">Nghỉ Phép Năm (Có Lương)</option>
                    <option value="NGHI_BENH">Nghỉ Bệnh</option>
                    <option value="NGHI_KHONG_LUONG">Nghỉ Không Lương</option>
                    <option value="NGHI_LE">Nghỉ Lễ</option>
                    <option value="VIEC_RIENG">Nghỉ Việc Riêng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 uppercase tracking-[0.04em] mb-1.5">Phép năm còn lại</label>
                  <div className="border border-[#1D9E75]/20 rounded-[8px] bg-[#E8F5F0] p-2.5 text-[14px] font-bold text-[#1D9E75] text-center">
                    5 ngày
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 uppercase tracking-[0.04em] mb-1.5">Từ ngày <span className="text-[#A32D2D]">*</span></label>
                  <input
                    type="date"
                    required
                    value={form.ngay_bat_dau}
                    onChange={(e) => setForm({ ...form, ngay_bat_dau: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-200 rounded-[8px] bg-white p-2.5 text-[14px] focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 uppercase tracking-[0.04em] mb-1.5">Đến ngày <span className="text-[#A32D2D]">*</span></label>
                  <input
                    type="date"
                    required
                    value={form.ngay_ket_thuc}
                    onChange={(e) => setForm({ ...form, ngay_ket_thuc: e.target.value })}
                    min={form.ngay_bat_dau || new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-200 rounded-[8px] bg-white p-2.5 text-[14px] focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] outline-none"
                  />
                </div>
              </div>

              {form.ngay_bat_dau && form.ngay_ket_thuc && (
                <p className="text-[12px] text-[#1D9E75] font-medium">
                  Tổng: {calcDays(form.ngay_bat_dau, form.ngay_ket_thuc)} ngày
                </p>
              )}

              <div>
                <label className="block text-[12px] font-medium text-gray-500 uppercase tracking-[0.04em] mb-1.5">Lý do</label>
                <textarea
                  rows={3}
                  value={form.ly_do}
                  onChange={(e) => setForm({ ...form, ly_do: e.target.value })}
                  className="w-full border border-gray-200 rounded-[8px] bg-white p-2.5 text-[14px] focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] outline-none resize-none placeholder:text-gray-400"
                  placeholder="Trình bày lý do xin nghỉ..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#1D9E75] hover:bg-[#158a63] disabled:bg-gray-300 text-white px-5 py-2.5 rounded-[8px] text-[14px] font-semibold flex items-center gap-2 transition-colors"
                >
                  {submitting ? <><Loader2 size={15} className="animate-spin" /> Đang gửi...</> : <><Send size={15} /> Gửi đơn</>}
                </button>
              </div>
            </form>
          </div>

          {/* History */}
          <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-5">
            <h3 className="text-[15px] font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">Lịch sử đơn nghỉ</h3>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8 text-gray-400 text-[13px]">
                <Loader2 size={16} className="animate-spin mr-2" /> Đang tải...
              </div>
            ) : donList.length === 0 ? (
              <p className="text-[13px] text-gray-400 text-center py-8">Chưa có đơn nào.</p>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto">
                {donList.map((don) => {
                  const cfg = TRANG_THAI_CONFIG[don.trang_thai] ?? { label: don.trang_thai, cls: "bg-gray-100 text-gray-600" };
                  return (
                    <div key={don.id} className="border border-gray-100 bg-[#F5F5F4] p-3 rounded-[8px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-800 text-[13px]">{LOAI_NGHI_LABEL[don.loai_nghi] ?? don.loai_nghi}</p>
                          <p className="text-gray-500 text-[12px] mt-0.5">
                            {formatDate(don.ngay_bat_dau)} → {formatDate(don.ngay_ket_thuc)}
                          </p>
                        </div>
                        <span className={`shrink-0 font-semibold px-2 py-0.5 rounded text-[10px] ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Section: Đổi Mật Khẩu ─── */}
      {activeSection === "DOI_MAT_KHAU" && (
        <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-5 max-w-lg">
          <h2 className="text-[15px] font-semibold text-gray-800 mb-1">Đổi mật khẩu</h2>
          <p className="text-[12px] text-gray-400 mb-4 pb-3 border-b border-gray-100">Bảo vệ tài khoản với mật khẩu mạnh</p>

          {pwSuccess && (
            <div className="mb-4 flex items-center gap-2 bg-[#E8F5F0] border border-[#1D9E75]/20 text-[#1D9E75] rounded-[8px] px-4 py-3 text-[13px] font-medium">
              <CheckCircle2 size={16} /> Đổi mật khẩu thành công!
            </div>
          )}
          {pwError && (
            <div className="mb-4 flex items-start gap-2 bg-[#FCEBEB] border border-[#A32D2D]/20 text-[#A32D2D] rounded-[8px] px-4 py-3 text-[13px]">
              <AlertCircle size={16} className="mt-0.5" /> <span className="flex-1">{pwError}</span>
              <button onClick={() => setPwError(null)}><X size={14} /></button>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 uppercase tracking-[0.04em] mb-1.5">Mật khẩu hiện tại</label>
              <div className="flex items-center border border-gray-200 rounded-[8px] bg-white px-3 focus-within:ring-2 focus-within:ring-[#1D9E75]/30 focus-within:border-[#1D9E75]">
                <input type={showOld ? "text" : "password"} required value={pwForm.oldPassword} onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })} placeholder="••••••••" className="flex-1 bg-transparent py-2.5 text-[14px] outline-none" />
                <button type="button" onClick={() => setShowOld(!showOld)} className="text-gray-400 hover:text-gray-600">{showOld ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 uppercase tracking-[0.04em] mb-1.5">Mật khẩu mới</label>
              <div className="flex items-center border border-gray-200 rounded-[8px] bg-white px-3 focus-within:ring-2 focus-within:ring-[#1D9E75]/30 focus-within:border-[#1D9E75]">
                <input type={showNew ? "text" : "password"} required value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="Ít nhất 6 ký tự" className="flex-1 bg-transparent py-2.5 text-[14px] outline-none" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="text-gray-400 hover:text-gray-600">{showNew ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 uppercase tracking-[0.04em] mb-1.5">Xác nhận mật khẩu mới</label>
              <div className="flex items-center border border-gray-200 rounded-[8px] bg-white px-3 focus-within:ring-2 focus-within:ring-[#1D9E75]/30 focus-within:border-[#1D9E75]">
                <input type={showConfirm ? "text" : "password"} required value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} placeholder="Nhập lại" className="flex-1 bg-transparent py-2.5 text-[14px] outline-none" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600">{showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
              {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                <p className="text-[11px] text-[#A32D2D] mt-1">Mật khẩu không khớp</p>
              )}
            </div>
            <button type="submit" disabled={pwLoading} className="w-full bg-[#1D9E75] hover:bg-[#158a63] disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-[8px] text-[14px] flex items-center justify-center gap-2 transition-colors">
              {pwLoading ? <><Loader2 size={15} className="animate-spin" /> Đang xử lý...</> : <><KeyRound size={15} /> Đổi mật khẩu</>}
            </button>
          </form>
        </div>
      )}

      {/* ─── Section: FaceID ─── */}
      {activeSection === "FACE_ID" && (
        <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-5 max-w-lg">
          <h2 className="text-[15px] font-semibold text-gray-800 mb-1">Đăng nhập FaceID</h2>
          <p className="text-[12px] text-gray-400 mb-4 pb-3 border-b border-gray-100">Đăng nhập nhanh bằng nhận diện khuôn mặt</p>

          {faceMsg && (
            <div className={`mb-4 flex items-center gap-2 rounded-[8px] px-4 py-3 text-[13px] font-medium border ${
              faceMsg.type === "success"
                ? "bg-[#E8F5F0] border-[#1D9E75]/20 text-[#1D9E75]"
                : "bg-[#FCEBEB] border-[#A32D2D]/20 text-[#A32D2D]"
            }`}>
              {faceMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {faceMsg.text}
            </div>
          )}

          {hasFaceData === null ? (
            <div className="flex items-center justify-center py-8 text-gray-400 text-[13px]">
              <Loader2 size={16} className="animate-spin mr-2" /> Đang kiểm tra...
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`rounded-[8px] p-4 flex items-center gap-3 border ${
                hasFaceData ? "bg-[#E8F5F0] border-[#1D9E75]/20" : "bg-[#F5F5F4] border-gray-200"
              }`}>
                <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center ${
                  hasFaceData ? "bg-[#1D9E75]/10" : "bg-gray-200"
                }`}>
                  <ShieldCheck size={20} className={hasFaceData ? "text-[#1D9E75]" : "text-gray-400"} />
                </div>
                <div>
                  <p className={`font-semibold text-[14px] ${hasFaceData ? "text-[#1D9E75]" : "text-gray-600"}`}>
                    {hasFaceData ? "Đã đăng ký FaceID" : "Chưa đăng ký FaceID"}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    {hasFaceData ? "Đăng nhập bằng khuôn mặt đã sẵn sàng." : "Đăng ký để đăng nhập không cần mật khẩu."}
                  </p>
                </div>
              </div>

              {showFaceScanner && (
                <FaceRegister onSuccess={handleFaceSuccess} onCancel={() => setShowFaceScanner(false)} />
              )}

              {!showFaceScanner && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setFaceMsg(null); setShowFaceScanner(true); }}
                    disabled={faceLoading}
                    className="w-full bg-[#1D9E75] hover:bg-[#158a63] disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-[8px] text-[14px] flex items-center justify-center gap-2 transition-colors"
                  >
                    {faceLoading ? <><Loader2 size={15} className="animate-spin" /> Đang lưu...</> : <><ScanFace size={15} /> {hasFaceData ? "Cập nhật FaceID" : "Đăng ký khuôn mặt"}</>}
                  </button>
                  {hasFaceData && (
                    <button
                      onClick={handleDeleteFace}
                      disabled={faceLoading}
                      className="w-full bg-white border border-[#A32D2D]/30 hover:bg-[#FCEBEB] disabled:opacity-50 text-[#A32D2D] font-semibold py-2.5 rounded-[8px] text-[14px] flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 size={15} /> Xóa dữ liệu FaceID
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
