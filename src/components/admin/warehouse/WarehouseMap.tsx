"use client";

import React from "react";
import {
  Package,
  AlertTriangle,
  Download,
  Map as MapIcon,
  Box,
  Grid3x3,
} from "lucide-react";

// Component con để render Card Thống kê cho gọn code
const StatCard = ({ icon: Icon, label, value, color, bg }: any) => (
  <div className="bg-[#FFFFFF] p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center ${bg}`}
    >
      <Icon className={color} size={24} />
    </div>
    <div>
      <p className="text-sm text-[#888780] font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-[#2C2C2A]">{value}</h3>
    </div>
  </div>
);

export default function WarehouseMap({
  mapData,
  statsData,
}: {
  mapData?: any[];
  statsData?: any;
}) {
  const displayZones = mapData || [];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      {/* KHU VỰC 1: THỐNG KÊ TỔNG QUAN (Đã bọc chống lỗi undefined) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Package}
          label="Tổng thùng trong kho"
          value={(
            statsData?.totalBoxes ||
            statsData?.total ||
            0
          ).toLocaleString()}
          color="text-[#1D9E75]"
          bg="bg-[#1D9E75]/10"
        />
        <StatCard
          icon={AlertTriangle}
          label="Sắp hết hạn"
          value={(
            statsData?.soonExpire ||
            statsData?.expiringBoxes ||
            0
          ).toLocaleString()}
          color="text-[#EF9F27]"
          bg="bg-[#EF9F27]/10"
        />
        <StatCard
          icon={Download}
          label="Đã xuất trong tháng"
          value={(
            statsData?.exportedBoxes ||
            statsData?.exported ||
            0
          ).toLocaleString()}
          color="text-[#378ADD]"
          bg="bg-[#378ADD]/10"
        />
      </div>

      {/* KHU VỰC 2: SƠ ĐỒ KHO TRỰC QUAN */}
      <div className="bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-[#2C2C2A]">
              <MapIcon className="text-[#1D9E75]" /> Bản đồ Sức chứa
            </h2>
            <p className="text-sm text-[#888780] mt-1">
              Giám sát sức chứa các khu vực lưu trữ hiện tại
            </p>
          </div>

          {/* Chú thích màu sắc */}
          <div className="flex gap-4 text-xs font-medium text-[#888780]">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#1D9E75]"></div> Trống
              trải
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#EF9F27]"></div> Sắp đầy
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#E24B4A]"></div> Quá tải
            </span>
          </div>
        </div>

        {/* Lưới hiển thị các Zone */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {displayZones.map((zone, idx) => {
            // Tính toán % để đổ màu thanh progress bar
            const percent =
              Math.round((zone.current / zone.capacity) * 100) || 0;
            let colorHex = "#1D9E75"; // Xanh (Bình thường)
            let bgHex = "bg-teal-50";

            if (percent > 90) {
              colorHex = "#E24B4A";
              bgHex = "bg-red-50";
            } // Đỏ (Quá tải)
            else if (percent > 75) {
              colorHex = "#EF9F27";
              bgHex = "bg-orange-50";
            } // Vàng (Sắp đầy)

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border border-gray-100 ${bgHex} hover:shadow-md transition-all cursor-pointer`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-[#2C2C2A]">
                    {zone.name || `Khu vực ${idx + 1}`}
                  </h3>
                  <Grid3x3 size={16} className="text-gray-400" />
                </div>

                <div className="flex items-center gap-2 text-sm mb-4">
                  <Box size={16} className="text-[#888780]" />
                  <span className="font-semibold text-[#2C2C2A]">
                    {zone.current}
                  </span>
                  <span className="text-[#888780]">
                    / {zone.capacity} thùng
                  </span>
                </div>

                {/* Thanh Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%`, backgroundColor: colorHex }}
                  ></div>
                </div>
                <div
                  className="text-right text-[11px] font-bold mt-1"
                  style={{ color: colorHex }}
                >
                  Đã lấp đầy {percent}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
