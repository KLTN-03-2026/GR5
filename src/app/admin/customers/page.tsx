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
import Pagination from "@/components/ui/Pagination";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 15;

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchQuery
      });
      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
        if (!selectedCustomer && data.data?.length > 0) {
          setSelectedCustomer(data.data[0]);
        }
      }
    } catch (error) {
      console.error("Lỗi fetch khách hàng:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchQuery]);

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
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex gap-3">
              <select className="bg-white rounded-xl px-4 py-2.5 text-sm font-medium outline-none">
                <option value="">Tất cả phân khúc</option>
                <option value="VIP">VIP</option>
                <option value="Loyal">Loyal</option>
                <option value="Mới">Mới</option>
              </select>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#006b2c] border-t-transparent mx-auto"></div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-400 font-medium">
                      Không tìm thấy khách hàng nào.
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
                      className="hover:bg-[#eff6ea]/30 cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 overflow-hidden">
                            <img src={customer.avatar} alt="Avatar" className="w-full h-full object-cover" />
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
                  ))
                )}
              </tbody>
            </table>
            
            {/* Pagination Component */}
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* Right Detail Panel - Dùng AnimatePresence để trượt ra trượt vào */}
      <AnimatePresence>
        {isPanelOpen && selectedCustomer && (
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
                <div className="w-24 h-24 rounded-3xl bg-green-50 mx-auto flex items-center justify-center text-3xl font-black text-green-600 overflow-hidden">
                  <img src={selectedCustomer.avatar} alt="Avatar" className="w-full h-full object-cover" />
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
