"use client";

import React, { useState } from "react";
import {
  Star,
  ChevronRight,
  ShoppingCart,
  Minus,
  Plus,
  CheckCircle2,
  Leaf,
  Truck,
  Gift,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import toast from "react-hot-toast";

export default function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: any;
  relatedProducts: any[];
}) {
  const hasVariants = product?.bien_the && product.bien_the.length > 0;
  const [selectedVariant, setSelectedVariant] = useState(
    hasVariants ? product.bien_the[0] : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(
    product?.hinh_anh?.length > 0
      ? product.hinh_anh[0]
      : product?.anh_chinh || "",
  );

  const { addToCart } = useCart();

  const handleQuantity = (type: "minus" | "plus") => {
    if (type === "minus" && quantity > 1) setQuantity((q) => q - 1);
    if (type === "plus" && quantity < 99) setQuantity((q) => q + 1);
  };

  // --- HÀM ĐÃ ĐƯỢC LÀM LẠI HIỆU ỨNG BAY CỰC MƯỢT ---
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hasVariants && !selectedVariant) return;

    const finalPrice = selectedVariant
      ? selectedVariant.gia_ban
      : product.gia_ban;
    const variantName = selectedVariant
      ? selectedVariant.ten_bien_the
      : "Mặc định";

    addToCart({
      id: product.id,
      ten_san_pham: product.ten_san_pham,
      gia_ban: finalPrice,
      anh_chinh: mainImage,
      phan_loai: variantName,
      so_luong: quantity,
    });

    toast.success(
      <div>
        Đã thêm <b>{product.ten_san_pham}</b> vào giỏ!
      </div>,
      { duration: 4000 },
    );

    const imgElement = document.getElementById("main-product-image");
    const cartIcon = document.getElementById("cart-icon");

    if (imgElement && cartIcon) {
      const imgRect = imgElement.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      const clone = imgElement.cloneNode(true) as HTMLImageElement;

      // 1. Trạng thái bắt đầu (Đứng yên tại chỗ)
      clone.style.position = "fixed";
      clone.style.top = `${imgRect.top}px`;
      clone.style.left = `${imgRect.left}px`;
      clone.style.width = `${imgRect.width}px`;
      clone.style.height = `${imgRect.height}px`;
      clone.style.borderRadius = "1rem";
      clone.style.objectFit = "cover";
      clone.style.zIndex = "9999";
      clone.style.pointerEvents = "none"; // Không che chắn cú click của user
      clone.style.transition = "all 0.8s ease-in-out"; // ease-in-out làm mượt 2 đầu

      document.body.appendChild(clone);

      // 2. Bí quyết chống giật: Ép trình duyệt ghi nhận vị trí trước khi bay
      void clone.offsetWidth;

      // 3. Trạng thái kết thúc (Bay vào giỏ hàng)
      clone.style.top = `${cartRect.top + 5}px`;
      clone.style.left = `${cartRect.left + 5}px`;
      clone.style.width = "20px";
      clone.style.height = "20px";
      clone.style.opacity = "0"; // Mờ dần khi hạ cánh
      clone.style.borderRadius = "50%"; // Bo tròn thành viên bi lúc đang bay

      // 4. Xóa ảnh sau đúng 1.5s bay
      setTimeout(() => {
        clone.remove();
        cartIcon.classList.add("scale-125", "text-emerald-600");
        setTimeout(
          () => cartIcon.classList.remove("scale-125", "text-emerald-600"),
          300,
        );
      }, 1500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 font-sans bg-[#FDFEFC]">
      <div className="flex items-center text-sm text-gray-500 mb-8 font-medium">
        <Link href="/" className="hover:text-emerald-600 transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link
          href="/products"
          className="hover:text-emerald-600 transition-colors"
        >
          Sản phẩm
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-bold">{product?.ten_san_pham}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="flex flex-col gap-4">
          <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden shadow-sm relative">
            <img
              id="main-product-image"
              src={mainImage}
              alt={product?.ten_san_pham}
              className="w-full h-full object-cover"
            />
          </div>
          {product?.hinh_anh?.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.hinh_anh.map((img: string, idx: number) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden transition-all ${mainImage === img ? "ring-2 ring-emerald-700 ring-offset-2" : "opacity-70 hover:opacity-100"}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- PHẦN THÔNG TIN BÊN PHẢI --- */}
        <div className="flex flex-col pt-2">
          <span className="inline-block bg-[#E8F3EC] text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded uppercase tracking-wider mb-4 w-max">
            ĐẶC SẢN {product?.xuat_xu?.toUpperCase() || "VIỆT NAM"}
          </span>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4 font-headline">
            {product?.ten_san_pham}
          </h1>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-rose-700">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product?.danh_gia || 5) ? "fill-rose-700" : "fill-gray-200 text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({product?.luot_danh_gia || 0} đánh giá)
            </span>
          </div>

          <div className="flex items-end gap-4 mb-6">
            <span className="text-3xl font-extrabold text-emerald-700 tracking-tight">
              {(selectedVariant
                ? selectedVariant.gia_ban
                : product?.gia_ban
              )?.toLocaleString("vi-VN")}
              đ
            </span>
            {(selectedVariant ? selectedVariant.gia_goc : product?.gia_goc) && (
              <span className="text-sm text-gray-400 line-through mb-1.5 font-medium">
                {(selectedVariant
                  ? selectedVariant.gia_goc
                  : product.gia_goc
                ).toLocaleString("vi-VN")}
                đ
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed text-sm mb-6 whitespace-pre-wrap">
            {product?.mo_ta || "Chưa có mô tả cho sản phẩm này."}
          </p>

          <div className="flex items-center gap-6 mb-8 text-sm font-bold text-gray-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Chứng nhận
              VietGAP
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600" /> Canh tác hữu cơ
            </div>
          </div>

          {hasVariants && (
            <div className="mb-8">
              <h3 className="font-bold text-xs uppercase tracking-widest text-gray-500 mb-3">
                Chọn phân loại
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.bien_the.map((bt: any) => (
                  <button
                    type="button"
                    key={bt.id}
                    onClick={() => setSelectedVariant(bt)}
                    // Thêm chữ capitalize để viết hoa chữ cái đầu (ví dụ: trái -> Trái)
                    className={`px-6 py-2.5 rounded-lg font-bold text-sm border transition-all capitalize flex items-center gap-1 ${
                      selectedVariant?.id === bt.id
                        ? "border-emerald-700 bg-[#E8F3EC] text-emerald-800"
                        : "border-gray-200 text-gray-600 hover:border-emerald-300"
                    }`}
                  >
                    {/* Nếu trống sẽ hiện "Mặc định", nếu có Tên loại thì thêm dấu gạch ngang */}
                    <span>{bt.don_vi_tinh || "Mặc định"}</span>
                    {bt.ten_bien_the ? <span>- {bt.ten_bien_the}</span> : null}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-between bg-gray-100/50 border border-gray-200 rounded-lg w-32 h-12 px-1">
              <button
                type="button"
                onClick={() => handleQuantity("minus")}
                className="w-10 h-10 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-gray-900">{quantity}</span>
              <button
                type="button"
                onClick={() => handleQuantity("plus")}
                className="w-10 h-10 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 bg-[#065F46] hover:bg-emerald-800 text-white h-12 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              Thêm vào giỏ hàng
            </button>
          </div>
          <p className="text-center text-xs text-gray-400">
            Miễn phí vận chuyển cho đơn hàng từ 500.000đ
          </p>
        </div>
      </div>

      {/* --- PHẦN REVIEWS BÊN DƯỚI --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-emerald-800" />
            <h2 className="text-xl font-extrabold text-gray-900 font-headline">
              Đánh giá từ khách hàng đã mua
            </h2>
          </div>
          <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            {!product?.danh_sach_danh_gia ||
            product.danh_sach_danh_gia.length === 0 ? (
              <p className="text-gray-500 italic text-sm text-center py-4">
                Sản phẩm này chưa có đánh giá nào.
              </p>
            ) : (
              product.danh_sach_danh_gia.map((review: any, index: number) => (
                <div
                  key={review.id}
                  className={`${index !== product.danh_sach_danh_gia.length - 1 ? "border-b border-gray-100 pb-6" : ""}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E8F3EC] text-emerald-800 font-bold rounded-full flex items-center justify-center uppercase text-sm">
                        {review.ten_nguoi_dung.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">
                          {review.ten_nguoi_dung}
                        </h4>
                        <div className="flex gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < review.so_sao ? "fill-rose-700 text-rose-700" : "fill-gray-200 text-gray-200"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">Đã mua hàng</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-3 ml-13 pl-1">
                    {review.noi_dung}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#F4F8F4] p-5 rounded-2xl border border-emerald-50">
            <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-4">
              <Truck className="w-4 h-4" /> Thông tin vận chuyển
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between border-b border-emerald-100/50 pb-2">
                <span>Nội thành TPHCM:</span>
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
          <div className="bg-[#F4F8F4] p-5 rounded-2xl border border-emerald-50 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-emerald-900 mb-2">Gói Quà Tặng</h3>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                Chúng tôi cung cấp dịch vụ đóng gói giỏ quà cao cấp cho các dịp
                lễ Tết.
              </p>
              <button
                type="button"
                className="text-xs font-bold text-[#065F46] hover:underline flex items-center gap-1"
              >
                Tìm hiểu thêm <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <Gift className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-100/50" />
          </div>
          {relatedProducts?.length > 0 && (
            <div className="bg-[#FDFEFC] p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">
                Sản phẩm liên quan
              </h3>
              <div className="space-y-4">
                {relatedProducts.map((p) => (
                  <Link
                    href={`/products/${p.id}`}
                    key={p.id}
                    className="flex gap-3 group"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      <img
                        src={p.anh_chinh}
                        alt={p.ten_san_pham}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {p.ten_san_pham}
                      </h4>
                      <p className="text-xs font-bold text-emerald-700 mt-1">
                        {p.gia_ban.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
