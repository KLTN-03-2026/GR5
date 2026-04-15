"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PackageOpen,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  MapPin,
} from "lucide-react";
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
} from "recharts";

// --- MOCK DATA (Sau này lấy từ Database) ---
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
const COLORS = ["#006b2c", "#10b981", "#34d399", "#a7f3d0"];

// ĐÂY LÀ DÒNG QUAN TRỌNG NHẤT MÀ NEXT.JS CẦN TÌM
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("Tuần này");

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto font-sans">
      {/* HEADER & BỘ LỌC */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-3xl font-black text-[#171d16] tracking-tight uppercase italic">
            Thống kê tổng quan
          </h2>
          <p className="text-emerald-900/60 mt-1 font-medium">
            Theo dõi hiệu suất kinh doanh và tình trạng kho hàng nông sản.
          </p>
        </motion.div>

        <div className="flex items-center bg-white rounded-xl shadow-sm border border-emerald-100 p-1">
          {["Hôm nay", "Tuần này", "Tháng này"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                timeRange === range
                  ? "bg-[#006b2c] text-white shadow-md"
                  : "text-gray-500 hover:bg-emerald-50"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Hàng sắp hết hạn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full opacity-50"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
              Cần Action
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              Lô hàng sắp hết hạn
            </p>
            <h3 className="text-3xl font-black text-gray-900">
              12{" "}
              <span className="text-base font-medium text-gray-500 normal-case">
                sản phẩm
              </span>
            </h3>
          </div>
        </motion.div>

        {/* Card 2: Đơn chưa xử lý */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full opacity-50"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
              <PackageOpen className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
              Chờ đóng gói
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              Đơn chờ xử lý
            </p>
            <h3 className="text-3xl font-black text-gray-900">
              45{" "}
              <span className="text-base font-medium text-gray-500 normal-case">
                đơn hàng
              </span>
            </h3>
          </div>
        </motion.div>

        {/* Card 3: Đơn đã hoàn thành */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-emerald-100 text-[#006b2c] rounded-2xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              Đã giao thành công
            </p>
            <h3 className="text-3xl font-black text-gray-900">
              128{" "}
              <span className="text-base font-medium text-gray-500 normal-case">
                đơn hàng
              </span>
            </h3>
          </div>
        </motion.div>

        {/* Card 4: Doanh thu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#006b2c] p-6 rounded-3xl shadow-lg shadow-emerald-900/20 text-white relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
              +18.5%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-100 uppercase tracking-wider mb-1">
              Doanh thu {timeRange.toLowerCase()}
            </p>
            <h3 className="text-3xl font-black">
              24.5M{" "}
              <span className="text-base font-medium text-emerald-200 normal-case">
                VNĐ
              </span>
            </h3>
          </div>
        </motion.div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ Đơn hàng (Cột) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-black text-lg text-[#171d16] uppercase italic">
                Tốc độ xử lý đơn hàng
              </h3>
              <p className="text-sm text-gray-500">
                So sánh đơn đã giao và đơn đang chờ
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#006b2c]"></span> Đã
                xử lý
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400"></span> Chờ
                xử lý
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={orderData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ fill: "#F3F4F6" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="processed"
                  fill="#006b2c"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                  maxBarSize={40}
                />
                <Bar
                  dataKey="pending"
                  fill="#FBBF24"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Biểu đồ Khu vực (Tròn) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col"
        >
          <div className="mb-2">
            <h3 className="font-black text-lg text-[#171d16] uppercase italic flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Tỷ trọng khu vực
            </h3>
            <p className="text-sm text-gray-500">Phân bổ khách hàng</p>
          </div>

          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {regionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {regionData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></span>
                <span
                  className="font-bold text-gray-700 truncate"
                  title={entry.name}
                >
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
