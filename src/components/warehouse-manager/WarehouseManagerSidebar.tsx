"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  PackageOpen,
  AlertTriangle,
  Map,
  Truck,
  FileBarChart2,
  Gift,
  LogOut,
  Layers,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";

/**
 * Bảng phân quyền THU_KHO:
 * ✅ Tạo đơn đặt hàng NCC       → /warehouse-manager/orders
 * ✅ Tạo phiếu nhập              → /warehouse-manager/receipts (tab tạo mới)
 * ✅ Duyệt phiếu nhập            → /warehouse-manager/receipts
 * ✅ Duyệt tiêu hủy hàng         → /warehouse-manager/alerts
 * ✅ Tạo khuyến mãi xả kho       → /warehouse-manager/promotions
 * ✅ Ghi nhận thanh toán NCC nhỏ → /warehouse-manager/suppliers/[id]/debt
 * ✅ Quản lý thông tin NCC       → /warehouse-manager/suppliers
 * ✅ Xem sơ đồ kho               → /warehouse-manager/map
 * ✅ Xem báo cáo nhập xuất kho   → /warehouse-manager/history
 */
const menuItems = [
  {
    name: "Sơ Đồ Kho",
    path: "/warehouse-manager/map",
    icon: Map,
    description: "Xem bố cục kho hàng",
  },
  {
    name: "Đơn Đặt Hàng NCC",
    path: "/warehouse-manager/orders",
    icon: ClipboardList,
    description: "Tạo đơn đặt hàng nhà CC",
  },
  {
    name: "Phiếu Nhập Kho",
    path: "/warehouse-manager/receipts",
    icon: PackageOpen,
    description: "Tạo & duyệt phiếu nhập",
  },

  {
    name: "Khuyến Mãi Xả Kho",
    path: "/warehouse-manager/promotions",
    icon: Gift,
    description: "Tạo khuyến mãi giảm tồn",
  },

  {
    name: "NCC & Công Nợ",
    path: "/warehouse-manager/suppliers",
    icon: Truck,
    description: "Xem & sửa thông tin NCC",
  },
  {
    name: "Báo Cáo Nhập Xuất",
    path: "/warehouse-manager/history",
    icon: FileBarChart2,
    description: "Lịch sử nhập / xuất kho",
  },
  {
    name: "Quản Lý Nhân Sự",
    path: "/warehouse-manager/hr",
    icon: Users,
    description: "Nhân viên & phân ca kho",
    subItems: [
      { name: "Danh sách nhân viên", path: "/warehouse-manager/hr/employees" },
      { name: "Phân ca làm việc", path: "/warehouse-manager/hr/shifts" },
      { name: "Chấm công", path: "/warehouse-manager/hr/attendance" },
      { name: "Bảng lương", path: "/warehouse-manager/hr/payroll" },
      { name: "Nghỉ phép", path: "/warehouse-manager/hr/leave" },
    ]
  },
];

export default function WarehouseManagerSidebar({
  userEmail,
}: {
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
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
      {/* Header */}
      <div className="h-16 flex items-center px-6 mb-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <Layers className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight">NôngSản</h1>
            <p className="text-[10px] text-gray-400 font-medium">Thủ Kho</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="mx-5 mb-2 mt-4">
        <p className="text-[10px] text-[#94a3b8] uppercase tracking-widest">Quyền truy cập</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.path);
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.path}>
              {hasSubItems ? (
                <div className="flex flex-col">
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`flex items-center justify-between w-full pl-5 pr-4 py-2.5 text-sm font-medium transition-all border-l-[3px] ${
                      isActive
                        ? "bg-[#f0fdf4] text-[#065f46] border-[#059669]"
                        : "text-gray-300 hover:bg-white/10 hover:text-white border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} className="flex-shrink-0" />
                      <div className="flex flex-col min-w-0 text-left">
                        <span className="truncate">{item.name}</span>
                        <span className={`text-[11px] font-normal truncate ${isActive ? "text-[#065f46]/70" : "text-[#94a3b8]"}`}>
                          {item.description}
                        </span>
                      </div>
                    </div>
                    {openMenus[item.name] ? (
                      <ChevronDown size={14} className={isActive ? "text-[#065f46]" : "text-gray-500"} />
                    ) : (
                      <ChevronRight size={14} className={isActive ? "text-[#065f46]" : "text-gray-500"} />
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
              ) : (
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 pl-5 pr-4 py-2.5 text-sm font-medium transition-all border-l-[3px] ${
                    isActive
                      ? "bg-[#f0fdf4] text-[#065f46] border-[#059669]"
                      : "text-gray-300 hover:bg-white/10 hover:text-white border-transparent"
                  }`}
                >
                  <Icon size={17} className="flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{item.name}</span>
                    <span className={`text-[11px] font-normal truncate ${isActive ? "text-[#065f46]/70" : "text-[#94a3b8]"}`}>
                      {item.description}
                    </span>
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto">
        <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm uppercase">
              {userEmail?.[0] || "T"}
            </div>
            <div>
              <p className="text-sm font-medium text-white max-w-[110px] truncate">
                {userEmail || "Thủ Kho"}
              </p>
              <p className="text-xs text-gray-400">Quản lý kho</p>
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-white transition-colors"
            title="Đăng xuất"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
