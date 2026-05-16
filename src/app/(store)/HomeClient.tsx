"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useCart } from "@/lib/CartContext";
import {
  ArrowRight,
  ChevronRight,
  Mail,
  Truck,
  ShieldCheck,
  Clock,
  Headphones,
  ShoppingCart,
  Heart,
  Star,
  Users,
  Package,
  Leaf,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import PromoPopup from "@/components/store/promo/PromoPopup";

interface Product {
  id: number;
  name: string;
  origin: string;
  category: string;
  categoryId: number;
  image: string;
  price: number;
  originalPrice: number | null;
  unit: string;
  variantId: number;
  variantName: string;
}

interface Category {
  id: number;
  name: string;
  parentId: number | null;
  productCount: number;
}

interface Banner {
  id: number;
  title: string;
  image: string;
}

interface PopupBanner {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
}

interface Props {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  popupBanners?: PopupBanner[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{count.toLocaleString("vi-VN")}{suffix}</span>;
}

export default function HomeClient({ products, categories, banners, popupBanners = [] }: Props) {
  const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tất cả");

  const handleAddToCart = useCallback((product: Product) => {
    if (!product.variantId) {
      toast.error("Sản phẩm chưa có phân loại, không thể thêm vào giỏ");
      return;
    }
    addToCart({
      id: product.id,
      ma_bien_the: product.variantId,
      ten_san_pham: product.name,
      gia_ban: product.price,
      anh_chinh: product.image,
      phan_loai: product.variantName || product.unit,
      so_luong: 1,
    });
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
  }, [addToCart]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const parentCategories = categories.filter((c) => !c.parentId && c.productCount > 0);
  const filterTabs = ["Tất cả", ...parentCategories.slice(0, 5).map((c) => c.name)];
  const filteredProducts = products.filter((p) => activeFilter === "Tất cả" || p.category === activeFilter);

  return (
    <div className="grow bg-[#f5fbf3]">

      {/* ══════ HERO ══════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f5fbf3] via-white to-[#e8f8ef]">
        {/* Background blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#0f8f4f]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-[#f5b942]/5 rounded-full blur-3xl" />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left */}
            <div>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0f8f4f]/10 text-[#0f8f4f] text-xs font-bold tracking-wide mb-6"
              >
                <Leaf className="w-3.5 h-3.5" /> Sản phẩm tươi mỗi ngày
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[2.35rem] sm:text-5xl lg:text-[56px] font-extrabold text-[#173b2f] leading-[1.1] mb-5"
              >
                Nông sản sạch<br />
                <span className="text-[#0f8f4f]">giao tận tay</span> bạn
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-[#6b7c72] text-base md:text-lg leading-relaxed mb-8 max-w-md"
              >
                Chọn thực phẩm tươi, rau củ an toàn và đặc sản địa phương
                chỉ trong vài cú click. Giao nội thành Đà Nẵng trong 2 giờ.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row sm:flex-wrap gap-3"
              >
                <Link href="/products">
                  <button className="w-full sm:w-auto justify-center bg-[#0f8f4f] text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-[#0f8f4f]/25 hover:bg-[#04713b] hover:shadow-xl hover:shadow-[#0f8f4f]/30 transition-all active:scale-95 flex items-center gap-2">
                    Mua sắm ngay <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/products">
                  <button className="w-full sm:w-auto flex items-center justify-center bg-white text-[#173b2f] px-7 py-3.5 rounded-2xl font-bold text-sm border border-[#dceee3] hover:border-[#0f8f4f] hover:text-[#0f8f4f] transition-all">
                    Khám phá danh mục
                  </button>
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-4 mt-8 sm:mt-10"
              >
                {[
                  { icon: Truck, text: "Giao 2h nội thành" },
                  { icon: ShieldCheck, text: "100% organic" },
                  { icon: Clock, text: "Đổi trả 24h" },
                ].map(({ icon: Icon, text }) => (
                  <span key={text} className="flex items-center gap-2 text-xs font-semibold text-[#6b7c72]">
                    <div className="w-7 h-7 rounded-lg bg-[#e8f8ef] flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-[#0f8f4f]" />
                    </div>
                    {text}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right — hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative w-full max-w-[420px] sm:max-w-[480px] mx-auto lg:block"
            >
              <div className="relative w-full aspect-[4/3] sm:aspect-square">
                <img
                  src={banners[currentSlide]?.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"}
                  alt="Fresh produce"
                  className="w-full h-full object-cover rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl shadow-[#0f8f4f]/10"
                />
                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="hidden sm:flex absolute -left-4 lg:-left-6 top-1/4 bg-white rounded-2xl shadow-xl shadow-black/8 p-3 items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#e8f8ef] flex items-center justify-center">
                    <Truck className="w-5 h-5 text-[#0f8f4f]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#173b2f]">Giao trong 2h</p>
                    <p className="text-[10px] text-[#6b7c72]">Nội thành Đà Nẵng</p>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="hidden sm:flex absolute -right-3 lg:-right-4 bottom-1/4 bg-white rounded-2xl shadow-xl shadow-black/8 p-3 items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#fff7e6] flex items-center justify-center">
                    <Star className="w-5 h-5 text-[#f5b942]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#173b2f]">4.9/5 đánh giá</p>
                    <p className="text-[10px] text-[#6b7c72]">Từ 2.000+ khách</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════ CATEGORIES ══════ */}
      {parentCategories.length > 0 && (
        <section className="py-12 sm:py-14 bg-[#f3faf3]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                  <p className="text-sm font-semibold text-[#0f8f4f] mb-1.5">Danh mục nổi bật</p>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#173b2f]">Khám phá nông sản tươi</h2>
                  <p className="text-[#6b7c72] text-sm mt-2">Chọn nhanh nhóm sản phẩm bạn cần cho bữa ăn hôm nay</p>
                </div>
                <Link href="/products" className="text-sm font-bold text-[#0f8f4f] hover:text-[#04713b] transition-colors">
                  Xem tất cả →
                </Link>
              </motion.div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
                {parentCategories.slice(0, 8).map((cat) => (
                  <motion.div key={cat.id} variants={fadeUp}>
                    <Link href={`/products?category=${cat.id}`}>
                      <div className="group h-full cursor-pointer rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-5 border border-[#dceee3] shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#0f8f4f]/10 hover:border-[#0f8f4f]/30">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e8f8ef] to-[#dcfce7] text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                          {getCategoryEmoji(cat.name)}
                        </div>
                        <h3 className="text-center text-[13px] font-bold text-[#173b2f] group-hover:text-[#0f8f4f] transition-colors">{cat.name}</h3>
                        <div className="mt-2.5 flex justify-center">
                          <span className="rounded-full bg-[#e8f8ef] px-2.5 py-0.5 text-[10px] font-semibold text-[#0f8f4f]">
                            {cat.productCount} sản phẩm
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ══════ DELIVERY PROMISE ══════ */}
      <section className="py-12 sm:py-16 bg-[#f5fbf3]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#173b2f] mb-3">Cam kết của chúng tôi</h2>
              <p className="text-[#6b7c72] text-sm">Mang đến trải nghiệm mua sắm tốt nhất</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[
                { icon: Truck, title: "Giao trong 2 giờ", desc: "Nội thành Đà Nẵng. Miễn phí ship cho đơn từ 150.000đ.", color: "#0f8f4f", bg: "#e8f8ef" },
                { icon: ShieldCheck, title: "Đổi trả dễ dàng", desc: "Đổi trả trong 24h nếu sản phẩm không đạt chất lượng.", color: "#1d4ed8", bg: "#eff6ff" },
                { icon: Headphones, title: "Hỗ trợ tận tâm", desc: "Đội ngũ tư vấn sẵn sàng hỗ trợ bạn mọi lúc.", color: "#7c3aed", bg: "#f5f3ff" },
              ].map((item) => (
                <motion.div key={item.title} variants={fadeUp}>
                  <div className="bg-white rounded-2xl p-6 border border-[#dceee3] hover:shadow-lg hover:shadow-[#0f8f4f]/5 transition-all duration-300 group">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      style={{ background: item.bg }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <h3 className="font-bold text-[#173b2f] text-base mb-2">{item.title}</h3>
                    <p className="text-[#6b7c72] text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════ SELLER CTA ══════ */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp}>
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#04713b] to-[#0f8f4f] p-6 sm:p-8 md:p-12">
                <div className="absolute inset-0 opacity-10">
                  <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=60" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Bạn là nhà cung cấp?</h2>
                    <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6 max-w-md">
                      Đưa sản phẩm sạch của bạn đến hàng ngàn khách hàng mỗi ngày.
                      Hệ thống quản lý đơn hàng và thanh toán tự động.
                    </p>
                    <Link href="/b2b">
                      <button className="bg-white text-[#04713b] px-6 py-3 rounded-xl font-bold text-sm hover:bg-green-50 transition-all active:scale-95 shadow-lg">
                        Đăng ký bán hàng
                      </button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { icon: Package, value: products.length, suffix: "+", label: "Sản phẩm" },
                      { icon: Users, value: 120, suffix: "+", label: "Nhà cung cấp" },
                      { icon: Star, value: 4.9, suffix: "/5", label: "Đánh giá" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                        <stat.icon className="w-5 h-5 text-white/70 mx-auto mb-2" />
                        <p className="text-xl md:text-2xl font-extrabold text-white">
                          {typeof stat.value === "number" && stat.value > 10 ? <CountUp target={stat.value} suffix={stat.suffix} /> : `${stat.value}${stat.suffix}`}
                        </p>
                        <p className="text-[11px] text-white/60 font-medium mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════ FEATURED / LATEST PRODUCTS ══════ */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#f5fbf3]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-between items-end mb-8 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#173b2f]">Sản phẩm mới nhất</h2>
                <p className="text-[#6b7c72] mt-1 text-sm">Cập nhật hàng ngày — Giao nhanh nội thành</p>
              </div>
              <Link href="/products">
                <button className="text-[#0f8f4f] font-bold hover:underline flex items-center gap-1 text-sm group">
                  Xem tất cả <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </motion.div>

            {/* Filter pills */}
            <motion.div variants={fadeUp} className="flex items-center gap-2 flex-nowrap overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible mb-8">
              {filterTabs.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 ${
                    activeFilter === f
                      ? "bg-[#0f8f4f] text-white shadow-md shadow-[#0f8f4f]/20"
                      : "bg-white text-[#6b7c72] border border-[#dceee3] hover:border-[#0f8f4f]/40 hover:text-[#0f8f4f]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </motion.div>

            {/* Product grid */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={fadeUp}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl border border-[#dceee3] overflow-hidden group hover:shadow-xl hover:shadow-[#0f8f4f]/8 transition-all duration-300"
                >
                  <Link href={`/products/${product.id}`}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#f5fbf3]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
                        loading="lazy"
                      />
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="absolute top-3 left-3 bg-[#ef4444] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.preventDefault(); }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110 shadow-sm"
                      >
                        <Heart className="w-4 h-4 text-[#6b7c72]" />
                      </button>
                    </div>
                  </Link>
                  <div className="p-3 sm:p-4">
                    <p className="text-[11px] text-[#6b7c72] font-medium mb-1">{product.origin}</p>
                    <Link href={`/products/${product.id}`}>
                      <h4 className="font-bold text-[#173b2f] text-sm line-clamp-2 min-h-[2.5rem] hover:text-[#0f8f4f] transition-colors leading-tight">{product.name}</h4>
                    </Link>
                    <div className="flex items-end justify-between gap-3 mt-3">
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-extrabold text-[#0f8f4f]">
                          {product.price.toLocaleString("vi-VN")}đ
                          <span className="text-[11px] text-[#6b7c72] font-normal ml-0.5">/{product.unit}</span>
                        </p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-[11px] text-[#6b7c72] line-through">{product.originalPrice.toLocaleString("vi-VN")}đ</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="shrink-0 w-9 h-9 rounded-full bg-[#e8f8ef] text-[#0f8f4f] flex items-center justify-center hover:bg-[#0f8f4f] hover:text-white transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-[#0f8f4f]/20"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 text-[#6b7c72]">
                <p className="text-sm">Không có sản phẩm nào trong danh mục này</p>
              </div>
            )}
          </AnimatedSection>
        </div>
      </section>

      {/* ══════ WEEKLY SUBSCRIPTION CTA ══════ */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp}>
              <div className="bg-[#e8f8ef] rounded-3xl p-6 sm:p-8 md:p-12 text-center border border-[#dceee3] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#0f8f4f]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#f5b942]/5 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-lg mx-auto">
                  <div className="w-14 h-14 bg-[#0f8f4f]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-6 h-6 text-[#0f8f4f]" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#173b2f] mb-3">
                    Nhận thực đơn rau sạch hằng tuần
                  </h2>
                  <p className="text-[#6b7c72] text-sm mb-8 leading-relaxed">
                    Gợi ý món ngon, ưu đãi mới và sản phẩm theo mùa gửi thẳng đến email của bạn.
                  </p>
                  <form
                    className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                    onSubmit={(e) => { e.preventDefault(); if (email) { toast.success("Đăng ký thành công!"); setEmail(""); } }}
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email của bạn..."
                      required
                      className="flex-1 bg-white border border-[#dceee3] rounded-xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-[#0f8f4f]/20 focus:border-[#0f8f4f] shadow-sm text-sm transition-all"
                    />
                    <button
                      type="submit"
                      className="bg-[#0f8f4f] text-white font-bold px-6 py-3.5 rounded-xl hover:bg-[#04713b] transition-all shadow-lg shadow-[#0f8f4f]/20 whitespace-nowrap text-sm active:scale-95"
                    >
                      Đăng ký
                    </button>
                  </form>
                  <p className="mt-5 text-[11px] text-[#6b7c72]">Miễn phí · Không spam · Huỷ bất cứ lúc nào</p>
                </div>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Popup khuyến mãi — 1 lần/ngày, đóng được, có lưu localStorage */}
      <PromoPopup banners={popupBanners} />
    </div>
  );
}

function getCategoryEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("rau")) return "🥬";
  if (n.includes("trái") || n.includes("quả")) return "🍎";
  if (n.includes("hữu cơ") || n.includes("organic")) return "🌿";
  if (n.includes("ngũ cốc") || n.includes("gạo")) return "🌾";
  if (n.includes("gia vị") || n.includes("tiêu")) return "🌶️";
  if (n.includes("hải sản") || n.includes("cá")) return "🦐";
  if (n.includes("thịt")) return "🥩";
  if (n.includes("sữa")) return "🥛";
  if (n.includes("nấm")) return "🍄";
  if (n.includes("đặc sản") || n.includes("mắm")) return "🏷️";
  if (n.includes("cà phê") || n.includes("trà")) return "☕";
  if (n.includes("khô") || n.includes("đồ khô")) return "📦";
  if (n.includes("mật ong")) return "🍯";
  return "🛒";
}
