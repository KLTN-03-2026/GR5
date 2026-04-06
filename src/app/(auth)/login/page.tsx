"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ScanFace } from "lucide-react"; // 1. Thêm ScanFace
import Link from "next/link";
import { motion } from "framer-motion";
import { FaFacebookF } from "react-icons/fa";
import { useRouter } from "next/navigation"; // 2. Thêm useRouter

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter(); // 3. Khởi tạo router

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[450px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-emerald-50"
    >
      <div className="p-10">
        {/* 1. Header Section */}
        <header className="text-center mb-8">
          <h1 className="text-[32px] font-black text-[#007A33] tracking-tight leading-none mb-4">
            Đăng nhập
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Chào mừng trở lại! Vui lòng nhập thông tin của bạn.
          </p>
        </header>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 ml-1">
              Email
            </label>
            <div className="flex items-center bg-[#EAF2EA]/60 rounded-xl px-4 py-4 border border-transparent focus-within:border-[#007A33]/30 transition-all">
              <Mail className="w-5 h-5 text-slate-400 mr-3" />
              <input
                type="email"
                placeholder="email@gmail.com"
                className="bg-transparent w-full outline-none text-sm font-bold text-[#0A1A17] placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-slate-700">
                Mật khẩu
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-[#007A33] hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="flex items-center bg-[#EAF2EA]/60 rounded-xl px-4 py-4 border border-transparent focus-within:border-[#007A33]/30 transition-all">
              <Lock className="w-5 h-5 text-slate-400 mr-3" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-transparent w-full outline-none text-sm font-bold text-[#0A1A17] placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-[#007A33] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 rounded border-slate-300 text-[#007A33] focus:ring-[#007A33]"
            />
            <label
              htmlFor="remember"
              className="text-xs font-medium text-slate-500 cursor-pointer"
            >
              Ghi nhớ đăng nhập
            </label>
          </div>

          {/* Submit Buttons Area */}
          <div className="space-y-4">
            {/* Nút đăng nhập truyền thống */}
            <button className="w-full bg-[#007A33] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-[#006329] shadow-lg shadow-emerald-900/10 active:scale-[0.98] transition-all">
              Đăng nhập
            </button>

            {/* 4. NÚT FACE ID - Đặt ở đây để cân đối với background */}
            <button
              type="button"
              onClick={() => router.push("/login/face-id")}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#F1FAF4] text-[#007A33] border-2 border-dashed border-[#007A33]/20 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-[#007A33] hover:text-white transition-all group"
            >
              <ScanFace
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
              Đăng nhập nhanh bằng FaceID
            </button>
          </div>
        </form>

        {/* 2. Social Login Section */}
        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-slate-100 w-full"></div>
            <span className="bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest absolute">
              Hoặc đăng nhập với
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs text-slate-600">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-4 h-4"
                alt="google"
              />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs text-slate-600">
              <FaFacebookF
                size={16}
                className="text-[#1877F2] fill-[#1877F2]"
              />
              Facebook
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Link Area */}
      <div className="bg-[#F1FAF4] p-6 text-center border-t border-emerald-50">
        <p className="text-xs font-medium text-slate-500">
          Chưa có tài khoản?
          <Link
            href="/register"
            className="text-[#007A33] font-bold ml-2 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
