"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  RefreshCw,
  Search,
  Download,
  Eye,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  X,
  ShoppingBasket,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data (Sau này Phú sẽ thay bằng fetch API từ MySQL)
const CUSTOMERS = [
  {
    id: "KH2903",
    name: "Lê Hoàng Nam",
    email: "nam.lh@verdant.vn",
    phone: "0987 123 456",
    orders: 24,
    spent: "45.200.000đ",
    lastPurchase: "14/05/2024",
    segment: "VIP",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop",
    joined: "2022",
    points: "1,240",
    refundRate: "0%",
    notes: "Ưu tiên hỗ trợ vận chuyển hỏa tốc cho các đơn nông sản hữu cơ.",
    recentOrders: [
      {
        id: "ORD-7892",
        name: 'Giỏ quà Tết "An Khang"',
        date: "14/05/2024",
        price: "3.200k",
      },
    ],
  },
  // Phú có thể thêm các khách hàng khác vào đây...
];

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState(CUSTOMERS[0]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="relative">
      <div
        className={`transition-all duration-300 ${isPanelOpen ? "mr-[380px]" : ""}`}
      >
        <div className="space-y-8">
          {/* Page Title */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-extrabold text-[#171d16] tracking-tight">
                Quản lý khách hàng
              </h2>
              <p className="text-[#6e7b6c] mt-1">
                Cơ sở dữ liệu người dùng và lịch sử mua hàng.
              </p>
            </div>
            <button className="bg-gradient-to-br from-[#006b2c] to-[#00873a] text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-green-900/10 hover:opacity-90">
              <Download size={18} /> Xuất danh sách
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              icon={<Users className="text-[#006b2c]" size={20} />}
              label="Tổng khách hàng"
              value="1.248"
              trend="+12%"
              color="bg-green-50"
            />
            <KPICard
              icon={<UserPlus className="text-[#515f74]" size={20} />}
              label="Khách hàng mới"
              value="58"
              trend="Tháng này"
              color="bg-slate-50"
            />
            <KPICard
              icon={<RefreshCw className="text-[#a72d51]" size={20} />}
              label="Tỷ lệ mua lại"
              value="64%"
              trend="Ổn định"
              color="bg-rose-50"
            />
          </div>

          {/* Filters */}
          <div className="bg-[#eff6ea] p-4 rounded-2xl flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px] relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7b6c]"
                size={18}
              />
              <input
                className="w-full bg-white border-none rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#006b2c]/20"
                placeholder="Tìm theo tên, email, sđt..."
              />
            </div>
            <div className="flex gap-3">
              <select className="bg-white rounded-xl px-4 py-2.5 text-sm font-medium outline-none">
                <option>VIP</option>
                <option>Loyal</option>
              </select>
              <button className="bg-[#171d16] text-white py-2.5 px-6 rounded-xl font-bold text-sm hover:opacity-90">
                Lọc
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#bdcaba]/20">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#eff6ea]/50 border-b border-[#bdcaba]/20">
                  <th className="px-6 py-4 text-[11px] font-bold text-[#6e7b6c] uppercase tracking-widest">
                    Khách hàng
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#6e7b6c] uppercase tracking-widest">
                    Liên hệ
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#6e7b6c] uppercase tracking-widest text-center">
                    Tổng đơn
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#6e7b6c] uppercase tracking-widest">
                    Tổng chi tiêu
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#6e7b6c] uppercase tracking-widest text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#bdcaba]/10">
                {CUSTOMERS.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setIsPanelOpen(true);
                    }}
                    className="hover:bg-[#eff6ea]/30 cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{customer.name}</p>
                          <p className="text-[10px] text-[#6e7b6c]">
                            ID: #{customer.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-medium">{customer.phone}</p>
                      <p className="text-[11px] text-[#6e7b6c]">
                        {customer.email}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-sm">
                      {customer.orders}
                    </td>
                    <td className="px-6 py-5 font-bold text-sm text-[#006b2c]">
                      {customer.spent}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-green-50 rounded-lg text-green-600">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Detail Panel - Dùng AnimatePresence để trượt ra trượt vào */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.aside
            initial={{ x: 380 }}
            animate={{ x: 0 }}
            exit={{ x: 380 }}
            className="w-[380px] h-screen fixed right-0 top-0 bg-white border-l border-slate-100 flex flex-col shadow-2xl z-[60]"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-bold text-lg">Chi tiết khách hàng</h4>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="text-center space-y-2">
                <div className="w-24 h-24 rounded-3xl bg-green-50 mx-auto flex items-center justify-center text-3xl font-black text-green-600">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <h5 className="text-xl font-black">{selectedCustomer.name}</h5>
                <span className="bg-[#006b2c] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase">
                  {selectedCustomer.segment} Member
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label="Tích lũy"
                  value={selectedCustomer.spent}
                  color="text-[#006b2c]"
                />
                <StatBox label="Điểm" value={selectedCustomer.points} />
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">
                  Ghi chú
                </p>
                <p className="text-xs leading-relaxed">
                  {selectedCustomer.notes}
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components phục vụ riêng cho trang này
function KPICard({ icon, label, value, trend, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-[#bdcaba]/10 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 ${color} rounded-lg`}>{icon}</div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600">
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-bold text-[#6e7b6c] uppercase">{label}</p>
      <h3 className="text-3xl font-bold mt-1">{value}</h3>
    </div>
  );
}

function StatBox({ label, value, color = "text-[#171d16]" }: any) {
  return (
    <div className="bg-[#eff6ea] p-4 rounded-2xl">
      <p className="text-[10px] font-bold text-[#6e7b6c] uppercase">{label}</p>
      <p className={`text-lg font-black mt-1 ${color}`}>{value}</p>
    </div>
  );
}
