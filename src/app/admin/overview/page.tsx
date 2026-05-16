"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface KpiData {
  expiringLots: number;
  pendingOrders: number;
  deliveredOrders: number;
  revenue: number;
  revenueChange: number;
  totalProducts: number;
  totalCustomers: number;
  lowStock: number;
}

interface OrderStatus {
  total: number;
  pending: number;
  processing: number;
  shipping: number;
  delivered: number;
  cancelled: number;
}

interface TopProduct {
  ten_san_pham: string;
  bien_the: string;
  anh: string;
  gia_ban: number;
  so_luong_ban: number;
}

interface RecentOrder {
  id: number;
  tong_tien: number;
  trang_thai: string;
  ngay_tao: string;
  ho_ten: string;
  so_san_pham: number;
}

interface CategoryStat {
  ten_danh_muc: string;
  so_san_pham: number;
  tong_ban: number;
}

interface OverviewData {
  kpiCards: KpiData;
  orderStatus: OrderStatus;
  ordersByDay: { ngay: string; so_don: number; doanh_thu: number }[];
  revenueByDay: { ngay: string; doanh_thu: number }[];
  categoryStats: CategoryStat[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
}

const RANGE_MAP: Record<string, string> = {
  "Hôm nay": "today",
  "Tuần này": "week",
  "Tháng này": "month",
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  CHO_XAC_NHAN: { label: "Chờ xác nhận", color: "text-amber-700", bg: "bg-amber-50" },
  DA_XAC_NHAN: { label: "Đã xác nhận", color: "text-blue-700", bg: "bg-blue-50" },
  DA_THANH_TOAN: { label: "Đã thanh toán", color: "text-blue-700", bg: "bg-blue-50" },
  DANG_DONG_GOI: { label: "Đang đóng gói", color: "text-indigo-700", bg: "bg-indigo-50" },
  CHO_GIAO_HANG: { label: "Chờ giao hàng", color: "text-orange-700", bg: "bg-orange-50" },
  DANG_GIAO: { label: "Đang giao", color: "text-purple-700", bg: "bg-purple-50" },
  DA_GIAO: { label: "Đã giao", color: "text-emerald-700", bg: "bg-emerald-50" },
  DA_HUY: { label: "Đã hủy", color: "text-red-700", bg: "bg-red-50" },
};

const PIE_COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5", "#ecfdf5", "#f0fdf4"];

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return value.toLocaleString("vi-VN");
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 backdrop-blur-sm px-3.5 py-2.5 shadow-xl text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill || p.stroke }} />
          <span className="text-slate-500">{p.dataKey === "so_don" ? "Số đơn" : "Doanh thu"}:</span>
          <span className="font-medium text-slate-800">
            {p.dataKey === "doanh_thu" ? formatCurrency(p.value) + "đ" : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function AreaTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 backdrop-blur-sm px-3.5 py-2.5 shadow-xl text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-slate-500">Doanh thu:</span>
        <span className="font-medium text-slate-800">{formatCurrency(payload[0].value)}đ</span>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [timeRange, setTimeRange] = useState("Tuần này");
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/overview?range=${RANGE_MAP[timeRange]}`)
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [timeRange]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  const { kpiCards, orderStatus, ordersByDay, categoryStats, topProducts, recentOrders } = data;

  const chartData = ordersByDay.map((d) => ({
    ...d,
    name: formatDate(d.ngay),
  }));

  const pieData = categoryStats.filter((c) => c.tong_ban > 0);
  const pieTotal = pieData.reduce((s, d) => s + d.tong_ban, 0);

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Tổng quan</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Theo dõi hiệu suất kinh doanh và tình trạng kho hàng nông sản
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {Object.keys(RANGE_MAP).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`h-8 px-3.5 rounded-md text-[13px] font-medium transition-all ${
                timeRange === range
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<IconBox />}
          label="Lô sắp hết hạn"
          value={String(kpiCards.expiringLots)}
          unit="lô hàng"
          chip="Cần xử lý"
          chipColor="red"
          accent="#ef4444"
        />
        <KpiCard
          icon={<IconClock />}
          label="Đơn chờ xử lý"
          value={String(kpiCards.pendingOrders)}
          unit="đơn hàng"
          chip="Đang chờ"
          chipColor="amber"
          accent="#f59e0b"
        />
        <KpiCard
          icon={<IconCheck />}
          label="Đã giao thành công"
          value={String(kpiCards.deliveredOrders)}
          unit="đơn hàng"
          chip={timeRange}
          chipColor="emerald"
          accent="#059669"
        />
        <KpiCard
          icon={<IconTrending />}
          label="Doanh thu"
          value={formatCurrency(kpiCards.revenue)}
          unit="VNĐ"
          chip={kpiCards.revenueChange >= 0 ? `+${kpiCards.revenueChange}%` : `${kpiCards.revenueChange}%`}
          chipColor={kpiCards.revenueChange >= 0 ? "blue" : "red"}
          accent="#3b82f6"
        />
      </div>

      {/* SECONDARY KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniKpi label="Sản phẩm" value={kpiCards.totalProducts} icon="📦" />
        <MiniKpi label="Khách hàng" value={kpiCards.totalCustomers} icon="👥" />
        <MiniKpi label="Tồn kho thấp" value={kpiCards.lowStock} icon="⚠️" />
        <MiniKpi label="Tổng đơn" value={orderStatus.total} icon="🛒" />
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Area Chart — Doanh thu */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Biểu đồ doanh thu & đơn hàng</h3>
              <p className="text-xs text-slate-400 mt-0.5">Doanh thu và số đơn theo ngày</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-500">Doanh thu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="text-slate-500">Số đơn</span>
              </div>
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} dy={8} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomBarTooltip />} />
                <Area yAxisId="left" type="monotone" dataKey="doanh_thu" stroke="#059669" strokeWidth={2.5} fill="url(#colorRevenue)" dot={{ r: 4, fill: "#059669", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                <Bar yAxisId="right" dataKey="so_don" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart — Danh mục */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Doanh số theo danh mục</h3>
            <p className="text-xs text-slate-400 mt-0.5">Phân bổ số lượng bán theo nhóm hàng</p>
          </div>

          <div className="flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="tong_ban"
                  nameKey="ten_danh_muc"
                  strokeWidth={0}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", fontSize: 12 }}
                  formatter={(value: any, name: any) => [`${value} sản phẩm (${pieTotal > 0 ? Math.round((value / pieTotal) * 100) : 0}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 space-y-2">
            {pieData.map((entry, index) => {
              const pct = pieTotal > 0 ? Math.round((entry.tong_ban / pieTotal) * 100) : 0;
              return (
                <div key={entry.ten_danh_muc} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span className="text-xs text-slate-600 truncate max-w-[120px]">{entry.ten_danh_muc}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700">{entry.tong_ban}</span>
                    <span className="text-[10px] text-slate-400">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ORDER STATUS + TOP PRODUCTS + RECENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Order Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Trạng thái đơn hàng</h3>
          <div className="space-y-3">
            {[
              { key: "pending", label: "Chờ xác nhận", value: orderStatus.pending, color: "#f59e0b", bg: "#fef3c7" },
              { key: "processing", label: "Đang xử lý", value: orderStatus.processing, color: "#3b82f6", bg: "#dbeafe" },
              { key: "shipping", label: "Đang giao hàng", value: orderStatus.shipping, color: "#8b5cf6", bg: "#ede9fe" },
              { key: "delivered", label: "Đã giao", value: orderStatus.delivered, color: "#059669", bg: "#d1fae5" },
              { key: "cancelled", label: "Đã hủy", value: orderStatus.cancelled, color: "#ef4444", bg: "#fee2e2" },
            ].map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-slate-600 flex-1">{s.label}</span>
                <span className="text-sm font-semibold text-slate-800">{s.value}</span>
                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: s.bg }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ backgroundColor: s.color, width: `${orderStatus.total > 0 ? (s.value / orderStatus.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Sản phẩm bán chạy</h3>
          <div className="space-y-3">
            {topProducts.length === 0 && <p className="text-xs text-slate-400">Chưa có dữ liệu</p>}
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-xs font-bold text-emerald-600 flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{product.ten_san_pham}</p>
                  <p className="text-[10px] text-slate-400">{product.bien_the}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-slate-800">{product.so_luong_ban}</p>
                  <p className="text-[10px] text-slate-400">đã bán</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Đơn hàng gần đây</h3>
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const st = STATUS_MAP[order.trang_thai] || { label: order.trang_thai, color: "text-slate-700", bg: "bg-slate-50" };
              return (
                <div key={order.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">
                    #{order.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{order.ho_ten || "Khách"}</p>
                    <p className="text-[10px] text-slate-400">{order.so_san_pham} sản phẩm</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-slate-800">{formatCurrency(order.tong_tien)}đ</p>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub Components ────────────────────────────────────────────

function KpiCard({ icon, label, value, unit, chip, chipColor, accent }: {
  icon: React.ReactNode; label: string; value: string; unit: string; chip: string; chipColor: string; accent: string;
}) {
  const chipClasses: Record<string, string> = {
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <div className="relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: accent }} />
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent + "12" }}>
              {icon}
            </div>
            <span className="text-xs text-slate-500 font-medium">{label}</span>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${chipClasses[chipColor] || chipClasses.blue}`}>
            {chip}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 tabular-nums">{value}</span>
          <span className="text-xs text-slate-400 font-medium">{unit}</span>
        </div>
      </div>
    </div>
  );
}

function MiniKpi({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-lg font-bold text-slate-800 tabular-nums">{value}</p>
        <p className="text-[10px] text-slate-400 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ─── Icons (inline SVG) ────────────────────────────────────────

function IconBox() {
  return <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>;
}
function IconClock() {
  return <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function IconCheck() {
  return <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function IconTrending() {
  return <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
}
