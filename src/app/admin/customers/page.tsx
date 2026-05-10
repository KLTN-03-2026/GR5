"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Pagination from "@/components/ui/Pagination";

interface Customer {
  id: number;
  ten: string;
  email: string;
  sdt: string | null;
  avatar: string | null;
  gioi_tinh: string | null;
  ngay_tao: string;
  trang_thai: number;
  tinh_thanh: string | null;
  quan_huyen: string | null;
  tong_don: number;
  don_giao: number;
  tong_chi_tieu: number;
  don_cuoi: string | null;
}

interface Stats {
  total: number;
  newThisMonth: number;
  repeatRate: number;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (value >= 1_000) return Math.round(value / 1_000) + "K";
  return value.toLocaleString("vi-VN");
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getInitials(name: string): string {
  return name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
}

function getAvatarColor(id: number): string {
  const colors = ["bg-emerald-100 text-emerald-700", "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700"];
  return colors[id % colors.length];
}

function getSegment(customer: Customer): { label: string; color: string } {
  if (customer.tong_chi_tieu >= 1000000) return { label: "VIP", color: "bg-amber-50 text-amber-700 border-amber-200" };
  if (customer.tong_don >= 3) return { label: "Trung thành", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  return { label: "Mới", color: "bg-blue-50 text-blue-700 border-blue-200" };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, newThisMonth: 0, repeatRate: 0 });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "15",
        search: searchQuery,
        sort: sortBy,
      });
      const res = await fetch(`/api/admin/customers?${params}`);
      if (res.ok) {
        const json = await res.json();
        setCustomers(json.data || []);
        setTotalPages(json.meta?.totalPages || 1);
        setStats(json.stats || { total: 0, newThisMonth: 0, repeatRate: 0 });
      }
    } catch (error) {
      console.error("Lỗi fetch khách hàng:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const openPanel = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsPanelOpen(true);
  };

  return (
    <div className="relative max-w-[1440px] mx-auto">
      <div className={`transition-all duration-300 ${isPanelOpen ? "mr-[400px]" : ""}`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Quản lý khách hàng</h1>
              <p className="text-sm text-slate-500 mt-0.5">Theo dõi và quản lý cơ sở khách hàng</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
              Xuất Excel
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                </div>
                <span className="text-xs font-medium text-slate-500">Tổng khách hàng</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{isLoading ? "..." : stats.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
                </div>
                <span className="text-xs font-medium text-slate-500">Mới tháng này</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{isLoading ? "..." : stats.newThisMonth}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                </div>
                <span className="text-xs font-medium text-slate-500">Tỷ lệ mua lại</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{isLoading ? "..." : `${stats.repeatRate}%`}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                <input
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all"
                  placeholder="Tìm theo tên, email, số điện thoại..."
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm outline-none focus:border-emerald-300 min-w-[160px]"
              >
                <option value="newest">Mới nhất</option>
                <option value="spent">Chi tiêu cao nhất</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Liên hệ</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Khu vực</th>
                    <th className="text-center px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đơn hàng</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Chi tiêu</th>
                    <th className="text-center px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Phân khúc</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đơn gần nhất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-slate-100" /><div className="space-y-1.5"><div className="h-3 w-24 bg-slate-100 rounded" /><div className="h-2.5 w-16 bg-slate-50 rounded" /></div></div></td>
                        <td className="px-5 py-4"><div className="space-y-1.5"><div className="h-3 w-28 bg-slate-100 rounded" /><div className="h-2.5 w-20 bg-slate-50 rounded" /></div></td>
                        <td className="px-5 py-4"><div className="h-3 w-16 bg-slate-100 rounded" /></td>
                        <td className="px-5 py-4 text-center"><div className="h-3 w-6 bg-slate-100 rounded mx-auto" /></td>
                        <td className="px-5 py-4 text-right"><div className="h-3 w-16 bg-slate-100 rounded ml-auto" /></td>
                        <td className="px-5 py-4 text-center"><div className="h-5 w-14 bg-slate-100 rounded-full mx-auto" /></td>
                        <td className="px-5 py-4 text-right"><div className="h-3 w-20 bg-slate-100 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-12 h-12 text-slate-200" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                          <p className="text-sm text-slate-400">Không tìm thấy khách hàng nào</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => {
                      const segment = getSegment(customer);
                      return (
                        <tr
                          key={customer.id}
                          onClick={() => openPanel(customer)}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getAvatarColor(customer.id)}`}>
                                {customer.avatar ? (
                                  <img src={customer.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  getInitials(customer.ten)
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{customer.ten}</p>
                                <p className="text-[11px] text-slate-400">ID: #{customer.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-xs text-slate-700">{customer.email}</p>
                            <p className="text-[11px] text-slate-400">{customer.sdt || "—"}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-xs text-slate-600">{customer.tinh_thanh || "—"}</p>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className="text-sm font-semibold text-slate-700">{customer.tong_don}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="text-sm font-semibold text-emerald-600">{formatCurrency(customer.tong_chi_tieu)}đ</span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${segment.color}`}>
                              {segment.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="text-xs text-slate-500">{formatDate(customer.don_cuoi)}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="border-t border-slate-100">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Side Panel */}
      <AnimatePresence>
        {isPanelOpen && selectedCustomer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/5 z-[55] lg:hidden"
              onClick={() => setIsPanelOpen(false)}
            />
            <motion.aside
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-[400px] h-screen fixed right-0 top-0 bg-white border-l border-slate-200 flex flex-col shadow-2xl z-[60]"
            >
              {/* Panel Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h4 className="text-sm font-semibold text-slate-800">Chi tiết khách hàng</h4>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Profile */}
                <div className="px-6 py-6 text-center border-b border-slate-100">
                  <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-xl font-bold mb-3 ${getAvatarColor(selectedCustomer.id)}`}>
                    {selectedCustomer.avatar ? (
                      <img src={selectedCustomer.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getInitials(selectedCustomer.ten)
                    )}
                  </div>
                  <h5 className="text-base font-semibold text-slate-900">{selectedCustomer.ten}</h5>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedCustomer.email}</p>
                  <div className="mt-2">
                    {(() => { const seg = getSegment(selectedCustomer); return (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${seg.color}`}>{seg.label}</span>
                    ); })()}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="px-6 py-5 border-b border-slate-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 rounded-xl p-3.5">
                      <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">Tổng chi tiêu</p>
                      <p className="text-lg font-bold text-emerald-700 mt-1">{formatCurrency(selectedCustomer.tong_chi_tieu)}đ</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3.5">
                      <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wider">Tổng đơn hàng</p>
                      <p className="text-lg font-bold text-blue-700 mt-1">{selectedCustomer.tong_don} đơn</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3.5">
                      <p className="text-[10px] font-medium text-purple-600 uppercase tracking-wider">Đã giao</p>
                      <p className="text-lg font-bold text-purple-700 mt-1">{selectedCustomer.don_giao} đơn</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3.5">
                      <p className="text-[10px] font-medium text-amber-600 uppercase tracking-wider">TB/đơn</p>
                      <p className="text-lg font-bold text-amber-700 mt-1">
                        {selectedCustomer.tong_don > 0 ? formatCurrency(Math.round(selectedCustomer.tong_chi_tieu / selectedCustomer.tong_don)) + "đ" : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details List */}
                <div className="px-6 py-5">
                  <h6 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Thông tin</h6>
                  <div className="space-y-3">
                    <DetailRow label="Số điện thoại" value={selectedCustomer.sdt || "Chưa cập nhật"} />
                    <DetailRow label="Giới tính" value={selectedCustomer.gioi_tinh || "—"} />
                    <DetailRow label="Khu vực" value={selectedCustomer.tinh_thanh ? `${selectedCustomer.quan_huyen || ""}, ${selectedCustomer.tinh_thanh}` : "—"} />
                    <DetailRow label="Ngày tham gia" value={formatDate(selectedCustomer.ngay_tao)} />
                    <DetailRow label="Đơn gần nhất" value={formatDate(selectedCustomer.don_cuoi)} />
                    <DetailRow label="Trạng thái" value={selectedCustomer.trang_thai === 1 ? "Hoạt động" : "Bị khóa"} valueColor={selectedCustomer.trang_thai === 1 ? "text-emerald-600" : "text-red-500"} />
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ label, value, valueColor = "text-slate-700" }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-medium ${valueColor}`}>{value}</span>
    </div>
  );
}
