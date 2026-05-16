"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Check,
  Loader2,
} from "lucide-react";

interface NccProduct {
  id: number;
  ma_san_pham: number;
  gia_nhap_gan_nhat?: number;
  don_vi_tinh?: string;
  so_luong_toi_thieu?: number;
  thoi_gian_giao_hang_ngay?: number;
  ghi_chu?: string;
  ngay_cap_nhat_gia?: string;
  san_pham: { id: number; ten_san_pham: string };
}

interface SearchResult {
  id: number;
  ten_san_pham: string;
}

interface ProductForm {
  ma_san_pham: number | null;
  ten_san_pham: string;
  don_vi_tinh: string;
  gia_nhap_gan_nhat: number | string;
  so_luong_toi_thieu: number | string;
  thoi_gian_giao_hang_ngay: number | string;
  ghi_chu: string;
}

const defaultForm: ProductForm = {
  ma_san_pham: null,
  ten_san_pham: "",
  don_vi_tinh: "",
  gia_nhap_gan_nhat: "",
  so_luong_toi_thieu: "",
  thoi_gian_giao_hang_ngay: "",
  ghi_chu: "",
};

export default function SupplierProductsTab({ nccId }: { nccId: number }) {
  const [products, setProducts] = useState<NccProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<ProductForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ProductForm>(defaultForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/ncc/${nccId}/san-pham`);
      const data = await res.json();
      setProducts(data.ncc_san_pham ?? data ?? []);
    } catch (err) {
      console.error("Loi khi tai danh sach san pham NCC:", err);
    } finally {
      setLoading(false);
    }
  }, [nccId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced product search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await fetch(
          `/api/admin/ncc/${nccId}/san-pham/search?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        setSearchResults(data ?? []);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error("Loi khi tim kiem san pham:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, nccId]);

  // Add product
  const handleAdd = async () => {
    setFormError("");
    if (!addForm.ma_san_pham) {
      setFormError("Vui lòng chọn sản phẩm từ danh sách gợi ý bên dưới");
      return;
    }
    if (!addForm.don_vi_tinh.trim()) {
      setFormError("Vui lòng nhập đơn vị tính");
      return;
    }
    if (!addForm.gia_nhap_gan_nhat || Number(addForm.gia_nhap_gan_nhat) <= 0) {
      setFormError("Giá nhập phải lớn hơn 0");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/ncc/${nccId}/san-pham`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ma_san_pham: addForm.ma_san_pham,
          gia_nhap_gan_nhat: Number(addForm.gia_nhap_gan_nhat),
          don_vi_tinh: addForm.don_vi_tinh.trim(),
          so_luong_toi_thieu: Number(addForm.so_luong_toi_thieu) || 1,
          thoi_gian_giao_hang_ngay: Number(addForm.thoi_gian_giao_hang_ngay) || 1,
          ghi_chu: addForm.ghi_chu,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setFormError(err?.error || "Không thể thêm sản phẩm. Có thể sản phẩm đã được liên kết.");
        return;
      }
      setShowAddForm(false);
      setAddForm(defaultForm);
      setSearchQuery("");
      setSearchResults([]);
      setFormError("");
      await fetchProducts();
    } catch (err) {
      setFormError("Lỗi kết nối server");
    } finally {
      setSaving(false);
    }
  };

  // Edit product
  const startEdit = (product: NccProduct) => {
    setEditingId(product.id);
    setEditForm({
      ma_san_pham: product.ma_san_pham,
      ten_san_pham: product.san_pham.ten_san_pham,
      don_vi_tinh: product.don_vi_tinh ?? "",
      gia_nhap_gan_nhat: product.gia_nhap_gan_nhat ?? "",
      so_luong_toi_thieu: product.so_luong_toi_thieu ?? "",
      thoi_gian_giao_hang_ngay: product.thoi_gian_giao_hang_ngay ?? "",
      ghi_chu: product.ghi_chu ?? "",
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const gia = Number(editForm.gia_nhap_gan_nhat);
    const moq = Number(editForm.so_luong_toi_thieu);
    const thoiGian = Number(editForm.thoi_gian_giao_hang_ngay);
    if (gia < 0 || moq < 0 || thoiGian < 0) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/ncc/${nccId}/san-pham`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ncc_san_pham_id: editingId,
          gia_nhap_gan_nhat: Math.max(0, gia),
          don_vi_tinh: editForm.don_vi_tinh,
          so_luong_toi_thieu: Math.max(1, moq || 1),
          thoi_gian_giao_hang_ngay: Math.max(1, thoiGian || 1),
          ghi_chu: editForm.ghi_chu,
        }),
      });
      if (!res.ok) throw new Error("Failed to update product");
      setEditingId(null);
      await fetchProducts();
    } catch (err) {
      console.error("Loi khi cap nhat san pham:", err);
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/ncc/${nccId}/san-pham`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ncc_san_pham_id: deleteId }),
      });
      if (!res.ok) throw new Error("Failed to delete product");
      setDeleteId(null);
      await fetchProducts();
    } catch (err) {
      console.error("Loi khi xoa san pham:", err);
    } finally {
      setDeleting(false);
    }
  };

  const selectSearchProduct = (product: SearchResult) => {
    setAddForm((prev) => ({
      ...prev,
      ma_san_pham: product.id,
      ten_san_pham: product.ten_san_pham,
    }));
    setSearchQuery(product.ten_san_pham);
    setShowSearchDropdown(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-800">
          Sản phẩm NCC có thể cung cấp
        </h2>
        <button
          onClick={() => {
            setShowAddForm(true);
            setAddForm(defaultForm);
            setSearchQuery("");
            setFormError("");
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Liên kết sản phẩm
        </button>
      </div>

      {/* Add product form */}
      {showAddForm && (
        <div className="mb-5 p-4 border border-emerald-200 bg-emerald-50/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Liên kết sản phẩm có sẵn trong hệ thống
            </h3>
            <button
              onClick={() => { setShowAddForm(false); setFormError(""); }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>

          {formError && (
            <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Product search */}
            <div className="relative lg:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">
                Chọn sản phẩm <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setAddForm(prev => ({ ...prev, ma_san_pham: null, ten_san_pham: "" })); setFormError(""); }}
                  placeholder="Gõ tên sản phẩm rồi chọn từ danh sách gợi ý..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {searching && (
                  <Loader2
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
                  />
                )}
              </div>
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectSearchProduct(item)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      {item.ten_san_pham}
                    </button>
                  ))}
                </div>
              )}
              {showSearchDropdown && searchResults.length === 0 && !searching && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-400 text-center">
                  Không tìm thấy sản phẩm
                </div>
              )}
              {addForm.ma_san_pham && (
                <p className="mt-1 text-xs text-emerald-600">
                  Đã chọn: {addForm.ten_san_pham}
                </p>
              )}
            </div>

            {/* Don vi tinh */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Đơn vị tính <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addForm.don_vi_tinh}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, don_vi_tinh: e.target.value }))
                }
                placeholder="kg, bao, thùng..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Gia nhap */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Giá nhập (đ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={addForm.gia_nhap_gan_nhat}
                onChange={(e) => {
                  const v = e.target.value.replace(/^-/, '');
                  setAddForm((prev) => ({
                    ...prev,
                    gia_nhap_gan_nhat: v,
                  }));
                }}
                onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* MOQ */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                SL tối thiểu (MOQ)
              </label>
              <input
                type="number"
                min="1"
                value={addForm.so_luong_toi_thieu}
                onChange={(e) => {
                  const v = e.target.value.replace(/^-/, '');
                  setAddForm((prev) => ({
                    ...prev,
                    so_luong_toi_thieu: v,
                  }));
                }}
                onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                placeholder="1"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Thoi gian giao hang */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Thời gian giao (ngày)
              </label>
              <input
                type="number"
                min="1"
                value={addForm.thoi_gian_giao_hang_ngay}
                onChange={(e) => {
                  const v = e.target.value.replace(/^-/, '');
                  setAddForm((prev) => ({
                    ...prev,
                    thoi_gian_giao_hang_ngay: v,
                  }));
                }}
                onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                placeholder="1"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Ghi chu */}
            <div className="lg:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Ghi chú</label>
              <input
                type="text"
                value={addForm.ghi_chu}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, ghi_chu: e.target.value }))
                }
                placeholder="Ghi chú thêm..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end mt-3">
            <button
              onClick={handleAdd}
              disabled={!addForm.ma_san_pham || saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              Lưu sản phẩm
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-800 mb-2">
              Xác nhận xoá
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc muốn xoá sản phẩm này khỏi danh sách nhà cung cấp?
              Thao tác này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-lg transition-colors"
              >
                {deleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
          <Loader2 size={20} className="animate-spin" />
          <span>Đang tải...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Package size={36} className="mx-auto mb-2 opacity-30" />
          <p>Chưa có sản phẩm nào được liên kết với NCC này.</p>
          <p className="text-xs mt-1">
            Nhấn &quot;Liên kết sản phẩm&quot; để chọn sản phẩm có sẵn trong hệ thống.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Sản phẩm
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Đơn vị
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Giá nhập
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  MOQ
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Thời gian giao
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Cập nhật
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) =>
                editingId === p.id ? (
                  // Inline edit row
                  <tr key={p.id} className="bg-emerald-50/40">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {p.san_pham.ten_san_pham}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={editForm.don_vi_tinh}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            don_vi_tinh: e.target.value,
                          }))
                        }
                        className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        value={editForm.gia_nhap_gan_nhat}
                        onChange={(e) => {
                          const v = e.target.value.replace(/^-/, '');
                          setEditForm((prev) => ({
                            ...prev,
                            gia_nhap_gan_nhat: v,
                          }));
                        }}
                        onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                        className="w-28 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="1"
                        value={editForm.so_luong_toi_thieu}
                        onChange={(e) => {
                          const v = e.target.value.replace(/^-/, '');
                          setEditForm((prev) => ({
                            ...prev,
                            so_luong_toi_thieu: v,
                          }));
                        }}
                        onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                        className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="1"
                        value={editForm.thoi_gian_giao_hang_ngay}
                        onChange={(e) => {
                          const v = e.target.value.replace(/^-/, '');
                          setEditForm((prev) => ({
                            ...prev,
                            thoi_gian_giao_hang_ngay: v,
                          }));
                        }}
                        onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                        className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-400">
                      {p.ngay_cap_nhat_gia
                        ? new Date(p.ngay_cap_nhat_gia).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleUpdate}
                          disabled={saving}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-colors"
                          title="Lưu"
                        >
                          {saving ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                          title="Huỷ"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // Normal row
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {p.san_pham.ten_san_pham}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.don_vi_tinh ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {p.gia_nhap_gan_nhat ? (
                        <span className="font-bold text-blue-600">
                          {Number(p.gia_nhap_gan_nhat).toLocaleString("vi-VN")}đ
                        </span>
                      ) : (
                        <span className="text-gray-400">Chưa có</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.so_luong_toi_thieu ?? 1}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.thoi_gian_giao_hang_ngay ?? 1} ngày
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {p.ngay_cap_nhat_gia
                        ? new Date(p.ngay_cap_nhat_gia).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(p)}
                          className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Sửa"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Xoá"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
