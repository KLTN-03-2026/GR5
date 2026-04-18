"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Warehouse,
  CalendarDays,
  LogOut,
  Layers,
  ChevronRight,
  ChevronDown
} from "lucide-react";

const menuItems = [
  { name: "Đơn hàng", path: "/staff/orders", icon: ShoppingCart },
  { name: "Kho Hàng", path: "/staff/warehouse", icon: Warehouse },
  { name: "Ca & Nghỉ phép", path: "/staff/hr", icon: CalendarDays },
];

export default function StaffSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] bg-[#1a1f2c] text-gray-300 flex flex-col h-screen flex-shrink-0">
      {/* Header Sidebar */}
      <div className="h-16 flex items-center px-6 mb-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Layers className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight">
              NôngSản
            </h1>
            <p className="text-[10px] text-gray-400 font-medium">Ops Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md relative overflow-hidden group"
                  : "hover:bg-white/10 hover:text-white"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 mt-auto">
        <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              NV
            </div>
            <div>
              <p className="text-sm font-medium text-white">Vận Hành</p>
              <p className="text-xs text-gray-400">Nhân viên</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
