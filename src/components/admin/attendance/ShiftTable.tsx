"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AttendanceBadge } from "./AttendanceBadge";

// Nên export type này ra file types/index.ts hoặc types/hr.types.ts để dùng chung
export type NhanVienChamCong = {
  ma_nguoi_dung: number;
  ho_ten: string;
  gio_vao: string | null;
  gio_ra: string | null;
  trang_thai: string;
  so_phut_tre: number;
  anh_vao: string | null;
  anh_ra: string | null;
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
  const [preview, setPreview] = useState<{ src: string; label: string } | null>(null);

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
              <th className="px-4 py-3 font-medium text-center">Ảnh vào</th>
              <th className="px-4 py-3 font-medium text-center">Giờ ra</th>
              <th className="px-4 py-3 font-medium text-center">Ảnh ra</th>
              <th className="px-4 py-3 font-medium text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dsNhanVien.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-gray-400 italic"
                >
                  Không có dữ liệu nhân sự
                </td>
              </tr>
            ) : (
              dsNhanVien.map((nv, idx) => (
                <tr
                  key={`${nv.ma_nguoi_dung}-${idx}`}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {nv?.ho_ten || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-center">
                    {formatTime(nv?.gio_vao)}
                  </td>
                  <td className="px-2 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => nv.anh_vao && setPreview({ src: nv.anh_vao, label: `${nv.ho_ten} — vào ${formatTime(nv.gio_vao)}` })}
                      disabled={!nv.anh_vao}
                      className={`w-9 h-9 rounded-md overflow-hidden border mx-auto block transition ${nv.anh_vao ? "border-gray-200 hover:ring-2 hover:ring-emerald-300 cursor-pointer" : "border-dashed border-gray-200 cursor-default"}`}
                      title={nv.anh_vao ? "Xem ảnh chấm công vào" : "Chưa có ảnh"}
                    >
                      {nv.anh_vao ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={nv.anh_vao} alt="vào" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-center">
                    {formatTime(nv?.gio_ra)}
                  </td>
                  <td className="px-2 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => nv.anh_ra && setPreview({ src: nv.anh_ra, label: `${nv.ho_ten} — ra ${formatTime(nv.gio_ra)}` })}
                      disabled={!nv.anh_ra}
                      className={`w-9 h-9 rounded-md overflow-hidden border mx-auto block transition ${nv.anh_ra ? "border-gray-200 hover:ring-2 hover:ring-emerald-300 cursor-pointer" : "border-dashed border-gray-200 cursor-default"}`}
                      title={nv.anh_ra ? "Xem ảnh chấm công ra" : "Chưa có ảnh"}
                    >
                      {nv.anh_ra ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={nv.anh_ra} alt="ra" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </button>
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

      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div className="bg-white rounded-xl overflow-hidden max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h4 className="text-sm font-semibold text-gray-800">{preview.label}</h4>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.src} alt={preview.label} className="w-full h-auto" />
          </div>
        </div>
      )}
    </div>
  );
}
