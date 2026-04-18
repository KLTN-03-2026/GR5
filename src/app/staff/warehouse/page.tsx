"use client";

import React, { useState } from "react";
import { PackageOpen, AlertTriangle, FileInput, Plus, QrCode } from "lucide-react";

export default function StaffWarehousePage() {
  const [activeTab, setActiveTab] = useState("TON_KHO");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab("TON_KHO")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "TON_KHO" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <PackageOpen size={18} className={activeTab === "TON_KHO" ? "text-white" : "text-blue-500"} />
          Tồn kho tổng
        </button>
        <button
          onClick={() => setActiveTab("NHAP_KHO")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "NHAP_KHO" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FileInput size={18} className={activeTab === "NHAP_KHO" ? "text-white" : "text-green-500"} />
          Phiếu Nhập & In Mã
        </button>
        <button
          onClick={() => setActiveTab("CANH_BAO")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "CANH_BAO" ? "bg-red-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <AlertTriangle size={18} className={activeTab === "CANH_BAO" ? "text-white" : "text-red-500"} />
          Cảnh Báo HSD
          <span className={`ml-1 text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === "CANH_BAO" ? "bg-white/20 text-white" : "bg-red-100 text-red-600"}`}>
            3
          </span>
        </button>
      </div>

      {/* Tab Nội dung */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        
        {/* TỒN KHO */}
        {activeTab === "TON_KHO" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Danh Sách Lô Hàng</h2>
              <input type="text" placeholder="Tra cứu tên sản phẩm, mã lô..." className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50" />
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-4 py-3">Mã Lô</th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Số Lượng CÒN</th>
                  <th className="px-4 py-3">Vị trí (Khu-Ngày-Kệ)</th>
                  <th className="px-4 py-3">HSD (Còn lại)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">LO-RM-001</td>
                  <td className="px-4 py-3">Rau muống thủy canh</td>
                  <td className="px-4 py-3 font-bold text-blue-600">80 bó</td>
                  <td className="px-4 py-3 font-mono text-gray-600">A-D1-K1</td>
                  <td className="px-4 py-3 text-green-600 font-medium">10 ngày</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">LO-DT-002</td>
                  <td className="px-4 py-3">Dâu Tây Đà Lạt</td>
                  <td className="px-4 py-3 font-bold text-amber-600">15 hộp</td>
                  <td className="px-4 py-3 font-mono text-gray-600">B-D2-K1</td>
                  <td className="px-4 py-3 text-red-600 font-medium whitespace-nowrap"><AlertTriangle size={14} className="inline mr-1" /> 2 ngày</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* NHẬP KHO */}
        {activeTab === "NHAP_KHO" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Tạo mới Phiếu Nhập (Draft)</h2>
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-bold rounded-lg transition-colors">
                <Plus size={16} /> Tạo Phiếu Trình Duyệt
              </button>
            </div>
            
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 font-semibold text-gray-700">
                Các phiếu đã duyệt (Cần thao tác)
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-green-200 bg-green-50/30 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm mb-1">PN-005: Nhập 500kg Bắp Cải</h3>
                    <p className="text-xs text-gray-500">Người duyệt: Admin • 10 phút trước</p>
                    <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded">Trạng thái: Đã duyệt (Chờ In Mã)</span>
                  </div>
                  <button className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-bold text-gray-700">
                    <QrCode size={18} className="text-blue-600" />
                    In Mã & Nhập Kệ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CẢNH BÁO */}
        {activeTab === "CANH_BAO" && (
          <div>
             <h2 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-4">
              <AlertTriangle size={24} /> 
              Các lô hàng sắp hỏng / Hết hạn
            </h2>
            <div className="space-y-3">
              {/* Lô 1 - Đỏ đậm */}
              <div className="border border-red-200 bg-red-50 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-red-800">Dâu Tây Đà Lạt (Khay 1kg) • Mã Lô: LO-DT-001</h3>
                  <p className="text-sm text-red-600 mt-1">ĐÃ HẾT HẠN (Quá 1 ngày) • Tồn: 5 Khay</p>
                </div>
                <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md">
                  Đề xuất Tiêu Hủy
                </button>
              </div>

               {/* Lô 2 - Cam */}
               <div className="border border-amber-200 bg-amber-50 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-amber-800">Cải Kale Khủng Long • Mã Lô: LO-KALE-002</h3>
                  <p className="text-sm text-amber-700 mt-1">Còn 2 ngày sử dụng • Tồn: 15 Bó</p>
                </div>
                <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md">
                  Đề xuất Xả Kho (-50%)
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
