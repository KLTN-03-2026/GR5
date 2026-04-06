"use client";

import React from "react";
import { Clock, CheckCircle, Package } from "lucide-react";

export default function IssueHistory({ historyData }: { historyData?: any[] }) {
  // Demo data nếu chưa fetch từ DB
  const data = historyData || [
    {
      id: 1,
      ngay_xuat: "03/04/2026 14:30",
      qr: "QR-LO-123-001",
      san_pham: "Rau muống 1kg",
      phieu: "PX-WINMART-01",
      nguoi_xuat: "Hung Le",
    },
    {
      id: 2,
      ngay_xuat: "03/04/2026 14:31",
      qr: "QR-LO-123-002",
      san_pham: "Rau muống 1kg",
      phieu: "PX-WINMART-01",
      nguoi_xuat: "Hung Le",
    },
    {
      id: 3,
      ngay_xuat: "02/04/2026 09:15",
      qr: "QR-CT-999-004",
      san_pham: "Cải thảo 2kg",
      phieu: "PX-BIGH-05",
      nguoi_xuat: "Admin",
    },
  ];

  return (
    <div className="bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Clock className="text-[#378ADD]" /> Lịch sử xuất kho
          </h2>
          <p className="text-sm text-[#888780] mt-1">
            Truy vết chi tiết từng thùng hàng đã rời khỏi kho
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            className="border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#1D9E75]"
          />
          <button className="px-4 py-2 bg-gray-100 text-[#2C2C2A] rounded-lg font-medium hover:bg-gray-200 text-sm">
            Xuất Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 text-[#888780] font-medium border-b border-gray-200">
              <th className="p-3 rounded-tl-lg">Thời gian xuất</th>
              <th className="p-3">Mã phiếu (Đơn hàng)</th>
              <th className="p-3">Sản phẩm</th>
              <th className="p-3">Mã QR truy vết</th>
              <th className="p-3 text-right rounded-tr-lg">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 text-[#2C2C2A] font-medium">
                  {row.ngay_xuat}
                </td>
                <td className="p-3 text-[#378ADD] font-medium hover:underline cursor-pointer">
                  {row.phieu}
                </td>
                <td className="p-3 flex items-center gap-2">
                  <Package size={14} className="text-gray-400" /> {row.san_pham}
                </td>
                <td className="p-3 font-mono font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block mt-2">
                  {row.qr}
                </td>
                <td className="p-3 text-right text-[#1D9E75] font-medium">
                  <span className="flex items-center justify-end gap-1">
                    <CheckCircle size={14} /> Đã rời kho
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
