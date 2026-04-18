"use client";

import React, { useState } from "react";
import { Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { handleRegister } from "@/app/actions/auth";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl h-[550px] flex bg-white rounded-[2rem] shadow-2xl overflow-hidden"
      >
        {/* Bên trái: Ảnh decor */}
        <div className="hidden md:block w-1/2 bg-[#0D261B] relative p-10">
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000"
            alt="Agri"
          />
          <h2 className="relative z-10 text-3xl font-black text-white italic uppercase mt-auto">
            Nuôi dưỡng <br /> Nông nghiệp Việt
          </h2>
        </div>

        {/* Bên phải: Form đăng ký */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <header className="mb-8">
            <h1 className="text-3xl font-black text-[#0D261B] uppercase italic">
              Đăng ký
            </h1>
            {error && (
              <p className="text-red-500 text-xs font-bold mt-2 italic">
                {error}
              </p>
            )}
          </header>

          <form
            action={async (formData) => {
              setError("");
              const res = await handleRegister(formData);
              if (res?.error) setError(res.error);
              else {
                alert("Đăng ký thành công!");
                router.push("/login");
              }
            }}
            className="space-y-6"
          >
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Email
              </label>
              <div className="flex items-center border-b border-slate-100 pb-2">
                <Mail className="text-slate-300" size={18} />
                <input
                  name="email"
                  type="email"
                  placeholder="admin@nongsan.vn"
                  className="w-full bg-transparent outline-none ml-3 text-sm font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Mật khẩu
                </label>
                <div className="flex items-center border-b border-slate-100 pb-2">
                  <Lock className="text-slate-300" size={18} />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••"
                    className="w-full bg-transparent outline-none ml-2 text-sm font-bold"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Xác nhận
                </label>
                <div className="flex items-center border-b border-slate-100 pb-2">
                  <ShieldCheck className="text-slate-300" size={18} />
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••"
                    className="w-full bg-transparent outline-none ml-2 text-sm font-bold"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0D261B] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-black transition-all"
            >
              Hoàn tất <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
