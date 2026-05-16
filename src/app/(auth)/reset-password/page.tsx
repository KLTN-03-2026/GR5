"use client";

import React, { useState, Suspense } from "react";
import { Lock, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (password.length < 6) {
      toast.error("Mật khẩu ít nhất phải có 6 ký tự!");
      return;
    }

    if (!token) {
      toast.error("Phiên xác thực không hợp lệ. Vui lòng thực hiện lại từ đầu!");
      router.push("/forgot-password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, token }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Mật khẩu của bạn đã được đổi thành công.");
        router.push("/login");
      } else {
        toast.error(data.message || "Có lỗi xảy ra, thử lại sau!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-[440px] bg-white rounded-3xl p-10 md:p-14 shadow-xl border border-emerald-50"
    >
      <header className="mb-10 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-[#008A3D] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock size={32} />
        </div>
        <h1 className="text-[28px] font-black text-[#1A1A1A] leading-tight mb-2">
          Thiết lập mật khẩu mới
        </h1>
        <p className="text-slate-500 text-sm">
          Đang cập nhật cho:{" "}
          <span className="font-bold text-[#008A3D]">{email}</span>
        </p>
      </header>

      <form onSubmit={handleReset} className="space-y-6">
        {/* Mật khẩu mới */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
            Mật khẩu mới
          </label>
          <div className="relative flex items-center bg-[#F1FAF4] rounded-xl px-4 py-4 focus-within:ring-2 ring-[#008A3D] transition-all">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent w-full outline-none text-sm font-bold text-[#1A1A17]"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-slate-400 hover:text-[#008A3D]"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
            Xác nhận lại
          </label>
          <div className="relative flex items-center bg-[#F1FAF4] rounded-xl px-4 py-4 focus-within:ring-2 ring-[#008A3D] transition-all">
            <input
              type={showPass ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-transparent w-full outline-none text-sm font-bold text-[#1A1A17]"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#008A3D] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#007031] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            "Cập nhật mật khẩu"
          )}
        </button>
      </form>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
