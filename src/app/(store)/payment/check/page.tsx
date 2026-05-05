'use client'

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  ReceiptText, 
  CheckCircle2, 
  XCircle,
  Clock,
  Truck, 
  Sprout,
  Copy,
  Check
} from "lucide-react";

// ============================================================
// COMPONENT CHÍNH
// ============================================================
function PaymentResultContent() {
  const searchParams = useSearchParams();
  
  const orderId = searchParams.get('orderId') || '';
  const status = searchParams.get('status') || 'success'; // success | failed | pending
  const method = searchParams.get('method') || 'cod';

  // Xử lý kết quả từ MoMo redirect (client-side verify)
  const momoResultCode = searchParams.get('resultCode');
  
  // Tổng hợp trạng thái cuối cùng
  const computedStatus = (() => {
    if (momoResultCode !== null) {
      return momoResultCode === '0' ? 'success' : 'failed';
    }
    return status;
  })();

  const [orderTime, setOrderTime] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const now = new Date();
    setOrderTime(now.toLocaleString('vi-VN', { 
      hour: '2-digit', minute: '2-digit', 
      day: '2-digit', month: 'numeric', year: 'numeric' 
    }));

    const fetchRecommendations = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setRecommendations(data.slice(0, 4));
          }
        }
      } catch (error) {
        console.error("Lỗi tải sản phẩm gợi ý:", error);
      }
    };
    fetchRecommendations();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(`#${orderId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ============================================================
  // RENDER: THẤT BẠI
  // ============================================================
  if (computedStatus === 'failed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF5F5] px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-xl text-center"
        >
          <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-14 h-14 text-rose-500" />
          </div>
          <h1 className="text-3xl font-black text-rose-600 mb-3">Thanh toán thất bại</h1>
          <p className="text-gray-500 mb-2">
            {orderId ? `Đơn hàng #${orderId}` : ''} chưa được thanh toán.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Bạn có thể thử lại hoặc chọn phương thức khác.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/payment">
              <button className="w-full py-4 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all">
                Thử lại thanh toán
              </button>
            </Link>
            <Link href="/orders">
              <button className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all">
                Xem đơn hàng của tôi
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================================
  // RENDER: CHỜ XÁC NHẬN CHUYỂN KHOẢN
  // ============================================================
  if (computedStatus === 'pending') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF9E6] px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-xl text-center"
        >
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-14 h-14 text-amber-500" />
          </div>
          <h1 className="text-3xl font-black text-amber-600 mb-3">Đang chờ xác nhận</h1>
          {orderId && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-gray-500 font-medium">Mã đơn: <span className="font-black text-gray-900">#{orderId}</span></span>
              <button onClick={handleCopy} className="p-1 rounded hover:bg-gray-100">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          )}
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            Chúng tôi đã nhận đơn hàng của bạn. Sau khi xác nhận chuyển khoản, đơn hàng sẽ được xử lý trong <strong>1-2 giờ</strong> làm việc.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800 text-left">
            <p className="font-bold mb-1">📋 Nội dung chuyển khoản cần ghi:</p>
            <p className="font-mono font-black text-amber-900">DH{orderId}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/orders">
              <button className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all">
                Xem đơn hàng
              </button>
            </Link>
            <Link href="/products">
              <button className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all">
                Tiếp tục mua sắm
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================================
  // RENDER: THÀNH CÔNG (mặc định)
  // ============================================================
  return (
    <div className="min-h-screen flex flex-col bg-[#F4FCF0] selection:bg-[#007832]/20">
      <main className="grow flex items-center justify-center px-6 py-12 md:py-20">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Cột trái: Nội dung thông báo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8 order-2 lg:order-1"
          >
            <div className="space-y-4">
              <span className="bg-[#D5E3FD] inline-flex items-center px-3 py-1 rounded-full text-[#007832] text-[10px] font-bold uppercase tracking-widest">
                Giao dịch thành công
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-[#007832] tracking-tight leading-tight">
                Đặt hàng thành <br className="hidden md:block" /> công
              </h1>
              <p className="text-gray-600 text-lg max-w-md">
                Cảm ơn bạn đã tin tưởng <strong>Nông Sản Sạch</strong>. Đơn hàng của bạn đang được chuẩn bị.
              </p>
            </div>

            {/* Thẻ thông tin đơn hàng */}
            <div className="bg-[#EFF6EA] backdrop-blur-sm p-6 md:p-8 rounded-3xl border-l-8 border-[#007832] shadow-sm space-y-6">
              <div className="flex justify-between items-end gap-4">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Mã đơn hàng</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#007832] text-xl md:text-2xl tracking-tighter">
                    #{orderId}
                  </span>
                  <button onClick={handleCopy} className="p-1 rounded hover:bg-emerald-100 transition-colors">
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-black/5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Thời gian</span>
                  <span className="text-gray-900 font-semibold">{orderTime}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Trạng thái</span>
                  <span className="text-[#007832] font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                    {method === 'cod' ? 'Chờ xác nhận' : 'Đã thanh toán'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Phương thức</span>
                  <span className="text-gray-900 font-semibold capitalize">
                    {method === 'cod' ? 'Tiền mặt COD' : method === 'momo' ? 'Ví MoMo' : method === 'vnpay' ? 'VNPay' : 'Chuyển khoản'}
                  </span>
                </div>
              </div>
            </div>

            {/* Nút bấm điều hướng */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="flex-1">
                <button className="w-full bg-[#007832] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-900/20 hover:bg-[#006028] transition-all flex items-center justify-center gap-3 group active:scale-95">
                  <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Tiếp tục mua sắm
                </button>
              </Link>
              <Link href="/orders" className="flex-1">
                <button className="bg-white flex-1 text-gray-800 px-8 py-4 rounded-2xl font-bold border border-emerald-100 hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm w-full">
                  <ReceiptText className="w-5 h-5" />
                  Xem đơn hàng
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Cột phải: Hình ảnh Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 flex justify-center relative"
          >
            <div className="absolute inset-0 bg-[#007832]/10 rounded-full blur-[120px] -z-10 animate-pulse" />
            
            <div className="relative w-full aspect-square max-w-md">
              <div className="absolute inset-0 bg-yellow-200 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center border border-white/50 overflow-hidden">
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                  className="w-32 h-32 bg-[#007832] rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-900/30"
                >
                  <CheckCircle2 className="text-white w-16 h-16" strokeWidth={3} />
                </motion.div>
                <h2 className="text-4xl font-black text-[#007832] tracking-tight">Tuyệt vời!</h2>
              </div>

              {/* Badge Trạng thái nổi */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 z-20 border border-emerald-50"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-[#007832]">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Vận chuyển</p>
                  <p className="text-sm font-bold text-gray-900">Chờ đóng gói</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Gợi ý sản phẩm */}
      {recommendations.length > 0 && (
        <section className="max-w-6xl mx-auto w-full px-6 mb-20">
          <div className="bg-white/60 backdrop-blur-sm rounded-[3rem] p-8 md:p-12 border border-white shadow-sm">
            <div className="flex items-center gap-3 mb-10">
              <Sprout className="text-[#007832] w-6 h-6" />
              <h3 className="text-2xl font-bold text-gray-900">Sản phẩm tương tự</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((item) => (
                <motion.div 
                  key={item.id}
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer"
                >
                  <Link href={`/products`}>
                    <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-4 bg-emerald-50 relative">
                      <img 
                        src={item.anh_chinh} 
                        alt={item.ten_san_pham} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-2 mb-1">{item.ten_san_pham}</h4>
                    <p className="text-[#007832] font-black">{item.gia_ban?.toLocaleString('vi-VN')}đ</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Bọc vào Suspense (bắt buộc với useSearchParams trong Next.js App Router)
export default function PaymentCheckPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F4FCF0]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#007832] border-t-transparent"></div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}