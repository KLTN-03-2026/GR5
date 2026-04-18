"use client";

import React, { useState } from "react";
import { Camera, Save, Bell, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { updateProfile } from "@/app/actions/profile";
import toast from "react-hot-toast";

export default function ProfileForm({ user }: { user: any }) {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    const res = await updateProfile(formData);
    if (res?.success) toast.success(res.success);
    else if (res?.error) toast.error(res.error);
    setIsPending(false);
  }

  return (
    <div className="w-full font-be-vietnam animate-in fade-in duration-500">
      {/* Tiêu đề trang */}
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-[#007A33] tracking-tighter uppercase italic">
            Hồ sơ cá nhân
          </h2>
          <p className="text-slate-400 font-bold text-sm italic mt-1">
            Cập nhật thông tin tài khoản để bảo mật và nhận ưu đãi
          </p>
        </div>
        <button className="bg-white p-2.5 rounded-xl text-[#007A33] shadow-sm border border-emerald-50 hover:bg-emerald-50 transition-all">
          <Bell size={20} />
        </button>
      </header>

      {/* Card nội dung chính */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-emerald-50"
      >
        {/* Khu vực Avatar */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 pb-10 border-b border-slate-50">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[2rem] bg-[#007A33] flex items-center justify-center text-4xl text-white font-black shadow-lg shadow-emerald-900/20">
              {user?.ho_ten?.[0] || user?.email?.[0].toUpperCase()}
            </div>
            <label className="absolute -bottom-1 -right-1 bg-white p-2 rounded-xl shadow-md border border-emerald-50 text-[#007A33] cursor-pointer hover:scale-110 transition-all">
              <Camera size={16} />
              <input type="file" className="hidden" />
            </label>
          </div>
          <div className="text-center md:text-left space-y-3">
            <h3 className="text-lg font-black text-slate-800">Ảnh đại diện</h3>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-[#007A33] text-white rounded-xl text-xs font-black shadow-md hover:bg-black transition-all">
                Đổi ảnh mới
              </button>
              <button className="px-5 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-xs font-black hover:bg-red-50 hover:text-red-500 transition-all">
                Xóa ảnh
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-widest">
              JPG, PNG hoặc GIF. Tối đa 2MB.
            </p>
          </div>
        </div>

        {/* Form nhập liệu */}
        <form action={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {/* Họ và tên */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Họ và tên
              </label>
              <input
                name="ho_ten"
                defaultValue={user?.ho_ten || ""}
                placeholder="Nhập họ tên của Phú..."
                className="w-full bg-slate-50/50 border-2 border-transparent focus:border-[#007A33]/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-2 opacity-60">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Email (Cố định)
              </label>
              <input
                value={user?.email || ""}
                readOnly
                className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-400 cursor-not-allowed"
              />
            </div>

            {/* Số điện thoại */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Số điện thoại
              </label>
              <input
                name="so_dien_thoai"
                defaultValue={user?.so_dien_thoai || ""}
                placeholder="09xx xxx xxx"
                className="w-full bg-slate-50/50 border-2 border-transparent focus:border-[#007A33]/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none transition-all"
              />
            </div>

            {/* Ngày sinh */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Ngày sinh
              </label>
              <input
                type="date"
                name="ngay_sinh"
                className="w-full bg-slate-50/50 border-2 border-transparent focus:border-[#007A33]/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none transition-all"
              />
            </div>

            {/* Giới tính */}
            <div className="md:col-span-2 space-y-4 pt-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Giới tính
              </span>
              <div className="flex gap-10">
                {["Nam", "Nữ", "Khác"].map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="gioi_tinh"
                      value={option}
                      className="peer hidden"
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 peer-checked:border-[#007A33] peer-checked:bg-[#007A33] flex items-center justify-center transition-all">
                      <div className="w-1.5 h-1.5 rounded-full bg-white scale-0 peer-checked:scale-100 transition-all" />
                    </div>
                    <span className="text-sm font-bold text-slate-500 group-hover:text-[#007A33] transition-colors">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Nút lưu thay đổi */}
          <div className="pt-8 flex justify-end">
            <button
              disabled={isPending}
              type="submit"
              className="px-12 py-4 bg-[#007A33] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/10 hover:bg-black active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 italic"
            >
              {isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
