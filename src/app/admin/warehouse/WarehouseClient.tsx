"use client";

import React, { useState } from "react";
import {
  LayoutGrid,
  Download,
  ScanBarcode,
  AlertTriangle,
  Clock,
} from "lucide-react";

// Import các sub-component
import WarehouseMap from "@/components/admin/warehouse/WarehouseMap";
import GoodsReceipt from "@/components/admin/warehouse/GoodsReceipt";
import GoodsIssueScan from "@/components/admin/warehouse/GoodsIssueScan";
import ExpirationWarnings from "@/components/admin/warehouse/ExpirationWarnings";
import IssueHistory from "@/components/admin/warehouse/IssueHistory";

// Nhận đủ 5 props từ file page.tsx truyền xuống
export default function WarehouseClient({
  mapData,
  warningsData,
  statsData,
  formOptions,
  historyData,
  inventoryData,
}: any) {
  const [activeTab, setActiveTab] = useState("map");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2C2C2A]">Quản lý Kho hàng</h1>
        <p className="text-sm text-[#888780] mt-1">
          Sơ đồ, quy trình nhập/xuất và theo dõi thời hạn
        </p>
      </div>

      {/* Navigation Tabs (Thanh Menu) */}
      <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab("map")}
          className={`flex-1 min-w-[150px] py-3 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "map" ? "border-[#1D9E75] text-[#1D9E75]" : "border-transparent text-[#888780] hover:text-[#2C2C2A] hover:bg-gray-50"}`}
        >
          <LayoutGrid size={18} /> Sơ đồ kho
        </button>
        <button
          onClick={() => setActiveTab("import")}
          className={`flex-1 min-w-[150px] py-3 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "import" ? "border-[#1D9E75] text-[#1D9E75]" : "border-transparent text-[#888780] hover:text-[#2C2C2A] hover:bg-gray-50"}`}
        >
          <Download size={18} /> Nhập kho (QR)
        </button>
        <button
          onClick={() => setActiveTab("scan")}
          className={`flex-1 min-w-[160px] py-3 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "scan" ? "border-[#1D9E75] text-[#1D9E75]" : "border-transparent text-[#888780] hover:text-[#2C2C2A] hover:bg-gray-50"}`}
        >
          <ScanBarcode size={18} /> Xuất kho (FEFO)
        </button>
        <button
          onClick={() => setActiveTab("warnings")}
          className={`flex-1 min-w-[150px] py-3 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "warnings" ? "border-[#E24B4A] text-[#E24B4A]" : "border-transparent text-[#888780] hover:text-[#E24B4A] hover:bg-red-50"}`}
        >
          <AlertTriangle size={18} /> Cảnh báo hạn
          {warningsData?.length > 0 && (
            <span className="bg-[#E24B4A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {warningsData.length}
            </span>
          )}
        </button>
        {/* Nút Tab Lịch sử mới thêm */}
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 min-w-[150px] py-3 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "history" ? "border-[#1D9E75] text-[#1D9E75]" : "border-transparent text-[#888780] hover:text-[#2C2C2A] hover:bg-gray-50"}`}
        >
          <Clock size={18} /> Lịch sử xuất
        </button>
      </div>

      {/* Tab Content (Khu vực hiển thị) */}
      <div className="animate-in fade-in duration-300">
        <div className={activeTab === "map" ? "block" : "hidden"}>
          <WarehouseMap
            mapData={mapData}
            statsData={statsData}
            inventoryData={inventoryData}
          />
        </div>
        <div className={activeTab === "import" ? "block" : "hidden"}>
          <GoodsReceipt formOptions={formOptions} />
        </div>
        <div className={activeTab === "scan" ? "block" : "hidden"}>
          <GoodsIssueScan />
        </div>
        <div className={activeTab === "warnings" ? "block" : "hidden"}>
          <ExpirationWarnings warningsData={warningsData} />
        </div>
        {/* Component Lịch sử xuất kho */}
        <div className={activeTab === "history" ? "block" : "hidden"}>
          <IssueHistory historyData={historyData} />
        </div>
      </div>
    </div>
  );
}
