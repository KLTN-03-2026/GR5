"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft, AlertTriangle, PackageSearch, QrCode, CheckCircle,
  XCircle, Truck, PackageCheck, RefreshCcw, CreditCard, Banknote,
  Building2, Wallet, Clock, Info, CheckCircle2, Copy, Loader2,
  Phone, MapPin, User, CalendarDays, Hash, ChevronRight,
  Package, RotateCcw
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface OrderItem {
  id: number;
  tenSanPham: string;
  tenBienThe: string;
  donViTinh: string;
  maSku: string;
  soLuong: number;
  donGia: number;
  anhSanPham: string | null;
  tonKho: number;
  maLoHang: string | null;
  hanSuDung: string | null;
  duHang: boolean;
  soonExpiry: boolean;
  stockWarning: string | null;
}

interface OrderDetail {
  id: number;
  maHienThi: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  notes: string;
  total: number;
  shippingFee: number;
  status: string;
  ngayTao: string;
  items: OrderItem[];
  hasStockIssue: boolean;
  hasSoonExpiry: boolean;
  payment: {
    id: number;
    phuongThuc: string;
    trangThai: string;
    soTien: number;
    maGiaoDich: string | null;
    ngayTao: string;
  } | null;
  shipping: {
    maVanDon: string | null;
    trangThai: string | null;
    doiTac: string;
    ngayGiaoDuKien: string | null;
  } | null;
  timeline: { trangThai: string; thoiGian: string }[];
  returnRequests: {
    id: number;
    loaiYeuCau: string;
    trangThai: string;
    soTienHoan: number;
    chiTiet: { tenSanPham: string; soLuong: number | null; lyDo: string | null; anhMinhChung: string | null }[];
  }[];
}

// ─── Design tokens (staff.md §2.1) ──────────────────────────────────────────
// Green  #3B6D11 / bg #EAF3DE  — thành công, đủ hàng
// Amber  #BA7517 / bg #FAEEDA  — cần hành động
// Red    #A32D2D / bg #FCEBEB  — lỗi, cảnh báo
// Blue   #185FA5 / bg #E6F1FB  — thông tin, CK
// Gray   #5F5E5A / bg #F1EFE8  — trung tính

// ─── Constants ───────────────────────────────────────────────────────────────
const PAYMENT_METHOD_INFO: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  COD:   { label: "Tiền mặt khi nhận hàng",  icon: Banknote,   color: "text-[#3B6D11]",  bg: "bg-[#EAF3DE]" },
  MOMO:  { label: "Ví MoMo",                  icon: Wallet,     color: "text-pink-700",    bg: "bg-pink-50"   },
  VNPAY: { label: "VNPay",                    icon: CreditCard, color: "text-[#185FA5]",  bg: "bg-[#E6F1FB]" },
  BANK:  { label: "Chuyển khoản ngân hàng",   icon: Building2,  color: "text-purple-700",  bg: "bg-purple-50" },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; style: string }> = {
  CHO_THANH_TOAN: { label: "Chờ thanh toán",      icon: Clock,        style: "bg-[#FAEEDA] text-[#BA7517] border border-[#BA7517]/30" },
  DA_THANH_TOAN:  { label: "Đã thanh toán",        icon: CheckCircle2, style: "bg-[#EAF3DE] text-[#3B6D11] border border-[#3B6D11]/30" },
  THAT_BAI:       { label: "Thanh toán thất bại",  icon: XCircle,      style: "bg-[#FCEBEB] text-[#A32D2D] border border-[#A32D2D]/30" },
};

const ORDER_STATUS_STEPS = [
  { key: "CHO_XAC_NHAN",   label: "Đặt hàng" },
  { key: "CHO_GIAO_HANG",  label: "Xác nhận" },
  { key: "DANG_GIAO_HANG", label: "Đang giao" },
  { key: "DA_GIAO",        label: "Hoàn thành" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtCurrency(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => toast.success(`Đã copy ${label}`));
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function StaffOrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"CHI_TIET" | "THANH_TOAN" | "DOI_TRA">("CHI_TIET");
  const [actionLoading, setActionLoading] = useState(false);
  const [scannedItems, setScannedItems] = useState<Set<number>>(new Set());
  const [trackingInput, setTrackingInput] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [ghnLoading, setGhnLoading] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/staff/orders/${id}`);
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
      } else {
        toast.error(json.message || "Không tìm thấy đơn hàng");
      }
    } catch {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const doAction = async (action: string, data?: object) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/staff/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        fetchOrder();
      } else {
        toast.error(json.message || "Lỗi xử lý");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setActionLoading(false);
    }
  };

  const handleScanItem = (itemId: number) => {
    if (scannedItems.has(itemId)) {
      toast.error("Đã quét kiện hàng này rồi!");
      return;
    }
    setScannedItems((prev) => new Set([...prev, itemId]));
    toast.success("Quét thành công ✓");
  };

  const handleCreateGHN = async () => {
    setGhnLoading(true);
    try {
      const res = await fetch(`/api/staff/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CREATE_GHN_ORDER" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        fetchOrder();
      } else {
        toast.error(json.message || "Lỗi tạo vận đơn GHN");
      }
    } catch {
      toast.error("Lỗi kết nối GHN");
    } finally {
      setGhnLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    setNoteLoading(true);
    try {
      const res = await fetch(`/api/staff/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADD_NOTE", data: { note: noteInput.trim() } }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Đã thêm ghi chú");
        setNoteInput("");
        fetchOrder();
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error("Lỗi thêm ghi chú");
    } finally {
      setNoteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#185FA5]" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Không tìm thấy đơn hàng</p>
        <Link href="/staff/orders" className="text-[#185FA5] underline text-sm">← Quay lại danh sách</Link>
      </div>
    );
  }

  const payment = order.payment;
  const pmInfo = payment ? (PAYMENT_METHOD_INFO[payment.phuongThuc] ?? PAYMENT_METHOD_INFO.COD) : null;
  const psInfo = payment ? (PAYMENT_STATUS_CONFIG[payment.trangThai] ?? PAYMENT_STATUS_CONFIG.CHO_THANH_TOAN) : null;
  const isBankPending = payment?.phuongThuc === "BANK" && payment.trangThai === "CHO_THANH_TOAN";
  const canConfirmOrder =
    (order.status === "CHO_XAC_NHAN" && payment?.trangThai === "DA_THANH_TOAN") ||
    (order.status === "CHO_XAC_NHAN" && payment?.phuongThuc === "COD");
  const allScanned = order.items.length > 0 && order.items.every((i) => scannedItems.has(i.id));
  const currentStepIdx = ORDER_STATUS_STEPS.findIndex((s) => s.key === order.status);

  const vietqrUrl = payment
    ? `https://img.vietqr.io/image/MB-0935462720-compact2.png?amount=${payment.soTien}&addInfo=${order.maHienThi}&accountName=LE+VIET+QUOC+HUNG`
    : null;

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />

      {/* ── Breadcrumb + Tab switcher (staff.md §3) ── */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-1 text-[14px] text-gray-500">
          <Link href="/staff/orders" className="inline-flex items-center gap-1 hover:text-[#185FA5] transition-colors">
            <ArrowLeft size={15} /> Đơn hàng
          </Link>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="font-mono font-semibold text-gray-800 text-[13px]">{order.maHienThi}</span>
        </nav>

        {/* Tabs: Thông tin · Thanh toán · Đổi trả */}
        <div className="flex items-center gap-1 bg-white rounded-[10px] border border-gray-200 p-1">
          {(["CHI_TIET", "THANH_TOAN", "DOI_TRA"] as const).map((tab) => {
            const labels = { CHI_TIET: "Thông tin", THANH_TOAN: "Thanh toán", DOI_TRA: "Đổi / Trả" };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-3 py-1.5 text-[14px] font-medium rounded-lg transition-colors ${
                  isActive
                    ? tab === "DOI_TRA"
                      ? "bg-[#FCEBEB] text-[#A32D2D]"
                      : tab === "THANH_TOAN"
                      ? "bg-[#E6F1FB] text-[#185FA5]"
                      : "bg-[#EAF3DE] text-[#3B6D11]"
                    : "text-gray-500 hover:bg-[#F1EFE8]"
                }`}
              >
                {labels[tab]}
                {tab === "THANH_TOAN" && isBankPending && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#BA7517] rounded-full animate-pulse" />
                )}
                {tab === "DOI_TRA" && order.returnRequests.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#A32D2D] rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Alert Banner cảnh báo tồn kho (staff.md §5.1) ── */}
      {/* Background #FAEEDA · Border-left 4px solid #BA7517 */}
      {(order.hasStockIssue || order.hasSoonExpiry) && (
        <div className="bg-[#FAEEDA] border border-[#BA7517]/30 border-l-4 border-l-[#BA7517] rounded-[10px] p-4 flex items-start gap-3">
          <AlertTriangle className="text-[#BA7517] mt-0.5 shrink-0" size={18} />
          <div>
            <h3 className="text-[#BA7517] font-semibold text-[14px]">⚠️ Cảnh báo trước khi xác nhận</h3>
            <ul className="mt-2 text-[13px] text-[#BA7517] space-y-1 list-disc ml-4">
              {order.items.filter((i) => !i.duHang).map((i) => (
                <li key={i.id}>
                  <strong>{i.tenSanPham}</strong>: {i.stockWarning}{" "}
                  <Link href="/staff/warehouse" className="underline text-[#BA7517] font-medium hover:opacity-80">[Xem kho]</Link>
                </li>
              ))}
              {order.items.filter((i) => i.soonExpiry).map((i) => (
                <li key={`exp-${i.id}`}>
                  Lô <strong>{i.maLoHang}</strong> ({i.tenSanPham}) hết hạn{" "}
                  {i.hanSuDung ? new Date(i.hanSuDung).toLocaleDateString("vi-VN") : "?"} — ưu tiên xuất trước
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ══ TAB: CHI TIẾT (staff.md §5.2) ══ */}
      {activeTab === "CHI_TIET" && (
        /* staff.md layout 2 cột: main auto + control panel 300px */
        <div className="flex gap-4 items-start">

          {/* Main content (col 1-3) */}
          <div className="flex-1 space-y-4">
            {/* Row: Customer card + Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Customer card */}
              <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-5">
                <h3 className="text-[15px] font-semibold text-gray-800 mb-3 flex items-center gap-1.5 border-b pb-2">
                  <User size={15} className="text-[#185FA5]" /> Khách hàng
                </h3>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900 text-[14px]">{order.customerName}</p>
                  {order.customerPhone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={13} className="text-gray-400 shrink-0" />
                      <a href={`tel:${order.customerPhone}`} className="hover:text-[#185FA5] text-[14px]">
                        {order.customerPhone}
                      </a>
                    </div>
                  )}
                  {order.address && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin size={13} className="text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-[13px] leading-relaxed">{order.address}</span>
                    </div>
                  )}
                  {order.notes && (
                    <div className="mt-3 p-2.5 bg-[#FAEEDA] rounded-lg border border-[#BA7517]/20">
                      <p className="text-[12px] font-medium text-[#BA7517] uppercase tracking-[0.06em] mb-1">Ghi chú</p>
                      <p className="text-[13px] text-[#BA7517] italic">"{order.notes}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline (staff.md §5.2) */}
              <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-5">
                <h3 className="text-[15px] font-semibold text-gray-800 mb-3 flex items-center gap-1.5 border-b pb-2">
                  <CalendarDays size={15} className="text-[#185FA5]" /> Tiến trình đơn
                </h3>
                <div className="space-y-3">
                  {ORDER_STATUS_STEPS.map((step, idx) => {
                    const done = idx <= currentStepIdx;
                    const current = idx === currentStepIdx;
                    const ts = order.timeline.find((t) => t.trangThai === step.key);
                    return (
                      <div key={step.key} className="flex gap-3 items-start">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          done
                            ? "bg-[#3B6D11] border-[#3B6D11]"
                            : "bg-white border-gray-300"
                        }`}>
                          {done && <CheckCircle2 size={13} className="text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-[13px] font-semibold ${
                            current ? "text-[#185FA5]" : done ? "text-gray-700" : "text-gray-400"
                          }`}>
                            {step.label}
                            {current && (
                              <span className="ml-1.5 text-[10px] bg-[#E6F1FB] text-[#185FA5] px-1.5 py-0.5 rounded-full">
                                Hiện tại
                              </span>
                            )}
                          </p>
                          {ts && (
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {new Date(ts.thoiGian).toLocaleString("vi-VN", {
                                hour: "2-digit", minute: "2-digit",
                                day: "2-digit", month: "2-digit", year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {order.status === "DA_HUY" && (
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-[#A32D2D] border-[#A32D2D] border-2 flex items-center justify-center shrink-0 mt-0.5">
                        <XCircle size={13} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#A32D2D]">Đã hủy</p>
                        {order.notes && <p className="text-[11px] text-gray-400 mt-0.5">{order.notes}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Vận chuyển (nếu có) */}
              {order.shipping?.maVanDon ? (
                <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-5">
                  <h3 className="text-[15px] font-semibold text-gray-800 mb-3 flex items-center gap-1.5 border-b pb-2">
                    <Truck size={15} className="text-[#185FA5]" /> Vận chuyển
                  </h3>
                  <div className="space-y-2">
                    {order.shipping.doiTac && (
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-400">Đơn vị</span>
                        <span className="font-medium text-gray-800">{order.shipping.doiTac}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400">Mã vận đơn</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[#185FA5] text-[12px]">{order.shipping.maVanDon}</span>
                        <button
                          onClick={() => copyToClipboard(order.shipping!.maVanDon!, "mã vận đơn")}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                    {order.shipping.ngayGiaoDuKien && (
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-400">Dự kiến giao</span>
                        <span className="font-medium text-gray-800">
                          {new Date(order.shipping.ngayGiaoDuKien).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-5">
                  <h3 className="text-[15px] font-semibold text-gray-800 mb-3 flex items-center gap-1.5 border-b pb-2">
                    <Hash size={15} className="text-[#185FA5]" /> Thông tin đơn
                  </h3>
                  <div className="space-y-2 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mã đơn</span>
                      <span className="font-mono font-semibold text-gray-800 text-[13px]">{order.maHienThi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ngày đặt</span>
                      <span className="text-gray-700">
                        {new Date(order.ngayTao).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phí ship</span>
                      <span className="text-gray-700 font-mono">{fmtCurrency(order.shippingFee)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product list (staff.md §5.3) */}
            <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-5">
              <h3 className="text-[15px] font-semibold text-gray-800 mb-3 flex items-center gap-1.5 border-b pb-2">
                <Package size={15} className="text-[#185FA5]" /> Danh sách sản phẩm ({order.items.length})
              </h3>
              <div className="space-y-2">
                {order.items.map((item) => {
                  const isScanned = scannedItems.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-[10px] border transition-colors ${
                        !item.duHang
                          ? "bg-[#FCEBEB] border-[#A32D2D]/30"
                          : item.soonExpiry
                          ? "bg-[#FAEEDA] border-[#BA7517]/30"
                          : isScanned
                          ? "bg-[#EAF3DE] border-[#3B6D11]/30"
                          : "bg-[#F1EFE8] border-gray-100"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {item.anhSanPham ? (
                          <img src={item.anhSanPham} alt={item.tenSanPham} className="w-full h-full object-cover" />
                        ) : (
                          <PackageSearch size={20} className="text-gray-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-[14px] truncate">{item.tenSanPham}</p>
                        {item.tenBienThe && (
                          <p className="text-[12px] text-gray-500">{item.tenBienThe}</p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.maSku && (
                            <span className="text-[11px] text-gray-400 font-mono">SKU: {item.maSku}</span>
                          )}
                          {item.maLoHang && (
                            <span className="text-[11px] text-gray-400">Lô: {item.maLoHang}</span>
                          )}
                        </div>
                        {/* Tồn kho inline (staff.md §5.3 + §8) */}
                        <p className={`text-[12px] mt-0.5 font-medium ${
                          !item.duHang
                            ? "text-[#A32D2D]"
                            : item.soonExpiry
                            ? "text-[#BA7517]"
                            : "text-[#3B6D11]"
                        }`}>
                          {!item.duHang
                            ? `❌ ${item.stockWarning}`
                            : item.soonExpiry
                            ? `⏰ Hết hạn ${item.hanSuDung ? new Date(item.hanSuDung).toLocaleDateString("vi-VN") : "?"} — ưu tiên xuất`
                            : `✅ Kho còn: ${item.tonKho} ${item.donViTinh}`}
                        </p>
                      </div>

                      {/* Qty + giá + scan */}
                      <div className="text-right shrink-0">
                        <p className="font-bold text-gray-900 text-[14px]">×{item.soLuong} {item.donViTinh}</p>
                        <p className="text-[12px] text-gray-500 font-mono">{fmtCurrency(item.donGia * item.soLuong)}</p>
                        {order.status === "CHO_GIAO_HANG" && (
                          <button
                            onClick={() => handleScanItem(item.id)}
                            className={`mt-1 flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                              isScanned
                                ? "bg-[#EAF3DE] text-[#3B6D11] border-[#3B6D11]/30"
                                : "bg-white text-gray-500 border-gray-200 hover:border-[#185FA5]/40 hover:text-[#185FA5]"
                            }`}
                          >
                            {isScanned ? <CheckCircle size={10} /> : <QrCode size={10} />}
                            {isScanned ? "Đã lấy" : "Quét QR"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tổng tiền (staff.md §5.3) */}
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
                <div className="flex justify-between text-[14px] text-gray-500">
                  <span>Tạm tính</span>
                  <span className="font-mono">{fmtCurrency(order.total - order.shippingFee)}</span>
                </div>
                {order.shippingFee > 0 && (
                  <div className="flex justify-between text-[14px] text-gray-500">
                    <span>Phí giao hàng</span>
                    <span className="font-mono">{fmtCurrency(order.shippingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                  <span className="text-[14px] text-gray-600 font-medium">Tổng cộng</span>
                  {/* staff.md: Số tiền 16px/600/font-mono */}
                  <span className="text-[16px] font-semibold text-gray-900 font-mono">{fmtCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bảng điều khiển (staff.md §5.4, Control Panel 300px) ── */}
          <div className="w-[300px] shrink-0">
            <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-5 sticky top-4">
              {/* Header */}
              <h3 className="text-[15px] font-semibold text-gray-800 mb-4 border-b pb-2">Bảng điều khiển</h3>

              {/* Trạng thái hiện tại (staff.md §5.4) */}
              <div className="mb-4 p-3 rounded-[10px] bg-[#F1EFE8]">
                <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.06em] mb-1">Trạng thái hiện tại</p>
                <p className="font-bold text-gray-900 font-mono text-[13px]">{order.maHienThi}</p>
                <p className="text-[12px] text-gray-500 mt-1">
                  {payment
                    ? `${PAYMENT_METHOD_INFO[payment.phuongThuc]?.label ?? payment.phuongThuc} · `
                    : ""}
                  {order.ngayTao
                    ? new Date(order.ngayTao).toLocaleString("vi-VN", {
                        hour: "2-digit", minute: "2-digit",
                        day: "2-digit", month: "2-digit",
                      })
                    : ""}
                </p>
              </div>

              {/* Alert nếu CK đang chờ */}
              {isBankPending && (
                <div className="bg-[#FAEEDA] border border-[#BA7517]/30 rounded-lg p-3 mb-4 flex items-start gap-2">
                  <Info size={14} className="text-[#BA7517] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[12px] font-semibold text-[#BA7517]">Chờ xác nhận chuyển khoản</p>
                    <p className="text-[11px] text-[#BA7517]/80 mt-0.5">
                      Kiểm tra tab "Thanh toán" để xác nhận
                    </p>
                  </div>
                </div>
              )}

              {/* ── Luồng CHO_XAC_NHAN (staff.md §5.4) ── */}
              {order.status === "CHO_XAC_NHAN" && (
                <div className="space-y-2">
                  <div className="bg-[#E6F1FB] border border-[#185FA5]/20 rounded-lg p-2.5 mb-3">
                    <p className="text-[12px] text-[#185FA5]">
                      <strong>Bước tiếp theo:</strong> Kiểm tra thanh toán, tồn kho → xác nhận đơn
                    </p>
                  </div>

                  {isBankPending ? (
                    /* Xác nhận CK trước */
                    <button
                      onClick={() => setActiveTab("THANH_TOAN")}
                      className="w-full py-3 bg-[#185FA5] hover:bg-[#1250875] text-white font-semibold rounded-[10px] text-[14px] transition-colors flex items-center justify-center gap-2"
                    >
                      <CreditCard size={15} /> Xác nhận thanh toán trước
                    </button>
                  ) : (
                    /* staff.md primary button: nền #3B6D11 text trắng */
                    <button
                      onClick={() => doAction("CONFIRM_ORDER")}
                      disabled={actionLoading || order.hasStockIssue || !canConfirmOrder}
                      className="w-full py-3 bg-[#3B6D11] hover:bg-[#2d5409] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-[10px] text-[14px] transition-colors flex items-center justify-center gap-2"
                    >
                      {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                      ✅ Xác nhận đơn hàng
                    </button>
                  )}

                  {order.hasStockIssue && (
                    <button className="w-full py-2.5 bg-white border border-[#BA7517]/40 hover:bg-[#FAEEDA] text-[#BA7517] font-semibold rounded-[10px] text-[14px] transition-colors flex items-center justify-center gap-2">
                      <AlertTriangle size={15} /> Liên hệ khách (thiếu hàng)
                    </button>
                  )}

                  {/* staff.md danger: border đỏ, text đỏ, nền trắng */}
                  <button
                    onClick={() => setShowCancelDialog(true)}
                    className="w-full py-2.5 bg-white border border-[#A32D2D]/40 hover:bg-[#FCEBEB] text-[#A32D2D] font-semibold rounded-[10px] text-[14px] transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle size={15} /> ❌ Huỷ đơn & Hoàn tiền
                  </button>
                </div>
              )}

              {/* ── Luồng CHO_GIAO_HANG (nhặt hàng) ── */}
              {order.status === "CHO_GIAO_HANG" && (
                <div className="space-y-3">
                  <div className="bg-[#FAEEDA] border border-[#BA7517]/20 rounded-lg p-2.5">
                    <p className="text-[12px] text-[#BA7517]">
                      <strong>Bước 2:</strong> Nhặt hàng theo danh sách. Quét QR từng kiện.
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="bg-[#F1EFE8] rounded-lg p-3">
                    <div className="flex justify-between text-[12px] text-gray-500 mb-1.5">
                      <span>Tiến độ nhặt hàng</span>
                      <span className="font-semibold text-[#185FA5]">{scannedItems.size}/{order.items.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-[#185FA5] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${order.items.length > 0 ? (scannedItems.size / order.items.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* GHN Button */}
                  <button
                    onClick={handleCreateGHN}
                    disabled={!allScanned || ghnLoading}
                    className="w-full py-3 bg-[#185FA5] hover:bg-[#125087] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-[10px] text-[14px] transition-colors flex items-center justify-center gap-2"
                  >
                    {ghnLoading ? <Loader2 size={15} className="animate-spin" /> : <Truck size={15} />}
                    {allScanned ? "Tạo vận đơn GHN" : `Nhặt đủ ${order.items.length} kiện để tiếp tục`}
                  </button>

                  {/* Hoặc nhập mã vận đơn thủ công */}
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-[11px] text-gray-400 uppercase tracking-[0.06em] mb-1.5">Hoặc nhập thủ công</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        placeholder="Mã vận đơn..."
                        className="flex-1 px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#185FA5]/40 focus:outline-none bg-[#F1EFE8]"
                      />
                      <button
                        onClick={() => doAction("ADD_TRACKING", { maVanDon: trackingInput })}
                        disabled={!trackingInput || !allScanned || actionLoading}
                        className="px-3 py-2 bg-[#5F5E5A] hover:bg-[#4a4947] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg text-[13px] transition-colors"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Luồng DANG_GIAO_HANG ── */}
              {order.status === "DANG_GIAO_HANG" && (
                <div className="space-y-3">
                  <div className="bg-[#F1EFE8] border border-[#5F5E5A]/20 rounded-lg p-2.5">
                    <p className="text-[12px] text-[#5F5E5A]">
                      <strong>Bước 3:</strong> Đơn đang trên đường giao. Xác nhận khi giao thành công.
                    </p>
                  </div>
                  <button
                    onClick={() => doAction("CONFIRM_DELIVERED")}
                    disabled={actionLoading}
                    className="w-full py-3 bg-[#3B6D11] hover:bg-[#2d5409] disabled:bg-gray-300 text-white font-semibold rounded-[10px] text-[14px] transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <PackageCheck size={15} />}
                    ✅ Xác nhận giao thành công
                  </button>
                </div>
              )}

              {/* Terminal: DA_GIAO */}
              {order.status === "DA_GIAO" && (
                <div className="text-center py-6 bg-[#EAF3DE] rounded-[10px]">
                  <CheckCircle2 size={36} className="text-[#3B6D11] mx-auto mb-2" />
                  <p className="font-semibold text-[#3B6D11] text-[15px]">Đơn hàng hoàn thành</p>
                  <p className="text-[12px] text-[#3B6D11]/70 mt-1">Khách đã nhận hàng thành công</p>
                </div>
              )}

              {/* Terminal: DA_HUY */}
              {order.status === "DA_HUY" && (
                <div className="text-center py-6 bg-[#FCEBEB] rounded-[10px]">
                  <XCircle size={36} className="text-[#A32D2D] mx-auto mb-2" />
                  <p className="font-semibold text-[#A32D2D] text-[15px]">Đơn hàng đã hủy</p>
                </div>
              )}

              {/* Ghi chú nội bộ */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.06em] mb-2">Ghi chú nội bộ</p>
                {order.notes && (
                  <div className="bg-[#FAEEDA] border border-[#BA7517]/20 rounded-lg p-2.5 mb-2 max-h-24 overflow-y-auto">
                    <p className="text-[12px] text-[#BA7517] whitespace-pre-line">{order.notes}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                    placeholder="Thêm ghi chú..."
                    className="flex-1 px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#185FA5]/40 focus:outline-none bg-[#F1EFE8]"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!noteInput.trim() || noteLoading}
                    className="px-3 py-2 bg-[#5F5E5A] hover:bg-[#4a4947] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg text-[13px] transition-colors"
                  >
                    {noteLoading ? <Loader2 size={12} className="animate-spin" /> : "Lưu"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: THANH TOÁN (staff.md §6) ══ */}
      {activeTab === "THANH_TOAN" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
          {/* Left: Thông tin thanh toán */}
          <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-5">
            <h2 className="text-[15px] font-semibold mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
              <CreditCard size={16} className="text-[#185FA5]" /> Thông Tin Thanh Toán
            </h2>

            {pmInfo && payment ? (
              <>
                {/* Phương thức */}
                <div className={`flex items-center gap-3 p-3 ${pmInfo.bg} rounded-lg mb-4`}>
                  {React.createElement(pmInfo.icon, { size: 20, className: pmInfo.color })}
                  <div>
                    <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.06em]">Phương thức</p>
                    <p className={`font-semibold text-[14px] ${pmInfo.color}`}>{pmInfo.label}</p>
                  </div>
                </div>

                {/* Trạng thái */}
                {psInfo && (
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border mb-4 ${psInfo.style}`}>
                    {React.createElement(psInfo.icon, { size: 15 })}
                    <span className="font-semibold text-[14px]">{psInfo.label}</span>
                  </div>
                )}

                {/* Chi tiết chuyển khoản */}
                {payment.phuongThuc === "BANK" && (
                  <div className="space-y-2">
                    <h3 className="text-[15px] font-semibold text-gray-800 mb-2">Thông Tin Chuyển Khoản</h3>
                    {[
                      { label: "Ngân hàng",     value: "MB Bank",            copyable: false },
                      { label: "Số TK",          value: "0935462720",         copyable: true },
                      { label: "Chủ TK",         value: "LE VIET QUOC HUNG", copyable: false },
                      { label: "Nội dung CK",    value: order.maHienThi,      copyable: true },
                      { label: "Số tiền",        value: fmtCurrency(payment.soTien), copyable: false },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between items-center p-2.5 bg-[#F1EFE8] rounded-lg">
                        <div>
                          <p className="text-[11px] text-gray-400 uppercase tracking-[0.06em]">{row.label}</p>
                          <p className={`text-[14px] font-semibold mt-0.5 ${
                            row.label === "Nội dung CK" ? "text-[#185FA5] font-mono" :
                            row.label === "Số tiền" ? "text-[#3B6D11] font-mono" : "text-gray-800"
                          }`}>
                            {row.value}
                          </p>
                        </div>
                        {row.copyable && (
                          <button onClick={() => copyToClipboard(row.value, row.label)} className="text-gray-400 hover:text-[#185FA5] transition-colors ml-3">
                            <Copy size={13} />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* QR VietQR */}
                    {vietqrUrl && (
                      <div className="text-center mt-3 pt-3 border-t border-gray-100">
                        <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.06em] mb-2">Mã QR VietQR</p>
                        <div className="inline-block p-3 bg-white border-2 border-gray-200 rounded-xl">
                          <img src={vietqrUrl} alt="QR Code" className="w-44 h-44 object-contain" />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">Quét bằng ứng dụng ngân hàng</p>
                      </div>
                    )}
                  </div>
                )}

                {/* VNPAY / MOMO transaction ID */}
                {payment.maGiaoDich && (
                  <div className="mt-4 p-3 bg-[#F1EFE8] rounded-lg">
                    <p className="text-[11px] text-gray-400 uppercase tracking-[0.06em]">Mã giao dịch</p>
                    <p className="font-mono text-[13px] text-[#185FA5] mt-0.5">{payment.maGiaoDich}</p>
                  </div>
                )}

                {/* Lịch sử thanh toán */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.06em] mb-2">Lịch sử</p>
                  <div className="space-y-1.5 text-[13px] text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-[11px] font-mono">
                        {new Date(payment.ngayTao).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                      </span>
                      <span>Đơn hàng được tạo · Khách chọn {pmInfo.label}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <CreditCard size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-[14px]">Chưa có thông tin thanh toán</p>
              </div>
            )}
          </div>

          {/* Right: Xác nhận thanh toán (staff.md §6) */}
          <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-5">
            <h2 className="text-[15px] font-semibold mb-4 text-gray-800 border-b pb-2">Xác Nhận Thanh Toán</h2>

            {isBankPending && (
              <div className="space-y-4">
                {/* Hướng dẫn (staff.md §6) */}
                <div className="bg-[#FAEEDA] border border-[#BA7517]/30 border-l-4 border-l-[#BA7517] rounded-[10px] p-4">
                  <div className="flex items-start gap-3">
                    <Info size={16} className="text-[#BA7517] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[14px] font-semibold text-[#BA7517]">Hướng dẫn xác nhận</p>
                      <ol className="mt-2 text-[13px] text-[#BA7517] space-y-1 list-decimal list-inside">
                        <li>Đăng nhập tài khoản MB Bank (0935462720)</li>
                        <li>Kiểm tra giao dịch đến: <strong>{fmtCurrency(payment?.soTien ?? 0)}</strong></li>
                        <li>Nội dung CK có chứa: <strong className="font-mono">{order.maHienThi}</strong></li>
                        <li>Nếu khớp → nhấn "Xác nhận đã nhận tiền"</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* staff.md: Xác nhận đã nhận tiền — xanh lá đậm */}
                <button
                  onClick={() => doAction("CONFIRM_PAYMENT")}
                  disabled={actionLoading}
                  className="w-full py-3 bg-[#3B6D11] hover:bg-[#2d5409] disabled:bg-gray-300 text-white font-semibold rounded-[10px] transition-colors flex items-center justify-center gap-2 text-[14px]"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  Xác nhận đã nhận tiền
                </button>

                {/* staff.md: Từ chối — outline đỏ */}
                <button className="w-full py-3 bg-white border border-[#A32D2D]/40 hover:bg-[#FCEBEB] text-[#A32D2D] font-semibold rounded-[10px] transition-colors text-[14px] flex items-center justify-center gap-2">
                  <Phone size={15} /> Liên hệ khách hàng
                </button>
              </div>
            )}

            {payment?.trangThai === "DA_THANH_TOAN" && (
              <div className="text-center py-10 bg-[#EAF3DE] rounded-[10px]">
                <CheckCircle2 size={40} className="text-[#3B6D11] mx-auto mb-3" />
                <p className="font-semibold text-[#3B6D11] text-[15px]">Đã xác nhận thanh toán</p>
                <p className="text-[13px] text-[#3B6D11]/70 mt-1">Có thể tiến hành xử lý đơn hàng</p>
              </div>
            )}

            {payment?.phuongThuc === "COD" && (
              <div className="text-center py-10 bg-[#F1EFE8] rounded-[10px]">
                <Banknote size={40} className="text-[#5F5E5A] mx-auto mb-3" />
                <p className="font-semibold text-[#5F5E5A] text-[15px]">Thanh toán khi nhận hàng</p>
                <p className="text-[13px] text-[#5F5E5A]/70 mt-1">
                  Thu <strong className="font-mono">{fmtCurrency(payment.soTien)}</strong> khi giao thành công
                </p>
              </div>
            )}

            {!payment && (
              <div className="text-center py-10 text-gray-400">
                <p className="text-[14px]">Chưa có giao dịch thanh toán</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ TAB: ĐỔI TRẢ ══ */}
      {activeTab === "DOI_TRA" && (
        <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-5 max-w-3xl">
          <h2 className="text-[15px] font-semibold mb-4 flex items-center gap-2 text-[#A32D2D] border-b pb-3">
            <RotateCcw size={16} /> Yêu Cầu Đổi / Trả Hàng
          </h2>

          {order.returnRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <RefreshCcw size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-[14px]">Không có yêu cầu đổi trả nào</p>
            </div>
          ) : (
            order.returnRequests.map((req) => (
              <div key={req.id} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.06em] mb-2">Yêu cầu #{req.id}</p>
                  <div className="bg-[#F1EFE8] border border-gray-200 rounded-[10px] p-4 space-y-2 text-[14px]">
                    <div>
                      <span className="text-gray-400 text-[12px]">Loại:</span>
                      <span className="ml-2 font-semibold text-gray-800">{req.loaiYeuCau}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[12px]">Số tiền hoàn:</span>
                      <span className="ml-2 font-bold text-[#A32D2D] font-mono">{fmtCurrency(req.soTienHoan)}</span>
                    </div>
                    {req.chiTiet.map((ct, i) => (
                      <div key={i} className="pt-2 border-t border-gray-100">
                        <p className="text-[13px]"><strong>Sản phẩm:</strong> {ct.tenSanPham} {ct.soLuong ? `×${ct.soLuong}` : ""}</p>
                        {ct.lyDo && <p className="text-gray-600 mt-0.5 text-[13px]"><strong>Lý do:</strong> {ct.lyDo}</p>}
                        {ct.anhMinhChung && (
                          <div className="mt-2">
                            <p className="text-gray-400 text-[12px] mb-1">Ảnh minh chứng:</p>
                            <img src={ct.anhMinhChung} alt="minh chứng" className="w-28 h-28 object-cover rounded-lg border" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 pt-4 md:pt-6">
                  <p className="text-[14px] text-gray-600">Đánh giá và xử lý yêu cầu:</p>
                  <button
                    onClick={() => toast.success("Đã gửi yêu cầu hoàn tiền lên Admin")}
                    className="w-full py-2.5 bg-[#3B6D11] hover:bg-[#2d5409] text-white font-semibold rounded-[10px] text-[14px] transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={15} /> Chấp nhận & Trình Admin hoàn tiền
                  </button>
                  <div className="border border-gray-200 rounded-[10px] p-3 bg-[#F1EFE8]">
                    <textarea
                      className="w-full text-[13px] border border-gray-300 rounded-lg p-2 mb-2 focus:outline-none focus:ring-1 focus:ring-[#A32D2D]/30 bg-white resize-none"
                      placeholder="Lý do từ chối (sẽ gửi thông báo đến khách)..."
                      rows={2}
                    />
                    <button
                      onClick={() => toast("Đã từ chối yêu cầu", { icon: "❌" })}
                      className="w-full py-2 bg-white border border-[#A32D2D]/40 hover:bg-[#FCEBEB] text-[#A32D2D] font-semibold text-[14px] rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <XCircle size={14} /> Từ chối yêu cầu
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══ Confirm Dialog: Huỷ đơn (staff.md §5.4) ══ */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-md mx-4 p-6">
            <h3 className="text-[20px] font-semibold text-gray-900 mb-1">
              Xác nhận huỷ đơn {order.maHienThi}?
            </h3>
            <p className="text-[14px] text-gray-500 mb-4">
              Hành động này không thể hoàn tác.
              {payment?.soTien && (
                <> Số tiền <strong className="text-gray-800 font-mono">{fmtCurrency(payment.soTien)}</strong> sẽ được hoàn lại.</>
              )}
            </p>

            <div className="mb-4">
              <label className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.06em] mb-1 block">Lý do hủy (tùy chọn)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy đơn..."
                rows={3}
                className="w-full text-[14px] border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#A32D2D]/30 bg-gray-50 resize-none"
              />
            </div>

            {/* staff.md: "Giữ đơn hàng" + "Huỷ & Hoàn tiền" */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 py-2.5 bg-white border border-gray-200 hover:bg-[#F1EFE8] text-gray-700 font-semibold text-[14px] rounded-[10px] transition-colors"
              >
                Giữ đơn hàng
              </button>
              <button
                onClick={() => {
                  doAction("CANCEL_ORDER", { lyDo: cancelReason });
                  setShowCancelDialog(false);
                }}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-[#A32D2D] hover:bg-[#8b2424] disabled:bg-gray-300 text-white font-semibold text-[14px] rounded-[10px] transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Huỷ & Hoàn tiền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
