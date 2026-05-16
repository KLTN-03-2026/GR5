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
  LogOut,
  Warehouse,
  MessageCircleMore,
  ChevronDown,
  ChevronRight,
  DatabaseBackup,
  UserCog,
  ClipboardList,
} from "lucide-react";
import { FaPeopleCarry } from "react-icons/fa";

type MenuItem = {
  name: string;
  path: string;
  icon: any;
  description: string;
  subItems?: { name: string; path: string }[];
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menuSections: MenuSection[] = [
  {
    title: "Tổng quan",
    items: [
      { name: "Tổng quan", path: "/admin/overview", icon: LayoutDashboard, description: "Báo cáo tổng hợp" },
      {
        name: "Báo cáo",
        path: "/admin/reports",
        icon: BarChart2,
        description: "Phân tích & Thống kê",
        subItems: [
          { name: "Doanh thu", path: "/admin/reports/revenue" },
          { name: "Kho hàng", path: "/admin/reports/inventory" },
          { name: "Đơn hàng", path: "/admin/reports/orders" },
        ],
      },
    ],
  },
  {
    title: "Bán hàng",
    items: [
      { name: "Đơn hàng", path: "/admin/orders", icon: ShoppingCart, description: "Quản lý đơn bán" },
      { name: "Thanh toán", path: "/admin/payments", icon: CreditCard, description: "Giao dịch tài chính" },
      { name: "Khuyến mãi", path: "/admin/promotions", icon: Gift, description: "Chương trình ưu đãi" },
    ],
  },
  {
    title: "Sản phẩm & Kho",
    items: [
      { name: "Sản phẩm", path: "/admin/products", icon: Package, description: "Quản lý hàng hóa" },
      { name: "Danh mục", path: "/admin/categories", icon: Layers, description: "Phân loại sản phẩm" },
      { name: "Kho hàng", path: "/admin/warehouse", icon: Warehouse, description: "Quản lý tồn kho" },
      { name: "Đặt hàng NCC", path: "/admin/warehouse/purchase-orders", icon: ClipboardList, description: "Tạo đơn đặt hàng nhà cung cấp" },
      { name: "Nhà cung cấp", path: "/admin/suppliers", icon: Truck, description: "Đối tác kinh doanh" },
    ],
  },
  {
    title: "Khách hàng & Nội dung",
    items: [
      { name: "Khách hàng", path: "/admin/customers", icon: Users, description: "Dữ liệu người mua" },
      { name: "Bình luận", path: "/admin/reviews", icon: MessageCircleMore, description: "Đánh giá từ khách" },
      { name: "Nội dung", path: "/admin/content", icon: FileText, description: "Quản lý bài viết" },
    ],
  },
  {
    title: "Nội bộ",
    items: [
      {
        name: "Nhân sự",
        path: "/admin/hr",
        icon: FaPeopleCarry,
        description: "Nhân viên & phân ca",
        subItems: [
          { name: "Tổng quan nhân sự", path: "/admin/hr" },
          { name: "Danh sách nhân viên", path: "/admin/hr/employees" },
          { name: "Phân ca làm việc", path: "/admin/hr/shifts" },
          { name: "Chấm công hôm nay", path: "/admin/hr/attendance" },
          { name: "Bảng lương", path: "/admin/hr/payroll" },
          { name: "Quản lý nghỉ phép", path: "/admin/hr/leave" },
        ],
      },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { name: "Sao lưu", path: "/admin/backup", icon: DatabaseBackup, description: "Backup & Khôi phục" },
    ],
  },
  {
    title: "Cá nhân",
    items: [
      { name: "Tài khoản của tôi", path: "/admin/account", icon: UserCog, description: "Mật khẩu & Face ID" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialOpenState: Record<string, boolean> = {};
    menuSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.subItems && pathname.startsWith(item.path)) {
          initialOpenState[item.name] = true;
        }
      });
    });
    setOpenMenus(initialOpenState);
  }, [pathname]);

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const renderItem = (item: MenuItem) => {
    const Icon = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isParentActive = pathname.startsWith(item.path);

    if (hasSubItems) {
      return (
        <div className="flex flex-col" key={item.path}>
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
      );
    }

    return (
      <Link
        key={item.path}
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
    );
  };

  return (
    <aside className="w-[260px] bg-[#1a1f2c] text-gray-300 flex flex-col h-screen flex-shrink-0">
      {/* Header Sidebar */}
      <div className="h-16 flex items-center px-6 mb-2 mt-2">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <Layers className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight">NôngSản</h1>
            <p className="text-[10px] text-gray-400 font-medium">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar pb-4">
        {menuSections.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? "mt-4" : "mt-2"}>
            <p className="px-5 mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#64748b]">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => renderItem(item))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 mt-auto border-t border-[#e5e7eb]/10 pt-3">
        <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition-colors border border-white/5">
          <Link href="/admin/account" className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-sm">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin</p>
              <p className="text-xs text-gray-400 truncate">Quản trị viên</p>
            </div>
          </Link>
          <button
            className="text-gray-400 hover:text-white transition-colors ml-2 flex-shrink-0"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
