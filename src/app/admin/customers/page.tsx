"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  RefreshCw,
  Search,
  Download,
  Eye,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomersPage() {
  // 1. Quản lý State cho API và Dữ liệu
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [filterKeyword, setFilterKeyword] = useState("");

  // 2. Quản lý State cho UI Panel
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // 3. Gọi API mỗi khi filterKeyword thay đổi (Hook Side Effect)
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/customers?q=${filterKeyword}`);
        const result = await response.json();

        if (result.data) {
          setCustomers(result.data);
        }
      } catch (error) {
        console.error("Lỗi khi kéo dữ liệu khách hàng:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [filterKeyword]);

  // Hàm xử lý khi bấm nút Lọc
  const handleFilterClick = () => {
    setFilterKeyword(searchInput);
  };

  // Hàm format tiền tệ VNĐ chuẩn xác
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

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
              value={isLoading ? "..." : customers.length}
              trend="Hiện tại"
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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFilterClick()}
                className="w-full bg-white border-none rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#006b2c]/20"
                placeholder="Tìm theo tên, email, sđt..."
              />
            </div>
            <div className="flex gap-3">
              <select className="bg-white rounded-xl px-4 py-2.5 text-sm font-medium outline-none">
                <option value="ALL">Tất cả</option>
                <option value="VIP">VIP</option>
              </select>
              <button
                onClick={handleFilterClick}
                className="bg-[#171d16] text-white py-2.5 px-6 rounded-xl font-bold text-sm hover:opacity-90"
              >
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
                  <th className="px-6 py-4 text-[11px] font-bold text-[#6e7b6c] uppercase tracking-widest text-right">
                    Tổng chi tiêu
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#6e7b6c] uppercase tracking-widest text-center">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#bdcaba]/10">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-gray-500 font-medium"
                    >
                      <RefreshCw
                        className="animate-spin inline-block mr-2"
                        size={18}
                      />{" "}
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Không tìm thấy dữ liệu khách hàng nào.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsPanelOpen(true);
                      }}
                      className="hover:bg-[#eff6ea]/30 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 uppercase overflow-hidden shrink-0">
                            {customer.avatar ? (
                              <img
                                src={customer.avatar}
                                alt={customer.ten}
                                className="w-full h-full object-cover"
                              />
                            ) : customer.ten ? (
                              customer.ten.charAt(0)
                            ) : (
                              "?"
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{customer.ten}</p>
                            <p className="text-[10px] text-[#6e7b6c]">
                              ID: #{customer.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-medium">{customer.sdt}</p>
                        <p className="text-[11px] text-[#6e7b6c]">
                          {customer.email}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-sm">
                        {customer.tongDon}
                      </td>
                      <td className="px-6 py-5 font-bold text-sm text-[#006b2c] text-right">
                        {formatCurrency(customer.tongChiTieu)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Detail Panel */}
      <AnimatePresence>
        {isPanelOpen && selectedCustomer && (
          <motion.aside
            initial={{ x: 380 }}
            animate={{ x: 0 }}
            exit={{ x: 380 }}
            className="w-[380px] h-screen fixed right-0 top-0 bg-white border-l border-slate-100 flex flex-col shadow-2xl z-[60]"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#eff6ea]/30">
              <h4 className="font-bold text-lg text-[#171d16]">
                Chi tiết khách hàng
              </h4>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="text-slate-400 hover:text-red-500 bg-white p-1 rounded-full shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="text-center space-y-2">
                {/* ĐÃ FIX HIỂN THỊ AVATAR TRONG PANEL BÊN PHẢI */}
                <div className="w-24 h-24 rounded-3xl bg-green-50 mx-auto flex items-center justify-center text-3xl font-black text-green-600 uppercase overflow-hidden shadow-inner shrink-0">
                  {selectedCustomer.avatar ? (
                    <img
                      src={selectedCustomer.avatar}
                      alt={selectedCustomer.ten}
                      className="w-full h-full object-cover"
                    />
                  ) : selectedCustomer.ten ? (
                    selectedCustomer.ten.charAt(0)
                  ) : (
                    "?"
                  )}
                </div>
                <h5 className="text-xl font-black text-[#171d16]">
                  {selectedCustomer.ten}
                </h5>
                <p className="text-sm text-gray-500">
                  {selectedCustomer.email}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label="Tổng chi tiêu"
                  value={formatCurrency(selectedCustomer.tongChiTieu)}
                  color="text-[#006b2c]"
                />
                <StatBox
                  label="Số đơn hàng"
                  value={`${selectedCustomer.tongDon} đơn`}
                />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components
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
      <h3 className="text-3xl font-bold mt-1 text-[#171d16]">{value}</h3>
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
