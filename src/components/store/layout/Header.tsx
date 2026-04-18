"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  LogOut,
  MapPin,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import { Toaster } from "react-hot-toast";
import { signOut } from "next-auth/react";

export default function Header({ session }: { session: any }) {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false); // Bước 1: Trạng thái chờ mount
  const pathname = usePathname();
  const { cart, totalItems } = useCart();

  // Đánh dấu khi component đã thực sự chạy trên trình duyệt
  useEffect(() => {
    setMounted(true);
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
            ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* 1. Bên trái: Logo & Nav */}
          <div className="flex items-center gap-12">
            <Link
              href="/"
              className="text-2xl font-bold text-[#007832] tracking-tighter"
            >
              Verdant Curator
            </Link>
            <nav className="hidden lg:flex items-center gap-8">
              {[
                { name: "Trang chủ", path: "/" },
                { name: "Sản phẩm", path: "/products" },
                { name: "Nhà vườn", path: "/farmers" },
                { name: "Câu chuyện", path: "/about" },
              ].map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-sm transition-colors ${
                    isActive(link.path)
                      ? "font-bold text-[#007832] border-b-2 border-[#007832] pb-1"
                      : "font-semibold text-gray-500 hover:text-[#007832]"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* 2. Bên phải: Search, Cart & Auth */}
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

            {/* Giỏ Hàng */}
            <div className="flex items-center border-r border-gray-200 pr-4">
              <div className="relative group pt-4 pb-4 -my-4">
                <Link
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

                {/* DROPDOWN MINI CART */}
                <div className="absolute top-full right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 p-4">
                  {cart.length > 0 ? (
                    <>
                      <div className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest italic">
                        Sản phẩm mới thêm
                      </div>
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
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
                                className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">
                                  {item.ten_san_pham}
                                </p>
                                <p className="text-[10px] text-[#007832] font-bold">
                                  {item.gia_ban.toLocaleString()}đ x
                                  {item.so_luong}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                      <Link
                        href="/cart"
                        className="block w-full bg-[#007832] text-white text-center py-2.5 mt-4 rounded-xl text-xs font-bold hover:bg-[#006028]"
                      >
                        Xem giỏ hàng
                      </Link>
                    </>
                  ) : (
                    <p className="text-center text-xs text-gray-500 py-4">
                      Giỏ hàng trống
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. AUTH SECTION: FIX TRIỆT ĐỂ LỖI CHẰN NHAU */}
            <div className="flex items-center min-w-[120px] justify-end">
              {!mounted ? (
                // Hiển thị khoảng trống để giữ layout ổn định khi đang mount
                <div className="h-10 w-24" />
              ) : session ? (
                /* --- GIAO DIỆN KHI ĐÃ ĐĂNG NHẬP --- */
                <div className="relative group pt-4 pb-4 -my-4">
                  <button className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 hover:bg-white hover:shadow-md transition-all">
                    <div className="w-7 h-7 bg-[#007832] rounded-full flex items-center justify-center text-white text-[10px] font-black">
                      {session.user?.email?.[0].toUpperCase()}
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-none">
                      <span className="text-[9px] font-black text-emerald-600 uppercase italic">
                        Thành viên
                      </span>
                      <span className="text-xs font-bold text-gray-700">
                        {session.user?.email?.split("@")[0]}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className="text-gray-400 group-hover:rotate-180 transition-transform"
                    />
                  </button>

                  {/* DROP DOWN MENU */}
                  <div className="absolute top-full right-0 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden p-2">
                    <div className="px-3 py-2 border-b border-gray-50 mb-1 text-[10px] font-black text-gray-300 uppercase italic tracking-widest">
                      Quản lý tài khoản
                    </div>
                    <Link
                      href="/account/profile"
                      className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl text-xs font-bold text-gray-600 hover:text-[#007832] transition-colors"
                    >
                      <User size={16} /> Hồ sơ cá nhân
                    </Link>
                    <Link
                      href="/account/orders"
                      className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl text-xs font-bold text-gray-600 hover:text-[#007832] transition-colors"
                    >
                      <ShoppingBag size={16} /> Đơn hàng của tôi
                    </Link>
                    <Link
                      href="/account/addresses"
                      className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl text-xs font-bold text-gray-600 hover:text-[#007832] transition-colors"
                    >
                      <MapPin size={16} /> Địa chỉ giao hàng
                    </Link>
                    <Link
                      href="/account/change-password"
                      className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl text-xs font-bold text-gray-600 hover:text-[#007832] transition-colors"
                    >
                      <ShieldCheck size={16} /> Đổi mật khẩu
                    </Link>
                    <div className="border-t border-gray-50 my-1"></div>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-xl text-xs font-black text-red-500 transition-colors uppercase italic"
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                /* --- GIAO DIỆN KHI CHƯA ĐĂNG NHẬP --- */
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="hidden md:block text-sm font-bold text-gray-600 hover:text-[#007832] transition-colors px-2"
                  >
                    Đăng nhập
                  </Link>
                  <Link href="/register">
                    <button className="bg-[#007832] text-white px-6 py-2.5 rounded-full text-sm font-black shadow-lg hover:bg-[#006028] transition-all active:scale-95 flex items-center gap-2">
                      <User size={16} fill="white" /> Đăng ký
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
