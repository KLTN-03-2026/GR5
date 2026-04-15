"use client";

import { AttendanceBadge } from "./AttendanceBadge";

// Nên export type này ra file types/index.ts hoặc types/hr.types.ts để dùng chung
export type NhanVienChamCong = {
  ma_nguoi_dung: number;
  ho_ten: string;
  gio_vao: string | null;
  gio_ra: string | null;
  trang_thai: string;
  so_phut_tre: number;
};

export type CaLamViecToday = {
  ma_ca: number;
  ten_ca: string;
  danh_sach_nhan_vien: NhanVienChamCong[];
};

interface ShiftTableProps {
  ca: CaLamViecToday;
}

export function ShiftTable({ ca }: ShiftTableProps) {
  const formatTime = (dateString: string | null) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const dsNhanVien = ca?.danh_sach_nhan_vien || [];

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
        <h3 className="font-bold text-gray-700 uppercase">
          {ca?.ten_ca || "Ca chưa rõ"}
        </h3>
        <span className="text-xs font-medium text-gray-500">
          {dsNhanVien.length} nhân sự
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-500 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Nhân viên</th>
              <th className="px-4 py-3 font-medium text-center">Giờ vào</th>
              <th className="px-4 py-3 font-medium text-center">Giờ ra</th>
              <th className="px-4 py-3 font-medium text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dsNhanVien.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-gray-400 italic"
                >
                  Không có dữ liệu nhân sự
                </td>
              </tr>
            ) : (
              dsNhanVien.map((nv) => (
                <tr
                  key={nv.ma_nguoi_dung}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {nv?.ho_ten || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-center">
                    {formatTime(nv?.gio_vao)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-center">
                    {formatTime(nv?.gio_ra)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AttendanceBadge
                      trangThai={nv?.trang_thai}
                      phutTre={nv?.so_phut_tre}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
