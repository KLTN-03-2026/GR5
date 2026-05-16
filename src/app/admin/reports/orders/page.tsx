"use client";

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { 
  Home, Download, ShoppingBag, XCircle, Clock, Users, RefreshCw
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

interface OrdersReportData {
  summary: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    cancelRate: number;
    avgProcessingHours: number;
    totalCustomers: number;
    repeatRate: number;
  };
  statusDistribution: { name: string; value: number }[];
  trend: { date: string; value: number }[];
  peakHours: { hour: string; value: number }[];
  payments: { name: string; total: number; success: number; failed: number; pendingManual: number; revenue: number; successRate: number }[];
  topCustomers: { id: string; name: string; frequency: number; monetary: number; recency: string }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export default function OrdersReportPage() {
  const [data, setData] = useState<OrdersReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30days");

  useEffect(() => {
    const fetchOrdersData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/reports/orders?range=${range}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching orders data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersData();
  }, [range]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const handleExportExcel = () => {
    if (!data) { toast.error("Không có dữ liệu để xuất"); return; }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { "Chỉ số": "Tổng số đơn", "Giá trị": data.summary.totalOrders },
      { "Chỉ số": "Đơn hoàn thành", "Giá trị": data.summary.completedOrders },
      { "Chỉ số": "Đơn huỷ", "Giá trị": data.summary.cancelledOrders },
      { "Chỉ số": "Tỉ lệ huỷ (%)", "Giá trị": data.summary.cancelRate },
      { "Chỉ số": "Thời gian xử lý TB (giờ)", "Giá trị": data.summary.avgProcessingHours },
      { "Chỉ số": "Tổng khách hàng", "Giá trị": data.summary.totalCustomers },
      { "Chỉ số": "Tỉ lệ mua lại (%)", "Giá trị": data.summary.repeatRate },
    ]), "TongHop");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      data.statusDistribution.map(s => ({ "Trạng thái": s.name, "Số đơn": s.value }))
    ), "TrangThai");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      data.trend.map(t => ({ "Ngày": t.date, "Số đơn": t.value }))
    ), "XuHuong");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      data.payments.map(p => ({
        "Phương thức": p.name, "Tổng": p.total, "Thành công": p.success,
        "Thất bại": p.failed, "Chờ thủ công": p.pendingManual,
        "Doanh thu (đ)": p.revenue, "Tỉ lệ thành công (%)": p.successRate,
      }))
    ), "ThanhToan");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      data.topCustomers.map((c, i) => ({
        "Hạng": i + 1, "Mã KH": c.id, "Họ tên": c.name,
        "Số đơn": c.frequency, "Tổng chi (đ)": c.monetary,
        "Đơn gần nhất": c.recency,
      }))
    ), "TopKhach");
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `BaoCaoDonHang_${range}_${today}.xlsx`);
    toast.success("Đã xuất báo cáo đơn hàng");
  };

  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      CHO_XAC_NHAN: 'Chờ xác nhận',
      DA_XAC_NHAN: 'Đã xác nhận',
      CHO_GIAO_HANG: 'Chờ giao hàng',
      DANG_GIAO_HANG: 'Đang giao',
      DA_GIAO: 'Đã giao',
      HOAN_THANH: 'Hoàn thành',
      DA_HUY: 'Đã huỷ',
      YEU_CAU_DOI_TRA: 'Đổi trả'
    };
    return map[status] || status;
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto text-sm text-gray-800">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs font-medium">
          <Home size={14} />
          <span>/ Báo cáo & Phân tích / Báo cáo Đơn Hàng & Khách Hàng</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">Báo Cáo Đơn Hàng & Khách Hàng</h2>
          <div className="flex items-center gap-2">
            <select 
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 font-bold text-xs uppercase px-4 py-2 rounded-lg outline-none"
            >
              <option value="today">Hôm nay</option>
              <option value="7days">7 Ngày qua</option>
              <option value="30days">30 Ngày qua</option>
              <option value="thisMonth">Tháng này</option>
            </select>
            <button onClick={handleExportExcel} className="flex items-center gap-1 bg-green-800 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg hover:bg-green-700">
              <Download size={16} /> Xuất Báo Cáo
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">Đang tải dữ liệu báo cáo...</div>
      ) : data ? (
        <>
          {/* Section 2.1: Thống Kê Tổng Hợp */}
          <h3 className="font-bold text-lg text-gray-800 mb-3 border-b pb-2">2.1 Thống Kê Đơn Hàng Tổng Hợp</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase mb-2">
                <ShoppingBag size={16} /> Tổng số đơn
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{data.summary.totalOrders}</div>
              <div className="text-xs text-green-600 font-medium">Thành công: {data.summary.completedOrders}</div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase mb-2">
                <XCircle size={16} /> Tỷ lệ huỷ đơn
              </div>
              <div className="text-2xl font-bold text-red-700 mb-1">{data.summary.cancelRate.toFixed(1)}%</div>
              <div className="text-xs text-red-600 font-medium">{data.summary.cancelledOrders} đơn đã huỷ</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase mb-2">
                <Clock size={16} /> Thời gian xử lý TB
              </div>
              <div className="text-2xl font-bold text-blue-800 mb-1">{data.summary.avgProcessingHours.toFixed(1)}h</div>
              <div className="text-xs text-blue-600 font-medium">Từ Xác nhận đến Giao hàng</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase mb-2">
                <Users size={16} /> Tổng Khách Mua
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{data.summary.totalCustomers}</div>
              <div className="text-xs text-gray-400 font-medium">Số lượng user unique</div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase mb-2">
                <RefreshCw size={16} /> Khách quay lại
              </div>
              <div className="text-2xl font-bold text-purple-800 mb-1">{data.summary.repeatRate.toFixed(1)}%</div>
              <div className="text-xs text-purple-600 font-medium">Tỷ lệ mua &gt; 1 lần</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Số lượng đơn mới (Trend 30 ngày)</h4>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: any) => [value, 'Đơn hàng']} />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Phân bổ Trạng thái đơn</h4>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                      labelLine={false}
                    >
                      {data.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [value, 'Đơn hàng']} labelFormatter={(label) => formatStatus(label as string)} />
                    <Legend formatter={(value) => formatStatus(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Section 2.2 & 2.3: Thanh toán và Khách hàng */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Thanh toán */}
            <div className="bg-white border border-gray-200 rounded-xl p-0 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-bold text-gray-900">2.2 Hiệu suất Phương thức Thanh toán</h3>
              </div>
              <div className="p-4 flex-1">
                <div className="h-[200px] w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.payments}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="success" name="Thành công" fill="#10b981" stackId="a" />
                      <Bar dataKey="failed" name="Thất bại" fill="#ef4444" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-100 text-gray-500 uppercase">
                        <th className="p-2">Phương thức</th>
                        <th className="p-2 text-right">Tổng đơn</th>
                        <th className="p-2 text-right">Thành công</th>
                        <th className="p-2 text-right">Tỷ lệ</th>
                        <th className="p-2 text-right">Chờ XN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.payments.map((p, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="p-2 font-medium">{p.name}</td>
                          <td className="p-2 text-right">{p.total}</td>
                          <td className="p-2 text-right text-green-600">{p.success}</td>
                          <td className="p-2 text-right font-bold">{p.successRate.toFixed(1)}%</td>
                          <td className="p-2 text-right text-orange-500">{p.pendingManual}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Khách hàng RFM */}
            <div className="bg-white border border-gray-200 rounded-xl p-0 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-bold text-gray-900">2.3 Top 10 Khách Hàng (RFM)</h3>
              </div>
              <div className="overflow-x-auto p-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-100 text-gray-500 uppercase">
                      <th className="p-2">Hạng</th>
                      <th className="p-2">Khách hàng</th>
                      <th className="p-2 text-center" title="Frequency - Số lần mua">Đơn (F)</th>
                      <th className="p-2 text-right" title="Monetary - Tổng chi tiêu">Chi tiêu (M)</th>
                      <th className="p-2 text-right" title="Recency - Mua gần nhất">Gần nhất (R)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topCustomers.length === 0 && (
                      <tr><td colSpan={5} className="p-4 text-center">Không có dữ liệu</td></tr>
                    )}
                    {data.topCustomers.map((c, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-2 text-gray-400 font-bold">#{i + 1}</td>
                        <td className="p-2 font-medium text-gray-900 truncate max-w-[120px]">{c.name}</td>
                        <td className="p-2 text-center font-bold text-purple-700">{c.frequency}</td>
                        <td className="p-2 text-right font-mono text-green-700 font-bold">{formatCurrency(c.monetary)}</td>
                        <td className="p-2 text-right text-gray-500">{formatDate(c.recency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
          
          {/* Peak Hours Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">Mật độ đặt hàng theo giờ trong ngày (Peak Hours)</h4>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => [value, 'Đơn']} />
                  <Bar dataKey="value" name="Số đơn hàng" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
