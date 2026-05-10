"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mail, Lock, ShieldCheck, Eye, EyeOff, User, Loader2, CheckCircle } from "lucide-react";
import { FaFacebookF } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { handleGoogleLogin, handleFacebookLogin } from "@/app/actions/auth";

// ── UI-only: OTP 6-box input ────────────────────────────────────────────────
function OtpInput({
  value,
  onChange,
  disabled,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  hasError: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = digits.map((d, idx) => (idx === i ? "" : d)).join("").trimEnd();
      onChange(next.padEnd(i > 0 && digits[i] === "" ? i - 1 : i, "").slice(0, 6));
      if (digits[i] === "" && i > 0) refs.current[i - 1]?.focus();
    }
  }

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, idx) => (idx === i ? char : d)).join("");
    onChange(next);
    if (char && i < 5) refs.current[i + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  }

  const baseBox =
    "w-12 h-14 rounded-[10px] text-center text-[22px] font-semibold text-[#111827] outline-none transition-all";
  const normalBorder = "border-[1.5px] border-[#d1d5db] bg-white focus:border-[#16a34a] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)]";
  const filledBorder = "border-[1.5px] border-[#16a34a] bg-[#f0fdf4]";
  const errorBorder  = "border-[1.5px] border-[#dc2626] bg-[#fef2f2]";

  return (
    <div className="flex gap-[10px] justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] ?? ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          className={[
            baseBox,
            hasError ? errorBorder : digits[i] ? filledBorder : normalBorder,
            disabled ? "opacity-60 cursor-not-allowed" : "",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

// ── UI-only: Step indicator ─────────────────────────────────────────────────
function StepIndicator({ current }: { current: 1 | 2 }) {
  const steps = ["Thông tin tài khoản", "Xác thực email"];
  return (
    <div className="flex items-center mb-6">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                  active || done
                    ? "bg-[#16a34a] text-white"
                    : "bg-[#f3f4f6] text-[#9ca3af] border border-[#e5e7eb]",
                ].join(" ")}
              >
                {done ? <CheckCircle size={14} /> : idx}
              </div>
              <span
                className={[
                  "text-[11px] whitespace-nowrap",
                  active ? "text-[#16a34a] font-medium" : "text-[#9ca3af]",
                ].join(" ")}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={[
                  "flex-1 h-px mb-4 mx-2 transition-all",
                  done ? "bg-[#16a34a]" : "bg-[#e5e7eb]",
                ].join(" ")}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword]   = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [socialPending, setSocialPending] = useState<"google" | "facebook" | null>(null);
  const [error, setError]                 = useState("");
  const [step, setStep]                   = useState<"form" | "verify" | "success">("form");
  const [otp, setOtp]                     = useState("");
  const [verifying, setVerifying]         = useState(false);
  const [otpError, setOtpError]           = useState(false);
  const [countdown, setCountdown]         = useState(0);

  const [form, setForm] = useState({
    ho_ten: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // countdown timer khi gửi OTP
  const startCountdown = useCallback(() => {
    setCountdown(60);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Logic (không đổi) ──
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError("Mật khẩu phải chứa ít nhất 1 chữ hoa.");
      return;
    }
    if (!/[0-9]/.test(form.password)) {
      setError("Mật khẩu phải chứa ít nhất 1 chữ số.");
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) {
      setError("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/send-register-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.");
      } else {
        setStep("verify");
        startCountdown();
      }
    } catch {
      setError("Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (countdown > 0) return;
    setError("");
    setOtp("");
    setOtpError(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/send-register-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) startCountdown();
      else setError(json.message ?? "Không thể gửi lại mã.");
    } catch {
      setError("Không kết nối được máy chủ.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOtpError(false);
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ho_ten: form.ho_ten,
          email: form.email,
          password: form.password,
          otp,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setOtpError(true);
        setError(json.message ?? "Mã xác thực không đúng. Vui lòng thử lại.");
      } else {
        setStep("success");
        setTimeout(() => router.push("/login"), 2500);
      }
    } catch {
      setError("Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setVerifying(false);
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

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex items-center justify-center w-full p-4 font-sans">
      <AnimatePresence mode="wait">

        {/* ══ SUCCESS ══ */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[420px] bg-white rounded-2xl border border-[#e5e7eb] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-10 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#dcfce7] flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={30} className="text-[#16a34a]" />
            </div>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">Xác thực thành công!</h2>
            <p className="text-sm text-[#6b7280]">Đang chuyển hướng đến trang đăng nhập...</p>
          </motion.div>
        )}

        {/* ══ VERIFY EMAIL ══ */}
        {step === "verify" && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-[420px] bg-white rounded-2xl border border-[#e5e7eb] shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden"
          >
            <div className="px-10 py-9">
              <StepIndicator current={2} />

              {/* Icon + header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#f0fdf4] flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-[#16a34a]" />
                </div>
                <h1 className="text-xl font-semibold text-[#111827] mb-2">
                  Xác thực email của bạn
                </h1>
                <p className="text-sm text-[#6b7280]">
                  Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến
                </p>
                <p className="text-sm font-semibold text-[#111827] mt-1">{form.email}</p>
              </div>

              <form onSubmit={handleVerify}>
                {/* 6-box OTP */}
                <motion.div
                  animate={otpError ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="my-6"
                >
                  <OtpInput
                    value={otp}
                    onChange={(v) => { setOtp(v); setOtpError(false); setError(""); }}
                    disabled={verifying}
                    hasError={otpError}
                  />
                </motion.div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[13px] text-[#dc2626] text-center mb-4"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={verifying || otp.length < 6}
                  className="w-full bg-[#16a34a] text-white h-11 rounded-lg font-medium text-[15px] hover:bg-[#15803d] flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {verifying
                    ? <><Loader2 size={18} className="animate-spin" /> Đang xác thực...</>
                    : "Xác nhận"}
                </button>
              </form>

              {/* Resend + countdown */}
              <p className="text-center text-[13px] text-[#9ca3af] mt-5">
                Không nhận được mã?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0}
                  className={[
                    "font-medium transition-colors",
                    countdown > 0
                      ? "text-[#9ca3af] cursor-default"
                      : "text-[#16a34a] hover:underline cursor-pointer",
                  ].join(" ")}
                >
                  {countdown > 0 ? `Gửi lại (${countdown}s)` : "Gửi lại"}
                </button>
              </p>

              {/* Back */}
              <button
                type="button"
                onClick={() => { setStep("form"); setError(""); setOtp(""); setOtpError(false); }}
                className="block w-full text-center text-[13px] text-[#9ca3af] hover:text-[#374151] transition-colors mt-4"
              >
                ← Quay lại đăng ký
              </button>
            </div>
          </motion.div>
        )}

        {/* ══ FORM (step 1) ══ */}
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-4xl flex bg-white rounded-2xl border border-[#e5e7eb] shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden"
          >
            {/* Panel trái */}
            <div className="hidden md:flex md:w-5/12 bg-[#0D261B] relative flex-col justify-end p-10 overflow-hidden">
              <img
                className="absolute inset-0 w-full h-full object-cover opacity-20"
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000"
                alt="Agri"
              />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#16a34a] flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-base">VH</span>
                </div>
                <h2 className="text-2xl font-semibold text-white leading-snug mb-3">
                  Nuôi dưỡng<br />nông nghiệp Việt
                </h2>
                <p className="text-emerald-300 text-sm leading-relaxed">
                  Tham gia nền tảng quản lý nông sản hàng đầu — kết nối nhà sản xuất và người tiêu dùng.
                </p>
              </div>
            </div>

            {/* Panel phải: form */}
            <div className="w-full md:w-7/12 flex flex-col">
              <div className="flex-1 px-10 py-9">
                <StepIndicator current={1} />

                <header className="mb-6">
                  <h1 className="text-2xl font-semibold text-[#111827] mb-1">Tạo tài khoản</h1>
                  <p className="text-sm text-[#6b7280]">Điền thông tin bên dưới để bắt đầu</p>
                </header>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-5 p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100"
                    >
                      ⚠ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Họ tên */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[#374151]">Họ và tên</label>
                    <div className="flex items-center bg-white rounded-lg px-3 h-11 border border-[#d1d5db] focus-within:border-[#16a34a] focus-within:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] transition-all">
                      <User className="w-4 h-4 text-[#9ca3af] mr-2 shrink-0" />
                      <input
                        name="ho_ten"
                        type="text"
                        value={form.ho_ten}
                        onChange={onChange}
                        placeholder="Nguyễn Văn A"
                        className="bg-transparent w-full outline-none text-sm text-[#111827] placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[#374151]">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center bg-white rounded-lg px-3 h-11 border border-[#d1d5db] focus-within:border-[#16a34a] focus-within:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] transition-all">
                      <Mail className="w-4 h-4 text-[#9ca3af] mr-2 shrink-0" />
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="admin@verdant.vn"
                        required
                        className="bg-transparent w-full outline-none text-sm text-[#111827] placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Mật khẩu */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[#374151]">
                      Mật khẩu <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center bg-white rounded-lg px-3 h-11 border border-[#d1d5db] focus-within:border-[#16a34a] focus-within:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] transition-all">
                      <Lock className="w-4 h-4 text-[#9ca3af] mr-2 shrink-0" />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={onChange}
                        placeholder="Tối thiểu 8 ký tự (chữ hoa + số + đặc biệt)"
                        required
                        className="bg-transparent w-full outline-none text-sm text-[#111827] placeholder:text-slate-400"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#9ca3af] hover:text-[#16a34a]">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Xác nhận mật khẩu */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[#374151]">
                      Xác nhận mật khẩu <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center bg-white rounded-lg px-3 h-11 border border-[#d1d5db] focus-within:border-[#16a34a] focus-within:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] transition-all">
                      <ShieldCheck className="w-4 h-4 text-[#9ca3af] mr-2 shrink-0" />
                      <input
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={onChange}
                        placeholder="Nhập lại mật khẩu"
                        required
                        className="bg-transparent w-full outline-none text-sm text-[#111827] placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#16a34a] text-white h-11 rounded-lg font-medium text-[15px] hover:bg-[#15803d] flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all !mt-6"
                  >
                    {submitting
                      ? <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</>
                      : "Tạo tài khoản"}
                  </button>
                </form>

                {/* Social */}
                <div className="mt-6">
                  <div className="relative flex items-center justify-center mb-4">
                    <div className="border-t border-[#e5e7eb] w-full" />
                    <span className="bg-white px-4 text-xs text-[#9ca3af] absolute">Hoặc đăng ký với</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={onGoogleLogin}
                      disabled={socialPending !== null}
                      className="flex items-center justify-center gap-2 h-10 border border-[#e5e7eb] bg-white rounded-lg hover:border-[#d1d5db] hover:bg-[#f9fafb] transition-all font-medium text-[13px] text-[#374151] disabled:opacity-60"
                    >
                      {socialPending === "google"
                        ? <Loader2 size={16} className="animate-spin" />
                        : <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-[18px] h-[18px]" alt="google" />}
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={onFacebookLogin}
                      disabled={socialPending !== null}
                      className="flex items-center justify-center gap-2 h-10 border border-[#e5e7eb] bg-white rounded-lg hover:border-[#d1d5db] hover:bg-[#f9fafb] transition-all font-medium text-[13px] text-[#374151] disabled:opacity-60"
                    >
                      {socialPending === "facebook"
                        ? <Loader2 size={16} className="animate-spin" />
                        : <FaFacebookF size={18} className="text-[#1877F2]" />}
                      Facebook
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#f9fafb] px-10 py-5 text-center border-t border-[#e5e7eb]">
                <p className="text-sm text-[#6b7280]">
                  Đã có tài khoản?{" "}
                  <Link href="/login" className="text-[#16a34a] font-medium hover:underline">Đăng nhập</Link>
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
