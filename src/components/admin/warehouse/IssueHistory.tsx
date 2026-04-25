"use client";

import React, { useState, useEffect } from "react";
import { Clock, ArrowDownToLine, ArrowUpFromLine, Package } from "lucide-react";
import Pagination from "@/components/ui/Pagination";

export default function IssueHistory({
  historyData,
  importHistoryData,
  // Pagination and Tab Props (Optional)
  currentPage,
  totalPages,
  onPageChange,
  activeTab,
  onTabChange,
}: {
  historyData?: any[];
  importHistoryData?: any[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  activeTab?: "import" | "export";
  onTabChange?: (tab: "import" | "export") => void;
}) {
  // Tạo state để làm nút gạt chuyển đổi giữa 2 bảng
  const [subTab, setSubTab] = useState<"import" | "export">(activeTab || "import");

  useEffect(() => {
    if (activeTab) setSubTab(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab: "import" | "export") => {
    setSubTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const exportData = historyData || [];
  const importData = importHistoryData || [];

  return (
    <div className="bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-300">
      {/* Header & Nút gạt Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-100 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#2C2C2A] flex items-center gap-2">
            <Clock className="text-[#1D9E75]" /> Lịch sử Giao dịch
          </h2>
          <p className="text-sm text-[#888780] mt-1">
            Lưu vết các hoạt động nhập/xuất kho.
          </p>
        </div>

        {/* Cụm nút gạt mượt mà */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => handleTabChange("import")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all ${subTab === "import" ? "bg-white text-[#1D9E75] shadow-sm" : "text-gray-500 hover:text-[#2C2C2A]"}`}
          >
            <ArrowDownToLine size={16} /> Nhập Kho
          </button>
          <button
            onClick={() => handleTabChange("export")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all ${subTab === "export" ? "bg-white text-[#378ADD] shadow-sm" : "text-gray-500 hover:text-[#2C2C2A]"}`}
          >
            <ArrowUpFromLine size={16} /> Xuất Kho
          </button>
        </div>
      </div>

      {/* ======================= */}
      {/* BẢNG 1: LỊCH SỬ NHẬP KHO */}
      {/* ======================= */}
      {subTab === "import" && (
        <div className="overflow-x-auto animate-in fade-in duration-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#1D9E75]/10 text-[#1D9E75] font-medium">
                <th className="p-3 rounded-tl-lg">Thời gian</th>
                <th className="p-3">Mã Phiếu</th>
                <th className="p-3">Nhà cung cấp</th>
                <th className="p-3">Sản phẩm chính</th>
                <th className="p-3 text-right">SL (Thùng)</th>
                <th className="p-3 rounded-tr-lg">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {importData.length > 0 ? (
                importData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-500">{item.ngay_nhap}</td>
                    <td className="p-3 font-mono font-bold text-[#2C2C2A]">
                      {item.ma_phieu}
                    </td>
                    <td className="p-3 text-gray-600">{item.ncc}</td>
                    <td className="p-3 font-medium text-[#2C2C2A]">
                      {item.san_pham}
                    </td>
                    <td className="p-3 text-right font-bold text-[#1D9E75]">
                      {item.so_luong}
                    </td>
                      <td className="p-3">
                        {(() => {
                          const s = item.trang_thai || "N/A";
                          const cls: Record<string, string> = {
                            CHO_DUYET:    "bg-amber-50 text-amber-700 border border-amber-200",
                            CHO_KIEM_TRA: "bg-blue-50 text-blue-700 border border-blue-200",
                            DA_DUYET:     "bg-green-50 text-green-700 border border-green-200",
                            HOAN_THANH:   "bg-emerald-50 text-emerald-800 border border-emerald-200",
                            DA_HUY:       "bg-red-50 text-red-700 border border-red-200",
                          };
                          const lbl: Record<string, string> = {
                            CHO_DUYET: "Chờ duyệt", CHO_KIEM_TRA: "Chờ kiểm tra",
                            DA_DUYET: "Đã duyệt", HOAN_THANH: "Hoàn thành", DA_HUY: "Đã hủy",
                          };
                          return (
                            <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${cls[s] || "bg-gray-100 text-gray-600"}`}>
                              {lbl[s] || s}
                            </span>
                          );
                        })()}
                      </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    Không có lịch sử nhập kho
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================= */}
      {/* BẢNG 2: LỊCH SỬ XUẤT KHO */}
      {/* ======================= */}
      {subTab === "export" && (
        <div className="overflow-x-auto animate-in fade-in duration-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#378ADD]/10 text-[#378ADD] font-medium">
                <th className="p-3 rounded-tl-lg">Thời gian quét</th>
                <th className="p-3">Mã QR đã xuất</th>
                <th className="p-3">Sản phẩm</th>
                <th className="p-3">Lý do / Số phiếu</th>
                <th className="p-3 rounded-tr-lg text-right">Người quét</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {exportData.length > 0 ? (
                exportData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-500">{item.ngay_xuat}</td>
                    <td className="p-3 font-mono font-bold text-[#E24B4A]">
                      {item.qr}
                    </td>
                    <td className="p-3 font-medium text-[#2C2C2A]">
                      {item.san_pham}
                    </td>
                    <td className="p-3 text-gray-600">{item.phieu}</td>
                    <td className="p-3 text-right text-gray-600">
                      {item.nguoi_xuat}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    Không có lịch sử xuất kho
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination (nếu component cha truyền props) */}
      {onPageChange && totalPages !== undefined && currentPage !== undefined && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
