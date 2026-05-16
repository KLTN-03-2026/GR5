"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  AlertTriangle,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 15;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null as number | null,
    name: "",
  });

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
        setTotalCount(result.meta.total || result.data.length);
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
        toast.success(editingId ? "Cập nhật thành công!" : "Thêm danh mục thành công!");
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

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  const generatePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  return (
    <div
      style={{
        background: "#f7f8f6",
        minHeight: "100vh",
        padding: "24px 28px",
        fontFamily: "var(--font-sans)",
        boxSizing: "border-box",
      }}
    >

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#111827", margin: 0, lineHeight: 1.3 }}>
          Danh mục
        </h1>
        <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>
          Admin / Danh mục
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 }}>
        {/* Search */}
        <div style={{ position: "relative", width: 320 }}>
          <Search
            style={{
              position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
              width: 14, height: 14, color: "#9ca3af",
            }}
          />
          <input
            type="text"
            placeholder="Tìm tên danh mục..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{
              width: "100%", height: 38, border: "1px solid #e5e7eb", borderRadius: 8,
              fontSize: 13, padding: "0 12px 0 34px", outline: "none",
              fontFamily: "var(--font-sans)", boxSizing: "border-box",
              color: "#374151", background: "#fff",
            }}
          />
        </div>

        {/* Create button */}
        <button
          onClick={openAddModal}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#16a34a", color: "#fff",
            height: 38, padding: "0 18px", borderRadius: 8,
            border: "none", fontSize: 14, fontWeight: 500,
            cursor: "pointer", flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#15803d")}
          onMouseLeave={e => (e.currentTarget.style.background = "#16a34a")}
        >
          <Plus style={{ width: 15, height: 15 }} />
          Tạo mới
        </button>
      </div>

      {/* Table card */}
      <div
        style={{
          background: "#fff", border: "1px solid #e5e7eb",
          borderRadius: 12, overflow: "hidden",
        }}
      >
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "64px 0" }}>
            <div
              style={{
                width: 28, height: 28, borderRadius: "50%",
                border: "3px solid #e5e7eb", borderTopColor: "#16a34a",
                animation: "spin 0.7s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#9ca3af" }}>
                    Tên danh mục
                  </th>
                  <th style={{ padding: "10px 20px", textAlign: "center", fontSize: 12, fontWeight: 500, color: "#9ca3af", width: 140 }}>
                    Số lượng
                  </th>
                  <th style={{ padding: "10px 20px", textAlign: "right", fontSize: 12, fontWeight: 500, color: "#9ca3af", width: 100 }}>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((c, idx) => (
                    <tr
                      key={c.id}
                      style={{ borderBottom: idx === categories.length - 1 ? "none" : "1px solid #f3f4f6" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 500, color: "#111827" }}>
                        {c.ten_danh_muc}
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-block",
                            background: "#f3f4f6", color: "#374151",
                            fontSize: 12, fontWeight: 500,
                            padding: "3px 10px", borderRadius: 99,
                          }}
                        >
                          {c._count?.san_pham || 0} sản phẩm
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 4 }}>
                          <button
                            onClick={() => openEditModal(c)}
                            style={{
                              width: 32, height: 32, borderRadius: 6,
                              border: "none", background: "transparent",
                              cursor: "pointer", display: "flex",
                              alignItems: "center", justifyContent: "center",
                              color: "#6b7280",
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = "#f0fdf4";
                              e.currentTarget.style.color = "#16a34a";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = "#6b7280";
                            }}
                          >
                            <Edit style={{ width: 14, height: 14 }} />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, id: c.id, name: c.ten_danh_muc })}
                            style={{
                              width: 32, height: 32, borderRadius: 6,
                              border: "none", background: "transparent",
                              cursor: "pointer", display: "flex",
                              alignItems: "center", justifyContent: "center",
                              color: "#6b7280",
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = "#fef2f2";
                              e.currentTarget.style.color = "#dc2626";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = "#6b7280";
                            }}
                          >
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ padding: "48px 0", textAlign: "center" }}>
                      <FolderOpen style={{ width: 40, height: 40, color: "#d1d5db", margin: "0 auto 12px" }} />
                      <p style={{ fontSize: 15, fontWeight: 500, color: "#374151", margin: "0 0 4px" }}>
                        Không tìm thấy danh mục nào
                      </p>
                      <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
                        Thử tìm với từ khóa khác hoặc tạo danh mục mới
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Footer pagination */}
            {totalCount > 0 && (
              <div
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 20px", borderTop: "1px solid #f3f4f6",
                }}
              >
                <span style={{ fontSize: 13, color: "#9ca3af" }}>
                  Hiển thị {startItem}–{endItem} trong tổng số {totalCount} danh mục
                </span>
                {totalPages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        height: 32, minWidth: 32, padding: "0 8px",
                        border: "1px solid #e5e7eb", borderRadius: 6,
                        background: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        opacity: currentPage === 1 ? 0.4 : 1,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#374151", fontSize: 13,
                      }}
                    >
                      <ChevronLeft style={{ width: 14, height: 14 }} />
                    </button>
                    {generatePages().map((p, i) =>
                      p === "..." ? (
                        <span key={`e-${i}`} style={{ padding: "0 4px", color: "#9ca3af", fontSize: 13 }}>…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(Number(p))}
                          style={{
                            height: 32, minWidth: 32, padding: "0 6px",
                            border: currentPage === p ? "1px solid #16a34a" : "1px solid #e5e7eb",
                            borderRadius: 6, fontSize: 13, cursor: "pointer",
                            background: currentPage === p ? "#16a34a" : "#fff",
                            color: currentPage === p ? "#fff" : "#374151",
                            fontWeight: currentPage === p ? 600 : 400,
                          }}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        height: 32, minWidth: 32, padding: "0 8px",
                        border: "1px solid #e5e7eb", borderRadius: 6,
                        background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                        opacity: currentPage === totalPages ? 0.4 : 1,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#374151", fontSize: 13,
                      }}
                    >
                      <ChevronRight style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete modal */}
      {deleteModal.isOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ background: "#fff", maxWidth: 380, width: "100%", borderRadius: 16, padding: 24, textAlign: "center" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 56, height: 56, background: "#fef2f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <AlertTriangle style={{ width: 24, height: 24, color: "#dc2626" }} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: "#111827", margin: "0 0 8px" }}>Xác nhận xóa</h3>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px", lineHeight: 1.5 }}>
              Xóa danh mục "<strong style={{ color: "#111827" }}>{deleteModal.name}</strong>"?
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
                style={{ flex: 1, height: 40, background: "#f3f4f6", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#374151" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#e5e7eb")}
                onMouseLeave={e => (e.currentTarget.style.background = "#f3f4f6")}
              >
                Hủy
              </button>
              <button
                onClick={executeDelete}
                style={{ flex: 1, height: 40, background: "#dc2626", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#fff" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#b91c1c")}
                onMouseLeave={e => (e.currentTarget.style.background = "#dc2626")}
              >
                Xóa
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create/Edit modal */}
      {isModalOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ background: "#fff", maxWidth: 440, width: "100%", borderRadius: 16, padding: 28 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: "#111827", margin: 0 }}>
                {editingId ? "Sửa danh mục" : "Tạo danh mục"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ width: 32, height: 32, borderRadius: 8, background: "#f3f4f6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  autoFocus
                  value={categoryName}
                  onChange={e => setCategoryName(e.target.value)}
                  placeholder="VD: Trái cây tươi"
                  style={{
                    width: "100%", height: 40, border: "1px solid #d1d5db", borderRadius: 8,
                    fontSize: 14, padding: "0 12px", outline: "none",
                    fontFamily: "var(--font-sans)", boxSizing: "border-box", color: "#111827",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#16a34a")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#d1d5db")}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, height: 40, background: "#f3f4f6", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#374151" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#e5e7eb")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#f3f4f6")}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, height: 40, background: "#16a34a", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#fff" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#15803d")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#16a34a")}
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
