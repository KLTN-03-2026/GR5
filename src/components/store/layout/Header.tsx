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
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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
      const res = await fetch(
        `/api/store/products?q=${encodeURIComponent(searchQuery.trim())}&limit=5`,
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const products: Product[] = Array.isArray(data)
        ? data
        : (data.data ?? []);
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
        className={`flex items-center bg-gray-50/80 px-4 py-2 rounded-full border transition-all shadow-sm ${
          isOpen
            ? "border-[#007832] bg-white ring-2 ring-[#007832]/10"
            : "border-gray-200 focus-within:border-[#007832] focus-within:bg-white"
        }`}
      >
        <button type="submit">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-[#007832] animate-spin mr-2" />
          ) : (
            <Search className="w-4 h-4 text-gray-400 mr-2 hover:text-[#007832] transition-colors" />
          )}
        </button>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          placeholder="Tìm kiếm nông sản..."
          className="bg-transparent border-none focus:ring-0 text-sm w-48 font-body outline-none text-slate-700"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-black/10 overflow-hidden z-50 min-w-[320px]">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
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
                        <img
                          src={product.anh_chinh}
                          alt={product.ten_san_pham}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                          🌿
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#007832] transition-colors">
                        {product.ten_san_pham}
                      </p>
                      {product.xuat_xu && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {product.xuat_xu}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[#007832]">
                        {product.gia_ban.toLocaleString("vi-VN")}đ
                      </p>
                      {product.don_vi && (
                        <p className="text-xs text-gray-400">
                          /{product.don_vi}
                        </p>
                      )}
                    </div>
                  </button>
                  {index < results.length - 1 && (
                    <div className="mx-4 h-px bg-gray-50" />
                  )}
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
              <div className="text-3xl mb-3">🔍</div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Không tìm thấy sản phẩm
              </p>
              <p className="text-xs text-gray-400">
                Thử tìm với từ khoá khác hoặc{" "}
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="text-[#007832] hover:underline"
                >
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

export default function Header({ session }: { session: any }) {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { cart, totalItems } = useCart();
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.image || null);
  const [displayName, setDisplayName] = useState(
    session?.user?.name || session?.user?.email?.split("@")[0],
  );
  useEffect(() => {
    setMounted(true);

    // Fetch ảnh từ DB để giữ sau reload
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
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("update-avatar", handleAvatarUpdate);
      window.removeEventListener("update-name", handleNameUpdate);
    };
  }, [session]);

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
          <div className="flex items-center gap-12">
            <Link
              href="/"
              className="text-2xl font-bold text-[#007832] tracking-tighter hover:scale-105 transition-transform"
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

          <div className="flex items-center gap-4 md:gap-6">
            <SearchDropdown />

            <div className="flex items-center border-r border-gray-200 pr-4">
              <div className="relative group pt-4 pb-4 -my-4">
                <Link
                  href="/cart"
                  className="relative p-2 text-gray-600 hover:bg-emerald-50 hover:text-[#007832] rounded-full transition-all flex"
                >
                  <ShoppingCart size={20} />
                  {mounted && totalItems > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                      {totalItems}
                    </span>
                  )}
                </Link>
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
                                className="w-10 h-10 rounded-lg object-cover"
                                alt=""
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">
                                  {item.ten_san_pham}
                                </p>
                                <p className="text-[10px] text-[#007832] font-bold">
                                  {item.gia_ban.toLocaleString()}đ x{" "}
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

            <div className="flex items-center min-w-[120px] justify-end">
              {!mounted ? (
                <div className="h-10 w-24" />
              ) : session ? (
                <div className="relative group pt-4 pb-4 -my-4">
                  <button className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 hover:bg-white hover:shadow-md transition-all">
                    <div className="w-7 h-7 bg-[#007832] rounded-full flex items-center justify-center text-white text-[10px] font-black overflow-hidden border border-emerald-200">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        session.user?.email?.[0].toUpperCase()
                      )}
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-none text-left">
                      <span className="text-[9px] font-black text-emerald-600 uppercase italic">
                        Thành viên
                      </span>
                      <span className="text-xs font-bold text-gray-700 truncate max-w-[80px]">
                        {displayName}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className="text-gray-400 group-hover:rotate-180 transition-transform"
                    />
                  </button>

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
