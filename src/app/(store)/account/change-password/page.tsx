"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, X,
  ShieldCheck, ScanFace, Trash2,
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
    <div className="sec-page">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 className="sec-page__title">Bảo mật tài khoản</h1>
          <p className="sec-page__sub">Quản lý mật khẩu và xác thực khuôn mặt</p>
        </div>

        {/* Tabs */}
        <div className="sec-tabs">
          {([
            { id: "PASSWORD", label: "Đổi mật khẩu", icon: KeyRound },
            { id: "FACE_ID", label: "FaceID", icon: ScanFace },
          ] as { id: Tab; label: string; icon: any }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sec-tab${activeTab === tab.id ? " sec-tab--active" : ""}`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── TAB ĐỔI MẬT KHẨU ── */}
          {activeTab === "PASSWORD" && (
            <motion.div key="pw" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}>

              {/* Alert messages */}
              {pwSuccess && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sec-alert sec-alert--success">
                  <CheckCircle2 size={16} /> Đổi mật khẩu thành công!
                </motion.div>
              )}
              {pwError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sec-alert sec-alert--error">
                  <AlertCircle size={16} />
                  <span style={{ flex: 1 }}>{pwError}</span>
                  <button type="button" onClick={() => setPwError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex" }}><X size={14} /></button>
                </motion.div>
              )}

              <div className="sec-card">
                {/* Security tip banner */}
                <div className="sec-tip">
                  <ShieldCheck size={16} style={{ color: "#16a34a", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p className="sec-tip__title">Mẹo bảo mật</p>
                    <p className="sec-tip__text">Dùng ít nhất 8 ký tự, kết hợp chữ hoa, số và ký tự đặc biệt.</p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
                  {/* Mật khẩu hiện tại */}
                  <div>
                    <label className="sec-label">Mật khẩu hiện tại <span style={{ color: "#ef4444" }}>*</span></label>
                    <div className={`sec-input-wrap${form.oldPassword ? " sec-input-wrap--filled" : ""}`}>
                      <input
                        type={showOld ? "text" : "password"}
                        required
                        value={form.oldPassword}
                        onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                        placeholder="Nhập mật khẩu hiện tại"
                        className="sec-input"
                      />
                      <button type="button" onClick={() => setShowOld(!showOld)} className="sec-eye-btn">
                        {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Mật khẩu mới */}
                  <div>
                    <label className="sec-label">Mật khẩu mới <span style={{ color: "#ef4444" }}>*</span></label>
                    <div className={`sec-input-wrap${form.newPassword ? " sec-input-wrap--filled" : ""}`}>
                      <input
                        type={showNew ? "text" : "password"}
                        required
                        value={form.newPassword}
                        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                        placeholder="Ít nhất 6 ký tự"
                        className="sec-input"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="sec-eye-btn">
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {pwStrength && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {[1,2,3,4].map(i => (
                            <div key={i} style={{ height: 4, flex: 1, borderRadius: 99, background: i <= pwStrength.level ? (pwStrength.level >= 3 ? "#16a34a" : "#f97316") : "#e5e7eb", transition: "background 200ms" }} />
                          ))}
                        </div>
                        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                          Độ mạnh: <span style={{ fontWeight: 500, color: pwStrength.level >= 3 ? "#16a34a" : "#f97316" }}>{pwStrength.label}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Xác nhận mật khẩu mới */}
                  <div>
                    <label className="sec-label">Xác nhận mật khẩu mới <span style={{ color: "#ef4444" }}>*</span></label>
                    <div className={`sec-input-wrap${form.confirmPassword ? (form.confirmPassword === form.newPassword ? " sec-input-wrap--ok" : " sec-input-wrap--error") : ""}`}>
                      <input
                        type={showConfirm ? "text" : "password"}
                        required
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        placeholder="Nhập lại mật khẩu mới"
                        className="sec-input"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="sec-eye-btn">
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                      <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>Mật khẩu không khớp</p>
                    )}
                    {form.confirmPassword && form.newPassword === form.confirmPassword && (
                      <p style={{ fontSize: 12, color: "#16a34a", marginTop: 4 }}>Mật khẩu khớp</p>
                    )}
                  </div>

                  <button type="submit" disabled={pwLoading} className="sec-submit-btn">
                    {pwLoading ? <><Loader2 size={15} className="animate-spin" /> Đang xử lý...</> : "Cập nhật mật khẩu"}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── TAB FACEID ── */}
          {activeTab === "FACE_ID" && (
            <motion.div key="face" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>

              {faceMsg && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`sec-alert${faceMsg.type === "success" ? " sec-alert--success" : " sec-alert--error"}`}>
                  {faceMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span style={{ flex: 1 }}>{faceMsg.text}</span>
                  <button type="button" onClick={() => setFaceMsg(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex" }}><X size={14} /></button>
                </motion.div>
              )}

              <div className="sec-card" style={{ marginTop: 16 }}>
                {hasFaceData === null ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0", color: "#9ca3af", gap: 8 }}>
                    <Loader2 size={20} className="animate-spin" /> Đang kiểm tra...
                  </div>
                ) : (
                  <>
                    {/* Status row */}
                    <div className={`sec-face-status${hasFaceData ? " sec-face-status--active" : ""}`}>
                      <div className="sec-face-icon-wrap">
                        <ScanFace size={24} color={hasFaceData ? "#16a34a" : "#9ca3af"} />
                        {!hasFaceData && <span className="sec-face-dot" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="sec-face-title">
                          {hasFaceData ? "FaceID đã được kích hoạt" : "Chưa đăng ký FaceID"}
                        </p>
                        <p className="sec-face-sub">
                          {hasFaceData
                            ? "Bạn có thể đăng nhập nhanh bằng khuôn mặt mà không cần nhập mật khẩu."
                            : "Đăng ký khuôn mặt để đăng nhập chỉ với 1 cái nhìn vào camera."}
                        </p>
                      </div>
                      {hasFaceData && <ShieldCheck size={20} color="#16a34a" />}
                    </div>

                    {/* Hướng dẫn */}
                    {!hasFaceData && !showScanner && (
                      <div className="sec-guide">
                        <p className="sec-guide__title">Hướng dẫn đăng ký FaceID</p>
                        <p className="sec-guide__step">1. Nhấn "Đăng ký khuôn mặt" và cho phép truy cập camera</p>
                        <p className="sec-guide__step">2. Nhìn thẳng vào camera trong điều kiện ánh sáng tốt</p>
                        <p className="sec-guide__step">3. Giữ yên trong ~5 giây để hệ thống chụp 5 ảnh</p>
                        <p className="sec-guide__step">4. Sau đó dùng FaceID để đăng nhập tại trang đăng nhập</p>
                      </div>
                    )}

                    {/* Camera */}
                    {showScanner && (
                      <FaceRegister onSuccess={handleFaceSuccess} onCancel={() => setShowScanner(false)} />
                    )}

                    {/* Actions */}
                    {!showScanner && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                        <button
                          onClick={() => { setFaceMsg(null); setShowScanner(true); }}
                          disabled={faceLoading}
                          className="sec-submit-btn"
                        >
                          {faceLoading
                            ? <><Loader2 size={15} className="animate-spin" /> Đang lưu...</>
                            : <><ScanFace size={15} /> {hasFaceData ? "Cập nhật FaceID" : "Đăng ký khuôn mặt"}</>
                          }
                        </button>
                        {hasFaceData && (
                          <button onClick={handleDeleteFace} disabled={faceLoading} className="sec-delete-btn">
                            <Trash2 size={14} /> Xóa dữ liệu FaceID
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <p className="sec-disclaimer">
                Dữ liệu khuôn mặt được mã hóa và lưu trữ an toàn. Chúng tôi không chia sẻ thông tin sinh trắc học của bạn.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
