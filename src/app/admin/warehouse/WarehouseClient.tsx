"use client";
import React, { useState } from "react";
import {
  Warehouse,
  Map,
  ArrowDownToLine,
  ScanBarcode,
  AlertOctagon,
} from "lucide-react";
import { TabButton } from "@/components/admin/warehouse/WarehouseUI";
import WarehouseMap from "@/components/admin/warehouse/WarehouseMap";
import GoodsReceipt from "@/components/admin/warehouse/GoodsReceipt";
import GoodsIssueScan from "@/components/admin/warehouse/GoodsIssueScan";
import ExpirationWarnings from "@/components/admin/warehouse/ExpirationWarnings";

export default function WarehouseClient({
  mapData,
  warningsData,
  statsData,
}: any) {
  const [activeTab, setActiveTab] = useState<
    "map" | "import" | "scan" | "warnings"
  >("map");

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 lg:p-8 bg-[#F1EFE8] min-h-screen text-[#2C2C2A]">
      <div className="bg-[#FFFFFF] p-4 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Warehouse className="text-[#1D9E75]" /> Quản lý Kho FEFO
          </h1>
        </div>
        <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto custom-scrollbar">
          <TabButton
            active={activeTab === "map"}
            onClick={() => setActiveTab("map")}
            icon={Map}
            label="Sơ đồ kho"
          />
          <TabButton
            active={activeTab === "import"}
            onClick={() => setActiveTab("import")}
            icon={ArrowDownToLine}
            label="Phiếu nhập kho"
          />
          <TabButton
            active={activeTab === "scan"}
            onClick={() => setActiveTab("scan")}
            icon={ScanBarcode}
            label="Xuất kho (Quét mã)"
          />
          <TabButton
            active={activeTab === "warnings"}
            onClick={() => setActiveTab("warnings")}
            icon={AlertOctagon}
            label="Cảnh báo hết hạn"
            alertCount={statsData.alertCount}
          />
        </div>
      </div>

      <div className="animate-in fade-in duration-300">
        {/* Truyền dữ liệu xuống cho các Component con */}
        <div className={activeTab === "map" ? "block" : "hidden"}>
          <WarehouseMap mapData={mapData} statsData={statsData} />
        </div>
        <div className={activeTab === "import" ? "block" : "hidden"}>
          <GoodsReceipt />
        </div>
        <div className={activeTab === "scan" ? "block" : "hidden"}>
          <GoodsIssueScan />
        </div>
        <div className={activeTab === "warnings" ? "block" : "hidden"}>
          <ExpirationWarnings warningsData={warningsData} />
        </div>
      </div>
    </div>
  );
}
