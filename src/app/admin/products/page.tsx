'use client'

import React, { useState } from 'react';
import { Search, Bell, Plus, Edit2, Trash2, X, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU (Giúp sửa triệt để lỗi ts(2305)) ---
interface Product {
  id: string;
  name: string;
  farm: string;
  quantity: string;
  unitPrice: number;
  totalPrice: number;
  image: string;
}

// --- DỮ LIỆU MẪU ---
const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Rau muống sạch",
    farm: "Đà Lạt Farm",
    quantity: "02 kg",
    unitPrice: 15000,
    totalPrice: 30000,
    image: "https://images.unsplash.com/photo-1546793665-c74683c3ef86?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "2",
    name: "Cà chua bi hữu cơ",
    farm: "Green Garden",
    quantity: "01 hộp",
    unitPrice: 30000,
    totalPrice: 30000,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=200"
  }
];

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  
  // --- STATE MODAL FORM (DÙNG CHUNG CHO CẢ THÊM VÀ SỬA) ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // --- STATE DỮ LIỆU FORM ---
  const [name, setName] = useState('');
  const [farm, setFarm] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  // --- STATE MODAL XÓA ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // ==========================================
  // LOGIC SỬA (EDIT)
  // ==========================================
  const handleEditClick = (product: Product) => {
    setName(product.name);
    setFarm(product.farm);
    setQuantity(product.quantity);
    setUnitPrice(product.unitPrice.toString());
    
    setEditingId(product.id);
    setIsFormModalOpen(true);
  };

  // ==========================================
  // LOGIC LƯU (THÊM MỚI HOẶC CẬP NHẬT)
  // ==========================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !unitPrice || !quantity) return;

    const parsedQuantity = parseFloat(quantity.replace(/[^\d.-]/g, '')) || 1;
    const calculatedTotal = Number(unitPrice) * parsedQuantity;

    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? {
        ...p,
        name,
        farm: farm || 'Nhà vườn đối tác',
        quantity,
        unitPrice: Number(unitPrice),
        totalPrice: calculatedTotal
      } : p));
    } else {
      const id = Math.random().toString(36).substring(2, 9);
      const newProduct: Product = {
        id,
        name,
        farm: farm || 'Nhà vườn đối tác',
        quantity,
        unitPrice: Number(unitPrice),
        totalPrice: calculatedTotal,
        image: "https://images.unsplash.com/photo-1595855767639-619f7cc8c3eb?auto=format&fit=crop&q=80&w=200" 
      };
      setProducts(prev => [newProduct, ...prev]);
    }

    closeFormModal();
  };

  const closeFormModal = () => {
    setName(''); setFarm(''); setQuantity(''); setUnitPrice('');
    setEditingId(null);
    setIsFormModalOpen(false);
  };

  // ==========================================
  // LOGIC XÓA (DELETE)
  // ==========================================
  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      setProducts(prev => prev.filter(p => p.id !== productToDelete));
    }
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý sản phẩm</h2>
          <p className="text-gray-500 text-sm mt-1">Thêm, sửa, xóa và kiểm soát tồn kho nông sản.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm sản phẩm..." 
              className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full md:w-64 text-sm outline-none transition-all"
            />
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shrink-0">
            <Bell size={18} />
          </button>
          <button 
            onClick={() => { setEditingId(null); setIsFormModalOpen(true); }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all shrink-0"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Thêm sản phẩm</span>
          </button>
        </div>
      </header>

      {/* Bảng Danh sách Sản phẩm */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-[11px] font-bold tracking-wider uppercase border-b border-gray-100">
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Nhà vườn</th>
                <th className="px-6 py-4 text-center">Tồn kho / SL</th>
                <th className="px-6 py-4 text-right">Đơn giá</th>
                <th className="px-6 py-4 text-right">Thành tiền</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-emerald-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200/50 flex-shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</p>
                        <p className="text-[11px] text-gray-500 font-mono mt-0.5">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                      {product.farm}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-gray-700">{product.quantity}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-gray-600">
                      {product.unitPrice.toLocaleString('vi-VN')} ₫
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-emerald-600">
                      {product.totalPrice.toLocaleString('vi-VN')} ₫
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      {/* NÚT SỬA */}
                      <button 
                        onClick={() => handleEditClick(product)}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      
                      {/* NÚT XÓA */}
                      <button 
                        onClick={() => handleDeleteClick(product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    Chưa có sản phẩm nào trong kho.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">Tổng cộng: {products.length} sản phẩm</p>
        </div>
      </div>

      {/* ==============================================
          MODAL 1: FORM THÊM / SỬA SẢN PHẨM 
      =============================================== */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden relative"
            >
              <button 
                onClick={closeFormModal} 
                className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold text-gray-900">
                    {editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingId ? 'Chỉnh sửa thông tin chi tiết của nông sản.' : 'Nhập thông tin chi tiết cho nông sản.'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Tên sản phẩm *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Dâu tây sấy lạnh" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900" required />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Đơn giá (VNĐ) *</label>
                      <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="VD: 150000" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Số lượng/Đơn vị *</label>
                      <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="VD: 02 kg, 50 hộp" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900" required />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Nguồn gốc / Nhà vườn</label>
                    <input type="text" value={farm} onChange={(e) => setFarm(e.target.value)} placeholder="VD: Dalat Organic Farm" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900" />
                  </div>

                  {!editingId && (
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Hình ảnh sản phẩm</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50/50 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors group">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <ImageIcon size={20} className="text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">Nhấn để tải ảnh lên</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG tối đa 5MB</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 mt-6 border-t border-gray-100 flex gap-3">
                    <button type="button" onClick={closeFormModal} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all">
                      Hủy bỏ
                    </button>
                    <button type="submit" className="flex-1 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                      {editingId ? 'Cập nhật' : <><Plus size={18} /> Lưu sản phẩm</>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==============================================
          MODAL 2: XÁC NHẬN XÓA (CONFIRM DELETE) 
      =============================================== */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Hành động này không thể hoàn tác. Sản phẩm này sẽ bị xóa vĩnh viễn khỏi hệ thống.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Hủy
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/20"
                >
                  Có, xóa ngay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}