"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Gift,
  LayoutDashboard,
  BarChart2,
  Package,
  Truck,
  ShoppingCart,
  Users,
  Layers,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Warehouse,
  MessageCircleMore,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { FaPeopleCarry } from "react-icons/fa";

const menuItems = [
  { name: "Tổng quan", path: "/admin/overview", icon: LayoutDashboard, description: "Báo cáo tổng hợp" },
  { name: "Sản phẩm", path: "/admin/products", icon: Package, description: "Quản lý hàng hóa" },
  { name: "Kho Hàng", path: "/admin/warehouse", icon: Warehouse, description: "Quản lý tồn kho" },
  { name: "Nhà cung cấp", path: "/admin/suppliers", icon: Truck, description: "Đối tác kinh doanh" },
  { name: "Đơn hàng", path: "/admin/orders", icon: ShoppingCart, description: "Quản lý đơn bán" },
  { name: "Khách hàng", path: "/admin/customers", icon: Users, description: "Dữ liệu người mua" },
  { name: "Danh mục", path: "/admin/categories", icon: Layers, description: "Phân loại sản phẩm" },
  { name: "Thanh toán", path: "/admin/payments", icon: CreditCard, description: "Giao dịch tài chính" },
  { name: "Nội dung", path: "/admin/content", icon: FileText, description: "Quản lý bài viết" },
  { name: "Khuyến mãi", path: "/admin/promotions", icon: Gift, description: "Chương trình ưu đãi" },
  { name: "Bình luận", path: "/admin/reviews", icon: MessageCircleMore, description: "Đánh giá từ khách" },
  { name: "Cài đặt", path: "/admin/settings", icon: Settings, description: "Cấu hình hệ thống" },
  {
    name: "Nhân sự",
    path: "/admin/hr",
    icon: FaPeopleCarry,
    description: "Nhân viên & phân ca",
    subItems: [
      { name: "Danh sách nhân viên", path: "/admin/hr/employees" },
      { name: "Phân ca làm việc", path: "/admin/hr/shifts" },
      { name: "Chấm công hôm nay", path: "/admin/hr/attendance" },
      { name: "Bảng lương", path: "/admin/hr/payroll" },
      { name: "Quản lý nghỉ phép", path: "/admin/hr/leave" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  // State quản lý đóng/mở dropdown. Tự động mở menu nếu đang ở trong route đó.
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialOpenState: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (item.subItems && pathname.startsWith(item.path)) {
        initialOpenState[item.name] = true;
      }
    });
    setOpenMenus(initialOpenState);
  }, [pathname]);

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  return (
    <aside className="w-[260px] bg-[#1a1f2c] text-gray-300 flex flex-col h-screen flex-shrink-0">
      {/* Header Sidebar */}
      <div className="h-16 flex items-center px-6 mb-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <Layers className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight">
              NôngSản
            </h1>
            <p className="text-[10px] text-gray-400 font-medium">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="mx-5 mb-2 mt-4">
        <p className="text-[10px] text-[#94a3b8] uppercase tracking-widest">Quyền truy cập</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isParentActive = pathname.startsWith(item.path);

          return (
            <div key={item.path}>
              {hasSubItems ? (
                // RENDER MENU CÓ DROPDOWN
                <div className="flex flex-col">
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`flex items-center justify-between w-full pl-5 pr-4 py-2.5 text-sm font-medium transition-all border-l-[3px] ${
                      isParentActive
                        ? "bg-[#f0fdf4] text-[#065f46] border-[#059669]"
                        : "text-gray-300 hover:bg-white/10 hover:text-white border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} className="flex-shrink-0" />
                      <div className="flex flex-col min-w-0 text-left">
                        <span className="truncate">{item.name}</span>
                        <span className={`text-[11px] font-normal truncate ${isParentActive ? "text-[#065f46]/70" : "text-[#94a3b8]"}`}>
                          {item.description}
                        </span>
                      </div>
                    </div>
                    {openMenus[item.name] ? (
                      <ChevronDown size={14} className={isParentActive ? "text-[#065f46]" : "text-gray-500"} />
                    ) : (
                      <ChevronRight size={14} className={isParentActive ? "text-[#065f46]" : "text-gray-500"} />
                    )}
                  </button>

                  {/* Sub-items dropdown */}
                  {openMenus[item.name] && (
                    <div className="flex flex-col gap-0.5 py-1 pl-[52px] pr-3">
                      {item.subItems!.map((sub) => {
                        const isSubActive = pathname === sub.path;
                        return (
                          <Link
                            key={sub.path}
                            href={sub.path}
                            className={`block px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                              isSubActive
                                ? "text-[#059669] bg-white/10"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                // RENDER MENU BÌNH THƯỜNG
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 pl-5 pr-4 py-2.5 text-sm font-medium transition-all border-l-[3px] ${
                    isParentActive
                      ? "bg-[#f0fdf4] text-[#065f46] border-[#059669]"
                      : "text-gray-300 hover:bg-white/10 hover:text-white border-transparent"
                  }`}
                >
                  <Icon size={17} className="flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{item.name}</span>
                    <span className={`text-[11px] font-normal truncate ${isParentActive ? "text-[#065f46]/70" : "text-[#94a3b8]"}`}>
                      {item.description}
                    </span>
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 mt-auto">
        <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-sm">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-gray-400">Quản trị viên</p>
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
