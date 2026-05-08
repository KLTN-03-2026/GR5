"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Warehouse,
  ClipboardList,
  UserCircle,
  LogOut,
  Layers,
} from "lucide-react";

const menuItems = [
  {
    name: "Quản Lý Kho",
    path: "/staff/warehouse",
    icon: Warehouse,
    description: "Tồn kho · Nhập/Xuất · Cảnh báo",
  },
  {
    name: "Đơn Hàng",
    path: "/staff/orders",
    icon: ClipboardList,
    description: "Xác nhận & xử lý đơn hàng",
  },
  {
    name: "Cá Nhân",
    path: "/staff/hr",
    icon: UserCircle,
    description: "Lịch ca · Nghỉ phép · FaceID",
  },
];

export default function StaffSidebar({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] bg-[#1a1f2c] text-gray-300 flex flex-col h-screen flex-shrink-0">
      {/* Header Sidebar */}
      <div className="h-16 flex items-center px-6 mb-6 mt-2">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Layers className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight">
              NôngSản
            </h1>
            <p className="text-[10px] text-gray-400 font-medium">NV Vận Hành</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="mx-4 mb-4 px-3 py-2 bg-blue-600/10 border border-blue-500/20 rounded-lg">
        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Quyền truy cập</p>
        <p className="text-xs text-gray-300 mt-0.5">Kho · Đơn hàng · Cá nhân</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              <div className="flex flex-col">
                <span>{item.name}</span>
                <span className={`text-[10px] ${isActive ? "text-blue-100" : "text-gray-500"}`}>
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 mt-auto">
        <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {userEmail?.[0]?.toUpperCase() || "NV"}
            </div>
            <div>
              <p className="text-sm font-medium text-white max-w-[110px] truncate">{userEmail || "Vận Hành"}</p>
              <p className="text-xs text-gray-400">Nhân viên</p>
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-white transition-colors"
            title="Đăng xuất"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
