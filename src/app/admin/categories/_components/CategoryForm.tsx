"use client";

import { useState } from "react";

export function CategoryForm() {
  // 1. Tạo state để lưu dữ liệu người dùng gõ vào
  const [tenDanhMuc, setTenDanhMuc] = useState("");
  const [maDanhMucCha, setMaDanhMucCha] = useState("");

  // Dữ liệu giả lập để test Dropdown
  const mockParentCategories = [
    { id: 1, name: "Rau sạch" },
    { id: 2, name: "Trái cây tươi" },
    { id: 3, name: "Nấm & Đồ khô" },
  ];

  // 2. Hàm xử lý khi bấm nút "Lưu thay đổi"
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn trình duyệt tự động load lại trang

    // Bắt lỗi cơ bản bằng tay luôn, khỏi cần Zod lằng nhằng
    if (tenDanhMuc.trim().length < 2) {
      alert("Lỗi: Tên danh mục phải có ít nhất 2 ký tự!");
      return;
    }

    // Gom dữ liệu chuẩn bị gửi cho Database
    const dataToSend = {
      ten_danh_muc: tenDanhMuc,
      ma_danh_muc_cha: maDanhMucCha ? parseInt(maDanhMucCha) : null,
    };

    console.log("Dữ liệu chuẩn bị chui vào DB:", dataToSend);
    alert("Test thành công! Mở F12 (Console) để xem dữ liệu.");
  };

  // 3. Giao diện (Dùng HTML thẻ input, select bình thường + Tailwind)
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Chỉnh sửa danh mục
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ô nhập Tên danh mục */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên danh mục
          </label>
          <input
            type="text"
            value={tenDanhMuc}
            onChange={(e) => setTenDanhMuc(e.target.value)}
            placeholder="VD: Rau củ quả..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>

        {/* Ô Dropdown chọn Danh mục cha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục cha (Để trống nếu là danh mục gốc)
          </label>
          <select
            value={maDanhMucCha}
            onChange={(e) => setMaDanhMucCha(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
          >
            <option value="">-- Không có (Danh mục gốc) --</option>
            {mockParentCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Nút Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-md transition-colors"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
