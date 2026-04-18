"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";

// Mock data (sẽ thay bằng API call thực sau)
const mockOrders = [
  { id: "DH1001", customer: "Trần Đại Nghĩa", products: "Dâu tây x2, Cải Kale x1...", total: 345000, status: "Chờ xác nhận", time: "10 phút trước" },
  { id: "DH1002", customer: "Lê Thị Lan", products: "Sầu riêng x1", total: 450000, status: "Chờ xác nhận", time: "25 phút trước" },
  { id: "DH1003", customer: "Nguyễn Văn A", products: "Rau muống x5", total: 100000, status: "Đang xử lý", time: "1 giờ trước" },
];

const TABS = [
  { id: "CHO_XAC_NHAN", label: "Chờ xác nhận", count: 2, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
  { id: "DANG_XU_LY", label: "Đang xử lý khoản", count: 1, icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "DANG_GIAO", label: "Đang giao", count: 0, icon: Truck, color: "text-purple-500", bg: "bg-purple-50" },
  { id: "HOAN_THANH", label: "Hoàn thành", count: 0, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
  { id: "DA_HUY", label: "Đã hủy", count: 0, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
];

export default function StaffOrdersPage() {
  const [activeTab, setActiveTab] = useState("CHO_XAC_NHAN");

  const filteredOrders = mockOrders.filter(o => {
    if (activeTab === "CHO_XAC_NHAN" && o.status === "Chờ xác nhận") return true;
    if (activeTab === "DANG_XU_LY" && o.status === "Đang xử lý") return true;
    return false;
  });

  return (
    <div className="space-y-6">
      {/* Nv Navigation Tabs */}
      <div className="flex space-x-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} className={isActive ? "text-white" : tab.color} />
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bảng Đơn Hàng */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Mã Đơn</th>
                <th className="px-6 py-4">Khách Hàng</th>
                <th className="px-6 py-4">Sản Phẩm (Tóm tắt)</th>
                <th className="px-6 py-4">Tổng Tiền</th>
                <th className="px-6 py-4">Thời Gian</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 font-medium">{order.customer}</td>
                    <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]">{order.products}</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">{order.total.toLocaleString()}đ</td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-1.5 object-contain">
                        <Clock size={14} className="text-amber-500" />
                        {order.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/staff/orders/${order.id}`}
                        className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                      >
                        <Eye size={16} /> Xử lý
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <CheckCircle2 size={40} className="mx-auto mb-3 text-gray-300" />
                    Không có đơn hàng nào trong trạng thái này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
