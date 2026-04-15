'use client'

import React, { useState, useEffect, use as reactUse } from 'react';
import { FileText, Check, Truck, Package, User, ShoppingBasket, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function OrderDetailsClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = reactUse(params); // Lấy ID từ URL
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Lấy dữ liệu thật từ Database
  useEffect(() => {
    fetch(`/api/store/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrder(data.order);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-20 text-center text-[#007832] font-bold">Đang tải hành trình đơn hàng...</div>;
  if (!order) return <div className="p-20 text-center text-red-500 font-bold">Lỗi: Không tìm thấy thông tin đơn hàng!</div>;

  // Tính toán tiền hàng
  const subTotal = order.chi_tiet_don_hang.reduce((sum: number, item: any) => 
    sum + (Number(item.don_gia) * item.so_luong), 0
  );

  // Cấu hình các bước cho Stepper (Động theo trạng thái DB)
  const steps = [
    { label: 'Đã đặt', icon: Check, status: 'CHO_XAC_NHAN' },
    { label: 'Đã thanh toán', icon: Check, status: 'DA_THANH_TOAN' },
    { label: 'Đang giao', icon: Truck, status: 'DANG_GIAO_HANG' },
    { label: 'Hoàn tất', icon: Package, status: 'DA_GIAO' }
  ];
  const currentStepIdx = steps.findIndex(s => s.status === order.trang_thai);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 pt-[120px] md:pt-[140px]">
      {/* Nút quay lại & Breadcrumbs */}
      <nav className="flex items-center justify-between mb-8">
        <Link href="/store/orders" className="flex items-center gap-2 text-gray-500 hover:text-[#007832] font-bold transition-all">
          <ArrowLeft size={20} /> Quay lại danh sách
        </Link>
        <span className="text-xs font-black text-gray-300 uppercase tracking-widest">Mã đơn: #{order.id}</span>
      </nav>

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-950 tracking-tight">Chi tiết Đơn hàng</h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <Calendar size={18} /> Đã đặt ngày {new Date(order.ngay_tao).toLocaleString('vi-VN')}
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 bg-[#007832] text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-900/10"
        >
          <FileText size={20} /> Tải hóa đơn PDF
        </motion.button>
      </header>

      {/* Status Stepper (Phong cách Material Design 3) */}
      <div className="bg-white rounded-[2.5rem] p-10 mb-10 border border-emerald-50 shadow-sm">
        <div className="relative flex items-center justify-between max-w-4xl mx-auto">
          {/* Đường line nền */}
          <div className="absolute w-full h-1 bg-gray-100"></div>
          {/* Đường line xanh chạy theo trạng thái */}
          <div 
            className="absolute h-1 bg-[#007832] transition-all duration-700" 
            style={{ width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isActive = idx === currentStepIdx;
            return (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${
                  isCompleted ? 'bg-[#007832] border-[#007832] text-white' : 'bg-white border-gray-100 text-gray-300'
                } ${isActive ? 'ring-4 ring-emerald-50 shadow-lg scale-110' : ''}`}>
                  <step.icon size={20} className={isActive ? 'animate-pulse' : ''} />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-tighter ${isCompleted ? 'text-[#007832]' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột trái: Thông tin nhận hàng & Sản phẩm */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Thông tin khách hàng */}
          <section className="bg-white rounded-[2rem] p-8 border border-emerald-50 shadow-sm">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
              <User size={24} className="text-[#007832]" />
              <h3 className="text-xl font-black text-gray-900">Thông tin nhận hàng</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Người nhận</label>
                <p className="text-lg font-bold text-gray-800">{order.nguoi_dung?.ho_so_nguoi_dung?.ho_ten}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Số điện thoại</label>
                <p className="text-lg font-bold text-gray-800">{order.nguoi_dung?.ho_so_nguoi_dung?.so_dien_thoai}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Địa chỉ nhận hàng</label>
                <p className="text-lg font-bold text-gray-800 leading-relaxed">{order.nguoi_dung?.dia_chi_nguoi_dung[0]?.chi_tiet_dia_chi}</p>
              </div>
            </div>
          </section>

          {/* Danh sách sản phẩm */}
          <section className="bg-white rounded-[2rem] p-8 border border-emerald-50 shadow-sm">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
              <ShoppingBasket size={24} className="text-[#007832]" />
              <h3 className="text-xl font-black text-gray-900">Món hàng đã chọn</h3>
            </div>
            <div className="space-y-4">
              {order.chi_tiet_don_hang.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-[1.5rem] border border-gray-50 group hover:bg-emerald-50/30 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-[#007832] text-white flex items-center justify-center rounded-2xl font-black shadow-lg shadow-emerald-900/10">
                      {item.so_luong}x
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{item.bien_the_san_pham.ten_bien_the}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Đơn giá: {Number(item.don_gia).toLocaleString()}đ</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl text-[#007832]">{(item.so_luong * Number(item.don_gia)).toLocaleString()}đ</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Cột phải: Thanh toán & Lịch sử */}
        <div className="space-y-8">
          
          {/* Card Tổng tiền */}
          <section className="bg-[#007832] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[5rem] -mr-8 -mt-8"></div>
            <h3 className="text-xl font-bold mb-8 relative z-10">Tóm tắt thanh toán</h3>
            <div className="space-y-4 relative z-10 text-sm font-medium">
              <div className="flex justify-between opacity-80"><span>Tiền hàng</span><span>{subTotal.toLocaleString()}đ</span></div>
              <div className="flex justify-between opacity-80"><span>Phí vận chuyển</span><span>{Number(order.phi_van_chuyen).toLocaleString()}đ</span></div>
              {order.ma_giam_gia && (
                <div className="flex justify-between text-emerald-200 bg-white/10 p-3 rounded-xl">
                  <span>Giảm giá ({order.ma_giam_gia.ma_code})</span>
                  <span>-{Number(order.ma_giam_gia.gia_tri_giam).toLocaleString()}đ</span>
                </div>
              )}
              <div className="pt-6 mt-6 border-t border-white/20 flex justify-between items-center">
                <span className="text-lg font-bold">Tổng cộng</span>
                <span className="text-4xl font-black tracking-tighter">{Number(order.tong_tien).toLocaleString()}đ</span>
              </div>
            </div>
          </section>

          {/* Timeline lịch sử vận chuyển */}
          <section className="bg-white rounded-[2rem] p-8 border border-emerald-50 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-widest">Hành trình đơn</h3>
            <div className="relative space-y-10 pl-6 border-l-2 border-emerald-100 ml-2">
              {/* Bước cuối (Trạng thái hiện tại) */}
              <div className="relative">
                <div className="absolute -left-[33px] top-1 w-5 h-5 bg-[#007832] rounded-full border-4 border-white ring-4 ring-emerald-50"></div>
                <p className="font-black text-gray-950 text-base">Trạng thái: {order.trang_thai.replace(/_/g, ' ')}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-1">Cập nhật: {new Date(order.ngay_cap_nhat).toLocaleString('vi-VN')}</p>
                <p className="mt-2 text-xs text-gray-500 italic leading-relaxed">Hệ thống Verdant Harvest đang xử lý đơn hàng của bạn.</p>
              </div>
              
              {/* Bước đầu (Lúc đặt hàng) */}
              <div className="relative opacity-50">
                <div className="absolute -left-[31px] top-1 w-4 h-4 bg-gray-300 rounded-full border-4 border-white"></div>
                <p className="font-bold text-gray-600">Đơn hàng được khởi tạo</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(order.ngay_tao).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}