'use client'

import { 
  LayoutDashboard, 
  ChevronRight, 
  Calendar, 
  PlusCircle, 
  Eye, 
  ChevronLeft,
  TrendingUp,
  Truck,
  RotateCcw,
  CheckCircle2,
  X 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

// Dữ liệu mẫu (Đã đổi định dạng ngày sang YYYY-MM-DD để dùng được với thẻ input type="date")
const initialOrders = [
  { id: '#DH1042', customer: 'Lê Thu Hà', date: '2023-10-12', amount: 1250000, status: 'Đã giao', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQlDlrv7Et6ftFbX5MWgZoISFKKjjEwkmDCURky7IOn4zrExmRxivAfgp7Q30b1JUtmy-Hhhim5Z_WqOYfwwA5TRYXjR82A9P2zHDUFh2aWLbX2qQGwJxwITQDgmjW6eHYzGUZe4U7U-lGtUR0zem0jh6oA8OAo1jdav3UYohosuNjrBmjw1kv8fbkhKanD-kR8h_-a5FX62xmCvcGp9Fw99ZIecPFA3ycqNvUV5QM6r-TgLb7dirPpvQ3mEslGb2Kcux9B2HwARA' },
  { id: '#DH1043', customer: 'Trần Minh Quân', date: '2023-10-13', amount: 840000, status: 'Đang xử lý', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZri7qaeYLRmWrJdgT9FZ-qbKUpcyHyeUfKNYXGvXjAJWN90dO4tKFHxCPjtxO3nRZQOTiUp5pkCwW05myqkfXEXWAkU8DfeR322vnM3Sfhfz_8Bhbc3RejG1Mrq0CfHqBNcaGlDoY0UP7HxV-Waf7xW8EVNWJcYRi7IVquFlUqmqTaMuCL2EZwiWY1Bwx9oSOBTZcqaBRPVWQ5_F7iSRRhWxGb3LIO9cpjtECZ8bh3fFkbdYJo-cfCIwophubvFvGM_8hxoPADOk' },
  { id: '#DH1044', customer: 'Nguyễn Mai Anh', date: '2023-10-13', amount: 2100000, status: 'Chờ giao hàng', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc13IaWNLLrtxSIft99ra8bVjUmC03b6gknrPVJ_rdt0WbtLouQDEOAQ_f14bF_ApadHoHgoYnR3wN6gzzflVint9BnAMsAYe-1UL8conlClZYSQxvwQNVdXkkVSy5u7xhjlCTZlrx54EAWlOqNPJIe4bZykbfswdJ6ILRYhfm6LNOT_Q0mePqt0U8XJ8WzxnikP5GPbcI2NdGn08qVC8bNulxu5L86dQgpTIypmd2XGUMzF6rwUxX1QnitOF0mCPSnS6t2ot0M1c' },
  { id: '#DH1045', customer: 'Phạm Hữu Nghĩa', date: '2023-10-14', amount: 450000, status: 'Đã hủy', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCyRYwFdXnlncBXMgxr8BpnyR4UeEImBrNjVvtcydYiTpng9iLlZtJb8A41As5DvVeo4244KvZK4OiIVVqAlFVqLxzMcFPOBiqgi9vRFJjEWFTuCwtThcf1V2K2x7Z_iaQO0KPX-Fq5CFWRkrk5_BeUwe92tvdchxTW8Ib7A2RhQ3TNWYAV08MMAZ5sVCHBTN0agT_EBSigX-cJcNSNgx8qrKG3wJUE6Co9M1nTQumqNvntqH4H_lpu-DdT6rFUxBNWr6lRGU177A' },
  { id: '#DH1046', customer: 'Đỗ Văn Thành', date: '2023-10-14', amount: 3560000, status: 'Đã giao', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDl1SjFXPiCFGWXsedLdzXFynM_6koCLk-vP9mhwp2uLeLeXLzoca2InwNxRt3GTVgfi7uUYE73jFVYjdD0Ht3B3hBTw2u7EniwzdYvYCmdvgOQINFo49aMOf6WVEXfqptZFZTqh2Cix3aqV5CdzOSuSWP1Mm5U8TWsDpCYMfqWUQfjHX2-IaBUYf-wmOskUGQovO4-CrqtQKAKUmPaL9V3coGPiidVrFl90hcGWZZseHAS4SqAHKKLbyfsS0asTyTPzGtBJCtPjXU' },
];

const statusStyles: Record<string, string> = {
  'Đã giao': 'bg-primary-fixed text-on-primary-fixed-variant',
  'Đang xử lý': 'bg-secondary-fixed text-on-secondary-fixed-variant',
  'Chờ giao hàng': 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  'Đã hủy': 'bg-error-container text-on-error-container',
};

// Hàm format tiền tệ VNĐ
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('vi-VN') + 'đ';
};

// Hàm format ngày từ YYYY-MM-DD sang DD/MM/YYYY để hiển thị cho đẹp
const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export default function OrdersManagementContent() {
  // 1. STATE QUẢN LÝ DỮ LIỆU VÀ UI
  const [orders, setOrders] = useState(initialOrders);
  const [selectedDate, setSelectedDate] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);

  // 2. LOGIC LỌC ĐƠN HÀNG
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchStatus = activeFilter === 'Tất cả' || order.status === activeFilter;
      const matchDate = selectedDate === '' || order.date === selectedDate;
      return matchStatus && matchDate;
    });
  }, [orders, activeFilter, selectedDate]);

  // 3. XỬ LÝ THÊM ĐƠN HÀNG MỚI
  const handleAddOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newOrder = {
      id: `#DH${Math.floor(Math.random() * 9000) + 1000}`,
      customer: formData.get('customer') as string,
      date: formData.get('date') as string,
      amount: Number(formData.get('amount')),
      status: formData.get('status') as string,
      avatar: `http://googleusercontent.com/profile/picture/${Math.floor(Math.random() * 5)}`
    };

    setOrders([newOrder, ...orders]);
    setIsAddModalOpen(false);
  };

  return (
    // Đã thêm padding p-6 để content không dính sát viền khi nhúng vào layout admin
    <div className="w-full flex flex-col gap-8 bg-[#F4FCF0] p-6 min-h-screen">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-on-surface font-headline leading-tight">Quản lý đơn hàng</h1>
          <p className="text-on-surface-variant font-body mt-1">Theo dõi và quản lý các giao dịch nông sản từ khách hàng.</p>
        </div>
        
        <div className="flex gap-2 h-12">
          {/* Nút lọc theo ngày (Dùng thẻ input type="date" ảo diệu) */}
          <div className="relative h-full flex items-center bg-surface-container-lowest editorial-shadow rounded-xl border border-surface-container-high transition-all hover:bg-surface-container-low focus-within:ring-2 focus-within:ring-primary overflow-hidden">
            <Calendar className="absolute left-4 text-outline pointer-events-none" size={18} />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-12 pr-4 py-3 h-full bg-transparent font-bold text-sm text-on-surface outline-none cursor-pointer w-[160px] relative z-10"
            />
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate('')} 
                className="absolute right-2 z-20 p-1 bg-surface-container rounded text-error hover:bg-error-container transition-colors"
                title="Xóa bộ lọc ngày"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#006B2C] text-white editorial-shadow px-6 h-full rounded-xl flex items-center gap-2 font-bold text-sm hover:opacity-90 transition-all active:scale-95"
          >
            <PlusCircle size={18} />
            <span>Tạo đơn mới</span>
          </button>
        </div>
      </div>

      {/* --- FILTERS TRẠNG THÁI --- */}
      <div className="flex flex-wrap items-center gap-3 ">
        {['Tất cả', 'Đang xử lý', 'Chờ giao hàng', 'Đã giao', 'Đã hủy'].map(status => (
          <FilterButton 
            key={status}
            label={status} 
            active={activeFilter === status} 
            onClick={() => setActiveFilter(status)}
          />
        ))}
      </div>

      {/* --- TABLE DỮ LIỆU --- */}
      <div className="bg-surface-container-lowest rounded-[2rem] editorial-shadow overflow-hidden border border-surface-container-high bg-[#FFFFFF]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-outline font-label">Mã đơn hàng</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-outline font-label">Khách hàng</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-outline font-label">Ngày đặt</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-outline font-label text-right">Tổng tiền</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-outline font-label text-center">Trạng thái</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-outline font-label text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-outline font-medium">
                    Không tìm thấy đơn hàng nào khớp với điều kiện lọc.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-8 py-5 font-headline font-bold text-on-surface">{order.id}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-container flex-shrink-0 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                          <img 
                            className="w-full h-full object-cover" 
                            src={order.avatar} 
                            alt={order.customer}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="font-body font-semibold text-sm whitespace-nowrap">{order.customer}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-body text-sm text-outline">{formatDate(order.date)}</td>
                    <td className="px-8 py-5 font-headline font-black text-sm text-right text-primary">{formatCurrency(order.amount)}</td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusStyles[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => setViewingOrder(order)}
                        className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant hover:bg-primary hover:text-[#00873A] transition-all inline-flex items-center justify-center active:scale-90"
                        title="Xem chi tiết"
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

        {/* --- PAGINATION --- */}
        <div className="px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-container-low/30 border-t border-surface-container-high ">
          <p className="text-xs font-label font-medium text-outline">
            Hiển thị {filteredOrders.length > 0 ? '1' : '0'} - {Math.min(5, filteredOrders.length)} trên {filteredOrders.length} đơn hàng
          </p>
          <div className="flex items-center gap-2 ">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-surface-container-high disabled:hover:text-on-surface-variant bg-[#E3EADF] " disabled>
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1 bg-[#00873A]">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white font-bold text-xs shadow-md shadow-primary/20">1</button>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-surface-container-high disabled:hover:text-on-surface-variant bg-[#E3EADF] " disabled>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* --- THỐNG KÊ (STATS CARDS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-primary-container p-8 rounded-[2rem] text-on-primary-container relative overflow-hidden flex flex-col justify-between h-48 editorial-shadow bg-[#00873A]"
        >
          <div className="z-10 ">
            <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Doanh thu hôm nay</p>
            <h3 className="text-3xl font-black font-headline">8.240.000đ</h3>
          </div>
          <div className="z-10 flex items-center gap-2 text-xs font-bold bg-white/20 backdrop-blur-sm w-fit px-3 py-1.5 rounded-full">
            <TrendingUp size={14} />
            <span>+12% so với hôm qua</span>
          </div>
          <LayoutDashboard className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12" size={160} />
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-surface-container-lowest p-8 rounded-[2rem] border border-surface-container-high relative overflow-hidden flex flex-col justify-between h-48 editorial-shadow bg-[#Ffffff]"
        >
          <div className="z-10">
            <p className="text-xs font-black uppercase tracking-widest text-outline mb-1">Đơn đang chờ</p>
            <h3 className="text-3xl font-black font-headline text-on-surface">14 đơn</h3>
          </div>
          <div className="z-10 flex items-center gap-2 text-xs font-bold text-on-tertiary-fixed-variant bg-tertiary-fixed w-fit px-3 py-1.5 rounded-full">
            <RotateCcw size={14} />
            <span>Ưu tiên xử lý ngay</span>
          </div>
          <Truck className="absolute -right-4 -bottom-4 text-9xl text-surface-container-high opacity-40 rotate-12" size={160} />
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-surface-container-lowest p-8 rounded-[2rem] border border-surface-container-high relative overflow-hidden flex flex-col justify-between h-48 editorial-shadow bg-[#FFFFFF]"
        >
          <div className="z-10">
            <p className="text-xs font-black uppercase tracking-widest text-outline mb-1">Tỷ lệ hủy</p>
            <h3 className="text-3xl font-black font-headline text-on-surface">0.8%</h3>
          </div>
          <div className="z-10 flex items-center gap-2 text-xs font-bold text-primary bg-primary-fixed text-on-primary-fixed-variant w-fit px-3 py-1.5 rounded-full">
            <CheckCircle2 size={14} />
            <span>Thấp hơn mục tiêu 2%</span>
          </div>
          <RotateCcw className="absolute -right-4 -bottom-4 text-9xl text-surface-container-high opacity-40 rotate-12" size={160} />
        </motion.div>
      </div>

      {/* ========================================================= */}
      {/* ======================= MODALS ========================== */}
      {/* ========================================================= */}

      {/* MODAL THÊM ĐƠN HÀNG */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-surface-container-lowest w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-surface-container-high"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black font-headline text-on-surface">Thêm đơn hàng</h3>
                <p className="text-sm font-medium text-outline mt-1">Nhập thông tin giao dịch mới</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddOrder} className="space-y-5">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-outline mb-2 block font-label">Tên khách hàng</label>
                <input required name="customer" type="text" className="w-full bg-surface-container p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-medium text-on-surface border border-transparent focus:border-primary/20 transition-all" placeholder="Ví dụ: Nguyễn Văn A" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-outline mb-2 block font-label">Ngày đặt</label>
                  <input required name="date" type="date" className="w-full bg-surface-container p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-medium text-on-surface border border-transparent focus:border-primary/20 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-outline mb-2 block font-label">Số tiền (VNĐ)</label>
                  <input required name="amount" type="number" min="0" className="w-full bg-surface-container p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-medium text-on-surface border border-transparent focus:border-primary/20 transition-all" placeholder="100000" />
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-outline mb-2 block font-label">Trạng thái</label>
                <select name="status" className="w-full bg-surface-container p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-medium text-on-surface border border-transparent focus:border-primary/20 transition-all appearance-none cursor-pointer">
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Chờ giao hàng">Chờ giao hàng</option>
                  <option value="Đã giao">Đã giao</option>
                </select>
              </div>
              
              <div className="pt-4">
                <button type="submit" className="w-full bg-[#006B2C] text-white py-4 rounded-2xl font-black text-lg editorial-shadow hover:bg-opacity-90 transition-all active:scale-[0.98]">
                  Xác nhận thêm
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT */}
      {viewingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-lowest w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-surface-container-high"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black font-headline text-on-surface">Chi tiết đơn</h3>
                <p className="text-sm font-bold text-primary mt-1">{viewingOrder.id}</p>
              </div>
              <button 
                onClick={() => setViewingOrder(null)} 
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-surface-container-low rounded-3xl p-6 space-y-5 border border-surface-container-high">
              <div className="flex items-center gap-4 mb-2">
                 <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container ring-4 ring-white editorial-shadow">
                    <img src={viewingOrder.avatar} alt="Avatar" className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <span className="font-black text-lg text-on-surface block leading-tight">{viewingOrder.customer}</span>
                    <span className="text-xs font-medium text-outline">Khách hàng thành viên</span>
                 </div>
              </div>
              
              <div className="h-px w-full bg-outline/10 my-4"></div>

              <div className="flex justify-between items-center">
                <span className="text-outline text-sm font-medium">Ngày đặt</span>
                <span className="font-bold text-sm text-on-surface">{formatDate(viewingOrder.date)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-outline text-sm font-medium">Tổng tiền</span>
                <span className="font-black text-lg text-primary">{formatCurrency(viewingOrder.amount)}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-outline text-sm font-medium">Trạng thái</span>
                <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-tighter ${statusStyles[viewingOrder.status]}`}>
                  {viewingOrder.status}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setViewingOrder(null)} 
              className="w-full bg-surface-container-high text-on-surface py-4 rounded-2xl font-bold mt-8 hover:bg-surface-container-low transition-all active:scale-[0.98]"
            >
              Đóng cửa sổ
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Sub-component cho Nút Lọc Trạng Thái (Đã làm nền trắng cho tất cả các ô)
function FilterButton({ label, active = false, onClick }: { label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full font-bold text-xs font-label transition-all active:scale-95 bg-white ${
        active 
          ? 'text-primary border-2 border-primary shadow-sm' 
          : 'text-outline border border-surface-container-high hover:bg-surface-container-low hover:text-on-surface'
      }`}
    >
      {label}
    </button>
  );
}