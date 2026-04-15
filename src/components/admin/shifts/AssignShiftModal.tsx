"use client";

import { useState, useEffect } from "react";

interface AssignShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate: Date | null;
  selectedShift: { id: number; name: string } | null;
}

type NhanVienMin = { id: number; ho_ten: string; chuc_vu: string };

export function AssignShiftModal({
  isOpen,
  onClose,
  onSuccess,
  selectedDate,
  selectedShift,
}: AssignShiftModalProps) {
  const [employees, setEmployees] = useState<NhanVienMin[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lấy danh sách nhân viên khi mở Modal
  useEffect(() => {
    if (isOpen) {
      fetch("/api/nhan-vien")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setEmployees(data.data);
        })
        .catch(() => setError("Không thể tải danh sách nhân viên"));
    } else {
      // Reset state khi đóng
      setSelectedIds([]);
      setError("");
    }
  }, [isOpen]);

  const handleToggleEmployee = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      setError("Vui lòng chọn ít nhất 1 nhân viên");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/phan-ca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          danh_sach_nhan_vien: selectedIds,
          ma_ca_lam: selectedShift?.id,
          // Format date an toàn để gửi lên API (YYYY-MM-DD)
          ngay_lam_viec: selectedDate?.toISOString().split("T")[0],
        }),
      });

      const result = await res.json();
      if (result.success) {
        onSuccess(); // Báo cho Component cha refresh lại lịch
        onClose();
      } else {
        setError(result.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError("Lỗi kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !selectedDate || !selectedShift) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">
            Phân ca: {selectedShift.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Ngày:{" "}
            <span className="font-semibold text-gray-800">
              {selectedDate.toLocaleDateString("vi-VN")}
            </span>
          </p>

          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-100">
              {error}
            </div>
          )}

          <div className="max-h-60 overflow-y-auto border rounded-md divide-y custom-scrollbar">
            {employees.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Đang tải...
              </div>
            ) : (
              employees.map((emp) => (
                <label
                  key={emp.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    checked={selectedIds.includes(emp.id)}
                    onChange={() => handleToggleEmployee(emp.id)}
                  />
                  <div>
                    <div className="font-medium text-gray-800 text-sm">
                      {emp.ho_ten}
                    </div>
                    <div className="text-xs text-gray-500">{emp.chuc_vu}</div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded shadow-sm hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedIds.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang lưu..." : "Lưu phân ca"}
          </button>
        </div>
      </div>
    </div>
  );
}
