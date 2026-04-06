import React from "react";
import { CheckSquare, Eye } from "lucide-react";

export default function ExpirationWarnings({ warningsData }: any) {
  const getBadgeStyle = (level: string) => {
    switch (level) {
      case "DA_HET_HAN":
        return "bg-red-600 text-white animate-pulse";
      case "CON_1_NGAY":
        return "bg-[#E24B4A] text-white";
      case "CON_2_NGAY":
        return "bg-[#EF9F27] text-white";
      case "CON_3_NGAY":
        return "bg-yellow-400 text-black";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "DA_HET_HAN":
        return "Đã hết hạn!";
      case "CON_1_NGAY":
        return "Còn 1 ngày";
      case "CON_2_NGAY":
        return "Còn 2 ngày";
      case "CON_3_NGAY":
        return "Còn 3 ngày";
      default:
        return level;
    }
  };

  return (
    <div className="bg-[#FFFFFF] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-lg font-bold text-[#2C2C2A]">
          Lô hàng cần xử lý gấp
        </h2>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-[#888780] font-medium border-b border-gray-200 bg-gray-50/30">
            <th className="p-4">Mức độ</th>
            <th className="p-4">Lô hàng</th>
            <th className="p-4">Sản phẩm</th>
            <th className="p-4">Số lượng</th>
            <th className="p-4">Hạn dùng</th>
            <th className="p-4">Vị trí</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {warningsData.map((w: any) => (
            <tr
              key={w.id}
              className={
                w.da_xu_ly
                  ? "opacity-50 bg-gray-50"
                  : "hover:bg-gray-50/50 transition-colors"
              }
            >
              <td className="p-4">
                {w.da_xu_ly ? (
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-gray-200 text-gray-500">
                    ĐÃ XỬ LÝ
                  </span>
                ) : (
                  <span
                    className={`px-2.5 py-1 text-[11px] font-bold rounded shadow-sm ${getBadgeStyle(w.muc_do || w.loai_canh_bao)}`}
                  >
                    {String(
                      getLevelLabel(w.muc_do || w.loai_canh_bao) || "KHÔNG RÕ",
                    ).toUpperCase()}
                  </span>
                )}
              </td>
              <td className="p-4 font-mono font-bold text-[#2C2C2A]">
                {w.ma_lo_hang}
              </td>
              <td className="p-4 font-medium text-[#2C2C2A]">{w.product}</td>
              <td className="p-4">{w.qty} thùng</td>
              <td className="p-4 font-bold text-[#E24B4A]">{w.han_su_dung}</td>
              <td className="p-4 text-gray-600">{w.viTri}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
