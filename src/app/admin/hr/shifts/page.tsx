"use client";

import { useEffect, useState } from "react";
import { AssignShiftModal } from "@/components/admin/shifts/AssignShiftModal";

// Các type cơ bản
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

export default function ShiftsPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [caLamViec, setCaLamViec] = useState<CaLamViec[]>([]);
  const [lichPhanCa, setLichPhanCa] = useState<NhanVienCa[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Helper tính thứ 2 của tuần hiện tại
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Điều chỉnh nếu là Chủ nhật
    return new Date(d.setDate(diff));
  };

  useEffect(() => {
    setCurrentWeekStart(getStartOfWeek(new Date()));
  }, []);

  // Fetch dữ liệu theo tuần
  const fetchLichTuan = async (startDate: Date) => {
    setLoading(true);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // Lấy thêm 6 ngày (T2 -> CN)

    try {
      const tuNgay = startDate.toISOString().split("T")[0];
      const denNgay = endDate.toISOString().split("T")[0];
      const res = await fetch(
        `/api/phan-ca?tu_ngay=${tuNgay}&den_ngay=${denNgay}`,
      );
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

  useEffect(() => {
    if (currentWeekStart) {
      fetchLichTuan(currentWeekStart);
    }
  }, [currentWeekStart]);

  // Sinh mảng 7 ngày cho giao diện
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Chuyển tuần
  const prevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  // Mở modal gán ca
  const openAssignModal = (date: Date, ca: CaLamViec) => {
    setSelectedDate(date);
    setSelectedShift({ id: ca.id, name: ca.ten_ca });
    setIsModalOpen(true);
  };

  // Xóa ca
  const handleDeleteLich = async (idLich: number) => {
    if (!confirm("Bạn có chắc chắn muốn hủy ca của nhân viên này?")) return;
    try {
      const res = await fetch(`/api/phan-ca/${idLich}`, { method: "DELETE" });
      if (res.ok) fetchLichTuan(currentWeekStart); // Refresh
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Điều hướng tuần */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lịch Làm Việc</h1>
          <p className="text-gray-500">Sắp xếp ca làm việc cho nhân viên kho</p>
        </div>

        <div className="flex items-center gap-4 bg-white border rounded-lg p-1 shadow-sm">
          <button
            onClick={prevWeek}
            className="p-2 hover:bg-gray-100 rounded text-gray-600 font-bold"
          >
            &larr;
          </button>
          <div className="text-sm font-medium text-gray-800 px-2">
            {weekDays[0]?.toLocaleDateString("vi-VN")} -{" "}
            {weekDays[6]?.toLocaleDateString("vi-VN")}
          </div>
          <button
            onClick={nextWeek}
            className="p-2 hover:bg-gray-100 rounded text-gray-600 font-bold"
          >
            &rarr;
          </button>
        </div>
      </div>

      {/* Lưới Lịch (Weekly Grid) */}
      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        {loading ? (
          <div className="py-20 text-center text-gray-500 animate-pulse">
            Đang tải lịch làm việc...
          </div>
        ) : (
          <table className="w-full text-sm text-left border-collapse min-w-[800px]">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-4 py-3 border-r border-b w-32 bg-gray-100/50 text-gray-500 font-semibold text-center">
                  Ca \ Ngày
                </th>
                {weekDays.map((day, i) => {
                  const isToday =
                    new Date().toDateString() === day.toDateString();
                  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                  return (
                    <th
                      key={i}
                      className={`px-2 py-3 border-r border-b text-center min-w-[150px] ${isToday ? "bg-blue-50 text-blue-700" : "text-gray-600"}`}
                    >
                      <div className="font-bold">{dayNames[day.getDay()]}</div>
                      <div className="text-xs font-normal opacity-80">
                        {day.getDate()}/{day.getMonth() + 1}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {caLamViec.map((ca) => (
                <tr key={ca.id}>
                  {/* Cột tên ca */}
                  <td className="px-4 py-4 border-r border-b bg-gray-50/30 text-center align-middle">
                    <div className="font-bold text-gray-700 uppercase">
                      {ca.ten_ca}
                    </div>
                  </td>

                  {/* Các cột ngày trong tuần */}
                  {weekDays.map((day, i) => {
                    const targetDateString = day.toISOString().split("T")[0];
                    // Lọc ra nhân viên làm ca này trong ngày này
                    const nhanVienTrongO = lichPhanCa.filter(
                      (l) =>
                        l.ma_ca_lam === ca.id &&
                        l.ngay_lam_viec.startsWith(targetDateString),
                    );

                    return (
                      <td
                        key={i}
                        className="px-2 py-2 border-r border-b align-top relative group hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex flex-col gap-1 min-h-[80px]">
                          {nhanVienTrongO.map((lich) => (
                            <div
                              key={lich.id}
                              className="flex items-center justify-between p-1.5 bg-white border shadow-sm rounded group/item"
                            >
                              <span
                                className="text-xs font-medium text-gray-700 truncate w-full"
                                title={
                                  lich.nguoi_dung?.ho_so_nguoi_dung?.ho_ten
                                }
                              >
                                {lich.nguoi_dung?.ho_so_nguoi_dung?.ho_ten ||
                                  "N/A"}
                              </span>
                              <button
                                onClick={() => handleDeleteLich(lich.id)}
                                className="text-red-400 hover:text-red-600 opacity-0 group-hover/item:opacity-100 transition-opacity p-0.5"
                                title="Xóa nhân viên khỏi ca"
                              >
                                ✕
                              </button>
                            </div>
                          ))}

                          {/* Nút thêm ca (Luôn hiện mờ mờ dưới cùng) */}
                          <button
                            onClick={() => openAssignModal(day, ca)}
                            className="mt-auto w-full py-1 text-xs font-medium text-blue-600 border border-dashed border-blue-200 rounded bg-blue-50/50 hover:bg-blue-100 hover:border-blue-300 transition-colors"
                          >
                            + Thêm
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Tích hợp Modal */}
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
