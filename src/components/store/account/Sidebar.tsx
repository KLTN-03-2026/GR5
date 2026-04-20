"use client";

import React from "react";
import {
  LayoutDashboard,
  Package,
  User,
  MapPin,
  Heart,
  Settings,
  LogOut,
  KeyRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();

  // Danh sách menu chuẩn theo code của Phú
  const navItems = [
    {
      id: "overview",
      name: "Tổng quan",
      icon: LayoutDashboard,
      path: "/account",
    },
    {
      id: "orders",
      name: "Đơn hàng của tôi",
      icon: Package,
      path: "/account/orders",
    },
    {
      id: "profile",
      name: "Hồ sơ cá nhân",
      icon: User,
      path: "/account/profile",
    },
    {
      id: "address",
      name: "Địa chỉ giao hàng",
      icon: MapPin,
      path: "/account/addresses",
    },
    {
      id: "favorites",
      name: "Yêu thích",
      icon: Heart,
      path: "/account/favorites",
    },
    {
      id: "change-password",
      name: "Bảo mật",
      icon: KeyRound,
      path: "/account/change-password",
    },
  ];

  return (
    <aside className="h-screen w-64 bg-[#f0f9f1] border-r border-emerald-100 flex flex-col py-8  top-0 font-be-vietnam">
      {/* 1. Brand Logo */}
      <div className="px-8 mb-10">
        <h1 className="text-2xl font-black text-[#007A33] tracking-tight">
          Nông Sản Việt
        </h1>
      </div>

      {/* 2. User Info Section (Dữ liệu động từ Database) */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#007A33] flex items-center justify-center text-white font-black text-xl shadow-sm">
          {user?.ho_ten?.[0] || user?.email?.[0].toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-slate-800 leading-tight">
            Chào {user?.ho_ten?.split(" ").pop() || "bạn"}
          </p>
          <p className="text-xs text-[#007A33]/60 font-medium mt-1">
            Thành viên Bạc
          </p>
        </div>
      </div>

      {/* 3. Navigation Menu */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.id} href={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all cursor-pointer
                  ${
                    isActive
                      ? "bg-white text-[#007A33] shadow-sm font-bold border border-emerald-50"
                      : "text-slate-500 hover:bg-white/50 hover:text-[#007A33]"
                  }
                `}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-[#007A33]"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* 4. Upgrade Button */}
      <div className="px-6 mt-6">
        <button className="w-full py-3 bg-[#007A33]/10 text-[#007A33] rounded-xl text-[10px] font-black hover:bg-[#007A33]/20 transition-colors uppercase tracking-widest italic">
          Nâng cấp tài khoản
        </button>
      </div>

      {/* 5. Bottom Settings & Logout */}
      <div className="mt-auto pt-6 border-t border-emerald-100 px-3 space-y-1">
        <Link
          href="/account/settings"
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-500 hover:bg-white/50 hover:text-[#007A33] transition-all"
        >
          <Settings size={20} />
          <span className="text-sm font-medium">Cài đặt</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
