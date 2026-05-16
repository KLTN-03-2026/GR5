"use client";

import React, { useRef, useState } from "react";
import { Star, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import gsap from "gsap";

interface ProductData {
  id: number;
  ten_san_pham: string;
  mo_ta: string;
  xuat_xu: string;
  anh_chinh: string;
  gia_ban: number;
  gia_goc: number | null;
  ma_bien_the: number | null;
  danh_gia: number;
  luot_danh_gia: number;
}

export default function CategoryProductCard({
  product,
  featured = false,
}: {
  product: ProductData;
  featured?: boolean;
}) {
  const { addToCart } = useCart();
  const [btnState, setBtnState] = useState<"idle" | "flying" | "done">("idle");
  const imgRef = useRef<HTMLDivElement>(null);

  const discountPercent =
    product.gia_goc && product.gia_goc > product.gia_ban
      ? Math.round(
          ((product.gia_goc - product.gia_ban) / product.gia_goc) * 100
        )
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (btnState !== "idle") return;

    const imgRect = imgRef.current?.getBoundingClientRect();
    const cartIcon = document.querySelector<HTMLElement>("[data-cart-icon]");
    const cartRect = cartIcon?.getBoundingClientRect();

    addToCart({
      id: product.id,
      ma_bien_the: product.ma_bien_the || product.id,
      ten_san_pham: product.ten_san_pham,
      anh_chinh: product.anh_chinh,
      gia_ban: product.gia_ban,
      phan_loai: "Mac dinh",
      so_luong: 1,
    });

    if (!imgRect || !cartRect) {
      setBtnState("done");
      setTimeout(() => setBtnState("idle"), 1500);
      return;
    }

    setBtnState("flying");

    const startX = imgRect.left + imgRect.width / 2 - 20;
    const startY = imgRect.top + imgRect.height / 2 - 20;
    const endX = cartRect.left + cartRect.width / 2 - 20;
    const endY = cartRect.top + cartRect.height / 2 - 20;

    const ball = document.createElement("div");
    ball.style.cssText = `
      position: fixed;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #16a34a url('${product.anh_chinh}') center/cover;
      z-index: 9999;
      pointer-events: none;
      left: ${startX}px;
      top: ${startY}px;
      box-shadow: 0 4px 16px rgba(22,163,74,0.5);
    `;
    document.body.appendChild(ball);

    const duration = 0.75;

    gsap.to(ball, {
      left: endX,
      duration,
      ease: "power2.inOut",
    });

    const arcPeak = Math.min(startY, endY) - 100;
    gsap
      .timeline()
      .to(ball, {
        top: arcPeak,
        duration: duration * 0.45,
        ease: "power2.out",
      })
      .to(ball, {
        top: endY,
        duration: duration * 0.55,
        ease: "power2.in",
      });

    gsap.to(ball, {
      scale: 0.25,
      duration,
      ease: "power2.in",
    });

    gsap.to(ball, {
      opacity: 0,
      duration: duration * 0.35,
      delay: duration * 0.65,
      ease: "power2.in",
      onComplete: () => {
        ball.remove();

        if (cartIcon) {
          gsap
            .timeline()
            .to(cartIcon, { scale: 1.35, duration: 0.12, ease: "power2.out" })
            .to(cartIcon, {
              scale: 1,
              duration: 0.25,
              ease: "elastic.out(1.3, 0.4)",
            });
        }

        const badge = document.querySelector<HTMLElement>("[data-cart-badge]");
        if (badge) {
          gsap.fromTo(
            badge,
            { scale: 0.5 },
            { scale: 1, duration: 0.3, ease: "back.out(3)" }
          );
        }

        setBtnState("done");
        setTimeout(() => setBtnState("idle"), 1500);
      },
    });
  };

  const btnLabel =
    btnState === "flying"
      ? "Dang them..."
      : btnState === "done"
        ? "Da them"
        : "Them vao gio";

  return (
    <div
      className={`group bg-white border rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
        featured ? "border-emerald-200 ring-1 ring-emerald-100" : "border-gray-200"
      }`}
    >
      <Link
        href={`/products/${product.id}`}
        className="flex-1 flex flex-col no-underline"
      >
        {/* Image */}
        <div
          ref={imgRef}
          className="relative h-48 overflow-hidden bg-gray-100"
        >
          <img
            src={product.anh_chinh}
            alt={product.ten_san_pham}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discountPercent > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
              -{discountPercent}%
            </span>
          )}
          {featured && (
            <span className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              Noi bat
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5 flex-1 flex flex-col">
          {/* Origin */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-xs text-emerald-600">{product.xuat_xu}</span>
          </div>

          {/* Name */}
          <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">
            {product.ten_san_pham}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-base font-bold text-emerald-600">
              {product.gia_ban.toLocaleString("vi-VN")}d
            </span>
            {product.gia_goc && product.gia_goc > product.gia_ban && (
              <span className="text-xs text-gray-400 line-through">
                {product.gia_goc.toLocaleString("vi-VN")}d
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-auto">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.danh_gia)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
            <span className="text-xs text-gray-400 ml-1">
              ({product.luot_danh_gia})
            </span>
          </div>
        </div>
      </Link>

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        disabled={btnState !== "idle"}
        className={`w-full h-10 border-t text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
          btnState === "done"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : btnState === "flying"
              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
              : "bg-emerald-50/50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white"
        }`}
      >
        <ShoppingCart className="w-3.5 h-3.5" />
        {btnLabel}
      </button>
    </div>
  );
}
