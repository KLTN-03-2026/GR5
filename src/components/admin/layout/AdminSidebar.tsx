"use client";
import React from "react";
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
} from "lucide-react";

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
  { name: "Cài đặt", path: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] bg-[#1a1f2c] text-gray-300 flex flex-col h-screen flex-shrink-0">
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
                  ? "bg-green-600 text-white shadow-md"
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
