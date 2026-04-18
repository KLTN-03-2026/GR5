'use client'

import { 
  DollarSign, 
  CreditCard, 
  Wallet, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  RefreshCcw,
  Eye,
  ArrowRightLeft,
  Calendar,
  Truck,
  X,
  User,
  Package,
  Receipt,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MAPPING STATUS ---
const PAYMENT_STATUS: Record<string, { label: string, color: string, icon: any }> = {
  'DA_THANH_TOAN': { label: 'Đã thanh toán', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  'CHO_THANH_TOAN': { label: 'Chờ thanh toán', color: 'bg-orange-100 text-orange-700', icon: Clock },
  'DA_HOAN_TIEN': { label: 'Đã hoàn tiền', color: 'bg-purple-100 text-purple-700', icon: RefreshCcw },
  'THAT_BAI': { label: 'Thất bại', color: 'bg-rose-100 text-rose-700', icon: ArrowRightLeft },
};

const formatCurrency = (amount: any) => {
  const num = parseFloat(amount?.toString() || "0");
  return num.toLocaleString('vi-VN') + 'đ';
};

const formatDate = (dateString: string) => {
  if (!dateString) return '...';
  return new Date(dateString).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function PaymentsManagementContent() {
  // --- STATES DỮ LIỆU ---
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // --- STATES PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  // --- STATE MODAL CHI TIẾT ---
  const [viewingPayment, setViewingPayment] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- FETCH DỮ LIỆU ---
  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu thanh toán:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // --- LOGIC LỌC & TÌM KIẾM ---
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchSearch = p.id.toString().includes(searchTerm) || 
                          p.ma_don_hang?.toString().includes(searchTerm) ||
                          p.nguoi_dung?.ho_so_nguoi_dung?.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.nguoi_dung?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || p.trang_thai_thanh_toan === statusFilter;
      const matchMethod = methodFilter === 'ALL' || p.phuong_thuc_thanh_toan === methodFilter;
      return matchSearch && matchStatus && matchMethod;
    });
  }, [payments, searchTerm, statusFilter, methodFilter]);

  // Khi thay đổi bộ lọc hoặc tìm kiếm thì tự động quay về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, methodFilter]);

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPayments, currentPage]);

  // --- THỐNG KÊ DÒNG TIỀN ---
  const stats = useMemo(() => {
    let total = 0;
    let collected = 0;
    let pending = 0;

    payments.forEach(p => {
      const amount = Number(p.tong_tien || 0);
      total += amount;
      if (p.trang_thai_thanh_toan === 'DA_THANH_TOAN') {
        collected += amount;
      } else if (p.trang_thai_thanh_toan === 'CHO_THANH_TOAN') {
        pending += amount;
      }
    });

    return { total, collected, pending };
  }, [payments]);

  // --- HÀM XÁC NHẬN THANH TOÁN (THỦ CÔNG) ---
  const handleConfirmPayment = async (paymentId: number) => {
    if(!confirm('Bạn xác nhận khách đã thanh toán cho giao dịch này? (Thường dùng cho Chuyển khoản)')) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/payments/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: paymentId, status: 'DA_THANH_TOAN' })
      });

      if(res.ok) {
        alert('Cập nhật trạng thái thành công!');
        fetchPayments();
        setViewingPayment(null);
      } else {
        alert('Có lỗi xảy ra khi cập nhật!');
      }
    } catch (error) {
      alert('Lỗi kết nối server!');
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="w-full flex flex-col gap-8 bg-[#F4FCF0] p-4 md:p-6 min-h-screen">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight flex items-center gap-3">
          <Wallet className="text-[#00873A]" size={36} />
          Quản lý Thanh toán
        </h1>
        <p className="text-gray-500 mt-2 font-medium">Kiểm soát dòng tiền, đối soát công nợ và các giao dịch từ khách hàng.</p>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 group-hover:scale-110 transition-transform">
            <DollarSign size={28} strokeWidth={2.5} />
          </div>
          <div className="z-10">
            <p className="text-sm font-black uppercase tracking-widest text-gray-400 mb-1">Tổng Giao Dịch</p>
            <h3 className="text-2xl font-black text-gray-900">{formatCurrency(stats.total)}</h3>
          </div>
        </div>

        <div className="bg-emerald-600 rounded-[2rem] p-6 shadow-lg shadow-emerald-900/20 flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center flex-shrink-0 z-10 group-hover:scale-110 transition-transform backdrop-blur-sm">
            <CheckCircle2 size={28} strokeWidth={2.5} />
          </div>
          <div className="z-10">
            <p className="text-sm font-black uppercase tracking-widest text-emerald-200 mb-1">Đã Thu (Thực tế)</p>
            <h3 className="text-2xl font-black text-white">{formatCurrency(stats.collected)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 group-hover:scale-110 transition-transform">
            <Clock size={28} strokeWidth={2.5} />
          </div>
          <div className="z-10">
            <p className="text-sm font-black uppercase tracking-widest text-gray-400 mb-1">Chờ Thu (COD/CK)</p>
            <h3 className="text-2xl font-black text-gray-900">{formatCurrency(stats.pending)}</h3>
          </div>
        </div>
      </div>

      {/* BỘ LỌC & TÌM KIẾM */}
      <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm mã đơn, tên khách, email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-sm font-medium rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-[#00873A] focus:ring-2 focus:ring-[#00873A]/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent py-2 outline-none text-sm font-bold text-gray-700 cursor-pointer appearance-none pr-4"
            >
              <option value="ALL">Mọi trạng thái</option>
              <option value="DA_THANH_TOAN">Đã thanh toán</option>
              <option value="CHO_THANH_TOAN">Chờ thanh toán</option>
              <option value="DA_HOAN_TIEN">Đã hoàn tiền</option>
              <option value="THAT_BAI">Thất bại</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1">
            <CreditCard size={16} className="text-gray-400" />
            <select 
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-transparent py-2 outline-none text-sm font-bold text-gray-700 cursor-pointer appearance-none pr-4"
            >
              <option value="ALL">Mọi phương thức</option>
              <option value="COD">Thanh toán khi nhận (COD)</option>
              <option value="CHUYEN_KHOAN">Chuyển khoản NH</option>
              <option value="VNPAY">Cổng VNPay</option>
            </select>
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Mã GD</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Đơn hàng</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Phương thức</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Số tiền</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Trạng thái</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#00873A] border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400 font-medium">
                    Không tìm thấy giao dịch nào.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p) => {
                  const StatusIcon = PAYMENT_STATUS[p.trang_thai_thanh_toan]?.icon || Clock;
                  return (
                    <tr key={p.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5">
                        <span className="font-black text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg text-sm">TXN-{p.id}</span>
                        <p className="text-[10px] text-gray-400 font-bold mt-1.5">{formatDate(p.ngay_tao)}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 mb-1">
                          <Package size={14} className="text-emerald-600" />
                          <span className="font-black text-sm text-emerald-700">#{p.ma_don_hang}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-600">{p.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || p.nguoi_dung?.email || 'Khách vãng lai'}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.phuong_thuc_thanh_toan === 'COD' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            {p.phuong_thuc_thanh_toan === 'COD' ? <Truck size={16} /> : <CreditCard size={16} />}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-gray-700">{p.phuong_thuc_thanh_toan}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-black text-lg text-right text-[#00873A]">
                        {formatCurrency(p.tong_tien)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap ${PAYMENT_STATUS[p.trang_thai_thanh_toan]?.color || 'bg-gray-100 text-gray-500'}`}>
                            <StatusIcon size={14} strokeWidth={3} />
                            {PAYMENT_STATUS[p.trang_thai_thanh_toan]?.label || p.trang_thai_thanh_toan}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button 
                          onClick={() => setViewingPayment(p)}
                          className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 hover:bg-[#00873A] hover:text-white hover:shadow-md hover:shadow-emerald-600/20 transition-all inline-flex items-center justify-center active:scale-90"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* --- PHÂN TRANG UI --- */}
        <div className="px-6 py-5 flex items-center justify-between bg-gray-50/50 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-400">
            Hiển thị {filteredPayments.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} 
            {' '} - {' '}
            {Math.min(currentPage * itemsPerPage, filteredPayments.length)} trên {filteredPayments.length} giao dịch
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-[#00873A] hover:text-white hover:border-[#00873A] transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-500 disabled:hover:border-gray-200"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                // Rút gọn trang nếu quá nhiều (tùy chọn)
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button 
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                        currentPage === page 
                        ? 'bg-[#00873A] text-white shadow-md shadow-[#00873A]/20' 
                        : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="text-gray-400">...</span>;
                }
                return null;
              })}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-[#00873A] hover:text-white hover:border-[#00873A] transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-500 disabled:hover:border-gray-200"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ===================================================================== */}
      {/* MODAL CHI TIẾT THANH TOÁN */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {viewingPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header Modal */}
              <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Receipt size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Chi tiết Giao dịch</h3>
                    <p className="text-sm font-bold text-gray-500 mt-0.5">TXN-{viewingPayment.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingPayment(null)} 
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                
                {/* Trạng thái & Số tiền */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-6 bg-emerald-50/50 rounded-[1.5rem] border border-emerald-100">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Số tiền thanh toán</p>
                    <p className="text-4xl font-black text-[#00873A]">{formatCurrency(viewingPayment.tong_tien)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Trạng thái</p>
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 w-max ${PAYMENT_STATUS[viewingPayment.trang_thai_thanh_toan]?.color || 'bg-gray-100 text-gray-500'}`}>
                      {PAYMENT_STATUS[viewingPayment.trang_thai_thanh_toan]?.label || viewingPayment.trang_thai_thanh_toan}
                    </span>
                  </div>
                </div>

                {/* Lưới thông tin chi tiết */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cột 1: Giao dịch */}
                  <div className="space-y-4">
                    <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CreditCard size={16} className="text-gray-400" />
                      Thông tin giao dịch
                    </h4>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Phương thức</span>
                      <span className="text-sm font-bold text-gray-900">{viewingPayment.phuong_thuc_goc || viewingPayment.phuong_thuc_thanh_toan}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Mã đối soát</span>
                      <span className="text-sm font-bold text-gray-900">{viewingPayment.ma_giao_dich_ben_ngoai || 'Không có'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Thời gian tạo</span>
                      <span className="text-sm font-bold text-gray-900">{formatDate(viewingPayment.ngay_tao)}</span>
                    </div>
                  </div>

                  {/* Cột 2: Đơn hàng & Khách */}
                  <div className="space-y-4">
                    <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      Thông tin liên kết
                    </h4>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Đơn hàng</span>
                      <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">#{viewingPayment.ma_don_hang}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Khách hàng</span>
                      <span className="text-sm font-bold text-gray-900">{viewingPayment.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || 'Khách vãng lai'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Email</span>
                      <span className="text-sm font-bold text-gray-900">{viewingPayment.nguoi_dung?.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Khung hành động thủ công */}
                {viewingPayment.trang_thai_thanh_toan === 'CHO_THANH_TOAN' && viewingPayment.phuong_thuc_thanh_toan === 'CHUYEN_KHOAN' && (
                  <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 mt-4">
                    <p className="text-sm text-orange-800 font-medium mb-3">
                      Giao dịch này đang chờ khách chuyển khoản. Sau khi nhận được tiền vào tài khoản ngân hàng, bạn có thể xác nhận thủ công tại đây.
                    </p>
                    <button 
                      onClick={() => handleConfirmPayment(viewingPayment.id)}
                      disabled={isUpdating}
                      className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-orange-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      {isUpdating ? 'Đang xử lý...' : 'Xác nhận Đã Nhận Tiền'}
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}