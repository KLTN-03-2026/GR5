"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  TicketPercent,
  X,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    ma_code: "",
    loai_giam_gia: "PHAN_TRAM",
    gia_tri_giam: "",
    don_toi_thieu: "",
    gioi_han_su_dung: "",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null as number | null,
    code: "",
  });

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/promotions?t=${Date.now()}`);
      if (res.ok) setPromotions(await res.json());
    } catch (error) {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      ma_code: "",
      loai_giam_gia: "PHAN_TRAM",
      gia_tri_giam: "",
      don_toi_thieu: "",
      gioi_han_su_dung: "",
      ngay_bat_dau: "",
      ngay_ket_thuc: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (promo: any) => {
    setEditingId(promo.id);
    setFormData({
      ma_code: promo.ma_code,
      loai_giam_gia: promo.loai_giam_gia || "PHAN_TRAM",
      gia_tri_giam: promo.gia_tri_giam?.toString() || "",
      don_toi_thieu: promo.don_toi_thieu?.toString() || "",
      gioi_han_su_dung: promo.gioi_han_su_dung?.toString() || "",
      ngay_bat_dau: formatDateForInput(promo.ngay_bat_dau),
      ngay_ket_thuc: formatDateForInput(promo.ngay_ket_thuc),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ma_code.trim()) {
      toast.error("Vui lòng nhập Mã Code!");
      return;
    }
    if (!formData.gia_tri_giam) {
      toast.error("Vui lòng nhập Giá trị giảm!");
      return;
    }

    // Chặn số âm
    if (
      Number(formData.gia_tri_giam) < 0 ||
      Number(formData.don_toi_thieu) < 0 ||
      Number(formData.gioi_han_su_dung) < 0
    ) {
      toast.error("Các giá trị số không được là số âm!");
      return;
    }

    // === BẮT ĐẦU KIỂM TRA THỜI GIAN LOGIC ===
    const now = new Date();
    const startDate = formData.ngay_bat_dau
      ? new Date(formData.ngay_bat_dau)
      : null;
    const endDate = formData.ngay_ket_thuc
      ? new Date(formData.ngay_ket_thuc)
      : null;

    // 1. Nếu tạo mới -> Ngày bắt đầu không được ở trong quá khứ
    if (!editingId && startDate && startDate < now) {
      toast.error("Thời gian bắt đầu không được ở trong quá khứ!");
      return;
    }

    // 2. Cả lúc tạo lẫn sửa -> Ngày kết thúc phải sau ngày bắt đầu
    if (startDate && endDate && startDate >= endDate) {
      toast.error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu!");
      return;
    }
    // === KẾT THÚC KIỂM TRA ===

    const url = editingId
      ? `/api/admin/promotions/${editingId}`
      : "/api/admin/promotions";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success(
          editingId ? "Cập nhật thành công!" : "Tạo mã khuyến mãi thành công!",
        );
        setIsModalOpen(false);
        fetchPromotions();
      } else {
        const data = await res.json();
        toast.error(data.error || "Lỗi hệ thống!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối API!");
    }
  };

  const executeDelete = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`/api/admin/promotions/${deleteModal.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Đã xóa mã khuyến mãi!");
        setDeleteModal({ isOpen: false, id: null, code: "" });
        fetchPromotions();
      } else {
        const data = await res.json();
        toast.error(data.error || "Không thể xóa!");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống!");
    }
  };

  const checkStatus = (endDate: string | null) => {
    if (!endDate)
      return {
        label: "Vô thời hạn",
        color: "bg-blue-50 text-blue-600 border-blue-100",
      };
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    return end > now
      ? {
          label: "Đang chạy",
          color: "bg-emerald-50 text-emerald-600 border-emerald-100",
        }
      : {
          label: "Đã hết hạn",
          color: "bg-gray-100 text-gray-500 border-gray-200",
        };
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-10 font-sans">
      <Toaster />
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex justify-center items-center text-rose-500">
            <TicketPercent className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">
              Mã Giảm Giá
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Quản lý kho voucher, chiến dịch khuyến mãi
            </p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex gap-2 bg-rose-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Tạo Mã Mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500 mx-auto"></div>
          </div>
        ) : promotions.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
            <TicketPercent className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Chưa có mã giảm giá nào.</p>
          </div>
        ) : (
          promotions.map((p) => {
            const status = checkStatus(p.ngay_ket_thuc);
            const isExpired = status.label === "Đã hết hạn";

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm relative overflow-hidden transition-all group ${isExpired ? "border-gray-200 opacity-70" : "border-rose-100 hover:shadow-md hover:border-rose-300"}`}
              >
                <div
                  className={`absolute top-0 right-0 w-2 h-full ${isExpired ? "bg-gray-300" : "bg-rose-400"}`}
                ></div>

                <div className="flex justify-between items-start mb-4 pr-2">
                  <span
                    className={`inline-block px-3 py-1 font-black text-lg border-2 border-dashed rounded tracking-wider ${isExpired ? "bg-gray-50 text-gray-500 border-gray-300" : "bg-rose-50 text-rose-600 border-rose-200"}`}
                  >
                    {p.ma_code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>

                {/* ĐÃ FIX HIỂN THỊ: Chắc chắn check đúng TIEN_MAT hay PHAN_TRAM */}
                <p
                  className={`text-3xl font-black mb-4 ${isExpired ? "text-gray-400" : "text-gray-900"}`}
                >
                  Giảm{" "}
                  {p.loai_giam_gia === "TIEN_MAT" ? (
                    <span className="text-rose-500">
                      {Number(p.gia_tri_giam).toLocaleString("vi-VN")}đ
                    </span>
                  ) : (
                    <span className="text-rose-500">
                      {Number(p.gia_tri_giam)}%
                    </span>
                  )}
                </p>

                <div className="text-xs text-gray-500 space-y-2 mb-6">
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span>Đơn tối thiểu:</span>
                    <strong className="text-gray-700">
                      {p.don_toi_thieu
                        ? `${Number(p.don_toi_thieu).toLocaleString("vi-VN")}đ`
                        : "Không yêu cầu"}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span>Lượt sử dụng:</span>
                    <strong className="text-gray-700">
                      {p.gioi_han_su_dung
                        ? `${p.gioi_han_su_dung} lượt`
                        : "Không giới hạn"}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-4 mt-auto">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {p.ngay_ket_thuc
                      ? new Date(p.ngay_ket_thuc).toLocaleDateString("vi-VN")
                      : "Không có hạn"}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          id: p.id,
                          code: p.ma_code,
                        })
                      }
                      className="p-2 text-gray-400 hover:text-rose-600 bg-gray-50 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white max-w-2xl w-full rounded-[2rem] p-8 cursor-default shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-black uppercase text-rose-600 flex items-center gap-2">
                <TicketPercent className="w-6 h-6" />{" "}
                {editingId ? "Cập Nhật Mã Code" : "Tạo Mã Code Mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-gray-50 rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5" noValidate>
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Mã Code (Chữ & Số) *
                  </label>
                  <input
                    type="text"
                    name="ma_code"
                    value={formData.ma_code}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 uppercase font-black text-rose-600 tracking-widest focus:border-rose-400 focus:ring-4 focus:ring-rose-50 outline-none transition-all"
                    placeholder="VD: TET2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Hình thức giảm
                  </label>
                  <select
                    name="loai_giam_gia"
                    value={formData.loai_giam_gia}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-rose-400 outline-none"
                  >
                    <option value="PHAN_TRAM">Giảm theo %</option>
                    <option value="TIEN_MAT">Giảm tiền mặt (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Giá trị giảm *
                  </label>
                  {/* ĐÃ FIX: Thêm min="0" chống số âm */}
                  <input
                    type="number"
                    min="0"
                    name="gia_tri_giam"
                    value={formData.gia_tri_giam}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-bold focus:border-rose-400 outline-none"
                    placeholder={
                      formData.loai_giam_gia === "PHAN_TRAM"
                        ? "VD: 10 (%)"
                        : "VD: 50000 (VNĐ)"
                    }
                  />
                </div>

                <div className="col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Đơn tối thiểu (Tùy chọn)
                    </label>
                    {/* ĐÃ FIX: Thêm min="0" chống số âm */}
                    <input
                      type="number"
                      min="0"
                      name="don_toi_thieu"
                      value={formData.don_toi_thieu}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-rose-400"
                      placeholder="VD: 200000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Giới hạn số lượt (Tùy chọn)
                    </label>
                    {/* ĐÃ FIX: Thêm min="0" chống số âm */}
                    <input
                      type="number"
                      min="0"
                      name="gioi_han_su_dung"
                      value={formData.gioi_han_su_dung}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-rose-400"
                      placeholder="VD: 100 lượt"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Thời gian bắt đầu
                  </label>
                  <input
                    type="datetime-local"
                    name="ngay_bat_dau"
                    value={formData.ngay_bat_dau}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-600 outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Thời gian kết thúc
                  </label>
                  <input
                    type="datetime-local"
                    name="ngay_ket_thuc"
                    value={formData.ngay_ket_thuc}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-600 outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 font-bold py-4 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-500 text-white font-black tracking-widest py-4 rounded-xl hover:bg-rose-600 shadow-xl shadow-rose-500/30 transition-all active:scale-95"
                >
                  {editingId ? "CẬP NHẬT MÃ" : "PHÁT HÀNH MÃ"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center cursor-pointer p-4"
          onClick={() => setDeleteModal({ isOpen: false, id: null, code: "" })}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white max-w-sm w-full rounded-[2rem] p-6 text-center cursor-default shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="font-black text-xl text-gray-900 mb-2">
              Xóa Mã Giảm Giá
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Xóa vĩnh viễn mã{" "}
              <strong className="text-rose-500">{deleteModal.code}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setDeleteModal({ isOpen: false, id: null, code: "" })
                }
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-3.5 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-500/30 transition-all"
              >
                Đồng ý xóa
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
