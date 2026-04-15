"use client";

import { useEffect, useState } from "react";
import {
  EmployeeTable,
  NhanVien,
} from "@/components/admin/employees/EmployeeTable";

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<NhanVien[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchEmployees = async (searchQuery = "") => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/nhan-vien?search=${encodeURIComponent(searchQuery)}`,
      );
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setEmployees(result.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhân viên:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Xử lý tìm kiếm debounce cơ bản (gọi API sau khi gõ)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees(search);
  };

  // Tính toán thống kê Header theo Spec
  const totalEmployees = employees.length;
  const workingToday = employees.filter(
    (e) => e.trang_thai === "DANG_LAM_VIEC",
  ).length;
  const onLeave = employees.filter((e) => e.trang_thai === "NGHI_PHEP").length;
  const absent = employees.filter((e) => e.trang_thai === "VANG_MAT").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header & Thống kê */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Danh Sách Nhân Viên
          </h1>
          <p className="text-gray-500">
            Quản lý hồ sơ và trạng thái làm việc hôm nay
          </p>
        </div>

        <div className="flex gap-3">
          <div className="px-4 py-2 bg-gray-50 rounded-lg border text-center">
            <div className="text-sm text-gray-500">Tổng nhân sự</div>
            <div className="font-bold text-gray-800">{totalEmployees}</div>
          </div>
          <div className="px-4 py-2 bg-green-50 border-green-100 border rounded-lg text-center">
            <div className="text-sm text-green-600">Đang làm việc</div>
            <div className="font-bold text-green-700">{workingToday}</div>
          </div>
          <div className="px-4 py-2 bg-purple-50 border-purple-100 border rounded-lg text-center">
            <div className="text-sm text-purple-600">Nghỉ phép</div>
            <div className="font-bold text-purple-700">{onLeave}</div>
          </div>
          <div className="px-4 py-2 bg-red-50 border-red-100 border rounded-lg text-center">
            <div className="text-sm text-red-600">Vắng mặt</div>
            <div className="font-bold text-red-700">{absent}</div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Action */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <form onSubmit={handleSearch} className="flex max-w-md w-full">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên nhân viên..."
            className="w-full px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 border border-l-0 rounded-r-md hover:bg-gray-200"
          >
            Tìm
          </button>
        </form>

        <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition shadow-sm whitespace-nowrap">
          + Thêm nhân viên
        </button>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 animate-pulse">
          Đang tải danh sách...
        </div>
      ) : (
        <EmployeeTable employees={employees} />
      )}
    </div>
  );
}
