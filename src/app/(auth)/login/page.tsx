"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ScanFace, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaFacebookF } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { handleLogin, handleGoogleLogin, handleFacebookLogin } from "@/app/actions/auth";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [socialPending, setSocialPending] = useState<"google" | "facebook" | null>(null);
  const router = useRouter();

  async function clientAction(formData: FormData) {
    setError("");
    setIsPending(true);
    try {
      const res = await handleLogin(formData);
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
        setIsPending(false);
      }
    } catch {
      // Auth.js redirect sẽ throw — trình duyệt tự chuyển trang
    }
  }

  async function onGoogleLogin() {
    setSocialPending("google");
    try {
      await handleGoogleLogin();
    } catch {
      setSocialPending(null);
    }
  }

  async function onFacebookLogin() {
    setSocialPending("facebook");
    try {
      await handleFacebookLogin();
    } catch {
      setSocialPending(null);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[450px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-emerald-50"
      >
        <div className="p-10">
          <header className="text-center mb-8">
            <h1 className="text-[32px] font-black text-[#007A33] tracking-tight leading-none mb-4 uppercase italic">
              Đăng nhập
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Chào mừng trở lại! Vui lòng nhập thông tin của bạn.
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl border border-red-100 italic"
              >
                ⚠ {error}
              </motion.div>
            )}
          </header>

          <form action={clientAction} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-widest">Email</label>
              <div className="flex items-center bg-[#EAF2EA]/60 rounded-xl px-4 py-4 border border-transparent focus-within:border-[#007A33]/30 transition-all">
                <Mail className="w-5 h-5 text-slate-400 mr-3" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="admin@nongsan.vn"
                  className="bg-transparent w-full outline-none text-sm font-bold text-[#0A1A17] placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Mật khẩu</label>
                <Link href="/forgot-password" className="text-xs font-bold text-[#007A33] hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="flex items-center bg-[#EAF2EA]/60 rounded-xl px-4 py-4 border border-transparent focus-within:border-[#007A33]/30 transition-all">
                <Lock className="w-5 h-5 text-slate-400 mr-3" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="bg-transparent w-full outline-none text-sm font-bold text-[#0A1A17] placeholder:text-slate-300"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-[#007A33]">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-[#007A33]" />
              <label htmlFor="remember" className="text-xs font-medium text-slate-500 cursor-pointer">Ghi nhớ đăng nhập</label>
            </div>

            <div className="space-y-4">
              <button
                disabled={isPending}
                type="submit"
                className="w-full bg-[#007A33] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-[#006329] shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {isPending ? <><Loader2 className="animate-spin" size={20} /> Đang kiểm tra...</> : "Đăng nhập ngay"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/login/face-id")}
                className="w-full flex items-center justify-center gap-3 py-4 bg-[#F1FAF4] text-[#007A33] border-2 border-dashed border-[#007A33]/20 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-[#007A33] hover:text-white transition-all group"
              >
                <ScanFace size={18} className="group-hover:scale-110 transition-transform" />
                Đăng nhập nhanh bằng FaceID
              </button>
            </div>
          </form>

          {/* Social Login */}
          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-slate-100 w-full"></div>
              <span className="bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest absolute">
                Hoặc đăng nhập với
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={onGoogleLogin}
                disabled={socialPending !== null}
                className="flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 disabled:opacity-60"
              >
                {socialPending === "google" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="google" />
                )}
                Google
              </button>
              <button
                type="button"
                onClick={onFacebookLogin}
                disabled={socialPending !== null}
                className="flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 disabled:opacity-60"
              >
                {socialPending === "facebook" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <FaFacebookF size={16} className="text-[#1877F2]" />
                )}
                Facebook
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#F1FAF4] p-6 text-center border-t border-emerald-50">
          <p className="text-xs font-medium text-slate-500">
            Chưa có tài khoản?
            <Link href="/register" className="text-[#007A33] font-bold ml-2 hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
