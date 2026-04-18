"use client";

import React, { useEffect, useState } from "react";
import {
  MapPin,
  Home,
  Briefcase,
  Edit2,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
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

  const handleSetDefault = async (id: number) => {
    const res = await fetch("/api/addresses", {
      method: "PUT",
      body: JSON.stringify({ id, action: "set-default" }),
    });
    if (res.ok) {
      toast.success("Đã đổi địa chỉ mặc định!");
      fetchAddresses();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa địa chỉ này nhé Phú?")) return;
    const res = await fetch("/api/addresses", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.error("Đã xóa địa chỉ");
      fetchAddresses();
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full font-be-vietnam animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter mb-2 uppercase italic">
            Địa chỉ giao hàng
          </h2>
          <p className="text-slate-500 max-w-lg leading-relaxed text-sm italic font-medium">
            Quản lý các địa điểm nhận hàng của Phú để mua sắm nông sản thuận
            tiện hơn.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#007A33] text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl hover:bg-black transition-all">
          <Plus size={20} /> Thêm địa chỉ mới
        </button>
      </header>

      {/* Danh sách địa chỉ */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#007A33]" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {addresses.map((addr: any) => (
            <motion.div
              key={addr.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:border-[#007A33]/30 transition-all group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#007A33]">
                    <MapPin size={24} />
                  </div>
                  {addr.la_mac_dinh && (
                    <span className="bg-[#E9F5EE] text-[#007A33] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest italic">
                      Mặc định
                    </span>
                  )}
                </div>

                {/* Vì model ko có ho_ten, mình tạm hiện ID hoặc Text cứng */}
                <h3 className="font-black text-lg text-slate-800 mb-1">
                  Địa chỉ #{addr.id}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-8 h-12 line-clamp-2 italic font-medium">
                  {addr.chi_tiet_dia_chi || "Chưa có thông tin địa chỉ"}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  {!addr.la_mac_dinh ? (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[#007A33] border border-emerald-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#007A33] hover:text-white transition-all"
                    >
                      Đặt mặc định
                    </button>
                  ) : (
                    <div />
                  )}
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-slate-400 hover:text-[#007A33] transition-colors text-xs font-bold uppercase">
                      <Edit2 size={16} /> Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="flex items-center gap-1.5 text-red-400 hover:text-red-600 transition-colors text-xs font-bold uppercase"
                    >
                      <Trash2 size={16} /> Xoá
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Banner & Stats (Giữ nguyên như thiết kế cũ Phú chọn) */}
      <div className="rounded-[40px] overflow-hidden bg-[#007A33] relative h-[250px] flex items-center p-12 mb-16 shadow-2xl shadow-emerald-900/10">
        <div className="relative z-10 max-w-md text-white">
          <h3 className="text-3xl font-black mb-4 italic">Giao hàng tận nơi</h3>
          <p className="text-emerald-50/80 text-sm mb-8 font-medium italic">
            Thêm địa chỉ để chúng mình giao nông sản tươi sạch đến tận tay Phú.
          </p>
          <button className="bg-white text-[#007A33] px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all">
            Thêm ngay
          </button>
        </div>
      </div>

      <footer className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-slate-100">
        <StatBox
          label="Đã lưu"
          value={addresses.length.toString().padStart(2, "0")}
        />
        <StatBox label="Thành phố" value="01" />
        <StatBox label="Giao gần nhất" value="Hôm qua" isSmall />
        <StatBox label="Điểm tin cậy" value="+150" />
      </footer>
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
