"use client";

import React, { useState, useRef } from "react";
import { ScanBarcode, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function GoodsIssueScan() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScan = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const inputElement = e.currentTarget;
      const scannedQR = inputElement.value.trim();

      if (!scannedQR) return;

      setIsLoading(true);
      setStatus("idle");
      setMessage("");

      try {
        // GỌI API XUẤT KHO THỰC TẾ
        const response = await fetch("/api/admin/warehouse/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrCode: scannedQR }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Lỗi hệ thống khi xuất kho");
        }

        // Quét thành công
        setStatus("success");
        setMessage(data.message || `Đã xuất thùng ${scannedQR} thành công!`);
        inputElement.value = ""; // Xóa ô input an toàn
      } catch (error: any) {
        // Quét thất bại (Lỗi FEFO, mã sai...)
        setStatus("error");
        setMessage(error.message);
        inputElement.value = "";
      } finally {
        setIsLoading(false);
        // Tự động focus lại vào input để thủ kho có thể bóp cò súng quét thùng tiếp theo ngay lập tức
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  return (
    <div className="bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <ScanBarcode size={32} className="text-[#2C2C2A]" />
        </div>
        <h2 className="text-xl font-bold text-[#2C2C2A]">Xuất kho (FEFO)</h2>
        <p className="text-sm text-[#888780] mt-1">
          Sử dụng súng quét mã vạch để quét QR trên thùng hàng
        </p>
      </div>

      <div className="relative mb-8">
        <input
          ref={inputRef}
          type="text"
          placeholder="Nhấp vào đây và bóp cò súng quét mã..."
          onKeyDown={handleScan}
          disabled={isLoading}
          autoFocus
          className="w-full text-center text-lg font-mono p-4 border-2 border-dashed border-gray-300 rounded-xl focus:border-[#378ADD] focus:ring-4 focus:ring-[#378ADD]/10 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-[#378ADD] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Khu vực hiển thị thông báo kết quả */}
      {status !== "idle" && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 border ${
            status === "success"
              ? "bg-[#1D9E75]/10 border-[#1D9E75]/20 text-[#1D9E75]"
              : "bg-[#E24B4A]/10 border-[#E24B4A]/20 text-[#E24B4A] animate-shake"
          }`}
        >
          {status === "success" ? (
            <CheckCircle className="mt-0.5 shrink-0" size={20} />
          ) : (
            <XCircle className="mt-0.5 shrink-0" size={20} />
          )}
          <div>
            <h3 className="font-bold">
              {status === "success" ? "Hợp lệ!" : "Từ chối xuất kho!"}
            </h3>
            <p className="text-sm mt-1">{message}</p>
          </div>
        </div>
      )}

      {status === "idle" && (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-3 text-blue-700">
          <AlertCircle className="mt-0.5 shrink-0" size={20} />
          <div className="text-sm">
            <p className="font-bold mb-1">
              Quy tắc kiểm tra FEFO đang kích hoạt
            </p>
            <p>
              Hệ thống sẽ tự động chặn nếu thùng hàng bạn vừa quét không phải là
              thùng có hạn sử dụng cũ nhất trong kho.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
