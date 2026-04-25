'use client'

import React, { useState, useEffect } from 'react';
import { 
  MapPin, CheckCircle2, Banknote, FileText, 
  ArrowRight, ChevronLeft, Building2, Copy, Check, QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCart } from "@/lib/CartContext";
import { useSession } from 'next-auth/react';

// ============================================================
// THÔNG TIN NGÂN HÀNG (THAY ĐỔI TẠI ĐÂY)
// ============================================================
const BANK_INFO = {
  bankCode: "MB",            // Mã ngân hàng theo VietQR
  bankName: "MB Bank",
  accountNumber: "0935462720",
  accountName: "LE VIET QUOC HUNG",
};

// ============================================================
// COMPONENT QR BANKING
// ============================================================
function BankTransferPanel({ total, orderId }: { total: number; orderId?: number | null }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const orderNote = orderId ? `DH${orderId}` : "Vui long dat hang truoc";
  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankCode}-${BANK_INFO.accountNumber}-compact2.png?amount=${Math.round(total)}&addInfo=${encodeURIComponent(orderNote)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4 overflow-hidden"
    >
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-5">
        <div className="flex gap-5 items-start">
          {/* QR Code */}
          <div className="flex-shrink-0 bg-white rounded-xl p-2 shadow-sm border border-blue-100">
            <img
              src={qrUrl}
              alt="QR Chuyển khoản"
              className="w-28 h-28 object-contain"
              onError={(e) => { 
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='112' height='112' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2'%3E%3Crect x='3' y='3' width='7' height='7'/%3E%3Crect x='14' y='3' width='7' height='7'/%3E%3Crect x='3' y='14' width='7' height='7'/%3E%3Cpath d='m14 14h.01M14 17h.01M17 14h.01M17 17h.01'/%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Thông tin tài khoản */}
          <div className="flex-1 space-y-3 text-sm">
            {[
              { label: "Ngân hàng", value: BANK_INFO.bankName },
              { label: "Số tài khoản", value: BANK_INFO.accountNumber, copyKey: "account" },
              { label: "Tên chủ TK", value: BANK_INFO.accountName, copyKey: "name" },
              { label: "Số tiền", value: `${Math.round(total).toLocaleString('vi-VN')}đ`, copyKey: "amount" },
              { label: "Nội dung CK", value: orderNote, copyKey: "note" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center gap-2">
                <span className="text-gray-500 text-xs font-bold whitespace-nowrap">{row.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-gray-900 text-right ${row.label === "Nội dung CK" ? "text-blue-700 font-mono" : ""}`}>
                    {row.value}
                  </span>
                  {row.copyKey && (
                    <button
                      onClick={() => handleCopy(row.value, row.copyKey!)}
                      className="p-1 rounded hover:bg-blue-100 flex-shrink-0 transition-colors"
                    >
                      {copiedField === row.copyKey
                        ? <Check className="w-3.5 h-3.5 text-green-500" />
                        : <Copy className="w-3.5 h-3.5 text-gray-400" />
                      }
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-medium">
          ⚠️ Vui lòng ghi đúng nội dung chuyển khoản <strong className="font-mono">{orderNote}</strong> để đơn hàng được xác nhận nhanh.
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// TRANG THANH TOÁN CHÍNH
// ============================================================
export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [selectedAddressId, setSelectedAddressId] = useState(1);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

  const { cart, clearCart } = useCart() as any;
  const { data: session } = useSession();

  const subTotal = cart.reduce((acc: number, item: any) => acc + item.gia_ban * item.so_luong, 0);
  const shippingFee = subTotal >= 500000 ? 0 : 30000;
  const total = subTotal + shippingFee;

  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);

      if (cart.length === 0) throw new Error("Giỏ hàng của bạn đang trống!");

      // Lấy userId từ session nếu có
      const userId = (session?.user as any)?.id || 1;

      // BƯỚC 1: Tạo đơn hàng
      const createOrderRes = await fetch('/api/store/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ma_nguoi_dung: userId,
          ma_dia_chi: selectedAddressId,
          phuong_thuc_thanh_toan: paymentMethod,
          ghi_chu: note,
          tong_tien: total,
          items: cart
        })
      });

      const orderData = await createOrderRes.json();
      if (!orderData.success) throw new Error(orderData.message);
      const orderId = orderData.orderId;

      // BƯỚC 2: Phân luồng theo phương thức
      if (paymentMethod === 'cod') {
        clearCart?.();
        window.location.href = `/payment/check?orderId=${orderId}&status=success&method=cod`;

      } else if (paymentMethod === 'bank_transfer') {
        // Chuyển khoản: không redirect, hiển thị QR inline
        setPendingOrderId(orderId);
        clearCart?.();
        // Cuộn lên QR
        window.scrollTo({ top: 0, behavior: 'smooth' });

      } else {
        // MoMo hoặc VNPay: Lấy payment URL và redirect
        const paymentRes = await fetch('/api/store/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, type: paymentMethod })
        });

        const paymentData = await paymentRes.json();
        if (paymentData.success && paymentData.paymentUrl) {
          clearCart?.();
          window.location.href = paymentData.paymentUrl;
        } else {
          throw new Error(paymentData.message || "Không lấy được link thanh toán");
        }
      }

    } catch (error: any) {
      alert("❌ Lỗi: " + error.message);
      setIsSubmitting(false);
    }
  };

  // Nếu đã đặt hàng bằng chuyển khoản → hiển thị màn hình chờ
  if (pendingOrderId) {
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg w-full bg-white rounded-[2rem] p-8 shadow-2xl shadow-emerald-900/5 border border-emerald-50"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Hoàn tất chuyển khoản</h1>
            <p className="text-gray-500 text-sm mt-1">Đơn hàng <strong>#{pendingOrderId}</strong> đã được tạo</p>
          </div>

          <BankTransferPanel total={total} orderId={pendingOrderId} />

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => window.location.href = `/payment/check?orderId=${pendingOrderId}&status=pending&method=bank_transfer`}
              className="w-full py-4 bg-[#007832] text-white font-bold rounded-xl hover:bg-[#006028] transition-all"
            >
              Tôi đã chuyển khoản xong ✓
            </button>
            <Link href="/orders">
              <button className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all text-sm">
                Xem đơn hàng của tôi
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF7]">
      <main className="pt-16 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        
        {/* Tiêu đề */}
        <div className="mb-8">
          <Link href="/cart" className="flex items-center gap-2 text-gray-400 hover:text-[#007832] font-bold transition-all mb-4 w-fit">
            <ChevronLeft size={20} /> Quay lại giỏ hàng
          </Link>
          <h1 className="text-4xl font-black text-gray-950 tracking-tight">Thanh toán</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- CỘT TRÁI --- */}
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
                    icon: <Banknote className="w-6 h-6 text-gray-400" />,
                    badge: null
                  },
                  { 
                    id: 'momo', 
                    label: 'Ví MoMo', 
                    sub: 'Thanh toán nhanh qua ứng dụng MoMo',
                    img: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Transparent.png',
                    badge: 'Phổ biến'
                  },
                  { 
                    id: 'vnpay', 
                    label: 'VNPay', 
                    sub: 'ATM / QR Code / Thẻ quốc tế',
                    img: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png',
                    badge: null
                  },
                  { 
                    id: 'bank_transfer', 
                    label: 'Chuyển khoản ngân hàng', 
                    sub: `MB Bank — ${BANK_INFO.accountNumber} — ${BANK_INFO.accountName}`,
                    icon: <Building2 className="w-6 h-6 text-blue-500" />,
                    badge: null
                  },
                ].map((m) => (
                  <div key={m.id}>
                    <label 
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
                        {(m as any).img ? (
                          <img 
                            src={(m as any).img} 
                            alt={m.label} 
                            className="w-full h-full object-contain" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          (m as any).icon
                        )}
                      </div>

                      <div className="ml-5 flex-grow">
                        <div className="flex items-center gap-2">
                          <p className={`font-black text-sm ${paymentMethod === m.id ? 'text-[#007832]' : 'text-gray-700'}`}>
                            {m.label}
                          </p>
                          {m.badge && (
                            <span className="text-[10px] bg-pink-100 text-pink-600 font-bold px-2 py-0.5 rounded-full">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{m.sub}</p>
                      </div>

                      {paymentMethod === m.id && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="w-6 h-6 text-[#007832] fill-white" />
                        </motion.div>
                      )}
                    </label>

                    {/* Panel QR hiển thị ngay khi chọn chuyển khoản */}
                    <AnimatePresence>
                      {paymentMethod === 'bank_transfer' && m.id === 'bank_transfer' && (
                        <BankTransferPanel total={total} orderId={null} />
                      )}
                    </AnimatePresence>
                  </div>
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
              
              <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-2">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm font-medium py-4">Giỏ hàng trống</p>
                ) : (
                  cart.map((item: any, idx: number) => (
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
                <span className="tracking-widest uppercase">
                  {isSubmitting 
                    ? 'Đang xử lý...' 
                    : paymentMethod === 'bank_transfer' 
                      ? 'Tạo đơn & Xem QR' 
                      : 'Xác nhận đặt hàng'
                  }
                </span>
                {!isSubmitting && <ArrowRight className="w-6 h-6" />}
              </motion.button>

              {paymentMethod === 'bank_transfer' && (
                <p className="text-xs text-gray-400 text-center mt-3 font-medium">
                  Đơn hàng sẽ được xác nhận sau khi chúng tôi nhận được chuyển khoản.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}