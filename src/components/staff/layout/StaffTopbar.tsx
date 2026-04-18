"use client";

import React, { useEffect, useState } from "react";
import { Bell, Search, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

export default function StaffTopbar() {
  const pathname = usePathname();
  const [pageTitle, setPageTitle] = useState("Tổng quan");

  useEffect(() => {
    if (pathname.includes("/staff/orders")) setPageTitle("Quản lý Đơn hàng");
    else if (pathname.includes("/staff/warehouse")) setPageTitle("Quản lý Kho hàng");
    else if (pathname.includes("/staff/hr")) setPageTitle("Ca làm việc & Nghỉ phép");
    else setPageTitle("Tổng quan Kênh Vận hành");
  }, [pathname]);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-gray-500 hover:text-gray-700">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex relative">
          <input
            type="text"
            placeholder="Tìm kiếm mã đơn, lô hàng..."
            className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          {/* Badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      </div>
    </header>
  );
}
