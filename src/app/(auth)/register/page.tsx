"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  ScanFace,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const inputFields = [
    {
      label: "Họ và tên",
      icon: User,
      type: "text",
      placeholder: "Nguyễn Văn Phú",
    },
    {
      label: "Email",
      icon: Mail,
      type: "email",
      placeholder: "admin@nongsan.vn",
    },
    {
      label: "Số điện thoại",
      icon: Phone,
      type: "tel",
      placeholder: "0901 234 567",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-5xl h-[650px] flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden border border-emerald-100/20"
    >
      {/* 1. LEFT SIDE: Branding (Cố định chiều cao) */}
      <div className="hidden md:flex md:w-5/12 relative bg-[#0D261B] items-end p-10">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-30"
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000"
            alt="Rice Terraces"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D261B] via-transparent to-transparent z-10" />
        <div className="relative z-20 text-white">
          <h2 className="text-3xl font-black mb-3 italic uppercase tracking-tighter leading-tight">
            Nuôi dưỡng <br /> Nông nghiệp Việt
          </h2>
          <p className="text-emerald-100/50 text-xs font-medium leading-relaxed max-w-[250px]">
            Gia nhập cộng đồng quản lý nông sản hiện đại qua công nghệ AI.
          </p>
        </div>
      </div>

      {/* 2. RIGHT SIDE: Form (Bỏ Scroll - Cố định khoảng cách) */}
      <div className="w-full md:w-7/12 p-10 md:px-14 flex flex-col justify-center bg-white">
        <div className="max-w-md w-full mx-auto">
          <header className="mb-6">
            <h1 className="text-4xl font-black text-[#0D261B] uppercase italic tracking-tighter">
              Đăng ký
            </h1>
            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] mt-1">
              Hệ thống quản trị Verdant
            </p>
          </header>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {/* Render các ô nhập liệu cơ bản (Margin thấp hơn để tiết kiệm diện tích) */}
            <div className="grid grid-cols-1 gap-4">
              {inputFields.map((field) => (
                <div key={field.label} className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {field.label}
                  </label>
                  <div className="relative flex items-center border-b border-slate-100 focus-within:border-[#007A33] transition-all pb-1.5 group">
                    <field.icon
                      className="text-slate-300 group-focus-within:text-[#007A33]"
                      size={16}
                    />
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      className="w-full bg-transparent outline-none text-sm font-bold text-[#0D261B] ml-3 placeholder:text-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Mật khẩu & Xác nhận (Gộp dòng) */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Mật khẩu
                </label>
                <div className="relative flex items-center border-b border-slate-100 focus-within:border-[#007A33] transition-all pb-1.5">
                  <Lock className="text-slate-300" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-transparent outline-none text-sm font-bold text-[#0D261B] ml-2 placeholder:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-300 hover:text-[#007A33]"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Xác nhận
                </label>
                <div className="relative flex items-center border-b border-slate-100 focus-within:border-[#007A33] transition-all pb-1.5">
                  <ShieldCheck className="text-slate-300" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-transparent outline-none text-sm font-bold text-[#0D261B] ml-2 placeholder:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Checkbox & FaceID Button (Sắp xếp gọn gàng) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-200 text-[#007A33] focus:ring-[#007A33]"
                />
                <label
                  htmlFor="terms"
                  className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter cursor-pointer"
                >
                  Tôi đồng ý với{" "}
                  <span className="text-[#007A33] hover:underline underline-offset-2">
                    Điều khoản & Chính sách
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={() => router.push("/register/face-id")}
                className="w-full flex items-center justify-center gap-3 py-3 bg-[#F1FAF4] text-[#007A33] border border-dashed border-[#007A33]/30 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#007A33] hover:text-white transition-all group shadow-sm"
              >
                <ScanFace
                  size={16}
                  className="group-hover:scale-110 transition-transform"
                />
                Đăng ký nhanh với FaceID
              </button>
            </div>

            {/* Nút Hoàn tất */}
            <button className="w-full bg-[#0D261B] text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/10 hover:bg-black active:scale-[0.98] transition-all flex justify-center items-center gap-3">
              Hoàn tất <ArrowRight size={16} />
            </button>
          </form>

          <footer className="mt-6 text-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-[#007A33] hover:underline ml-1 underline-offset-4"
              >
                Đăng nhập
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </motion.div>
  );
}
