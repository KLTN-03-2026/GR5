'use client'

import React from 'react';
import { ArrowRight, ShoppingBasket, Star, ChevronRight, Plus, Mail } from 'lucide-react';
import { motion } from 'framer-motion';


// Mock Data
const CATEGORIES = [
  { id: 'rau-cu', name: 'Rau củ', description: 'Tươi mới mỗi ngày', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400' },
  { id: 'trai-cay', name: 'Trái cây', description: 'Đặc sản vùng miền', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400' },
  { id: 'gao-ngu-coc', name: 'Gạo & Ngũ cốc', description: 'Hạt ngọc trời ban', image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=400' },
  { id: 'thuy-hai-san', name: 'Thuỷ hải sản', description: 'Đánh bắt tự nhiên', image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400' }
];

const PRODUCTS = [
  { id: '1', name: 'Chuối Laba Chín Tự Nhiên', origin: 'Hữu cơ • Đà Lạt', price: 45000, unit: 'kg', rating: 4.9, image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600' },
  { id: '2', name: 'Mật Ong Rừng Tràm', origin: 'Gia Lai • Nguyên chất', price: 285000, unit: 'chai', rating: 5.0, tag: 'Bán chạy', image: 'https://images.unsplash.com/photo-1587049352847-4d4b126a3109?w=600' },
  { id: '3', name: 'Trà Nõn Tôm Thượng Hạng', origin: 'Thái Nguyên • Đặc sản', price: 120000, unit: '100g', rating: 4.8, image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600' },
  { id: '4', name: 'Dâu Tây Giống Nhật Premium', origin: 'Đà Lạt • GlobalGAP', price: 185000, unit: '500g', rating: 4.9, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600' }
];

export default function HomePage() {
  return (
    <main className="grow pt-24">
      {/* Hero Section */}
      <section className="px-6 mb-16">
        <div className="max-w-7xl mx-auto relative h-150 rounded-[2.5rem] overflow-hidden group">
         <img 
  src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=100&w=1600&auto=format&fit=crop"
  alt="Hero" 
  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
/>
          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />
          
          <div className="relative h-full flex flex-col justify-center px-12 md:px-24 max-w-3xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold tracking-widest uppercase mb-6 self-start"
            >
              Mùa Vụ Mới 2026
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-headline font-extrabold text-white leading-[1.1] mb-6"
            >
              Tinh Hoa <span className="text-emerald-400 italic font-medium">Nông Sản</span> Việt
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg text-white/90 font-body leading-relaxed mb-8 max-w-xl"
            >
              Kết nối trực tiếp từ những cánh đồng xanh ngát tới bàn ăn gia đình bạn. Chất lượng thượng hạng, minh bạch nguồn gốc.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <button className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-emerald-900/50 hover:bg-emerald-700 transition-all active:scale-95">
                Khám phá ngay
              </button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all">
                Tìm hiểu về nhà vườn
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-gray-900 mb-4">Danh Mục Tuyển Chọn</h2>
          <div className="w-24 h-1 bg-emerald-600 mx-auto rounded-full" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16" >
          {CATEGORIES.map((cat) => (
            <a key={cat.id} href="#" className="group flex flex-col items-center gap-4 text-center">
              <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden p-1 border-2 border-transparent group-hover:border-emerald-600 transition-all duration-500">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-gray-900">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.description}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Bento Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Large Card */}
          <div className="col-span-12 lg:col-span-8 bg-emerald-50/50 rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col justify-between min-h-125 border border-emerald-100">
            <div className="absolute top-0 right-0 w-1/2 h-full">
              <img src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800" alt="Organic" className="w-full h-full object-cover opacity-90" />
              <div className="absolute inset-0 " />
            </div>
            <div className="relative z-10 max-w-xs">
  <p className="text-emerald-600 font-bold tracking-widest text-xs uppercase mb-4">
    Câu Chuyện Nông Nghiệp
  </p>
  
  <h2 className="text-4xl font-headline font-bold text-gray-900 mb-6 leading-tight">
    Canh tác hữu cơ & Sự phát triển bền vững
  </h2>
  
  <p className="text-gray-600 font-body mb-8">
    Chúng tôi tin rằng thực phẩm ngon nhất bắt đầu từ một nền đất khỏe mạnh. Tìm hiểu cách các đối tác nông dân của chúng tôi đang bảo vệ hệ sinh thái.
  </p>
  
  {/* Nút bấm chuẩn UX/UI: Đổ màu Trắng -> Xanh cực mượt */}
  <a 
    href="#" 
    className="inline-flex items-center bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold shadow-md hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-600/30 transition-all duration-300 ease-in-out group"
  >
    Xem chi tiết 
    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
  </a>
            </div>
            <div className="relative z-10 flex gap-12 mt-auto pt-12">
              <div>
                <p className="text-3xl font-headline font-extrabold text-emerald-600">500+</p>
                <p className="text-sm text-gray-500 font-label">Nông hộ liên kết</p>
              </div>
              <div>
                <p className="text-3xl font-headline font-extrabold text-emerald-600">100%</p>
                <p className="text-sm text-gray-500 font-label">Kiểm định VietGAP</p>
              </div>
            </div>
          </div>

          {/* Side Column */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="flex-1 bg-emerald-700 rounded-[2.5rem] p-8 text-white flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10">
                <h3 className="text-2xl font-headline font-bold mb-4">Gói Rau Củ Tuần</h3>
                <p className="text-emerald-100 text-sm mb-8 leading-relaxed">Tiết kiệm 15% khi đăng ký gói giao hàng định kỳ mỗi thứ 3 hàng tuần.</p>
              </div>
              <button className="relative z-10 bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold w-full active:scale-95 transition-all">
                Đăng ký ngay
              </button>
              <div className="absolute -top-4 -right-4 opacity-10 transition-transform group-hover:scale-125">
                <ShoppingBasket className="w-32 h-32" />
              </div>
            </div>

            <div className="flex-1 bg-orange-50 rounded-[2.5rem] p-8 flex flex-col justify-between relative group border border-orange-100">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Ưu đãi giới hạn</span>
                </div>
                <h3 className="text-2xl font-headline font-bold mb-2 text-gray-900">Trái Cây Nhập Khẩu</h3>
                <p className="text-gray-600 text-sm font-medium">Cherry New Zealand & Táo Envy đang có giá tốt nhất mùa.</p>
              </div>
              <div className="flex items-end justify-between mt-8">
                <div>
                  <p className="text-xs line-through text-gray-400">550.000đ</p>
                  <p className="text-2xl font-headline font-extrabold text-orange-600">399.000đ</p>
                </div>
                <button className="bg-orange-500 text-white p-3 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Recommendations */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-headline font-bold text-gray-900">Đề xuất hôm nay</h2>
            <p className="text-gray-500 mt-2">Những sản phẩm vừa thu hoạch sáng nay</p>
          </div>
          <button className="text-emerald-600 font-bold hover:underline flex items-center gap-2 group">
            Xem tất cả <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.map((product) => (
            <motion.div key={product.id} whileHover={{ y: -8 }} className="bg-white p-4 rounded-3xl group hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-300 border border-gray-100">
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-50">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                {product.tag && (
                  <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                    {product.tag}
                  </div>
                )}
                <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-emerald-600 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <ShoppingBasket className="w-5 h-5" />
                </button>
              </div>
              <div className="px-2">
                <p className="text-xs text-gray-500 mb-1">{product.origin}</p>
                <h4 className="font-headline font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h4>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-emerald-600">
                    {product.price.toLocaleString('vi-VN')}đ <span className="text-xs text-gray-400 font-normal">/{product.unit}</span>
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold">{product.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-[#EFF6EA] rounded-[3rem] p-12 text-center border border-emerald-100 relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Mail className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-headline font-extrabold text-gray-900 mb-4">Nhận bản tin nông vụ hàng tuần</h2>
            <p className="text-gray-600 font-body mb-10 max-w-xl mx-auto">Cập nhật những nông sản mới nhất vào mùa, ưu đãi độc quyền dành riêng cho thành viên và các kiến thức sống xanh.</p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Địa chỉ email của bạn" className="flex-1 bg-white border border-emerald-100 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" />
              <button className="bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
                Đăng ký
              </button>
            </form>
            <p className="mt-6 text-xs text-gray-400 italic">Chúng tôi cam kết bảo mật thông tin của bạn. Không bao giờ spam.</p>
          </div>
        </div>
      </section>
    </main>
  );
}