"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCart } from "@/lib/CartContext";
import Link from "next/link";
import {
  ShoppingCart,
  ArrowLeft,
  Trash2,
  Minus,
  Plus,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StockInfo {
  ma_bien_the: number;
  ton_tai: boolean;
  gia_ban: number;
  ton_kho: number;
  het_hang: boolean;
  gia_thay_doi: boolean;
  gia_cu: number;
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalItems } = useCart();

  const [stockInfo, setStockInfo] = useState<StockInfo[]>([]);
  const [stockLoading, setStockLoading] = useState(false);

  useEffect(() => {
    const pendingOrderId = localStorage.getItem('pending_payment_order');
    if (pendingOrderId) {
      const cancelPendingOrder = async () => {
        try {
          await fetch('/api/store/orders/cancel-unpaid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: Number(pendingOrderId) })
          });
          localStorage.removeItem('pending_payment_order');
          localStorage.removeItem('pending_payment_cart');
        } catch {}
      };
      cancelPendingOrder();
    }
  }, []);

  const checkStock = useCallback(async () => {
    if (cart.length === 0) return;
    setStockLoading(true);
    try {
      const res = await fetch("/api/cart/check-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            ma_bien_the: item.ma_bien_the,
            gia_ban: item.gia_ban,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setStockInfo(data.items || []);
      }
    } catch {}
    setStockLoading(false);
  }, [cart]);

  useEffect(() => {
    checkStock();
  }, [checkStock]);

  const getStockForItem = (ma_bien_the: number): StockInfo | undefined => {
    return stockInfo.find((s) => s.ma_bien_the === ma_bien_the);
  };

  const subTotal = cart.reduce(
    (sum, item) => sum + item.gia_ban * item.so_luong,
    0,
  );

  const handleQuantity = (
    id: string | number,
    phan_loai: string,
    ma_bien_the: number,
    currentQty: number,
    type: "plus" | "minus",
  ) => {
    const stock = getStockForItem(ma_bien_the);
    const maxQty = stock ? Math.min(stock.ton_kho, 99) : 99;

    if (type === "minus" && currentQty > 1)
      updateQuantity(id, phan_loai, currentQty - 1);
    if (type === "plus" && currentQty < maxQty)
      updateQuantity(id, phan_loai, currentQty + 1);
  };

  if (totalItems === 0) {
    return (
      <div style={{ background: "#f7f8f6", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans)" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}
        >
          <div style={{ width: 80, height: 80, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <ShoppingCart style={{ width: 36, height: 36, color: "#166534" }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: "0 0 8px" }}>Giỏ hàng trống</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 28px" }}>Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
          <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#16a34a", color: "#fff", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Tiếp tục mua sắm
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f7f8f6", minHeight: "100vh", fontFamily: "var(--font-sans)", padding: "24px 0 48px", width: "100%", boxSizing: "border-box" }}>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", boxSizing: "border-box" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: 0, lineHeight: 1.3 }}>
            Giỏ hàng của bạn
          </h1>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0" }}>
            {totalItems} sản phẩm trong giỏ
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

          {/* CỘT TRÁI: SẢN PHẨM */}
          <div>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px" }}>

              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 80px 32px", gap: 8, alignItems: "center", paddingBottom: 8, borderBottom: "1px solid #f3f4f6", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>Sản phẩm</span>
                <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500, textAlign: "right" }}>Đơn giá</span>
                <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500, textAlign: "center" }}>Số lượng</span>
                <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500, textAlign: "right" }}>Thành tiền</span>
                <span />
              </div>

              {/* Product rows */}
              <AnimatePresence mode="popLayout">
                {cart.map((item, index) => {
                  const stock = getStockForItem(item.ma_bien_the);
                  const isOutOfStock = stock?.het_hang;
                  const priceChanged = stock?.gia_thay_doi;

                  return (
                    <motion.div
                      key={`${item.id}-${item.phan_loai}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 80px 32px", gap: 8, alignItems: "center", padding: "14px 0", borderBottom: index < cart.length - 1 ? "1px solid #f3f4f6" : "none", opacity: isOutOfStock ? 0.5 : 1 }}
                    >
                      {/* Product info */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                        <div style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 8, overflow: "hidden", background: "#f3f4f6", border: "1px solid #e5e7eb", position: "relative" }}>
                          <img src={item.anh_chinh} alt={item.ten_san_pham} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          {isOutOfStock && (
                            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: "#dc2626", padding: "2px 6px", borderRadius: 3 }}>Hết hàng</span>
                            </div>
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, color: "#111827", margin: "0 0 4px", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.ten_san_pham}
                          </p>
                          <span style={{ display: "inline-block", background: "#f3f4f6", color: "#6b7280", fontSize: 11, padding: "2px 8px", borderRadius: 4 }}>
                            {item.phan_loai}
                          </span>
                          {priceChanged && (
                            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                              <AlertTriangle style={{ width: 12, height: 12, color: "#f59e0b" }} />
                              <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 500 }}>Giá đã thay đổi</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Đơn giá */}
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: priceChanged ? "#f59e0b" : "#111827" }}>
                          {(stock?.gia_ban || item.gia_ban).toLocaleString("vi-VN")}đ
                        </span>
                        {priceChanged && (
                          <div style={{ fontSize: 11, color: "#9ca3af", textDecoration: "line-through" }}>
                            {item.gia_ban.toLocaleString("vi-VN")}đ
                          </div>
                        )}
                      </div>

                      {/* Stepper */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid #e5e7eb", borderRadius: 8, height: 32, overflow: "hidden" }}>
                          <button
                            onClick={() => handleQuantity(item.id, item.phan_loai, item.ma_bien_the, item.so_luong, "minus")}
                            disabled={isOutOfStock}
                            style={{ width: 28, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", border: "none", borderRight: "1px solid #e5e7eb", cursor: isOutOfStock ? "not-allowed" : "pointer", color: "#374151", fontSize: 16, flexShrink: 0 }}
                          >
                            <Minus style={{ width: 12, height: 12 }} />
                          </button>
                          <motion.span
                            key={item.so_luong}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.15 }}
                            style={{ width: 36, textAlign: "center", fontSize: 14, fontWeight: 500, color: "#111827", display: "inline-block" }}
                          >
                            {item.so_luong}
                          </motion.span>
                          <button
                            onClick={() => handleQuantity(item.id, item.phan_loai, item.ma_bien_the, item.so_luong, "plus")}
                            disabled={isOutOfStock || (stock ? item.so_luong >= stock.ton_kho : false)}
                            style={{ width: 28, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", border: "none", borderLeft: "1px solid #e5e7eb", cursor: isOutOfStock ? "not-allowed" : "pointer", color: "#374151", fontSize: 16, flexShrink: 0 }}
                          >
                            <Plus style={{ width: 12, height: 12 }} />
                          </button>
                        </div>
                        {stock && !isOutOfStock && stock.ton_kho <= 10 && (
                          <span style={{ fontSize: 10, color: "#f59e0b" }}>
                            Còn {stock.ton_kho} sp
                          </span>
                        )}
                      </div>

                      {/* Thành tiền */}
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                          {(item.gia_ban * item.so_luong).toLocaleString("vi-VN")}đ
                        </span>
                      </div>

                      {/* Xóa */}
                      <button
                        onClick={() => removeFromCart(item.id, item.phan_loai)}
                        title="Xóa sản phẩm"
                        style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", borderRadius: 6, transition: "color 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#dc2626")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
                      >
                        <Trash2 style={{ width: 15, height: 15 }} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Tiếp tục mua sắm */}
            <div style={{ marginTop: 16 }}>
              <Link
                href="/products"
                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "#16a34a", textDecoration: "none", fontWeight: 500 }}
              >
                <ArrowLeft style={{ width: 14, height: 14 }} /> Tiếp tục mua sắm
              </Link>
            </div>
          </div>

          {/* CỘT PHẢI: TỔNG KẾT */}
          <div style={{ position: "sticky", top: 112 }}>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>

              {/* Title */}
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: "0 0 12px", paddingBottom: 12, borderBottom: "1px solid #f3f4f6" }}>
                Tổng kết đơn hàng
              </h2>

              {/* Tạm tính */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#6b7280" }}>Tạm tính</span>
                  <span style={{ color: "#111827", fontWeight: 500 }}>
                    {subTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              {/* Tổng cộng */}
              <div style={{ borderTop: "1px solid #e5e7eb", margin: "0 0 12px", paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>Tổng cộng</span>
                  <motion.span
                    key={subTotal}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{ fontSize: 20, fontWeight: 700, color: "#16a34a", display: "inline-block" }}
                  >
                    {subTotal.toLocaleString("vi-VN")}đ
                  </motion.span>
                </div>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: "6px 0 0", textAlign: "right" }}>
                  Chưa bao gồm phí vận chuyển
                </p>
              </div>

              {/* Thông báo nhập mã giảm giá ở trang thanh toán */}
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 12px", marginBottom: 16, fontSize: 12, color: "#166534" }}>
                💡 Bạn có thể nhập <strong>mã giảm giá</strong> và xem <strong>phí vận chuyển</strong> ở bước thanh toán.
              </div>

              {/* Checkout button */}
              <Link
                href="/payment"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", height: 48, borderRadius: 10, background: "#16a34a", color: "#fff", fontSize: 15, fontWeight: 500, textDecoration: "none", boxSizing: "border-box" }}
              >
                Tiến hành thanh toán <ChevronRight style={{ width: 18, height: 18 }} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
