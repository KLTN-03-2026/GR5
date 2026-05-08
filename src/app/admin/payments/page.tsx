'use client'

import {
  DollarSign,
  CreditCard,
  Wallet,
  Search,
  CheckCircle2,
  Clock,
  RefreshCcw,
  ArrowRightLeft,
  Eye,
  Truck,
  X,
  User,
  Package,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Download,
  TrendingUp,
  Ban,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MAPPING STATUS ---
const PAYMENT_STATUS: Record<string, { label: string; bg: string; color: string; icon: any }> = {
  'DA_THANH_TOAN': { label: 'Đã thanh toán', bg: '#dcfce7', color: '#15803d', icon: CheckCircle2 },
  'CHO_THANH_TOAN': { label: 'Chờ xử lý',     bg: '#fef9c3', color: '#854d0e', icon: Clock },
  'DA_HOAN_TIEN':   { label: 'Đã hoàn tiền',  bg: '#fef2f2', color: '#991b1b', icon: RefreshCcw },
  'THAT_BAI':        { label: 'Đã hủy',         bg: '#f3f4f6', color: '#6b7280', icon: ArrowRightLeft },
};

const METHOD_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  'COD':          { bg: '#fef9c3', color: '#854d0e', label: 'COD' },
  'CHUYEN_KHOAN': { bg: '#eff6ff', color: '#1d4ed8', label: 'Chuyển khoản' },
  'VNPAY':        { bg: '#fdf4ff', color: '#7e22ce', label: 'VNPay' },
  'MOMO':         { bg: '#fdf2f8', color: '#be185d', label: 'MoMo' },
};

const formatCurrency = (amount: any) => {
  const num = parseFloat(amount?.toString() || '0');
  return num.toLocaleString('vi-VN') + 'đ';
};

const formatDate = (dateString: string) => {
  if (!dateString) return '...';
  const d = new Date(dateString);
  const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
};

const TAB_FILTERS = [
  { key: 'ALL',           label: 'Tất cả' },
  { key: 'DA_THANH_TOAN', label: 'Đã thu' },
  { key: 'CHO_THANH_TOAN',label: 'Chờ thu' },
  { key: 'DA_HOAN_TIEN',  label: 'Hoàn tiền' },
  { key: 'THAT_BAI',      label: 'Đã hủy' },
];

export default function PaymentsManagementContent() {
  const [payments, setPayments]         = useState<any[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [activeTab, setActiveTab]       = useState('ALL');
  const [currentPage, setCurrentPage]   = useState(1);
  const itemsPerPage = 10;

  const [viewingPayment, setViewingPayment] = useState<any | null>(null);
  const [isUpdating, setIsUpdating]         = useState(false);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu thanh toán:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchSearch =
        p.id.toString().includes(searchTerm) ||
        p.ma_don_hang?.toString().includes(searchTerm) ||
        p.nguoi_dung?.ho_so_nguoi_dung?.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nguoi_dung?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const tabStatus = activeTab !== 'ALL' ? activeTab : statusFilter !== 'ALL' ? statusFilter : null;
      const matchStatus = !tabStatus || p.trang_thai_thanh_toan === tabStatus;
      const matchMethod = methodFilter === 'ALL' || p.phuong_thuc_thanh_toan === methodFilter;
      return matchSearch && matchStatus && matchMethod;
    });
  }, [payments, searchTerm, statusFilter, methodFilter, activeTab]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, methodFilter, activeTab]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage]);

  const stats = useMemo(() => {
    let total = 0, collected = 0, pending = 0, refunded = 0, shipping = 0;
    let collectedCount = 0, pendingCount = 0, refundedCount = 0;
    payments.forEach(p => {
      const amount = Number(p.tong_tien || 0);
      const ship   = Number(p.phi_van_chuyen || 0);
      total += amount;
      if (p.trang_thai_thanh_toan === 'DA_THANH_TOAN') { collected += amount; collectedCount++; shipping += ship; }
      else if (p.trang_thai_thanh_toan === 'CHO_THANH_TOAN') { pending += amount; pendingCount++; }
      else if (p.trang_thai_thanh_toan === 'DA_HOAN_TIEN')   { refunded += amount; refundedCount++; }
    });
    const avgShip = collectedCount > 0 ? Math.round(shipping / collectedCount) : 0;
    return { total, collected, collectedCount, pending, pendingCount, refunded, refundedCount, shipping, avgShip };
  }, [payments]);

  // Payment method breakdown
  const methodStats = useMemo(() => {
    const codTotal = payments.filter(p => p.phuong_thuc_thanh_toan === 'COD').reduce((s, p) => s + Number(p.tong_tien || 0), 0);
    const ckTotal  = payments.filter(p => p.phuong_thuc_thanh_toan === 'CHUYEN_KHOAN').reduce((s, p) => s + Number(p.tong_tien || 0), 0);
    const total = codTotal + ckTotal || 1;
    return { codTotal, ckTotal, codPct: Math.round((codTotal / total) * 100), ckPct: Math.round((ckTotal / total) * 100) };
  }, [payments]);

  const tabCount = (key: string) =>
    key === 'ALL' ? payments.length : payments.filter(p => p.trang_thai_thanh_toan === key).length;

  const handleConfirmPayment = async (paymentId: number) => {
    if (!confirm('Bạn xác nhận khách đã thanh toán cho giao dịch này? (Thường dùng cho Chuyển khoản)')) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/payments/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: paymentId, status: 'DA_THANH_TOAN' }),
      });
      if (res.ok) {
        alert('Cập nhật trạng thái thành công!');
        fetchPayments();
        setViewingPayment(null);
      } else {
        alert('Có lỗi xảy ra khi cập nhật!');
      }
    } catch {
      alert('Lỗi kết nối server!');
    } finally {
      setIsUpdating(false);
    }
  };

  const startItem = filteredPayments.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem   = Math.min(currentPage * itemsPerPage, filteredPayments.length);

  const generatePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  /* ─── STYLES ─── */
  const S = {
    page: { background: '#f7f8f6', minHeight: '100vh', padding: '24px 28px', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' as const },
    card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 18px' },
    label: { fontSize: 12, fontWeight: 500, color: '#9ca3af', marginBottom: 6 },
    amount: { fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 },
    tag: { fontSize: 11, marginTop: 4, color: '#16a34a' },
  };

  return (
    <div style={S.page}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0 }}>Thanh toán</h1>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>Admin / Thanh toán</p>
      </div>

      {/* ── 5 METRIC CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {/* Card 1 — Tổng doanh thu */}
        <div style={{ ...S.card, borderTop: '3px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <p style={S.label}>Tổng doanh thu</p>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign style={{ width: 16, height: 16, color: '#6366f1' }} />
            </div>
          </div>
          <p style={S.amount}>{formatCurrency(stats.total)}</p>
          <p style={S.tag}>↑ Tổng tất cả giao dịch</p>
        </div>

        {/* Card 2 — Đã thu */}
        <div style={{ ...S.card, borderTop: '3px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <p style={S.label}>Đã thu</p>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 style={{ width: 16, height: 16, color: '#16a34a' }} />
            </div>
          </div>
          <p style={{ ...S.amount, color: '#15803d' }}>{formatCurrency(stats.collected)}</p>
          <p style={S.tag}>{stats.collectedCount} giao dịch</p>
        </div>

        {/* Card 3 — Chờ thu */}
        <div style={{ ...S.card, borderTop: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <p style={S.label}>Chờ thu</p>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock style={{ width: 16, height: 16, color: '#f59e0b' }} />
            </div>
          </div>
          <p style={{ ...S.amount, color: '#92400e' }}>{formatCurrency(stats.pending)}</p>
          <p style={{ ...S.tag, color: '#f59e0b' }}>{stats.pendingCount} đơn chờ xác nhận</p>
        </div>

        {/* Card 4 — Hoàn tiền / Hủy */}
        <div style={{ ...S.card, borderTop: '3px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <p style={S.label}>Hoàn tiền / Hủy</p>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ban style={{ width: 16, height: 16, color: '#ef4444' }} />
            </div>
          </div>
          <p style={{ ...S.amount, color: '#b91c1c' }}>{formatCurrency(stats.refunded)}</p>
          <p style={{ ...S.tag, color: '#ef4444' }}>{stats.refundedCount} giao dịch bị hủy</p>
        </div>

        {/* Card 5 — Phí vận chuyển */}
        <div style={{ ...S.card, borderTop: '3px solid #0ea5e9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <p style={S.label}>Phí vận chuyển</p>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck style={{ width: 16, height: 16, color: '#0ea5e9' }} />
            </div>
          </div>
          <p style={{ ...S.amount, color: '#0369a1' }}>{formatCurrency(stats.shipping)}</p>
          <p style={{ ...S.tag, color: '#0ea5e9' }}>TB {formatCurrency(stats.avgShip)}/đơn</p>
        </div>
      </div>

      {/* ── CHARTS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 16, marginBottom: 20 }}>
        {/* Biểu đồ doanh thu */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp style={{ width: 16, height: 16, color: '#16a34a' }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Doanh thu 7 ngày gần nhất</span>
            </div>
            <select
              style={{ height: 30, border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, padding: '0 8px', color: '#6b7280', background: '#fff', outline: 'none', cursor: 'pointer' }}
            >
              <option>7 ngày</option>
              <option>30 ngày</option>
              <option>3 tháng</option>
            </select>
          </div>
          <div style={{ height: 200, background: '#f9fafb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #e5e7eb' }}>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>Chart sẽ render tại đây</span>
          </div>
        </div>

        {/* Phương thức thanh toán */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <CreditCard style={{ width: 16, height: 16, color: '#6b7280' }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Phương thức thanh toán</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* COD */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>COD (Tiền mặt)</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{formatCurrency(methodStats.codTotal)}</span>
              </div>
              <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${methodStats.codPct}%`, background: '#16a34a', borderRadius: 99 }} />
              </div>
              <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 3, display: 'block' }}>{methodStats.codPct}%</span>
            </div>
            {/* Chuyển khoản */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Chuyển khoản</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{formatCurrency(methodStats.ckTotal)}</span>
              </div>
              <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${methodStats.ckPct}%`, background: '#6366f1', borderRadius: 99 }} />
              </div>
              <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 3, display: 'block' }}>{methodStats.ckPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Tìm mã GD, tên khách, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', height: 38, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, padding: '0 12px 0 34px', outline: 'none', color: '#374151', background: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setActiveTab('ALL'); }}
          style={{ height: 38, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, padding: '0 10px', color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}
        >
          <option value="ALL">Mọi trạng thái</option>
          <option value="DA_THANH_TOAN">Đã thanh toán</option>
          <option value="CHO_THANH_TOAN">Chờ xử lý</option>
          <option value="DA_HOAN_TIEN">Đã hoàn tiền</option>
          <option value="THAT_BAI">Đã hủy</option>
        </select>

        {/* Method filter */}
        <select
          value={methodFilter}
          onChange={e => setMethodFilter(e.target.value)}
          style={{ height: 38, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, padding: '0 10px', color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}
        >
          <option value="ALL">Mọi phương thức</option>
          <option value="COD">COD</option>
          <option value="CHUYEN_KHOAN">Chuyển khoản</option>
          <option value="VNPAY">VNPay</option>
          <option value="MOMO">MoMo</option>
        </select>

        {/* Date range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 10px', background: '#fff' }}>
          <input type="date" style={{ border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent', cursor: 'pointer' }} />
          <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>
          <input type="date" style={{ border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent', cursor: 'pointer' }} />
        </div>

        {/* Export */}
        <button
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer', flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#16a34a')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
        >
          <Download style={{ width: 14, height: 14 }} />
          Xuất Excel
        </button>
      </div>

      {/* ── TABLE CARD ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 20px', gap: 0 }}>
          {TAB_FILTERS.map(tab => {
            const count = tabCount(tab.key);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setStatusFilter('ALL'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '12px 14px', fontSize: 13, fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#16a34a' : '#6b7280',
                  background: 'none', border: 'none', borderBottom: isActive ? '2px solid #16a34a' : '2px solid transparent',
                  cursor: 'pointer', transition: 'color 0.15s', whiteSpace: 'nowrap',
                  marginBottom: -1,
                }}
              >
                {tab.label}
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 99,
                  background: isActive ? '#dcfce7' : '#f3f4f6',
                  color: isActive ? '#15803d' : '#6b7280',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Mã GD', 'Khách hàng', 'Đơn hàng', 'Phương thức', 'Số tiền', 'Thời gian', 'Trạng thái', 'Chi tiết'].map((h, i) => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: '#9ca3af', textAlign: i >= 4 ? (i === 4 ? 'right' : i === 7 ? 'center' : 'left') : 'left', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '56px 0' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#16a34a', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </td>
                </tr>
              ) : paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '60px 0' }}>
                    <CreditCard style={{ width: 40, height: 40, color: '#d1d5db', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#374151', margin: '0 0 4px' }}>Chưa có giao dịch nào</p>
                    <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Các giao dịch thanh toán từ khách hàng sẽ hiển thị tại đây</p>
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p, idx) => {
                  const status  = PAYMENT_STATUS[p.trang_thai_thanh_toan];
                  const method  = METHOD_STYLE[p.phuong_thuc_thanh_toan];
                  const isLast  = idx === paginatedPayments.length - 1;
                  const name    = p.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || p.nguoi_dung?.email || 'Khách vãng lai';
                  const initial = name[0]?.toUpperCase() || 'K';
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: isLast ? 'none' : '1px solid #f3f4f6' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Mã GD */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#6366f1', fontWeight: 500 }}>
                          #TT{String(p.id).padStart(5, '0')}
                        </span>
                      </td>

                      {/* Khách hàng */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#15803d', flexShrink: 0 }}>
                            {initial}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{name}</p>
                            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{p.nguoi_dung?.email || ''}</p>
                          </div>
                        </div>
                      </td>

                      {/* Đơn hàng */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Package style={{ width: 13, height: 13, color: '#16a34a' }} />
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#15803d' }}>#{p.ma_don_hang}</span>
                        </div>
                      </td>

                      {/* Phương thức */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 99,
                          background: method?.bg || '#f3f4f6',
                          color: method?.color || '#374151',
                        }}>
                          {method?.label || p.phuong_thuc_thanh_toan}
                        </span>
                      </td>

                      {/* Số tiền */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{formatCurrency(p.tong_tien)}</span>
                      </td>

                      {/* Thời gian */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{formatDate(p.ngay_tao)}</span>
                      </td>

                      {/* Trạng thái */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 99,
                          background: status?.bg || '#f3f4f6',
                          color: status?.color || '#6b7280',
                          whiteSpace: 'nowrap',
                        }}>
                          {status?.label || p.trang_thai_thanh_toan}
                        </span>
                      </td>

                      {/* Chi tiết */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => setViewingPayment(p)}
                          style={{ border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, padding: '4px 12px', color: '#374151', background: '#fff', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = '#16a34a')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                        >
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filteredPayments.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              Tổng {filteredPayments.length} giao dịch ·{' '}
              Tổng thu:{' '}
              <span style={{ fontWeight: 600, color: '#16a34a' }}>
                {formatCurrency(filteredPayments.reduce((s, p) => s + (p.trang_thai_thanh_toan === 'DA_THANH_TOAN' ? Number(p.tong_tien || 0) : 0), 0))}
              </span>
            </span>
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ height: 32, minWidth: 32, padding: '0 8px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}
                >
                  <ChevronLeft style={{ width: 14, height: 14 }} />
                </button>
                {generatePages().map((pg, i) =>
                  pg === '...' ? (
                    <span key={`e-${i}`} style={{ padding: '0 4px', color: '#9ca3af', fontSize: 13 }}>…</span>
                  ) : (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(Number(pg))}
                      style={{ height: 32, minWidth: 32, padding: '0 6px', border: currentPage === pg ? '1px solid #16a34a' : '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, cursor: 'pointer', background: currentPage === pg ? '#16a34a' : '#fff', color: currentPage === pg ? '#fff' : '#374151', fontWeight: currentPage === pg ? 600 : 400 }}
                    >
                      {pg}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ height: 32, minWidth: 32, padding: '0 8px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}
                >
                  <ChevronRight style={{ width: 14, height: 14 }} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      <AnimatePresence>
        {viewingPayment && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => setViewingPayment(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ background: '#fff', width: '100%', maxWidth: 640, borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: '#dcfce7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Receipt style={{ width: 18, height: 18, color: '#16a34a' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Chi tiết giao dịch</h3>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0', fontFamily: 'monospace' }}>
                      #TT{String(viewingPayment.id).padStart(5, '0')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingPayment(null)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {/* Modal body */}
              <div style={{ padding: 24, maxHeight: '75vh', overflowY: 'auto' }}>
                {/* Amount + Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', marginBottom: 24 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', margin: '0 0 4px' }}>Số tiền thanh toán</p>
                    <p style={{ fontSize: 28, fontWeight: 700, color: '#15803d', margin: 0 }}>{formatCurrency(viewingPayment.tong_tien)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', margin: '0 0 6px' }}>Trạng thái</p>
                    <span style={{
                      fontSize: 13, fontWeight: 500, padding: '4px 12px', borderRadius: 99,
                      background: PAYMENT_STATUS[viewingPayment.trang_thai_thanh_toan]?.bg || '#f3f4f6',
                      color: PAYMENT_STATUS[viewingPayment.trang_thai_thanh_toan]?.color || '#6b7280',
                    }}>
                      {PAYMENT_STATUS[viewingPayment.trang_thai_thanh_toan]?.label || viewingPayment.trang_thai_thanh_toan}
                    </span>
                  </div>
                </div>

                {/* Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CreditCard style={{ width: 13, height: 13 }} /> Thông tin giao dịch
                    </p>
                    {[
                      { label: 'Phương thức', value: viewingPayment.phuong_thuc_goc || viewingPayment.phuong_thuc_thanh_toan },
                      { label: 'Mã đối soát', value: viewingPayment.ma_giao_dich_ben_ngoai || 'Không có' },
                      { label: 'Thời gian tạo', value: formatDate(viewingPayment.ngay_tao) },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>{row.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User style={{ width: 13, height: 13 }} /> Thông tin liên kết
                    </p>
                    {[
                      { label: 'Đơn hàng', value: `#${viewingPayment.ma_don_hang}` },
                      { label: 'Khách hàng', value: viewingPayment.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || 'Khách vãng lai' },
                      { label: 'Email', value: viewingPayment.nguoi_dung?.email || 'N/A' },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>{row.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm button */}
                {viewingPayment.trang_thai_thanh_toan === 'CHO_THANH_TOAN' && viewingPayment.phuong_thuc_thanh_toan === 'CHUYEN_KHOAN' && (
                  <div style={{ marginTop: 20, padding: 16, background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a' }}>
                    <p style={{ fontSize: 13, color: '#92400e', margin: '0 0 12px', lineHeight: 1.5 }}>
                      Giao dịch này đang chờ khách chuyển khoản. Sau khi nhận được tiền, bạn có thể xác nhận thủ công tại đây.
                    </p>
                    <button
                      onClick={() => handleConfirmPayment(viewingPayment.id)}
                      disabled={isUpdating}
                      style={{ width: '100%', height: 40, background: '#f59e0b', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#fff', cursor: isUpdating ? 'not-allowed' : 'pointer', opacity: isUpdating ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      <CheckCircle2 style={{ width: 15, height: 15 }} />
                      {isUpdating ? 'Đang xử lý...' : 'Xác nhận đã nhận tiền'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
