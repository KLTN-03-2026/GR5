'use client'

import React, { useState, useEffect } from 'react';
import { User, Package, Heart, Settings, Leaf, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// --- Sidebar dùng chung ---
const Sidebar = () => (
  <aside className="space-y-4">
    <div className="bg-white rounded-2xl p-4 md:p-6 border border-emerald-50 shadow-sm">
      <nav className="space-y-1">
        {[
          { icon: User, label: 'Hồ sơ cá nhân', active: false, href: '#' },
          { icon: Package, label: 'Quản lý Đơn hàng', active: true, href: '/store/orders' },
          { icon: Heart, label: 'Danh sách yêu thích', active: false, href: '#' },
          { icon: Settings, label: 'Cài đặt', active: false, href: '#' },
        ].map((item) => (
          <Link key={item.label} href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              item.active ? 'bg-[#007832]/10 text-[#007832] shadow-sm font-bold' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  </aside>
);

const OrderCard = ({ order }: { order: any }) => {
  const getStatusStyles = (status: string) => {
    if (status === 'DA_GIAO') return 'bg-emerald-100 text-emerald-800';
    if (status === 'DA_HUY') return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800'; // Đang xử lý / Đang giao
  };

  return (
    <motion.div layout className="bg-white rounded-[2rem] p-6 shadow-sm border border-emerald-50 mb-4 ">
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 border-b pb-4 mb-4 ">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-lg font-black text-[#007832]">#{order.id}</span>
            <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${getStatusStyles(order.trang_thai)}`}>
              {order.trang_thai.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <Calendar size={14} />
            <span>Ngày đặt: {new Date(order.ngay_tao).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
        <div className="text-left md:text-right">
          <span className="text-xs font-bold uppercase text-gray-400 block">Tổng tiền</span>
          <span className="text-xl font-extrabold text-[#007832]">{Number(order.tong_tien).toLocaleString()}đ</span>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {/* ĐƯỜNG DẪN QUAN TRỌNG: Truyền ID vào URL */}
        <Link href={`/orders/${order.id}`}>
          <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">
            Chi tiết
          </button>
        </Link>
        <button className="px-6 py-2 bg-[#007832] text-white rounded-xl font-bold text-sm hover:bg-[#006028] transition-all">
          Mua lại
        </button>
      </div>
    </motion.div>
  );
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/store/orders') // API lấy tất cả đơn của khách
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.orders);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="pt-32 text-center text-[#007832] font-bold">Đang tải...</div>;

  return (
    <div className="bg-[#F8FAF7] min-h-screen pt-28 pb-16 px-4 md:px-8 pt-[120px] md:pt-[140px]">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3"><Sidebar /></div>
        <div className="lg:col-span-9">
          <h1 className="text-4xl font-black text-[#007832] mb-8">Đơn hàng của tôi</h1>
          {orders.map((order: any) => <OrderCard key={order.id} order={order} />)}
        </div>
      </div>
    </div>
  );
}