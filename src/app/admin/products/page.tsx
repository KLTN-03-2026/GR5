"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  PackageSearch,
  X,
  Image as ImageIcon,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import Pagination from "@/components/ui/Pagination";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    ten_san_pham: "",
    ma_danh_muc: "",
    xuat_xu: "",
    mo_ta: "",
  });
  const [images, setImages] = useState<string[]>([""]);

  const [variations, setVariations] = useState<any[]>([
    {
      ma_sku: "",
      ten_bien_the: "",
      don_vi_tinh: "Kg",
      gia_goc: "",
      gia_ban: "",
    },
  ]);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null as number | null,
    name: "",
  });

  const fetchData = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(
          `/api/admin/products?page=${page}&limit=${limit}&search=${search}&t=${Date.now()}`,
        ),
        fetch("/api/admin/categories"),
      ]);
      if (prodRes.ok && catRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.data);
        setTotalPages(prodData.meta.totalPages || 1);
        setCurrentPage(prodData.meta.page);
        setCategories((await catRes.json()).data || (await catRes.json()));
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData(currentPage, searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [currentPage, searchTerm]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ ten_san_pham: "", ma_danh_muc: "", xuat_xu: "", mo_ta: "" });
    setVariations([
      {
        ma_sku: "",
        ten_bien_the: "",
        don_vi_tinh: "Kg",
        gia_goc: "",
        gia_ban: "",
      },
    ]);
    setImages([""]);
    setIsAddModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingId(product.id);
    setFormData({
      ten_san_pham: product.ten_san_pham,
      ma_danh_muc: product.ma_danh_muc?.toString() || "",
      xuat_xu: product.xuat_xu || "",
      mo_ta: product.mo_ta || "",
    });
    setImages(
      product.anh_san_pham?.length > 0
        ? product.anh_san_pham.map((a: any) => a.duong_dan_anh)
        : [""],
    );
    setVariations(
      product.bien_the_san_pham?.length > 0
        ? product.bien_the_san_pham
        : [
            {
              ma_sku: "",
              ten_bien_the: "",
              don_vi_tinh: "Kg",
              gia_goc: "",
              gia_ban: "",
            },
          ],
    );
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ten_san_pham.trim()) {
      toast.error("Vui lòng nhập Tên sản phẩm!");
      return;
    }
    if (!formData.ma_danh_muc) {
      toast.error("Vui lòng chọn Danh mục cho sản phẩm!");
      return;
    }
    const isVariantInvalid = variations.some(
      (v) => !v.don_vi_tinh.trim() || !v.gia_ban,
    );
    if (isVariantInvalid) {
      toast.error("Vui lòng nhập đầy đủ Đơn vị tính và Giá bán cho phân loại!");
      return;
    }

    const url = editingId
      ? `/api/admin/products/${editingId}`
      : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";
    const validImages = images.filter((img) => img.trim() !== "");

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          bien_the: variations,
          anh_san_pham: validImages,
        }),
      });
      if (res.ok) {
        toast.success(editingId ? "Cập nhật thành công!" : "Thêm thành công!");
        setIsAddModalOpen(false);
        fetchData(currentPage, searchTerm);
      } else {
        toast.error("Có lỗi xảy ra khi lưu!");
      }
    } catch (error) {
      toast.error("Lỗi Server!");
    }
  };

  const executeDelete = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`/api/admin/products/${deleteModal.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Đã xóa sản phẩm!");
        setDeleteModal({ isOpen: false, id: null, name: "" });
        if (products.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchData(currentPage, searchTerm);
        }
      } else {
        toast.error("Không thể xóa sản phẩm này!");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống!");
    }
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-10">
      <Toaster />
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#006b2c]/10 rounded-2xl flex justify-center items-center text-[#006b2c]">
            <PackageSearch className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black uppercase">Kho Sản Phẩm</h2>
        </div>
        <button
          onClick={openAddModal}
          className="flex gap-2 bg-[#006b2c] text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all"
        >
          <Plus className="w-5 h-5" /> Thêm Mới
        </button>
      </div>

      <div className="bg-white p-3 rounded-2xl flex gap-4 border shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-gray-50/50 rounded-xl py-3 pl-12 outline-none font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border min-h-[450px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006b2c]"></div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 border-b">
                  <tr>
                    <th className="px-6 py-5 font-bold text-gray-500 text-xs uppercase">
                      Ảnh
                    </th>
                    <th className="px-6 py-5 font-bold text-gray-500 text-xs uppercase">
                      Sản Phẩm
                    </th>
                    <th className="px-6 py-5 font-bold text-gray-500 text-xs uppercase">
                      Giá
                    </th>
                    <th className="px-6 py-5 font-bold text-gray-500 text-xs uppercase text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.length > 0 ? (
                    products.map((p) => (
                      <tr key={p.id} className="hover:bg-emerald-50/20">
                        <td className="px-6 py-4">
                          {p.anh_san_pham?.[0]?.duong_dan_anh ? (
                            <img
                              src={p.anh_san_pham[0].duong_dan_anh}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold">{p.ten_san_pham}</p>
                          <span className="text-[11px] font-bold bg-emerald-50 text-emerald-600 px-2 rounded mt-1 inline-block">
                            {p.danh_muc?.ten_danh_muc || "---"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            {p.bien_the_san_pham?.map((bt: any) => (
                              <div
                                key={bt.id}
                                className="text-xs flex items-center gap-3"
                              >
                                <span className="text-gray-500 capitalize">
                                  {bt.don_vi_tinh || "Mặc định"}{" "}
                                  {bt.ten_bien_the
                                    ? `- ${bt.ten_bien_the}`
                                    : ""}
                                </span>
                                <span className="font-bold text-[#006b2c]">
                                  {Number(bt.gia_ban).toLocaleString()}đ
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                id: p.id,
                                name: p.ten_san_pham,
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
                        colSpan={4}
                        className="text-center py-16 text-gray-500"
                      >
                        Chưa có sản phẩm.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ĐÃ CẬP NHẬT PHÂN TRANG THEO YÊU CẦU CỦA SẾP */}
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* --- CÁC MODAL XÓA, THÊM SỬA BÊN DƯỚI GIỮ NGUYÊN CODE CỦA SẾP NHA --- */}
      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center cursor-pointer"
          onClick={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white max-w-sm w-full rounded-3xl p-6 text-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="font-black text-xl mb-2">Xác nhận xóa</h3>
            <p className="text-gray-500 text-sm mb-6">
              Xóa sản phẩm "{deleteModal.name}"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setDeleteModal({ isOpen: false, id: null, name: "" })
                }
                className="flex-1 py-3 bg-gray-100 font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 py-8 cursor-pointer"
          onClick={() => setIsAddModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white max-w-2xl w-full rounded-[2rem] p-8 max-h-full overflow-y-auto cursor-default custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-2xl font-black">
                {editingId ? "Sửa Sản Phẩm" : "Nhập Hàng Mới"}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 bg-gray-50 rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    name="ten_san_pham"
                    value={formData.ten_san_pham}
                    onChange={handleInputChange}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#006b2c] outline-none font-semibold text-gray-800"
                    placeholder="VD: Gạo ST25"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Thuộc Danh mục *
                  </label>
                  <select
                    name="ma_danh_muc"
                    value={formData.ma_danh_muc}
                    onChange={handleInputChange}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#006b2c] outline-none font-semibold text-gray-700"
                  >
                    <option value="">-- Chọn --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.ten_danh_muc}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Xuất xứ
                  </label>
                  <input
                    type="text"
                    name="xuat_xu"
                    value={formData.xuat_xu}
                    onChange={handleInputChange}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#006b2c] outline-none font-semibold text-gray-800"
                    placeholder="VD: Việt Nam"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Mô tả sản phẩm
                  </label>
                  <textarea
                    name="mo_ta"
                    value={formData.mo_ta}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#006b2c] outline-none font-medium text-gray-800"
                    placeholder="Viết vài dòng giới thiệu về mặt hàng này..."
                  ></textarea>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Phân loại & Giá bán
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setVariations([
                        ...variations,
                        {
                          ma_sku: "",
                          ten_bien_the: "",
                          don_vi_tinh: "Kg",
                          gia_goc: "",
                          gia_ban: "",
                        },
                      ])
                    }
                    className="text-xs font-bold text-[#006b2c] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100"
                  >
                    + Thêm mức giá
                  </button>
                </div>

                <div className="flex gap-2 px-3 pb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <div className="flex-1 grid grid-cols-5 gap-2">
                    <span>Mã SKU</span>
                    <span>ĐVT (Kg/Túi) *</span>
                    <span>Cụ thể</span>
                    <span>Giá nhập (VNĐ)</span>
                    <span className="text-rose-500">Giá bán (VNĐ) *</span>
                  </div>
                  {variations.length > 1 && <div className="w-8"></div>}
                </div>

                <div className="space-y-3">
                  {variations.map((v, index) => (
                    <div
                      key={index}
                      className="flex gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 items-center transition-all hover:border-emerald-300 hover:shadow-sm"
                    >
                      <div className="flex-1 grid grid-cols-5 gap-2">
                        <input
                          type="text"
                          value={v.ma_sku ?? ""}
                          onChange={(e) => {
                            const newV = [...variations];
                            newV[index].ma_sku = e.target.value;
                            setVariations(newV);
                          }}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-[#006b2c] focus:ring-2 focus:ring-emerald-50"
                          placeholder="Tự sinh nếu trống"
                        />
                        <input
                          type="text"
                          value={v.don_vi_tinh ?? ""}
                          onChange={(e) => {
                            const newV = [...variations];
                            newV[index].don_vi_tinh = e.target.value;
                            setVariations(newV);
                          }}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-[#006b2c]"
                          placeholder="VD: Kg"
                        />
                        <input
                          type="text"
                          value={v.ten_bien_the ?? ""}
                          onChange={(e) => {
                            const newV = [...variations];
                            newV[index].ten_bien_the = e.target.value;
                            setVariations(newV);
                          }}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-[#006b2c]"
                          placeholder="VD: 5 kg"
                        />
                        <input
                          type="number"
                          value={v.gia_goc ?? ""}
                          onChange={(e) => {
                            const newV = [...variations];
                            newV[index].gia_goc = e.target.value;
                            setVariations(newV);
                          }}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-[#006b2c]"
                          placeholder="0"
                        />
                        <input
                          type="number"
                          value={v.gia_ban ?? ""}
                          onChange={(e) => {
                            const newV = [...variations];
                            newV[index].gia_ban = e.target.value;
                            setVariations(newV);
                          }}
                          className="w-full border-2 border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-50 rounded-lg px-3 py-2 text-sm font-bold text-rose-600 outline-none bg-white"
                          placeholder="0"
                        />
                      </div>
                      {variations.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setVariations(
                              variations.filter((_, i) => i !== index),
                            )
                          }
                          className="p-2 bg-white border border-gray-200 text-gray-400 rounded-lg hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Hình Ảnh
                  </label>
                  <button
                    type="button"
                    onClick={() => setImages([...images, ""])}
                    className="text-xs font-bold text-[#006b2c]"
                  >
                    + Thêm link/ảnh
                  </button>
                </div>
                <div className="space-y-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 items-center bg-gray-50 p-2 rounded-xl border border-gray-200"
                    >
                      <div className="relative w-10 h-10 flex-shrink-0 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 cursor-pointer overflow-hidden">
                        <ImageIcon className="w-5 h-5 text-gray-500" />
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const toastId = toast.loading("Đang tải lên...");
                            const formData = new FormData();
                            formData.append("file", file);
                            try {
                              const res = await fetch("/api/admin/upload", {
                                method: "POST",
                                body: formData,
                              });
                              if (res.ok) {
                                const newImages = [...images];
                                newImages[idx] = (await res.json()).url;
                                setImages(newImages);
                                toast.success("Xong!", { id: toastId });
                              } else throw new Error();
                            } catch {
                              toast.error("Lỗi tải ảnh!", { id: toastId });
                            }
                          }}
                        />
                      </div>
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => {
                          const newI = [...images];
                          newI[idx] = e.target.value;
                          setImages(newI);
                        }}
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                        placeholder="Hoặc dán URL ảnh vào đây"
                      />
                      {img && (
                        <img
                          src={img}
                          className="w-10 h-10 rounded-md object-cover border"
                        />
                      )}
                      {images.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setImages(images.filter((_, i) => i !== idx))
                          }
                          className="p-2 text-gray-400 hover:text-rose-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex gap-3 sticky bottom-0 bg-white border-t border-gray-100 mt-6 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#006b2c] text-white font-bold py-3.5 rounded-xl hover:bg-emerald-800 shadow-md"
                >
                  {editingId ? "Lưu Thay Đổi" : "Nhập Kho"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
