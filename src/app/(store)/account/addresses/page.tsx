"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Edit2, Trash2, Plus, Loader2, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface Address {
  id: number;
  chi_tiet_dia_chi: string;
  la_mac_dinh: boolean;
}

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAddr, setEditAddr] = useState<Address | null>(null);
  const [inputVal, setInputVal] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/store/account/addresses");
      const data = await res.json();
      setAddresses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAdd = () => {
    setEditAddr(null);
    setInputVal("");
    setShowModal(true);
  };

  const openEdit = (addr: Address) => {
    setEditAddr(addr);
    setInputVal(addr.chi_tiet_dia_chi || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!inputVal.trim()) {
      toast.error("Vui lòng nhập địa chỉ!");
      return;
    }
    setSaving(true);
    try {
      if (editAddr) {
        // Cập nhật
        const res = await fetch("/api/store/account/addresses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editAddr.id,
            action: "update",
            chi_tiet_dia_chi: inputVal,
          }),
        });
        if (res.ok) toast.success("Đã cập nhật địa chỉ!");
      } else {
        // Thêm mới
        const res = await fetch("/api/store/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chi_tiet_dia_chi: inputVal }),
        });
        if (res.ok) toast.success("Đã thêm địa chỉ mới!");
      }
      setShowModal(false);
      fetchAddresses();
    } catch {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    const res = await fetch("/api/store/account/addresses", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "set-default" }),
    });
    if (res.ok) {
      toast.success("Đã đổi địa chỉ mặc định!");
      fetchAddresses();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa địa chỉ này?")) return;
    const res = await fetch("/api/store/account/addresses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Đã xóa địa chỉ!");
      fetchAddresses();
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">
            Địa chỉ giao hàng
          </h2>
          <p className="text-slate-500 max-w-lg leading-relaxed text-sm font-medium">
            Quản lý các địa điểm nhận hàng của bạn để trải nghiệm mua sắm nông
            sản tươi sạch thuận tiện hơn.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#007A33] text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl hover:bg-black transition-all whitespace-nowrap"
        >
          <Plus size={20} /> Thêm địa chỉ mới
        </button>
      </header>

      {/* Danh sách */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#007A33]" size={40} />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <MapPin size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-bold">Chưa có địa chỉ nào</p>
          <p className="text-sm mt-1">Thêm địa chỉ để bắt đầu mua sắm!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {addresses.map((addr) => (
            <motion.div
              key={addr.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:border-[#007A33]/30 transition-all relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#007A33]">
                  <MapPin size={24} />
                </div>
                {addr.la_mac_dinh && (
                  <span className="bg-[#E9F5EE] text-[#007A33] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    Mặc định
                  </span>
                )}
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-8 min-h-[48px] font-medium">
                {addr.chi_tiet_dia_chi || "Chưa có thông tin địa chỉ"}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                {!addr.la_mac_dinh ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[#007A33] border border-emerald-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#007A33] hover:text-white transition-all"
                  >
                    Đặt làm mặc định
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => openEdit(addr)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-[#007A33] transition-colors text-xs font-bold uppercase"
                  >
                    <Edit2 size={16} /> Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="flex items-center gap-1.5 text-red-400 hover:text-red-600 transition-colors text-xs font-bold uppercase"
                  >
                    <Trash2 size={16} /> Xoá
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Banner */}
      <div className="rounded-[40px] overflow-hidden bg-[#007A33] relative h-[250px] flex items-center p-12 mb-16 shadow-2xl shadow-emerald-900/10">
        <div className="relative z-10 max-w-md text-white">
          <h3 className="text-3xl font-black mb-4">
            Bạn có địa chỉ nhận hàng mới?
          </h3>
          <p className="text-emerald-50/80 text-sm mb-8 font-medium">
            Thêm địa chỉ văn phòng hoặc nhà người thân để việc nhận nông sản
            sạch trở nên linh hoạt hơn.
          </p>
          <button
            onClick={openAdd}
            className="bg-white text-[#007A33] px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all"
          >
            Thêm ngay
          </button>
        </div>
      </div>

      {/* Stats */}
      <footer className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-slate-100">
        <StatBox
          label="Đã lưu"
          value={addresses.length.toString().padStart(2, "0")}
        />
        <StatBox label="Thành phố" value="01" />
        <StatBox label="Giao gần nhất" value="Hôm qua" isSmall />
        <StatBox label="Điểm tin cậy" value="+150" />
      </footer>

      {/* Modal thêm/sửa */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">
                  {editAddr ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700">
                  Địa chỉ chi tiết
                </label>
                <textarea
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ví dụ: 123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                  rows={4}
                  className="w-full bg-[#E9F5EE] border-none rounded-xl px-5 py-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 ring-[#007A33]/20 transition-all resize-none"
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-4 rounded-xl bg-[#007A33] text-white font-bold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {editAddr ? "Cập nhật" : "Lưu địa chỉ"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBox({
  label,
  value,
  isSmall,
}: {
  label: string;
  value: string;
  isSmall?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
        {label}
      </p>
      <p
        className={`${isSmall ? "text-2xl mt-2" : "text-4xl"} font-black text-[#007A33]`}
      >
        {value}
      </p>
    </div>
  );
}
