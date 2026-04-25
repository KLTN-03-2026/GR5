"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  PackageOpen,
  AlertTriangle,
  Warehouse,
  Truck,
  FileText,
  Layers,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
  { name: "Sơ đồ Tổng Quan", path: "/warehouse-manager/map", icon: Warehouse },
  { name: "Đơn đặt hàng NCC", path: "/warehouse-manager/orders", icon: ClipboardList },
  { name: "Duyệt Phiếu Nhập", path: "/warehouse-manager/receipts", icon: PackageOpen },
  { name: "Cảnh Báo HSD", path: "/warehouse-manager/alerts", icon: AlertTriangle },
  { name: "NCC & Công Nợ", path: "/warehouse-manager/suppliers", icon: Truck },
  { name: "Lịch sử Nhập / Xuất", path: "/warehouse-manager/history", icon: FileText },
];

export default function WarehouseManagerSidebar({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] bg-[#1a1f2c] text-gray-300 flex flex-col h-screen flex-shrink-0">
      <div className="h-16 flex items-center px-6 mb-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <Layers className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight">NôngSản</h1>
            <p className="text-[10px] text-gray-400 font-medium">Kho & Kế Toán</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md"
                  : "hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer border border-white/5" onClick={() => signOut({ callbackUrl: "/login" })}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm uppercase">
              {userEmail?.[0] || "T"}
            </div>
            <div>
              <p className="text-sm font-medium text-white max-w-[100px] truncate">{userEmail || "Thủ Kho"}</p>
              <p className="text-xs text-gray-400">Quản lý kho</p>
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
