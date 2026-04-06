"use client";

import React, { useState } from "react";
import {
  Package,
  Calendar,
  MapPin,
  CheckCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";

export default function GoodsReceipt({ formOptions }: { formOptions: any }) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [qrCount, setQrCount] = useState(0);

  // Khởi tạo state cho form
  const [formData, setFormData] = useState({
    ma_ncc: "",
    ma_bien_the: "",
    so_luong_thung: "",
    ngay_thu_hoach: "",
    ngay_nhap_kho: new Date().toISOString().split("T")[0], // Mặc định hôm nay
    han_su_dung: "",
    vi_tri: { khu: "", day: "", ke: "", tang: "" },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (["khu", "day", "ke", "tang"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        vi_tri: { ...prev.vi_tri, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      // Ép kiểu dữ liệu trước khi gửi
      const payload = {
        ...formData,
        ma_ncc: parseInt(formData.ma_ncc),
        ma_bien_the: parseInt(formData.ma_bien_the),
        so_luong_thung: parseInt(formData.so_luong_thung),
      };

      const response = await fetch("/api/admin/warehouse/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi tạo phiếu nhập");
      }

      // Xử lý thành công
      setStatus("success");
      setMessage(`Đã nhập hàng trực tiếp vào kho!`);
      setQrCount(data.data.qrCodes?.length || 0);

      // Reset form nhưng giữ lại một số thông tin tiện cho việc nhập tiếp
      setFormData((prev) => ({
        ...prev,
        so_luong_thung: "",
        vi_tri: { khu: "", day: "", ke: "", tang: "" },
      }));
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  return (
    <div className="bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-300">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-[#2C2C2A] flex items-center gap-2">
          <FileText className="text-[#1D9E75]" /> Tạo Phiếu Nhập Kho (Lô hàng
          mới)
        </h2>
        <p className="text-sm text-[#888780] mt-1">
          Hệ thống sẽ tạo phiếu nháp chờ quản lý duyệt trước khi sinh mã QR.
        </p>
      </div>

      {status === "success" && (
        <div className="mb-6 p-4 bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-lg flex items-start gap-3 text-[#1D9E75]">
          <CheckCircle className="mt-0.5 shrink-0" size={20} />
          <div>
            <h3 className="font-bold">Nhập kho thành công!</h3>
            <p className="text-sm mt-1 text-gray-600">
              Hệ thống đã tự động duyệt và sinh ra <strong>{qrCount}</strong> mã
              QR. Hàng đã được cộng thẳng vào bảng Tồn Kho và Sơ đồ sức chứa.
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="mb-6 p-4 bg-[#E24B4A]/10 border border-[#E24B4A]/20 rounded-lg flex items-start gap-3 text-[#E24B4A]">
          <AlertTriangle className="mt-0.5 shrink-0" size={20} />
          <div>
            <h3 className="font-bold">Thất bại!</h3>
            <p className="text-sm mt-1">{message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Khối 1: Thông tin sản phẩm */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2C2C2A] flex items-center gap-1.5">
              <Package size={16} /> Nhà cung cấp
            </label>
            <select
              name="ma_ncc"
              value={formData.ma_ncc}
              onChange={handleInputChange}
              required
              className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#1D9E75] bg-gray-50 text-sm"
            >
              <option value="">-- Chọn Nhà cung cấp --</option>
              {formOptions?.ncc?.map((n: any) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2C2C2A] flex items-center gap-1.5">
              <Package size={16} /> Sản phẩm
            </label>
            <select
              name="ma_bien_the"
              value={formData.ma_bien_the}
              onChange={handleInputChange}
              required
              className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#1D9E75] bg-gray-50 text-sm"
            >
              <option value="">-- Chọn Sản phẩm --</option>
              {formOptions?.sp?.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2C2C2A]">
              Số lượng (Thùng/Kiện)
            </label>
            <input
              type="number"
              min="1"
              name="so_luong_thung"
              value={formData.so_luong_thung}
              onChange={handleInputChange}
              required
              className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#1D9E75] bg-gray-50 text-sm"
              placeholder="VD: 50"
            />
          </div>
        </div>

        {/* Khối 2: Ngày tháng */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2C2C2A] flex items-center gap-1.5">
              <Calendar size={16} /> Ngày thu hoạch
            </label>
            <input
              type="date"
              name="ngay_thu_hoach"
              value={formData.ngay_thu_hoach}
              onChange={handleInputChange}
              required
              className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#1D9E75] bg-gray-50 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2C2C2A] flex items-center gap-1.5">
              <Calendar size={16} /> Ngày nhập kho
            </label>
            <input
              type="date"
              name="ngay_nhap_kho"
              value={formData.ngay_nhap_kho}
              onChange={handleInputChange}
              required
              className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#1D9E75] bg-gray-50 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2C2C2A] flex items-center gap-1.5">
              <Calendar size={16} /> Hạn sử dụng
            </label>
            <input
              type="date"
              name="han_su_dung"
              value={formData.han_su_dung}
              onChange={handleInputChange}
              required
              className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#1D9E75] bg-gray-50 text-sm"
            />
          </div>
        </div>

        {/* Khối 3: Vị trí lưu kho dự kiến */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h3 className="text-sm font-bold text-[#2C2C2A] flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-[#378ADD]" /> Vị trí cất trữ dự
            kiến
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Khu vực
              </label>
              <input
                type="text"
                name="khu"
                value={formData.vi_tri.khu}
                onChange={handleInputChange}
                placeholder="Khu A"
                className="w-full p-2 border border-gray-200 rounded outline-none focus:border-[#1D9E75] text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Dãy
              </label>
              <input
                type="text"
                name="day"
                value={formData.vi_tri.day}
                onChange={handleInputChange}
                placeholder="D1"
                className="w-full p-2 border border-gray-200 rounded outline-none focus:border-[#1D9E75] text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Kệ
              </label>
              <input
                type="text"
                name="ke"
                value={formData.vi_tri.ke}
                onChange={handleInputChange}
                placeholder="K2"
                className="w-full p-2 border border-gray-200 rounded outline-none focus:border-[#1D9E75] text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Tầng
              </label>
              <input
                type="text"
                name="tang"
                value={formData.vi_tri.tang}
                onChange={handleInputChange}
                placeholder="T1"
                className="w-full p-2 border border-gray-200 rounded outline-none focus:border-[#1D9E75] text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-[#1D9E75] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#15805e] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {status === "loading" ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                Đang xử lý...
              </>
            ) : (
              "Tạo Phiếu Nhập Kho"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
