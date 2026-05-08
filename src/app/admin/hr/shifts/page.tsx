"use client";

import { useEffect, useState } from "react";
import { AssignShiftModal } from "@/components/admin/shifts/AssignShiftModal";
import { ChevronLeft, ChevronRight, CalendarDays, Plus, Trash2 } from "lucide-react";

type CaLamViec = { id: number; ten_ca: string; gio_bat_dau: string };
type NhanVienCa = {
  id: number;
  ngay_lam_viec: string;
  ma_ca_lam: number;
  nguoi_dung: {
    id: number;
    ho_so_nguoi_dung: { ho_ten: string; anh_dai_dien: string };
  };
};

const CA_COLORS: Record<string, { bg: string; text: string; dot: string; header: string }> = {
  default: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400", header: "bg-blue-600" },
  1: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400", header: "bg-orange-500" },
  2: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400", header: "bg-violet-600" },
  3: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-400", header: "bg-indigo-600" },
};

export default function ShiftsPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [caLamViec, setCaLamViec] = useState<CaLamViec[]>([]);
  const [lichPhanCa, setLichPhanCa] = useState<NhanVienCa[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<{ id: number; name: string } | null>(null);

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  useEffect(() => { setCurrentWeekStart(getStartOfWeek(new Date())); }, []);

  const fetchLichTuan = async (startDate: Date) => {
    setLoading(true);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    try {
      const tuNgay = startDate.toISOString().split("T")[0];
      const denNgay = endDate.toISOString().split("T")[0];
      const res = await fetch(`/api/phan-ca?tu_ngay=${tuNgay}&den_ngay=${denNgay}`);
      const result = await res.json();
      if (result.success) {
        setLichPhanCa(result.data);
        setCaLamViec(result.ca_lam_viec || []);
      }
    } catch (error) {
      console.error("Lỗi tải lịch phân ca:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (currentWeekStart) fetchLichTuan(currentWeekStart); }, [currentWeekStart]);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };
  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };
  const goToToday = () => setCurrentWeekStart(getStartOfWeek(new Date()));

  const openAssignModal = (date: Date, ca: CaLamViec) => {
    setSelectedDate(date);
    setSelectedShift({ id: ca.id, name: ca.ten_ca });
    setIsModalOpen(true);
  };

  const handleDeleteLich = async (idLich: number) => {
    if (!confirm("Bạn có chắc chắn muốn hủy ca của nhân viên này?")) return;
    try {
      const res = await fetch(`/api/phan-ca/${idLich}`, { method: "DELETE" });
      if (res.ok) fetchLichTuan(currentWeekStart);
    } catch (e) { console.error(e); }
  };

  const DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const DAY_FULL = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const today = new Date().toDateString();

  const totalAssigned = lichPhanCa.length;
  const totalSlots = caLamViec.length * 7;

  return (
    <div className="p-6 space-y-5 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phân Ca Làm Việc</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sắp xếp và quản lý lịch làm việc hàng tuần</p>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center gap-2">
          <button onClick={goToToday}
            className="px-3 py-2 text-sm font-medium border rounded-lg text-gray-600 hover:bg-white hover:shadow-sm transition bg-white">
            Hôm nay
          </button>
          <div className="flex items-center bg-white border rounded-lg shadow-sm overflow-hidden">
            <button onClick={prevWeek} className="p-2.5 hover:bg-gray-50 text-gray-600 transition border-r">
              <ChevronLeft size={16} />
            </button>
            <div className="px-4 py-2 text-sm font-semibold text-gray-800 flex items-center gap-2 min-w-[200px] justify-center">
              <CalendarDays size={15} className="text-emerald-600" />
              {weekDays[0]?.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
              {" – "}
              {weekDays[6]?.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </div>
            <button onClick={nextWeek} className="p-2.5 hover:bg-gray-50 text-gray-600 transition border-l">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-lg text-sm text-gray-600 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium">{totalAssigned}</span> lượt phân công trong tuần
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-lg text-sm text-gray-600 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="font-medium">{caLamViec.length}</span> ca làm việc
        </div>
        {totalSlots > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-lg text-sm text-gray-600 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            Độ phủ <span className="font-medium">{Math.round((totalAssigned / (totalSlots || 1)) * 100)}%</span>
          </div>
        )}
      </div>

      {/* Weekly Grid */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-gray-400 text-sm animate-pulse">Đang tải lịch làm việc...</div>
        ) : caLamViec.length === 0 ? (
          <div className="py-24 text-center text-gray-400 text-sm">Chưa có ca làm việc nào được cấu hình</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[860px]">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="w-32 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r">
                    Ca / Ngày
                  </th>
                  {weekDays.map((day, i) => {
                    const isToday = today === day.toDateString();
                    return (
                      <th key={i}
                        className={`px-3 py-3 text-center min-w-[130px] border-r last:border-r-0 ${isToday ? "bg-emerald-50" : ""}`}>
                        <div className={`text-xs font-bold uppercase tracking-wider ${isToday ? "text-emerald-600" : "text-gray-500"}`}>
                          {DAY_NAMES[day.getDay()]}
                        </div>
                        <div className={`text-base font-bold mt-0.5 ${isToday ? "text-emerald-700" : "text-gray-800"}`}>
                          {day.getDate()}
                        </div>
                        <div className={`text-xs ${isToday ? "text-emerald-500" : "text-gray-400"}`}>
                          tháng {day.getMonth() + 1}
                        </div>
                        {isToday && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mx-auto mt-1" />}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {caLamViec.map((ca, caIdx) => {
                  const color = CA_COLORS[String(caIdx + 1)] || CA_COLORS.default;
                  return (
                    <tr key={ca.id} className="border-b last:border-b-0">
                      {/* Ca name cell */}
                      <td className="px-4 py-4 border-r align-middle bg-gray-50/40">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${color.dot} flex-shrink-0`} />
                          <div>
                            <div className="font-bold text-gray-800 text-xs uppercase tracking-wide">{ca.ten_ca}</div>
                          </div>
                        </div>
                      </td>

                      {weekDays.map((day, i) => {
                        const dateStr = day.toISOString().split("T")[0];
                        const nvList = lichPhanCa.filter(
                          (l) => l.ma_ca_lam === ca.id && l.ngay_lam_viec.startsWith(dateStr)
                        );
                        const isToday = today === day.toDateString();

                        return (
                          <td key={i}
                            className={`px-2 py-2 border-r last:border-r-0 align-top ${isToday ? "bg-emerald-50/30" : "hover:bg-gray-50/50"} transition-colors`}>
                            <div className="flex flex-col gap-1 min-h-[80px]">
                              {nvList.map((lich) => (
                                <div key={lich.id}
                                  className={`group flex items-center justify-between px-2 py-1.5 rounded-lg border ${color.bg} border-transparent hover:border-gray-200 transition-all`}>
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className={`w-1.5 h-1.5 rounded-full ${color.dot} flex-shrink-0`} />
                                    <span className={`text-xs font-medium truncate ${color.text}`}
                                      title={lich.nguoi_dung?.ho_so_nguoi_dung?.ho_ten}>
                                      {lich.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || "N/A"}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteLich(lich.id)}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 text-red-400 hover:text-red-600 transition-all flex-shrink-0"
                                    title="Xóa khỏi ca">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => openAssignModal(day, ca)}
                                className="mt-auto w-full py-1 text-xs font-medium text-gray-400 border border-dashed border-gray-200 rounded-lg hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-1">
                                <Plus size={11} />
                                Thêm
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AssignShiftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        selectedShift={selectedShift}
        onSuccess={() => fetchLichTuan(currentWeekStart)}
      />
    </div>
  );
}
