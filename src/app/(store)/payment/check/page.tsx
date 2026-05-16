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
  Copy,
  Check
} from "lucide-react";
import { useCart } from "@/lib/CartContext";

// ============================================================
// COMPONENT CHÍNH
// ============================================================
function PaymentResultContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart() as any;

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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const now = new Date();
    setOrderTime(now.toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: 'numeric', year: 'numeric'
    }));

    // Xử lý thanh toán thành công - xóa giỏ hàng
    if (computedStatus === 'success') {
      const pendingOrderId = localStorage.getItem('pending_payment_order');
      if (pendingOrderId === orderId) {
        clearCart?.();
        localStorage.removeItem('pending_payment_order');
        localStorage.removeItem('pending_payment_method');
        localStorage.removeItem('pending_payment_total');
        localStorage.removeItem('pending_payment_cart');
      }
    }

    // Xử lý thanh toán thất bại - hủy đơn, hoàn kho và khôi phục giỏ hàng
    if (computedStatus === 'failed' && orderId) {
      const cancelOrder = async () => {
        try {
          await fetch('/api/store/orders/cancel-unpaid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: Number(orderId) })
          });

          // Khôi phục giỏ hàng từ localStorage
          const savedCart = localStorage.getItem('pending_payment_cart');
          if (savedCart) {
            try {
              const cartItems = JSON.parse(savedCart);
              // Không cần gọi clearCart vì giỏ hàng chưa bị xóa
              // Giỏ hàng vẫn còn nguyên trong context
            } catch (e) {
              console.error('Lỗi parse giỏ hàng:', e);
            }
          }

          localStorage.removeItem('pending_payment_order');
          localStorage.removeItem('pending_payment_method');
          localStorage.removeItem('pending_payment_total');
          localStorage.removeItem('pending_payment_cart');
        } catch (error) {
          console.error('Lỗi hủy đơn:', error);
        }
      };
      cancelOrder();
    }

  }, [computedStatus, orderId, clearCart]);

  // Polling khi pending: tự chuyển sang success khi webhook đã xác nhận
  useEffect(() => {
    if (computedStatus !== 'pending' || !orderId) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/store/orders/${orderId}?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && ['DA_THANH_TOAN', 'CHO_XU_LY', 'CHO_GIAO_HANG', 'DANG_GIAO_HANG', 'DA_GIAO'].includes(data.order?.trang_thai)) {
          clearCart?.();
          window.location.href = `/payment/check?orderId=${orderId}&status=success&method=bank_transfer`;
        }
      } catch {}
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [computedStatus, orderId, clearCart]);

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
            {orderId ? `Đơn hàng #${orderId}` : 'Đơn hàng'} đã bị hủy.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Sản phẩm đã được hoàn lại vào giỏ hàng. Bạn có thể đặt hàng lại.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/cart">
              <button className="w-full py-4 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all">
                Quay lại giỏ hàng
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
            <Link href="/account/orders">
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
    <div className="flex flex-col items-center justify-center px-4 py-12 md:py-16">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="max-w-md w-full bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-emerald-100 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
          className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-600" strokeWidth={2.5} />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Cảm ơn bạn đã tin tưởng <strong className="text-emerald-700">Nông Sản Sạch</strong>
        </p>

        <div className="bg-emerald-50 rounded-xl p-5 mb-6 text-left space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Mã đơn hàng</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-emerald-700 text-lg">#{orderId}</span>
              <button onClick={handleCopy} className="p-1 rounded hover:bg-emerald-100">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Thời gian</span>
            <span className="text-sm font-medium text-gray-800">{orderTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Trạng thái</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              {method === 'cod' ? 'Chờ xác nhận' : 'Đã thanh toán'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Thanh toán</span>
            <span className="text-sm font-medium text-gray-800">
              {method === 'cod' ? 'COD — Tiền mặt' : method === 'momo' ? 'Ví MoMo' : method === 'vnpay' ? 'VNPay' : 'Chuyển khoản'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5 mb-6 text-left">
          <Truck className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <p className="text-xs text-blue-700">Đơn hàng sẽ được đóng gói và giao trong <strong>1-3 ngày</strong> làm việc.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/account/orders" className="flex-1">
            <button className="w-full py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm">
              <ReceiptText className="w-4 h-4" />
              Xem đơn hàng
            </button>
          </Link>
          <Link href="/products" className="flex-1">
            <button className="w-full py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm">
              <ShoppingBag className="w-4 h-4" />
              Tiếp tục mua sắm
            </button>
          </Link>
        </div>
      </motion.div>
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
