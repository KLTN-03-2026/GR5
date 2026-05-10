"use client";

import React from "react";
import { Search, Bell, User } from "lucide-react";
import { usePathname } from "next/navigation";

const routeTitles: Record<string, string> = {
  "/admin/overview": "Tổng quan",
  "/admin/products": "Sản phẩm",
  "/admin/warehouse": "Kho Hàng",
  "/admin/suppliers": "Nhà cung cấp",
  "/admin/orders": "Đơn hàng",
  "/admin/customers": "Khách hàng",
  "/admin/categories": "Danh mục",
  "/admin/payments": "Thanh toán",
  "/admin/content": "Nội dung",
  "/admin/promotions": "Khuyến mãi",
  "/admin/reviews": "Bình luận",
  "/admin/hr": "Nhân sự",
  "/admin/hr/employees": "Danh sách nhân viên",
  "/admin/hr/shifts": "Phân ca làm việc",
  "/admin/hr/attendance": "Chấm công hôm nay",
  "/admin/hr/payroll": "Bảng lương",
  "/admin/hr/leave": "Quản lý nghỉ phép",
  "/warehouse-manager/map": "Sơ Đồ Kho",
  "/warehouse-manager/orders": "Đơn Đặt Hàng NCC",
  "/warehouse-manager/receipts": "Phiếu Nhập Kho",
  "/warehouse-manager/promotions": "Khuyến Mãi Xả Kho",
  "/warehouse-manager/suppliers": "NCC & Công Nợ",
  "/warehouse-manager/history": "Báo Cáo Nhập Xuất",
  "/warehouse-manager/hr": "Nhân Sự Kho",
  "/warehouse-manager/hr/employees": "Danh sách nhân viên",
  "/warehouse-manager/hr/shifts": "Phân ca làm việc",
  "/warehouse-manager/hr/attendance": "Chấm công",
  "/warehouse-manager/hr/payroll": "Bảng lương",
  "/warehouse-manager/hr/leave": "Nghỉ phép",
};

export default function AdminTopbar() {
  const pathname = usePathname();
  
  // Find matching title (exact match or parent match)
  let title = "Tổng quan"; // fallback
  const exactMatch = routeTitles[pathname];
  if (exactMatch) {
    title = exactMatch;
  } else {
    // try to match parent path like /admin/products/123 -> Sản phẩm
    for (const [route, routeTitle] of Object.entries(routeTitles)) {
      if (pathname.startsWith(route)) {
        // give preference to longer matching routes? Object.keys isn't ordered by length.
        // It's better to sort keys by length descending to match /admin/hr/employees before /admin/hr
      }
    }
    
    // Sort keys by length descending
    const sortedRoutes = Object.keys(routeTitles).sort((a, b) => b.length - a.length);
    for (const route of sortedRoutes) {
      if (pathname.startsWith(route)) {
        title = routeTitles[route];
        break;
      }
    }
  }

  return (
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
      <h2 className="text-xl font-bold text-gray-900 hidden md:block">
        {title}
      </h2>

      {/* Right Section: Search & Actions */}
      <div className="flex items-center gap-6 ml-auto">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-600 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm dữ liệu..."
            className="pl-9 pr-4 py-2 bg-gray-50/80 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all w-[280px]"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-50">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          <button className="p-1.5 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors border border-gray-200">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
