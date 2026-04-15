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

  // STATE LƯU DỮ LIỆU MÃ GIẢM GIÁ TỪ DATABASE
  const [khoVoucher, setKhoVoucher] = useState<any[]>([]);

  // TỰ ĐỘNG GỌI API LẤY VOUCHER
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

  // 💡 THÊM: Tính toán phí ship (Freeship cho đơn từ 500k)
  const shippingFee = subTotal >= 500000 ? 0 : 30000;

  // THEO DÕI: Nếu tiền hàng thay đổi (do tăng/giảm SP) -> Tính lại tiền giảm giá
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

  // HÀM TÍNH TOÁN TIỀN GIẢM GIÁ CHUẨN KẾ TOÁN
  const recalculateDiscount = (coupon: any, currentSubTotal: number) => {
    const giamGia = Number(coupon.gia_tri_giam) || 0;
    const giamToiDa = Number(coupon.giam_toi_da) || null;
    let calculatedDiscount = 0;

    if (coupon.loai_giam_gia === "TIEN_MAT") {
      calculatedDiscount = giamGia;
    } else if (coupon.loai_giam_gia === "PHAN_TRAM") {
      calculatedDiscount = (currentSubTotal * giamGia) / 100;
      // Áp dụng luật "Giảm tối đa" nếu có
      if (giamToiDa && calculatedDiscount > giamToiDa) {
        calculatedDiscount = giamToiDa;
      }
    }
    setDiscountAmount(calculatedDiscount);
  };

  // HÀM KIỂM TRA VÀ ÁP DỤNG MÃ
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
      <div className="max-w-7xl mx-auto px-6 py-32 font-sans min-h-screen flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="w-12 h-12 text-emerald-800" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          Giỏ hàng trống
        </h1>
        <p className="text-gray-500 mb-8">
          Bạn chưa thêm sản phẩm nào vào giỏ hàng.
        </p>
        <Link
          href="/products"
          className="bg-[#065F46] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-800 transition-all shadow-md flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFEFC] min-h-screen py-16 pt-28 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Toaster />
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-10 font-headline">
          Giỏ hàng của bạn
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* CỘT TRÁI: SẢN PHẨM */}
          <div className="lg:col-span-8 space-y-5">
            {cart.map((item, index) => (
              <div
                key={`${item.id}-${item.phan_loai}-${index}`}
                className="bg-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm border border-gray-100 relative group transition-all hover:shadow-md hover:border-emerald-100"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                  <img
                    src={item.anh_chinh}
                    alt={item.ten_san_pham}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 w-full">
                  <h3 className="font-extrabold text-gray-900 text-[17px] mb-1 pr-8 leading-tight">
                    {item.ten_san_pham}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Loại:{" "}
                    <span className="font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded capitalize">
                      {item.phan_loai}
                    </span>
                  </p>

                  <div className="flex flex-wrap items-center gap-x-8 gap-y-4 justify-between sm:justify-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Đơn giá
                      </span>
                      <span className="font-bold text-gray-900">
                        {item.gia_ban.toLocaleString("vi-VN")}đ
                      </span>
                    </div>

                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 h-10 w-28">
                      <button
                        onClick={() =>
                          handleQuantity(
                            item.id,
                            item.phan_loai,
                            item.so_luong,
                            "minus",
                          )
                        }
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-emerald-700 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="flex-1 text-center font-bold text-sm text-gray-900">
                        {item.so_luong}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantity(
                            item.id,
                            item.phan_loai,
                            item.so_luong,
                            "plus",
                          )
                        }
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-emerald-700 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Thành tiền
                      </span>
                      <span className="font-extrabold text-emerald-700 text-lg">
                        {(item.gia_ban * item.so_luong).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id, item.phan_loai)}
                  className="absolute top-5 right-5 sm:static p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Xóa sản phẩm"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            <div className="pt-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-emerald-700 font-bold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Tiếp tục mua sắm
              </Link>
            </div>
          </div>

          {/* CỘT PHẢI: TỔNG KẾT & VOUCHER */}
          <div className="lg:col-span-4">
            <div className="bg-[#F4F8F4] rounded-3xl p-7 sticky top-32 shadow-sm border border-emerald-50">
              <h2 className="text-xl font-extrabold text-gray-900 mb-6 font-headline flex items-center gap-2">
                Tổng kết đơn hàng
              </h2>

              <div className="space-y-4 mb-6 text-sm font-medium">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="text-gray-900 font-bold">
                    {subTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-gray-900 font-bold">
                    {shippingFee === 0 ? "Miễn phí" : `${shippingFee.toLocaleString("vi-VN")}đ`}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 items-center">
                    <span>Mã giảm giá</span>
                    <span className="font-extrabold text-lg">
                      -{discountAmount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
              </div>

              {/* Ô NHẬP MÃ GIẢM GIÁ */}
              <div className="mb-6 border-t border-emerald-100 pt-5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Mã ưu đãi
                </label>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="font-bold tracking-widest">
                        {appliedCoupon.ma_code}
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="VD: NONGSAN50"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none uppercase font-bold placeholder:font-medium placeholder:normal-case transition-all"
                    />
                    <button
                      onClick={() => handleApplyCoupon(couponCode)}
                      className="bg-[#006b2c] text-white font-bold px-5 py-3 rounded-xl hover:bg-emerald-800 text-sm transition-colors shadow-md"
                    >
                      Áp dụng
                    </button>
                  </div>
                )}
              </div>

              {/* KHO VOUCHER KHẢ DỤNG TỪ DATABASE */}
              {!appliedCoupon && khoVoucher.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Ticket className="w-4 h-4 text-rose-500" />
                    <h3 className="text-sm font-bold text-gray-900">
                      Voucher khả dụng
                    </h3>
                  </div>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {khoVoucher.map((voucher) => {
                      const minOrder = Number(voucher.don_toi_thieu) || 0;
                      const giamToiDa = Number(voucher.giam_toi_da) || 0;
                      const isEligible = subTotal >= minOrder;
                      const giaTriGiam = Number(voucher.gia_tri_giam) || 0;

                      return (
                        <div
                          key={voucher.id}
                          className={`p-3 rounded-xl border flex justify-between items-center gap-2 transition-colors ${isEligible ? "bg-white border-emerald-200 hover:border-emerald-400 shadow-sm" : "bg-gray-50 border-gray-200 opacity-60"}`}
                        >
                          <div>
                            <p
                              className={`font-black text-sm leading-tight tracking-wider ${isEligible ? "text-rose-600" : "text-gray-500"}`}
                            >
                              {voucher.ma_code}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-1">
                              Giảm{" "}
                              {voucher.loai_giam_gia === "TIEN_MAT" ? (
                                <strong className="text-gray-700">
                                  {giaTriGiam.toLocaleString("vi-VN")}đ
                                </strong>
                              ) : (
                                <strong className="text-gray-700">
                                  {giaTriGiam}%
                                </strong>
                              )}
                              {voucher.loai_giam_gia === "PHAN_TRAM" &&
                                giamToiDa > 0 &&
                                ` (Tối đa ${giamToiDa.toLocaleString("vi-VN")}đ)`}
                              <br />
                              Cho đơn từ {minOrder.toLocaleString("vi-VN")}đ
                            </p>
                          </div>
                          {isEligible ? (
                            <button
                              onClick={() => handleApplyCoupon(voucher.ma_code)}
                              className="text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1.5 rounded-lg hover:bg-rose-500 hover:text-white transition-colors whitespace-nowrap"
                            >
                              Dùng
                            </button>
                          ) : (
                            <div className="group relative flex cursor-not-allowed">
                              <Info className="w-4 h-4 text-gray-400" />
                              <div className="absolute bottom-full right-0 mb-2 w-36 bg-gray-800 text-white text-[10px] text-center p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                                Mua thêm{" "}
                                {(minOrder - subTotal).toLocaleString("vi-VN")}đ
                                để dùng mã này
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FREESHIP & TỔNG TIỀN */}
              {subTotal < 500000 && (
                <p className="text-xs text-emerald-700 mb-6 font-medium bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center">
                  Mua thêm{" "}
                  <b className="text-rose-500 text-sm">
                    {(500000 - subTotal).toLocaleString("vi-VN")}đ
                  </b>{" "}
                  để được Freeship!
                </p>
              )}

              <div className="border-t border-emerald-100 pt-5 mt-2">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                    Tổng cộng
                  </span>
                  <span className="text-3xl font-black text-emerald-700">
                    {finalTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <Link
                  href={`/payment${appliedCoupon ? `?coupon=${appliedCoupon.ma_code}` : ""}`}
                  className="w-full bg-[#065F46] text-white py-4 rounded-xl font-black text-lg hover:bg-emerald-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Tiến hành thanh toán <ChevronRight className="w-5 h-5" />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}