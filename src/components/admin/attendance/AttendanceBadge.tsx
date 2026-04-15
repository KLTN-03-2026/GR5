"use client";

interface AttendanceBadgeProps {
  trangThai: string;
  phutTre?: number;
}

export function AttendanceBadge({
  trangThai,
  phutTre = 0,
}: AttendanceBadgeProps) {
  switch (trangThai) {
    case "DUNG_GIO":
      return (
        <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
          ✓ Đúng giờ
        </span>
      );
    case "TRE":
      return (
        <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
          ⚠ Trễ {phutTre}p
        </span>
      );
    case "VANG_MAT":
      return (
        <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
          ✗ Vắng mặt
        </span>
      );
    case "CHUA_DEN_CA":
    default:
      return (
        <span className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
          Chưa vào ca
        </span>
      );
  }
}
