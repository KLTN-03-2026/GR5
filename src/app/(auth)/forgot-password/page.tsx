"use client";

import React, { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  // 3. Hàm xử lý khi bấm nút
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Đang gửi yêu cầu cho:", email);

    router.push("/verify-otp");
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[440px] bg-white rounded-3xl p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-emerald-50/50"
    >
      {/* 1. Nút Quay Lại nhỏ xinh ở trên */}
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-[#008A3D] font-bold text-[11px] uppercase tracking-[0.2em] mb-10 hover:opacity-70 transition-opacity"
      >
        <ArrowLeft size={14} strokeWidth={3} /> Quay lại
      </Link>

      {/* 2. Tiêu đề & Mô tả */}
      <header className="mb-10">
        <h1 className="text-[32px] font-black text-[#1A1A1A] tracking-tight leading-none mb-4">
          Quên mật khẩu?
        </h1>
        <p className="text-slate-500 text-[13px] font-medium leading-relaxed">
          Nhập email liên kết với tài khoản của bạn để nhận hướng dẫn khôi phục
          mật khẩu.
        </p>
      </header>

      {/* 3. Form nhập liệu */}
      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-slate-400 ml-1">
            Email đăng ký
          </label>
          <div className="flex items-center bg-[#EAF2EA] rounded-xl px-5 py-4 border-b-2 border-transparent focus-within:border-[#008A3D] transition-all">
            <Mail className="w-5 h-5 text-slate-500 mr-3" />
            <input
              type="email"
              placeholder="ten@vidu.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent w-full outline-none text-sm font-bold text-[#1A1A1A] placeholder:text-slate-300"
              required
            />
          </div>
        </div>

        {/* Nút gửi yêu cầu màu xanh đặc trưng */}
        <button
          type="submit"
          className="w-full bg-[#008A3D] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-900/10 hover:bg-[#007031] active:scale-[0.98] transition-all"
        >
          Gửi yêu cầu khôi phục
        </button>
      </form>

      {/* 4. Link quay lại đăng nhập ở dưới cùng */}
      <div className="mt-12 pt-8 border-t border-slate-50 text-center">
        <Link
          href="/login"
          className="text-[#008A3D] font-bold text-sm hover:underline underline-offset-4"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </motion.div>
  );
}
