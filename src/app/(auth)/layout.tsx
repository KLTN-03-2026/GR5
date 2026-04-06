"use client";

import React from "react";
import { Globe, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F1FAF4] font-sans text-[#0A1A17]">
      {/* 1. Header - Sát mép trên, chữ xanh đặc trưng */}
      <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center px-10 py-5">
          <Link
            href="/"
            className="text-[#007A33] text-xl font-bold tracking-tight"
          >
            Verdant Harvest Admin
          </Link>

          <div className="flex items-center gap-6 text-slate-500">
            <button className="hover:text-[#007A33] transition-colors">
              <Globe size={20} />
            </button>
            <button className="hover:text-[#007A33] transition-colors">
              <HelpCircle size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Phần ruột - Nơi chứa Card Login/Register */}
      <main className="flex-grow flex items-center justify-center py-12 px-6">
        {children}
      </main>

      {/* 3. Footer - Nằm dưới cùng, chia làm 3 cụm như hình */}
      <footer className="w-full bg-white/50 border-t border-emerald-100/50 py-8 mt-auto">
        <div className="max-w-[1440px] mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Cụm trái: Logo */}
          <div className="text-lg font-bold text-[#007A33]">
            Verdant Harvest
          </div>

          {/* Cụm giữa: Menu */}
          <div className="flex gap-8 text-sm font-medium text-slate-600">
            <Link href="#" className="hover:text-[#007A33] transition-all">
              Điều khoản
            </Link>
            <Link href="#" className="hover:text-[#007A33] transition-all">
              Bảo mật
            </Link>
            <Link href="#" className="hover:text-[#007A33] transition-all">
              Liên hệ
            </Link>
          </div>

          {/* Cụm phải: Copyright */}
          <div className="text-xs text-slate-400 font-medium">
            © 2024 Verdant Harvest. Bản quyền thuộc về Nông Sản Việt.
          </div>
        </div>
      </footer>
    </div>
  );
}
