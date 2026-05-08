"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  LogOut,
  MapPin,
  ShoppingBag,
  ShieldCheck,
  X,
  Loader2,
  Leaf,
  Package,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import { Toaster } from "react-hot-toast";
import { signOut } from "next-auth/react";

interface Product {
  id: string;
  ten_san_pham: string;
  gia_ban: number;
  don_vi?: string;
  anh_chinh?: string;
  xuat_xu?: string;
}

function SearchDropdown() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    setIsOpen(true);
    try {
      const res = await fetch(`/api/store/products?q=${encodeURIComponent(searchQuery.trim())}&limit=5`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const products: Product[] = Array.isArray(data) ? data : (data.data ?? []);
      setResults(products.slice(0, 5));
      setHasSearched(true);
    } catch {
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setResults([]);
      setIsOpen(false);
      setHasSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => searchProducts(val), 350);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      router.push("/products");
      return;
    }
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleSelect = (product: Product) => {
    router.push(`/products/${product.id}`);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 ${
          isOpen
            ? "border-[#007832] bg-white shadow-lg shadow-green-100 ring-2 ring-[#007832]/10"
            : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white focus-within:border-[#007832] focus-within:bg-white focus-within:shadow-md"
        }`}
        style={{ minWidth: 160, maxWidth: 200 }}
      >
        <button type="submit" className="flex-shrink-0">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-[#007832] animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </button>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
          placeholder="Tìm kiếm nông sản..."
          className="bg-transparent border-none focus:ring-0 text-sm flex-1 outline-none text-slate-700 placeholder-gray-400"
        />
        {query && (
          <button type="button" onClick={handleClear} className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-black/10 overflow-hidden z-50 min-w-[340px]">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin text-[#007832]" />
              <span>Đang tìm kiếm...</span>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <ul className="py-2">
              {results.map((product, index) => (
                <li key={product.id}>
                  <button
                    onClick={() => handleSelect(product)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left group"
                  >
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                      {product.anh_chinh ? (
                        <img src={product.anh_chinh} alt={product.ten_san_pham} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Leaf className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#007832] transition-colors">
                        {product.ten_san_pham}
                      </p>
                      {product.xuat_xu && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{product.xuat_xu}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[#007832]">
                        {product.gia_ban.toLocaleString("vi-VN")}đ
                      </p>
                      {product.don_vi && <p className="text-xs text-gray-400">/{product.don_vi}</p>}
                    </div>
                  </button>
                  {index < results.length - 1 && <div className="mx-4 h-px bg-gray-50" />}
                </li>
              ))}
              <li className="border-t border-gray-50 mt-1">
                <Link
                  href={`/products?q=${encodeURIComponent(query)}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 text-xs font-semibold text-[#007832] hover:bg-emerald-50 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  Xem tất cả kết quả cho &ldquo;{query}&rdquo;
                </Link>
              </li>
            </ul>
          )}

          {!isLoading && hasSearched && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Không tìm thấy sản phẩm</p>
              <p className="text-xs text-gray-400">
                Thử tìm với từ khoá khác hoặc{" "}
                <Link href="/products" onClick={() => setIsOpen(false)} className="text-[#007832] hover:underline font-medium">
                  xem tất cả sản phẩm
                </Link>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const NAV_LINKS = [
  { name: "Trang chủ", path: "/" },
  { name: "Sản phẩm", path: "/products" },
  { name: "Nhà vườn", path: "/farmers" },
  { name: "Câu chuyện", path: "/about" },
  { name: "Doanh nghiệp", path: "/b2b", badge: "Sắp ra mắt" },
];

export default function Header({ session }: { session: any }) {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { cart, totalItems, clearCart } = useCart();
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.image || null);
  const [displayName, setDisplayName] = useState(
    session?.user?.name || session?.user?.email?.split("@")[0],
  );

  useEffect(() => {
    setMounted(true);

    if (session?.user?.email) {
      fetch("/api/store/account/profile/avatar")
        .then((res) => res.json())
        .then((data) => {
          if (data.anh_dai_dien) setAvatarUrl(data.anh_dai_dien);
          if (data.ho_ten) setDisplayName(data.ho_ten);
        })
        .catch(() => {});
    }

    const handleAvatarUpdate = (event: any) => setAvatarUrl(event.detail);
    window.addEventListener("update-avatar", handleAvatarUpdate);
    const handleNameUpdate = (event: any) => setDisplayName(event.detail);
    window.addEventListener("update-name", handleNameUpdate);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("update-avatar", handleAvatarUpdate);
      window.removeEventListener("update-name", handleNameUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [session]);

  // Đóng user menu khi chuyển trang
  useEffect(() => { setUserMenuOpen(false); }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Top bar */}
      <div className="hidden lg:block bg-[#16a34a] text-white text-xs overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-8 flex items-center justify-between">
          <span className="text-green-100 font-medium tracking-wide flex items-center gap-3">
            <span>📍 Đặt tại Đà Nẵng</span>
            <span className="opacity-30">·</span>
            <span>🥬 Rau tươi giao nội thành 2 giờ</span>
            <span className="opacity-30">·</span>
            <span>📦 Đặc sản miền Trung ship toàn quốc</span>
          </span>
          <div className="flex items-center gap-5 text-green-100">
            <span>Hotline: <span className="text-white font-semibold">1900 1234</span></span>
            <span className="opacity-30">|</span>
            <Link href="/b2b" className="hover:text-white transition-colors text-green-200">
              Bán hàng cùng chúng tôi →
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white shadow-md shadow-black/5 py-0"
            : "bg-white border-b border-gray-100 py-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center h-16 gap-4">

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 flex-shrink-0 group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#007832] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-black text-[#007832] tracking-tight whitespace-nowrap">
                  Verdant Curator
                </span>
                <span className="text-[9px] text-gray-400 font-medium tracking-widest uppercase">
                  Fresh · Organic · Đà Nẵng
                </span>
              </div>
            </Link>

            {/* Nav */}
            <nav className="hidden lg:flex items-center gap-1 flex-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`relative flex items-center gap-1 px-2.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                    isActive(link.path)
                      ? "text-[#007832] bg-green-50"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                  {link.badge && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-100 text-amber-700 leading-none tracking-wide">
                      {link.badge}
                    </span>
                  )}
                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#007832] rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <SearchDropdown />

              {/* Cart */}
              <div className="relative group">
                <Link
                  href="/cart"
                  className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150 ${
                    totalItems > 0
                      ? "bg-green-50 text-[#007832] hover:bg-green-100"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  <ShoppingCart size={20} data-cart-icon />
                  {mounted && totalItems > 0 && (
                    <span
                      data-cart-badge
                      className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm"
                    >
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </Link>

                {/* Cart hover preview */}
                <div className="absolute top-full right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50 p-4 mt-2">
                  {cart.length > 0 ? (
                    <>
                      <p className="text-[10px] font-black text-gray-300 mb-3 uppercase tracking-widest">
                        Sản phẩm mới thêm
                      </p>
                      <div className="space-y-3 max-h-[280px] overflow-y-auto">
                        {cart.slice(-4).reverse().map((item, index) => (
                          <div key={index} className="flex gap-3 items-center">
                            <img
                              src={item.anh_chinh}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                              alt=""
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{item.ten_san_pham}</p>
                              <p className="text-[11px] text-[#007832] font-bold mt-0.5">
                                {item.gia_ban.toLocaleString()}đ × {item.so_luong}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-50 flex gap-2">
                        <Link
                          href="/cart"
                          className="flex-1 bg-[#007832] text-white text-center py-2.5 rounded-xl text-xs font-bold hover:bg-[#006028] transition-colors"
                        >
                          Xem giỏ hàng ({totalItems})
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center py-6 gap-2">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-gray-300" />
                      </div>
                      <p className="text-xs text-gray-400 font-medium">Giỏ hàng trống</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-6 bg-gray-200 mx-1" />

              {/* User section */}
              {!mounted ? (
                <div className="h-9 w-28 rounded-xl bg-gray-100 animate-pulse" />
              ) : session ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(o => !o)}
                    className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-150"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white text-xs font-black overflow-hidden shadow-sm">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{session.user?.email?.[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-none">
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
                        Tài khoản
                      </span>
                      <span className="text-xs font-bold text-gray-800 truncate max-w-[80px] mt-0.5">
                        {displayName}
                      </span>
                    </div>
                    <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ml-0.5 ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 w-64 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 z-50 overflow-hidden mt-2">
                      {/* User info card */}
                      <div className="px-4 py-3.5 bg-gradient-to-br from-green-50 to-emerald-50 border-b border-green-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white text-sm font-black overflow-hidden shadow">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <span>{session.user?.email?.[0].toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{displayName}</p>
                            <p className="text-[11px] text-gray-400 truncate max-w-[150px]">{session.user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="p-2">
                        <Link
                          href="/account/profile"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-[#007832] hover:bg-green-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <User size={15} className="text-gray-500" />
                          </div>
                          Hồ sơ cá nhân
                        </Link>
                        <Link
                          href="/account/orders"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-[#007832] hover:bg-green-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package size={15} className="text-gray-500" />
                          </div>
                          Đơn hàng của tôi
                        </Link>
                        <Link
                          href="/account/addresses"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-[#007832] hover:bg-green-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <MapPin size={15} className="text-gray-500" />
                          </div>
                          Địa chỉ giao hàng
                        </Link>
                        <Link
                          href="/account/change-password"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-[#007832] hover:bg-green-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ShieldCheck size={15} className="text-gray-500" />
                          </div>
                          Đổi mật khẩu
                        </Link>
                      </div>

                      <div className="px-2 pb-2">
                        <button
                          onClick={() => { clearCart(); signOut({ callbackUrl: "/" }); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                            <LogOut size={15} className="text-red-400" />
                          </div>
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-[#007832] hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 whitespace-nowrap"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-1.5 bg-[#007832] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[#006028] hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
                  >
                    <User size={15} fill="white" />
                    Đăng ký
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
