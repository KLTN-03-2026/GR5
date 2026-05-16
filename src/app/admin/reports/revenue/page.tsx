"use client";

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { 
  Home, Download, TrendingUp, DollarSign, Activity, Truck, Package, MapPin, Users
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from "recharts";

interface RevenueData {
  summary: {
    totalRevenue: number;
    productRevenue: number;
    totalCost: number;
    totalShippingCost: number;
    grossProfit: number;
    margin: number;
    ordersCount: number;
  };
  chartData: { date: string; value: number }[];
  categoryData: { name: string; value: number; profit: number }[];
  cityData: { name: string; value: number }[];
  staffData: { name: string; revenue: number; orders: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}

const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function RevenueReportPage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30days");

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/reports/revenue?range=${range}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
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
      { "Chỉ số": "Tổng doanh thu (đ)", "Giá trị": data.summary.totalRevenue },
      { "Chỉ số": "Doanh thu sản phẩm (đ)", "Giá trị": data.summary.productRevenue },
      { "Chỉ số": "Tổng giá vốn (đ)", "Giá trị": data.summary.totalCost },
      { "Chỉ số": "Phí vận chuyển thu hộ (đ)", "Giá trị": data.summary.totalShippingCost },
      { "Chỉ số": "Lợi nhuận gộp (đ)", "Giá trị": data.summary.grossProfit },
      { "Chỉ số": "Biên LN (%)", "Giá trị": data.summary.margin },
      { "Chỉ số": "Số đơn", "Giá trị": data.summary.ordersCount },
    ]), "TongHop");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      data.chartData.map(c => ({ "Ngày": c.date, "Doanh thu (đ)": c.value }))
    ), "TheoNgay");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      data.categoryData.map(c => ({ "Danh mục": c.name, "Doanh thu (đ)": c.value, "Lợi nhuận (đ)": c.profit }))
    ), "TheoDanhMuc");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      data.cityData.map(c => ({ "Tỉnh/Thành": c.name, "Doanh thu (đ)": c.value }))
    ), "TheoTinh");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      data.staffData.map(s => ({ "Nhân viên": s.name, "Doanh thu (đ)": s.revenue, "Số đơn": s.orders }))
    ), "TheoNhanVien");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      data.topProducts.map((p, i) => ({ "Hạng": i + 1, "Sản phẩm": p.name, "SL": p.quantity, "Doanh thu (đ)": p.revenue }))
    ), "TopSanPham");
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `BaoCaoDoanhThu_${range}_${today}.xlsx`);
    toast.success("Đã xuất báo cáo doanh thu");
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto text-sm text-gray-800">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs font-medium">
          <Home size={14} />
          <span>/ Báo cáo & Phân tích / Báo cáo Doanh thu Chi tiết</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">Báo Cáo Doanh Thu Chi Tiết</h2>
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
              <Download size={16} /> Xuất Excel
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">Đang tải dữ liệu báo cáo...</div>
      ) : data ? (
        <>
          {/* Section 1.3: Lợi Nhuận Gộp KPIs */}
          <h3 className="font-bold text-lg text-gray-800 mb-3 border-b pb-2">1. Chỉ số Doanh Thu & Lợi Nhuận Gộp</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase mb-2">
                <DollarSign size={16} /> Doanh thu sản phẩm
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(data.summary.productRevenue)}</div>
              <div className="text-xs text-gray-400 font-medium">Từ {data.summary.ordersCount} đơn (đã trừ phí ship thu hộ)</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm border-l-4 border-l-orange-500">
              <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase mb-2">
                <Package size={16} /> Chi phí vốn (Giá nhập)
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(data.summary.totalCost)}</div>
              <div className="text-xs text-orange-600 font-medium">Giá nhập bình quân gia quyền (theo phiếu nhập)</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm border-l-4 border-l-blue-500">
              <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase mb-2">
                <Truck size={16} /> Phí ship (thu hộ)
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(data.summary.totalShippingCost)}</div>
              <div className="text-xs text-blue-600 font-medium">Khách trả — không ảnh hưởng LN</div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm border-l-4 border-l-green-600">
              <div className="flex items-center gap-2 text-green-800 font-bold text-xs uppercase mb-2">
                <Activity size={16} /> Lợi Nhuận Gộp
              </div>
              <div className="text-2xl font-bold text-green-700 mb-1">{formatCurrency(data.summary.grossProfit)}</div>
              <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                Biên LN: <span className="font-bold text-sm bg-green-200 px-1.5 rounded">{data.summary.margin.toFixed(1)}%</span>
                <span className="text-gray-400">· DT SP − Giá vốn</span>
              </div>
            </div>
          </div>

          {/* Section 1.2: Doanh thu theo thời gian và danh mục */}
          <h3 className="font-bold text-lg text-gray-800 mb-3 border-b pb-2">2. Phân tích Chi Tiết Doanh Thu</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Xu hướng Doanh thu (Theo thời gian)</h4>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="value" name="Doanh thu" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Doanh thu & Biên LN theo Danh mục</h4>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.categoryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="value" name="Doanh thu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" name="Lợi nhuận" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Section: Địa lý, Nhân viên, Top Sản phẩm */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Doanh thu theo tỉnh thành */}
            <div className="bg-white border border-gray-200 rounded-xl p-0 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                <MapPin size={18} className="text-gray-500" />
                <h4 className="font-semibold text-gray-900">Top Địa Lý (Tỉnh/Thành)</h4>
              </div>
              <ul className="divide-y divide-gray-100">
                {data.cityData.length === 0 ? <li className="p-4 text-gray-500 text-center">Chưa có dữ liệu</li> : null}
                {data.cityData.map((city, idx) => (
                  <li key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <span className="font-medium text-gray-700">{city.name}</span>
                    <span className="font-mono text-green-700 font-bold">{formatCurrency(city.value)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Doanh thu theo nhân viên */}
            <div className="bg-white border border-gray-200 rounded-xl p-0 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                <Users size={18} className="text-gray-500" />
                <h4 className="font-semibold text-gray-900">Top Nhân Viên Xử Lý Đơn</h4>
              </div>
              <ul className="divide-y divide-gray-100">
                {data.staffData.length === 0 ? <li className="p-4 text-gray-500 text-center">Chưa có dữ liệu</li> : null}
                {data.staffData.map((staff, idx) => (
                  <li key={idx} className="p-4 flex flex-col hover:bg-gray-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-800">{staff.name}</span>
                      <span className="font-mono text-blue-700 font-bold">{formatCurrency(staff.revenue)}</span>
                    </div>
                    <div className="text-xs text-gray-500">Đã xử lý: {staff.orders} đơn hàng</div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top 5 sản phẩm */}
            <div className="bg-white border border-gray-200 rounded-xl p-0 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                <TrendingUp size={18} className="text-gray-500" />
                <h4 className="font-semibold text-gray-900">Top Sản Phẩm Bán Chạy</h4>
              </div>
              <ul className="divide-y divide-gray-100">
                {data.topProducts.length === 0 ? <li className="p-4 text-gray-500 text-center">Chưa có dữ liệu</li> : null}
                {data.topProducts.map((product, idx) => (
                  <li key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div className="truncate pr-4 flex-1">
                      <span className="font-medium text-gray-800 block truncate">{product.name}</span>
                      <span className="text-xs text-gray-500">Đã bán: {product.quantity}</span>
                    </div>
                    <span className="font-mono text-gray-900">{formatCurrency(product.revenue)}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </>
      ) : null}
    </div>
  );
}
