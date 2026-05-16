"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { signOut, useSession } from "next-auth/react";
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ShieldCheck,
  ScanFace,
  Trash2,
  UserCog,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

const FaceRegister = dynamic(() => import("@/components/FaceRegister"), { ssr: false });

type Tab = "PASSWORD" | "FACE_ID";

export default function AdminAccountPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("PASSWORD");

  // ── Đổi mật khẩu ─────────────────────────────────────────────
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
    if (form.newPassword !== form.confirmPassword) {
      setPwError("Mật khẩu mới và xác nhận không khớp");
      return;
    }
    if (form.newPassword.length < 6) {
      setPwError("Mật khẩu mới phải ít nhất 6 ký tự");
      return;
    }
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
      if (data.forceLogout) {
        setTimeout(() => signOut({ callbackUrl: "/login" }), 2000);
      }
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
    return { level: 4, label: "Mạnh", color: "bg-emerald-500" };
  };
  const pwStrength = strength(form.newPassword);

  // ── FaceID ───────────────────────────────────────────────────
  const [hasFaceData, setHasFaceData] = useState<boolean | null>(null);
  const [faceLoading, setFaceLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [faceMsg, setFaceMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const fetchFaceStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/user/face-data");
      const json = await res.json();
      if (json.success) setHasFaceData(json.hasFaceData);
    } catch {
      setHasFaceData(false);
    }
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
      setFaceMsg({
        type: "success",
        text: "Đã lưu Face ID thành công. Bạn có thể đăng nhập nhanh bằng khuôn mặt ở lần sau.",
      });
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
      title: "Xoá dữ liệu Face ID",
      message: "Xác nhận xoá dữ liệu Face ID? Bạn sẽ không thể đăng nhập bằng khuôn mặt cho đến khi đăng ký lại.",
      onConfirm: async () => {
        setConfirmDialog((p) => ({ ...p, isOpen: false }));
        setFaceLoading(true);
        try {
          await fetch("/api/user/face-data", { method: "DELETE" });
          setHasFaceData(false);
          setFaceMsg({ type: "success", text: "Đã xoá dữ liệu Face ID" });
        } catch {
          setFaceMsg({ type: "error", text: "Xoá thất bại" });
        } finally {
          setFaceLoading(false);
        }
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
          <UserCog size={24} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tài khoản của tôi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý mật khẩu và xác thực Face ID</p>
        </div>
      </div>

      {/* Card thông tin tài khoản */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
            {session?.user?.email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-900">
              {(session?.user as any)?.name || "Quản trị viên"}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Mail size={13} /> {session?.user?.email ?? "—"}
            </p>
          </div>
          <span className="ml-auto px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
            Admin
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
        {(
          [
            { id: "PASSWORD" as const, label: "Đổi mật khẩu", icon: KeyRound },
            { id: "FACE_ID" as const, label: "Face ID", icon: ScanFace },
          ]
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all ${
                active
                  ? "bg-emerald-600 text-white shadow"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ── TAB ĐỔI MẬT KHẨU ── */}
        {activeTab === "PASSWORD" && (
          <motion.div
            key="pw"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
          >
            {pwSuccess && (
              <div className="mb-3 flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
                <CheckCircle2 size={16} className="mt-0.5" />
                <span>Đổi mật khẩu thành công. Hệ thống sẽ đăng xuất trong giây lát...</span>
              </div>
            )}
            {pwError && (
              <div className="mb-3 flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
                <AlertCircle size={16} className="mt-0.5" />
                <span className="flex-1">{pwError}</span>
                <button onClick={() => setPwError(null)} className="text-rose-500 hover:text-rose-700">
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-3 p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl mb-5">
                <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Mẹo bảo mật</p>
                  <p className="text-xs text-emerald-800/80 mt-0.5">
                    Dùng ít nhất 8 ký tự, kết hợp chữ hoa, số và ký tự đặc biệt.
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Mật khẩu hiện tại */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mật khẩu hiện tại <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showOld ? "text" : "password"}
                      required
                      value={form.oldPassword}
                      onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld(!showOld)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Mật khẩu mới */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      required
                      value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      placeholder="Ít nhất 6 ký tự"
                      className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {pwStrength && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i <= pwStrength.level ? pwStrength.color : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Độ mạnh:{" "}
                        <span
                          className={`font-medium ${
                            pwStrength.level >= 3 ? "text-emerald-600" : "text-orange-500"
                          }`}
                        >
                          {pwStrength.label}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Nhập lại mật khẩu mới"
                      className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-xl outline-none focus:ring-2 transition ${
                        form.confirmPassword && form.newPassword !== form.confirmPassword
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                          : form.confirmPassword && form.newPassword === form.confirmPassword
                          ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100"
                          : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                    <p className="text-xs text-rose-500 mt-1">Mật khẩu không khớp</p>
                  )}
                  {form.confirmPassword && form.newPassword === form.confirmPassword && (
                    <p className="text-xs text-emerald-600 mt-1">Mật khẩu khớp</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition shadow-sm"
                >
                  {pwLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Đang xử lý...
                    </>
                  ) : (
                    "Cập nhật mật khẩu"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── TAB FACE ID ── */}
        {activeTab === "FACE_ID" && (
          <motion.div
            key="face"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
          >
            {faceMsg && (
              <div
                className={`mb-3 flex items-start gap-2 p-3 rounded-xl text-sm border ${
                  faceMsg.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {faceMsg.type === "success" ? (
                  <CheckCircle2 size={16} className="mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="mt-0.5" />
                )}
                <span className="flex-1">{faceMsg.text}</span>
                <button onClick={() => setFaceMsg(null)} className="opacity-60 hover:opacity-100">
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              {hasFaceData === null ? (
                <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
                  <Loader2 size={18} className="animate-spin" /> Đang kiểm tra...
                </div>
              ) : (
                <>
                  {/* Status row */}
                  <div
                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                      hasFaceData
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        hasFaceData ? "bg-white" : "bg-white"
                      }`}
                    >
                      <ScanFace
                        size={26}
                        className={hasFaceData ? "text-emerald-600" : "text-gray-400"}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${hasFaceData ? "text-emerald-900" : "text-gray-700"}`}>
                        {hasFaceData ? "Face ID đã được kích hoạt" : "Chưa đăng ký Face ID"}
                      </p>
                      <p className={`text-xs mt-0.5 ${hasFaceData ? "text-emerald-700/80" : "text-gray-500"}`}>
                        {hasFaceData
                          ? "Bạn có thể đăng nhập nhanh bằng khuôn mặt mà không cần mật khẩu."
                          : "Đăng ký khuôn mặt để đăng nhập chỉ với một cái nhìn vào camera."}
                      </p>
                    </div>
                    {hasFaceData && <ShieldCheck size={20} className="text-emerald-600" />}
                  </div>

                  {/* Hướng dẫn */}
                  {!hasFaceData && !showScanner && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-700 space-y-1.5">
                      <p className="font-semibold text-gray-900 mb-1">Hướng dẫn đăng ký Face ID</p>
                      <p>1. Nhấn "Đăng ký khuôn mặt" và cho phép truy cập camera</p>
                      <p>2. Nhìn thẳng vào camera trong điều kiện ánh sáng tốt</p>
                      <p>3. Giữ yên khoảng 5 giây để hệ thống thu nhận dữ liệu</p>
                      <p>4. Lần sau dùng Face ID để đăng nhập tại trang đăng nhập</p>
                    </div>
                  )}

                  {/* Camera */}
                  {showScanner && (
                    <div className="mt-4">
                      <FaceRegister onSuccess={handleFaceSuccess} onCancel={() => setShowScanner(false)} />
                    </div>
                  )}

                  {/* Actions */}
                  {!showScanner && (
                    <div className="mt-4 flex flex-col gap-2.5">
                      <button
                        onClick={() => {
                          setFaceMsg(null);
                          setShowScanner(true);
                        }}
                        disabled={faceLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition shadow-sm"
                      >
                        {faceLoading ? (
                          <>
                            <Loader2 size={15} className="animate-spin" /> Đang lưu...
                          </>
                        ) : (
                          <>
                            <ScanFace size={15} />
                            {hasFaceData ? "Cập nhật Face ID" : "Đăng ký khuôn mặt"}
                          </>
                        )}
                      </button>
                      {hasFaceData && (
                        <button
                          onClick={handleDeleteFace}
                          disabled={faceLoading}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-sm font-semibold rounded-xl transition"
                        >
                          <Trash2 size={14} /> Xoá dữ liệu Face ID
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
              Dữ liệu khuôn mặt được mã hoá và lưu trữ an toàn. Không chia sẻ thông tin sinh trắc học của bạn.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
        confirmText="Xoá"
        cancelText="Huỷ"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((p) => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
