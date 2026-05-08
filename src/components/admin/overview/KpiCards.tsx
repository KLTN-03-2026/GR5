import React from "react";
import { Banknote, ShoppingBag, Users, AlertCircle } from "lucide-react";

interface KpiProps {
  revenue: number;
  orders: number;
  customers: number;
}

export default function KpiCards({ revenue, orders, customers }: KpiProps) {
  const formatVND = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <>
      {/* Card 1: Doanh thu */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-gray-500">Doanh thu hôm nay</p>
          <div className="p-2 rounded-lg bg-green-100 text-green-600">
            <Banknote size={20} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatVND(revenue)}
          </h3>
          <p className="text-xs text-green-600 font-medium mt-1">
            +5.2%{" "}
            <span className="text-gray-400 font-normal">so với hôm qua</span>
          </p>
        </div>
      </div>

      {/* Card 2: Đơn hàng */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-gray-500">Đơn hàng mới</p>
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
            <ShoppingBag size={20} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{orders}</h3>
          <p className="text-xs text-blue-600 font-medium mt-1">
            +3 đơn{" "}
            <span className="text-gray-400 font-normal">so với hôm qua</span>
          </p>
        </div>
      </div>

      {/* Card 3: Khách hàng */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-gray-500">Khách hàng mới</p>
          <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
            <Users size={20} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{customers}</h3>
          <p className="text-xs text-purple-600 font-medium mt-1">
            +2{" "}
            <span className="text-gray-400 font-normal">trong tháng này</span>
          </p>
        </div>
      </div>

      {/* Card 4: Cảnh báo */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-gray-500">Sản phẩm hết hàng</p>
          <div className="p-2 rounded-lg bg-red-100 text-red-600">
            <AlertCircle size={20} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-red-600">3</h3>
          <span className="inline-block mt-1 px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold rounded">
            CẦN NHẬP THÊM
          </span>
        </div>
      </div>
    </>
  );
}
