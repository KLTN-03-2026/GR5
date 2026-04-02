"use client";

import React, { useState } from "react";
import { ScanBarcode, CheckCircle, Printer, Download } from "lucide-react";
import { FormInput } from "./WarehouseUI";

export default function GoodsReceipt() {
  const [isCreated, setIsCreated] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-5">
          Tạo phiếu nhập & Sinh mã QR
        </h2>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            setIsCreated(true);
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Nhà cung cấp"
              type="select"
              options={["Nông trại Đà Lạt", "HTX Rau Sạch"]}
            />
            <FormInput
              label="Sản phẩm (Biến thể)"
              type="select"
              options={["Xoài cát Hoà Lộc - Loại 1", "Rau muống - 1kg"]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Ngày thu hoạch" type="date" />
            <FormInput
              label="Hạn sử dụng (Phải sau ngày thu hoạch)"
              type="date"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#888780] mb-1.5">
              Vị trí lưu kho (Kho → Khu → Dãy → Kệ)
            </label>
            <div className="grid grid-cols-4 gap-2">
              <select className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#1D9E75]">
                <option>Kho Tổng</option>
              </select>
              <select className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#1D9E75]">
                <option>Khu A</option>
              </select>
              <select className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#1D9E75]">
                <option>Dãy 1</option>
              </select>
              <select className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#1D9E75]">
                <option>Kệ 2</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Số lượng thùng (Sẽ sinh N mã QR)"
              type="number"
              defaultValue="15"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#888780] mb-1.5">
              Ghi chú
            </label>
            <textarea
              rows={2}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#1D9E75]"
              placeholder="Nhập ghi chú..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[#1D9E75] hover:bg-teal-700 text-white font-medium rounded-lg transition-colors mt-2"
          >
            Tạo phiếu nhập
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <h2 className="text-lg font-semibold mb-5">
          Danh sách mã QR (Preview)
        </h2>
        {!isCreated ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <ScanBarcode className="text-gray-300 w-16 h-16 mb-3" />
            <p className="text-sm text-[#888780]">
              Nhập số lượng thùng để hệ thống tính toán mã QR.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="p-3 mb-4 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg flex items-center gap-2 text-sm font-medium">
              <CheckCircle size={16} className="text-[#1D9E75]" /> Đã tạo 15
              thùng vào Khu A - Dãy 1 - Kệ 2
            </div>
            <div className="grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-1 max-h-[400px]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-gray-200 p-3 rounded-lg flex gap-3 items-center bg-gray-50"
                >
                  <div
                    className="w-12 h-12 bg-gray-800 rounded-sm opacity-80"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, transparent, transparent 2px, #fff 2px, #fff 4px)",
                    }}
                  ></div>
                  <div>
                    <p className="text-xs font-bold font-mono">QR-00{42 + i}</p>
                    <p className="text-[10px] text-[#888780] mt-1">
                      HSD: 25/04/26
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-4 flex gap-2">
              <button className="flex-1 flex justify-center items-center gap-2 bg-[#2C2C2A] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-black">
                <Printer size={16} /> In tất cả (15)
              </button>
              <button className="px-4 py-2.5 border border-gray-200 text-[#2C2C2A] rounded-lg hover:bg-gray-50">
                <Download size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
