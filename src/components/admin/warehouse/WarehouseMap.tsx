import React from "react";
import {
  Package,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { StatCard, StatusBadge } from "./WarehouseUI";

export default function WarehouseMap({ mapData, statsData }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Tổng thùng trong kho"
          value={statsData.totalBoxes.toLocaleString()}
          color="text-[#1D9E75]"
          bg="bg-[#1D9E75]/10"
        />
        <StatCard
          icon={AlertTriangle}
          label="Sắp hết hạn"
          value={statsData.soonExpire.toString()}
          color="text-[#EF9F27]"
          bg="bg-[#EF9F27]/10"
        />
        <StatCard
          icon={XCircle}
          label="Đã hết hạn"
          value={statsData.expired.toString()}
          color="text-[#E24B4A]"
          bg="bg-[#E24B4A]/10"
        />
        <StatCard
          icon={Clock}
          label="Cập nhật lúc"
          value={new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          color="text-[#378ADD]"
          bg="bg-[#378ADD]/10"
          valueSize="text-lg"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mapData.map((zone: any) => (
          <div
            key={zone.id}
            className="bg-[#FFFFFF] rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-lg">{zone.name}</h3>
            </div>
            <div className="p-5 space-y-4">
              {zone.rows.map((row: any) => (
                <div key={row.id}>
                  <p className="text-sm font-medium text-[#888780] mb-3 flex items-center gap-2">
                    <ArrowRight size={14} /> {row.name}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {row.shelves.map((shelf: any) => (
                      <div
                        key={shelf.id}
                        className="p-3 rounded-xl border border-gray-100 hover:border-[#1D9E75] hover:shadow-md cursor-pointer bg-white group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-sm bg-gray-100 px-2 py-0.5 rounded">
                            {shelf.name}
                          </span>
                          <StatusBadge status={shelf.status} />
                        </div>
                        <p className="text-[15px] font-medium mt-2">
                          {shelf.product || "---"}
                        </p>
                        <p className="text-xs text-[#888780] mt-1">
                          {shelf.qty} thùng
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
