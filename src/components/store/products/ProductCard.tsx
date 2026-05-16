"use client";

import React, { useRef, useState } from "react";
import { Star, ShoppingCart, Eye } from "lucide-react";
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

export default function ProductCard({ product, onQuickView }: { product: ProductData; onQuickView?: (id: number) => void }) {
  const { addToCart } = useCart();
  const [btnState, setBtnState] = useState<"idle" | "flying" | "done">("idle");
  const imgRef = useRef<HTMLDivElement>(null);

  const discountPercent =
    product.gia_goc && product.gia_goc > product.gia_ban
      ? Math.round(((product.gia_goc - product.gia_ban) / product.gia_goc) * 100)
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (btnState !== "idle") return;

    const imgRect = imgRef.current?.getBoundingClientRect();
    const cartIcon = document.querySelector<HTMLElement>("[data-cart-icon]");
    const cartRect = cartIcon?.getBoundingClientRect();

    // Thêm vào giỏ ngay lập tức (không chờ animation)
    addToCart({
      id: product.id,
      ma_bien_the: product.ma_bien_the || product.id,
      ten_san_pham: product.ten_san_pham,
      anh_chinh: product.anh_chinh,
      gia_ban: product.gia_ban,
      phan_loai: "Mặc định",
      so_luong: 1,
    });

    if (!imgRect || !cartRect) {
      setBtnState("done");
      setTimeout(() => setBtnState("idle"), 1500);
      return;
    }

    setBtnState("flying");

    // Tạo viên bi tại tâm ảnh sản phẩm
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

    // Animate X: ease power2.inOut (mượt đều)
    gsap.to(ball, {
      left: endX,
      duration,
      ease: "power2.inOut",
    });

    // Animate Y riêng: bay lên trước (power2.in ngược) rồi xuống (power2.in)
    // Trick: dùng keyframes với 2 đoạn
    const arcPeak = Math.min(startY, endY) - 100; // đỉnh parabol
    gsap.timeline()
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

    // Scale + opacity trong suốt hành trình
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

        // Bounce icon giỏ hàng
        if (cartIcon) {
          gsap.timeline()
            .to(cartIcon, { scale: 1.35, duration: 0.12, ease: "power2.out" })
            .to(cartIcon, { scale: 1, duration: 0.25, ease: "elastic.out(1.3, 0.4)" });
        }

        // Bounce badge số lượng
        const badge = document.querySelector<HTMLElement>("[data-cart-badge]");
        if (badge) {
          gsap.fromTo(
            badge,
            { scale: 0.5 },
            { scale: 1, duration: 0.3, ease: "back.out(3)" },
          );
        }

        setBtnState("done");
        setTimeout(() => setBtnState("idle"), 1500);
      },
    });
  };

  const btnLabel =
    btnState === "flying" ? "Đang thêm..." :
    btnState === "done"   ? "✓ Đã thêm" :
    "Thêm vào giỏ";

  return (
    <div
      style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", transition: "box-shadow 0.2s, transform 0.2s" }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        const qvBtn = (e.currentTarget as HTMLDivElement).querySelector(".quick-view-btn") as HTMLElement;
        if (qvBtn) { qvBtn.style.opacity = "1"; qvBtn.style.transform = "translateY(0)"; }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.transform = "none";
        const qvBtn = (e.currentTarget as HTMLDivElement).querySelector(".quick-view-btn") as HTMLElement;
        if (qvBtn) { qvBtn.style.opacity = "0"; qvBtn.style.transform = "translateY(4px)"; }
      }}
    >
      <Link href={`/products/${product.id}`} style={{ textDecoration: "none", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Ảnh */}
        <div ref={imgRef} style={{ position: "relative", height: 200, overflow: "hidden", background: "#f3f4f6" }}>
          <img
            src={product.anh_chinh}
            alt={product.ten_san_pham}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {discountPercent > 0 && (
            <span style={{ position: "absolute", top: 10, left: 10, background: "#dc2626", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4 }}>
              -{discountPercent}%
            </span>
          )}
          {onQuickView && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product.id); }}
              className="quick-view-btn"
              style={{
                position: "absolute",
                bottom: 10,
                right: 10,
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#fff",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transform: "translateY(4px)",
                transition: "opacity 0.2s, transform 0.2s, background 0.15s",
              }}
              title="Xem nhanh"
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#16a34a"; (e.currentTarget.querySelector("svg") as SVGElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget.querySelector("svg") as SVGElement).style.color = "#374151"; }}
            >
              <Eye style={{ width: 16, height: 16, color: "#374151", transition: "color 0.15s" }} />
            </button>
          )}
        </div>

        {/* Thông tin */}
        <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#16a34a" }}>{product.xuat_xu}</span>
          </div>

          <p style={{ fontSize: 14, fontWeight: 500, color: "#111827", margin: "0 0 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {product.ten_san_pham}
          </p>

          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#16a34a" }}>
              {product.gia_ban.toLocaleString("vi-VN")}đ
            </span>
            {product.gia_goc && product.gia_goc > product.gia_ban && (
              <span style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through" }}>
                {product.gia_goc.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>

          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: "auto" }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} style={{ width: 13, height: 13, fill: i < Math.floor(product.danh_gia) ? "#fbbf24" : "#e5e7eb", color: i < Math.floor(product.danh_gia) ? "#fbbf24" : "#e5e7eb" }} />
            ))}
            <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 2 }}>({product.luot_danh_gia})</span>
          </div>
        </div>
      </Link>

      {/* Nút thêm vào giỏ */}
      <button
        onClick={handleAddToCart}
        disabled={btnState !== "idle"}
        style={{
          width: "100%", height: 36,
          background: btnState === "done" ? "#dcfce7" : "#f0fdf4",
          color: btnState === "done" ? "#15803d" : "#16a34a",
          border: "none", borderTop: "1px solid #bbf7d0",
          fontSize: 13, fontWeight: 500,
          cursor: btnState !== "idle" ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          flexShrink: 0,
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={e => {
          if (btnState === "idle") {
            (e.currentTarget as HTMLButtonElement).style.background = "#16a34a";
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
          }
        }}
        onMouseLeave={e => {
          if (btnState === "idle") {
            (e.currentTarget as HTMLButtonElement).style.background = "#f0fdf4";
            (e.currentTarget as HTMLButtonElement).style.color = "#16a34a";
          }
        }}
      >
        <ShoppingCart style={{ width: 13, height: 13 }} />
        {btnLabel}
      </button>
    </div>
  );
}
