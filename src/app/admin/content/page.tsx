"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Image as ImageIcon,
  Eye,
  EyeOff,
  AlertTriangle,
  GripVertical,
  CheckCircle2,
  Link as LinkIcon,
  Filter,
  ChevronRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ContentPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    tieu_de: "",
    duong_dan_anh: "",
    thu_tu_sap_xep: "0",
    dang_hoat_dong: true,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null as number | null,
    name: "",
  });

  const fetchContents = async () => {
    setIsLoading(true);
    try {
      // ĐÃ SỬA THÀNH CONTENT
      const res = await fetch(`/api/admin/content?t=${Date.now()}`);
      if (res.ok) setContents(await res.json());
    } catch (error) {
      toast.error("Lỗi lấy dữ liệu!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      tieu_de: "",
      duong_dan_anh: "",
      thu_tu_sap_xep: "0",
      dang_hoat_dong: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setFormData({
      tieu_de: item.tieu_de || "",
      duong_dan_anh: item.duong_dan_anh || "",
      thu_tu_sap_xep: item.thu_tu_sap_xep?.toString() || "0",
      dang_hoat_dong: item.dang_hoat_dong,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.duong_dan_anh.trim()) {
      toast.error("Vui lòng tải lên hoặc nhập link hình ảnh!");
      return;
    }

    const payload = {
      tieu_de: formData.tieu_de,
      duong_dan_anh: formData.duong_dan_anh,
      thu_tu_sap_xep: parseInt(formData.thu_tu_sap_xep?.toString()) || 0,
      dang_hoat_dong: Boolean(formData.dang_hoat_dong),
    };

    // ĐÃ SỬA THÀNH CONTENT
    const url = editingId
      ? `/api/admin/content/${editingId}`
      : "/api/admin/content";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          editingId ? "Cập nhật thành công!" : "Thêm mới thành công!",
        );
        setIsModalOpen(false);
        fetchContents();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Lỗi lưu Database!");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống!");
    }
  };

  const executeDelete = async () => {
    if (!deleteModal.id) return;
    try {
      // ĐÃ SỬA THÀNH CONTENT
      const res = await fetch(`/api/admin/content/${deleteModal.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Đã xóa nội dung!");
        setDeleteModal({ isOpen: false, id: null, name: "" });
        fetchContents();
      } else toast.error("Không thể xóa!");
    } catch (error) {
      toast.error("Lỗi kết nối!");
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      // ĐÃ SỬA THÀNH CONTENT
      const res = await fetch(`/api/admin/content/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dang_hoat_dong: !currentStatus }),
      });
      if (res.ok) {
        fetchContents();
        toast.success(!currentStatus ? "Đã BẬT hiển thị" : "Đã TẮT hiển thị");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống!");
    }
  };

  const activeCount = contents.filter((c) => c.dang_hoat_dong).length;

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto font-sans pb-10">
      <Toaster />
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center text-sm font-bold text-gray-500 mb-2 gap-2">
            <span>Trang chủ</span> <ChevronRight className="w-4 h-4" />{" "}
            <span className="text-[#006b2c]">Cấu hình Banner</span>
          </div>
          <h1 className="text-4xl font-black italic text-gray-900 uppercase tracking-tight">
            QUẢN LÝ BANNER
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            Sắp xếp, cập nhật các chương trình khuyến mãi nông sản tại trang
            chủ.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#006b2c] hover:bg-emerald-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all"
        >
          <Plus className="w-5 h-5" /> Thêm Banner mới
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-gray-100 rounded-xl mb-4"></div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            TỔNG BANNER
          </h3>
          <p className="text-3xl font-black text-gray-900">{contents.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl mb-4"></div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            ĐANG HIỂN THỊ
          </h3>
          <p className="text-3xl font-black text-emerald-600">{activeCount}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-blue-50 rounded-xl mb-4"></div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            TỶ LỆ CLICK (Mẫu)
          </h3>
          <p className="text-3xl font-black text-gray-900">3.4%</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-xl mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            TRẠNG THÁI
          </h3>
          <p className="text-2xl font-black text-gray-900">Ổn định</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black italic uppercase text-gray-900">
            DANH SÁCH HIỂN THỊ
          </h2>
          <button className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006b2c]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {contents.length > 0 ? (
              contents.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-6 p-4 rounded-2xl border transition-all hover:shadow-sm ${item.dang_hoat_dong ? "border-emerald-100 bg-white" : "border-gray-100 bg-gray-50/50 opacity-70"}`}
                >
                  <div className="text-gray-300 cursor-grab hover:text-emerald-600 transition-colors">
                    <GripVertical className="w-6 h-6" />
                  </div>

                  <div className="w-48 h-24 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 relative">
                    <img
                      src={item.duong_dan_anh}
                      className="w-full h-full object-cover"
                      alt="Banner"
                    />
                    {!item.dang_hoat_dong && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center font-bold text-white text-xs tracking-widest">
                        ĐÃ TẮT
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {item.tieu_de || "Nội dung không tên"}
                    </h3>
                    <div className="flex items-center text-sm font-medium text-emerald-600 gap-4">
                      <span className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <LinkIcon className="w-3 h-3" /> /khuyen-mai
                      </span>
                      <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md text-xs font-bold">
                        Thứ tự: {item.thu_tu_sap_xep}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(item.id, item.dang_hoat_dong)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${item.dang_hoat_dong ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
                      title={
                        item.dang_hoat_dong ? "Tắt hiển thị" : "Bật hiển thị"
                      }
                    >
                      {item.dang_hoat_dong ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-100 transition-all"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          id: item.id,
                          name: item.tieu_de,
                        })
                      }
                      className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                <ImageIcon className="w-10 h-10 opacity-20" /> Chưa có nội dung
                nào.
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 cursor-pointer backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white max-w-lg w-full rounded-[2rem] p-8 cursor-default shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black uppercase italic text-[#006b2c]">
                {editingId ? "Sửa Nội Dung" : "Thêm Nội Dung Mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-gray-50 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6" noValidate>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Tên nội dung
                </label>
                <input
                  type="text"
                  name="tieu_de"
                  value={formData.tieu_de}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-[#006b2c] focus:ring-4 focus:ring-emerald-50 outline-none font-bold text-gray-800 transition-all"
                  placeholder="VD: Khuyến mãi Mùa Gặt..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Hình ảnh *
                </label>
                <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-xl border border-gray-200">
                  <div className="relative w-12 h-12 flex-shrink-0 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 cursor-pointer overflow-hidden transition-colors">
                    <ImageIcon className="w-5 h-5 text-gray-500" />
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const toastId = toast.loading("Đang tải ảnh...");
                        const fd = new FormData();
                        fd.append("file", file);
                        try {
                          const res = await fetch("/api/admin/upload", {
                            method: "POST",
                            body: fd,
                          });
                          if (res.ok) {
                            setFormData({
                              ...formData,
                              duong_dan_anh: (await res.json()).url,
                            });
                            toast.success("Tải ảnh xong!", { id: toastId });
                          } else throw new Error();
                        } catch {
                          toast.error("Lỗi tải ảnh!", { id: toastId });
                        }
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    name="duong_dan_anh"
                    value={formData.duong_dan_anh}
                    onChange={handleInputChange}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none text-gray-600 focus:border-[#006b2c] transition-colors"
                    placeholder="Hoặc dán URL ảnh vào đây"
                  />
                </div>
                {formData.duong_dan_anh && (
                  <motion.img
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    src={formData.duong_dan_anh}
                    className="mt-3 w-full h-40 object-cover rounded-xl border shadow-sm"
                    alt="Preview"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    name="thu_tu_sap_xep"
                    value={formData.thu_tu_sap_xep}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#006b2c] outline-none font-bold text-gray-800 transition-all text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Trạng thái
                  </label>
                  <div className="flex items-center h-[52px] px-4 border-2 border-gray-200 bg-white rounded-xl transition-all hover:border-[#006b2c]">
                    <label className="relative inline-flex items-center cursor-pointer w-full justify-between">
                      <span
                        className={`text-sm font-bold ${formData.dang_hoat_dong ? "text-[#006b2c]" : "text-gray-400"}`}
                      >
                        {formData.dang_hoat_dong ? "Đang Bật" : "Đã Tắt"}
                      </span>
                      <input
                        type="checkbox"
                        name="dang_hoat_dong"
                        checked={formData.dang_hoat_dong}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[22px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006b2c]"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 font-bold py-4 rounded-xl hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#006b2c] text-white font-bold py-4 rounded-xl hover:bg-emerald-800 shadow-xl shadow-emerald-900/20 transition-all tracking-wide"
                >
                  LƯU LẠI
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center cursor-pointer p-4"
          onClick={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
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
              Cảnh báo Xóa
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Bạn có chắc chắn muốn xóa nội dung{" "}
              <strong className="text-gray-800">
                {deleteModal.name || "này"}
              </strong>{" "}
              vĩnh viễn?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setDeleteModal({ isOpen: false, id: null, name: "" })
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
