'use client'

import {
  Calendar, Eye, Truck, RotateCcw,
  CheckCircle2, X, Save, Package, User, CreditCard,
  Search, Clock, Ban, ShoppingBag, DollarSign,
  MapPin, Phone, ExternalLink, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Pagination from "@/components/ui/Pagination";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import toast from "react-hot-toast";

// ── Constants ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; icon: any; bg: string; text: string; dot: string }> = {
  CHO_XAC_NHAN:    { label: 'Chờ duyệt',      icon: Clock,       bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400' },
  CHO_XU_LY:       { label: 'Chờ xử lý',     icon: Clock,       bg: 'bg-orange-50',  text: 'text-orange-700', dot: 'bg-orange-400' },
  CHO_GIAO_HANG:   { label: 'Chờ giao hàng', icon: Package,     bg: 'bg-sky-50',     text: 'text-sky-700',    dot: 'bg-sky-400' },
  DANG_GIAO_HANG:  { label: 'Đang giao',      icon: Truck,       bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-400' },
  DA_GIAO:         { label: 'Đã giao',        icon: CheckCircle2,bg: 'bg-emerald-50', text: 'text-emerald-700',dot: 'bg-emerald-400' },
  DA_HUY:          { label: 'Đã hủy',         icon: Ban,         bg: 'bg-rose-50',    text: 'text-rose-700',   dot: 'bg-rose-400' },
  YEU_CAU_DOI_TRA: { label: 'Đổi/Trả',       icon: RotateCcw,   bg: 'bg-purple-50',  text: 'text-purple-700', dot: 'bg-purple-400' },
};

const PAYMENT_LABEL: Record<string, string> = {
  COD: 'COD', cod: 'COD',
  VNPAY: 'VNPay', vnpay: 'VNPay',
  MOMO: 'MoMo', momo: 'MoMo',
  BANK: 'Chuyển khoản',
};

const fmt = (n: any) => Number(n || 0).toLocaleString('vi-VN') + 'đ';
const fmtDate = (s: string) => {
  if (!s) return '—';
  const d = new Date(s);
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')} ${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
};

// ── StatusBadge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, icon: AlertCircle, bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent, sub }: { icon: any; label: string; value: string | number; accent: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders, setOrders]           = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalOrders, setTotalOrders]   = useState(0);
  const [stats, setStats]               = useState({ total: 0, revenue: 0, pending: 0, delivering: 0 });

  const [viewingOrder, setViewingOrder] = useState<any>(null);
  const [newStatus, setNewStatus]       = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isPushing, setIsPushing]           = useState(false);
  const [isHandlingReturn, setIsHandlingReturn] = useState(false);
  const [isCreatingGHN, setIsCreatingGHN]   = useState(false);
  const [isCancellingGHN, setIsCancellingGHN] = useState(false);
  const [isEditingDate, setIsEditingDate]   = useState(false);
  const [editingDateValue, setEditingDateValue] = useState('');

  // States cho modal hủy đơn admin
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonDetail, setCancelReasonDetail] = useState('');
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean; title: string; message: string; onConfirm: () => void}>({isOpen: false, title: "", message: "", onConfirm: () => {}});

  const searchTimer = useRef<any>(null);

  const FILTERS = [
    { key: 'ALL',            label: 'Tất cả' },
    { key: 'CHO_XAC_NHAN',   label: 'Chờ duyệt' },
    { key: 'CHO_XU_LY',      label: 'Chờ xử lý' },
    { key: 'CHO_GIAO_HANG',  label: 'Chờ giao hàng' },
    { key: 'DANG_GIAO_HANG', label: 'Đang giao' },
    { key: 'DA_GIAO',        label: 'Đã giao' },
    { key: 'DA_HUY',         label: 'Đã hủy' },
    { key: 'YEU_CAU_DOI_TRA',label: 'Đổi/Trả' },
  ];

  const fetchOrders = async (page = currentPage) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({
        page: page.toString(), limit: '15',
        status: activeFilter !== 'ALL' ? activeFilter : '',
        date: selectedDate, search,
      });
      const res = await fetch(`/api/admin/orders?${p}`);
      if (!res.ok) return;
      const json = await res.json();
      const data = json.data || json;
      setOrders(data);
      setTotalPages(json.meta?.totalPages || 1);
      setTotalOrders(json.meta?.total || data.length);
      // compute stats from current page + meta
      const pending    = data.filter((o: any) => o.trang_thai === 'CHO_XAC_NHAN').length;
      const delivering = data.filter((o: any) => o.trang_thai === 'DANG_GIAO_HANG').length;
      const revenue    = data.reduce((s: number, o: any) => s + Number(o.tong_tien || 0), 0);
      setStats({ total: json.meta?.total || data.length, revenue, pending, delivering });
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(currentPage); }, [currentPage, activeFilter, selectedDate, search]);
  useEffect(() => { setCurrentPage(1); }, [activeFilter, selectedDate, search]);

  const handleSearchChange = (v: string) => {
    setSearchInput(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(v), 400);
  };

  const openModal = (order: any) => { setViewingOrder(order); setNewStatus(order.trang_thai); setIsEditingDate(false); };

  const handleUpdateStatus = async () => {
    if (!viewingOrder || !newStatus || newStatus === viewingOrder.trang_thai) return;
    if (newStatus === 'DA_HUY') {
      setShowCancelModal(true);
      return;
    }
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/admin/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: viewingOrder.id, status: newStatus }) });
      const d = await res.json();
      if (d.success || res.ok) {
        setOrders(o => o.map(x => x.id === viewingOrder.id ? { ...x, trang_thai: newStatus } : x));
        setViewingOrder((v: any) => ({ ...v, trang_thai: newStatus }));
        toast.success('Cập nhật trạng thái thành công!');
      } else toast.error(d.message || 'Không thể cập nhật');
    } catch { toast.error('Lỗi hệ thống!'); }
    finally { setUpdatingStatus(false); }
  };

  const handleAdminCancelOrder = async () => {
    if (!cancelReason) {
      toast.error('Vui lòng chọn lý do hủy đơn!');
      return;
    }
    setIsCancellingOrder(true);
    const fullReason = cancelReason + (cancelReasonDetail ? ' - ' + cancelReasonDetail : '');
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: viewingOrder.id, status: 'DA_HUY', ly_do_huy: fullReason }),
      });
      const d = await res.json();
      if (d.success || res.ok) {
        setOrders(o => o.map(x => x.id === viewingOrder.id ? { ...x, trang_thai: 'DA_HUY', ly_do_huy: fullReason } : x));
        setViewingOrder((v: any) => ({ ...v, trang_thai: 'DA_HUY', ly_do_huy: fullReason }));
        setNewStatus('DA_HUY');
        toast.success('Đã hủy đơn hàng thành công!');
        setShowCancelModal(false);
        setCancelReason('');
        setCancelReasonDetail('');
      } else toast.error(d.message || 'Không thể hủy đơn');
    } catch { toast.error('Lỗi hệ thống!'); }
    finally { setIsCancellingOrder(false); }
  };

  const handleSendToCourier = async (orderId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Gửi đơn cho GHTK',
      message: 'Xác nhận gửi đơn này cho GHTK?',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setIsPushing(true);
        try {
          const res = await fetch('/api/admin/shipping', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, partnerId: 1 }) });
          const d = await res.json();
          if (d.success) { toast.success('Mã vận đơn: ' + d.data.ma_van_don); fetchOrders(); setViewingOrder(null); }
          else toast.error(d.message);
        } catch { toast.error('Lỗi kết nối!'); }
        finally { setIsPushing(false); }
      },
    });
  };

  const handleCreateGHNOrder = async (orderId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Tạo vận đơn GHN',
      message: `Tạo vận đơn GHN cho đơn #${orderId}?`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setIsCreatingGHN(true);
        try {
          const res = await fetch('/api/ghn/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          });
          const d = await res.json();
          if (d.success || d.order_code) {
            toast.success(`Tạo vận đơn thành công! Mã: ${d.order_code}`);
            await fetch('/api/admin/orders', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId, status: 'DANG_GIAO_HANG' }),
            });
            fetchOrders();
            setViewingOrder(null);
          } else {
            toast.error(d.error || d.message || 'Không tạo được vận đơn');
          }
        } catch { toast.error('Lỗi kết nối!'); }
        finally { setIsCreatingGHN(false); }
      },
    });
  };

  const handleCancelGHN = async (orderId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hủy vận đơn GHN',
      message: `Hủy vận đơn GHN cho đơn #${orderId}?`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setIsCancellingGHN(true);
        try {
          const res = await fetch('/api/ghn/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          });
          const d = await res.json();
          if (d.success) {
            toast.success('Đã hủy vận đơn GHN thành công!');
            fetchOrders();
            setViewingOrder(null);
          } else {
            toast.error(d.message || 'Không hủy được vận đơn');
          }
        } catch { toast.error('Lỗi kết nối!'); }
        finally { setIsCancellingGHN(false); }
      },
    });
  };

  const handleReturnAction = async (orderId: number, returnStatus: 'DA_DUYET' | 'TU_CHOI') => {
    const label = returnStatus === 'DA_DUYET' ? 'CHẤP NHẬN' : 'TỪ CHỐI';
    setConfirmDialog({
      isOpen: true,
      title: 'Xử lý yêu cầu đổi/trả',
      message: `Bạn có chắc muốn ${label} yêu cầu đổi/trả đơn #${orderId}?`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setIsHandlingReturn(true);
        try {
          const res = await fetch('/api/admin/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'HANDLE_RETURN', orderId, returnStatus }) });
          const d = await res.json();
          if (d.success) { fetchOrders(); setViewingOrder(null); }
          else toast.error(d.message);
        } catch { toast.error('Lỗi kết nối!'); }
        finally { setIsHandlingReturn(false); }
      },
    });
  };

  const handleUpdateDate = async () => {
    if (!editingDateValue) return;
    try {
      const res = await fetch('/api/admin/shipping', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shipmentId: viewingOrder.don_van_chuyen[0].id, newDate: editingDateValue }) });
      const d = await res.json();
      if (d.success) { fetchOrders(); setIsEditingDate(false); setViewingOrder(null); }
      else toast.error(d.message);
    } catch { toast.error('Lỗi kết nối!'); }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2C2C2A]">Quản lý đơn hàng</h1>
          <p className="text-sm text-[#888780] mt-0.5">Theo dõi và xử lý tất cả đơn hàng từ khách hàng</p>
        </div>
        <button onClick={() => fetchOrders()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <Search size={14} /> Làm mới
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag}  label="Tổng đơn hàng"   value={stats.total.toLocaleString()}                  accent="bg-[#1D9E75]" sub="tất cả trạng thái" />
        <StatCard icon={DollarSign}   label="Doanh thu trang" value={fmt(stats.revenue)}                            accent="bg-blue-500"   sub="trang hiện tại" />
        <StatCard icon={Clock}        label="Chờ xác nhận"    value={stats.pending}                                 accent="bg-amber-500"  sub="cần xử lý" />
        <StatCard icon={Truck}        label="Đang giao"       value={stats.delivering}                              accent="bg-purple-500" sub="trên đường" />
      </div>

      {/* ── Filter + Search Bar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Search row */}
        <div className="px-4 pt-4 pb-3 flex flex-col sm:flex-row gap-3 border-b border-gray-50">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Tìm theo mã đơn, tên khách, email..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/10 transition-all"
            />
          </div>
          <div className="relative flex items-center">
            <Calendar size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
            <input
              type="date" value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/10 transition-all cursor-pointer"
            />
            {selectedDate && (
              <button onClick={() => setSelectedDate('')} className="absolute right-2 p-0.5 text-gray-400 hover:text-rose-500 transition-colors">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex overflow-x-auto px-4 custom-scrollbar">
          {FILTERS.map(f => {
            const cfg = STATUS_CONFIG[f.key];
            const isActive = activeFilter === f.key;
            return (
              <button key={f.key} onClick={() => setActiveFilter(f.key)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive ? 'border-[#1D9E75] text-[#1D9E75]' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {cfg && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? cfg.dot : 'bg-gray-300'}`} />}
                {f.label}
              </button>
            );
          })}
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-t border-gray-50 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Mã ĐH</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Khách hàng</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Địa chỉ giao</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Ngày đặt</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Thanh toán</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <div className="w-7 h-7 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-sm text-gray-400">
                  <ShoppingBag size={32} className="mx-auto mb-3 text-gray-200" />
                  Không có đơn hàng nào
                </td></tr>
              ) : orders.map(order => {
                const addr = order.nguoi_dung?.ho_so_nguoi_dung?.dia_chi || order.dia_chi_giao_hang || '—';
                const shortAddr = addr.length > 30 ? addr.slice(0, 30) + '…' : addr;
                const hasReturn = order.yeu_cau_doi_tra?.length > 0;
                return (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1D9E75] text-sm">#{order.id}</span>
                        {hasReturn && (
                          <span className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center" title="Có yêu cầu đổi/trả">
                            <RotateCcw size={9} className="text-purple-600" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{order.chi_tiet_don_hang?.length || 0} sản phẩm</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <img className="w-full h-full object-cover"
                            src={order.nguoi_dung?.ho_so_nguoi_dung?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || 'U')}&background=1D9E75&color=fff&size=64`}
                            alt="" onError={(e: any) => { e.target.src = `https://ui-avatars.com/api/?name=U&background=1D9E75&color=fff&size=64`; }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                            {order.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || order.nguoi_dung?.email || `#${order.ma_nguoi_dung}`}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[140px]">{order.nguoi_dung?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-1.5 max-w-[160px]">
                        <MapPin size={12} className="text-gray-300 mt-0.5 shrink-0" />
                        <span className="text-xs text-gray-500 leading-relaxed">{shortAddr}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">{fmtDate(order.ngay_tao)}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                        <CreditCard size={11} />
                        {PAYMENT_LABEL[order.phuong_thuc_thanh_toan] || order.phuong_thuc_thanh_toan || 'COD'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-bold text-sm text-[#1D9E75]">{fmt(order.tong_tien)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <StatusBadge status={order.trang_thai} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {order.trang_thai === 'CHO_XAC_NHAN' && (
                          <button onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const res = await fetch('/api/staff/orders', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'CONFIRM_PAYMENT', orderId: order.id }),
                                });
                                const d = await res.json();
                                if (d.success) {
                                  toast.success(`Đã duyệt đơn #${order.id}`);
                                  fetchOrders();
                                } else toast.error(d.message || 'Lỗi duyệt đơn');
                              } catch { toast.error('Lỗi hệ thống!'); }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-[#1D9E75] rounded-lg hover:bg-[#158a63] transition-all"
                            title="Duyệt đơn">
                            <CheckCircle2 size={12} /> Duyệt
                          </button>
                        )}
                        <button onClick={() => openModal(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-[#1D9E75] hover:text-[#1D9E75] transition-all group-hover:border-gray-300">
                          <Eye size={13} /> Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-50 px-4 py-3 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Hiển thị {orders.length} / {totalOrders} đơn hàng
          </p>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          DRAWER CHI TIẾT ĐƠN HÀNG (slide từ phải)
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewingOrder && (
          <div className="fixed inset-0 z-[100] flex">
            {/* Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 bg-black/40 backdrop-blur-[2px]" onClick={() => setViewingOrder(null)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden"
            >
              {/* ── Drawer Header ── */}
              <div className="shrink-0 bg-white border-b border-gray-100">
                <div className="flex items-start justify-between px-5 pt-5 pb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">#{viewingOrder.id}</span>
                      <StatusBadge status={viewingOrder.trang_thai} />
                      {viewingOrder.yeu_cau_doi_tra?.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-semibold border border-rose-100">
                          <RotateCcw size={9} /> Yêu cầu đổi/trả
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Đặt lúc {fmtDate(viewingOrder.ngay_tao)}</p>
                  </div>
                  <button onClick={() => setViewingOrder(null)} className="ml-3 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors shrink-0">
                    <X size={15} />
                  </button>
                </div>
                <OrderTimeline order={viewingOrder} />
              </div>

              {/* ── Drawer Body ── */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">

                {/* Yêu cầu đổi/trả */}
                {viewingOrder.yeu_cau_doi_tra?.length > 0 && (
                  <div className="mx-5 mt-5 rounded-xl border border-rose-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-rose-50 border-b border-rose-100">
                      <div className="flex items-center gap-2">
                        <RotateCcw size={13} className="text-rose-500" />
                        <span className="text-sm font-semibold text-rose-800">Yêu cầu đổi / trả</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {viewingOrder.yeu_cau_doi_tra[0].loai_yeu_cau && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            viewingOrder.yeu_cau_doi_tra[0].loai_yeu_cau === 'DOI' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                          }`}>{viewingOrder.yeu_cau_doi_tra[0].loai_yeu_cau === 'DOI' ? 'Đổi hàng' : 'Trả hàng'}</span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          viewingOrder.yeu_cau_doi_tra[0].trang_thai === 'CHO_DUYET' ? 'bg-amber-100 text-amber-700' :
                          viewingOrder.yeu_cau_doi_tra[0].trang_thai === 'DA_DUYET'  ? 'bg-emerald-100 text-emerald-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>{viewingOrder.yeu_cau_doi_tra[0].trang_thai}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3 bg-white">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Lý do đổi/trả</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100 leading-relaxed">
                          {viewingOrder.yeu_cau_doi_tra[0].ly_do_hoan_tra || 'Không có mô tả'}
                        </p>
                      </div>
                      {viewingOrder.yeu_cau_doi_tra[0].anh_minh_chung && (
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Hình ảnh minh chứng</p>
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              try {
                                const images = JSON.parse(viewingOrder.yeu_cau_doi_tra[0].anh_minh_chung);
                                return (Array.isArray(images) ? images : [images]).map((img: string, i: number) => (
                                  <a key={i} href={img} target="_blank" rel="noreferrer" className="block w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-[#1D9E75] transition-colors">
                                    <img src={img} alt={`Minh chứng ${i + 1}`} className="w-full h-full object-cover" />
                                  </a>
                                ));
                              } catch {
                                return (
                                  <a href={viewingOrder.yeu_cau_doi_tra[0].anh_minh_chung} target="_blank" rel="noreferrer" className="block w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-[#1D9E75] transition-colors">
                                    <img src={viewingOrder.yeu_cau_doi_tra[0].anh_minh_chung} alt="Minh chứng" className="w-full h-full object-cover" />
                                  </a>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      )}
                      {viewingOrder.yeu_cau_doi_tra[0].trang_thai === 'CHO_DUYET' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleReturnAction(viewingOrder.id, 'DA_DUYET')} disabled={isHandlingReturn}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1D9E75] text-white text-xs font-semibold rounded-lg hover:bg-[#158a63] disabled:opacity-50 transition-colors">
                            <CheckCircle2 size={13} /> {isHandlingReturn ? 'Đang xử lý…' : 'Chấp nhận'}
                          </button>
                          <button onClick={() => handleReturnAction(viewingOrder.id, 'TU_CHOI')} disabled={isHandlingReturn}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                            <X size={13} /> Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Lý do hủy đơn */}
                {viewingOrder.trang_thai === 'DA_HUY' && viewingOrder.ly_do_huy && (
                  <div className="mx-5 mt-5 rounded-xl border border-rose-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 border-b border-rose-100">
                      <Ban size={13} className="text-rose-500" />
                      <span className="text-sm font-semibold text-rose-800">Lý do hủy đơn</span>
                    </div>
                    <div className="p-4 bg-white">
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100 leading-relaxed">
                        {viewingOrder.ly_do_huy}
                      </p>
                    </div>
                  </div>
                )}

                {/* Sản phẩm đã đặt */}
                <section className="px-5 mt-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Sản phẩm đã đặt</p>
                    <span className="text-xs text-gray-400">{viewingOrder.chi_tiet_don_hang?.length || 0} mặt hàng</span>
                  </div>
                  <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                    {viewingOrder.chi_tiet_don_hang?.map((item: any, idx: number) => {
                      const name    = item.bien_the_san_pham?.san_pham?.ten_san_pham || `Sản phẩm #${item.ma_bien_the}`;
                      const variant = item.bien_the_san_pham?.ten_bien_the || '';
                      const unit    = item.bien_the_san_pham?.don_vi_tinh || '';
                      const qty     = Number(item.so_luong || 0);
                      const price   = Number(item.don_gia || 0);
                      const img     = item.bien_the_san_pham?.san_pham?.anh_san_pham?.[0]?.duong_dan_anh;
                      return (
                        <div key={idx} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                          <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                            <img src={img || `https://placehold.co/80x80/f3f4f6/9ca3af?text=${encodeURIComponent(name[0] || 'P')}`}
                              alt="" className="w-full h-full object-cover"
                              onError={(e: any) => { e.target.src = `https://placehold.co/80x80/f3f4f6/9ca3af?text=P`; }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                            {(variant || unit) && (
                              <p className="text-xs text-gray-400 mt-0.5">{[variant, unit].filter(Boolean).join(' · ')}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-0.5">
                              {price.toLocaleString('vi-VN')}đ
                              <span className="text-gray-300 mx-1.5">×</span>
                              {qty}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-800 shrink-0">{(price * qty).toLocaleString('vi-VN')}đ</p>
                        </div>
                      );
                    })}
                    {/* Tổng */}
                    <div className="bg-gray-50/60 px-4 py-3 space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Tạm tính</span>
                        <span>{(Number(viewingOrder.tong_tien||0) - Number(viewingOrder.phi_van_chuyen||0)).toLocaleString('vi-VN')}đ</span>
                      </div>
                      {Number(viewingOrder.phi_van_chuyen||0) > 0 && (
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Phí vận chuyển</span>
                          <span>{fmt(viewingOrder.phi_van_chuyen)}</span>
                        </div>
                      )}
                      {Number(viewingOrder.giam_gia||0) > 0 && (
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Giảm giá</span>
                          <span className="text-rose-600">−{fmt(viewingOrder.giam_gia)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-1">
                        <span className="text-sm font-semibold text-gray-700">Tổng thanh toán</span>
                        <span className="text-lg font-bold text-[#1D9E75]">{fmt(viewingOrder.tong_tien)}</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Khách hàng */}
                <section className="px-5 mt-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Khách hàng</p>
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    {/* Avatar */}
                    <div className="flex items-center gap-3 p-4 border-b border-gray-50">
                      <img src={viewingOrder.nguoi_dung?.ho_so_nguoi_dung?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(viewingOrder.nguoi_dung?.ho_so_nguoi_dung?.ho_ten||'K')}&background=1D9E75&color=fff&size=80`}
                        alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#1D9E75]/20 shrink-0"
                        onError={(e:any)=>{e.target.src=`https://ui-avatars.com/api/?name=K&background=1D9E75&color=fff&size=80`;}} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {viewingOrder.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || 'Khách hàng'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{viewingOrder.nguoi_dung?.email || ''}</p>
                      </div>
                    </div>
                    {/* Info rows */}
                    <div className="divide-y divide-gray-50">
                      {/* Thanh toán */}
                      {(() => {
                        const method = viewingOrder.giao_dich_thanh_toan?.[0]?.phuong_thuc_thanh_toan || 'COD';
                        const payStatus = viewingOrder.giao_dich_thanh_toan?.[0]?.trang_thai;
                        return (
                          <div className="flex items-center justify-between px-4 py-2.5">
                            <div className="flex items-center gap-2.5 text-xs text-gray-500">
                              <CreditCard size={13} className="text-gray-300 shrink-0" />
                              <div>
                                <p className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">Thanh toán</p>
                                <p className="font-semibold text-gray-800">{PAYMENT_LABEL[method] || method}</p>
                              </div>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              payStatus === 'DA_THANH_TOAN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              payStatus === 'THANH_TOAN_THAT_BAI' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                              'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}>
                              {!payStatus || payStatus === 'CHO_THANH_TOAN' ? 'Chờ TT' :
                               payStatus === 'DA_THANH_TOAN' ? '✓ Đã TT' : '✗ Thất bại'}
                            </span>
                          </div>
                        );
                      })()}
                      {viewingOrder.nguoi_dung?.ho_so_nguoi_dung?.so_dien_thoai && (
                        <div className="flex items-center gap-2.5 px-4 py-2.5">
                          <Phone size={13} className="text-gray-300 shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">Điện thoại</p>
                            <p className="text-xs font-semibold text-gray-800">{viewingOrder.nguoi_dung.ho_so_nguoi_dung.so_dien_thoai}</p>
                          </div>
                        </div>
                      )}
                      {(viewingOrder.dia_chi_giao_hang || viewingOrder.nguoi_dung?.ho_so_nguoi_dung?.dia_chi) && (
                        <div className="flex items-start gap-2.5 px-4 py-2.5">
                          <MapPin size={13} className="text-gray-300 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">Địa chỉ giao hàng</p>
                            <p className="text-xs font-semibold text-gray-800 leading-relaxed">
                              {viewingOrder.dia_chi_giao_hang || viewingOrder.nguoi_dung?.ho_so_nguoi_dung?.dia_chi}
                            </p>
                          </div>
                        </div>
                      )}
                      {viewingOrder.ghi_chu && (
                        <div className="px-4 py-2.5 bg-amber-50/50">
                          <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-0.5">Ghi chú</p>
                          <p className="text-xs text-amber-800 leading-relaxed">{viewingOrder.ghi_chu}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Vận chuyển */}
                <section className="px-5 mt-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Vận chuyển GHN</p>
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    {viewingOrder.don_van_chuyen?.some((s: any) => s.ma_van_don) ? (
                      <div className="divide-y divide-gray-50">
                        {(() => {
                          const ship = viewingOrder.don_van_chuyen.find((s: any) => s.ma_van_don);
                          return (
                            <>
                              <div className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <Package size={13} className="text-gray-300 shrink-0" />
                                  <div>
                                    <p className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">Mã vận đơn GHN</p>
                                    <p className="text-xs font-bold text-gray-800 font-mono tracking-wide">{ship.ma_van_don}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <a href={`https://donhang.ghn.vn/?order_code=${ship.ma_van_don}`} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                                    Tra cứu <ExternalLink size={11} />
                                  </a>
                                  {ship.trang_thai !== 'cancel' && ship.trang_thai !== 'delivered' && (
                                    <button onClick={() => handleCancelGHN(viewingOrder.id)} disabled={isCancellingGHN}
                                      className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline disabled:opacity-50">
                                      <Ban size={11} /> {isCancellingGHN ? 'Đang hủy...' : 'Hủy vận đơn'}
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2.5 px-4 py-2.5">
                                <Truck size={13} className="text-gray-300 shrink-0" />
                                <div>
                                  <p className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">Trạng thái</p>
                                  <p className="text-xs font-semibold text-gray-800 capitalize">{ship.trang_thai || '—'}</p>
                                </div>
                              </div>
                              {ship.ngay_giao_du_kien && (
                                <div className="px-4 py-2.5">
                                  <div className="flex items-start gap-2.5">
                                    <Calendar size={13} className="text-gray-300 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">Ngày giao dự kiến</p>
                                      {isEditingDate ? (
                                        <div className="mt-1.5 space-y-2">
                                          <input type="date" value={editingDateValue} onChange={e => setEditingDateValue(e.target.value)}
                                            className="w-full text-xs p-2 rounded-lg border border-gray-200 outline-none focus:border-[#1D9E75] bg-white" />
                                          <div className="flex gap-1.5">
                                            <button onClick={handleUpdateDate} className="flex-1 text-xs font-semibold bg-[#1D9E75] text-white py-1.5 rounded-lg hover:bg-[#158a63] transition-colors">Lưu</button>
                                            <button onClick={() => setIsEditingDate(false)} className="flex-1 text-xs font-semibold bg-white text-gray-500 border border-gray-200 py-1.5 rounded-lg">Hủy</button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-between mt-0.5">
                                          <p className="text-xs font-semibold text-gray-800">
                                            {new Date(ship.ngay_giao_du_kien).toLocaleDateString('vi-VN')}
                                          </p>
                                          <button onClick={() => { setIsEditingDate(true); setEditingDateValue(ship.ngay_giao_du_kien?.split('T')[0]||''); }}
                                            className="text-[11px] font-semibold text-[#1D9E75] hover:underline">Đổi ngày</button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="p-4">
                        {/* Thông tin địa chỉ giao hàng */}
                        {viewingOrder.dia_chi_giao_hang ? (
                          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Địa chỉ giao hàng</p>
                            <p className="text-xs font-semibold text-gray-800">{viewingOrder.ho_ten_nguoi_nhan} · {viewingOrder.sdt_nguoi_nhan}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{viewingOrder.dia_chi_giao_hang}</p>
                          </div>
                        ) : (
                          <div className="mb-3 flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                            <AlertCircle size={13} className="text-amber-500 shrink-0" />
                            <p className="text-xs text-amber-700">Đơn hàng này chưa có địa chỉ GHN (tỉnh/quận/phường). Không thể tạo vận đơn tự động.</p>
                          </div>
                        )}
                        {/* Nút tạo vận đơn GHN - chỉ hiện sau khi đã duyệt (CHO_GIAO_HANG) */}
                        {viewingOrder.trang_thai === 'CHO_GIAO_HANG' && viewingOrder.dia_chi_giao_hang && (
                          <button onClick={() => handleCreateGHNOrder(viewingOrder.id)} disabled={isCreatingGHN}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#e64b1b] text-white text-xs font-semibold rounded-lg hover:bg-[#c43d14] disabled:opacity-50 transition-colors">
                            {isCreatingGHN ? (
                              <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang tạo vận đơn...</>
                            ) : (
                              <><Truck size={13} /> Tạo vận đơn GHN</>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {/* Nút duyệt đơn (CHO_XAC_NHAN → CHO_XU_LY) */}
                {viewingOrder.trang_thai === 'CHO_XAC_NHAN' && (
                  <div className="px-5 pt-5">
                    <button onClick={async () => {
                        setUpdatingStatus(true);
                        try {
                          const res = await fetch(`/api/staff/orders/${viewingOrder.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'APPROVE_ORDER' }),
                          });
                          const d = await res.json();
                          if (d.success) {
                            toast.success('Đã duyệt đơn, chuyển sang Chờ xử lý!');
                            setOrders(o => o.map(x => x.id === viewingOrder.id ? { ...x, trang_thai: 'CHO_XU_LY' } : x));
                            setViewingOrder((v: any) => ({ ...v, trang_thai: 'CHO_XU_LY' }));
                            setNewStatus('CHO_XU_LY');
                          } else toast.error(d.message || 'Không thể duyệt đơn');
                        } catch { toast.error('Lỗi hệ thống!'); }
                        finally { setUpdatingStatus(false); }
                      }} disabled={updatingStatus}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#1D9E75] text-white text-sm font-bold rounded-xl hover:bg-[#158a63] disabled:opacity-50 transition-colors shadow-sm">
                      {updatingStatus ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={16} />}
                      Duyệt đơn hàng
                    </button>
                  </div>
                )}

                {/* Nút "Xử lý đơn" (CHO_XU_LY → CHO_GIAO_HANG, tạo phiếu xuất kho FEFO) */}
                {viewingOrder.trang_thai === 'CHO_XU_LY' && (
                  <div className="px-5 pt-5">
                    <button onClick={async () => {
                        setUpdatingStatus(true);
                        try {
                          const res = await fetch(`/api/staff/orders/${viewingOrder.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'CONFIRM_ORDER' }),
                          });
                          const d = await res.json();
                          if (d.success) {
                            toast.success('Đã xử lý đơn & tạo phiếu xuất kho!');
                            setOrders(o => o.map(x => x.id === viewingOrder.id ? { ...x, trang_thai: 'CHO_GIAO_HANG' } : x));
                            setViewingOrder((v: any) => ({ ...v, trang_thai: 'CHO_GIAO_HANG' }));
                            setNewStatus('CHO_GIAO_HANG');
                          } else toast.error(d.message || 'Không thể xử lý đơn');
                        } catch { toast.error('Lỗi hệ thống!'); }
                        finally { setUpdatingStatus(false); }
                      }} disabled={updatingStatus}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-sm">
                      {updatingStatus ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Package size={16} />}
                      Xử lý đơn (tạo phiếu xuất kho)
                    </button>
                  </div>
                )}

                {/* Footer actions */}
                <div className="px-5 py-5 mt-2">
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500">Cập nhật trạng thái đơn hàng</p>
                    </div>
                    <div className="p-4 space-y-2.5 bg-white">
                      <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/10 bg-white font-medium text-gray-800 transition-all cursor-pointer">
                        <option value="CHO_XAC_NHAN">⏳ Chờ duyệt</option>
                        <option value="CHO_XU_LY">🔧 Chờ xử lý</option>
                        <option value="CHO_GIAO_HANG">📦 Chờ giao hàng</option>
                        <option value="DANG_GIAO_HANG">🚚 Đang giao hàng</option>
                        <option value="DA_GIAO">✅ Đã giao thành công</option>
                        <option value="YEU_CAU_DOI_TRA">🔄 Yêu cầu đổi/trả</option>
                        <option value="DA_HUY">❌ Đã hủy</option>
                      </select>
                      <button onClick={handleUpdateStatus} disabled={updatingStatus || newStatus === viewingOrder.trang_thai}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1D9E75] text-white text-sm font-semibold rounded-lg hover:bg-[#158a63] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        {updatingStatus ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                        Lưu thay đổi
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          MODAL HỦY ĐƠN HÀNG (ADMIN)
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                  <Ban size={20} className="text-rose-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Hủy đơn hàng</h3>
                  <p className="text-sm text-gray-500">Đơn hàng #{viewingOrder?.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lý do hủy đơn <span className="text-rose-500">*</span></label>
                  <select
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 bg-white transition-all cursor-pointer"
                  >
                    <option value="">Chọn lý do...</option>
                    <option value="Khách hàng yêu cầu hủy">Khách hàng yêu cầu hủy</option>
                    <option value="Hết hàng / Không đủ hàng">Hết hàng / Không đủ hàng</option>
                    <option value="Không liên lạc được khách hàng">Không liên lạc được khách hàng</option>
                    <option value="Đơn hàng trùng lặp">Đơn hàng trùng lặp</option>
                    <option value="Thông tin giao hàng không hợp lệ">Thông tin giao hàng không hợp lệ</option>
                    <option value="Nghi ngờ gian lận">Nghi ngờ gian lận</option>
                    <option value="Lý do khác">Lý do khác</option>
                  </select>
                </div>

                {cancelReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Chi tiết bổ sung</label>
                    <textarea
                      value={cancelReasonDetail}
                      onChange={e => setCancelReasonDetail(e.target.value)}
                      placeholder="Nhập thêm ghi chú về lý do hủy (không bắt buộc)..."
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 bg-white resize-none transition-all"
                    />
                  </div>
                )}

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs text-amber-700 flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    Hành động này sẽ hủy đơn hàng và hoàn lại tồn kho. Lý do hủy sẽ được hiển thị cho khách hàng.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => { setShowCancelModal(false); setCancelReason(''); setCancelReasonDetail(''); }}
                  disabled={isCancellingOrder}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleAdminCancelOrder}
                  disabled={isCancellingOrder || !cancelReason}
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2"
                >
                  {isCancellingOrder ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xử lý...</>
                  ) : (
                    <><Ban size={14} /> Xác nhận hủy đơn</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="warning"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

// ── OrderTimeline ─────────────────────────────────────────────────────────
const TIMELINE_STEPS = [
  { key: 'CHO_XAC_NHAN',   label: 'Chờ duyệt',    icon: Clock },
  { key: 'CHO_XU_LY',      label: 'Chờ xử lý',   icon: Clock },
  { key: 'CHO_GIAO_HANG',  label: 'Chờ giao',    icon: Package },
  { key: 'DANG_GIAO_HANG', label: 'Đang giao',    icon: Truck },
  { key: 'DA_GIAO',        label: 'Hoàn thành',   icon: CheckCircle2 },
];
const CANCELLED_STEPS = [
  { key: 'CHO_XAC_NHAN', label: 'Đặt hàng', icon: Clock },
  { key: 'DA_HUY',        label: 'Đã hủy',   icon: Ban },
];
const RETURN_STEPS = [
  { key: 'DA_GIAO',          label: 'Đã giao',  icon: CheckCircle2 },
  { key: 'YEU_CAU_DOI_TRA',  label: 'Yêu cầu đổi/trả', icon: RotateCcw },
];

function OrderTimeline({ order }: { order: any }) {
  const status = order.trang_thai;
  const isCancelled = status === 'DA_HUY';
  const isReturn    = status === 'YEU_CAU_DOI_TRA';
  const steps = isCancelled ? CANCELLED_STEPS : isReturn ? RETURN_STEPS : TIMELINE_STEPS;

  const normalOrder = ['CHO_XAC_NHAN', 'CHO_XU_LY', 'CHO_GIAO_HANG', 'DANG_GIAO_HANG', 'DA_GIAO'];
  const currentIdx = steps.findIndex(s => s.key === status);

  const getStepState = (stepKey: string, stepIdx: number) => {
    if (isCancelled || isReturn) {
      return stepIdx <= currentIdx ? 'done' : 'pending';
    }
    const orderIdx = normalOrder.indexOf(status);
    const sIdx     = normalOrder.indexOf(stepKey);
    if (sIdx < orderIdx) return 'done';
    if (sIdx === orderIdx) return 'active';
    return 'pending';
  };

  const historyMap: Record<string, string> = {};
  order.lich_su_don_hang?.forEach((h: any) => {
    historyMap[h.trang_thai] = h.thoi_gian_doi;
  });

  return (
    <div className="px-6 pb-4 flex items-center gap-0 overflow-x-auto custom-scrollbar">
      {steps.map((step, idx) => {
        const state = getStepState(step.key, idx);
        const Icon  = step.icon;
        const ts    = historyMap[step.key];
        const isLast = idx === steps.length - 1;
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                state === 'done'   ? 'bg-[#1D9E75] border-[#1D9E75]' :
                state === 'active' ? 'bg-white border-[#1D9E75]' :
                isCancelled && step.key === 'DA_HUY' ? 'bg-rose-500 border-rose-500' :
                'bg-white border-gray-200'
              }`}>
                <Icon size={14} className={
                  state === 'done' ? 'text-white' :
                  state === 'active' ? 'text-[#1D9E75]' :
                  isCancelled && step.key === 'DA_HUY' ? 'text-white' :
                  'text-gray-300'
                } />
              </div>
              <div className="text-center">
                <p className={`text-[11px] font-semibold whitespace-nowrap ${
                  state === 'done' || state === 'active' ? 'text-gray-800' : 'text-gray-400'
                }`}>{step.label}</p>
                {ts && <p className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(ts).toLocaleDateString('vi-VN')}</p>}
              </div>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-2 rounded-full mb-5 ${
                getStepState(steps[idx + 1].key, idx + 1) !== 'pending' ? 'bg-[#1D9E75]' : 'bg-gray-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
