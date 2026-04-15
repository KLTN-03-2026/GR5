'use client'

import React, { useState, useEffect, use as reactUse } from 'react';
import { FileText, User, ShoppingBag, Check, Truck, Package, MapPin, Phone, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // FIX: Dùng reactUse (hoặc use) để mở gói params
  const { id } = reactUse(params); 

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/store/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrder(data.order);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-20 text-center text-[#007832] font-bold">Đang tải...</div>;
  if (!order) return <div className="p-20 text-center text-red-500 font-bold">Lỗi: Không thấy đơn hàng!</div>;

  // Tính lại tiền hàng tạm tính
  const subTotal = order.chi_tiet_don_hang.reduce((sum: number, item: any) => 
    sum + (Number(item.don_gia) * item.so_luong), 0
  );

  return (
   <div className="min-h-screen bg-[#F8FAF7] p-4 md:p-8 pt-[100px] md:pt-[120px] pb-1">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b pb-6">
          <div>
            <h1 className="text-4xl font-black text-[#007832] tracking-tighter">ĐƠN HÀNG #{order.id}</h1>
            <p className="text-gray-400 mt-1 italic">Ngày đặt: {new Date(order.ngay_tao).toLocaleString('vi-VN')}</p>
          </div>
          <div className="text-right">
            <span className="px-6 py-2 bg-[#007832] text-white rounded-full font-bold text-sm uppercase">
              {order.trang_thai.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: Thông tin khách & Sản phẩm */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-emerald-50">
              <h3 className="text-xl font-bold mb-6 text-[#007832] flex items-center gap-2"><MapPin size={20}/> Địa chỉ nhận hàng</h3>
              <div className="space-y-1">
                <p className="font-bold text-lg">{order.nguoi_dung?.ho_so_nguoi_dung?.ho_ten}</p>
                <p className="text-gray-500">{order.nguoi_dung?.ho_so_nguoi_dung?.so_dien_thoai}</p>
                <p className="text-gray-600 italic mt-2">{order.nguoi_dung?.dia_chi_nguoi_dung[0]?.chi_tiet_dia_chi}</p>
              </div>
            </section>

            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-emerald-50">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><ShoppingBag size={20}/> Chi tiết sản phẩm</h3>
              <div className="space-y-4">
                {order.chi_tiet_don_hang.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-emerald-50/30 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#007832] text-white rounded-xl flex items-center justify-center font-bold">{item.so_luong}x</div>
                      <div>
                        <p className="font-bold text-[#007832]">{item.bien_the_san_pham.ten_bien_the}</p>
                        <p className="text-xs text-gray-400">Đơn giá: {Number(item.don_gia).toLocaleString()}đ</p>
                      </div>
                    </div>
                    <p className="font-black">{(item.so_luong * Number(item.don_gia)).toLocaleString()}đ</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Cột phải: Thanh toán */}
          <div className="space-y-6">
            <section className="bg-white rounded-[2rem] p-8 shadow-lg border-2 border-[#007832]/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#007832]/5 rounded-bl-full -mr-8 -mt-8" />
              <h3 className="text-lg font-bold mb-6 text-[#007832] uppercase tracking-widest">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-4 text-sm border-b pb-6">
                <div className="flex justify-between"><span>Tiền hàng</span><span className="font-bold">{subTotal.toLocaleString()}đ</span></div>
                <div className="flex justify-between"><span>Phí vận chuyển</span><span className="font-bold">{Number(order.phi_van_chuyen).toLocaleString()}đ</span></div>
                {order.ma_giam_gia && (
                  <div className="flex justify-between text-red-500 font-bold">
                    <span>Giảm giá ({order.ma_giam_gia.ma_code})</span>
                    <span>-{Number(order.ma_giam_gia.gia_tri_giam).toLocaleString()}đ</span>
                  </div>
                )}
              </div>

              <div className="pt-6 flex justify-between items-center">
                <span className="text-lg font-bold text-[#007832]">Tổng cộng</span>
                <span className="text-3xl font-black text-[#007832]">{Number(order.tong_tien).toLocaleString()}đ</span>
              </div>
            </section>

            <button className="w-full py-4 bg-white border-2 border-[#007832] text-[#007832] font-black rounded-2xl hover:bg-[#007832] hover:text-white transition-all flex items-center justify-center gap-2">
              <FileText size={20}/> TẢI HÓA ĐƠN PDF
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}