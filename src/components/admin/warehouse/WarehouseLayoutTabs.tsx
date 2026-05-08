"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package } from "lucide-react";

const tabs = [
  {
    href: "/admin/warehouse/map",
    label: "Sơ đồ kho",
    icon: LayoutGrid,
    match: "/admin/warehouse/map",
  },
  {
    href: "/admin/warehouse/inventory",
    label: "Tồn kho",
    icon: Package,
    match: "/admin/warehouse/inventory",
  },
];

export default function WarehouseLayoutTabs() {
  const pathname = usePathname();

  return (
    <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto custom-scrollbar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active =
          pathname === tab.match || pathname?.startsWith(`${tab.match}/`);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 min-w-[170px] py-3 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-colors border-b-2 ${active ? "border-[#1D9E75] text-[#1D9E75]" : "border-transparent text-[#888780] hover:text-[#2C2C2A] hover:bg-gray-50"}`}
          >
            <Icon size={18} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
