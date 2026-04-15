"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { name: "Tổng quan", path: "/admin/overview", icon: LayoutDashboard },
  { name: "Thống kê", path: "/admin/analytics", icon: BarChart2 },
  { name: "Sản phẩm", path: "/admin/products", icon: Package },
  { name: "Kho Hàng", path: "/admin/warehouse", icon: Warehouse },
  { name: "Nhà cung cấp", path: "/admin/suppliers", icon: Truck },
  { name: "Đơn hàng", path: "/admin/orders", icon: ShoppingCart },
  { name: "Khách hàng", path: "/admin/customers", icon: Users },
  { name: "Danh mục", path: "/admin/categories", icon: Layers },
  { name: "Thanh toán", path: "/admin/payments", icon: CreditCard },
  { name: "Nội dung", path: "/admin/content", icon: FileText },
  { name: "Khuyến mãi", path: "/admin/promotions", icon: Gift },
  { name: "Bình luận", path: "/admin/reviews", icon: MessageCircleMore },
  { name: "Cài đặt", path: "/admin/settings", icon: Settings },
  {
    name: "Nhân sự",
    path: "/admin/hr",
    icon: FaPeopleCarry,
    subItems: [
      { name: "Danh sách nhân viên", path: "/admin/hr/employees" },
      { name: "Phân ca làm việc", path: "/admin/hr/shifts" }, // <-- Thêm dòng này
      { name: "Chấm công hôm nay", path: "/admin/hr/attendance" },
      { name: "Bảng lương", path: "/admin/hr/payroll" }, // <-- Thêm dòng này
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
          <div className="bg-green-600 p-2 rounded-lg">
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

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isParentActive = pathname.startsWith(item.path);

          return (
            <div key={item.path}>
              {hasSubItems ? (
                // RENDER MENU CÓ DROPDOWN (CÓ SUB-ITEMS)
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isParentActive
                        ? "bg-white/10 text-white" // Đang ở trong menu con thì highlight nhẹ menu cha
                        : "hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={isParentActive ? "text-green-500" : ""}
                      />
                      {item.name}
                    </div>
                    {openMenus[item.name] ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </button>

                  {/* Vùng Dropdown Items */}
                  {openMenus[item.name] && (
                    <div className="flex flex-col gap-1 mt-1 pl-10 pr-2">
                      {item.subItems!.map((sub) => {
                        const isSubActive = pathname === sub.path;
                        return (
                          <Link
                            key={sub.path}
                            href={sub.path}
                            className={`block px-3 py-2 rounded-md text-sm font-medium transition-all ${
                              isSubActive
                                ? "bg-green-600 text-white shadow-md"
                                : "text-gray-400 hover:text-white hover:bg-white/10"
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
                // RENDER MENU BÌNH THƯỜNG (KHÔNG CÓ SUB-ITEMS)
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isParentActive
                      ? "bg-green-600 text-white shadow-md"
                      : "hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
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
          <button className="text-gray-400 hover:text-white transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
