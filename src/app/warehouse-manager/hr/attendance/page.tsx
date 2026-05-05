"use client";

import { useEffect, useState } from "react";
import { LiveClock } from "@/components/admin/attendance/LiveClock";
import {
  ShiftTable,
  CaLamViecToday,
} from "@/components/admin/attendance/ShiftTable";

export default function ChamCongHomNayPage() {
  const [data, setData] = useState<CaLamViecToday[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu + Auto Polling mỗi 30 giây
  const fetchChamCong = async () => {
    try {
      const res = await fetch("/api/cham-cong/hom-nay");
      const result = await res.json();
      if (result?.success && Array.isArray(result?.data)) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu chấm công:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChamCong();
    const poller = setInterval(fetchChamCong, 30000);
    return () => clearInterval(poller);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Chấm Công Hôm Nay
          </h1>
          <p className="text-gray-500">
            Giám sát trạng thái vào/ra kho theo thời gian thực
          </p>
        </div>
        <LiveClock />
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <span className="animate-pulse">Đang tải dữ liệu...</span>
        </div>
      ) : data?.length === 0 ? (
        <div className="p-10 text-center bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
          Không có ca làm việc nào được phân lịch cho hôm nay.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {data.map((ca) => (
            <ShiftTable key={ca?.ma_ca} ca={ca} />
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-end pt-4">
        <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition shadow-sm">
          + Chấm công thủ công
        </button>
      </div>
    </div>
  );
}
