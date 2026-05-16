"use client";

import { useEffect, useState } from "react";
import { LiveClock } from "@/components/admin/attendance/LiveClock";
import { ShiftTable, CaLamViecToday } from "@/components/admin/attendance/ShiftTable";
import { RefreshCw, Clock, Users, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ChamCongHomNayPage() {
  const [data, setData] = useState<CaLamViecToday[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChamCong = async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/cham-cong/hom-nay");
      const result = await res.json();
      if (result?.success && Array.isArray(result?.data)) {
        setData(result.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu chấm công:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChamCong();
    const poller = setInterval(() => fetchChamCong(), 30000);
    return () => clearInterval(poller);
  }, []);

  // Tổng hợp số liệu từ tất cả ca
  const tongPhanCong = data.reduce((sum, ca) => sum + (ca.danh_sach_nhan_vien?.length || 0), 0);
  const tongDaChamCong = data.reduce(
    (sum, ca) => sum + (ca.danh_sach_nhan_vien?.filter((nv) => nv.gio_vao).length || 0),
    0
  );
  const tongDiTre = data.reduce(
    (sum, ca) => sum + (ca.danh_sach_nhan_vien?.filter((nv) => nv.trang_thai === "DI_TRE").length || 0),
    0
  );
  const tongChuaCham = tongPhanCong - tongDaChamCong;

  const summaryCards = [
    { label: "Ca hôm nay", value: data.length, icon: Clock, color: "blue", bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { label: "Đã chấm công", value: tongDaChamCong, icon: CheckCircle2, color: "emerald", bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { label: "Chưa chấm", value: tongChuaCham, icon: Users, color: "amber", bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
    { label: "Đi trễ", value: tongDiTre, icon: AlertTriangle, color: "red", bg: "bg-red-50", border: "border-red-100", text: "text-red-700", iconBg: "bg-red-100", iconColor: "text-red-600" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chấm Công Hôm Nay</h1>
          <p className="text-sm text-gray-500 mt-0.5">Giám sát trạng thái vào/ra kho theo thời gian thực</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {lastUpdated && (
            <span className="text-xs text-gray-400 hidden sm:block">
              Cập nhật lúc {lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => fetchChamCong(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-white hover:shadow-sm transition bg-white disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Làm mới
          </button>
          <LiveClock />
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((s) => (
            <div key={s.label} className={`${s.bg} ${s.border} border rounded-xl p-4 flex items-center gap-4`}>
              <div className={`${s.iconBg} rounded-xl p-2.5 flex-shrink-0`}>
                <s.icon size={20} className={s.iconColor} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shift Tables */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <RefreshCw size={24} className="animate-spin text-emerald-500" />
          <span className="text-sm">Đang tải dữ liệu chấm công...</span>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-xl border shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">Không có ca làm việc hôm nay</p>
          <p className="text-sm text-gray-400">Vui lòng kiểm tra lịch phân ca</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {data.map((ca) => (
            <ShiftTable key={ca?.ma_ca} ca={ca} />
          ))}
        </div>
      )}

      {/* Footer Action */}
      {!loading && (
        <div className="flex justify-between items-center pt-2">
          <p className="text-xs text-gray-400">Tự động làm mới mỗi 30 giây</p>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition shadow-sm text-sm">
            + Chấm công thủ công
          </button>
        </div>
      )}
    </div>
  );
}
