"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Store,
  Eye,
  RefreshCcw,
  X,
  FileText,
  User,
  ArrowLeft,
  CloudUpload,
  Send,
  ShieldCheck,
} from "lucide-react";
import TrackingTimeline from "@/components/store/orders/TrackingTimeline";
import toast from "react-hot-toast";

const TABS = [
  { id: "ALL", label: "Tất cả" },
  { id: "CHO_XAC_NHAN", label: "Chờ duyệt" },
  { id: "CHO_XU_LY", label: "Chờ xử lý" },
  { id: "CHO_GIAO_HANG", label: "Chờ giao" },
  { id: "DANG_GIAO_HANG", label: "Đang giao" },
  { id: "DA_GIAO", label: "Đã giao" },
  { id: "DA_HUY", label: "Đã hủy" },
];

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // States cho Modals
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // States cho hủy đơn
  const [cancelOrder, setCancelOrder] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonDetail, setCancelReasonDetail] = useState("");

  // States cho form Đổi Trả
  const [returnOrder, setReturnOrder] = useState<any>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State lưu ảnh thật từ máy khách hàng
  const [returnImages, setReturnImages] = useState<any[]>([]);

  // Hàm xóa ảnh khỏi danh sách preview
  const removeImage = (id: number) =>
    setReturnImages(returnImages.filter((img) => img.id !== id));

  // Hàm xử lý upload ảnh từ thiết bị
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(), // Tạo ID duy nhất
      url: URL.createObjectURL(file), // Tạo link preview để hiển thị
      file: file, // Giữ lại file gốc để lúc submit gửi lên API (backend)
      alt: file.name,
    }));

    setReturnImages((prev) => {
      const totalImages = [...prev, ...newImages];
      if (totalImages.length > 5) {
        toast.error("Bạn chỉ được tải lên tối đa 5 ảnh minh chứng!");
        return totalImages.slice(0, 5);
      }
      return totalImages;
    });

    // Reset lại input để khách có thể chọn lại ảnh vừa xóa
    e.target.value = "";
  };

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/store/orders`);
        if (res.ok) {
          const data = await res.json();
          const ordersData = Array.isArray(data) ? data : data.orders || [];
          setOrders(ordersData);
        }
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  const filteredOrders = orders.filter((order) =>
    activeTab === "ALL" ? true : order.trang_thai === activeTab,
  );

  // 💡 HÀM MỚI: Dịch file ảnh thật sang chuỗi Base64 để gửi qua JSON
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result as string);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnReason) {
      toast.error("Vui lòng chọn lý do đổi/trả!");
      return;
    }

    setIsSubmitting(true);
    try {
      // 💡 BƯỚC QUAN TRỌNG: Chuyển tất cả ảnh khách chọn thành Base64
      const base64Images = await Promise.all(
        returnImages.map((img) => convertToBase64(img.file)),
      );

      const res = await fetch("/api/store/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: returnOrder.id,
          action: "RETURN",
          reason: `${returnReason} - ${returnDescription}`,
          images: base64Images, // 👈 ĐÃ SỬA: Gửi mảng ảnh Base64 lên Server
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Đã gửi yêu cầu đổi trả thành công! Cửa hàng sẽ liên hệ bạn sớm.");
        setReturnOrder(null);
        setReturnReason("");
        setReturnDescription("");
        setReturnImages([]);
        window.location.reload();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi kết nối máy chủ, vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderStatus = (status: string) => {
    const safeStatus = status?.toUpperCase() || "";
    const base: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, padding: "3px 10px", borderRadius: 99, fontWeight: 500 };
    switch (safeStatus) {
      case "CHO_XAC_NHAN":
        return <span style={{ ...base, background: "#fef9c3", color: "#854d0e" }}><Clock size={12} /> Chờ duyệt</span>;
      case "CHO_XU_LY":
        return <span style={{ ...base, background: "#ffedd5", color: "#9a3412" }}><Clock size={12} /> Chờ xử lý</span>;
      case "CHO_GIAO_HANG":
        return <span style={{ ...base, background: "#e0f2fe", color: "#075985" }}><ShieldCheck size={12} /> Chờ giao hàng</span>;
      case "DANG_GIAO_HANG":
        return <span style={{ ...base, background: "#dbeafe", color: "#1e40af" }}><Truck size={12} /> Đang giao</span>;
      case "DA_GIAO":
      case "HOAN_THANH":
        return <span style={{ ...base, background: "#dcfce7", color: "#15803d" }}><CheckCircle2 size={12} /> Đã giao</span>;
      case "DA_HUY":
        return <span style={{ ...base, background: "#fee2e2", color: "#991b1b" }}><XCircle size={12} /> Đã hủy</span>;
      case "YEU_CAU_DOI_TRA":
        return <span style={{ ...base, background: "#f3e8ff", color: "#6b21a8" }}><RefreshCcw size={12} /> Chờ đổi trả</span>;
      default:
        return <span style={{ ...base, background: "#f3f4f6", color: "#374151" }}><Clock size={12} /> {status}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "...";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const tabCounts: Record<string, number> = { ALL: orders.length };
  TABS.slice(1).forEach((tab) => {
    tabCounts[tab.id] = orders.filter((o) => o.trang_thai === tab.id).length;
  });

  return (
    <div className="orders-page">
      {/* Page title */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: 0, lineHeight: 1.3 }}>
          Đơn hàng của tôi
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0", fontWeight: 400 }}>
          Quản lý lịch sử mua sắm và đổi trả
        </p>
      </div>

      {/* Tabs — underline style */}
      <div className="orders-tabs">
        {TABS.map((tab) => {
          const count = tabCounts[tab.id] ?? 0;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`orders-tab${isActive ? " orders-tab--active" : ""}`}
            >
              {tab.label}
              {count > 0 && tab.id !== "ALL" && (
                <span className="orders-tab__badge">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="orders-toolbar">
        <span className="orders-toolbar__count">
          Hiển thị {filteredOrders.length} đơn hàng
        </span>
        <select className="orders-toolbar__sort">
          <option>Sắp xếp: Mới nhất</option>
          <option>Sắp xếp: Cũ nhất</option>
          <option>Giá trị cao nhất</option>
        </select>
      </div>

      {/* List */}
      <div>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#16a34a] border-t-transparent mx-auto"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <ShoppingBag size={48} color="#9ca3af" />
            <h3 className="orders-empty__title">Không tìm thấy đơn hàng</h3>
            <p className="orders-empty__sub">
              Bạn chưa có đơn hàng nào. Hãy khám phá sản phẩm ngay!
            </p>
            <Link href="/products" className="orders-empty__btn">
              Mua sắm ngay <span style={{ marginLeft: 6 }}>→</span>
            </Link>
          </div>
        ) : (
          <AnimatePresence>
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="order-card"
              >
                {/* Card header */}
                <div className="order-card__head">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="order-card__id">#{String(order.id).padStart(5, "0")}</span>
                    <span className="order-card__date">{formatDate(order.ngay_tao)}</span>
                  </div>
                  <div>{renderStatus(order.trang_thai)}</div>
                </div>

                {/* Products */}
                <div className="order-card__body">
                  {(order.chi_tiet_don_hang || []).slice(0, 2).map((item: any, idx: number) => {
                    const qty = Number(item.so_luong || 0);
                    const price = Number(item.don_gia || 0);
                    const name = item.bien_the_san_pham?.san_pham?.ten_san_pham || "Sản phẩm";
                    const img = item.bien_the_san_pham?.san_pham?.anh_chinh || "https://placehold.co/150";
                    return (
                      <div key={idx} className="order-card__product">
                        <img src={img} alt={name} className="order-card__product-img" />
                        <div className="order-card__product-info">
                          <span className="order-card__product-name">{name}</span>
                          <span className="order-card__product-qty">Số lượng: {qty}</span>
                        </div>
                        <span className="order-card__product-price">
                          {(price * qty).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Card footer */}
                <div className="order-card__foot">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>Tổng thanh toán:</span>
                    <span className="order-card__total">
                      {parseFloat(order.tong_tien?.toString() || "0").toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="order-card__btn order-card__btn--ghost"
                    >
                      <Eye size={14} /> Chi tiết
                    </button>
                    {order.trang_thai === "CHO_XAC_NHAN" && (
                      <button
                        onClick={() => setCancelOrder(order)}
                        className="order-card__btn order-card__btn--danger"
                      >
                        <XCircle size={14} /> Hủy đơn
                      </button>
                    )}
                    {order.trang_thai === "DA_GIAO" && (
                      <button
                        onClick={() => setReturnOrder(order)}
                        className="order-card__btn order-card__btn--danger"
                      >
                        <RefreshCcw size={14} /> Hoàn trả
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ========================================= */}
      {/* MEGA MODAL 1: CHI TIẾT ĐƠN HÀNG */}
      {/* ========================================= */}
      <AnimatePresence>
        {selectedOrder && (() => {
          const trangThai = selectedOrder.trang_thai || "";
          const tongTien = parseFloat(selectedOrder.tong_tien?.toString() || "0");
          const phiShip = parseFloat(selectedOrder.phi_van_chuyen?.toString() || "0");
          const tongCong = tongTien + phiShip;
          const isCancelled = trangThai === "DA_HUY";
          const isReturn = trangThai === "YEU_CAU_DOI_TRA";
          const steps = [
            { key: "CHO_XAC_NHAN", label: "Đặt hàng", icon: <ShoppingBag size={16} /> },
            { key: "CHO_XU_LY", label: "Chờ xử lý", icon: <Clock size={16} /> },
            { key: "CHO_GIAO_HANG", label: "Chờ giao", icon: <ShieldCheck size={16} /> },
            { key: "DANG_GIAO_HANG", label: "Đang giao", icon: <Truck size={16} /> },
            { key: "DA_GIAO", label: "Hoàn thành", icon: <CheckCircle2 size={16} /> },
          ];
          const stepOrder = ["CHO_XAC_NHAN", "CHO_XU_LY", "CHO_GIAO_HANG", "DANG_GIAO_HANG", "DA_GIAO"];
          const timelineStatus = trangThai === "DA_XAC_NHAN" ? "CHO_GIAO_HANG" : trangThai;
          const currentIdx = stepOrder.indexOf(timelineStatus);

          return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <FileText size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Đơn hàng #{selectedOrder.id}</h2>
                    <p className="text-xs text-gray-400">{formatDate(selectedOrder.ngay_tao)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {renderStatus(trangThai)}
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Progress Steps */}
                {!isCancelled && !isReturn && (
                  <div className="bg-gray-50 rounded-xl p-5">
                    <div className="flex items-center justify-between relative">
                      <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 mx-10"></div>
                      <div className="absolute left-0 top-4 h-0.5 bg-emerald-500 mx-10 transition-all duration-500" style={{ width: `${currentIdx >= 0 ? (currentIdx / (steps.length - 1)) * (100 - 12) : 0}%` }}></div>
                      {steps.map((step, i) => {
                        const done = i <= currentIdx;
                        const active = i === currentIdx;
                        return (
                          <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${done ? "bg-emerald-500 text-white" : "bg-white border-2 border-gray-200 text-gray-400"} ${active ? "ring-4 ring-emerald-100 scale-110" : ""}`}>
                              {step.icon}
                            </div>
                            <span className={`text-[11px] font-medium ${done ? "text-emerald-600" : "text-gray-400"}`}>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cancelled / Return banner */}
                {isCancelled && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
                    <XCircle size={20} className="text-red-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">Đơn hàng đã bị hủy</p>
                      <p className="text-xs text-red-500 mt-0.5">Đơn hàng này đã được hủy và không thể khôi phục.</p>
                      {selectedOrder.ly_do_huy && (
                        <p className="text-xs text-red-600 mt-1 font-medium">Lý do: {selectedOrder.ly_do_huy}</p>
                      )}
                    </div>
                  </div>
                )}
                {isReturn && (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-center gap-3">
                    <RefreshCcw size={20} className="text-purple-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-purple-700">Đang xử lý yêu cầu đổi/trả</p>
                      <p className="text-xs text-purple-500 mt-0.5">Cửa hàng sẽ liên hệ bạn trong vòng 24h.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                  {/* Left: Products + Info */}
                  <div className="lg:col-span-3 space-y-5">
                    {/* Products */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <ShoppingBag size={15} className="text-emerald-600" />
                        <span className="text-sm font-semibold text-gray-700">Sản phẩm ({selectedOrder.chi_tiet_don_hang?.length || 0})</span>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {selectedOrder.chi_tiet_don_hang?.map((item: any, idx: number) => {
                          const qty = Number(item.so_luong || 0);
                          const price = Number(item.don_gia || 0);
                          const variant = item.bien_the_san_pham;
                          const product = variant?.san_pham;
                          const image = product?.anh_san_pham?.find((a: any) => a.la_anh_chinh)?.duong_dan_anh || product?.anh_san_pham?.[0]?.duong_dan_anh || "https://placehold.co/80x80/f3f4f6/9ca3af?text=SP";
                          return (
                            <div key={idx} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                              <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden border border-gray-100 shrink-0">
                                <img src={image} alt={product?.ten_san_pham || ""} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{product?.ten_san_pham || "Sản phẩm"}</p>
                                {variant?.ten_bien_the && <p className="text-xs text-gray-400 mt-0.5">{variant.ten_bien_the}</p>}
                                <p className="text-xs text-gray-500 mt-1">
                                  {price.toLocaleString("vi-VN")}đ × {qty}
                                </p>
                              </div>
                              <p className="text-sm font-bold text-emerald-700 shrink-0">{(price * qty).toLocaleString("vi-VN")}đ</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Receiver Info */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <User size={15} className="text-emerald-600" />
                        <span className="text-sm font-semibold text-gray-700">Thông tin giao hàng</span>
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="text-xs text-gray-400 w-20 shrink-0 pt-0.5">Người nhận</span>
                          <span className="text-sm font-medium text-gray-800">{selectedOrder.ho_ten_nguoi_nhan || "—"}</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-xs text-gray-400 w-20 shrink-0 pt-0.5">Điện thoại</span>
                          <span className="text-sm font-medium text-gray-800">{selectedOrder.sdt_nguoi_nhan || "—"}</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-xs text-gray-400 w-20 shrink-0 pt-0.5">Địa chỉ</span>
                          <span className="text-sm text-gray-700 leading-relaxed">{selectedOrder.dia_chi_giao_hang || "—"}</span>
                        </div>
                        {selectedOrder.ghi_chu && (
                          <div className="flex items-start gap-3 pt-2 border-t border-gray-50">
                            <span className="text-xs text-gray-400 w-20 shrink-0 pt-0.5">Ghi chú</span>
                            <span className="text-sm text-gray-600 italic">{selectedOrder.ghi_chu}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Payment + Shipping */}
                  <div className="lg:col-span-2 space-y-5">
                    {/* Payment summary */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <Store size={15} className="text-emerald-600" />
                        <span className="text-sm font-semibold text-gray-700">Thanh toán</span>
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Tạm tính</span>
                          <span className="font-medium text-gray-800">{tongTien.toLocaleString("vi-VN")}đ</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Phí vận chuyển</span>
                          <span className="font-medium text-gray-800">{phiShip > 0 ? `${phiShip.toLocaleString("vi-VN")}đ` : "Miễn phí"}</span>
                        </div>
                        {selectedOrder.ma_khuyen_mai && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Giảm giá</span>
                            <span className="font-medium text-orange-500">Đã áp dụng</span>
                          </div>
                        )}
                        <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700">Tổng cộng</span>
                          <span className="text-xl font-bold text-emerald-600">{tongCong.toLocaleString("vi-VN")}đ</span>
                        </div>
                        <div className="pt-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                            {(selectedOrder.phuong_thuc_thanh_toan || "COD").toUpperCase() === "COD" ? "Thanh toán khi nhận hàng" : (selectedOrder.phuong_thuc_thanh_toan || "COD").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping tracking */}
                    {selectedOrder.don_van_chuyen?.some((s: any) => s.ma_van_don) && (
                      <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                          <Truck size={15} className="text-emerald-600" />
                          <span className="text-sm font-semibold text-gray-700">Vận chuyển</span>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs text-gray-400">Mã vận đơn:</span>
                            <span className="text-sm font-mono font-semibold text-gray-800">{selectedOrder.don_van_chuyen.find((s: any) => s.ma_van_don)?.ma_van_don}</span>
                          </div>
                          <TrackingTimeline
                            orderId={selectedOrder.id}
                            orderCode={selectedOrder.don_van_chuyen.find((s: any) => s.ma_van_don)?.ma_van_don}
                          />
                        </div>
                      </div>
                    )}

                    {/* Order timeline */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <Clock size={15} className="text-emerald-600" />
                        <span className="text-sm font-semibold text-gray-700">Lịch sử</span>
                      </div>
                      <div className="p-5">
                        <div className="relative space-y-4 pl-5 border-l-2 border-gray-100 ml-1">
                          <div className="relative">
                            <div className="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-100"></div>
                            <p className="text-sm font-semibold text-gray-800">Đặt hàng thành công</p>
                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(selectedOrder.ngay_tao)}</p>
                          </div>
                          {trangThai !== "CHO_XAC_NHAN" && (
                            <div className="relative">
                              <div className="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-100"></div>
                              <p className="text-sm font-semibold text-gray-800">
                                {trangThai === "CHO_GIAO_HANG" ? "Đã thanh toán, chờ giao hàng" : trangThai === "DANG_GIAO_HANG" ? "Đang giao hàng" : trangThai === "DA_GIAO" ? "Giao hàng thành công" : trangThai === "DA_HUY" ? "Đã hủy đơn" : "Cập nhật trạng thái"}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">Cập nhật gần nhất</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          );
        })()}
      </AnimatePresence>

      {/* ========================================= */}
      {/* MODAL HỦY ĐƠN HÀNG                       */}
      {/* ========================================= */}
      <AnimatePresence>
        {cancelOrder && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <XCircle size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Xác nhận hủy đơn hàng</h3>
                  <p className="text-sm text-gray-500">Đơn hàng #{cancelOrder.id}</p>
                </div>
              </div>
              <div className="mb-6 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Lý do hủy đơn <span className="text-red-500">*</span></label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all bg-white"
                  >
                    <option value="">-- Chọn lý do --</option>
                    <option value="Tôi muốn thay đổi sản phẩm khác">Tôi muốn thay đổi sản phẩm khác</option>
                    <option value="Tôi muốn thay đổi địa chỉ giao hàng">Tôi muốn thay đổi địa chỉ giao hàng</option>
                    <option value="Tôi không có nhu cầu mua nữa">Tôi không có nhu cầu mua nữa</option>
                    <option value="Tôi tìm được giá tốt hơn ở chỗ khác">Tôi tìm được giá tốt hơn ở chỗ khác</option>
                    <option value="Lý do khác">Lý do khác</option>
                  </select>
                </div>
                {cancelReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Chi tiết thêm</label>
                    <textarea
                      value={cancelReasonDetail}
                      onChange={(e) => setCancelReasonDetail(e.target.value)}
                      placeholder="Mô tả thêm lý do hủy đơn (không bắt buộc)..."
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all resize-none"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setCancelOrder(null); setCancelReason(""); setCancelReasonDetail(""); }}
                  disabled={cancelling}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Không, giữ lại
                </button>
                <button
                  onClick={async () => {
                    if (!cancelReason) {
                      toast.error("Vui lòng chọn lý do hủy đơn");
                      return;
                    }
                    setCancelling(true);
                    try {
                      const res = await fetch("/api/store/orders", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId: cancelOrder.id, action: "CANCEL", reason: cancelReason + (cancelReasonDetail ? " - " + cancelReasonDetail : "") }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setOrders(orders.map(o => o.id === cancelOrder.id ? { ...o, trang_thai: "DA_HUY" } : o));
                        toast.success("Đã hủy đơn hàng thành công");
                      } else {
                        toast.error(data.message || "Không thể hủy đơn hàng");
                      }
                    } catch {
                      toast.error("Đã xảy ra lỗi, vui lòng thử lại");
                    } finally {
                      setCancelling(false);
                      setCancelOrder(null);
                      setCancelReason("");
                      setCancelReasonDetail("");
                    }
                  }}
                  disabled={cancelling}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-2"
                >
                  {cancelling ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang hủy...</>
                  ) : (
                    "Xác nhận hủy"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================= */}
      {/* MEGA MODAL 2: GIAO DIỆN YÊU CẦU ĐỔI TRẢ */}
      {/* ========================================= */}
      <AnimatePresence>
        {returnOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#F8FAF9] rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <div className="p-8 md:p-10">
                {/* Nút Quay Lại / Đóng */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setReturnOrder(null)}
                  className="mb-8 flex items-center space-x-2 text-gray-500 cursor-pointer hover:text-[#007832] transition-colors w-fit"
                >
                  <ArrowLeft size={16} />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Quay lại
                  </span>
                </motion.div>

                <div className="grid grid-cols-1 gap-10">
                  <section>
                    <motion.h1
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-4xl font-black text-[#007832] mb-3 tracking-tight"
                    >
                      Yêu cầu Hoàn / Trả hàng
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-gray-500 mb-10 text-lg leading-relaxed"
                    >
                      Đơn hàng{" "}
                      <strong className="text-gray-800">
                        #{returnOrder.id}
                      </strong>
                      . Vui lòng cung cấp thông tin chi tiết để đội ngũ Freshy
                      hỗ trợ xử lý yêu cầu nhanh nhất.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
                    >
                      <form className="space-y-8" onSubmit={handleSubmitReturn}>
                        {/* Select Lý do */}
                        <div className="space-y-3">
                          <label className="block text-[#007832] font-bold text-sm tracking-wide uppercase">
                            Lý do đổi/trả
                          </label>
                          <div className="bg-emerald-50/50 px-4 py-1 rounded-xl border border-emerald-100 hover:border-emerald-300 transition-colors">
                            <select
                              value={returnReason}
                              onChange={(e) => setReturnReason(e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-0 text-gray-900 py-3 font-medium appearance-none cursor-pointer outline-none"
                            >
                              <option disabled value="">
                                Chọn lý do của bạn...
                              </option>
                              <option value="Sản phẩm hỏng trong quá trình vận chuyển">
                                Sản phẩm hỏng trong quá trình vận chuyển
                              </option>
                              <option value="Giao sai sản phẩm / Thiếu hàng">
                                Giao sai sản phẩm / Thiếu hàng
                              </option>
                              <option value="Chất lượng không đúng mô tả">
                                Chất lượng không đúng mô tả
                              </option>
                              <option value="Lý do khác">Lý do khác</option>
                            </select>
                          </div>
                        </div>

                        {/* Mô tả chi tiết */}
                        <div className="space-y-3">
                          <label className="block text-[#007832] font-bold text-sm tracking-wide uppercase">
                            Mô tả chi tiết
                          </label>
                          <div className="bg-gray-50 px-4 py-4 rounded-xl border border-gray-200 focus-within:border-emerald-400 focus-within:bg-white transition-all">
                            <textarea
                              value={returnDescription}
                              onChange={(e) =>
                                setReturnDescription(e.target.value)
                              }
                              className="w-full bg-transparent border-none focus:ring-0 text-gray-900 outline-none resize-none placeholder-gray-400"
                              placeholder="Vui lòng mô tả tình trạng thực tế của sản phẩm (nếu có)..."
                              rows={4}
                            />
                          </div>
                        </div>

                        {/* Upload Hình ảnh từ Máy tính/Điện thoại */}
                        <div className="space-y-4">
                          <label className="block text-[#007832] font-bold text-sm tracking-wide uppercase">
                            Hình ảnh minh chứng
                          </label>

                          <motion.label
                            whileHover={{ backgroundColor: "#f9fafb" }}
                            className="border-2 border-dashed border-gray-300 rounded-2xl p-10 bg-gray-50 flex flex-col items-center justify-center cursor-pointer group transition-colors relative"
                          >
                            <input
                              type="file"
                              multiple
                              accept="image/jpeg, image/png, image/webp"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                            <CloudUpload
                              className="text-gray-400 group-hover:text-[#007832] transition-colors mb-3"
                              size={48}
                            />
                            <p className="text-gray-600 text-center font-medium">
                              Nhấn để chọn ảnh từ thư viện
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              Hỗ trợ JPG, PNG (Tối đa 5 ảnh, 5MB mỗi ảnh)
                            </p>
                          </motion.label>

                          {/* Previews Ảnh Thật */}
                          <div className="flex gap-4 mt-6">
                            <AnimatePresence>
                              {returnImages.map((img) => (
                                <motion.div
                                  key={img.id}
                                  layout
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group shadow-sm flex-shrink-0"
                                >
                                  <img
                                    src={img.url}
                                    alt={img.alt}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => removeImage(img.id)}
                                      className="text-white hover:text-rose-400 transition-colors p-2 bg-black/20 rounded-full"
                                    >
                                      <X size={20} />
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-8 border-t border-gray-100">
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-5 text-white font-black text-lg rounded-2xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-3 transition-all ${isSubmitting ? "bg-emerald-300" : "bg-[#007832] hover:bg-emerald-800"}`}
                          >
                            {isSubmitting
                              ? "Đang xử lý..."
                              : "Gửi yêu cầu đổi trả"}
                            <Send size={20} />
                          </motion.button>
                          <p className="text-center text-sm text-gray-400 mt-4 font-medium">
                            Bằng việc gửi yêu cầu, bạn đồng ý với Chính sách
                            Đổi/Trả của Freshy.
                          </p>
                        </div>
                      </form>
                    </motion.div>
                  </section>

                  {/* Info Cards từ thiết kế của bạn */}
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InfoCard
                      icon={<Clock size={24} />}
                      title="Thời gian xử lý"
                      desc="Phản hồi trong vòng 24h làm việc kể từ khi nhận yêu cầu."
                      delay={0.3}
                    />
                    <InfoCard
                      icon={<Truck size={24} />}
                      title="Miễn phí thu hồi"
                      desc="Hỗ trợ lấy hàng tận nơi miễn phí nếu lỗi từ Freshy."
                      delay={0.4}
                    />
                    <InfoCard
                      icon={<ShieldCheck size={24} />}
                      title="Bảo mật thông tin"
                      desc="Mọi dữ liệu hình ảnh của bạn được cam kết bảo mật."
                      delay={0.5}
                    />
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// CÁC COMPONENT GIAO DIỆN CON
function Step({
  icon,
  label,
  active = false,
  completed = false,
  disabled = false,
}: any) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-3">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${completed ? "bg-[#007832] text-white shadow-md" : active ? "bg-white border-4 border-[#007832] text-[#007832] shadow-lg scale-110" : "bg-gray-100 text-gray-400"}`}
      >
        {icon}
      </div>
      <span
        className={`text-sm font-bold transition-colors duration-300 ${completed || active ? "text-[#007832]" : "text-gray-400"}`}
      >
        {label}
      </span>
    </div>
  );
}

function InfoField({ label, value }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
    </div>
  );
}

function ProductRow({ name, qty, price, total, image }: any) {
  return (
    <tr className="group hover:bg-gray-50/50 transition-colors">
      <td className="py-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-bold text-gray-900 text-base">{name}</span>
        </div>
      </td>
      <td className="py-5 text-center font-bold text-gray-900">{qty}</td>
      <td className="py-5 text-right font-medium text-gray-500">{price}</td>
      <td className="py-5 text-right font-black text-[#007832] text-lg">
        {total}
      </td>
    </tr>
  );
}

function SummaryItem({ label, value }: any) {
  return (
    <div className={`flex justify-between items-center font-medium`}>
      <span className="text-emerald-50">{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
}

function TimelineEvent({ title, time, description, active = false }: any) {
  return (
    <div className="relative">
      <div
        className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-white transition-all duration-300 ${active ? "bg-[#007832] ring-4 ring-emerald-500/10" : "bg-gray-200"}`}
      ></div>
      <div className="space-y-1">
        <p
          className={`font-bold text-base ${active ? "text-gray-900" : "text-gray-400"}`}
        >
          {title}
        </p>
        <p className="text-xs text-gray-500 font-medium">{time}</p>
        <p className="mt-3 text-sm text-gray-600 italic leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
          {description}
        </p>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white border border-gray-100 p-6 rounded-2xl flex flex-col md:flex-row items-start gap-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-3 bg-emerald-50 rounded-xl text-[#007832] flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-black text-gray-900 text-base mb-1.5">{title}</h4>
        <p className="text-sm text-gray-500 leading-relaxed font-medium">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}
