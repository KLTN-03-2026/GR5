"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Star, ChevronRight, ShoppingCart, Minus, Plus, CheckCircle2,
  Leaf, Truck, Gift, MessageSquare, Send, ThumbsUp, User,
  ImageIcon, ChevronLeft, Filter, AlertCircle, LogIn, Heart, Bell,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/CartContext";
import toast from "react-hot-toast";

/* ────────── helpers ────────── */
function Stars({ value, size = 14, interactive = false, onChange }: {
  value: number; size?: number; interactive?: boolean; onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = interactive ? (hovered || value) >= i : value >= i;
        return (
          <Star key={i}
            style={{ width: size, height: size, cursor: interactive ? "pointer" : "default",
              fill: filled ? "#e11d48" : "#e5e7eb", color: filled ? "#e11d48" : "#e5e7eb",
              transition: "all 0.1s" }}
            onMouseEnter={() => interactive && setHovered(i)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onChange?.(i)}
          />
        );
      })}
    </div>
  );
}

function Avatar({ name, src, size = 38 }: { name: string; src?: string | null; size?: number }) {
  const colors = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#06b6d4"];
  const bg = colors[(name?.charCodeAt(0) || 0) % colors.length];
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, flexShrink: 0 }}>
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: "none", border: "none", padding: "2px 0", cursor: "pointer" }}>
      <span style={{ fontSize: 12, color: "#6b7280", width: 6 }}>{star}</span>
      <Star style={{ width: 11, height: 11, fill: "#e11d48", color: "#e11d48", flexShrink: 0 }} />
      <div style={{ flex: 1, height: 7, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#e11d48", borderRadius: 99, transition: "width 0.5s" }} />
      </div>
      <span style={{ fontSize: 11, color: "#9ca3af", width: 24, textAlign: "right" }}>{count}</span>
    </button>
  );
}

/* ────────── main component ────────── */
export default function ProductDetailClient({
  product, relatedProducts, relatedSectionTitle, isLoggedIn, daMua,
}: {
  product: any; relatedProducts: any[]; relatedSectionTitle?: string; isLoggedIn: boolean; daMua: boolean;
}) {
  const { data: sessionData } = useSession();
  const hasVariants = product?.bien_the?.length > 0;
  const [selectedVariant, setSelectedVariant] = useState(hasVariants ? product.bien_the[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(product?.hinh_anh?.[0] || "");
  const { addToCart } = useCart();

  /* ── back-in-stock notification state ── */
  const [bisFormOpen, setBisFormOpen] = useState(false);
  const [bisEmail, setBisEmail] = useState("");
  const [bisLoading, setBisLoading] = useState(false);
  const [bisSuccess, setBisSuccess] = useState(false);

  useEffect(() => {
    if (sessionData?.user?.email) {
      setBisEmail(sessionData.user.email);
    }
  }, [sessionData]);

  // Reset back-in-stock success state when variant changes
  useEffect(() => {
    setBisSuccess(false);
    setBisFormOpen(false);
  }, [selectedVariant]);

  /* ── review state ── */
  const [reviews, setReviews]         = useState<any[]>(product.danh_sach_danh_gia || []);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [reviewPage, setReviewPage]   = useState(1);
  const [reviewTotal, setReviewTotal] = useState(product.luot_danh_gia || 0);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [starFilter, setStarFilter]   = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);

  /* ── favorite state ── */
  const [isFav, setIsFav]           = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`/api/store/account/favorites?page=1&limit=200`)
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.data) setIsFav(json.data.some((f: any) => f.id === product.id));
      })
      .catch(() => {});
  }, [isLoggedIn, product.id]);

  const handleToggleFav = async () => {
    if (!isLoggedIn) { toast.error("Vui lòng đăng nhập để lưu yêu thích"); return; }
    setFavLoading(true);
    try {
      if (isFav) {
        const res = await fetch(`/api/store/account/favorites?ma_san_pham=${product.id}`, { method: "DELETE" });
        if (res.ok) {
          setIsFav(false);
          toast("Đã xoá khỏi yêu thích", { icon: "🗑️" });
        } else {
          const d = await res.json().catch(() => ({}));
          toast.error(d.error || "Xoá thất bại");
        }
      } else {
        const res = await fetch("/api/store/account/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ma_san_pham: product.id }),
        });
        if (res.ok || res.status === 409) {
          setIsFav(true);
          toast.success("Đã thêm vào yêu thích ♥");
        } else {
          const d = await res.json().catch(() => ({}));
          toast.error(d.error || "Lưu thất bại");
        }
      }
    } catch (e) {
      console.error("toggleFav error", e);
      toast.error("Có lỗi xảy ra");
    } finally { setFavLoading(false); }
  };

  /* ── form state ── */
  const [formOpen, setFormOpen]     = useState(false);
  const [formStar, setFormStar]     = useState(0);
  const [formText, setFormText]     = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const LIMIT = 5;

  /* ── fetch reviews ── */
  const fetchReviews = useCallback(async (page = 1, star = 0) => {
    setReviewLoading(true);
    try {
      const params = new URLSearchParams({
        product_id: product.id.toString(), page: page.toString(), limit: LIMIT.toString(),
        ...(star ? { star: star.toString() } : {}),
      });
      const res = await fetch(`/api/store/reviews?${params}`);
      if (res.ok) {
        const json = await res.json();
        setReviews(json.data || []);
        setReviewTotal(json.meta?.total || 0);
        setReviewTotalPages(json.meta?.totalPages || 1);
        if (json.stats) setReviewStats(json.stats);
      }
    } catch { /* silent */ }
    finally { setReviewLoading(false); }
  }, [product.id]);

  useEffect(() => {
    // load stats on mount (keep SSR reviews for page 1)
    fetchReviews(1, 0);
  }, [fetchReviews]);

  const handleStarFilter = (s: number) => {
    const next = starFilter === s ? 0 : s;
    setStarFilter(next); setReviewPage(1);
    fetchReviews(1, next);
  };

  const handlePageChange = (p: number) => {
    setReviewPage(p);
    fetchReviews(p, starFilter);
    document.getElementById("review-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ── submit review ── */
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStar) { toast.error("Vui lòng chọn số sao!"); return; }
    setFormSubmitting(true);
    try {
      const res = await fetch("/api/store/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ma_san_pham: product.id, so_sao: formStar, noi_dung: formText }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Cảm ơn bạn đã đánh giá!");
        setFormOpen(false); setFormStar(0); setFormText("");
        fetchReviews(1, 0); setStarFilter(0); setReviewPage(1);
      } else {
        toast.error(data.error || "Gửi thất bại!");
      }
    } catch { toast.error("Lỗi hệ thống!"); }
    finally { setFormSubmitting(false); }
  };

  /* ── add to cart ── */
  const handleQuantity = (t: "minus" | "plus") => {
    if (t === "minus" && quantity > 1) setQuantity(q => q - 1);
    if (t === "plus" && quantity < 99) setQuantity(q => q + 1);
  };

  const currentStock = selectedVariant?.ton_kho ?? product.bien_the?.reduce((s: number, bt: any) => s + (bt.ton_kho || 0), 0) ?? 0;

  const handleAddToCart = () => {
    if (hasVariants && !selectedVariant) return;
    if (currentStock <= 0) { toast.error("Sản phẩm đã hết hàng"); return; }
    addToCart({
      id: product.id,
      ma_bien_the: selectedVariant?.id || product.bien_the?.[0]?.id || product.id,
      ten_san_pham: product.ten_san_pham,
      gia_ban: selectedVariant?.gia_ban ?? product.gia_ban,
      anh_chinh: mainImage,
      phan_loai: selectedVariant?.ten_bien_the || "Mặc định",
      so_luong: quantity,
    });
    toast.success(<div>Đã thêm <b>{product.ten_san_pham}</b> vào giỏ!</div>, { duration: 3000 });

    // fly animation
    const imgEl = document.getElementById("main-product-image");
    const cartEl = document.querySelector("[data-cart-icon]") as HTMLElement | null;
    if (imgEl && cartEl) {
      const ir = imgEl.getBoundingClientRect(), cr = cartEl.getBoundingClientRect();
      const clone = imgEl.cloneNode(true) as HTMLImageElement;
      Object.assign(clone.style, {
        position: "fixed", top: `${ir.top}px`, left: `${ir.left}px`,
        width: `${ir.width}px`, height: `${ir.height}px`,
        borderRadius: "1rem", objectFit: "cover", zIndex: "9999",
        pointerEvents: "none", transition: "all 0.75s ease-in-out",
      });
      document.body.appendChild(clone);
      void clone.offsetWidth;
      Object.assign(clone.style, {
        top: `${cr.top + 5}px`, left: `${cr.left + 5}px`,
        width: "20px", height: "20px", opacity: "0", borderRadius: "50%",
      });
      setTimeout(() => clone.remove(), 800);
    }
  };

  /* ── back-in-stock subscribe ── */
  const handleBackInStockSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bisEmail || !bisEmail.includes("@")) {
      toast.error("Vui lòng nhập email hợp lệ");
      return;
    }
    setBisLoading(true);
    try {
      const res = await fetch("/api/store/back-in-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant?.id || null,
          email: bisEmail,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBisSuccess(true);
        setBisFormOpen(false);
        toast.success(data.message || "Đăng ký thành công!");
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setBisLoading(false);
    }
  };

  const avg = reviewStats?.avg ?? product.danh_gia ?? 0;
  const total = reviewStats?.total ?? reviewTotal;
  const byStar = reviewStats?.byStar ?? {};

  /* ═══════════════════════════ RENDER ═══════════════════════════ */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 font-sans bg-[#FDFEFC]">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-4 py-2 text-sm">
        <Link href="/" className="text-gray-500 hover:text-emerald-600 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link href="/products" className="text-gray-500 hover:text-emerald-600 transition-colors">Sản phẩm</Link>
        {product?.danh_muc && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href={`/products?category=${product.danh_muc.id}`} className="text-gray-500 hover:text-emerald-600 transition-colors">
              {product.danh_muc.ten_danh_muc}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-800 font-medium truncate max-w-[200px]">{product?.ten_san_pham}</span>
      </div>

      {/* ── Product info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div className="flex flex-col gap-4">
          <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <img id="main-product-image" src={mainImage} alt={product?.ten_san_pham} className="w-full h-full object-cover" />
          </div>
          {product?.hinh_anh?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.hinh_anh.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setMainImage(img)}
                  className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden transition-all ${mainImage === img ? "ring-2 ring-emerald-700 ring-offset-2" : "opacity-60 hover:opacity-100"}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col pt-2">
          <span className="inline-block bg-[#E8F3EC] text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded uppercase tracking-wider mb-4 w-max">
            ĐẶC SẢN {product?.xuat_xu?.toUpperCase() || "VIỆT NAM"}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">{product?.ten_san_pham}</h1>

          {/* Rating summary */}
          <div className="flex items-center gap-2 mb-6">
            <Stars value={Math.floor(avg)} size={16} />
            <span className="text-sm font-bold text-gray-700">{Number(avg).toFixed(1)}</span>
            <span className="text-sm text-gray-400">({total} đánh giá)</span>
            {total > 0 && (
              <a href="#review-section" className="text-xs text-emerald-600 hover:underline ml-1">Xem tất cả</a>
            )}
          </div>

          {/* Price */}
          <div className="flex items-end gap-4 mb-6">
            <span className="text-3xl font-extrabold text-emerald-700">
              {(selectedVariant?.gia_ban ?? product?.gia_ban)?.toLocaleString("vi-VN")}đ
            </span>
            {(selectedVariant?.gia_goc ?? product?.gia_goc) && (
              <span className="text-sm text-gray-400 line-through mb-1.5">
                {(selectedVariant?.gia_goc ?? product?.gia_goc)?.toLocaleString("vi-VN")}đ
              </span>
            )}
            {(selectedVariant?.gia_goc ?? product?.gia_goc) && (
              <span className="text-xs font-bold text-white bg-rose-500 px-2 py-0.5 rounded mb-1.5">
                -{Math.round((1 - (selectedVariant?.gia_ban ?? 0) / (selectedVariant?.gia_goc ?? 1)) * 100)}%
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed text-sm mb-6 whitespace-pre-wrap">
            {product?.mo_ta || "Chưa có mô tả cho sản phẩm này."}
          </p>

          <div className="flex items-center gap-6 mb-6 text-sm font-bold text-gray-700">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Chứng nhận VietGAP</div>
            <div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-600" /> Canh tác hữu cơ</div>
          </div>

          {/* Trạng thái tồn kho */}
          {(() => {
            const tonKho = selectedVariant?.ton_kho ?? product.bien_the?.reduce((s: number, bt: any) => s + (bt.ton_kho || 0), 0) ?? 0;
            if (tonKho <= 0) return (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg w-max">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-bold text-red-600">Hết hàng</span>
              </div>
            );
            if (tonKho <= 10) return (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg w-max">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-amber-600">Chỉ còn {tonKho} sản phẩm</span>
              </div>
            );
            return (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg w-max">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">Còn hàng</span>
              </div>
            );
          })()}

          {hasVariants && (
            <div className="mb-6">
              <h3 className="font-bold text-xs uppercase tracking-widest text-gray-500 mb-3">Chọn phân loại</h3>
              <div className="flex flex-wrap gap-3">
                {product.bien_the.map((bt: any) => (
                  <button key={bt.id} onClick={() => setSelectedVariant(bt)}
                    disabled={bt.ton_kho <= 0}
                    className={`px-5 py-2 rounded-lg font-bold text-sm border transition-all ${selectedVariant?.id === bt.id ? "border-emerald-700 bg-[#E8F3EC] text-emerald-800" : bt.ton_kho <= 0 ? "border-gray-200 text-gray-300 cursor-not-allowed line-through" : "border-gray-200 text-gray-600 hover:border-emerald-300"}`}>
                    {bt.don_vi_tinh || "Mặc định"}{bt.ten_bien_the ? ` · ${bt.ten_bien_the}` : ""}{bt.ton_kho <= 0 ? " (Hết)" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center justify-between bg-gray-100/50 border border-gray-200 rounded-lg w-32 h-12 px-1">
              <button onClick={() => handleQuantity("minus")} className="w-10 h-10 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 transition-all"><Minus className="w-4 h-4" /></button>
              <span className="font-bold text-gray-900">{quantity}</span>
              <button onClick={() => handleQuantity("plus")} className="w-10 h-10 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 transition-all"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={handleAddToCart} disabled={currentStock <= 0}
              className={`flex-1 h-12 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${currentStock <= 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#065F46] hover:bg-emerald-800 text-white"}`}>
              <ShoppingCart className="w-4 h-4" /> {currentStock <= 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
            </button>
            <button
              onClick={handleToggleFav}
              disabled={favLoading}
              title={isFav ? "Xoá khỏi yêu thích" : "Thêm vào yêu thích"}
              style={{
                width: 48, height: 48, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px solid ${isFav ? "#e11d48" : "#e5e7eb"}`,
                borderRadius: 10,
                background: isFav ? "#fff1f2" : "#fff",
                cursor: favLoading ? "wait" : "pointer",
                transition: "all 0.2s",
              }}
            >
              <Heart
                size={20}
                fill={isFav ? "#e11d48" : "none"}
                color={isFav ? "#e11d48" : "#9ca3af"}
                style={{ transition: "all 0.2s", transform: isFav ? "scale(1.15)" : "scale(1)" }}
              />
            </button>
          </div>

          {/* ── Back-in-stock notification ── */}
          {currentStock <= 0 && (
            <div className="mt-4">
              {bisSuccess ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-green-700">
                    Chúng tôi sẽ thông báo khi sản phẩm có hàng trở lại!
                  </span>
                </div>
              ) : !bisFormOpen ? (
                <button
                  onClick={() => setBisFormOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 font-bold text-sm hover:bg-amber-100 transition-all"
                >
                  <Bell className="w-4 h-4" />
                  Thông báo khi có hàng
                </button>
              ) : (
                <form
                  onSubmit={handleBackInStockSubscribe}
                  className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <Bell className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <input
                    type="email"
                    value={bisEmail}
                    onChange={(e) => setBisEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    required
                    className="flex-1 h-9 px-3 text-sm border border-amber-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
                  />
                  <button
                    type="submit"
                    disabled={bisLoading}
                    className="h-9 px-4 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {bisLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        Đăng ký
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBisFormOpen(false)}
                    className="h-9 px-2 text-amber-600 hover:text-amber-800 text-sm font-medium"
                  >
                    Hủy
                  </button>
                </form>
              )}
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-3">Miễn phí vận chuyển cho đơn hàng từ 500.000đ</p>
        </div>
      </div>

      {/* ── Reviews + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="review-section">

        {/* ══ REVIEW SECTION ══ */}
        <div className="lg:col-span-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-700" />
              <h2 className="text-xl font-extrabold text-gray-900">Đánh giá từ khách hàng</h2>
            </div>
            {daMua && !formOpen && (
              <button onClick={() => setFormOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, height: 38, padding: "0 16px", background: "#065F46", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
                <Star style={{ width: 14, height: 14 }} /> Viết đánh giá
              </button>
            )}
          </div>

          {/* Rating overview card */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "20px 24px", marginBottom: 20, display: "flex", gap: 32, alignItems: "center" }}>
            {/* Big number */}
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <p style={{ fontSize: 48, fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1 }}>{Number(avg).toFixed(1)}</p>
              <Stars value={Math.round(avg)} size={18} />
              <p style={{ fontSize: 12, color: "#9ca3af", margin: "6px 0 0" }}>{total} đánh giá</p>
            </div>
            {/* Bars */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
              {[5, 4, 3, 2, 1].map(s => (
                <button key={s} onClick={() => handleStarFilter(s)}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: starFilter === s ? "#f0fdf4" : "none", border: starFilter === s ? "1px solid #bbf7d0" : "1px solid transparent", borderRadius: 6, padding: "2px 6px", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 12, color: "#6b7280", width: 6 }}>{s}</span>
                  <Star style={{ width: 11, height: 11, fill: "#e11d48", color: "#e11d48", flexShrink: 0 }} />
                  <div style={{ flex: 1, height: 7, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${total > 0 ? Math.round(((byStar[s] || 0) / total) * 100) : 0}%`, background: "#e11d48", borderRadius: 99, transition: "width 0.5s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#9ca3af", width: 22, textAlign: "right" }}>{byStar[s] || 0}</span>
                </button>
              ))}
            </div>
            {/* Summary tags */}
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {avg >= 4.5 && <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 99, background: "#dcfce7", color: "#16a34a" }}>⭐ Được yêu thích</span>}
              {total >= 10 && <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 99, background: "#eef2ff", color: "#6366f1" }}>💬 {total}+ đánh giá</span>}
              {(byStar[5] || 0) / Math.max(total, 1) >= 0.7 && <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 99, background: "#fef9c3", color: "#d97706" }}>🏆 Chất lượng cao</span>}
            </div>
          </div>

          {/* Filter active indicator */}
          {starFilter > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>Đang lọc:</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "#fef2f2", color: "#e11d48" }}>
                {starFilter} sao <Star style={{ width: 11, height: 11, fill: "#e11d48" }} />
              </span>
              <button onClick={() => { setStarFilter(0); setReviewPage(1); fetchReviews(1, 0); }}
                style={{ fontSize: 12, color: "#6b7280", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                Xóa lọc
              </button>
            </div>
          )}

          {/* ── Write review form ── */}
          {formOpen && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#065F46", margin: "0 0 16px" }}>✍️ Chia sẻ trải nghiệm của bạn</h3>
              <form onSubmit={handleSubmitReview}>
                {/* Star picker */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
                    Đánh giá sao <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Stars value={formStar} size={32} interactive onChange={setFormStar} />
                    {formStar > 0 && (
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#e11d48" }}>
                        {["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"][formStar]}
                      </span>
                    )}
                  </div>
                </div>
                {/* Text */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Nội dung nhận xét</label>
                  <textarea value={formText} onChange={e => setFormText(e.target.value)} rows={4}
                    placeholder="Chia sẻ về chất lượng, mùi vị, đóng gói... để giúp người mua tiếp theo nhé!"
                    style={{ width: "100%", border: "1px solid #d1fae5", borderRadius: 8, fontSize: 13, padding: "10px 12px", outline: "none", resize: "vertical", lineHeight: 1.6, background: "#fff", boxSizing: "border-box" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#065F46")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#d1fae5")} />
                  <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "right", margin: "3px 0 0" }}>{formText.length}/500</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={() => { setFormOpen(false); setFormStar(0); setFormText(""); }}
                    style={{ flex: 1, height: 40, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 500, color: "#374151", cursor: "pointer" }}>
                    Hủy
                  </button>
                  <button type="submit" disabled={formSubmitting || !formStar}
                    style={{ flex: 2, height: 40, border: "none", borderRadius: 8, background: !formStar ? "#e5e7eb" : "#065F46", fontSize: 13, fontWeight: 700, color: !formStar ? "#9ca3af" : "#fff", cursor: !formStar ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {formSubmitting
                      ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                      : <><Send style={{ width: 13, height: 13 }} /> Gửi đánh giá</>}
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CTA for non-buyers / guests */}
          {!daMua && !formOpen && (
            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <AlertCircle style={{ width: 18, height: 18, color: "#9ca3af", flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                {!isLoggedIn ? (
                  <><Link href="/login" style={{ color: "#065F46", fontWeight: 700, textDecoration: "none" }}>Đăng nhập</Link> và mua sản phẩm để có thể viết đánh giá</>
                ) : (
                  "Bạn cần mua và nhận sản phẩm này để có thể viết đánh giá"
                )}
              </p>
            </div>
          )}

          {/* ── Review list ── */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden" }}>
            {reviewLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#065F46", animation: "spin 0.7s linear infinite" }} />
              </div>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <MessageSquare style={{ width: 36, height: 36, color: "#d1d5db", margin: "0 auto 10px" }} />
                <p style={{ fontSize: 14, color: "#374151", fontWeight: 500, margin: "0 0 4px" }}>
                  {starFilter ? `Không có đánh giá ${starFilter} sao` : "Chưa có đánh giá nào"}
                </p>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                  {starFilter ? "Thử xem đánh giá khác" : "Hãy là người đầu tiên đánh giá sản phẩm này!"}
                </p>
              </div>
            ) : (
              <>
                {reviews.map((r, idx) => (
                  <div key={r.id} style={{ padding: "20px 24px", borderBottom: idx < reviews.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    {/* Row 1: avatar + name + star + date */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Avatar name={r.ten_nguoi_dung} src={r.anh_dai_dien} size={42} />
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>{r.ten_nguoi_dung}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                            <Stars value={r.so_sao} size={13} />
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "#dcfce7", color: "#16a34a" }}>Đã mua hàng</span>
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                        {r.ngay_tao ? new Date(r.ngay_tao).toLocaleDateString("vi-VN") : ""}
                      </span>
                    </div>

                    {/* Content */}
                    {r.noi_dung && (
                      <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, margin: "0 0 10px 54px" }}>{r.noi_dung}</p>
                    )}

                    {/* Review images */}
                    {r.anh_danh_gia?.length > 0 && (
                      <div style={{ display: "flex", gap: 8, marginLeft: 54, marginBottom: 10, flexWrap: "wrap" }}>
                        {r.anh_danh_gia.map((src: string, i: number) => (
                          <img key={i} src={src} alt="" style={{ width: 68, height: 68, borderRadius: 8, objectFit: "cover", border: "1px solid #e5e7eb", cursor: "pointer" }} />
                        ))}
                      </div>
                    )}

                    {/* Admin reply */}
                    {r.phan_hoi_admin && (
                      <div style={{ marginLeft: 54, marginTop: 4, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #d1fae5", borderLeft: "3px solid #065F46", borderRadius: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#065F46", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Phản hồi từ Cửa hàng</p>
                        <p style={{ fontSize: 13, color: "#15803d", margin: 0, lineHeight: 1.5 }}>{r.phan_hoi_admin}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Pagination */}
                {reviewTotalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "14px 0", borderTop: "1px solid #f3f4f6" }}>
                    <button onClick={() => handlePageChange(reviewPage - 1)} disabled={reviewPage === 1}
                      style={{ width: 32, height: 32, borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", cursor: reviewPage === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: reviewPage === 1 ? "#d1d5db" : "#374151" }}>
                      <ChevronLeft style={{ width: 14, height: 14 }} />
                    </button>
                    {Array.from({ length: reviewTotalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => handlePageChange(p)}
                        style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${p === reviewPage ? "#065F46" : "#e5e7eb"}`, background: p === reviewPage ? "#065F46" : "#fff", color: p === reviewPage ? "#fff" : "#374151", fontSize: 13, fontWeight: p === reviewPage ? 700 : 400, cursor: "pointer" }}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => handlePageChange(reviewPage + 1)} disabled={reviewPage === reviewTotalPages}
                      style={{ width: 32, height: 32, borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", cursor: reviewPage === reviewTotalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: reviewPage === reviewTotalPages ? "#d1d5db" : "#374151" }}>
                      <ChevronRight style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ══ SIDEBAR ══ */}
        <div className="lg:col-span-4 space-y-5">
          {/* Shipping info */}
          <div className="bg-[#F4F8F4] p-5 rounded-2xl border border-emerald-50">
            <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-4">
              <Truck className="w-4 h-4" /> Thông tin vận chuyển
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between border-b border-emerald-100/50 pb-2">
                <span>Nội thành Đà Nẵng:</span>
                <span className="font-bold text-gray-900">2 - 4 giờ</span>
              </div>
              <div className="flex justify-between border-b border-emerald-100/50 pb-2">
                <span>Khu vực ngoại thành:</span>
                <span className="font-bold text-gray-900">1 - 2 ngày</span>
              </div>
              <div className="flex justify-between">
                <span>Đổi trả:</span>
                <span className="font-bold text-gray-900">Trong 24h</span>
              </div>
            </div>
          </div>

          {/* Gift */}
          <div className="bg-[#F4F8F4] p-5 rounded-2xl border border-emerald-50 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-emerald-900 mb-2">Gói Quà Tặng</h3>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">Chúng tôi cung cấp dịch vụ đóng gói giỏ quà cao cấp cho các dịp lễ Tết.</p>
              <button className="text-xs font-bold text-[#065F46] hover:underline flex items-center gap-1">
                Tìm hiểu thêm <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <Gift className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-100/50" />
          </div>

          {/* Related products - compact sidebar view */}
          {relatedProducts?.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">
                {relatedSectionTitle || "Sản phẩm liên quan"}
              </h3>
              <div className="space-y-4">
                {relatedProducts.slice(0, 3).map((p) => (
                  <Link href={`/products/${p.id}`} key={p.id} className="flex gap-3 group">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      <img src={p.anh_chinh} alt={p.ten_san_pham} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2">{p.ten_san_pham}</h4>
                      <p className="text-xs font-bold text-emerald-700 mt-1">{p.gia_ban.toLocaleString("vi-VN")}đ</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Full Related Products Grid Section ── */}
      {relatedProducts?.length > 0 && (
        <div className="mt-12 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-emerald-600 rounded-full" />
            <h2 className="text-xl font-extrabold text-gray-900">
              {relatedSectionTitle || "Sản phẩm liên quan"}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <Link href={`/products/${p.id}`} key={p.id}
                className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  <img src={p.anh_chinh} alt={p.ten_san_pham}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2">
                    {p.ten_san_pham}
                  </h4>
                  <p className="text-sm font-extrabold text-emerald-700">
                    {p.gia_ban.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
