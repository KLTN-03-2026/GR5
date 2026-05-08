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
    <div className="min-h-screen flex flex-col bg-[#f0fdf4] font-sans text-[#111827]">
      {/* 1. Header - Sát mép trên, chữ xanh đặc trưng */}
      <header className="w-full bg-white border-b border-[#e5e7eb] sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto flex justify-between items-center px-8 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#16a34a] text-lg font-semibold"
          >
            <span className="text-xl">🌿</span>
            <span>Verdant Harvest</span>
          </Link>

          <div className="flex items-center gap-4">
            <button className="p-2 text-[#6b7280] hover:text-[#16a34a] hover:bg-[#f0fdf4] rounded-lg transition-all">
              <Globe size={18} />
            </button>
            <button className="p-2 text-[#6b7280] hover:text-[#16a34a] hover:bg-[#f0fdf4] rounded-lg transition-all">
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Phần ruột - Nơi chứa Card Login/Register */}
      <main className="flex-grow flex items-center justify-center py-12 px-6">
        {children}
      </main>

      {/* 3. Footer - Nằm dưới cùng, chia làm 3 cụm như hình */}
      <footer className="w-full bg-white border-t border-[#e5e7eb] py-6 mt-auto">
        <div className="max-w-[1280px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Cụm trái: Logo */}
          <div className="flex items-center gap-2 text-[#16a34a]">
            <span className="text-base">🌿</span>
            <span className="text-sm font-medium">Verdant Harvest</span>
          </div>

          {/* Cụm giữa: Menu */}
          <div className="flex gap-6 text-[13px] text-[#6b7280]">
            <Link href="#" className="hover:text-[#16a34a] transition-colors">
              Điều khoản
            </Link>
            <Link href="#" className="hover:text-[#16a34a] transition-colors">
              Bảo mật
            </Link>
            <Link href="#" className="hover:text-[#16a34a] transition-colors">
              Liên hệ
            </Link>
            <Link href="#" className="hover:text-[#16a34a] transition-colors">
              Hỗ trợ
            </Link>
          </div>

          {/* Cụm phải: Copyright */}
          <div className="text-xs text-[#9ca3af]">
            © 2024 Verdant Harvest. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
