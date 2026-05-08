import React from "react";
import WarehouseLayoutTabs from "@/components/admin/warehouse/WarehouseLayoutTabs";

export default function WarehouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2C2C2A]">Quản lý Kho hàng</h1>
        <p className="text-sm text-[#888780] mt-1">
          Sơ đồ kho, tồn kho sản phẩm, cảnh báo HSD và lịch sử
        </p>
      </div>

      <WarehouseLayoutTabs />

      <div>{children}</div>
    </div>
  );
}
