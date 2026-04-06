'use client'

import React, { useState, useEffect } from 'react';
import {  ShoppingCart, User, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Bên trái: Logo & Nav */}
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-bold text-[#007832] tracking-tighter">
            Verdant Curator
          </Link>
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-sm font-bold text-[#007832] border-b-2 border-[#007832] pb-1">Trang chủ</Link>
            <Link href="/products" className="text-sm font-semibold text-gray-500 hover:text-[#007832] transition-colors">Sản phẩm</Link>
            <Link href="/farmers" className="text-sm font-semibold text-gray-500 hover:text-[#007832] transition-colors">Nhà vườn</Link>
            <Link href="/about" className="text-sm font-semibold text-gray-500 hover:text-[#007832] transition-colors">Câu chuyện</Link>
          </nav>
        </div>

        {/* Bên phải: Search, Cart & Auth */}
        <div className="flex items-center gap-2 md:gap-6">
          
          {/* Icons Group */}
          <div className="flex items-center gap-2 border-r border-gray-200 pr-4 mr-2">
            <button className="p-2 text-gray-600 hover:bg-emerald-50 hover:text-[#007832] rounded-full transition-all">
             
            </button>
            <Link href="/cart" className="p-2 text-gray-600 hover:bg-emerald-50 hover:text-[#007832] rounded-full transition-all relative">
              <ShoppingCart size={20} />
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#007832] text-white text-[10px] font-bold flex items-center justify-center rounded-full">0</span>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block text-sm font-bold text-gray-600 hover:text-[#007832] transition-colors px-2">
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
  );
}