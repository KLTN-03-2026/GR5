"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Xử lý nhập mã OTP tự động nhảy ô
  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Nếu nhập xong thì nhảy sang ô kế tiếp
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[440px] bg-white rounded-3xl p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-emerald-50/50 text-center"
    >
      {/* 1. Nút Quay lại */}
      <div className="text-left mb-10">
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-[#6B7280] font-bold text-[11px] uppercase tracking-widest hover:text-[#008A3D] transition-colors"
        >
          <ArrowLeft size={14} /> Quay lại
        </Link>
      </div>

      {/* 2. Tiêu đề */}
      <header className="mb-10">
        <h1 className="text-[32px] font-black text-[#1A1A17] tracking-tight leading-none mb-4">
          Xác nhận mã OTP
        </h1>
        <p className="text-slate-500 text-[13px] font-medium leading-relaxed px-4">
          Chúng tôi đã gửi mã xác nhận gồm 6 chữ số đến email của bạn. Vui lòng
          nhập mã để tiếp tục.
        </p>
      </header>

      {/* 3. Ô nhập mã OTP (6 ô) */}
      <div className="flex justify-between gap-2 mb-10">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            ref={(el) => {
              if (el) inputRefs.current[index] = el;
            }}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onFocus={(e) => e.target.select()}
            className="w-12 h-14 bg-[#F1FAF4] border-2 border-transparent rounded-xl text-center text-xl font-black text-[#008A3D] focus:border-[#008A3D] focus:bg-white outline-none transition-all shadow-inner"
          />
        ))}
      </div>

      {/* 4. Nút Xác nhận */}
      <button className="w-full bg-[#008A3D] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-900/10 hover:bg-[#007031] active:scale-[0.98] transition-all mb-10">
        Xác nhận mã
      </button>

      {/* 5. Footer link */}
      <div className="space-y-4">
        <p className="text-xs font-medium text-slate-500">
          Chưa nhận được mã?{" "}
          <button className="text-[#008A3D] font-bold hover:underline">
            Gửi lại mã
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
