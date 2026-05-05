"use client";

import React, { useState } from "react";
import {
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
  Legend,
} from "recharts";

// ─── Mock Data ──────────────────────────────────────────────
const orderData = [
  { name: "T2", processed: 40, pending: 24 },
  { name: "T3", processed: 30, pending: 13 },
  { name: "T4", processed: 20, pending: 48 },
  { name: "T5", processed: 27, pending: 39 },
  { name: "T6", processed: 18, pending: 48 },
  { name: "T7", processed: 23, pending: 38 },
  { name: "CN", processed: 34, pending: 43 },
];

const regionData = [
  { name: "TP. Hồ Chí Minh", value: 400 },
  { name: "Hà Nội", value: 300 },
  { name: "Đà Nẵng", value: 300 },
  { name: "Các tỉnh khác", value: 200 },
];
const REGION_TOTAL = regionData.reduce((s, d) => s + d.value, 0);
const PIE_COLORS = ["#059669", "#34d399", "#a7f3d0", "#d1fae5"];

// ─── KPI Card definition ────────────────────────────────────
const KPI_CARDS = [
  {
    label: "Lô sắp hết hạn",
    value: "12",
    unit: "lô hàng",
    chip: "Cần xử lý",
    chipCls: "bg-red-50 text-red-600",
    accent: "#ef4444",
  },
  {
    label: "Đơn chờ xử lý",
    value: "45",
    unit: "đơn hàng",
    chip: "Chờ xử lý",
    chipCls: "bg-amber-50 text-amber-600",
    accent: "#f59e0b",
  },
  {
    label: "Đã giao thành công",
    value: "128",
    unit: "đơn hàng",
    chip: "Tuần này",
    chipCls: "bg-emerald-50 text-emerald-600",
    accent: "#059669",
  },
  {
    label: "Doanh thu",
    value: "24.5M",
    unit: "VNĐ",
    chip: "+18.5%",
    chipCls: "bg-blue-50 text-blue-600",
    accent: "#3b82f6",
  },
];

// ─── Custom Tooltip for Bar Chart ───────────────────────────
function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-slate-500">{p.dataKey === "processed" ? "Đã xử lý" : "Chờ xử lý"}:</span>
          <span className="font-medium text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function AdminOverviewPage() {
  const [timeRange, setTimeRange] = useState("Tuần này");

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-medium text-slate-900">Tổng quan</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Theo dõi hiệu suất kinh doanh và tình trạng kho hàng nông sản
          </p>
        </div>

        {/* Time filter */}
        <div className="flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-white p-0.5">
          {["Hôm nay", "Tuần này", "Tháng này"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`h-8 px-3 rounded-[5px] text-[13px] font-medium transition-all ${
                timeRange === range
                  ? "bg-[#f0fdf4] border border-[#059669] text-[#065f46]"
                  : "text-[#64748b] hover:bg-slate-50"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((card) => (
          <div
            key={card.label}
            className="relative bg-white rounded-lg overflow-hidden"
            style={{
              height: 80,
              border: "0.5px solid #e2e8f0",
              borderLeft: `3px solid ${card.accent}`,
            }}
          >
            <div className="flex flex-col justify-between h-full px-4 py-3">
              {/* Top row */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  {card.label}
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px] ${card.chipCls}`}>
                  {card.chip}
                </span>
              </div>
              {/* Bottom row */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-[22px] font-medium text-slate-900 tabular-nums leading-none">
                  {card.value}
                </span>
                <span className="text-[12px] text-slate-400">{card.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Bar Chart — 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e8f0] p-5">
          {/* Chart header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-medium text-slate-700">
                Tốc độ xử lý đơn hàng
              </h3>
              <p className="text-[12px] text-slate-400 mt-0.5">
                So sánh đơn đã giao và đơn đang chờ theo ngày
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                <span className="text-[12px] text-slate-500">Đã xử lý</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#e2e8f0]" />
                <span className="text-[12px] text-slate-500">Chờ xử lý</span>
              </div>
            </div>
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barGap={3}>
                <CartesianGrid
                  strokeDasharray=""
                  vertical={false}
                  stroke="#f1f5f9"
                  strokeWidth={0.5}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="processed" fill="#059669" radius={[3, 3, 0, 0]} maxBarSize={28} />
                <Bar dataKey="pending" fill="#e2e8f0" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart — 1/3 width */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 flex flex-col">
          <div className="mb-4">
            <h3 className="text-[14px] font-medium text-slate-700">Tỷ trọng khu vực</h3>
            <p className="text-[12px] text-slate-400 mt-0.5">Phân bổ khách hàng theo vùng</p>
          </div>

          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {regionData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: 12,
                  }}
                  formatter={(value: any, name: any) => [
                    `${value} (${Math.round((value / REGION_TOTAL) * 100)}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-2">
            {regionData.map((entry, index) => {
              const pct = Math.round((entry.value / REGION_TOTAL) * 100);
              return (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="text-[12px] text-slate-600 truncate max-w-[130px]" title={entry.name}>
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-[12px] font-medium text-slate-500">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
