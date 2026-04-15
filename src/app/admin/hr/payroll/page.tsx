"use client";

import { useEffect, useState } from "react";
import {
  PayrollTable,
  LuongNhanVien,
} from "@/components/admin/payroll/PayrollTable";
import * as XLSX from "xlsx"; // Import thư viện Excel

export default function PayrollPage() {
  const [data, setData] = useState<LuongNhanVien[]>([]);
  const [loading, setLoading] = useState(false);

  // Khởi tạo tháng hiện tại (Format: YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const m = (now.getMonth() + 1).toString().padStart(2, "0");
    return `${now.getFullYear()}-${m}`;
  });

  const fetchLuong = async (thang: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/luong?thang=${thang}`);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setData(result.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Lỗi tính lương:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMonth) fetchLuong(selectedMonth);
  }, [selectedMonth]);

  // LOGIC XUẤT EXCEL (Chuẩn bị data và trigger download)
  const exportToExcel = () => {
    if (data.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    // 1. Format lại tên cột và dữ liệu cho file Excel dễ đọc
    const excelData = data.map((nv, index) => ({
      STT: index + 1,
      "Họ và Tên": nv.ho_ten,
      "Lương / Giờ (VNĐ)": nv.luong_theo_gio,
      "Tổng giờ làm": nv.tong_gio_thuc_te,
      "Lương cơ bản (VNĐ)": nv.luong_co_ban,
      "Phụ cấp ca tối (VNĐ)": nv.phu_cap_ca_toi,
      "Phút đi trễ": nv.tong_phut_tre,
      "Khấu trừ trễ (VNĐ)": nv.khau_tru_tre,
      "THỰC NHẬN (VNĐ)": nv.thuc_nhan,
    }));

    // 2. Tạo WorkBook và WorkSheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `BangLuong_${selectedMonth}`,
    );

    // 3. Tự động set độ rộng cột cho đẹp
    const wscols = [
      { wch: 5 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
    ];
    worksheet["!cols"] = wscols;

    // 4. Trigger tải file về máy
    XLSX.writeFile(workbook, `Bang_Luong_Thang_${selectedMonth}.xlsx`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Công cụ lọc */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bảng Lương Tháng</h1>
          <p className="text-gray-500">
            Tính toán tự động từ dữ liệu chấm công
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border rounded-md text-gray-700 outline-none focus:border-blue-500"
          />
          <button
            onClick={exportToExcel}
            disabled={loading || data.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Hiển thị Bảng Lương */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 animate-pulse">
          Đang tính toán lương...
        </div>
      ) : (
        <PayrollTable bangLuong={data} />
      )}
    </div>
  );
}
