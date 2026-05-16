"use client";

import React, { useState, useEffect } from "react";
import { X, Star, ShoppingCart, ExternalLink, Package } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";

interface Variant {
  id: number;
  ten_bien_the: string;
  don_vi_tinh: string;
  gia_ban: number;
  gia_goc: number | null;
  ton_kho: number;
}

interface ProductDetail {
  id: number;
  ten_san_pham: string;
  mo_ta: string;
  xuat_xu: string;
  danh_muc: { id: number; ten_danh_muc: string } | null;
  hinh_anh: string[];
  anh_chinh: string;
  bien_the: Variant[];
  danh_gia: number;
  luot_danh_gia: number;
}

interface QuickViewModalProps {
  productId: number;
  onClose: () => void;
}

export default function QuickViewModal({ productId, onClose }: QuickViewModalProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [visible, setVisible] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/store/products/detail?id=${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          if (data.bien_the?.length > 0) {
            setSelectedVariant(data.bien_the[0]);
          }
        }
      } catch (err) {
        console.error("Quick view fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));
  }, [productId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleAddToCart = () => {
    if (!product) return;
    const variant = selectedVariant || product.bien_the[0];
    addToCart({
      id: product.id,
      ma_bien_the: variant?.id || product.id,
      ten_san_pham: product.ten_san_pham,
      anh_chinh: product.anh_chinh || product.hinh_anh[0] || "",
      gia_ban: variant?.gia_ban || 0,
      phan_loai: variant?.ten_bien_the || "Mặc định",
      so_luong: 1,
    });
    handleClose();
  };

  const currentPrice = selectedVariant?.gia_ban || product?.bien_the[0]?.gia_ban || 0;
  const originalPrice = selectedVariant?.gia_goc || product?.bien_the[0]?.gia_goc || null;
  const discountPercent =
    originalPrice && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: visible ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(4px)" : "blur(0px)",
        transition: "background 0.2s, backdrop-filter 0.2s",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          maxWidth: 672,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          transform: visible ? "scale(1)" : "scale(0.95)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: "sticky",
            top: 12,
            float: "right",
            marginRight: 12,
            marginTop: 12,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: "#f3f4f6",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#e5e7eb"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6"; }}
        >
          <X style={{ width: 18, height: 18, color: "#374151" }} />
        </button>

        {loading ? (
          <div style={{ padding: 64, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, border: "3px solid #e5e7eb",
              borderTopColor: "#16a34a", borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <span style={{ fontSize: 14, color: "#6b7280" }}>Đang tải...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : !product ? (
          <div style={{ padding: 64, textAlign: "center", color: "#6b7280" }}>
            Không tìm thấy sản phẩm
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "row", gap: 0 }} className="quick-view-content">
            {/* Left: Image */}
            <div style={{ width: "45%", flexShrink: 0, padding: 24 }} className="quick-view-image">
              <div style={{
                borderRadius: 12,
                overflow: "hidden",
                background: "#f9fafb",
                aspectRatio: "1",
                position: "relative",
              }}>
                <img
                  src={product.anh_chinh || product.hinh_anh[0] || ""}
                  alt={product.ten_san_pham}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {discountPercent > 0 && (
                  <span style={{
                    position: "absolute", top: 10, left: 10,
                    background: "#dc2626", color: "#fff",
                    fontSize: 12, fontWeight: 600,
                    padding: "4px 10px", borderRadius: 6,
                  }}>
                    -{discountPercent}%
                  </span>
                )}
              </div>
              {/* Thumbnail strip */}
              {product.hinh_anh.length > 1 && (
                <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto" }}>
                  {product.hinh_anh.slice(0, 4).map((img, idx) => (
                    <div key={idx} style={{
                      width: 56, height: 56, borderRadius: 8, overflow: "hidden",
                      border: "2px solid #e5e7eb", flexShrink: 0, cursor: "pointer",
                    }}>
                      <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div style={{ flex: 1, padding: "24px 24px 24px 0", display: "flex", flexDirection: "column", gap: 16 }} className="quick-view-info">
              {/* Category & Origin */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {product.danh_muc && (
                  <span style={{
                    fontSize: 11, fontWeight: 500,
                    background: "#f0fdf4", color: "#16a34a",
                    padding: "3px 10px", borderRadius: 20,
                  }}>
                    {product.danh_muc.ten_danh_muc}
                  </span>
                )}
                <span style={{
                  fontSize: 11, fontWeight: 500,
                  background: "#fef3c7", color: "#92400e",
                  padding: "3px 10px", borderRadius: 20,
                }}>
                  {product.xuat_xu}
                </span>
              </div>

              {/* Name */}
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.3 }}>
                {product.ten_san_pham}
              </h2>

              {/* Rating */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      style={{
                        width: 16, height: 16,
                        fill: i <= Math.floor(product.danh_gia) ? "#fbbf24" : "#e5e7eb",
                        color: i <= Math.floor(product.danh_gia) ? "#fbbf24" : "#e5e7eb",
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 13, color: "#6b7280" }}>
                  {product.danh_gia > 0 ? product.danh_gia : "Chưa có"} ({product.luot_danh_gia} đánh giá)
                </span>
              </div>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: "#16a34a" }}>
                  {currentPrice.toLocaleString("vi-VN")}đ
                </span>
                {originalPrice && originalPrice > currentPrice && (
                  <span style={{ fontSize: 15, color: "#9ca3af", textDecoration: "line-through" }}>
                    {originalPrice.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>

              {/* Variants */}
              {product.bien_the.length > 0 && (
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 4 }}>
                    <Package style={{ width: 14, height: 14 }} /> Phân loại:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {product.bien_the.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 8,
                            border: isSelected ? "2px solid #16a34a" : "1px solid #d1d5db",
                            background: isSelected ? "#f0fdf4" : "#fff",
                            color: isSelected ? "#16a34a" : "#374151",
                            fontSize: 13,
                            fontWeight: isSelected ? 600 : 400,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {v.ten_bien_the} ({v.don_vi_tinh})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock info */}
              {selectedVariant && (
                <span style={{ fontSize: 12, color: selectedVariant.ton_kho > 0 ? "#16a34a" : "#dc2626" }}>
                  {selectedVariant.ton_kho > 0
                    ? `Còn ${selectedVariant.ton_kho} sản phẩm`
                    : "Hết hàng"}
                </span>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, marginTop: "auto", paddingTop: 8 }}>
                <button
                  onClick={handleAddToCart}
                  disabled={selectedVariant ? selectedVariant.ton_kho === 0 : false}
                  style={{
                    flex: 1,
                    height: 44,
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "background 0.15s",
                    opacity: (selectedVariant && selectedVariant.ton_kho === 0) ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#15803d"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#16a34a"; }}
                >
                  <ShoppingCart style={{ width: 16, height: 16 }} />
                  Thêm vào giỏ
                </button>
                <Link
                  href={`/products/${product.id}`}
                  style={{
                    height: 44,
                    padding: "0 20px",
                    background: "#fff",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    textDecoration: "none",
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "#16a34a";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#16a34a";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "#d1d5db";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#374151";
                  }}
                >
                  <ExternalLink style={{ width: 14, height: 14 }} />
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .quick-view-content {
            flex-direction: column !important;
          }
          .quick-view-image {
            width: 100% !important;
            padding: 16px !important;
          }
          .quick-view-info {
            padding: 0 16px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
