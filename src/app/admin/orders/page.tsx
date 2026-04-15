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
  Save,
  RefreshCcw,
  Package,
  User,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';

// --- MAPPING STATUS ---
const STATUS_MAP: Record<string, string> = {
  'Tất cả': 'Tất cả',
  'CHO_XAC_NHAN': 'Chờ xác nhận',
  'DANG_GIAO_HANG': 'Đang giao',
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
  return d.toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function OrdersManagementContent() {
  // --- STATES DỮ LIỆU ---
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  
  // --- STATES PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  // --- STATES MODAL CHUNG ---
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // --- STATES CHO VẬN CHUYỂN & SỬA NGÀY ---
  const [shippingConfig, setShippingConfig] = useState({ inner: 15000, outer: 30000 });
  const [isPushing, setIsPushing] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editingDateValue, setEditingDateValue] = useState("");

  // =====================================================================
  // 🚀 STATES & HÀM XỬ LÝ YÊU CẦU ĐỔI TRẢ (ĐÃ ĐẶT ĐÚNG VỊ TRÍ TRONG HOOK)
  // =====================================================================
  const [isHandlingReturn, setIsHandlingReturn] = useState(false);

  const handleReturnAction = async (orderId: number, returnStatus: 'DA_DUYET' | 'TU_CHOI') => {
    const actionText = returnStatus === 'DA_DUYET' ? 'CHẤP NHẬN' : 'TỪ CHỐI';
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} yêu cầu đổi/trả của đơn hàng #${orderId}?`)) return;

    setIsHandlingReturn(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'HANDLE_RETURN',
          orderId: orderId,
          returnStatus: returnStatus
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`Đã ${actionText} yêu cầu thành công!`);
        fetchOrders(); 
        setViewingOrder(null); 
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối khi xử lý yêu cầu!");
    } finally {
      setIsHandlingReturn(false);
    }
  };
  // =====================================================================

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

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, selectedDate]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  // --- HÀM CẬP NHẬT TRẠNG THÁI BÌNH THƯỜNG ---
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

  // --- HÀM GỬI BƯU TÁ ---
  const handleSendToCourier = async (orderId: number) => {
    if (!confirm("Xác nhận gửi đơn này cho bên vận chuyển (GHTK)?")) return;
    
    setIsPushing(true);
    try {
      const partnerId = 1; 
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, partnerId })
      });
      
      const result = await res.json();
      if (result.success) {
        alert("Đã gửi đơn cho bưu tá! Mã vận đơn: " + result.data.ma_van_don);
        fetchOrders(); 
        setViewingOrder(null); 
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (error) {
      alert("Lỗi kết nối API vận chuyển");
    } finally {
      setIsPushing(false);
    }
  };

  // --- HÀM SỬA NGÀY DỰ KIẾN ---
  const handleUpdateDate = async () => {
    if (!editingDateValue) {
      alert("Vui lòng chọn ngày dự kiến mới trước khi lưu!");
      return;
    }

    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentId: viewingOrder.don_van_chuyen[0].id,
          newDate: editingDateValue
        })
      });
      const result = await res.json();
      if (result.success) {
        alert("Đã dời ngày giao dự kiến thành công!");
        fetchOrders(); 
        setIsEditingDate(false); 
        setViewingOrder(null); 
      } else {
        alert("Lỗi từ server: " + result.message);
      }
    } catch (error) {
      alert("Lỗi kết nối khi cập nhật ngày!");
    }
  };

  const openDetailModal = (order: any) => {
    setViewingOrder(order);
    setNewStatus(order.trang_thai);
    setIsEditingDate(false);
  };

  return (
    <div className="w-full flex flex-col gap-8 bg-[#F4FCF0] p-4 md:p-6 min-h-screen">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">Quản lý đơn hàng</h1>
          <p className="text-gray-500 mt-1 font-medium">Theo dõi và quản lý các giao dịch từ khách hàng.</p>
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
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
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
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Mã ĐH</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Khách hàng</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Ngày đặt</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Tổng tiền</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Trạng thái</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Thao tác</th>
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
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 font-bold text-gray-900">#{order.id}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
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
                    <td className="px-6 py-5 text-sm text-gray-500 font-medium">{formatDate(order.ngay_tao)}</td>
                    <td className="px-6 py-5 font-black text-sm text-right text-[#00873A]">{formatCurrency(order.tong_tien)}</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter whitespace-nowrap ${statusStyles[order.trang_thai] || 'bg-gray-100 text-gray-500'}`}>
                          {STATUS_MAP[order.trang_thai] || order.trang_thai}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
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
        
        {/* --- PAGINATION UI --- */}
        <div className="px-8 py-6 flex items-center justify-between bg-gray-50/50 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-400">
            Hiển thị {filteredOrders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} 
            {' '} - {' '}
            {Math.min(currentPage * itemsPerPage, filteredOrders.length)} trên {filteredOrders.length}
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-[#00873A] hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-500"
              >
                <ChevronLeft size={18} />
              </button>

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

      {/* ========================================================================================= */}
      {/* MEGA MODAL XEM CHI TIẾT ĐƠN HÀNG */}
      {/* ========================================================================================= */}
      <AnimatePresence>
        {viewingOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 md:p-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#F8FAF9] w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
            >
              {/* HEADER MODAL */}
              <div className="px-8 py-6 border-b border-gray-200 bg-white flex justify-between items-center z-10 relative">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    Chi tiết Đơn hàng 
                    <span className="text-[#00873A] bg-emerald-50 px-3 py-1 rounded-lg text-xl">#{viewingOrder.id}</span>
                  </h3>
                  <p className="text-sm font-medium text-gray-500 mt-1">Đã đặt lúc: {formatDate(viewingOrder.ngay_tao)}</p>
                </div>
                <button 
                  onClick={() => setViewingOrder(null)} 
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* BODY MODAL */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* CỘT TRÁI: YÊU CẦU ĐỔI TRẢ + SẢN PHẨM */}
                  <div className="lg:col-span-2 space-y-8">

                    {/* 🚀 KHU VỰC 1: TỜ TRÌNH YÊU CẦU ĐỔI TRẢ */}
                    {viewingOrder.yeu_cau_doi_tra && viewingOrder.yeu_cau_doi_tra.length > 0 && (
                      <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-rose-200 shadow-[0_8px_30px_rgb(225,29,72,0.06)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
                              <RefreshCcw size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                              <h4 className="text-xl font-black text-gray-900 tracking-tight">Yêu cầu Đổi / Trả hàng</h4>
                              <p className="text-sm font-medium text-gray-500 mt-0.5">
                                Tạo ngày: {formatDate(viewingOrder.yeu_cau_doi_tra[0].ngay_tao)}
                              </p>
                            </div>
                          </div>
                          <span className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
                            viewingOrder.yeu_cau_doi_tra[0].trang_thai === 'CHO_DUYET' ? 'bg-orange-100 text-orange-700' :
                            viewingOrder.yeu_cau_doi_tra[0].trang_thai === 'DA_DUYET' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <span className="relative flex h-2.5 w-2.5">
                              {viewingOrder.yeu_cau_doi_tra[0].trang_thai === 'CHO_DUYET' && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                              )}
                              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                                viewingOrder.yeu_cau_doi_tra[0].trang_thai === 'CHO_DUYET' ? 'bg-orange-500' : 'bg-current'
                              }`}></span>
                            </span>
                            {viewingOrder.yeu_cau_doi_tra[0].trang_thai}
                          </span>
                        </div>

                        <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100 mb-6 relative z-10">
                          <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <AlertCircle size={16} className="text-rose-400" /> Lý do & Mô tả chi tiết
                          </h5>
                          <p className="text-sm font-bold text-gray-800 leading-relaxed bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            {viewingOrder.yeu_cau_doi_tra[0].ly_do_hoan_tra || "Khách hàng không để lại mô tả chi tiết."}
                          </p>

                          {/* Lưới hình ảnh minh chứng */}
                          {viewingOrder.yeu_cau_doi_tra[0].anh_minh_chung && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Hình ảnh minh chứng từ khách</h5>
                              <div className="flex flex-wrap gap-4">
                                {(() => {
                                  try {
                                    const images = JSON.parse(viewingOrder.yeu_cau_doi_tra[0].anh_minh_chung);
                                    if (images.length === 0) return <p className="text-sm text-gray-500 italic">Không có hình ảnh đính kèm</p>;
                                    
                                    return images.map((img: string, i: number) => (
                                      <a 
                                        key={i} 
                                        href={img} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="group relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-rose-400 transition-all block"
                                      >
                                        <img 
                                          src={img} 
                                          alt={`Minh chứng ${i+1}`} 
                                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                          <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                        </div>
                                      </a>
                                    ));
                                  } catch (e) {
                                    return <p className="text-sm text-gray-500 italic">Dữ liệu ảnh bị lỗi.</p>;
                                  }
                                })()}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Nút Action Duyệt / Từ chối Đổi trả */}
                        {viewingOrder.yeu_cau_doi_tra[0].trang_thai === 'CHO_DUYET' && (
                          <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                            <button 
                              onClick={() => handleReturnAction(viewingOrder.id, 'DA_DUYET')}
                              disabled={isHandlingReturn}
                              className="flex-1 bg-rose-600 text-white py-4 px-4 rounded-xl font-black text-sm shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                              <CheckCircle2 size={20} />
                              {isHandlingReturn ? "Đang xử lý..." : "Chấp nhận Đổi / Trả"}
                            </button>
                            <button 
                              onClick={() => handleReturnAction(viewingOrder.id, 'TU_CHOI')}
                              disabled={isHandlingReturn}
                              className="flex-1 bg-white text-gray-700 py-4 px-4 rounded-xl font-bold text-sm border-2 border-gray-200 hover:bg-gray-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                              <X size={20} />
                              {isHandlingReturn ? "Đang xử lý..." : "Từ chối yêu cầu"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* KHU VỰC 2: DANH SÁCH SẢN PHẨM TRONG ĐƠN */}
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-50 text-[#00873A] rounded-xl flex items-center justify-center">
                          <Package size={20} />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 tracking-tight">Sản phẩm đã đặt</h4>
                      </div>
                      
                      <div className="space-y-4">
                        {viewingOrder.chi_tiet_don_hang?.map((item: any, idx: number) => {
                          const name = item.bien_the_san_pham?.san_pham?.ten_san_pham || `Sản phẩm #${item.ma_bien_the}`;
                          const qty = Number(item.so_luong || 0);
                          const price = Number(item.don_gia || 0);
                          
                          return (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                                  <img 
                                    src={item.bien_the_san_pham?.san_pham?.anh_chinh || "https://placehold.co/150"} 
                                    alt="Product" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h5 className="font-bold text-gray-900 text-base">{name}</h5>
                                  <p className="text-sm font-medium text-gray-500 mt-1">Đơn giá: <span className="font-bold text-gray-700">{price.toLocaleString('vi-VN')}đ</span> x {qty}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-[#00873A] text-lg">{(price * qty).toLocaleString('vi-VN')}đ</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Tổng thanh toán</span>
                        <span className="text-3xl font-black text-[#00873A]">{formatCurrency(viewingOrder.tong_tien)}</span>
                      </div>
                    </div>

                  </div>

                  {/* CỘT PHẢI: TRẠNG THÁI + KHÁCH HÀNG + VẬN CHUYỂN */}
                  <div className="space-y-8">
                    
                    {/* KHU VỰC 3: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG */}
                    <div className="bg-[#00873A] rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-emerald-900/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                      <h4 className="text-white font-black text-lg tracking-tight mb-5 relative z-10 flex items-center gap-2">
                        Cập nhật trạng thái
                      </h4>
                      
                      <div className="space-y-4 relative z-10">
                        <select 
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full bg-white/90 backdrop-blur-md px-4 py-3.5 rounded-xl outline-none focus:ring-4 focus:ring-emerald-400/50 font-bold text-sm text-gray-900 border-none transition-all cursor-pointer appearance-none shadow-inner"
                        >
                          <option value="CHO_XAC_NHAN">⏳ Chờ xác nhận</option>
                          <option value="DANG_GIAO_HANG">🚚 Đang giao hàng</option>
                          <option value="DA_GIAO">✅ Đã giao thành công</option>
                          <option value="YEU_CAU_DOI_TRA">🔄 Yêu cầu đổi/trả</option>
                          <option value="DA_HUY">❌ Đã hủy</option>
                        </select>

                        <button 
                          onClick={handleUpdateStatus}
                          disabled={updatingStatus || newStatus === viewingOrder.trang_thai}
                          className="w-full bg-white text-[#00873A] py-3.5 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-[0.98]"
                        >
                          {updatingStatus ? "Đang lưu..." : <><Save size={18}/> Lưu Thay Đổi</>}
                        </button>
                      </div>
                    </div>

                    {/* KHU VỰC 4: THÔNG TIN KHÁCH HÀNG */}
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                          <User size={20} />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 tracking-tight">Khách hàng</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                          <img 
                            src={viewingOrder.nguoi_dung?.ho_so_nguoi_dung?.avatar || "https://placehold.co/100"} 
                            alt="Avatar" 
                            className="w-12 h-12 rounded-full border border-gray-200 object-cover bg-white"
                          />
                          <div>
                            <p className="font-bold text-gray-900">{viewingOrder.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || "Khách hàng"}</p>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">{viewingOrder.nguoi_dung?.email || "Không có email"}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                          <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1">Phương thức thanh toán</p>
                          <p className="font-bold text-gray-900 flex items-center gap-2">
                            <CreditCard size={16} className="text-gray-400" />
                            {viewingOrder.phuong_thuc_thanh_toan?.toUpperCase() || 'COD'}
                          </p>
                        </div>
                        {viewingOrder.ghi_chu && (
                          <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                            <p className="text-xs font-black uppercase text-yellow-600 tracking-widest mb-1">Ghi chú từ khách</p>
                            <p className="font-semibold text-yellow-800 text-sm">{viewingOrder.ghi_chu}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* KHU VỰC 5: GIAO HÀNG VẬN CHUYỂN */}
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                          <Truck size={20} />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 tracking-tight">Vận chuyển</h4>
                      </div>

                      {viewingOrder.don_van_chuyen?.length > 0 ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1">Mã vận đơn (GHTK)</p>
                            <p className="font-bold text-gray-900 text-lg tracking-wide">{viewingOrder.don_van_chuyen[0].ma_van_don}</p>
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Ngày dự kiến giao</p>
                            {isEditingDate ? (
                              <div className="flex flex-col gap-3">
                                <input 
                                  type="date" 
                                  value={editingDateValue}
                                  onChange={(e) => setEditingDateValue(e.target.value)}
                                  className="text-sm p-3 rounded-xl border border-purple-200 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-white font-bold text-gray-700 w-full"
                                />
                                <div className="flex gap-2">
                                  <button onClick={handleUpdateDate} className="flex-1 text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl transition-colors shadow-md">Lưu ngày</button>
                                  <button onClick={() => setIsEditingDate(false)} className="flex-1 text-sm font-bold bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 py-2.5 rounded-xl transition-colors">Hủy</button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-gray-900 text-base">
                                  {new Date(viewingOrder.don_van_chuyen[0].ngay_giao_du_kien).toLocaleDateString('vi-VN')}
                                </p>
                                <button 
                                  onClick={() => setIsEditingDate(true)}
                                  className="text-xs font-black bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                                >
                                  ✏️ Đổi ngày
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                          <p className="text-sm font-medium text-gray-500 mb-4">Đơn hàng chưa được đẩy qua Giao Hàng Tiết Kiệm.</p>
                          {viewingOrder.trang_thai === 'CHO_XAC_NHAN' && (
                            <button 
                              onClick={() => handleSendToCourier(viewingOrder.id)}
                              disabled={isPushing}
                              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-[0.98] shadow-md shadow-blue-600/20"
                            >
                              <Truck size={18} />
                              {isPushing ? "Đang gửi..." : "Gửi GHTK ngay"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
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