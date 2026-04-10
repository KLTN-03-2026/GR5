'use client'

import { 
  LayoutDashboard, 
  ChevronRight, 
  Calendar, 
  Eye, 
  ChevronLeft,
  TrendingUp,
  Truck,
  RotateCcw,
  CheckCircle2,
  X,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';

// --- MAPPING STATUS ---
const STATUS_MAP: Record<string, string> = {
  'Tất cả': 'Tất cả',
  'CHO_XAC_NHAN': 'Chờ xác nhận',
  'DANG_GIAO_HANG': 'Đang giao hàng',
  'DA_GIAO': 'Đã giao',
  'DA_HUY': 'Đã hủy',
  'YEU_CAU_DOI_TRA': 'Yêu cầu đổi/trả'
};

const statusStyles: Record<string, string> = {
  'CHO_XAC_NHAN': 'bg-orange-100 text-orange-700',
  'DANG_GIAO_HANG': 'bg-blue-100 text-blue-700',
  'DA_GIAO': 'bg-emerald-100 text-[#00873A]',
  'DA_HUY': 'bg-rose-100 text-rose-700',
  'YEU_CAU_DOI_TRA': 'bg-purple-100 text-purple-700',
};

const formatCurrency = (amount: any) => {
  const num = parseFloat(amount?.toString() || "0");
  return num.toLocaleString('vi-VN') + 'đ';
};

const formatDate = (dateString: string, type: 'display' | 'input' = 'display') => {
  if (!dateString) return '...';
  const d = new Date(dateString);
  if (type === 'input') {
    return d.toISOString().split('T')[0];
  }
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function OrdersManagementContent() {
  // --- STATES DỮ LIỆU ---
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  
  // --- 🚀 THÊM STATES PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Hiển thị 5 đơn / 1 trang

  // States Modal
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // --- FETCH API ---
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/orders'); 
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchStatus = activeFilter === 'Tất cả' || order.trang_thai === activeFilter;
      const orderDateInput = formatDate(order.ngay_tao, 'input');
      const matchDate = selectedDate === '' || orderDateInput === selectedDate;
      return matchStatus && matchDate;
    });
  }, [orders, activeFilter, selectedDate]);

  // --- 🚀 RESET TRANG 1 KHI ĐỔI BỘ LỌC ---
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, selectedDate]);

  // --- 🚀 LOGIC TÍNH TOÁN PHÂN TRANG ---
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  // Cắt mảng dữ liệu theo trang hiện tại (Dùng mảng này để render vào table)
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  // --- HÀM CẬP NHẬT TRẠNG THÁI ---
  const handleUpdateStatus = async () => {
    if (!viewingOrder || !newStatus || newStatus === viewingOrder.trang_thai) return;
    
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: viewingOrder.id,
          status: newStatus
        })
      });

      const data = await res.json();
      if (data.success || res.ok) {
        setOrders(orders.map(o => o.id === viewingOrder.id ? { ...o, trang_thai: newStatus } : o));
        setViewingOrder({ ...viewingOrder, trang_thai: newStatus });
      } else {
        alert("Lỗi: " + (data.message || "Không thể cập nhật"));
      }
    } catch (error) {
      alert("Lỗi hệ thống khi cập nhật!");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openDetailModal = (order: any) => {
    setViewingOrder(order);
    setNewStatus(order.trang_thai);
  };

  return (
    <div className="w-full flex flex-col gap-8 bg-[#F4FCF0] p-6 min-h-screen">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight">Quản lý đơn hàng</h1>
          <p className="text-gray-500 mt-1 font-medium">Theo dõi và quản lý các giao dịch nông sản từ khách hàng.</p>
        </div>
        
        <div className="flex gap-2 h-12">
          <div className="relative h-full flex items-center bg-white shadow-sm rounded-xl border border-gray-200 transition-all focus-within:ring-2 focus-within:ring-[#00873A] overflow-hidden">
            <Calendar className="absolute left-4 text-gray-400 pointer-events-none" size={18} />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-12 pr-4 py-3 h-full bg-transparent font-bold text-sm text-gray-900 outline-none cursor-pointer w-[160px] relative z-10"
            />
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate('')} 
                className="absolute right-2 z-20 p-1 bg-gray-100 rounded text-rose-500 hover:bg-rose-100 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- FILTERS --- */}
      <div className="flex flex-wrap items-center gap-3">
        {Object.keys(STATUS_MAP).map(statusKey => (
          <FilterButton 
            key={statusKey}
            label={STATUS_MAP[statusKey]} 
            active={activeFilter === statusKey} 
            onClick={() => setActiveFilter(statusKey)}
          />
        ))}
      </div>

      {/* --- TABLE DỮ LIỆU --- */}
      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Mã ĐH</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Khách hàng</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Ngày đặt</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Tổng tiền</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Trạng thái</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#00873A] border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400 font-medium">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                // 🚀 DÙNG paginatedOrders THAY VÌ filteredOrders
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5 font-bold text-gray-900">#{order.id}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            className="w-full h-full object-cover" 
                            src={order.nguoi_dung?.ho_so_nguoi_dung?.avatar || "https://placehold.co/100"} 
                            alt="Avatar"
                          />
                        </div>
                        <span className="font-semibold text-sm whitespace-nowrap">
                          {order.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || order.nguoi_dung?.email || `User #${order.ma_nguoi_dung}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-500 font-medium">{formatDate(order.ngay_tao)}</td>
                    <td className="px-8 py-5 font-black text-sm text-right text-[#00873A]">{formatCurrency(order.tong_tien)}</td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter whitespace-nowrap ${statusStyles[order.trang_thai] || 'bg-gray-100 text-gray-500'}`}>
                          {STATUS_MAP[order.trang_thai] || order.trang_thai}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => openDetailModal(order)}
                        className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:bg-[#00873A] hover:text-white transition-all inline-flex items-center justify-center active:scale-90"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* --- 🚀 PAGINATION UI HOÀN CHỈNH --- */}
        <div className="px-8 py-6 flex items-center justify-between bg-gray-50/50 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-400">
            Hiển thị {filteredOrders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} 
            {' '} - {' '}
            {Math.min(currentPage * itemsPerPage, filteredOrders.length)} trên {filteredOrders.length} đơn hàng
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {/* Nút lùi */}
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-[#00873A] hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-500"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Danh sách số trang */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                    currentPage === page 
                    ? 'bg-[#00873A] text-white shadow-md shadow-[#00873A]/20' 
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Nút tiến */}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-[#00873A] hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-500"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL XEM & SỬA CHI TIẾT (GIỮ NGUYÊN) --- */}
      <AnimatePresence>
        {viewingOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-gray-100"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Chi tiết đơn hàng</h3>
                  <p className="text-sm font-bold text-[#00873A] mt-1">#{viewingOrder.id}</p>
                </div>
                <button 
                  onClick={() => setViewingOrder(null)} 
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-gray-50 rounded-3xl p-6 space-y-5 border border-gray-100 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm font-medium">Khách hàng</span>
                  <span className="font-bold text-sm text-gray-900">{viewingOrder.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || viewingOrder.nguoi_dung?.email || `User #${viewingOrder.ma_nguoi_dung}`}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm font-medium">Ngày đặt</span>
                  <span className="font-bold text-sm text-gray-900">{formatDate(viewingOrder.ngay_tao)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm font-medium">Thanh toán</span>
                  <span className="font-bold text-sm text-gray-900 uppercase">{viewingOrder.phuong_thuc_thanh_toan}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-500 text-sm font-medium">Tổng tiền</span>
                  <span className="font-black text-xl text-[#00873A]">{formatCurrency(viewingOrder.tong_tien)}</span>
                </div>
              </div>
              
              <div className="mb-8">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Cập nhật trạng thái</label>
                <div className="flex gap-3">
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 bg-gray-50 p-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-[#00873A] font-bold text-sm text-gray-900 border border-gray-200 transition-all cursor-pointer appearance-none"
                  >
                    <option value="CHO_XAC_NHAN">Chờ xác nhận</option>
                    <option value="DANG_GIAO_HANG">Đang giao hàng</option>
                    <option value="DA_GIAO">Đã giao</option>
                    <option value="YEU_CAU_DOI_TRA">Yêu cầu đổi/trả</option>
                    <option value="DA_HUY">Đã hủy</option>
                  </select>

                  <button 
                    onClick={handleUpdateStatus}
                    disabled={updatingStatus || newStatus === viewingOrder.trang_thai}
                    className="bg-[#00873A] text-white px-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingStatus ? "Lưu..." : <><Save size={18}/> Lưu</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterButton({ label, active = false, onClick }: { label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all active:scale-95 bg-white ${
        active 
          ? 'text-[#00873A] border-2 border-[#00873A] shadow-sm' 
          : 'text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}