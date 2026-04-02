'use client'

import React, { useState } from 'react';
import { 
  FileText, 
  User, 
  ShoppingBag, 
  Check, 
  Truck, 
  Package,
  MapPin,
  Mail,
  Phone,
  RotateCcw, 
  CloudUpload, 
  X, 
  Send, 
  Clock, 
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data (Dữ liệu giả lập)
const MOCK_ORDER = {
  id: '#DH1042',
  date: '24 tháng 05, 2024 lúc 14:30',
  customer: {
    name: 'Trần Hùng',
    phone: '(+84) 90 123 4567',
    address: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    email: 'hung.tran@gmail.com'
  },
  products: [
    {
      id: '1',
      name: 'Rau muống sạch',
      sku: 'VEG-001',
      quantity: '3kg',
      unitPrice: 25000,
      total: 75000,
      image: 'https://images.unsplash.com/photo-1546793665-c74683c3ef86?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: '2',
      name: 'Cà chua bi',
      sku: 'FRU-042',
      quantity: '2 hộp',
      unitPrice: 45000,
      total: 90000,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=200'
    }
  ],
  summary: {
    subtotal: 165000,
    shipping: 30000,
    discount: 15000,
    total: 180000
  },
  payment: {
    method: 'Chuyển khoản (VNPay)',
    transactionId: '#VN-882194',
    logo: 'https://img.vietqr.io/image/vnpay-logo.png' 
  },
  timeline: [
    { id: '1', title: 'Đã đặt hàng', date: '24/05/2024 • 14:30', desc: 'Đơn hàng được tạo thành công.', status: 'completed' },
    { id: '2', title: 'Đã thanh toán', date: '24/05/2024 • 14:35', desc: 'Xác nhận thanh toán qua VNPay.', status: 'completed' },
    { id: '3', title: 'Đang giao hàng', date: '25/05/2024 • 08:15', desc: 'Đơn vị vận chuyển đã lấy hàng.', status: 'current' },
    { id: '4', title: 'Hoàn tất', date: '--', desc: 'Chưa giao tới.', status: 'pending' }
  ],
  status: 'delivered' // Thêm trạng thái để hiện nút hoàn hàng
};

export default function OrderDetailsPage() {
  const order = MOCK_ORDER;
  // Khai báo State để quản lý đóng/mở Modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface p-4 md:p-8 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8 pt-20"
      >
        {/* Header: ID & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight font-headline">
              Đơn hàng {order.id}
            </h1>
            <p className="text-on-surface-variant italic">Đặt lúc {order.date}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Nút Hoàn hàng sẽ gọi Modal ra */}
            {order.status === 'delivered' && (
              <button 
                onClick={() => setIsReturnModalOpen(true)}
                className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-2xl font-bold shadow-sm hover:bg-red-600 hover:text-white transition-all"
              >
                <RotateCcw size={18} />
                Yêu cầu Đổi/Trả
              </button>
            )}

            <button className="bg-[#007832] text-white flex items-center gap-2 border border-primary/20 px-5 py-2.5 rounded-2xl font-bold shadow-sm hover:bg-emerald-800 transition-all">
              <FileText size={18} />
              Xuất hóa đơn PDF
            </button>
          </div>
        </div>

        {/* Thanh trạng thái (Stepper) */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-emerald-50">
          <div className="relative flex items-center justify-between max-w-4xl mx-auto">
            <div className="absolute left-0 top-5 w-full h-1 bg-emerald-50 z-0" />
            <div className="absolute left-0 top-5 w-[66%] h-1 bg-[#007832] z-0 transition-all duration-1000" />
            
            <StepIcon icon={Check} label="Đã đặt" status="completed"  />
            <StepIcon icon={Check} label="Đã trả tiền" status="completed" />
            <StepIcon icon={Truck} label="Đang giao" status="current" />
            <StepIcon icon={Package} label="Đã nhận" status="pending" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: Thông tin khách & Sản phẩm */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Thông tin khách hàng */}
            <section className="bg-white rounded-4xl p-8 border border-emerald-50 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><User size={20}/></div>
                <h3 className="text-xl font-bold font-headline text-[#007832]">Thông tin khách hàng</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoBox icon={User} label="Họ và tên" value={order.customer.name} />
                <InfoBox icon={Phone} label="Số điện thoại" value={order.customer.phone} />
                <div className="md:col-span-2">
                  <InfoBox icon={MapPin} label="Địa chỉ giao hàng" value={order.customer.address} />
                </div>
              </div>
            </section>

            {/* Danh sách sản phẩm */}
            <section className="bg-white rounded-4xl p-8 border border-emerald-50 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><ShoppingBag size={20}/></div>
                <h3 className="text-xl font-bold font-headline">Sản phẩm đã mua</h3>
              </div>
              <div className="space-y-4">
                {order.products.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50/50 transition-colors">
                    <img src={item.image} className="w-16 h-16 rounded-xl object-cover border border-emerald-100" />
                    <div className="grow">
                      <h4 className="font-bold text-on-surface">{item.name}</h4>
                      <p className="text-xs text-on-surface-variant font-mono">{item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{item.total.toLocaleString()}đ</p>
                      <p className="text-xs text-on-surface-variant">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Cột phải: Tổng kết & Timeline */}
          <div className="space-y-8">
            {/* Tổng kết tiền bạc */}
            <section className="bg-[#007832] rounded-4xl p-8 text-white shadow-xl shadow-primary/20">
              <h3 className="text-lg font-bold mb-6 opacity-80">Tóm tắt thanh toán</h3>
              <div className="space-y-4 border-b border-white/10 pb-6">
                <div className="flex justify-between"><span>Tạm tính</span><span>{order.summary.subtotal.toLocaleString()}đ</span></div>
                <div className="flex justify-between"><span>Phí giao hàng</span><span>{order.summary.shipping.toLocaleString()}đ</span></div>
                <div className="flex justify-between text-emerald-200"><span>Giảm giá</span><span>-{order.summary.discount.toLocaleString()}đ</span></div>
              </div>
              <div className="pt-6 flex justify-between items-center">
                <span className="text-xl font-bold">Tổng cộng</span>
                <span className="text-3xl font-black">{order.summary.total.toLocaleString()}đ</span>
              </div>
            </section>

            {/* Phương thức thanh toán */}
            <section className="bg-[#EFF6EA] rounded-4xl p-6 border border-emerald-50 shadow-sm">
              <p className="text-xs font-bold text-on-surface-variant uppercase mb-4 tracking-widest">Phương thức thanh toán</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center font-black text-[#007832] text-xs">VNPAY</div>
                <div>
                  <p className="font-bold text-sm text-[#007832]">{order.payment.method}</p>
                  <p className="text-[10px] text-[#007832]/70 font-mono">{order.payment.transactionId}</p>
                </div>
              </div>
            </section>

            {/* Lịch sử đơn hàng (Timeline) */}
            <section className="bg-white rounded-4xl p-8 border border-emerald-50 shadow-sm">
              <h3 className="font-bold text-lg mb-6">Lịch sử đơn hàng</h3>
              <div className="space-y-8 border-l-2 border-emerald-50 ml-2 pl-6">
                {order.timeline.map((t) => (
                  <div key={t.id} className="relative">
                    <div className={`absolute -left-8.25 top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${t.status === 'pending' ? 'bg-gray-200' : 'bg-[#007832]'}`} />
                    <p className="font-bold text-sm">{t.title}</p>
                    <p className="text-[10px] text-on-surface-variant">{t.date}</p>
                    <p className="text-xs italic text-on-surface-variant mt-1">{t.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </motion.div>

      {/* Gọi Modal Đổi Trả ở đây */}
      <AnimatePresence>
        {isReturnModalOpen && (
          <ReturnRequestModal 
            onClose={() => setIsReturnModalOpen(false)} 
            orderId={order.id} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// COMPONENT MODAL ĐỔI TRẢ (POPUP)
// ==========================================
function ReturnRequestModal({ onClose, orderId }: { onClose: () => void, orderId: string }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1546793665-c74683c3ef86?w=100' }
  ]);

  const removeImage = (id: number) => setImages(images.filter(img => img.id !== id));

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-4xl shadow-2xl relative"
      >
        {/* Nút Đóng Modal */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="font-headline text-3xl font-extrabold text-[#007832] tracking-tight">Yêu cầu Đổi/Trả</h2>
            <p className="text-gray-500 mt-2">Đơn hàng {orderId}</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Đã gửi yêu cầu!"); onClose(); }}>
            
            {/* Lý do */}
            <div className="space-y-2">
              <label className="block text-[#007832] font-bold text-sm tracking-wide uppercase">Lý do đổi/trả</label>
              <select 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#EFF6EA] border border-emerald-100 p-4 rounded-xl focus:ring-2 focus:ring-[#007832] outline-none text-[#007832]"
              >
                <option disabled value="">Chọn lý do của bạn...</option>
                <option value="damaged">Sản phẩm hỏng trong quá trình vận chuyển</option>
                <option value="wrong">Giao sai sản phẩm / Thiếu hàng</option>
                <option value="quality">Chất lượng không đúng mô tả</option>
                <option value="other">Lý do khác</option>
              </select>
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <label className="block text-[#007832] font-bold text-sm tracking-wide uppercase">Mô tả chi tiết</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#EFF6EA] border border-emerald-100 p-4 rounded-xl focus:ring-2 focus:ring-[#007832] outline-none text-[#007832] resize-none" 
                placeholder="Vui lòng mô tả tình trạng thực tế..." 
                rows={3}
              />
            </div>

            {/* Upload Ảnh */}
            <div className="space-y-3">
              <label className="block text-[#007832] font-bold text-sm tracking-wide uppercase">Hình ảnh minh chứng</label>
              <div className="border-2 border-dashed border-emerald-200 rounded-xl p-8 bg-[#EFF6EA]/50 flex flex-col items-center justify-center hover:bg-[#EFF6EA] cursor-pointer transition-colors">
                <CloudUpload size={32} className="text-[#007832]/50 mb-2" />
                <p className="text-sm text-gray-500">Nhấn để tải lên (Tối đa 5 ảnh)</p>
              </div>

              {/* Preview Ảnh */}
              <div className="flex gap-3 mt-3">
                <AnimatePresence>
                  {images.map((img) => (
                    <motion.div key={img.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                      <img className="w-full h-full object-cover" src={img.url} alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button onClick={() => removeImage(img.id)} className="text-white hover:text-red-400"><X size={16} /></button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Nút Gửi */}
            <button type="submit" className="w-full py-4 bg-[#007832] text-white font-bold rounded-xl shadow-lg hover:bg-emerald-800 active:scale-95 transition-all flex items-center justify-center gap-2">
              Gửi yêu cầu <Send size={18} />
            </button>
          </form>

          {/* Mini Info */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-[#EFF6EA] p-4 rounded-xl flex gap-3 items-center">
              <Clock className="text-[#007832]" size={20} />
              <p className="text-xs text-[#007832]">Xử lý trong vòng 24-48h</p>
            </div>
            <div className="bg-[#EFF6EA] p-4 rounded-xl flex gap-3 items-center">
              <ShieldCheck className="text-[#007832]" size={20} />
              <p className="text-xs text-[#007832]">Bảo mật thông tin 100%</p>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}

// ==========================================
// CÁC COMPONENT PHỤ (DÙNG CHO TRANG CHI TIẾT)
// ==========================================
function StepIcon({ icon: Icon, label, status }: any) {
  const isPending = status === 'pending';
  const isCurrent = status === 'current';
  return (
    <div className=" relative z-10 flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPending ? 'bg-emerald-50 text-emerald-200' : 'bg-[#007832] text-white shadow-lg shadow-[#007832]/30'} ${isCurrent ? 'ring-4 ring-emerald-100 animate-pulse' : ''}`}>
        <Icon size={18} />
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-tighter ${isPending ? 'text-gray-300' : 'text-[#007832]'}`}>{label}</span>
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }: any) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <Icon size={14} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-bold text-on-surface">{value}</p>
    </div>
  );
}