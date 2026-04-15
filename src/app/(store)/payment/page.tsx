'use client'

import React, { useState } from 'react';
import { 
  MapPin, CheckCircle2, Banknote, FileText, 
  ArrowRight, ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
// 1. IMPORT HOOK GIỎ HÀNG THẬT
import { useCart } from "@/lib/CartContext";

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [selectedAddressId, setSelectedAddressId] = useState(1);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. KÉO DỮ LIỆU THẬT TỪ CONTEXT
  const { cart } = useCart();

  // 3. TÍNH TOÁN LẠI DỰA TRÊN DỮ LIỆU THẬT
  const subTotal = cart.reduce((acc, item) => acc + item.gia_ban * item.so_luong, 0);
  
  // Đồng bộ logic vận chuyển với trang Cart (Freeship > 500k)
  const shippingFee = subTotal >= 500000 ? 0 : 30000; 
  const total = subTotal + shippingFee;

  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);

      // Nếu giỏ hàng trống thì chặn luôn không cho đặt
      if (cart.length === 0) {
        throw new Error("Giỏ hàng của bạn đang trống!");
      }

      // --- BƯỚC 1: TẠO ĐƠN HÀNG ---
      const createOrderRes = await fetch('/api/store/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ma_nguoi_dung: 1, 
          ma_dia_chi: selectedAddressId,
          phuong_thuc_thanh_toan: paymentMethod,
          ghi_chu: note,
          tong_tien: total,
          items: cart // Truyền trực tiếp mảng giỏ hàng thật lên API
        })
      });

      const orderData = await createOrderRes.json();
      if (!orderData.success) throw new Error(orderData.message);

      const orderId = orderData.orderId;

      // --- BƯỚC 2: PHÂN LUỒNG ---
      if (paymentMethod === 'cod') {
        window.location.href = `/payment/check?orderId=${orderId}`;
      } else {
        const paymentRes = await fetch('/api/store/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, type: paymentMethod })
        });

        const paymentData = await paymentRes.json();
        if (paymentData.success && paymentData.paymentUrl) {
          window.location.href = paymentData.paymentUrl;
        } else {
          throw new Error(paymentData.message);
        }
      }

    } catch (error: any) {
      alert("❌ Lỗi: " + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7]">
      <main className="pt-16 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        
        {/* Tiêu đề & Điều hướng nhanh */}
        <div className="mb-8">
            <Link href="/cart" className="flex items-center gap-2 text-gray-400 hover:text-[#007832] font-bold transition-all mb-4 w-fit">
                <ChevronLeft size={20} /> Quay lại giỏ hàng
            </Link>
            <h1 className="text-4xl font-black text-gray-950 tracking-tight">Thanh toán</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- CỘT TRÁI: THÔNG TIN --- */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Địa chỉ giao hàng */}
            <section className="bg-white p-8 rounded-4xl shadow-sm border border-emerald-50">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-emerald-50 rounded-lg text-[#007832]">
                    <MapPin className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-gray-900">Địa chỉ giao hàng</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {[
                    { id: 1, type: "Nhà riêng", address: "01 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM", phone: "090 123 4567" },
                    { id: 2, type: "Văn phòng", address: "Toà nhà Bitexco, Quận 1, TP.HCM", phone: "090 123 4567" }
                ].map((addr) => (
                  <div 
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                        selectedAddressId === addr.id 
                        ? 'border-[#007832] bg-emerald-50/30' 
                        : 'border-gray-50 hover:border-emerald-100 bg-gray-50/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className={`font-black text-lg ${selectedAddressId === addr.id ? 'text-[#007832]' : 'text-gray-800'}`}>
                        {addr.type}
                      </p>
                      {selectedAddressId === addr.id && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 className="w-6 h-6 text-[#007832] fill-white" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{addr.address}</p>
                    <p className="text-xs text-gray-400 mt-2 font-bold">{addr.phone}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Phương thức thanh toán */}
            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-emerald-50">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-emerald-50 rounded-lg text-[#007832]">
                    <Banknote className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-gray-900">Phương thức thanh toán</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { 
                    id: 'cod', 
                    label: 'Tiền mặt (COD)', 
                    sub: 'Thanh toán trực tiếp khi nhận hàng',
                    icon: <Banknote className="w-6 h-6 text-gray-400" /> 
                  },
                  { 
                    id: 'momo', 
                    label: 'Ví MoMo', 
                    sub: 'Thanh toán nhanh qua ứng dụng MoMo',
                    img: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Transparent.png' 
                  },
                  { 
                    id: 'vnpay', 
                    label: 'VNPay', 
                    sub: 'Cổng thanh toán ATM / QR Code / Thẻ quốc tế',
                    img: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png' 
                  },
                ].map((m) => (
                  <label 
                    key={m.id} 
                    className={`flex items-center p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all group ${
                      paymentMethod === m.id 
                        ? 'border-[#007832] bg-emerald-50/30' 
                        : 'border-gray-50 hover:border-emerald-100 bg-gray-50/30'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="payment"
                      checked={paymentMethod === m.id} 
                      onChange={() => setPaymentMethod(m.id)} 
                      className="w-5 h-5 text-[#007832] focus:ring-[#007832] cursor-pointer" 
                    />

                    <div className="ml-5 w-12 h-12 flex-shrink-0 bg-white rounded-xl border border-gray-100 p-1 flex items-center justify-center shadow-sm">
                      {m.img ? (
                        <img 
                          src={m.img} 
                          alt={m.label} 
                          className="w-full h-full object-contain" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        m.icon
                      )}
                    </div>

                    <div className="ml-5 flex-grow">
                      <p className={`font-black text-sm ${paymentMethod === m.id ? 'text-[#007832]' : 'text-gray-700'}`}>
                        {m.label}
                      </p>
                      <p className="text-xs text-gray-400 font-bold mt-0.5">{m.sub}</p>
                    </div>

                    {paymentMethod === m.id && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="w-6 h-6 text-[#007832] fill-white" />
                      </motion.div>
                    )}
                  </label>
                ))}
              </div>
            </section>

            {/* 3. Ghi chú */}
            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-emerald-50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg text-[#007832]">
                    <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-gray-900">Ghi chú cho cửa hàng</h2>
              </div>
              <textarea 
                value={note} 
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-6 rounded-2xl bg-gray-50/50 border-none focus:ring-2 focus:ring-[#007832] outline-none text-gray-700 font-medium transition-all" 
                placeholder="Ví dụ: Giao hàng giờ hành chính..." rows={3} 
              />
            </section>
          </div>

          {/* --- CỘT PHẢI: TÓM TẮT --- */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 border border-emerald-50 sticky top-28">
              <h2 className="text-2xl font-black text-gray-950 mb-8 tracking-tight">Chi tiết đơn hàng</h2>
              
              <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {/* 4. RENDER DỮ LIỆU THẬT Ở ĐÂY */}
                {cart.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm font-medium py-4">Giỏ hàng trống</p>
                ) : (
                    cart.map((item, idx) => (
                    <div key={idx} className="flex space-x-4 group">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm">
                            <img 
                            src={item.anh_chinh} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                            alt={item.ten_san_pham} 
                            referrerPolicy="no-referrer"
                            />
                        </div>
                        <div className="flex-grow">
                        <p className="text-sm font-black text-gray-900 leading-tight line-clamp-1">{item.ten_san_pham}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 line-clamp-1">{item.phan_loai}</p>
                        <div className="flex justify-between items-end mt-1">
                            <span className="text-xs font-bold text-gray-400">SL: {item.so_luong}</span>
                            <span className="font-black text-[#007832]">{(item.gia_ban * item.so_luong).toLocaleString('vi-VN')}đ</span>
                        </div>
                        </div>
                    </div>
                    ))
                )}
              </div>

              {/* 5. TỔNG KẾT (ĐÃ DỌN DẸP CODE BỊ ĐÚP) */}
              <div className="space-y-4 pt-8 border-t border-gray-100">
                <div className="flex justify-between text-gray-400 text-sm font-bold">
                  <span>Tiền hàng tạm tính</span>
                  <span className="text-gray-900">{subTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm font-bold">
                  <span>Phí vận chuyển</span>
                  {shippingFee === 0 ? (
                      <span className="text-emerald-600 italic">Miễn phí</span>
                  ) : (
                      <span className="text-gray-900">{shippingFee.toLocaleString('vi-VN')}đ</span>
                  )}
                </div>
                
                <div className="flex justify-between items-center pt-6 mt-4 border-t border-emerald-50">
                  <span className="text-lg font-black text-gray-950">TỔNG CỘNG</span>
                  <span className="text-3xl font-black text-[#007832] tracking-tighter">
                    {total.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              <motion.button 
                onClick={handlePlaceOrder}
                disabled={isSubmitting || cart.length === 0}
                whileHover={{ scale: cart.length > 0 ? 1.02 : 1 }}
                whileTap={{ scale: cart.length > 0 ? 0.98 : 1 }}
                className={`w-full mt-10 py-5 rounded-[1.5rem] font-black text-white shadow-xl flex items-center justify-center space-x-3 transition-all ${
                    isSubmitting || cart.length === 0
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-[#007832] hover:bg-[#006028] shadow-emerald-900/20'
                }`}
              >
                <span className="tracking-widest uppercase">{isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}</span>
                {!isSubmitting && <ArrowRight className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}