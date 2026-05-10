"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Eye, Clock, CheckCircle2, Truck, XCircle, ClipboardList,
  CreditCard, Banknote, AlertCircle, RefreshCw, Wallet, Building2,
  Search, ChevronRight, ChevronLeft, Package, PackageCheck, X,
  CheckSquare, Square, Loader2, Bell, TrendingUp, Calendar,
  ArrowUpDown, DollarSign, FileText, Download, Printer
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Order {
  id: number;
  maHienThi: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  products: string;
  itemCount: number;
  total: number;
  shippingFee: number;
  status: string;
  notes: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentId: number | null;
  transactionId: string | null;
  maVanDon: string | null;
  shippingStatus: string | null;
  timeAgo: string;
  ngayTao: string;
  isUrgent: boolean;
  timeline: { trangThai: string; thoiGian: string }[];
}

interface KPI {
  choXacNhan: number;
  choXacNhanCK: number;
  dangGiao: number;
  choGiao: number;
  daGiao: number;
  giaoThatBai?: number;
  doiTra?: number;
  daHuy: number;
  tongDonHomNay: number;
  doanhThuHomNay: number;
  daGiaoHomNay: number;
}

// ─── Tab config ───────────────────────────────────────────────────────────────
const ORDER_TABS = [
  { id: "", label: "Tất cả", icon: ClipboardList, activeBg: "bg-[#F5F5F4]", activeText: "text-[#5F5E5A]", badgeBg: "bg-[#5F5E5A]" },
  { id: "CHO_XAC_NHAN", label: "Chờ xác nhận", icon: Clock, activeBg: "bg-[#FAEEDA]", activeText: "text-[#BA7517]", badgeBg: "bg-[#BA7517]" },
  { id: "CHO_GIAO_HANG", label: "Chờ giao", icon: Package, activeBg: "bg-[#E8F5F0]", activeText: "text-[#1D9E75]", badgeBg: "bg-[#1D9E75]" },
  { id: "DANG_GIAO_HANG", label: "Đang giao", icon: Truck, activeBg: "bg-[#E8F5F0]", activeText: "text-[#1D9E75]", badgeBg: "bg-[#1D9E75]" },
  { id: "DA_GIAO", label: "Đã giao", icon: PackageCheck, activeBg: "bg-[#EAF3DE]", activeText: "text-[#3B6D11]", badgeBg: "bg-[#3B6D11]" },
  { id: "GIAO_THAT_BAI", label: "Giao thất bại", icon: AlertCircle, activeBg: "bg-[#FCEBEB]", activeText: "text-[#A32D2D]", badgeBg: "bg-[#A32D2D]" },
  { id: "YEU_CAU_DOI_TRA", label: "Đổi trả", icon: RefreshCw, activeBg: "bg-[#FAEEDA]", activeText: "text-[#BA7517]", badgeBg: "bg-[#BA7517]" },
  { id: "DA_HUY", label: "Đã hủy", icon: XCircle, activeBg: "bg-[#FCEBEB]", activeText: "text-[#A32D2D]", badgeBg: "bg-[#A32D2D]" },
];

// ─── Badge configs ──────────────────────────────────────────────────────────
const PAYMENT_METHOD_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  COD:   { label: "Tiền mặt", icon: Banknote, color: "text-[#3B6D11]" },
  MOMO:  { label: "MoMo", icon: Wallet, color: "text-pink-600" },
  VNPAY: { label: "VNPay", icon: CreditCard, color: "text-[#1D9E75]" },
  BANK:  { label: "Chuyển khoản", icon: Building2, color: "text-purple-700" },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  CHO_THANH_TOAN: { label: "Chờ thanh toán", style: "bg-[#FAEEDA] text-[#BA7517] border border-[#BA7517]/30" },
  DA_THANH_TOAN:  { label: "Đã thanh toán", style: "bg-[#EAF3DE] text-[#3B6D11] border border-[#3B6D11]/30" },
  THAT_BAI:       { label: "Thất bại", style: "bg-[#FCEBEB] text-[#A32D2D] border border-[#A32D2D]/30" },
};

const ORDER_STATUS_CONFIG: Record<string, { label: string; icon: string; style: string }> = {
  CHO_XAC_NHAN:    { label: "Chờ xác nhận", icon: "⏳", style: "bg-[#FAEEDA] text-[#BA7517] border border-[#BA7517]/30" },
  DA_THANH_TOAN:   { label: "Đã thanh toán", icon: "💳", style: "bg-[#EAF3DE] text-[#3B6D11] border border-[#3B6D11]/30" },
  CHO_GIAO_HANG:   { label: "Chờ giao", icon: "📦", style: "bg-[#E8F5F0] text-[#1D9E75] border border-[#1D9E75]/30" },
  DANG_GIAO_HANG:  { label: "Đang giao", icon: "🚚", style: "bg-[#E8F5F0] text-[#1D9E75] border border-[#1D9E75]/30" },
  DA_GIAO:         { label: "Đã giao", icon: "✓", style: "bg-[#EAF3DE] text-[#3B6D11] border border-[#3B6D11]/30" },
  GIAO_THAT_BAI:   { label: "Giao thất bại", icon: "!", style: "bg-[#FCEBEB] text-[#A32D2D] border border-[#A32D2D]/30" },
  YEU_CAU_DOI_TRA: { label: "Yêu cầu đổi trả", icon: "↩", style: "bg-[#FAEEDA] text-[#BA7517] border border-[#BA7517]/30" },
  DA_HOAN_TRA:     { label: "Đã hoàn trả", icon: "↺", style: "bg-[#F5F5F4] text-[#5F5E5A] border border-[#5F5E5A]/30" },
  DA_HUY:          { label: "Đã hủy", icon: "✕", style: "bg-[#FCEBEB] text-[#A32D2D] border border-[#A32D2D]/30" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtCurrency(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [kpi, setKpi] = useState<KPI>({
    choXacNhan: 0, choXacNhanCK: 0, dangGiao: 0, choGiao: 0,
    daGiao: 0, daHuy: 0, tongDonHomNay: 0, doanhThuHomNay: 0, daGiaoHomNay: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({ limit: String(limit), page: String(page) });
      if (activeTab) params.set("status", activeTab);
      if (search) params.set("search", search);
      if (paymentFilter) params.set("paymentMethod", paymentFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (sortBy) params.set("sortBy", sortBy);

      const res = await fetch(`/api/staff/orders?${params}`);
      const json = await res.json();

      if (json.success) {
        setOrders(json.data);
        setKpi(json.kpi);
        setTotal(json.meta.total);
        setTotalPages(json.meta.totalPages);
        if (selectedOrder) {
          const updated = json.data.find((o: Order) => o.id === selectedOrder.id);
          setSelectedOrder(updated ?? null);
        }
      }
    } catch {
      toast.error("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, search, paymentFilter, dateFrom, dateTo, sortBy, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => { setPage(1); }, [activeTab, search, paymentFilter, dateFrom, dateTo, sortBy]);

  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(val), 400);
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const bankPendingOrders = orders.filter(
    (o) => o.paymentMethod !== "COD" && o.paymentStatus === "CHO_THANH_TOAN"
  );

  const selectAllVisible = () => {
    if (selectedIds.size === bankPendingOrders.length && bankPendingOrders.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(bankPendingOrders.map((o) => o.id)));
    }
  };

  const handleBulkConfirm = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/staff/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "BULK_CONFIRM_PAYMENT",
          data: { orderIds: Array.from(selectedIds) },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setSelectedIds(new Set());
        fetchOrders(true);
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error("Lỗi xác nhận hàng loạt");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) { toast.error("Không có đơn để xuất"); return; }
    const headers = ["Mã đơn", "Khách hàng", "SĐT", "Tổng tiền", "Trạng thái", "Thanh toán", "Ngày tạo"];
    const rows = orders.map((o) => [
      o.maHienThi,
      o.customerName,
      o.customerPhone,
      o.total,
      ORDER_STATUS_CONFIG[o.status]?.label || o.status,
      PAYMENT_METHOD_LABELS[o.paymentMethod]?.label || o.paymentMethod,
      o.ngayTao ? new Date(o.ngayTao).toLocaleDateString("vi-VN") : "",
    ]);
    const bom = "﻿";
    const csv = bom + [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `don-hang-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất file CSV");
  };

  const getTabCount = (tabId: string) => {
    if (!tabId) return total;
    switch (tabId) {
      case "CHO_XAC_NHAN": return kpi.choXacNhan;
      case "CHO_GIAO_HANG": return kpi.choGiao;
      case "DANG_GIAO_HANG": return kpi.dangGiao;
      case "DA_GIAO": return kpi.daGiao;
      case "GIAO_THAT_BAI": return kpi.giaoThatBai ?? 0;
      case "YEU_CAU_DOI_TRA": return kpi.doiTra ?? 0;
      case "DA_HUY": return kpi.daHuy;
      default: return 0;
    }
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList size={22} className="text-[#1D9E75]" />
            Quản Lý Đơn Hàng
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Xử lý đơn hàng, xác nhận thanh toán, tạo vận đơn GHN
            {total > 0 && <span className="ml-2 text-gray-400">— {total} đơn</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-[10px] hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm"
          >
            <Download size={14} className="text-gray-500" />
            Xuất CSV
          </button>
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-[10px] hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin text-[#1D9E75]" : "text-gray-500"} />
            Làm mới
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab("CHO_XAC_NHAN")}
          className="bg-white rounded-[10px] border border-[#BA7517]/20 p-4 text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.06em]">Chờ xử lý</span>
            <div className="w-7 h-7 bg-[#FAEEDA] rounded-lg flex items-center justify-center">
              <Clock size={14} className="text-[#BA7517]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{kpi.choXacNhan}</p>
          <p className="text-[11px] text-[#BA7517] mt-1 flex items-center gap-1">
            <TrendingUp size={10} /> đơn chờ xác nhận
          </p>
        </button>

        <button
          onClick={() => { setActiveTab(""); setPaymentFilter("BANK"); }}
          className="bg-white rounded-[10px] border border-[#1D9E75]/20 p-4 text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.06em]">Chờ xác nhận CK</span>
            <div className="w-7 h-7 bg-[#E8F5F0] rounded-lg flex items-center justify-center">
              <Building2 size={14} className="text-[#1D9E75]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{kpi.choXacNhanCK}</p>
          <p className="text-[11px] text-[#1D9E75] mt-1 flex items-center gap-1">
            <Bell size={10} /> chuyển khoản chờ duyệt
          </p>
        </button>

        <button
          onClick={() => setActiveTab("DANG_GIAO_HANG")}
          className="bg-white rounded-[10px] border border-[#1D9E75]/20 p-4 text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.06em]">Đang giao</span>
            <div className="w-7 h-7 bg-[#E8F5F0] rounded-lg flex items-center justify-center">
              <Truck size={14} className="text-[#1D9E75]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{kpi.dangGiao}</p>
          <p className="text-[11px] text-[#1D9E75] mt-1 flex items-center gap-1">
            <Truck size={10} /> đơn trên đường
          </p>
        </button>

        <div className="bg-white rounded-[10px] border border-[#3B6D11]/20 p-4 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.06em]">Hôm nay</span>
            <div className="w-7 h-7 bg-[#EAF3DE] rounded-lg flex items-center justify-center">
              <DollarSign size={14} className="text-[#3B6D11]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{kpi.daGiaoHomNay}<span className="text-sm text-gray-400 font-normal">/{kpi.tongDonHomNay} đơn</span></p>
          <p className="text-[11px] text-[#3B6D11] mt-1 font-medium">
            {fmtCurrency(kpi.doanhThuHomNay)}
          </p>
        </div>
      </div>

      {/* ── Alert banner: chờ xác nhận CK ── */}
      {bankPendingOrders.length > 0 && (
        <div className="bg-[#E8F5F0] border border-[#1D9E75]/30 border-l-4 border-l-[#1D9E75] rounded-[10px] p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-[#1D9E75] mt-0.5 shrink-0" size={18} />
            <div>
              <h3 className="text-[#1D9E75] font-semibold text-[14px]">
                Có {bankPendingOrders.length} đơn chờ xác nhận chuyển khoản
              </h3>
              <p className="text-[12px] text-[#1D9E75]/80 mt-0.5">
                Kiểm tra tài khoản ngân hàng và xác nhận các giao dịch khớp.
              </p>
            </div>
          </div>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkConfirm}
              disabled={bulkLoading}
              className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#1D9E75] hover:bg-[#158a63] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {bulkLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckSquare size={13} />}
              Xác nhận {selectedIds.size} đơn
            </button>
          )}
        </div>
      )}

      {/* ── Toolbar: Tabs + Search + Filter ── */}
      <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-3 space-y-3">
        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto pb-0.5">
          {ORDER_TABS.map((tab) => {
            const count = getTabCount(tab.id);
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedIds(new Set()); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[14px] font-medium transition-all whitespace-nowrap ${
                  isActive ? `${tab.activeBg} ${tab.activeText}` : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Icon size={14} />
                {tab.label}
                {count > 0 && (
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full text-white ${isActive ? tab.badgeBg : "bg-gray-300"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search + Filter row */}
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Tìm theo mã đơn, tên khách, SĐT..."
              className="w-full pl-9 pr-4 py-2 text-[14px] bg-[#F5F5F4] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/40 focus:border-[#1D9E75]"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(""); setSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 text-[14px] bg-[#F5F5F4] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/40"
          >
            <option value="">Tất cả TT</option>
            <option value="COD">Tiền mặt (COD)</option>
            <option value="BANK">Chuyển khoản</option>
            <option value="VNPAY">VNPay</option>
            <option value="MOMO">MoMo</option>
          </select>

          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2 py-2 text-[13px] bg-[#F5F5F4] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/40"
            />
            <span className="text-gray-400 text-[12px]">→</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2 py-2 text-[13px] bg-[#F5F5F4] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/40"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-[14px] bg-[#F5F5F4] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/40"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="highest">Giá cao</option>
            <option value="lowest">Giá thấp</option>
          </select>

          {(activeTab || search || paymentFilter || dateFrom || dateTo || sortBy !== "newest") && (
            <button
              onClick={() => { setActiveTab(""); setSearch(""); setSearchInput(""); setPaymentFilter(""); setDateFrom(""); setDateTo(""); setSortBy("newest"); }}
              className="px-3 py-2 text-[13px] text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1"
            >
              <X size={13} /> Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* ── Bulk selection bar ── */}
      {bankPendingOrders.length > 0 && (
        <div className="flex items-center gap-3 px-1">
          <button
            onClick={selectAllVisible}
            className="flex items-center gap-1.5 text-[12px] text-[#1D9E75] hover:text-[#1D9E75]/80 font-medium"
          >
            {selectedIds.size === bankPendingOrders.length ? <CheckSquare size={14} /> : <Square size={14} />}
            {selectedIds.size === bankPendingOrders.length ? "Bỏ chọn tất cả" : `Chọn tất cả ${bankPendingOrders.length} đơn chờ CK`}
          </button>
          {selectedIds.size > 0 && (
            <span className="text-[12px] text-gray-400">· Đã chọn {selectedIds.size} đơn</span>
          )}
        </div>
      )}

      {/* ── Split View: table (60%) + preview (40%) ── */}
      <div className={`flex gap-4 ${selectedOrder ? "items-start" : ""}`}>
        {/* Left — Order table */}
        <div className={`bg-white rounded-[10px] shadow-sm border border-gray-100 overflow-hidden transition-all ${selectedOrder ? "w-[60%]" : "flex-1"}`}>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="animate-spin text-[#1D9E75]" size={28} />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <CheckCircle2 size={36} className="mb-3 text-gray-300" />
              <p className="text-[14px]">Không có đơn hàng nào</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-[14px]">
                  <thead className="bg-[#F5F5F4] text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-3 py-3 w-8"></th>
                      <th className="px-3 py-3 text-left"><span className="text-[11px] font-medium uppercase tracking-[0.06em]">Mã đơn</span></th>
                      <th className="px-3 py-3 text-left"><span className="text-[11px] font-medium uppercase tracking-[0.06em]">Khách hàng</span></th>
                      <th className="px-3 py-3 text-left"><span className="text-[11px] font-medium uppercase tracking-[0.06em]">Thanh toán</span></th>
                      <th className="px-3 py-3 text-left"><span className="text-[11px] font-medium uppercase tracking-[0.06em]">Trạng thái</span></th>
                      <th className="px-3 py-3 text-right"><span className="text-[11px] font-medium uppercase tracking-[0.06em]">Tổng tiền</span></th>
                      <th className="px-3 py-3 text-left"><span className="text-[11px] font-medium uppercase tracking-[0.06em]">Vận đơn</span></th>
                      <th className="px-3 py-3 text-left"><span className="text-[11px] font-medium uppercase tracking-[0.06em]">Thời gian</span></th>
                      <th className="px-3 py-3 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => {
                      const isSelected = selectedOrder?.id === order.id;
                      const payMethod = PAYMENT_METHOD_LABELS[order.paymentMethod] ?? PAYMENT_METHOD_LABELS.COD;
                      const PayIcon = payMethod.icon;
                      const payStatus = PAYMENT_STATUS_CONFIG[order.paymentStatus];
                      const orderStatus = ORDER_STATUS_CONFIG[order.status];
                      const isBankPending = order.paymentMethod !== "COD" && order.paymentStatus === "CHO_THANH_TOAN";

                      return (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrder(isSelected ? null : order)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-[#E8F5F0] border-l-4 border-l-[#1D9E75]" : "hover:bg-[#F5F5F4]"
                          }`}
                        >
                          <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                            {isBankPending ? (
                              <button onClick={() => toggleSelect(order.id)}>
                                {selectedIds.has(order.id)
                                  ? <CheckSquare size={15} className="text-[#1D9E75]" />
                                  : <Square size={15} className="text-gray-300 hover:text-gray-500" />}
                              </button>
                            ) : null}
                          </td>

                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <div>
                                <p className="font-bold text-gray-900 font-mono text-[13px]">{order.maHienThi}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{order.itemCount} SP</p>
                              </div>
                              {order.isUrgent && (
                                <span className="text-[9px] font-bold px-1 py-0.5 bg-[#FCEBEB] text-[#A32D2D] rounded-full animate-pulse">MỚI</span>
                              )}
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            <p className="font-medium text-gray-800 text-[13px]">{order.customerName}</p>
                            <p className="text-[11px] text-gray-400">{order.customerPhone}</p>
                          </td>

                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1 mb-1">
                              <PayIcon size={11} className={payMethod.color} />
                              <span className="text-[11px] font-medium text-gray-600">{payMethod.label}</span>
                            </div>
                            {payStatus && (
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${payStatus.style}`}>
                                {payStatus.label}
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-3">
                            {orderStatus && (
                              <span className={`text-[10px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-0.5 ${orderStatus.style}`}>
                                <span>{orderStatus.icon}</span>
                                {orderStatus.label}
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-right">
                            <p className="text-[14px] font-semibold text-gray-900 font-mono">{fmtCurrency(order.total)}</p>
                          </td>

                          <td className="px-3 py-3">
                            {order.maVanDon ? (
                              <span className="text-[11px] font-mono text-[#1D9E75] bg-[#E8F5F0] px-1.5 py-0.5 rounded">
                                {order.maVanDon.slice(-8)}
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-300">—</span>
                            )}
                          </td>

                          <td className="px-3 py-3">
                            <p className="text-[11px] text-gray-500">{order.ngayTao ? fmtDate(order.ngayTao) : ""}</p>
                            <p className="text-[10px] text-gray-400">{order.timeAgo}</p>
                          </td>

                          <td className="px-3 py-3">
                            <ChevronRight size={14} className={`transition-transform ${isSelected ? "rotate-90 text-[#1D9E75]" : "text-gray-300"}`} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <p className="text-[12px] text-gray-400">
                    Hiển thị {(page - 1) * limit + 1}-{Math.min(page * limit, total)} / {total} đơn
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (page <= 3) pageNum = i + 1;
                      else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = page - 2 + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-7 h-7 rounded-lg text-[12px] font-medium ${
                            page === pageNum ? "bg-[#1D9E75] text-white" : "text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right — Quick Preview Panel */}
        {selectedOrder && (
          <div className="w-[40%] bg-white rounded-[10px] shadow-sm border border-gray-100 overflow-hidden flex flex-col sticky top-4">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-[#F5F5F4]">
              <div>
                <h2 className="font-bold text-gray-900 font-mono text-[15px]">{selectedOrder.maHienThi}</h2>
                <p className="text-[12px] text-gray-500">{selectedOrder.timeAgo}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 ml-2">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[70vh]">
              {/* Khách hàng + Thanh toán */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.06em] mb-1">Khách hàng</p>
                  <p className="font-semibold text-gray-900 text-[14px]">{selectedOrder.customerName}</p>
                  <p className="text-[12px] text-gray-500">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.06em] mb-1">Thanh toán</p>
                  {(() => {
                    const pm = PAYMENT_METHOD_LABELS[selectedOrder.paymentMethod] ?? PAYMENT_METHOD_LABELS.COD;
                    const PMIcon = pm.icon;
                    const ps = PAYMENT_STATUS_CONFIG[selectedOrder.paymentStatus];
                    return (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <PMIcon size={12} className={pm.color} />
                          <span className="font-medium text-gray-800 text-[13px]">{pm.label}</span>
                        </div>
                        {ps && (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ps.style}`}>{ps.label}</span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Địa chỉ */}
              {selectedOrder.address && (
                <div>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.06em] mb-1">Giao đến</p>
                  <p className="text-[13px] text-gray-700 leading-relaxed">{selectedOrder.address}</p>
                </div>
              )}

              {/* Vận đơn */}
              {selectedOrder.maVanDon && (
                <div className="bg-[#E8F5F0] border border-[#1D9E75]/20 rounded-lg p-2.5">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.06em] mb-1">Mã vận đơn GHN</p>
                  <p className="font-mono text-[13px] text-[#1D9E75] font-semibold">{selectedOrder.maVanDon}</p>
                </div>
              )}

              {/* Sản phẩm */}
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.06em] mb-1">Sản phẩm ({selectedOrder.itemCount})</p>
                <p className="text-[13px] text-gray-700 bg-[#F5F5F4] rounded-lg p-2.5 leading-relaxed">{selectedOrder.products || "—"}</p>
              </div>

              {/* Ghi chú */}
              {selectedOrder.notes && (
                <div>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.06em] mb-1">Ghi chú</p>
                  <p className="text-[12px] text-[#BA7517] italic bg-[#FAEEDA] border border-[#BA7517]/20 rounded-lg p-2.5 whitespace-pre-line">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Tổng tiền */}
              <div className="pt-2 border-t border-gray-100 space-y-1">
                {selectedOrder.shippingFee > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-gray-400">Phí vận chuyển</span>
                    <span className="text-[12px] text-gray-500 font-mono">{fmtCurrency(selectedOrder.shippingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-gray-500">Tổng cộng</span>
                  <span className="text-[16px] font-semibold text-gray-900 font-mono">{fmtCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Timeline mini */}
              {selectedOrder.timeline.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.06em] mb-2">Lịch sử đơn</p>
                  <div className="space-y-1.5">
                    {selectedOrder.timeline.slice(-4).map((t, i) => {
                      const cfg = ORDER_STATUS_CONFIG[t.trangThai ?? ""];
                      return (
                        <div key={i} className="flex items-center gap-2 text-[12px]">
                          <span className="text-[11px]">{cfg?.icon ?? "•"}</span>
                          <span className="font-medium text-gray-700">{cfg?.label ?? t.trangThai}</span>
                          <span className="text-gray-400 ml-auto text-[11px]">
                            {t.thoiGian ? new Date(t.thoiGian).toLocaleString("vi-VN", {
                              hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit",
                            }) : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="p-4 border-t border-gray-100 space-y-2">
              <Link
                href={`/staff/orders/${selectedOrder.id}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#3B6D11] hover:bg-[#2d5409] text-white font-semibold rounded-[10px] transition-colors text-[14px]"
              >
                <Eye size={15} /> Xử lý đơn hàng
                <ChevronRight size={15} />
              </Link>
              <button
                onClick={() => {
                  const url = `/staff/orders/${selectedOrder.id}`;
                  window.open(url, "_blank");
                }}
                className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium rounded-[10px] transition-colors text-[13px]"
              >
                <Printer size={13} /> In phiếu giao hàng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
