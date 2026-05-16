"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { 
  Home, Printer, Download, Search, ChevronLeft, ChevronRight, XCircle, AlertTriangle 
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";

interface InventoryItem {
  id: string;
  name: string;
  variant: string;
  unit: string;
  category: string;
  supplier: string;
  quantity: number;
  value: number;
  location: string;
  status: "NORMAL" | "EXPIRING" | "EXPIRED";
  daysLeft: number | null;
  loHang?: string;
  inactiveDays: number;
}

interface InventorySummary {
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  expiringItems: number;
}

interface InOutItem {
  id: string;
  name: string;
  variant: string;
  unit: string;
  category: string;
  startStock: number;
  import: number;
  export: number;
  endStock: number;
}

interface InOutSummary {
  totalStart: number;
  totalImport: number;
  totalExport: number;
  totalEnd: number;
}

interface WastageItem {
  id: string;
  name: string;
  variant: string;
  unit: string;
  category: string;
  wasteQty: number;
  wasteValue: number;
  reason: string;
}

interface WastageData {
  summary: {
    totalImportQty: number;
    totalWasteQty: number;
    totalWasteValue: number;
    overallRate: number;
  };
  categories: { name: string; importQty: number; wasteQty: number; rate: number }[];
  reasons: { name: string; value: number }[];
  items: WastageItem[];
}

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

export default function InventoryReportPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  
  const [inoutItems, setInoutItems] = useState<InOutItem[]>([]);
  const [inoutSummary, setInoutSummary] = useState<InOutSummary | null>(null);

  const [wastageData, setWastageData] = useState<WastageData | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingInOut, setLoadingInOut] = useState(false);
  const [loadingWastage, setLoadingWastage] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [range, setRange] = useState("30days");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch("/api/admin/reports/inventory/summary");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setItems(data.items);
        setSummary(data.summary);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  useEffect(() => {
    if (activeTab === "inout") {
      const fetchInOut = async () => {
        setLoadingInOut(true);
        try {
          const res = await fetch(`/api/admin/reports/inventory/inout?range=${range}`);
          if (!res.ok) throw new Error("Failed to fetch");
          const data = await res.json();
          setInoutItems(data.items);
          setInoutSummary(data.summary);
        } catch (error) {
          console.error("Error fetching inout data:", error);
        } finally {
          setLoadingInOut(false);
        }
      };

      fetchInOut();
    } else if (activeTab === "wastage") {
      const fetchWastage = async () => {
        setLoadingWastage(true);
        try {
          const res = await fetch(`/api/admin/reports/inventory/wastage?range=${range}`);
          if (!res.ok) throw new Error("Failed to fetch");
          const data = await res.json();
          setWastageData(data);
        } catch (error) {
          console.error("Error fetching wastage data:", error);
        } finally {
          setLoadingWastage(false);
        }
      };

      fetchWastage();
    }
  }, [activeTab, range]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const normalize = (value: unknown) => String(value ?? "").toLowerCase().trim();

  const categoryOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort(),
    [items]
  );

  const locationOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.location).filter(Boolean))).sort(),
    [items]
  );

  const filteredItems = useMemo(() => {
    const keyword = normalize(searchTerm);
    return items.filter((item) => {
      const searchable = [
        item.id,
        item.name,
        item.variant,
        item.category,
        item.supplier,
        item.location,
        item.loHang,
      ].map(normalize).join(" ");

      const matchesSearch = !keyword || searchable.includes(keyword);
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesLocation = locationFilter === "all" || item.location === locationFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesSlowTab = activeTab !== "slow" || item.inactiveDays >= 30;

      return matchesSearch && matchesCategory && matchesLocation && matchesStatus && matchesSlowTab;
    });
  }, [items, searchTerm, categoryFilter, locationFilter, statusFilter, activeTab]);

  const filteredInOutItems = useMemo(() => {
    const keyword = normalize(searchTerm);
    return inoutItems.filter((item) => {
      const searchable = [item.id, item.name, item.variant, item.category, item.unit].map(normalize).join(" ");
      return !keyword || searchable.includes(keyword);
    });
  }, [inoutItems, searchTerm]);

  const filteredWastageItems = useMemo(() => {
    const keyword = normalize(searchTerm);
    return (wastageData?.items || []).filter((item) => {
      const searchable = [item.id, item.name, item.variant, item.category, item.reason, item.unit].map(normalize).join(" ");
      return !keyword || searchable.includes(keyword);
    });
  }, [wastageData, searchTerm]);

  const getCurrentDataLength = () => {
    if (activeTab === 'inout') return filteredInOutItems.length;
    if (activeTab === 'wastage') return filteredWastageItems.length;
    return filteredItems.length;
  };

  const totalRows = getCurrentDataLength();
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const pageStartIndex = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEndIndex = Math.min(currentPage * pageSize, totalRows);

  const paginatedItems = useMemo(
    () => filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredItems, currentPage, pageSize]
  );

  const paginatedInOutItems = useMemo(
    () => filteredInOutItems.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredInOutItems, currentPage, pageSize]
  );

  const paginatedWastageItems = useMemo(
    () => filteredWastageItems.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredWastageItems, currentPage, pageSize]
  );

  const visiblePages = useMemo(() => {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, range, searchTerm, categoryFilter, locationFilter, statusFilter, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setLocationFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    const wb = XLSX.utils.book_new();
    let totalRows = 0;
    if (activeTab === "inout") {
      const rows = filteredInOutItems.map((it, i) => ({
        STT: i + 1, "Mã": it.id, "Sản phẩm": it.name, "Biến thể": it.variant,
        "Đơn vị": it.unit, "Danh mục": it.category,
        "Tồn đầu kỳ": it.startStock, "Nhập kỳ": it.import,
        "Xuất kỳ": it.export, "Tồn cuối kỳ": it.endStock,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "NhapXuat");
      totalRows = rows.length;
    } else if (activeTab === "wastage") {
      const rows = filteredWastageItems.map((it, i) => ({
        STT: i + 1, "Mã": it.id, "Sản phẩm": it.name, "Biến thể": it.variant,
        "Đơn vị": it.unit, "Danh mục": it.category,
        "SL hỏng": it.wasteQty, "Giá trị hỏng (đ)": it.wasteValue, "Lý do": it.reason,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "HaoHut");
      totalRows = rows.length;
    } else {
      const rows = filteredItems.map((it, i) => ({
        STT: i + 1, "Mã": it.id, "Sản phẩm": it.name, "Biến thể": it.variant,
        "Đơn vị": it.unit, "Danh mục": it.category, "NCC": it.supplier,
        "Tồn kho": it.quantity, "Giá trị (đ)": it.value, "Vị trí": it.location,
        "Trạng thái": it.status, "Còn (ngày)": it.daysLeft ?? "",
        "Lô hàng": it.loHang ?? "", "Không bán (ngày)": it.inactiveDays,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "TonKho");
      totalRows = rows.length;
    }
    if (totalRows === 0) { toast.error("Không có dữ liệu để xuất"); return; }
    XLSX.writeFile(wb, `BaoCaoKho_${activeTab}_${today}.xlsx`);
    toast.success(`Đã xuất ${totalRows} dòng`);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto text-sm text-gray-800 pb-10">
      {/* Page Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs font-medium">
          <Home size={14} />
          <span>/ Báo cáo & Phân tích / Báo cáo Kho hàng</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">Trung tâm Báo cáo Tồn Kho</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-1 border border-gray-300 text-gray-700 font-bold text-xs uppercase px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Printer size={16} /> In báo cáo
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-1 bg-green-800 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg hover:bg-green-700 transition-opacity">
              <Download size={16} /> Xuất dữ liệu (Excel)
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 border-b-2 font-semibold whitespace-nowrap ${activeTab === 'summary' ? 'border-green-800 text-green-800' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
          Tồn kho tổng hợp
        </button>
        <button 
          onClick={() => setActiveTab('slow')}
          className={`px-4 py-2 border-b-2 font-semibold whitespace-nowrap ${activeTab === 'slow' ? 'border-green-800 text-green-800' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
          Hàng tồn lâu
        </button>
        <button 
          onClick={() => setActiveTab('inout')}
          className={`px-4 py-2 border-b-2 font-semibold whitespace-nowrap ${activeTab === 'inout' ? 'border-green-800 text-green-800' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
          Nhập / Xuất kho
        </button>
        <button 
          onClick={() => setActiveTab('wastage')}
          className={`px-4 py-2 border-b-2 font-semibold whitespace-nowrap ${activeTab === 'wastage' ? 'border-green-800 text-green-800' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
          Tỷ lệ hao hụt
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tìm kiếm sản phẩm</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Mã SKU, tên sản phẩm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-2 py-1.5 border border-gray-300 rounded-lg focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none"
              />
            </div>
          </div>
          {(activeTab === 'inout' || activeTab === 'wastage') && (
            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phạm vi thời gian</label>
              <select 
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none appearance-none"
              >
                <option value="today">Hôm nay</option>
                <option value="7days">7 Ngày qua</option>
                <option value="30days">30 Ngày qua</option>
                <option value="thisMonth">Tháng này</option>
              </select>
            </div>
          )}
          {(activeTab === 'summary' || activeTab === 'slow') && (
            <>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Danh mục</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none appearance-none"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Khu vực kho</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none appearance-none"
                >
                  <option value="all">Tất cả khu vực</option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trạng thái hạn sử dụng</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none appearance-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="NORMAL">Bình thường</option>
                  <option value="EXPIRING">Sắp hết hạn</option>
                  <option value="EXPIRED">Đã hết hạn</option>
                </select>
              </div>
            </>
          )}
          <div className="col-span-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Số dòng mỗi trang</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none appearance-none"
            >
              <option value={10}>10 dòng</option>
              <option value={20}>20 dòng</option>
              <option value={50}>50 dòng</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2 border-t border-gray-200 pt-4">
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-gray-700 text-xs font-bold uppercase hover:bg-gray-100 rounded-lg transition-colors"
          >
            Xóa bộ lọc
          </button>
          <button
            onClick={() => setCurrentPage(1)}
            className="px-4 py-2 bg-green-800 text-white text-xs font-bold uppercase rounded-lg hover:bg-green-700 transition-opacity"
          >
            Áp dụng lọc
          </button>
        </div>
      </div>

      {/* Wastage Charts */}
      {activeTab === 'wastage' && wastageData && !loadingWastage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
              <AlertTriangle className="text-orange-500" size={18} /> Phân bổ lý do hao hụt / xuất huỷ
            </h3>
            <div className="flex-1 h-[250px] w-full">
              {wastageData.reasons.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wastageData.reasons}
                      cx="50%" cy="50%" outerRadius={80}
                      dataKey="value" nameKey="name"
                      labelLine={false}
                    >
                      {wastageData.reasons.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [value, 'Số lượng']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">Không có dữ liệu hao hụt</div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
              <XCircle className="text-red-500" size={18} /> Tỷ lệ hao hụt theo danh mục (%)
            </h3>
            <div className="flex-1 h-[250px] w-full">
              {wastageData.categories.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wastageData.categories} layout="vertical" margin={{ left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tickFormatter={(val) => `${val}%`} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Tỷ lệ hao hụt']} />
                    <Bar dataKey="rate" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">Không có dữ liệu danh mục</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Data Table Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Stats */}
        {(activeTab === 'summary' || activeTab === 'slow') && (
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div className="text-lg font-semibold text-gray-900">
              Kết quả: {loading ? "..." : filteredItems.length} / {summary?.totalItems ?? 0} lô hàng
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                Tổng giá trị tồn: <span className="font-bold text-gray-900">{loading ? "..." : formatCurrency(summary?.totalValue || 0)}</span>
              </div>
              <div className="text-red-600">
                Cảnh báo hạn SD: <span className="font-bold">{loading ? "..." : summary?.expiringItems} Lô</span>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'inout' && (
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div className="text-lg font-semibold text-gray-900">
              Biến động tồn kho: {loadingInOut ? "..." : filteredInOutItems.length} / {inoutItems.length} mã sản phẩm
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                Đầu kỳ: <span className="font-bold text-gray-900">{loadingInOut ? "..." : inoutSummary?.totalStart}</span>
              </div>
              <div className="text-green-600">
                Nhập kho: <span className="font-bold">{loadingInOut ? "..." : inoutSummary?.totalImport}</span>
              </div>
              <div className="text-orange-600">
                Xuất kho: <span className="font-bold">{loadingInOut ? "..." : inoutSummary?.totalExport}</span>
              </div>
              <div className="text-blue-600">
                Tồn cuối: <span className="font-bold">{loadingInOut ? "..." : inoutSummary?.totalEnd}</span>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'wastage' && (
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div className="text-lg font-semibold text-gray-900">
              Chi tiết các lô hàng bị huỷ/hao hụt
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                Tổng lượng nhập: <span className="font-bold text-gray-900">{loadingWastage ? "..." : wastageData?.summary.totalImportQty}</span>
              </div>
              <div className="text-red-600">
                Tổng hao hụt: <span className="font-bold text-xl">{loadingWastage ? "..." : wastageData?.summary.totalWasteQty}</span>
              </div>
              <div className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">
                Tỷ lệ: {loadingWastage ? "..." : wastageData?.summary.overallRate.toFixed(2)}%
              </div>
            </div>
          </div>
        )}
        
        {/* Table for Summary & Slow-moving */}
        {(activeTab === 'summary' || activeTab === 'slow') && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-3 pl-4 w-12"><input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-600" /></th>
                  <th className="p-3">Sản phẩm & Thuộc tính</th>
                  <th className="p-3">Danh mục / NCC</th>
                  <th className="p-3">Vị trí lưu trữ</th>
                  <th className="p-3 text-right">SL Tồn</th>
                  <th className="p-3 text-right">Giá trị (VNĐ)</th>
                  <th className="p-3">Trạng thái HSD</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr><td colSpan={7} className="p-4 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                ) : filteredItems.length === 0 ? (
                  <tr><td colSpan={7} className="p-4 text-center text-gray-500">Không tìm thấy sản phẩm nào</td></tr>
                ) : (
                  paginatedItems.map((item, idx) => (
                    <tr key={`${item.id}-${idx}`} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${item.status === 'EXPIRED' ? 'bg-red-50/50 hover:bg-red-100/50' : 'bg-white'}`}>
                      <td className="p-3 pl-4"><input type="checkbox" className="rounded border-gray-300 text-green-600" /></td>
                      <td className={`p-3 font-medium ${item.status === 'EXPIRED' ? 'text-red-600' : 'text-gray-900'}`}>
                        <div className="text-xs text-gray-400 font-mono mb-0.5">{item.id}</div>
                        <div>{item.name}</div>
                        <div className="font-normal text-gray-500 text-xs mt-0.5">{item.variant} {item.loHang ? `• Lô: ${item.loHang}` : ''}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-gray-900 font-medium">{item.category}</div>
                        <div className="text-gray-500 text-xs mt-0.5 truncate max-w-[200px]">{item.supplier}</div>
                      </td>
                      <td className="p-3 text-gray-600">{item.location}</td>
                      <td className={`p-3 text-right font-mono ${item.status === 'EXPIRED' ? 'font-bold text-red-600' : ''}`}>
                        {item.quantity} <span className="text-xs text-gray-400 font-sans">{item.unit}</span>
                      </td>
                      <td className={`p-3 text-right font-mono ${item.status === 'EXPIRED' ? 'text-red-600' : ''}`}>
                        {formatCurrency(item.value).replace('₫', '').trim()}
                      </td>
                      <td className="p-3">
                        {item.status === "NORMAL" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-100 text-green-800 text-[11px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-green-700"></span> Tốt</span>}
                        {item.status === "EXPIRING" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-100 text-orange-800 text-[11px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span> Cận Date ({item.daysLeft} ngày)</span>}
                        {item.status === "EXPIRED" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-100 text-red-800 text-[11px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Đã hết hạn</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table for InOut */}
        {activeTab === 'inout' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-3 pl-4 w-12"><input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-600" /></th>
                  <th className="p-3">Sản phẩm & Biến thể</th>
                  <th className="p-3 text-right">Tồn Đầu Kỳ</th>
                  <th className="p-3 text-right text-green-700">Nhập Trong Kỳ</th>
                  <th className="p-3 text-right text-orange-600">Xuất Trong Kỳ</th>
                  <th className="p-3 text-right text-blue-700">Tồn Cuối Kỳ</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loadingInOut ? (
                  <tr><td colSpan={6} className="p-4 text-center text-gray-500">Đang tải dữ liệu Nhập Xuất Tồn...</td></tr>
                ) : filteredInOutItems.length === 0 ? (
                  <tr><td colSpan={6} className="p-4 text-center text-gray-500">Không tìm thấy dữ liệu trong kỳ báo cáo</td></tr>
                ) : (
                  paginatedInOutItems.map((item, idx) => (
                    <tr key={`${item.id}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors bg-white">
                      <td className="p-3 pl-4"><input type="checkbox" className="rounded border-gray-300 text-green-600" /></td>
                      <td className="p-3 font-medium text-gray-900">
                        <div className="text-xs text-gray-400 font-mono mb-0.5">{item.id}</div>
                        <div>{item.name}</div>
                        <div className="font-normal text-gray-500 text-xs mt-0.5">{item.variant}</div>
                      </td>
                      <td className="p-3 text-right font-mono font-medium text-gray-700">{item.startStock} <span className="text-xs text-gray-400 font-sans">{item.unit}</span></td>
                      <td className="p-3 text-right font-mono font-medium text-green-600 bg-green-50/30">{item.import > 0 ? `+${item.import}` : '-'}</td>
                      <td className="p-3 text-right font-mono font-medium text-orange-500 bg-orange-50/30">{item.export > 0 ? `-${item.export}` : '-'}</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-700 bg-blue-50/30">{item.endStock} <span className="text-xs text-gray-400 font-sans">{item.unit}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table for Wastage */}
        {activeTab === 'wastage' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-3 pl-4 w-12"><input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-600" /></th>
                  <th className="p-3">Sản phẩm & Biến thể</th>
                  <th className="p-3">Danh mục</th>
                  <th className="p-3">Lý do huỷ / xuất</th>
                  <th className="p-3 text-right text-red-600">Số Lượng Huỷ</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loadingWastage ? (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-500">Đang tải dữ liệu hao hụt...</td></tr>
                ) : filteredWastageItems.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-500">Khoẻ re! Không có hao hụt nào trong kỳ báo cáo.</td></tr>
                ) : (
                  paginatedWastageItems.map((item, idx) => (
                    <tr key={`${item.id}-${idx}`} className="border-b border-gray-100 hover:bg-red-50/30 transition-colors bg-white">
                      <td className="p-3 pl-4"><input type="checkbox" className="rounded border-gray-300 text-green-600" /></td>
                      <td className="p-3 font-medium text-gray-900">
                        <div className="text-xs text-gray-400 font-mono mb-0.5">{item.id}</div>
                        <div>{item.name}</div>
                        <div className="font-normal text-gray-500 text-xs mt-0.5">{item.variant}</div>
                      </td>
                      <td className="p-3 text-gray-700">{item.category}</td>
                      <td className="p-3 text-gray-700">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">
                          {item.reason}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-red-600">
                        -{item.wasteQty} <span className="text-xs text-gray-400 font-sans">{item.unit}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        <div className="p-4 flex items-center justify-between bg-white border-t border-gray-100">
          <div className="text-gray-500 text-xs">
            Hiển thị {pageStartIndex}-{pageEndIndex} trên {totalRows} kết quả
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage <= 1}
            >
              <ChevronLeft size={16} />
            </button>
            {visiblePages[0] > 1 && (
              <>
                <button
                  onClick={() => setCurrentPage(1)}
                  className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-xs"
                >
                  1
                </button>
                <span className="px-1 text-gray-400">...</span>
              </>
            )}
            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded font-medium text-xs ${
                  page === currentPage
                    ? "bg-green-800 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            {visiblePages[visiblePages.length - 1] < totalPages && (
              <>
                <span className="px-1 text-gray-400">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-xs"
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage >= totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
