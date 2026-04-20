"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, X,
  ShieldCheck, ArrowRight, ScanFace, Trash2, Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FaceRegister = dynamic(() => import("@/components/FaceRegister"), { ssr: false });

type Tab = "PASSWORD" | "FACE_ID";

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("PASSWORD");

  // ── Đổi mật khẩu ────────────────────────────────────────────────────────
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);
    if (form.newPassword !== form.confirmPassword) { setPwError("Mật khẩu mới và xác nhận không khớp"); return; }
    if (form.newPassword.length < 6) { setPwError("Mật khẩu mới phải ít nhất 6 ký tự"); return; }
    setPwLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: form.oldPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setPwSuccess(true);
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPwError(err.message ?? "Đã xảy ra lỗi");
    } finally {
      setPwLoading(false);
    }
  };

  const strength = (pwd: string) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { level: 1, label: "Quá ngắn", color: "bg-red-400" };
    if (pwd.length < 8) return { level: 2, label: "Yếu", color: "bg-orange-400" };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { level: 3, label: "Trung bình", color: "bg-yellow-400" };
    return { level: 4, label: "Mạnh", color: "bg-[#007A33]" };
  };
  const pwStrength = strength(form.newPassword);

  // ── FaceID ───────────────────────────────────────────────────────────────
  const [hasFaceData, setHasFaceData] = useState<boolean | null>(null);
  const [faceLoading, setFaceLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [faceMsg, setFaceMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchFaceStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/user/face-data");
      const json = await res.json();
      if (json.success) setHasFaceData(json.hasFaceData);
    } catch { setHasFaceData(false); }
  }, []);

  useEffect(() => {
    if (activeTab === "FACE_ID") fetchFaceStatus();
  }, [activeTab, fetchFaceStatus]);

  const handleFaceSuccess = async (descriptor: number[]) => {
    setShowScanner(false);
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
      setFaceMsg({ type: "success", text: "Đã lưu FaceID thành công! Bạn có thể đăng nhập nhanh lần sau." });
      setHasFaceData(true);
    } catch (err: any) {
      setFaceMsg({ type: "error", text: err.message ?? "Lưu thất bại" });
    } finally {
      setFaceLoading(false);
    }
  };

  const handleDeleteFace = async () => {
    if (!confirm("Xóa dữ liệu FaceID? Bạn sẽ không thể đăng nhập bằng khuôn mặt cho đến khi đăng ký lại.")) return;
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

  return (
    <div className="max-w-xl mx-auto py-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <Shield size={22} className="text-[#007A33]" />
            </div>
            <h1 className="text-2xl font-black text-slate-800">Bảo mật tài khoản</h1>
          </div>
          <p className="text-sm text-slate-400 ml-[52px]">Quản lý mật khẩu và xác thực khuôn mặt</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl">
          {([
            { id: "PASSWORD", label: "Đổi Mật Khẩu", icon: KeyRound },
            { id: "FACE_ID", label: "FaceID", icon: ScanFace },
          ] as { id: Tab; label: string; icon: any }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[#007A33] shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── TAB ĐỔI MẬT KHẨU ─────────────────────────────────────────── */}
          {activeTab === "PASSWORD" && (
            <motion.div key="pw" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}>

              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 mb-5 flex items-start gap-3">
                <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-700">
                  <p className="font-bold text-emerald-800 mb-0.5">Mẹo bảo mật</p>
                  <p>Dùng ít nhất 8 ký tự, kết hợp chữ hoa, số và ký tự đặc biệt.</p>
                </div>
              </div>

              {pwSuccess && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mb-5 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm font-medium">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  Đổi mật khẩu thành công!
                </motion.div>
              )}
              {pwError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{pwError}</span>
                  <button onClick={() => setPwError(null)} className="ml-auto"><X size={14} /></button>
                </motion.div>
              )}

              <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                {/* Old */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mật khẩu hiện tại <span className="text-red-400">*</span></label>
                  <div className={`flex items-center border rounded-xl px-4 py-3 transition-all ${form.oldPassword ? "border-[#007A33]/40 bg-emerald-50/20" : "border-slate-200 bg-slate-50"} focus-within:ring-2 focus-within:ring-[#007A33]/20`}>
                    <KeyRound size={15} className="text-slate-400 mr-3 flex-shrink-0" />
                    <input type={showOld ? "text" : "password"} required value={form.oldPassword}
                      onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                      placeholder="Mật khẩu hiện tại"
                      className="flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300" />
                    <button type="button" onClick={() => setShowOld(!showOld)} className="text-slate-400 hover:text-[#007A33]">
                      {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-100" />

                {/* New */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mật khẩu mới <span className="text-red-400">*</span></label>
                  <div className={`flex items-center border rounded-xl px-4 py-3 transition-all ${form.newPassword ? "border-[#007A33]/40 bg-emerald-50/20" : "border-slate-200 bg-slate-50"} focus-within:ring-2 focus-within:ring-[#007A33]/20`}>
                    <KeyRound size={15} className="text-slate-400 mr-3 flex-shrink-0" />
                    <input type={showNew ? "text" : "password"} required value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      placeholder="Ít nhất 6 ký tự"
                      className="flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300" />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="text-slate-400 hover:text-[#007A33]">
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {pwStrength && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">{[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwStrength.level ? pwStrength.color : "bg-slate-200"}`} />)}</div>
                      <p className="text-xs text-slate-400">Độ mạnh: <span className={`font-bold ${pwStrength.level >= 3 ? "text-[#007A33]" : "text-orange-500"}`}>{pwStrength.label}</span></p>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Xác nhận mật khẩu mới <span className="text-red-400">*</span></label>
                  <div className={`flex items-center border rounded-xl px-4 py-3 transition-all ${
                    form.confirmPassword
                      ? form.confirmPassword === form.newPassword ? "border-[#007A33] bg-emerald-50/20" : "border-red-300 bg-red-50/20"
                      : "border-slate-200 bg-slate-50"
                  } focus-within:ring-2 focus-within:ring-[#007A33]/20`}>
                    <KeyRound size={15} className="text-slate-400 mr-3 flex-shrink-0" />
                    <input type={showConfirm ? "text" : "password"} required value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Nhập lại mật khẩu mới"
                      className="flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-slate-400 hover:text-[#007A33]">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {form.confirmPassword && form.newPassword !== form.confirmPassword && <p className="text-xs text-red-500 mt-1.5 font-medium">⚠ Mật khẩu không khớp</p>}
                  {form.confirmPassword && form.newPassword === form.confirmPassword && <p className="text-xs text-[#007A33] mt-1.5 font-medium">✓ Mật khẩu khớp</p>}
                </div>

                <div className="pt-1">
                  <button type="submit" disabled={pwLoading}
                    className="w-full bg-[#007A33] hover:bg-[#006329] active:scale-[0.98] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
                    {pwLoading ? <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</> : <><KeyRound size={15} /> Cập nhật mật khẩu <ArrowRight size={15} /></>}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── TAB FACEID ───────────────────────────────────────────────── */}
          {activeTab === "FACE_ID" && (
            <motion.div key="face" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>

              {faceMsg && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`mb-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium border ${
                    faceMsg.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
                  }`}>
                  {faceMsg.type === "success" ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-red-500" />}
                  <span className="flex-1">{faceMsg.text}</span>
                  <button onClick={() => setFaceMsg(null)}><X size={14} /></button>
                </motion.div>
              )}

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">

                {/* Status */}
                {hasFaceData === null ? (
                  <div className="flex items-center justify-center py-8 text-slate-400">
                    <Loader2 size={22} className="animate-spin mr-2" /> Đang kiểm tra...
                  </div>
                ) : (
                  <>
                    {/* Status card */}
                    <div className={`rounded-2xl p-5 flex items-center gap-4 border-2 transition-all ${
                      hasFaceData ? "border-[#007A33]/30 bg-emerald-50/50" : "border-slate-200 bg-slate-50"
                    }`}>
                      <div className={`p-3 rounded-full ${hasFaceData ? "bg-[#007A33]/10" : "bg-slate-200"}`}>
                        <ScanFace size={30} className={hasFaceData ? "text-[#007A33]" : "text-slate-400"} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold ${hasFaceData ? "text-[#007A33]" : "text-slate-500"}`}>
                          {hasFaceData ? "✅ FaceID đã được kích hoạt" : "⛔ Chưa đăng ký FaceID"}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {hasFaceData
                            ? "Bạn có thể đăng nhập nhanh bằng khuôn mặt mà không cần nhập mật khẩu."
                            : "Đăng ký khuôn mặt để đăng nhập chỉ với 1 cái nhìn vào camera."}
                        </p>
                      </div>
                      {hasFaceData && <ShieldCheck size={24} className="text-[#007A33]" />}
                    </div>

                    {/* Hướng dẫn khi chưa đăng ký */}
                    {!hasFaceData && !showScanner && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 space-y-1.5">
                        <p className="font-bold text-blue-800">📋 Hướng dẫn đăng ký FaceID:</p>
                        <p>① Nhấn "Đăng ký khuôn mặt" và cho phép truy cập camera</p>
                        <p>② Nhìn thẳng vào camera trong điều kiện ánh sáng tốt</p>
                        <p>③ Giữ yên trong ~5 giây để hệ thống chụp 5 ảnh</p>
                        <p>④ Sau đó dùng FaceID để đăng nhập tại trang đăng nhập</p>
                      </div>
                    )}

                    {/* Camera */}
                    {showScanner && (
                      <FaceRegister
                        onSuccess={handleFaceSuccess}
                        onCancel={() => setShowScanner(false)}
                      />
                    )}

                    {/* Actions */}
                    {!showScanner && (
                      <div className="space-y-3">
                        <button
                          onClick={() => { setFaceMsg(null); setShowScanner(true); }}
                          disabled={faceLoading}
                          className="w-full bg-[#007A33] hover:bg-[#006329] active:scale-[0.98] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                        >
                          {faceLoading
                            ? <><Loader2 size={16} className="animate-spin" /> Đang lưu...</>
                            : <><ScanFace size={16} /> {hasFaceData ? "Cập nhật FaceID" : "Đăng ký khuôn mặt"}</>
                          }
                        </button>

                        {hasFaceData && (
                          <button
                            onClick={handleDeleteFace}
                            disabled={faceLoading}
                            className="w-full bg-red-50 hover:bg-red-100 active:scale-[0.98] disabled:opacity-60 text-red-600 font-bold py-3 rounded-xl text-sm border border-red-200 flex items-center justify-center gap-2 transition-all"
                          >
                            <Trash2 size={15} /> Xóa dữ liệu FaceID
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Privacy note */}
              <p className="text-center text-[11px] text-slate-400 mt-4 leading-relaxed">
                🔒 Dữ liệu khuôn mặt được mã hóa và lưu trữ an toàn trong hệ thống.
                Chúng tôi không chia sẻ thông tin sinh trắc học của bạn.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
