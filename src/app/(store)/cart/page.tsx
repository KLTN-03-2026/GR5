"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/lib/CartContext";
import Link from "next/link";
import {
  ShoppingCart,
  ArrowLeft,
  Trash2,
  Minus,
  Plus,
  ChevronRight,
  Ticket,
  Info,
  CheckCircle2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalItems } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);

  const [khoVoucher, setKhoVoucher] = useState<any[]>([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch(`/api/coupons?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setKhoVoucher(data);
        }
      } catch (error) {
        console.error("Lỗi khi tải mã giảm giá:", error);
      }
    };
    fetchCoupons();
  }, []);

  const subTotal = cart.reduce(
    (sum, item) => sum + item.gia_ban * item.so_luong,
    0,
  );

  const shippingFee = subTotal >= 500000 ? 0 : 30000;

  useEffect(() => {
    if (appliedCoupon) {
      const minOrder = Number(appliedCoupon.don_toi_thieu) || 0;
      if (subTotal < minOrder) {
        handleRemoveCoupon();
        toast.error(
          `Đơn hàng không còn đủ ${minOrder.toLocaleString("vi-VN")}đ để áp dụng mã!`,
        );
      } else {
        recalculateDiscount(appliedCoupon, subTotal);
      }
    }
  }, [subTotal, appliedCoupon]);

  const finalTotal =
    subTotal - discountAmount > 0 ? subTotal - discountAmount : 0;

  const handleQuantity = (
    id: string | number,
    phan_loai: string,
    currentQty: number,
    type: "plus" | "minus",
  ) => {
    if (type === "minus" && currentQty > 1)
      updateQuantity(id, phan_loai, currentQty - 1);
    if (type === "plus" && currentQty < 99)
      updateQuantity(id, phan_loai, currentQty + 1);
  };

  const recalculateDiscount = (coupon: any, currentSubTotal: number) => {
    const giamGia = Number(coupon.gia_tri_giam) || 0;
    const giamToiDa = Number(coupon.giam_toi_da) || null;
    let calculatedDiscount = 0;

    if (coupon.loai_giam_gia === "TIEN_MAT") {
      calculatedDiscount = giamGia;
    } else if (coupon.loai_giam_gia === "PHAN_TRAM") {
      calculatedDiscount = (currentSubTotal * giamGia) / 100;
      if (giamToiDa && calculatedDiscount > giamToiDa) {
        calculatedDiscount = giamToiDa;
      }
    }
    setDiscountAmount(calculatedDiscount);
  };

  const handleApplyCoupon = (codeToApply: string) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) {
      toast.error("Vui lòng nhập mã giảm giá!");
      return;
    }

    const foundCoupon = khoVoucher.find((c) => c.ma_code === code);
    if (!foundCoupon) {
      toast.error("Mã giảm giá không tồn tại hoặc đã hết hạn!");
      return;
    }

    const minOrder = Number(foundCoupon.don_toi_thieu) || 0;
    if (subTotal < minOrder) {
      toast.error(
        `Đơn hàng phải từ ${minOrder.toLocaleString("vi-VN")}đ để dùng mã này!`,
      );
      return;
    }

    recalculateDiscount(foundCoupon, subTotal);
    setAppliedCoupon(foundCoupon);
    setCouponCode(code);
    toast.success("Áp dụng mã giảm giá thành công!");
  };

  const handleRemoveCoupon = () => {
    setDiscountAmount(0);
    setAppliedCoupon(null);
    setCouponCode("");
  };

  if (totalItems === 0) {
    return (
      <div style={{ background: "#f7f8f6", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          <div style={{ width: 80, height: 80, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <ShoppingCart style={{ width: 36, height: 36, color: "#166534" }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: "0 0 8px" }}>Giỏ hàng trống</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 28px" }}>Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
          <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#16a34a", color: "#fff", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f7f8f6", minHeight: "100vh", fontFamily: "var(--font-sans)", padding: "24px 0 48px", width: "100%", boxSizing: "border-box" }}>
      <Toaster />
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
              {cart.map((item, index) => (
                <div
                  key={`${item.id}-${item.phan_loai}-${index}`}
                  style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 80px 32px", gap: 8, alignItems: "center", padding: "14px 0", borderBottom: index < cart.length - 1 ? "1px solid #f3f4f6" : "none" }}
                >
                  {/* Product info */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 8, overflow: "hidden", background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
                      <img src={item.anh_chinh} alt={item.ten_san_pham} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#111827", margin: "0 0 4px", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.ten_san_pham}
                      </p>
                      <span style={{ display: "inline-block", background: "#f3f4f6", color: "#6b7280", fontSize: 11, padding: "2px 8px", borderRadius: 4 }}>
                        {item.phan_loai}
                      </span>
                    </div>
                  </div>

                  {/* Đơn giá */}
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {item.gia_ban.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  {/* Stepper */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid #e5e7eb", borderRadius: 8, height: 32, overflow: "hidden" }}>
                      <button
                        onClick={() => handleQuantity(item.id, item.phan_loai, item.so_luong, "minus")}
                        style={{ width: 28, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", border: "none", borderRight: "1px solid #e5e7eb", cursor: "pointer", color: "#374151", fontSize: 16, flexShrink: 0 }}
                      >
                        <Minus style={{ width: 12, height: 12 }} />
                      </button>
                      <span style={{ width: 36, textAlign: "center", fontSize: 14, fontWeight: 500, color: "#111827" }}>
                        {item.so_luong}
                      </span>
                      <button
                        onClick={() => handleQuantity(item.id, item.phan_loai, item.so_luong, "plus")}
                        style={{ width: 28, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", border: "none", borderLeft: "1px solid #e5e7eb", cursor: "pointer", color: "#374151", fontSize: 16, flexShrink: 0 }}
                      >
                        <Plus style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
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
                </div>
              ))}
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

              {/* Tạm tính / Phí ship */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#6b7280" }}>Tạm tính</span>
                  <span style={{ color: "#111827", fontWeight: 500 }}>
                    {subTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#6b7280" }}>Phí vận chuyển</span>
                  <span style={{ color: shippingFee === 0 ? "#16a34a" : "#111827", fontWeight: 500 }}>
                    {shippingFee === 0 ? "Miễn phí" : `${shippingFee.toLocaleString("vi-VN")}đ`}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "#6b7280" }}>Mã giảm giá</span>
                    <span style={{ color: "#dc2626", fontWeight: 600 }}>
                      -{discountAmount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
              </div>

              {/* Mã ưu đãi */}
              <div style={{ marginBottom: 16, borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Mã ưu đãi
                </label>

                {appliedCoupon ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#166534" }}>
                      <CheckCircle2 style={{ width: 16, height: 16, color: "#16a34a" }} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{appliedCoupon.ma_code}</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      style={{ fontSize: 12, fontWeight: 500, color: "#dc2626", background: "none", border: "none", cursor: "pointer", padding: "2px 6px" }}
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex" }}>
                    <input
                      type="text"
                      placeholder="VD: NONGSAN50"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      style={{ flex: 1, height: 42, border: "1px solid #d1d5db", borderRight: "none", borderRadius: "8px 0 0 8px", fontSize: 13, padding: "0 12px", outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}
                    />
                    <button
                      onClick={() => handleApplyCoupon(couponCode)}
                      style={{ height: 42, padding: "0 16px", background: "#16a34a", color: "#fff", fontSize: 13, fontWeight: 500, borderRadius: "0 8px 8px 0", whiteSpace: "nowrap", border: "none", cursor: "pointer", flexShrink: 0 }}
                    >
                      Áp dụng
                    </button>
                  </div>
                )}
              </div>

              {/* Voucher list */}
              {!appliedCoupon && khoVoucher.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <Ticket style={{ width: 14, height: 14, color: "#ef4444" }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>Voucher khả dụng</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "auto" }}>
                    {khoVoucher.map((voucher) => {
                      const minOrder = Number(voucher.don_toi_thieu) || 0;
                      const giamToiDa = Number(voucher.giam_toi_da) || 0;
                      const isEligible = subTotal >= minOrder;
                      const giaTriGiam = Number(voucher.gia_tri_giam) || 0;

                      return (
                        <div
                          key={voucher.id}
                          style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${isEligible ? "#bbf7d0" : "#e5e7eb"}`, background: isEligible ? "#fff" : "#f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, opacity: isEligible ? 1 : 0.6 }}
                        >
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: isEligible ? "#dc2626" : "#6b7280", margin: "0 0 2px" }}>
                              {voucher.ma_code}
                            </p>
                            <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>
                              Giảm{" "}
                              {voucher.loai_giam_gia === "TIEN_MAT" ? (
                                <strong style={{ color: "#374151" }}>{giaTriGiam.toLocaleString("vi-VN")}đ</strong>
                              ) : (
                                <strong style={{ color: "#374151" }}>{giaTriGiam}%</strong>
                              )}
                              {voucher.loai_giam_gia === "PHAN_TRAM" && giamToiDa > 0 && ` (Tối đa ${giamToiDa.toLocaleString("vi-VN")}đ)`}
                              {" · "}Từ {minOrder.toLocaleString("vi-VN")}đ
                            </p>
                          </div>
                          {isEligible ? (
                            <button
                              onClick={() => handleApplyCoupon(voucher.ma_code)}
                              style={{ fontSize: 12, fontWeight: 600, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "4px 10px", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap" }}
                            >
                              Dùng
                            </button>
                          ) : (
                            <div style={{ position: "relative", display: "flex", cursor: "not-allowed" }} className="group">
                              <Info style={{ width: 14, height: 14, color: "#9ca3af" }} />
                              <div style={{ position: "absolute", bottom: "100%", right: 0, marginBottom: 6, width: 140, background: "#1f2937", color: "#fff", fontSize: 10, textAlign: "center", padding: "6px 8px", borderRadius: 6, pointerEvents: "none", zIndex: 10 }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                Mua thêm {(minOrder - subTotal).toLocaleString("vi-VN")}đ để dùng mã này
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Freeship banner */}
              {subTotal < 500000 && (
                <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#854d0e", marginBottom: 16 }}>
                  Mua thêm{" "}
                  <strong style={{ fontWeight: 600 }}>
                    {(500000 - subTotal).toLocaleString("vi-VN")}đ
                  </strong>{" "}
                  để được Freeship!
                </div>
              )}

              {/* Tổng cộng */}
              <div style={{ borderTop: "1px solid #e5e7eb", margin: "0 0 16px", paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>Tổng cộng</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#16a34a" }}>
                    {finalTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              {/* Checkout button */}
              <Link
                href={`/payment${appliedCoupon ? `?coupon=${appliedCoupon.ma_code}` : ""}`}
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
