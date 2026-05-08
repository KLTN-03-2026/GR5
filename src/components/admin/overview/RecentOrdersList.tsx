import React from "react";

interface OrderProps {
  id: number;
  tong_tien: number;
  nguoi_dung: { ho_so_nguoi_dung: { ho_ten: string | null } | null } | null;
}

export default function RecentOrdersList({ orders }: { orders: OrderProps[] }) {
  const formatVND = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <div className="space-y-3">
      {orders.map((order, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
              #{order.id}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {order.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || "Khách vãng lai"}
              </p>
              <p className="text-xs text-gray-500">
                {formatVND(order.tong_tien)}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-medium bg-yellow-50 text-yellow-700 rounded-md border border-yellow-100">
            Chờ xác nhận
          </span>
        </div>
      ))}
    </div>
  );
}
