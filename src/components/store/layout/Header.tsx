"use client";

import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import { Toaster } from "react-hot-toast";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Kéo thêm mảng `cart` ra để lặp danh sách sản phẩm
  const { cart, totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-md shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Bên trái: Logo & Nav */}
          <div className="flex items-center gap-12">
            <Link
              href="/"
              className="text-2xl font-bold text-[#007832] tracking-tighter"
            >
              Verdant Curator
            </Link>
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                href="/"
                className={`text-sm transition-colors ${
                  isActive("/")
                    ? "font-bold text-[#007832] border-b-2 border-[#007832] pb-1"
                    : "font-semibold text-gray-500 hover:text-[#007832]"
                }`}
              >
                Trang chủ
              </Link>
              <Link
                href="/products"
                className={`text-sm transition-colors ${
                  isActive("/products")
                    ? "font-bold text-[#007832] border-b-2 border-[#007832] pb-1"
                    : "font-semibold text-gray-500 hover:text-[#007832]"
                }`}
              >
                Sản phẩm
              </Link>
              <Link
                href="/farmers"
                className={`text-sm transition-colors ${
                  isActive("/farmers")
                    ? "font-bold text-[#007832] border-b-2 border-[#007832] pb-1"
                    : "font-semibold text-gray-500 hover:text-[#007832]"
                }`}
              >
                Nhà vườn
              </Link>
              <Link
                href="/about"
                className={`text-sm transition-colors ${
                  isActive("/about")
                    ? "font-bold text-[#007832] border-b-2 border-[#007832] pb-1"
                    : "font-semibold text-gray-500 hover:text-[#007832]"
                }`}
              >
                Câu chuyện
              </Link>
            </nav>
          </div>

          {/* Bên phải: Search, Cart & Auth */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* Thanh Tìm Kiếm */}
            <div className="hidden lg:flex items-center bg-gray-50/80 px-4 py-2 rounded-full border border-gray-200 focus-within:border-[#007832] transition-colors">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Tìm kiếm nông sản..."
                className="bg-transparent border-none focus:ring-0 text-sm w-48 font-body outline-none"
              />
            </div>

            {/* Giỏ Hàng (Có Mini Cart Dropdown) */}
            <div className="flex items-center border-r border-gray-200 pr-4 mr-2">
              <div className="relative group pt-4 pb-4 -my-4">
                <Link
                  id="cart-icon"
                  href="/cart"
                  className="relative p-2 text-gray-600 hover:bg-emerald-50 hover:text-[#007832] rounded-full transition-all flex"
                >
                  <ShoppingCart size={20} />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                      {totalItems}
                    </span>
                  )}
                </Link>

                {/* BẢNG DROPDOWN MINI CART */}
                <div className="absolute top-full right-0 w-80 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                  <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-100 transform rotate-45"></div>

                  <div className="relative bg-white rounded-2xl overflow-hidden">
                    {cart.length > 0 ? (
                      <div className="p-4">
                        <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">
                          Sản phẩm mới thêm
                        </div>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto">
                          {/* Lấy 4 món mới nhất */}
                          {cart
                            .slice(-4)
                            .reverse()
                            .map((item, index) => (
                              <div
                                key={index}
                                className="flex gap-3 items-center"
                              >
                                <img
                                  src={item.anh_chinh}
                                  className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                                  alt={item.ten_san_pham}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-gray-900 truncate">
                                    {item.ten_san_pham}
                                  </p>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-500 truncate max-w-[100px]">
                                      {item.phan_loai}
                                    </span>
                                    <span className="text-sm font-bold text-[#007832]">
                                      {item.gia_ban.toLocaleString("vi-VN")}đ{" "}
                                      <span className="text-xs text-gray-400 font-medium">
                                        x{item.so_luong}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>

                        {cart.length > 4 && (
                          <p className="text-xs text-center text-gray-500 mt-4 pt-3 border-t border-gray-100">
                            Còn <span className="font-bold">{cart.length - 4}</span> sản phẩm khác trong giỏ
                          </p>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <Link
                            href="/cart"
                            className="block w-full bg-[#007832] text-white text-center py-2.5 rounded-xl font-bold hover:bg-[#006028] transition-colors shadow-sm"
                          >
                            Xem giỏ hàng
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                          <ShoppingCart className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">
                          Giỏ hàng của bạn đang trống
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden md:block text-sm font-bold text-gray-600 hover:text-[#007832] transition-colors px-2"
              >
                Đăng nhập
              </Link>

              <Link href="/register">
                <button className="bg-[#007832] text-white px-6 py-2.5 rounded-full text-sm font-black shadow-lg shadow-emerald-900/10 hover:bg-[#006028] hover:shadow-emerald-900/20 transition-all active:scale-95 flex items-center gap-2">
                  <User size={16} fill="white" />
                  Đăng ký
                </button>
              </Link>
            </div>

          </div>
        </div>
      </header>
    </>
  );
}