'use client'

import { 
  Settings, 
  MapPin, 
  Truck, 
  Save, 
  Info,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function ShippingSettings() {
  // --- STATES ---
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    innerCityFee: 15000,
    outerCityFee: 30000,
    freeShipThreshold: 500000 // Đơn trên 500k thì freeship (Tính năng thêm rất hay cho shop)
  });

  // Giả lập load dữ liệu từ Database khi mới vào trang
  useEffect(() => {
    // Tạm thời lấy từ localStorage (Sau này bạn viết API GET từ bảng cau_hinh thì bỏ vào đây)
    const savedConfig = localStorage.getItem('shippingConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  // Hàm Lưu cấu hình
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // 💡 NƠI GỌI API BACKEND: 
      // await fetch('/api/admin/settings/shipping', { method: 'POST', body: JSON.stringify(config) });
      
      // Tạm thời lưu vào LocalStorage để test UI
      await new Promise(resolve => setTimeout(resolve, 800)); // Giả lập mạng chậm 0.8s
      localStorage.setItem('shippingConfig', JSON.stringify(config));
      
      alert("🎉 Đã lưu cấu hình phí vận chuyển thành công!");
    } catch (error) {
      alert("Lỗi khi lưu cấu hình!");
    } finally {
      setIsSaving(false);
    }
  };

  // Format tiền tệ cho đẹp lúc hiển thị preview
  const formatVND = (amount: number) => amount.toLocaleString('vi-VN') + 'đ';

  return (
    <div className="w-full flex flex-col gap-8 bg-[#F4FCF0] p-6 min-h-screen">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight flex items-center gap-3">
            <Settings className="text-[#00873A]" size={36} />
            Cài đặt hệ thống
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Cấu hình phí vận chuyển và các tham số hoạt động của cửa hàng.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#00873A] text-white h-12 px-8 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-md shadow-[#00873A]/20 active:scale-95"
        >
          {isSaving ? "Đang lưu..." : <><Save size={18} /> Lưu thay đổi</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: FORM CÀI ĐẶT */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Truck size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Phí Giao Hàng</h2>
                <p className="text-sm text-gray-500">Áp dụng khi khách hàng đặt hàng trên Web/App</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Phí Nội Thành */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                  <MapPin size={16} className="text-emerald-600" /> Phí giao Nội thành
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    name="innerCityFee"
                    value={config.innerCityFee}
                    onChange={handleChange}
                    className="w-full bg-white p-4 pr-12 rounded-xl outline-none focus:ring-2 focus:ring-[#00873A] font-bold text-lg text-gray-900 border border-gray-200 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">VNĐ</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Info size={12}/> Áp dụng cho các quận trung tâm Đà Nẵng (Hải Châu, Thanh Khê, Sơn Trà...)
                </p>
              </div>

              {/* Phí Ngoại Thành */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                  <MapPin size={16} className="text-orange-500" /> Phí giao Ngoại thành
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    name="outerCityFee"
                    value={config.outerCityFee}
                    onChange={handleChange}
                    className="w-full bg-white p-4 pr-12 rounded-xl outline-none focus:ring-2 focus:ring-[#00873A] font-bold text-lg text-gray-900 border border-gray-200 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">VNĐ</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Info size={12}/> Áp dụng cho các huyện ngoại ô (Hòa Vang, Liên Chiểu...)
                </p>
              </div>

            </div>
          </motion.div>

          {/* BLOCK: KHUYẾN MÃI FREESHIP */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <CreditCard size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Chính sách Miễn phí ship</h2>
                <p className="text-sm text-gray-500">Kích thích khách hàng mua nhiều hơn</p>
              </div>
            </div>

            <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                Đơn hàng đạt mức tối thiểu sau sẽ được Freeship:
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  name="freeShipThreshold"
                  value={config.freeShipThreshold}
                  onChange={handleChange}
                  className="w-full bg-white p-4 pr-12 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-lg text-gray-900 border border-orange-200 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">VNĐ</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CỘT PHẢI: PREVIEW (MÔ PHỎNG GIỎ HÀNG CỦA KHÁCH) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#00873A] text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden h-fit"
        >
          <div className="relative z-10">
            <h3 className="text-lg font-black mb-6 uppercase tracking-widest text-emerald-100">Khách hàng sẽ thấy</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-black/10 p-4 rounded-xl">
                <span className="font-medium text-emerald-50">Mua Rau củ quả:</span>
                <span className="font-bold">250.000đ</span>
              </div>
              
              <div className="flex justify-between items-center bg-black/10 p-4 rounded-xl border border-white/20">
                <div className="flex flex-col">
                  <span className="font-medium text-emerald-50">Phí vận chuyển:</span>
                  <span className="text-xs text-emerald-200 mt-1">
                    (Giả sử giao Nội thành)
                  </span>
                </div>
                {/* Logic hiển thị phí ship mô phỏng */}
                <span className="font-bold text-yellow-300">
                  {250000 >= config.freeShipThreshold ? "0đ (Freeship)" : formatVND(config.innerCityFee)}
                </span>
              </div>

              <div className="h-px bg-white/20 my-2"></div>

              <div className="flex justify-between items-center p-2">
                <span className="font-bold text-emerald-100">TỔNG THANH TOÁN:</span>
                <span className="text-2xl font-black">
                  {formatVND(250000 + (250000 >= config.freeShipThreshold ? 0 : config.innerCityFee))}
                </span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white/10 rounded-xl text-sm leading-relaxed text-emerald-50">
              💡 <strong className="text-white">Mẹo nhỏ:</strong> Bạn đang thiết lập Freeship cho đơn từ {formatVND(config.freeShipThreshold)}. Khách hàng này cần mua thêm {formatVND(config.freeShipThreshold - 250000)} nữa để được miễn phí ship!
            </div>
          </div>

          {/* Icon mờ làm background */}
          <Truck className="absolute -bottom-10 -right-10 text-emerald-800 opacity-20" size={250} />
        </motion.div>

      </div>
    </div>
  );
}