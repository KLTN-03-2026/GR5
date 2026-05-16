"use client";

import React from "react";
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
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center px-8 sticky top-0 z-10">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </header>
  );
}
