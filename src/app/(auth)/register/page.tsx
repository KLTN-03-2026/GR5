"use client";

import React, { useState } from "react";
import { Mail, Lock, ShieldCheck, Eye, EyeOff, User, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { FaFacebookF } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { handleGoogleLogin, handleFacebookLogin } from "@/app/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [socialPending, setSocialPending] = useState<"google" | "facebook" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    ho_ten: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ho_ten: form.ho_ten,
          email: form.email,
          password: form.password,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2500);
      }
    } catch {
      setError("Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogleLogin() {
    setSocialPending("google");
    try { await handleGoogleLogin(); } catch { setSocialPending(null); }
  }

  async function onFacebookLogin() {
    setSocialPending("facebook");
    try { await handleFacebookLogin(); } catch { setSocialPending(null); }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl flex bg-white rounded-[2rem] shadow-2xl overflow-hidden"
      >
        {/* ── Bên trái: Decor ───────────────────────────────────────────────── */}
        <div className="hidden md:flex md:w-5/12 bg-[#0D261B] relative flex-col justify-end p-10 overflow-hidden">
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000"
            alt="Agri"
          />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#007A33] flex items-center justify-center mb-6">
              <span className="text-white font-black text-lg">N</span>
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase leading-tight mb-3">
              Nuôi dưỡng <br /> Nông nghiệp Việt
            </h2>
            <p className="text-emerald-300 text-sm leading-relaxed">
              Tham gia nền tảng quản lý nông sản hàng đầu — kết nối nhà sản xuất và người tiêu dùng.
            </p>
          </div>
        </div>

        {/* ── Bên phải: Form ────────────────────────────────────────────────── */}
        <div className="w-full md:w-7/12 p-10 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {success ? (
              /* Success state */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h2 className="text-xl font-black text-[#0D261B] mb-2">Đăng ký thành công!</h2>
                <p className="text-slate-500 text-sm">Đang chuyển bạn đến trang đăng nhập...</p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <header className="mb-7">
                  <h1 className="text-3xl font-black text-[#0D261B] uppercase italic">Tạo tài khoản</h1>
                  <p className="text-slate-400 text-sm mt-1">Điền thông tin bên dưới để bắt đầu</p>
                </header>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-5 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100"
                    >
                      ⚠ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Họ tên */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Họ và tên</label>
                    <div className="flex items-center border-b border-slate-100 pb-2 focus-within:border-[#007A33] transition-colors">
                      <User className="text-slate-300 flex-shrink-0" size={18} />
                      <input
                        name="ho_ten"
                        type="text"
                        value={form.ho_ten}
                        onChange={onChange}
                        placeholder="Nguyễn Văn A"
                        className="w-full bg-transparent outline-none ml-3 text-sm font-bold text-[#0A1A17] placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email <span className="text-red-400">*</span></label>
                    <div className="flex items-center border-b border-slate-100 pb-2 focus-within:border-[#007A33] transition-colors">
                      <Mail className="text-slate-300 flex-shrink-0" size={18} />
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="admin@nongsan.vn"
                        required
                        className="w-full bg-transparent outline-none ml-3 text-sm font-bold text-[#0A1A17] placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Password + Confirm */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mật khẩu <span className="text-red-400">*</span></label>
                      <div className="flex items-center border-b border-slate-100 pb-2 focus-within:border-[#007A33] transition-colors">
                        <Lock className="text-slate-300 flex-shrink-0" size={18} />
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={onChange}
                          placeholder="Tối thiểu 6 ký tự"
                          required
                          className="w-full bg-transparent outline-none ml-2 text-sm font-bold placeholder:text-slate-300"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-300 hover:text-[#007A33] ml-1">
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Xác nhận <span className="text-red-400">*</span></label>
                      <div className="flex items-center border-b border-slate-100 pb-2 focus-within:border-[#007A33] transition-colors">
                        <ShieldCheck className="text-slate-300 flex-shrink-0" size={18} />
                        <input
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={form.confirmPassword}
                          onChange={onChange}
                          placeholder="Nhập lại mật khẩu"
                          required
                          className="w-full bg-transparent outline-none ml-2 text-sm font-bold placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#0D261B] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-black transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 mt-2"
                  >
                    {submitting ? <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</> : <>Tạo tài khoản <ArrowRight size={18} /></>}
                  </button>
                </form>

                {/* Social */}
                <div className="mt-6">
                  <div className="relative flex items-center justify-center mb-5">
                    <div className="border-t border-slate-100 w-full"></div>
                    <span className="bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest absolute">
                      Hoặc đăng ký với
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={onGoogleLogin}
                      disabled={socialPending !== null}
                      className="flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 disabled:opacity-60"
                    >
                      {socialPending === "google"
                        ? <Loader2 size={15} className="animate-spin" />
                        : <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="google" />}
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={onFacebookLogin}
                      disabled={socialPending !== null}
                      className="flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 disabled:opacity-60"
                    >
                      {socialPending === "facebook"
                        ? <Loader2 size={15} className="animate-spin" />
                        : <FaFacebookF size={15} className="text-[#1877F2]" />}
                      Facebook
                    </button>
                  </div>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                  Đã có tài khoản?{" "}
                  <Link href="/login" className="text-[#007A33] font-bold hover:underline">Đăng nhập</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
