"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Package, CheckCircle, XCircle } from "lucide-react";

export default function GoodsIssueScan() {
  const [scanState, setScanState] = useState<"waiting" | "success" | "error">(
    "waiting",
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Tự động focus vào ô quét mã khi component mount hoặc khi trạng thái reset về waiting
  useEffect(() => {
    if (scanState === "waiting") {
      inputRef.current?.focus();
    }
  }, [scanState]);

  // Xử lý sự kiện khi súng quét mã vạch (hoạt động như bàn phím gõ text rồi ấn Enter)
  const handleScan = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const scannedVal = e.currentTarget.value.trim();
      const expectedVal = "QR-RM-001"; // Giả lập hệ thống FEFO chỉ định lấy thùng này

      if (!scannedVal) return;

      try {
        // Gọi API bằng Axios
        const response = await axios.post("/api/admin/warehouse/scan", {
          scannedQR: scannedVal,
          expectedQR: expectedVal,
        });

        if (response.data.success) {
          setScanState("success");
          // Tùy chọn: Thêm thư viện toast ở đây (vd: toast.success(response.data.message))
        }
      } catch (err: any) {
        setScanState("error");
        // Trích xuất thông báo lỗi từ API trả về (Lỗi 400)
        const errorMsg = err.response?.data?.message || "Lỗi kết nối Server";
        alert(errorMsg);
      }

      // Đợi 1.5 giây để hiển thị hiệu ứng, sau đó reset lại trạng thái chờ quét
      setTimeout(() => {
        setScanState("waiting");
      }, 1500);

      // Xóa trắng input để sẵn sàng quét lần tiếp theo
      e.currentTarget.value = "";
    }
  };

  return (
    <div className="bg-[#FFFFFF] rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* VÙNG TRÊN: Thông tin đơn hàng */}
      <div className="p-5 border-b border-gray-100 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Đơn hàng #DH-0087</h2>
            <p className="text-sm text-[#888780] mt-0.5">
              Khách hàng: Siêu thị Winmart
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-[#888780] mb-1.5">
              Đã xác nhận
            </p>
            <div className="flex items-center gap-3">
              <div className="w-40 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#1D9E75] w-1/3 transition-all"></div>
              </div>
              <span className="text-sm font-bold text-[#1D9E75]">1 / 3</span>
            </div>
          </div>
        </div>
      </div>

      {/* VÙNG GIỮA: Chỉ dẫn lấy hàng & Ô quét mã (Trọng tâm màn hình) */}
      <div className="p-8 flex flex-col items-center border-b border-gray-100 relative bg-[#F8FAFC]">
        <div className="w-full max-w-2xl bg-white border-2 border-[#378ADD] rounded-2xl shadow-lg overflow-hidden relative">
          <div className="bg-[#378ADD] text-white p-3 text-center font-medium flex items-center justify-center gap-2">
            <Package size={18} /> Thùng tiếp theo hệ thống chỉ định cần lấy:
          </div>

          <div className="p-6 grid grid-cols-2 gap-4 text-[15px]">
            <div>
              <span className="text-[#888780]">Sản phẩm:</span>{" "}
              <span className="font-bold">Rau muống — 1kg</span>
            </div>
            <div>
              <span className="text-[#888780]">Mã thùng ĐÍCH DANH:</span>{" "}
              <span className="font-bold font-mono text-lg bg-gray-100 px-2 py-0.5 rounded text-[#2C2C2A]">
                QR-RM-001
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[#888780]">Vị trí chính xác:</span>{" "}
              <span className="font-bold text-[#378ADD]">
                Khu A → Dãy 1 → Kệ 1 → Tầng 1
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[#888780]">Hạn dùng:</span>{" "}
              <span className="font-bold text-[#E24B4A] text-lg bg-red-50 px-2 py-0.5 rounded">
                01/04/2026 (FEFO)
              </span>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="relative">
              {/* Ô Input thực hiện việc quét */}
              <input
                ref={inputRef}
                type="text"
                onKeyDown={handleScan}
                placeholder="[ 🔫 Đưa súng quét mã vạch vào đây... ]"
                className={`
                  w-full text-center py-5 text-[20px] rounded-xl border-4 outline-none transition-all shadow-inner
                  ${scanState === "waiting" ? "border-[#378ADD] text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-blue-500/20 animate-pulse" : ""}
                  ${scanState === "success" ? "border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75]" : ""}
                  ${scanState === "error" ? "border-[#E24B4A] bg-[#E24B4A]/10 text-[#E24B4A]" : ""}
                `}
                autoComplete="off"
              />

              {/* Hiệu ứng Thành công */}
              {scanState === "success" && (
                <div className="absolute inset-0 bg-[#1D9E75] rounded-xl flex flex-col items-center justify-center text-white animate-in zoom-in duration-200">
                  <CheckCircle size={36} className="mb-1" />
                  <span className="text-xl font-bold">
                    Xác nhận đúng thùng QR-RM-001!
                  </span>
                </div>
              )}

              {/* Hiệu ứng Lỗi */}
              {scanState === "error" && (
                <div className="absolute inset-0 bg-[#E24B4A] rounded-xl flex flex-col items-center justify-center text-white shake">
                  <XCircle size={36} className="mb-1" />
                  <span className="text-lg font-bold">
                    Sai thùng! Yêu cầu lấy mã QR-RM-001
                  </span>
                </div>
              )}
            </div>
            <p className="text-center text-xs text-[#888780] mt-3">
              (Gõ <strong className="text-gray-700">QR-RM-001</strong> và Enter
              để test Đúng, gõ chữ khác để test Sai)
            </p>
          </div>
        </div>
      </div>

      {/* VÙNG DƯỚI: Danh sách tiến độ */}
      <div className="p-5">
        <h3 className="font-semibold mb-3 text-[#2C2C2A]">
          Danh sách thùng cần xuất (Đích danh QR)
        </h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[#888780] font-medium border-b border-gray-200">
              <th className="pb-2 w-12">STT</th>
              <th className="pb-2">Sản phẩm</th>
              <th className="pb-2">Mã QR Yêu Cầu</th>
              <th className="pb-2">Vị trí chỉ định</th>
              <th className="pb-2 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Thùng đã xuất */}
            <tr className="bg-teal-50/50">
              <td className="py-2.5 text-[#888780]">1</td>
              <td className="py-2.5 font-medium text-[#2C2C2A]">
                Cải thảo 2kg
              </td>
              <td className="py-2.5 font-mono text-[#2C2C2A]">QR-CT-004</td>
              <td className="py-2.5 text-gray-600">
                Khu A - Dãy 1 - Kệ 2 - Tầng 2
              </td>
              <td className="py-2.5 text-right">
                <span className="text-[#1D9E75] font-medium flex items-center justify-end gap-1">
                  <CheckCircle size={14} /> Đã xác nhận
                </span>
              </td>
            </tr>
            {/* Thùng đang yêu cầu lấy (Highlight) */}
            <tr className="bg-blue-50/30 border-l-4 border-l-[#378ADD]">
              <td className="py-2.5 text-[#888780] pl-2">2</td>
              <td className="py-2.5 font-medium text-[#378ADD]">
                Rau muống 1kg
              </td>
              <td className="py-2.5 font-mono text-[#378ADD] font-bold">
                QR-RM-001
              </td>
              <td className="py-2.5 font-medium text-[#378ADD]">
                Khu A - Dãy 1 - Kệ 1 - Tầng 1
              </td>
              <td className="py-2.5 text-right">
                <span className="text-[#378ADD] font-bold animate-pulse">
                  Thùng hiện tại...
                </span>
              </td>
            </tr>
            {/* Thùng chờ quét */}
            <tr>
              <td className="py-2.5 text-[#888780]">3</td>
              <td className="py-2.5 font-medium text-[#2C2C2A]">
                Rau muống 1kg
              </td>
              <td className="py-2.5 font-mono text-gray-500">QR-RM-002</td>
              <td className="py-2.5 text-gray-600">
                Khu A - Dãy 1 - Kệ 1 - Tầng 1
              </td>
              <td className="py-2.5 text-right">
                <span className="text-[#888780] font-medium">Chờ quét</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
