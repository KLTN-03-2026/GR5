"use client";

import { useEffect, useState } from "react";
import { PayrollTable, LuongNhanVien } from "@/components/admin/payroll/PayrollTable";
import * as XLSX from "xlsx";
import { FileSpreadsheet, DollarSign, Clock, TrendingDown, Users } from "lucide-react";

export default function PayrollPage() {
  const [data, setData] = useState<LuongNhanVien[]>([]);
  const [loading, setLoading] = useState(false);

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

  const exportToExcel = () => {
    if (data.length === 0) { alert("Không có dữ liệu để xuất!"); return; }
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
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `BangLuong_${selectedMonth}`);
    worksheet["!cols"] = [{ wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 20 }];
    XLSX.writeFile(workbook, `Bang_Luong_Thang_${selectedMonth}.xlsx`);
  };

  const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

  const tongQuy = data.reduce((s, nv) => s + nv.thuc_nhan, 0);
  const tongGio = data.reduce((s, nv) => s + nv.tong_gio_thuc_te, 0);
  const tongKhau = data.reduce((s, nv) => s + nv.khau_tru_tre, 0);
  const soNhanVien = data.length;

  const [year, month] = selectedMonth.split("-");
  const monthLabel = `Tháng ${parseInt(month)}/${year}`;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bảng Lương</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tính toán tự động từ dữ liệu chấm công — {monthLabel}</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 shadow-sm">
            <span className="text-xs text-gray-500 font-medium">Tháng:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-sm font-semibold text-gray-800 outline-none bg-transparent"
            />
          </div>
          <button
            onClick={exportToExcel}
            disabled={loading || data.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm text-sm"
          >
            <FileSpreadsheet size={15} />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Nhân viên", value: soNhanVien.toString(), unit: "người", icon: Users, bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
            { label: "Tổng quỹ lương", value: fmt(tongQuy), unit: "₫", icon: DollarSign, bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
            { label: "Tổng giờ công", value: tongGio.toFixed(1), unit: "giờ", icon: Clock, bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-700", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
            { label: "Tổng khấu trừ", value: fmt(tongKhau), unit: "₫", icon: TrendingDown, bg: "bg-red-50", border: "border-red-100", text: "text-red-700", iconBg: "bg-red-100", iconColor: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} ${s.border} border rounded-xl p-4 flex items-center gap-4`}>
              <div className={`${s.iconBg} rounded-xl p-2.5 flex-shrink-0`}>
                <s.icon size={20} className={s.iconColor} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                <p className={`text-lg font-bold ${s.text} truncate`}>
                  {s.value} <span className="text-sm font-medium">{s.unit}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-xl border shadow-sm">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Đang tính toán lương {monthLabel}...</p>
        </div>
      ) : (
        <PayrollTable bangLuong={data} />
      )}

      {!loading && data.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Bảng lương được tính tự động từ dữ liệu chấm công. Liên hệ kế toán để điều chỉnh thủ công.
        </p>
      )}
    </div>
  );
}
