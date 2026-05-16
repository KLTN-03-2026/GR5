"use client";

import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
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
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 sticky top-0 z-30 shadow-sm">
      <button className="lg:hidden text-gray-500 hover:text-gray-700 mr-3">
        <Menu size={24} />
      </button>
      <h1 className="text-xl font-bold text-gray-800 tracking-tight">{pageTitle}</h1>
    </header>
  );
}
