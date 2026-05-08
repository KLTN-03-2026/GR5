"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Mail,
  Truck,
  BadgeCheck,
  RefreshCw,
  MapPin,
  Filter,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

// ── delivery type: "fresh" | "dry" | "regional"
const CATEGORIES_FRESH = [
  {
    id: "rau-cu",
    name: "Rau củ",
    sub: "Tươi hái mỗi sáng",
    image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400",
  },
  {
    id: "trai-cay",
    name: "Trái cây tươi",
    sub: "Tươi nguyên cành",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400",
  },
  {
    id: "rau-mam",
    name: "Rau mầm",
    sub: "Trồng sạch, thu hàng ngày",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
  },
  {
    id: "nam-tuoi",
    name: "Nấm tươi",
    sub: "Thu hoạch hàng ngày",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
  },
  {
    id: "rau-thom",
    name: "Rau thơm",
    sub: "Nguyên bó, thơm tự nhiên",
    image: "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400",
  },
];

const CATEGORIES_DRY = [
  {
    id: "mam-kho",
    name: "Mắm & Đặc sản",
    sub: "Miền Trung chính gốc",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400",
  },
  {
    id: "gao-ngu-coc",
    name: "Gạo & Ngũ cốc",
    sub: "Gạo sạch, không chất bảo quản",
    image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "gia-vi-kho",
    name: "Tiêu & Gia vị",
    sub: "Nguyên chất, không pha trộn",
    image: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400",
  },
  {
    id: "hat-dieu-ca-phe",
    name: "Cà phê & Hạt",
    sub: "Rang xay tươi theo tuần",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
  },
  {
    id: "hai-san-kho",
    name: "Hải sản khô",
    sub: "Phơi nắng tự nhiên",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400",
  },
];

// delivery badge per product
const PRODUCTS = [
  { id: "1",  name: "Chuối Laba Chín Tự Nhiên",       origin: "Vùng trồng: Đà Lạt",           harvest: "Thu hoạch: Thứ 2 & Thứ 5",  priceKg: 45000,  unit: "kg",      tag: "Tươi hôm nay", supplied: "Không dùng thuốc bảo quản",        delivery: "fresh",    category: "Trái cây", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600" },
  { id: "2",  name: "Mật Ong Rừng Tràm Nguyên Chất",  origin: "Vùng trồng: Gia Lai",           harvest: "Thu hoạch: Hàng tháng",     priceKg: 285000, unit: "kg",      tag: "Phổ biến",     supplied: "100% nguyên chất, có kiểm định",   delivery: "dry",      category: "Hữu cơ",  image: "https://images.unsplash.com/photo-1587049352847-4d4b126a3109?w=600" },
  { id: "3",  name: "Trà Nõn Tôm Thượng Hạng",        origin: "Vùng trồng: Thái Nguyên",       harvest: "Thu hoạch: Hàng tuần",      priceKg: 120000, unit: "100g",    tag: undefined,      supplied: "Hữu cơ, không hóa chất",           delivery: "dry",      category: "Hữu cơ",  image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600" },
  { id: "4",  name: "Dâu Tây Giống Nhật Premium",     origin: "Vùng trồng: Đà Lạt",           harvest: "Thu hoạch: Thứ 3 & Thứ 6", priceKg: 185000, unit: "500g",    tag: "Mới về",       supplied: "Đạt chuẩn GlobalGAP",              delivery: "fresh",    category: "Trái cây", image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600" },
  { id: "5",  name: "Rau Muống Hữu Cơ Đà Lạt",       origin: "Vùng trồng: Đà Lạt",           harvest: "Thu hoạch: Hàng ngày",      priceKg: 28000,  unit: "kg",      tag: "Tươi hôm nay", supplied: "Canh tác hữu cơ, không thuốc sâu", delivery: "fresh",    category: "Rau củ",  image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600" },
  { id: "6",  name: "Gạo ST25 Đặc Sản Sóc Trăng",    origin: "Vùng trồng: Sóc Trăng",         harvest: "Thu hoạch: Tháng 11 & 5",  priceKg: 38000,  unit: "kg",      tag: "Đang có sẵn",  supplied: "Đạt chuẩn VietGAP",                delivery: "dry",      category: "Hữu cơ",  image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600" },
  { id: "7",  name: "Bơ Booth Tây Nguyên Cỡ Lớn",    origin: "Vùng trồng: Đắk Lắk",          harvest: "Thu hoạch: Thứ 2, 4, 6",   priceKg: 65000,  unit: "kg",      tag: undefined,      supplied: "Truy xuất nguồn gốc QR",           delivery: "fresh",    category: "Trái cây", image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600" },
  { id: "8",  name: "Nấm Đùi Gà Tươi Loại 1",        origin: "Vùng trồng: Lâm Đồng",          harvest: "Thu hoạch: Hàng ngày",      priceKg: 95000,  unit: "500g",    tag: "Tươi hôm nay", supplied: "Đạt chuẩn HACCP",                  delivery: "fresh",    category: "Rau củ",  image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600" },
  { id: "9",  name: "Mắm Ruốc Huế Thượng Hạng",      origin: "Vùng trồng: Thừa Thiên Huế",    harvest: "Sản xuất: Hàng tháng",      priceKg: 65000,  unit: "hũ 500g", tag: "Đặc sản",      supplied: "Công thức truyền thống 3 đời",      delivery: "regional", category: "Hữu cơ",  image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600" },
  { id: "10", name: "Cà Chua Beef Đà Lạt VietGAP",   origin: "Vùng trồng: Đà Lạt",           harvest: "Thu hoạch: Thứ 2, 4, 6",   priceKg: 42000,  unit: "kg",      tag: "Mới về",       supplied: "Đạt chuẩn VietGAP",                delivery: "fresh",    category: "Rau củ",  image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600" },
  { id: "11", name: "Tiêu Đen Phú Quốc Loại 1",      origin: "Vùng trồng: Phú Quốc",          harvest: "Thu hoạch: Tháng 3–5",      priceKg: 210000, unit: "100g",    tag: undefined,      supplied: "Đặc sản có chứng nhận GI",          delivery: "dry",      category: "Hữu cơ",  image: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=600" },
  { id: "12", name: "Bánh Khô Mè Bà Liễu Hội An",    origin: "Vùng trồng: Hội An",            harvest: "Sản xuất: Hàng tuần",       priceKg: 85000,  unit: "hộp",     tag: "Đặc sản",      supplied: "Công thức Hội An truyền thống",     delivery: "regional", category: "Hữu cơ",  image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600" },
];

const FILTER_TABS = ["Tất cả", "Rau củ", "Trái cây", "Hữu cơ"];

// delivery badge config
const DELIVERY_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  fresh:    { label: "🥬 Giao 2h · Nội thành ĐN", bg: "#dcfce7", color: "#15803d" },
  dry:      { label: "📦 Ship toàn quốc",           bg: "#fff7ed", color: "#c2410c" },
  regional: { label: "🚚 Giao 4–6h · Vùng lân cận", bg: "#eff6ff", color: "#1d4ed8" },
};

export default function HomePage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tất cả");

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/admin/content");
        if (res.ok) {
          const data = await res.json();
          const activeBanners = data.filter((b: any) => b.dang_hoat_dong);
          if (activeBanners.length > 0) setBanners(activeBanners);
        }
      } catch {}
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  const activeBanner =
    banners.length > 0
      ? banners[currentSlide]
      : {
          tieu_de: "Tinh Hoa Nông Sản Việt",
          duong_dan_anh:
            "https://images.unsplash.com/photo-1542838132-92c53300491e?q=100&w=1600&auto=format&fit=crop",
        };

  return (
    <main className="grow">

      {/* ── SECTION 1: HERO ── */}
      <section className="px-6 mb-0">
        <div className="max-w-7xl mx-auto relative h-[600px] rounded-[2.5rem] overflow-hidden group bg-gray-900">
          {(banners.length > 0 ? banners : [activeBanner]).map((banner, index) => (
            <div
              key={banner.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            >
              <img
                src={banner.duong_dan_anh}
                alt={banner.tieu_de}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10000ms] scale-100 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

              <div className="relative h-full flex flex-col justify-center px-12 md:px-24 max-w-3xl">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={index === currentSlide ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold tracking-wide mb-6 self-start"
                >
                  <MapPin className="w-3 h-3" /> Đặt tại Đà Nẵng
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={index === currentSlide ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl md:text-7xl font-headline font-extrabold text-white leading-[1.1] mb-6"
                >
                  {banner.tieu_de === "Tinh Hoa Nông Sản Việt" ? (
                    <>
                      Tinh Hoa{" "}
                      <span className="text-emerald-400 italic font-medium">Nông Sản</span>{" "}
                      Việt
                    </>
                  ) : (
                    banner.tieu_de
                  )}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={index === currentSlide ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-white/90 font-body leading-relaxed mb-6 max-w-xl"
                >
                  Rau củ quả tươi sạch Đà Nẵng — giao nội thành 2 giờ.<br />
                  Đặc sản miền Trung ship toàn quốc.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={index === currentSlide ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-4 mb-8"
                >
                  <Link href="/products">
                    <button className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold shadow-xl shadow-emerald-900/50 hover:bg-emerald-700 transition-all active:scale-95">
                      Mua rau tươi hôm nay
                    </button>
                  </Link>
                  <Link href="/products">
                    <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all">
                      Xem đặc sản ship toàn quốc
                    </button>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={index === currentSlide ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ delay: 0.45 }}
                  className="flex flex-wrap gap-x-6 gap-y-2"
                >
                  {[
                    { icon: "📍", text: "Đặt tại Đà Nẵng" },
                    { icon: "🥬", text: "Tươi nội thành — 2 giờ" },
                    { icon: "📦", text: "Đặc sản khô — toàn quốc" },
                    { icon: "🔄", text: "Đổi trả 24h" },
                  ].map((s) => (
                    <span key={s.text} className="flex items-center gap-1.5 text-white/80 text-xs font-semibold">
                      <span>{s.icon}</span>{s.text}
                    </span>
                  ))}
                </motion.div>
              </div>
            </div>
          ))}

          {banners.length > 1 && (
            <>
              <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? "w-8 bg-emerald-500" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="py-3 px-6 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-x-10 gap-y-2">
          {[
            { icon: MapPin,    label: "Đặt tại Đà Nẵng" },
            { icon: Truck,     label: "Tươi nội thành — giao trong 2 giờ" },
            { icon: Package,   label: "Đặc sản khô — ship toàn quốc 2–3 ngày" },
            { icon: RefreshCw, label: "Đổi trả trong 24h nếu không đạt chất lượng" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-[#374151] text-[13px] font-medium">
              <Icon className="w-4 h-4 text-[#16a34a] shrink-0" />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── SECTION 2: CATEGORIES — 2 nhóm ── */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-gray-900 mb-4">
            Khám phá theo danh mục
          </h2>
          <div className="w-24 h-1 bg-emerald-600 mx-auto rounded-full" />
        </div>

        {/* Nhóm 1: Tươi */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-base font-semibold text-[#111827]">Tươi mỗi ngày · Giao nội thành Đà Nẵng</h3>
            <span style={{ background: "#dcfce7", color: "#15803d", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99 }}>
              Giao 2 giờ
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8">
            {CATEGORIES_FRESH.map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.id}`}>
                <div className="group flex flex-col items-center gap-3 text-center cursor-pointer">
                  <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden p-1 border-2 border-transparent group-hover:border-emerald-500 transition-all duration-500">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="group-hover:opacity-100 opacity-0 transition-opacity absolute bottom-[-2px] left-1/2 -translate-x-1/2 bg-[#16a34a] text-white text-[10px] font-medium whitespace-nowrap px-2.5 py-0.5 rounded-full pointer-events-none z-10">
                      Xem ngay →
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[15px] text-gray-900">{cat.name}</h3>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">{cat.sub}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#e5e7eb] mb-12" />

        {/* Nhóm 2: Khô / Đặc sản */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-base font-semibold text-[#111827]">Đặc sản miền Trung · Ship toàn quốc</h3>
            <span style={{ background: "#fff7ed", color: "#c2410c", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99 }}>
              Toàn quốc
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8">
            {CATEGORIES_DRY.map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.id}`}>
                <div className="group flex flex-col items-center gap-3 text-center cursor-pointer">
                  <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden p-1 border-2 border-transparent group-hover:border-orange-400 transition-all duration-500">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="group-hover:opacity-100 opacity-0 transition-opacity absolute bottom-[-2px] left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-medium whitespace-nowrap px-2.5 py-0.5 rounded-full pointer-events-none z-10">
                      Xem ngay →
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[15px] text-gray-900">{cat.name}</h3>
                    <p className="text-xs text-orange-500 font-medium mt-0.5">{cat.sub}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: CÁCH GIAO HÀNG ── */}
      <section className="py-14 px-6 bg-[#f9fafb] border-t border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-[#111827] mb-2">
              Chúng tôi giao hàng như thế nào?
            </h2>
            <p className="text-sm text-[#6b7280]">Tuỳ loại sản phẩm, chúng tôi có 3 phương thức giao hàng khác nhau</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🛵</div>
              <h3 className="text-base font-semibold text-[#111827] mb-2">Giao trong 2 giờ</h3>
              <p className="text-[13px] text-[#6b7280] leading-relaxed mb-4">
                Rau củ quả tươi hái buổi sáng, giao đến tay bạn trước bữa trưa.
                Phủ toàn bộ nội thành Đà Nẵng.
              </p>
              <span className="inline-block text-[12px] font-medium px-3 py-1 rounded-full" style={{ background: "#dcfce7", color: "#15803d" }}>
                Miễn phí ship từ 150.000đ
              </span>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-base font-semibold text-[#111827] mb-2">Giao 4–6 giờ</h3>
              <p className="text-[13px] text-[#6b7280] leading-relaxed mb-4">
                Phục vụ Hội An, Điện Bàn, Tam Kỳ và các huyện lân cận Đà Nẵng.
                Đơn từ 200.000đ.
              </p>
              <span className="inline-block text-[12px] font-medium px-3 py-1 rounded-full" style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                Phí ship 15.000–25.000đ
              </span>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">✈️</div>
              <h3 className="text-base font-semibold text-[#111827] mb-2">2–3 ngày toàn quốc</h3>
              <p className="text-[13px] text-[#6b7280] leading-relaxed mb-4">
                Đặc sản khô miền Trung đóng gói chân không, giao tận nơi toàn quốc
                qua đối tác vận chuyển uy tín.
              </p>
              <span className="inline-block text-[12px] font-medium px-3 py-1 rounded-full" style={{ background: "#fff7ed", color: "#c2410c" }}>
                Phí ship theo vùng
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: BENTO ── */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Left: About */}
          <div className="col-span-12 lg:col-span-8 bg-emerald-50/50 rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col justify-between min-h-[420px] border border-emerald-100">
            <div className="absolute top-0 right-0 w-1/2 h-full">
              <img
                src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800"
                alt="Organic"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-emerald-50/95" />
            </div>
            <div className="relative z-10 max-w-xs">
              <p className="text-emerald-600 font-medium tracking-widest text-xs uppercase mb-4">Cam kết của chúng tôi</p>
              <h2 className="text-4xl font-headline font-bold text-gray-900 mb-6 leading-tight">
                Từ vườn đến<br />bàn ăn của bạn
              </h2>
              <p className="text-gray-600 font-body mb-8">
                Chúng tôi làm việc trực tiếp với nông dân địa phương để mang đến
                rau củ quả tươi sạch nhất, không qua trung gian, giá tốt hơn
                cho gia đình bạn.
              </p>
              <Link href="/products">
                <span className="inline-flex items-center bg-white text-emerald-600 px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-emerald-600 hover:text-white transition-all text-sm group cursor-pointer">
                  Mua ngay
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
            <div className="relative z-10 flex flex-wrap gap-10 mt-auto pt-4">
              <div>
                <p className="text-3xl font-headline font-extrabold text-emerald-600">0%</p>
                <p className="text-sm text-gray-500 leading-snug">Hóa chất độc hại<br /><span className="text-xs text-gray-400">Không dư lượng thuốc sâu</span></p>
              </div>
              <div>
                <p className="text-3xl font-headline font-extrabold text-emerald-600">100%</p>
                <p className="text-sm text-gray-500 leading-snug">Truy xuất nguồn gốc<br /><span className="text-xs text-gray-400">Quét QR code trên bao bì</span></p>
              </div>
              <div>
                <p className="text-3xl font-headline font-extrabold text-emerald-600">200+</p>
                <p className="text-sm text-gray-500 leading-snug">Nông sản tươi mỗi ngày<br /><span className="text-xs text-gray-400">Cập nhật theo mùa vụ</span></p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="flex-1 bg-emerald-700 rounded-[2.5rem] p-8 text-white flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10">
                <p className="text-emerald-200 text-[10px] font-semibold uppercase tracking-widest mb-2">Ưu đãi cho đơn đầu tiên</p>
                <h3 className="text-2xl font-headline font-bold mb-3">Giao miễn phí<br />trong 2 giờ</h3>
                <p className="text-emerald-100 text-sm mb-5 leading-relaxed">
                  Đặt hàng trước 10h sáng — nhận rau tươi tận cửa buổi trưa.
                  Đổi trả trong 24h nếu không hài lòng.
                </p>
                <div className="flex flex-col gap-2 mb-6">
                  {[
                    { label: "Đơn từ 150.000đ", note: "Miễn phí nội thành ĐN" },
                    { label: "Giao trước 12h", note: "Đặt trước 10h sáng", highlight: true },
                    { label: "Nhận buổi tối", note: "Đặt trước 3h chiều" },
                  ].map((tier) => (
                    <div key={tier.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: tier.highlight ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)", borderRadius: 10, padding: "6px 12px", border: tier.highlight ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent" }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{tier.label}</span>
                      <span style={{ fontSize: 11, color: "#a7f3d0" }}>{tier.note}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/products">
                <button className="relative z-10 bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold w-full active:scale-95 transition-all text-sm">
                  Đặt hàng ngay
                </button>
              </Link>
              <div className="absolute -top-4 -right-4 opacity-10 transition-transform group-hover:scale-125">
                <Truck className="w-32 h-32" />
              </div>
            </div>

            <div className="flex-1 bg-amber-50 rounded-[2.5rem] p-8 flex flex-col justify-between relative group border border-amber-100">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium uppercase tracking-widest text-amber-700 bg-amber-100 px-3 py-1 rounded-full">Mùa vụ tháng 5</span>
                  <span className="text-xs text-gray-400 font-medium">Số lượng có hạn</span>
                </div>
                <h3 className="text-2xl font-headline font-bold mb-2 text-gray-900">Trái Cây Mùa Hè</h3>
                <p className="text-gray-600 text-sm font-medium mb-4">Xoài cát Hoà Lộc, Vải thiều Lục Ngạn — thu hoạch đầu mùa</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between"><span>Xoài cát Hoà Lộc</span><span className="font-semibold">78.000đ/kg</span></div>
                  <div className="flex justify-between bg-amber-100 px-2 py-0.5 rounded"><span className="font-semibold text-amber-800">Vải thiều Lục Ngạn</span><span className="font-bold text-amber-800">45.000đ/kg</span></div>
                  <div className="flex justify-between"><span>Nhãn lồng Hưng Yên</span><span className="font-semibold text-emerald-700">35.000đ/kg</span></div>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-[11px] text-gray-400 mb-3">Giao trong ngày · Còn hàng đến cuối tuần</p>
                <Link href="/products">
                  <button style={{ width: "100%", background: "#16a34a", color: "#fff", padding: "10px 0", borderRadius: 12, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer" }}>
                    Đặt mua ngay
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: PRODUCT GRID ── */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-end mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-headline font-bold text-gray-900">
              Nông sản tươi theo mùa — Hôm nay
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              Thu hoạch mỗi ngày · Giao nội thành Đà Nẵng trong 2 giờ · Đặc sản ship toàn quốc
            </p>
          </div>
          <Link href="/products">
            <button className="text-emerald-600 font-semibold hover:underline flex items-center gap-2 group text-sm">
              Xem tất cả <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 24, padding: "10px 14px", background: "#f9fafb", borderRadius: 12, border: "1px solid #e5e7eb" }}>
          <Filter className="w-4 h-4 text-gray-400" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Lọc theo:</span>
          {FILTER_TABS.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              style={{ fontSize: 12, fontWeight: 600, color: activeFilter === f ? "#fff" : "#374151", background: activeFilter === f ? "#16a34a" : "#fff", border: `1px solid ${activeFilter === f ? "#16a34a" : "#d1d5db"}`, borderRadius: 8, padding: "5px 14px", cursor: "pointer", transition: "all 0.15s" }}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.filter(p =>
            activeFilter === "Tất cả" ||
            p.category === activeFilter ||
            (activeFilter === "Hữu cơ" && p.supplied?.toLowerCase().includes("hữu cơ"))
          ).map((product) => {
            const badge = DELIVERY_BADGE[product.delivery];
            return (
              <motion.div
                key={product.id}
                whileHover={{ y: -6 }}
                className="bg-white p-4 rounded-3xl group hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-300 border border-gray-100"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-50">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

                  {/* delivery badge — top left */}
                  <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ background: badge.bg, color: badge.color, fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 4 }}>
                      {badge.label}
                    </span>
                    {product.tag && (
                      <span style={{ background: "#16a34a", color: "#fff", fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                        {product.tag}
                      </span>
                    )}
                  </div>

                  <button
                    style={{ position: "absolute", bottom: 12, right: 12, background: "#16a34a", color: "#fff", padding: "8px 14px", borderRadius: 20, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", opacity: 0, transition: "opacity 0.2s, transform 0.2s", transform: "translateY(6px)" }}
                    className="group-hover:opacity-100 group-hover:translate-y-0"
                  >
                    Thêm vào giỏ
                  </button>
                </div>
                <div className="px-1">
                  <p className="text-xs text-gray-400 mb-0.5">{product.origin}</p>
                  <p className="text-[10px] text-gray-400 mb-1">{product.harvest}</p>
                  <h4 className="font-headline font-bold text-gray-900 mb-2 line-clamp-1 text-sm">{product.name}</h4>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-base font-bold text-emerald-600">
                      {product.priceKg.toLocaleString("vi-VN")}đ{" "}
                      <span className="text-xs text-gray-400 font-normal">/{product.unit}</span>
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#059669", fontWeight: 600 }}>
                    <BadgeCheck className="w-3 h-3" />
                    {product.supplied}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 6: NEWSLETTER ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-[#f0fdf4] rounded-[3rem] p-12 text-center border border-emerald-100 relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Mail className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-headline font-bold text-gray-900 mb-4">
              Đăng ký nhận thực đơn rau sạch hàng tuần
            </h2>
            <p className="text-gray-600 font-body mb-4 max-w-xl mx-auto">
              Gợi ý món ăn theo mùa, kèm danh sách rau củ tươi cần mua —
              miễn phí mỗi thứ Hai.
            </p>
            <p className="text-emerald-700 font-medium text-sm mb-8 flex items-center justify-center gap-2">
              🌿 Hơn 5.000 gia đình Đà Nẵng đang nhận thực đơn này mỗi tuần
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn..."
                className="flex-1 bg-white border border-emerald-100 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm text-sm"
              />
              <button className="bg-emerald-600 text-white font-medium px-8 py-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 whitespace-nowrap">
                Đăng ký miễn phí
              </button>
            </form>
            <p className="mt-6 text-xs text-gray-400 italic">Chúng tôi cam kết bảo mật thông tin. Không spam.</p>
          </div>
        </div>
      </section>

      <style>{`
        .group:hover .group-hover\\:opacity-100 { opacity: 1 !important; }
        .group:hover .group-hover\\:translate-y-0 { transform: translateY(0) !important; }
        @media (max-width: 768px) { .min-h-\\[420px\\] { min-height: 360px; } }
      `}</style>
    </main>
  );
}
