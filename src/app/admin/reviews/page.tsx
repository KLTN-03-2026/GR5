"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  Search,
  MessageSquare,
  AlertTriangle,
  X,
  CheckCircle2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // States cho Modals
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    data: null as any,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null as number | null,
  });

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?t=${Date.now()}`);
      if (res.ok) setReviews(await res.json());
    } catch (error) {
      toast.error("Lỗi tải dữ liệu đánh giá!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Lọc đánh giá theo thanh tìm kiếm
  const filteredReviews = reviews.filter(
    (r) =>
      r.noi_dung?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.san_pham?.ten_san_pham
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      r.nguoi_dung?.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Tính toán thống kê
  const totalReviews = reviews.length;
  const hiddenReviews = reviews.filter((r) => r.trang_thai === "DA_AN").length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.so_sao || 0), 0) / totalReviews
        ).toFixed(1)
      : "0.0";

  // Hàm Toggle Ẩn/Hiện
  const toggleVisibility = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "DA_AN" ? "HIEN_THI" : "DA_AN";
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trang_thai: newStatus }),
      });
      if (res.ok) {
        toast.success(
          newStatus === "HIEN_THI"
            ? "Đã duyệt hiển thị!"
            : "Đã ẩn đánh giá này!",
        );
        fetchReviews(); // Load lại data
      } else {
        toast.error("Lỗi cập nhật!");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống!");
    }
  };

  // Hàm Xóa
  const executeDelete = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`/api/admin/reviews/${deleteModal.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Đã xóa vĩnh viễn đánh giá!");
        setDeleteModal({ isOpen: false, id: null });
        fetchReviews();
      } else toast.error("Không thể xóa!");
    } catch (error) {
      toast.error("Lỗi hệ thống!");
    }
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-10 font-sans">
      <Toaster />

      {/* HEADER & THỐNG KÊ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex justify-center items-center text-amber-500">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">
                Kiểm Duyệt Đánh Giá
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                Theo dõi và quản lý phản hồi từ khách hàng
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              Điểm trung bình
            </p>
            <p className="text-3xl font-black text-gray-900 flex items-baseline gap-1">
              {averageRating}{" "}
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              Đang bị ẩn
            </p>
            <p className="text-3xl font-black text-rose-500">{hiddenReviews}</p>
          </div>
          <EyeOff className="w-8 h-8 text-rose-100" />
        </div>
      </div>

      {/* THANH TÌM KIẾM */}
      <div className="bg-white p-3 rounded-2xl flex gap-4 border border-gray-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm theo tên khách hàng, nội dung hoặc tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 rounded-xl py-3.5 pl-12 outline-none font-medium focus:ring-2 focus:ring-amber-100 transition-all"
          />
        </div>
      </div>

      {/* BẢNG DANH SÁCH ĐÁNH GIÁ */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 font-bold text-gray-400 text-xs uppercase tracking-widest">
                  Khách hàng
                </th>
                <th className="px-6 py-5 font-bold text-gray-400 text-xs uppercase tracking-widest">
                  Sản phẩm
                </th>
                <th className="px-6 py-5 font-bold text-gray-400 text-xs uppercase tracking-widest">
                  Đánh giá
                </th>
                <th className="px-6 py-5 font-bold text-gray-400 text-xs uppercase tracking-widest text-center">
                  Trạng thái
                </th>
                <th className="px-6 py-5 font-bold text-gray-400 text-xs uppercase tracking-widest text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-20 text-gray-400 font-medium"
                  >
                    Không tìm thấy đánh giá nào.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((r) => {
                  const isHidden = r.trang_thai === "DA_AN";
                  return (
                    <tr
                      key={r.id}
                      className={`transition-colors hover:bg-gray-50/50 ${isHidden ? "bg-gray-50/80" : ""}`}
                    >
                      {/* KHÁCH HÀNG */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                            {r.nguoi_dung?.ho_ten?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {r.nguoi_dung?.ho_ten || "Khách vãng lai"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {r.nguoi_dung?.email || "Không có email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SẢN PHẨM */}
                      <td className="px-6 py-5 max-w-[200px]">
                        <p
                          className="font-bold text-sm text-emerald-700 line-clamp-1 hover:underline cursor-pointer"
                          title={r.san_pham?.ten_san_pham}
                        >
                          {r.san_pham?.ten_san_pham || "Sản phẩm đã xóa"}
                        </p>
                      </td>

                      {/* ĐÁNH GIÁ (SAO & NỘI DUNG) */}
                      <td className="px-6 py-5 max-w-[300px]">
                        <div className="flex text-amber-400 mb-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < r.so_sao ? "fill-amber-400" : "fill-gray-200 text-gray-200"}`}
                            />
                          ))}
                        </div>
                        <p
                          className={`text-sm line-clamp-2 ${isHidden ? "text-gray-400 line-through" : "text-gray-600"}`}
                        >
                          {r.noi_dung || (
                            <span className="italic text-gray-400">
                              Khách không để lại bình luận.
                            </span>
                          )}
                        </p>
                      </td>

                      {/* TRẠNG THÁI TẮT/BẬT */}
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => toggleVisibility(r.id, r.trang_thai)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!isHidden ? "bg-amber-500" : "bg-gray-300"}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!isHidden ? "translate-x-6" : "translate-x-1"}`}
                          />
                        </button>
                        <p className="text-[10px] font-bold mt-1 text-gray-400">
                          {!isHidden ? "Đang hiện" : "Đang ẩn"}
                        </p>
                      </td>

                      {/* THAO TÁC */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              setViewModal({ isOpen: true, data: r })
                            }
                            className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({ isOpen: true, id: r.id })
                            }
                            className="p-2 text-gray-400 hover:text-rose-600 bg-gray-50 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Xóa vĩnh viễn"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT ĐÁNH GIÁ (READ-ONLY) */}
      {viewModal.isOpen && viewModal.data && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setViewModal({ isOpen: false, data: null })}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white max-w-lg w-full rounded-[2rem] p-8 cursor-default shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-black uppercase text-gray-900 flex items-center gap-2">
                Chi tiết đánh giá
              </h3>
              <button
                onClick={() => setViewModal({ isOpen: false, data: null })}
                className="p-2 bg-gray-50 rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xl">
                  {viewModal.data.nguoi_dung?.ho_ten?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900">
                    {viewModal.data.nguoi_dung?.ho_ten || "Khách vãng lai"}
                  </p>
                  <div className="flex text-amber-400 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < viewModal.data.so_sao ? "fill-amber-400" : "fill-gray-200 text-gray-200"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Sản phẩm đánh giá
                </p>
                <p className="font-bold text-emerald-700">
                  {viewModal.data.san_pham?.ten_san_pham || "Sản phẩm đã xóa"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Nội dung bình luận
                </p>
                <p className="text-gray-700 leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                  {viewModal.data.noi_dung || (
                    <span className="italic text-gray-400">
                      Khách không để lại bình luận.
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => setViewModal({ isOpen: false, data: null })}
                className="w-full bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Đóng cửa sổ
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL XÓA */}
      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center cursor-pointer p-4"
          onClick={() => setDeleteModal({ isOpen: false, id: null })}
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
              Xóa Đánh Giá
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Hành động này không thể hoàn tác. Khách hàng cũng sẽ bị mất đánh
              giá này.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, id: null })}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Hủy
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
