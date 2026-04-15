"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  LayoutGrid,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null as number | null,
    name: "",
  });
  const generatePagination = () => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2)
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };
  const paginationItems = generatePagination();
  const fetchCategories = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/categories?page=${page}&limit=${limit}&search=${search}&t=${Date.now()}`,
      );
      if (res.ok) {
        const result = await res.json();
        setCategories(result.data);
        setTotalPages(result.meta.totalPages || 1);
        setCurrentPage(result.meta.page);
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCategories(currentPage, searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [currentPage, searchTerm]);

  const openAddModal = () => {
    setEditingId(null);
    setCategoryName("");
    setIsModalOpen(true);
  };
  const openEditModal = (category: any) => {
    setEditingId(category.id);
    setCategoryName(category.ten_danh_muc);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    // VALIDATE SANG XỊN MỊN (Thay thế báo lỗi mặc định)
    if (!categoryName.trim()) {
      toast.error("Vui lòng nhập Tên danh mục!");
      return;
    }

    const url = editingId
      ? `/api/admin/categories/${editingId}`
      : "/api/admin/categories";
    const method = editingId ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ten_danh_muc: categoryName }),
      });
      if (res.ok) {
        toast.success(
          editingId ? "Cập nhật thành công!" : "Thêm danh mục thành công!",
        );
        setIsModalOpen(false);
        fetchCategories(currentPage, searchTerm);
      } else {
        toast.error("Có lỗi xảy ra!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối Server!");
    }
  };

  const executeDelete = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`/api/admin/categories/${deleteModal.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Đã xóa danh mục!");
        setDeleteModal({ isOpen: false, id: null, name: "" });
        if (categories.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchCategories(currentPage, searchTerm);
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Không thể xóa!");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống!");
    }
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto font-sans relative">
      <Toaster />
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#006b2c]">
            <LayoutGrid className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#171d16] uppercase">
              Danh Mục Sản Phẩm
            </h2>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex gap-2 bg-[#006b2c] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-all"
        >
          <Plus className="w-5 h-5" /> Tạo mới
        </button>
      </div>

      <div className="bg-white p-3 rounded-2xl shadow-sm border border-emerald-50 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-gray-50/50 border-none rounded-xl py-3 pl-12 outline-none font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-emerald-50 flex flex-col min-h-[400px]">
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006b2c]"></div>
          </div>
        ) : (
          <>
            {/* ĐÃ BỌC TABLE TRONG DIV FLEX-1 ĐỂ ĐẨY PHÂN TRANG XUỐNG */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-8 py-5 font-bold text-gray-500 text-xs uppercase">
                      Tên Danh mục
                    </th>
                    <th className="px-6 py-5 font-bold text-gray-500 text-xs uppercase text-center">
                      Số lượng SP
                    </th>
                    <th className="px-8 py-5 font-bold text-gray-500 text-xs uppercase text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-emerald-50/20 bg-white"
                      >
                        <td className="px-8 py-4">
                          <span className="font-bold text-gray-900">
                            {c.ten_danh_muc}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex w-8 h-8 rounded-lg bg-gray-50 font-bold text-gray-600 justify-center items-center">
                            {c._count?.san_pham || 0}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-2 text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                id: c.id,
                                name: c.ten_danh_muc,
                              })
                            }
                            className="p-2 text-gray-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-16 text-gray-500"
                      >
                        Chưa có danh mục.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ĐÃ THÊM mt-auto VÀO ĐÂY */}
            {/* ĐÃ CẬP NHẬT PHÂN TRANG THEO YÊU CẦU CỦA SẾP */}
            {totalPages > 1 && (
              <div className="mt-auto px-8 py-4 bg-gray-50/50 border-t flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">
                  Trang {currentPage} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="w-8 h-8 flex items-center justify-center bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Hiển thị số trang */}
                  {paginationItems.map((item, index) =>
                    item === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${item}`}
                        onClick={() => setCurrentPage(Number(item))}
                        className={`w-8 h-8 flex items-center justify-center rounded font-bold transition-all ${currentPage === item ? "bg-[#006b2c] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#006b2c]"}`}
                      >
                        {item}
                      </button>
                    ),
                  )}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    className="w-8 h-8 flex items-center justify-center bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white max-w-sm w-full rounded-3xl p-6 text-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex justify-center items-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="font-black text-xl mb-2">Cảnh báo Xóa</h3>
            <p className="text-gray-500 text-sm mb-6">
              Xóa danh mục "{deleteModal.name}"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setDeleteModal({ isOpen: false, id: null, name: "" })
                }
                className="flex-1 py-3 bg-gray-100 font-bold rounded-xl hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600"
              >
                Đồng ý xóa
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white max-w-md w-full rounded-3xl p-7 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">
                {editingId ? "Sửa Danh Mục" : "Tạo Danh Mục"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-gray-50 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ĐÃ THÊM noValidate Ở ĐÂY */}
            <form
              onSubmit={handleSaveCategory}
              className="space-y-5"
              noValidate
            >
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  autoFocus
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full border-2 rounded-xl px-4 py-3 focus:border-[#006b2c] outline-none font-semibold"
                  placeholder="VD: Trái cây tươi"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 font-bold py-3.5 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#006b2c] text-white font-bold py-3.5 rounded-xl"
                >
                  Lưu
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
