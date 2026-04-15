"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ShoppingBasket,
  Star,
  ChevronRight,
  ChevronLeft,
  Plus,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data (Giữ nguyên của sếp)
const CATEGORIES = [
  {
    id: "rau-cu",
    name: "Rau củ",
    description: "Tươi mới mỗi ngày",
    image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400",
  },
  {
    id: "trai-cay",
    name: "Trái cây",
    description: "Đặc sản vùng miền",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400",
  },
  {
    id: "gao-ngu-coc",
    name: "Gạo & Ngũ cốc",
    description: "Hạt ngọc trời ban",
    image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "thuy-hai-san",
    name: "Thuỷ hải sản",
    description: "Đánh bắt tự nhiên",
    image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400",
  },
];

const PRODUCTS = [
  {
    id: "1",
    name: "Chuối Laba Chín Tự Nhiên",
    origin: "Hữu cơ • Đà Lạt",
    price: 45000,
    unit: "kg",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600",
  },
  {
    id: "2",
    name: "Mật Ong Rừng Tràm",
    origin: "Gia Lai • Nguyên chất",
    price: 285000,
    unit: "chai",
    rating: 5.0,
    tag: "Bán chạy",
    image: "https://images.unsplash.com/photo-1587049352847-4d4b126a3109?w=600",
  },
  {
    id: "3",
    name: "Trà Nõn Tôm Thượng Hạng",
    origin: "Thái Nguyên • Đặc sản",
    price: 120000,
    unit: "100g",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600",
  },
  {
    id: "4",
    name: "Dâu Tây Giống Nhật Premium",
    origin: "Đà Lạt • GlobalGAP",
    price: 185000,
    unit: "500g",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600",
  },
];

export default function HomePage() {
  // === STATE CHO BANNER SLIDER ===
  const [banners, setBanners] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Gọi API lấy Banner từ DB
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/admin/content");
        if (res.ok) {
          const data = await res.json();
          // Chỉ lấy những banner đang bật (dang_hoat_dong: true)
          const activeBanners = data.filter((b: any) => b.dang_hoat_dong);
          if (activeBanners.length > 0) {
            setBanners(activeBanners);
          }
        }
      } catch (error) {
        console.error("Lỗi tải banner:", error);
      }
    };
    fetchBanners();
  }, []);

  // Tự động chuyển Slide mỗi 5 giây
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  // Banner hiển thị hiện tại (nếu chưa có DB thì lấy banner mặc định cũ của sếp)
  const activeBanner =
    banners.length > 0
      ? banners[currentSlide]
      : {
          tieu_de: "Tinh Hoa Nông Sản Việt",
          duong_dan_anh:
            "https://images.unsplash.com/photo-1542838132-92c53300491e?q=100&w=1600&auto=format&fit=crop",
        };

  return (

      <section className="px-6 mb-16">
        <div className="max-w-7xl mx-auto relative h-[600px] rounded-[2.5rem] overflow-hidden group bg-gray-900">
          {/* Lặp qua các banner để tạo hiệu ứng Fade mượt mà */}
          {(banners.length > 0 ? banners : [activeBanner]).map(
            (banner, index) => (
              <div
                key={banner.id || index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
              >
                <img
                  src={banner.duong_dan_anh}
                  alt={banner.tieu_de}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10000ms] scale-100 group-hover:scale-110"
                />
                {/* Overlay tối mờ để chữ luôn nổi bật */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

                <div className="relative h-full flex flex-col justify-center px-12 md:px-24 max-w-3xl">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={
                      index === currentSlide
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 20 }
                    }
                    className="inline-block px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold tracking-widest uppercase mb-6 self-start"
                  >
                    Mùa Vụ Mới 2026
                  </motion.span>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={
                      index === currentSlide
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 20 }
                    }
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-headline font-extrabold text-white leading-[1.1] mb-6"
                  >
                    {/* Nếu là banner mặc định thì giữ nguyên style cũ, còn banner từ DB thì in thẳng Tiêu đề */}
                    {banner.tieu_de === "Tinh Hoa Nông Sản Việt" ? (
                      <>
                        Tinh Hoa{" "}
                        <span className="text-emerald-400 italic font-medium">
                          Nông Sản
                        </span>{" "}
                        Việt
                      </>
                    ) : (
                      banner.tieu_de
                    )}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={
                      index === currentSlide
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 20 }
                    }
                    transition={{ delay: 0.2 }}
                    className="text-lg text-white/90 font-body leading-relaxed mb-8 max-w-xl"
                  >
                    Kết nối trực tiếp từ những cánh đồng xanh ngát tới bàn ăn
                    gia đình bạn. Chất lượng thượng hạng, minh bạch nguồn gốc.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={
                      index === currentSlide
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 20 }
                    }
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-4"
                  >
                    <button className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-emerald-900/50 hover:bg-emerald-700 transition-all active:scale-95">
                      Khám phá ngay
                    </button>
                    <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all">
                      Tìm hiểu về nhà vườn
                    </button>
                  </motion.div>
                </div>
              </div>
            ),
          )}

          {/* MŨI TÊN ĐIỀU HƯỚNG SLIDER (Chỉ hiện khi có nhiều hơn 1 banner) */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* DẤU CHẤM TRÒN */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? "w-8 bg-emerald-500" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

  )}