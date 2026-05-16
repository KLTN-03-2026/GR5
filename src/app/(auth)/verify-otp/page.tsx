"use client";

import React, { useState, useRef, Suspense } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

// Tách Component nhỏ để dùng useSearchParams (Tránh lỗi build của Next.js)
function VerifyOTPContent() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lấy email từ URL để biết đang xác nhận cho ai
  const email = searchParams.get("email") || "";

  // 1. Xử lý nhập mã (Nhảy ô)
  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/\D/g, '');
    if (!value) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // 2. Xử lý xóa mã (Backspace)
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 3. Hàm XÁC NHẬN MÃ (Gọi API verify-otp)
  const handleVerify = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) { toast.error("Vui lòng nhập đủ 6 số!"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: fullOtp }),
      });

      const data = await res.json();

      if (res.ok) {
        // Chuyển hướng sang trang đặt mật khẩu mới kèm reset token
        router.push(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.resetToken)}`);
      } else {
        toast.error(data.message || "Mã OTP không đúng hoặc hết hạn!");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống, vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  // 4. Hàm GỬI LẠI MÃ (Xử lý cái nút đang bị cứng đơ)
  const handleResend = async () => {
    if (!email) { toast.error("Không tìm thấy email người nhận!"); return; }

    setResending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("Mã mới đã được gửi vào email của bạn!");
        setOtp(new Array(6).fill(""));
        inputRefs.current[0]?.focus();
      } else {
        toast.error("Gửi lại thất bại, vui lòng kiểm tra lại email!");
      }
    } catch (error) {
      console.error("Lỗi gửi lại mã:", error);
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[440px] bg-white rounded-3xl p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-emerald-50/50 text-center"
    >
      <div className="text-left mb-10">
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-[#6B7280] font-bold text-[11px] uppercase tracking-widest hover:text-[#008A3D] transition-colors"
        >
          <ArrowLeft size={14} /> Quay lại
        </Link>
      </div>

      <header className="mb-10">
        <h1 className="text-[32px] font-black text-[#1A1A17] tracking-tight leading-none mb-4">
          Xác nhận mã OTP
        </h1>
        <p className="text-slate-500 text-[13px] font-medium leading-relaxed px-4">
          Chúng tôi đã gửi mã xác nhận đến <br />
          <span className="text-[#008A3D] font-bold">
            {email || "Email của bạn"}
          </span>
        </p>
      </header>

      <div className="flex justify-between gap-2 mb-10">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            ref={(el) => {
              if (el) inputRefs.current[index] = el;
            }}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => {
              handleKeyDown(e, index);
              if (e.ctrlKey || e.metaKey) return;
              const allowedKeys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
              if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                e.preventDefault();
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
              if (pasted.length > 0) {
                const newOtp = [...otp];
                for (let i = 0; i < pasted.length && index + i < 6; i++) {
                  newOtp[index + i] = pasted[i];
                }
                setOtp(newOtp);
                const focusIdx = Math.min(index + pasted.length, 5);
                inputRefs.current[focusIdx]?.focus();
              }
            }}
            className="w-12 h-14 bg-[#F1FAF4] border-2 border-transparent rounded-xl text-center text-xl font-black text-[#008A3D] focus:border-[#008A3D] focus:bg-white outline-none transition-all shadow-inner"
          />
        ))}
      </div>

      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-[#008A3D] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-900/10 hover:bg-[#007031] active:scale-[0.98] transition-all mb-10 flex justify-center items-center gap-2 disabled:opacity-70"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          "Xác nhận mã"
        )}
      </button>

      <div className="space-y-4">
        <p className="text-xs font-medium text-slate-500">
          Chưa nhận được mã?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-[#008A3D] font-bold hover:underline disabled:opacity-50"
          >
            {resending ? "Đang gửi..." : "Gửi lại mã"}
          </button>
        </p>
        <Link
          href="/login"
          className="block text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-[#008A3D] transition-colors"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </motion.div>
  );
}

// Bọc Suspense để tránh lỗi build khi dùng useSearchParams
export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin text-emerald-600" />
        </div>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}
