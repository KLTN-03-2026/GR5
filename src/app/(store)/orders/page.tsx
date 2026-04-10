'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Clock, Truck, CheckCircle2, XCircle, 
  ShoppingBag, Store, Eye, RefreshCcw, X, FileText, Check, User, ShoppingBasket,
  ArrowLeft, CloudUpload, Send, ShieldCheck
} from 'lucide-react';

const TABS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'CHO_XAC_NHAN', label: 'Chờ xác nhận' },
  { id: 'DANG_GIAO_HANG', label: 'Đang giao' },
  { id: 'DA_GIAO', label: 'Đã giao' },
  { id: 'DA_HUY', label: 'Đã hủy' },
];

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // States cho Modals
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // States cho form Đổi Trả
  const [returnOrder, setReturnOrder] = useState<any>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returnImages, setReturnImages] = useState([
    { id: 1, url: 'https://placehold.co/150x150/png?text=Loi+Hop', alt: 'Damaged box' },
    { id: 2, url: 'https://placehold.co/150x150/png?text=Dap+Nat', alt: 'Bruised apple' }
  ]);

  const removeImage = (id: number) => setReturnImages(returnImages.filter(img => img.id !== id));

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/store/orders?userId=1'); 
        if (res.ok) {
          const data = await res.json();
          const ordersData = Array.isArray(data) ? data : data.orders || [];
          setOrders(ordersData);
        }
      } catch (error) {
        console.error("❌ Lỗi tải đơn hàng:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    activeTab === 'ALL' ? true : order.trang_thai === activeTab
  );

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnReason) {
      alert("Vui lòng chọn lý do đổi/trả!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/store/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: returnOrder.id, 
          action: 'RETURN', 
          reason: `${returnReason} - ${returnDescription}` 
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Đã gửi yêu cầu đổi trả thành công! Cửa hàng sẽ liên hệ bạn sớm.");
        setReturnOrder(null); 
        setReturnReason('');  
        setReturnDescription('');
        window.location.reload(); 
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi kết nối máy chủ, vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatus = (status: string) => {
    const safeStatus = status?.toUpperCase() || ''; 
    switch (safeStatus) {
      case 'CHO_XAC_NHAN': return <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-xs font-bold"><Clock className="w-3.5 h-3.5" /> Chờ xác nhận</span>;
      case 'DANG_GIAO_HANG': return <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold"><Truck className="w-3.5 h-3.5" /> Đang giao hàng</span>;
      case 'DA_GIAO': case 'HOAN_THANH': return <span className="flex items-center gap-1.5 text-[#007832] bg-[#EFF6EA] px-3 py-1 rounded-full text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Thành công</span>;
      case 'DA_HUY': return <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-xs font-bold"><XCircle className="w-3.5 h-3.5" /> Đã hủy</span>;
      case 'YEU_CAU_DOI_TRA': return <span className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-xs font-bold"><RefreshCcw className="w-3.5 h-3.5" /> Chờ đổi trả</span>;
      default: return <span className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold"><Clock className="w-3.5 h-3.5" /> {status}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '...';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="bg-[#F4FCF0] min-h-screen pt-28 pb-20 relative">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        
        {/* Header Danh sách */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#007832]/10 rounded-2xl flex items-center justify-center text-[#007832]">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Đơn hàng của tôi</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Quản lý lịch sử mua sắm và đổi trả</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex overflow-x-auto mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-[#007832] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List Đơn Hàng */}
        <div className="space-y-6">
          {isLoading ? (
             <div className="text-center py-20">
               <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#007832] border-t-transparent mx-auto mb-4"></div>
             </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Không tìm thấy đơn hàng</h3>
              <Link href="/products" className="bg-[#007832] text-white px-8 py-3 rounded-xl font-bold mt-4 inline-block hover:bg-emerald-800 transition-colors">Mua sắm ngay</Link>
            </div>
          ) : (
            <AnimatePresence>
              {filteredOrders.map((order) => (
                <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden mb-6 hover:shadow-md transition-shadow">
                  
                  <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap justify-between gap-4 bg-gray-50/50 items-center">
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-gray-400" />
                      <span className="font-bold text-gray-900 text-lg tracking-tight">#{order.id}</span>
                      <span className="text-sm text-gray-500 font-medium hidden sm:inline-block">| {formatDate(order.ngay_tao)}</span>
                    </div>
                    <div>{renderStatus(order.trang_thai)}</div>
                  </div>

                  <div className="px-6 py-2">
                    {(order.chi_tiet_don_hang || []).slice(0, 2).map((item: any, idx: number) => {
                      const qty = Number(item.so_luong || 0);
                      const price = Number(item.don_gia || 0); 
                      const name = item.bien_the_san_pham?.san_pham?.ten_san_pham || "Sản phẩm";
                      const img = item.bien_the_san_pham?.san_pham?.anh_chinh || "https://placehold.co/150";

                      return (
                        <div key={idx} className="flex gap-4 py-4 border-b border-gray-50 last:border-0 items-center">
                          <img src={img} alt={name} className="w-16 h-16 rounded-xl object-cover border border-gray-100 bg-gray-50" />
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 line-clamp-1">{name}</h4>
                            <p className="text-xs text-gray-500 mt-1 font-medium">Số lượng: {qty}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-[#007832]">{(price * qty).toLocaleString('vi-VN')}đ</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-6 py-5 bg-[#F9FAF8] flex flex-col md:flex-row justify-between gap-4 items-center">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <span className="text-sm font-bold text-gray-500">Tổng thanh toán:</span>
                      <span className="text-2xl font-black text-[#007832]">{parseFloat(order.tong_tien?.toString() || "0").toLocaleString('vi-VN')}đ</span>
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={() => setSelectedOrder(order)} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                        <Eye className="w-4 h-4" /> Chi tiết
                      </button>
                      
                      {/* ĐÂY LÀ ĐIỀU KIỆN ĐỂ HIỂN THỊ NÚT ĐỔI TRẢ */}
                      {order.trang_thai === 'DA_GIAO' && (
                        <button onClick={() => setReturnOrder(order)} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-rose-50 text-rose-600 px-5 py-2.5 rounded-xl font-bold hover:bg-rose-100 transition-colors">
                          <RefreshCcw className="w-4 h-4" /> Hoàn trả
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* MEGA MODAL 1: CHI TIẾT ĐƠN HÀNG */}
      {/* ========================================= */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[#F8FAF9] rounded-[2rem] w-full max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative flex flex-col">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 p-3 bg-gray-200/50 rounded-full hover:bg-gray-200 transition-colors z-10">
                <X className="w-6 h-6 text-gray-700" />
              </button>

              <div className="p-8 md:p-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-gray-200 pb-8">
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Chi tiết Đơn hàng #{selectedOrder.id}</h1>
                    <p className="text-gray-500 mt-2 font-medium">Đã đặt lúc {formatDate(selectedOrder.ngay_tao)}</p>
                  </div>
                  <button className="inline-flex items-center gap-2 bg-[#007832] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-800 transition-all">
                    <FileText size={20} /> Xuất PDF
                  </button>
                </header>

                <div className="bg-white rounded-3xl p-8 mb-10 shadow-sm border border-gray-100 overflow-x-auto">
                  <div className="relative flex items-center justify-between min-w-[600px] max-w-4xl mx-auto px-4">
                    <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1.5 bg-gray-100 rounded-full z-0"></div>
                    <div className={`absolute left-10 top-1/2 -translate-y-1/2 h-1.5 bg-[#007832] rounded-full z-0 transition-all duration-500 ${
                      selectedOrder.trang_thai === 'CHO_XAC_NHAN' ? 'w-[0%]' :
                      selectedOrder.trang_thai === 'DANG_GIAO_HANG' ? 'w-[50%]' :
                      selectedOrder.trang_thai === 'DA_GIAO' ? 'w-[calc(100%-5rem)]' : 'w-[0%]'
                    }`}></div>
                    
                    <Step icon={<Check size={20} />} label="Chờ xác nhận" active={selectedOrder.trang_thai === 'CHO_XAC_NHAN'} completed={['DANG_GIAO_HANG', 'DA_GIAO'].includes(selectedOrder.trang_thai)} />
                    <Step icon={<Truck size={20} />} label="Đang giao" active={selectedOrder.trang_thai === 'DANG_GIAO_HANG'} completed={selectedOrder.trang_thai === 'DA_GIAO'} disabled={selectedOrder.trang_thai === 'CHO_XAC_NHAN'} />
                    <Step icon={<ShoppingBasket size={20} />} label="Đã giao" completed={selectedOrder.trang_thai === 'DA_GIAO'} active={selectedOrder.trang_thai === 'DA_GIAO'} disabled={selectedOrder.trang_thai !== 'DA_GIAO'} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-emerald-50 rounded-xl text-[#007832]"><User size={24} /></div>
                        <h3 className="text-xl font-bold text-gray-900">Thông tin nhận hàng</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                        <InfoField label="Người dùng" value={`Khách hàng #${selectedOrder.ma_nguoi_dung || 'N/A'}`} />
                        <InfoField label="Thanh toán" value={selectedOrder.phuong_thuc_thanh_toan?.toUpperCase() || 'COD'} />
                        <div className="md:col-span-2">
                          <InfoField label="Ghi chú đơn hàng" value={selectedOrder.ghi_chu || "Không có ghi chú nào"} />
                        </div>
                      </div>
                    </section>

                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-emerald-50 rounded-xl text-[#007832]"><ShoppingBasket size={24} /></div>
                        <h3 className="text-xl font-bold text-gray-900">Danh sách sản phẩm</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                              <th className="pb-4 font-bold min-w-[200px]">Sản phẩm</th>
                              <th className="pb-4 font-bold text-center">SL</th>
                              <th className="pb-4 font-bold text-right min-w-[100px]">Đơn giá</th>
                              <th className="pb-4 font-bold text-right min-w-[100px]">Tổng</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {selectedOrder.chi_tiet_don_hang?.map((item: any, idx: number) => {
                              const qty = Number(item.so_luong || 0);
                              const price = Number(item.don_gia || 0);
                              return (
                                <ProductRow 
                                  key={idx}
                                  name={item.bien_the_san_pham?.san_pham?.ten_san_pham || "Sản phẩm"} 
                                  qty={qty.toString()} 
                                  price={`${price.toLocaleString('vi-VN')}đ`} 
                                  total={`${(price * qty).toLocaleString('vi-VN')}đ`} 
                                  image={item.bien_the_san_pham?.san_pham?.anh_chinh || "https://placehold.co/100"}
                                />
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section className="bg-[#007832] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                      <h3 className="text-xl font-bold mb-8 relative z-10">Thanh toán</h3>
                      <div className="space-y-4 relative z-10">
                        <SummaryItem label="Tạm tính" value={`${parseFloat(selectedOrder.tong_tien?.toString() || "0").toLocaleString('vi-VN')}đ`} />
                        <SummaryItem label="Phí giao hàng" value="0đ" />
                        <div className="pt-6 mt-6 border-t border-white/20 flex justify-between items-center">
                          <span className="text-lg font-bold">Tổng cộng</span>
                          <span className="text-3xl font-black tracking-tight">{parseFloat(selectedOrder.tong_tien?.toString() || "0").toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>
                    </section>

                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-8">Lịch sử trạng thái</h3>
                      <div className="relative space-y-8 pl-6 border-l-2 border-gray-100 ml-2">
                        <TimelineEvent title="Tạo đơn hàng" time={formatDate(selectedOrder.ngay_tao)} description="Đơn hàng được tạo thành công trên hệ thống." active={true} />
                        {selectedOrder.trang_thai !== 'CHO_XAC_NHAN' && (
                          <TimelineEvent title="Cập nhật trạng thái" time="Mới nhất" description={`Đơn hàng đã được chuyển sang trạng thái: ${selectedOrder.trang_thai}`} active={true} />
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================= */}
      {/* MEGA MODAL 2: GIAO DIỆN YÊU CẦU ĐỔI TRẢ MỚI */}
      {/* ========================================= */}
      <AnimatePresence>
        {returnOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-[#F8FAF9] rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <div className="p-8 md:p-10">
                {/* Nút Quay Lại / Đóng */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => setReturnOrder(null)}
                  className="mb-8 flex items-center space-x-2 text-gray-500 cursor-pointer hover:text-[#007832] transition-colors w-fit"
                >
                  <ArrowLeft size={16} />
                  <span className="text-sm font-bold uppercase tracking-wider">Quay lại</span>
                </motion.div>

                <div className="grid grid-cols-1 gap-10">
                  <section>
                    <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-black text-[#007832] mb-3 tracking-tight">
                      Yêu cầu Hoàn / Trả hàng
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-500 mb-10 text-lg leading-relaxed">
                      Đơn hàng <strong className="text-gray-800">#{returnOrder.id}</strong>. Vui lòng cung cấp thông tin chi tiết để đội ngũ Freshy hỗ trợ xử lý yêu cầu nhanh nhất.
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                      <form className="space-y-8" onSubmit={handleSubmitReturn}>
                        
                        {/* Select Lý do */}
                        <div className="space-y-3">
                          <label className="block text-[#007832] font-bold text-sm tracking-wide uppercase">Lý do đổi/trả</label>
                          <div className="bg-emerald-50/50 px-4 py-1 rounded-xl border border-emerald-100 hover:border-emerald-300 transition-colors">
                            <select 
                              value={returnReason}
                              onChange={(e) => setReturnReason(e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-0 text-gray-900 py-3 font-medium appearance-none cursor-pointer outline-none"
                            >
                              <option disabled value="">Chọn lý do của bạn...</option>
                              <option value="Sản phẩm hỏng trong quá trình vận chuyển">Sản phẩm hỏng trong quá trình vận chuyển</option>
                              <option value="Giao sai sản phẩm / Thiếu hàng">Giao sai sản phẩm / Thiếu hàng</option>
                              <option value="Chất lượng không đúng mô tả">Chất lượng không đúng mô tả</option>
                              <option value="Lý do khác">Lý do khác</option>
                            </select>
                          </div>
                        </div>

                        {/* Mô tả chi tiết */}
                        <div className="space-y-3">
                          <label className="block text-[#007832] font-bold text-sm tracking-wide uppercase">Mô tả chi tiết</label>
                          <div className="bg-gray-50 px-4 py-4 rounded-xl border border-gray-200 focus-within:border-emerald-400 focus-within:bg-white transition-all">
                            <textarea 
                              value={returnDescription}
                              onChange={(e) => setReturnDescription(e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-0 text-gray-900 outline-none resize-none placeholder-gray-400" 
                              placeholder="Vui lòng mô tả tình trạng thực tế của sản phẩm (nếu có)..." 
                              rows={4}
                            />
                          </div>
                        </div>

                        {/* Upload Hình ảnh */}
                        <div className="space-y-4">
                          <label className="block text-[#007832] font-bold text-sm tracking-wide uppercase">Hình ảnh minh chứng</label>
                          <motion.div whileHover={{ backgroundColor: '#f9fafb' }} className="border-2 border-dashed border-gray-300 rounded-2xl p-10 bg-gray-50 flex flex-col items-center justify-center cursor-pointer group transition-colors">
                            <CloudUpload className="text-gray-400 group-hover:text-[#007832] transition-colors mb-3" size={48} />
                            <p className="text-gray-600 text-center font-medium">Nhấn để tải lên hoặc kéo thả ảnh vào đây</p>
                            <p className="text-xs text-gray-400 mt-2">Hỗ trợ JPG, PNG (Tối đa 5 ảnh, 5MB mỗi ảnh)</p>
                          </motion.div>

                          {/* Previews */}
                          <div className="flex gap-4 mt-6">
                            <AnimatePresence>
                              {returnImages.map((img) => (
                                <motion.div 
                                  key={img.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                  className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group shadow-sm"
                                >
                                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <button type="button" onClick={() => removeImage(img.id)} className="text-white hover:text-rose-400 transition-colors p-2 bg-black/20 rounded-full">
                                      <X size={20} />
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-8 border-t border-gray-100">
                          <motion.button 
                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                            type="submit" disabled={isSubmitting}
                            className={`w-full py-5 text-white font-black text-lg rounded-2xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-3 transition-all ${isSubmitting ? 'bg-emerald-300' : 'bg-[#007832] hover:bg-emerald-800'}`}
                          >
                            {isSubmitting ? "Đang xử lý..." : "Gửi yêu cầu đổi trả"}
                            <Send size={20} />
                          </motion.button>
                          <p className="text-center text-sm text-gray-400 mt-4 font-medium">
                            Bằng việc gửi yêu cầu, bạn đồng ý với Chính sách Đổi/Trả của Freshy.
                          </p>
                        </div>
                      </form>
                    </motion.div>
                  </section>

                  {/* Info Cards từ thiết kế của bạn */}
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InfoCard icon={<Clock size={24} />} title="Thời gian xử lý" desc="Phản hồi trong vòng 24h làm việc kể từ khi nhận yêu cầu." delay={0.3} />
                    <InfoCard icon={<Truck size={24} />} title="Miễn phí thu hồi" desc="Hỗ trợ lấy hàng tận nơi miễn phí nếu lỗi từ Freshy." delay={0.4} />
                    <InfoCard icon={<ShieldCheck size={24} />} title="Bảo mật thông tin" desc="Mọi dữ liệu hình ảnh của bạn được cam kết bảo mật." delay={0.5} />
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// CÁC COMPONENT GIAO DIỆN CON
function Step({ icon, label, active = false, completed = false, disabled = false }: any) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-3">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${completed ? 'bg-[#007832] text-white shadow-md' : active ? 'bg-white border-4 border-[#007832] text-[#007832] shadow-lg scale-110' : 'bg-gray-100 text-gray-400'}`}>
        {icon}
      </div>
      <span className={`text-sm font-bold transition-colors duration-300 ${completed || active ? 'text-[#007832]' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}

function InfoField({ label, value }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
      <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
    </div>
  );
}

function ProductRow({ name, qty, price, total, image }: any) {
  return (
    <tr className="group hover:bg-gray-50/50 transition-colors">
      <td className="py-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
            <img src={image} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <span className="font-bold text-gray-900 text-base">{name}</span>
        </div>
      </td>
      <td className="py-5 text-center font-bold text-gray-900">{qty}</td>
      <td className="py-5 text-right font-medium text-gray-500">{price}</td>
      <td className="py-5 text-right font-black text-[#007832] text-lg">{total}</td>
    </tr>
  );
}

function SummaryItem({ label, value }: any) {
  return (
    <div className={`flex justify-between items-center font-medium`}>
      <span className="text-emerald-50">{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
}

function TimelineEvent({ title, time, description, active = false }: any) {
  return (
    <div className="relative">
      <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-white transition-all duration-300 ${active ? 'bg-[#007832] ring-4 ring-emerald-500/10' : 'bg-gray-200'}`}></div>
      <div className="space-y-1">
        <p className={`font-bold text-base ${active ? 'text-gray-900' : 'text-gray-400'}`}>{title}</p>
        <p className="text-xs text-gray-500 font-medium">{time}</p>
        <p className="mt-3 text-sm text-gray-600 italic leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
          {description}
        </p>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc, delay }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-white border border-gray-100 p-6 rounded-2xl flex flex-col md:flex-row items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 bg-emerald-50 rounded-xl text-[#007832] flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-black text-gray-900 text-base mb-1.5">{title}</h4>
        <p className="text-sm text-gray-500 leading-relaxed font-medium">{desc}</p>
      </div>
    </motion.div>
  );
}