"use client";

import React, { useState, useRef } from "react";
import { Camera, Save, Loader2, X } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import toast from "react-hot-toast";

export default function ProfileForm({ user }: { user: any }) {
  const [isPending, setIsPending] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.ho_so_nguoi_dung?.anh_dai_dien || null,
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [gioiTinh, setGioiTinh] = useState(
    user?.ho_so_nguoi_dung?.gioi_tinh || "Nam",
  );
  const [hoTenError, setHoTenError] = useState("");
  const [sdtError, setSdtError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh quá lớn! Tối đa 2MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleHoTenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/\d/.test(val)) {
      setHoTenError("Họ tên không được chứa số!");
    } else {
      setHoTenError("");
    }
  };

  const handleSdtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/[^0-9]/.test(val)) {
      setSdtError("Số điện thoại chỉ được nhập số!");
      e.target.value = val.replace(/[^0-9]/g, "");
    } else {
      setSdtError("");
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (hoTenError || sdtError) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }
    setIsPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("gioi_tinh", gioiTinh);
    if (avatarFile) formData.set("avatar", avatarFile);

    const res = await updateProfile(formData);
    if ("success" in res) {
      toast.success(res.success);
      if (res.anh_dai_dien) {
        window.dispatchEvent(
          new CustomEvent("update-avatar", { detail: res.anh_dai_dien }),
        );
      }
      window.dispatchEvent(
        new CustomEvent("update-name", { detail: formData.get("ho_ten") }),
      );
    } else {
      toast.error(res.error);
    }
    setIsPending(false);
  }

  const initials =
    user?.ho_so_nguoi_dung?.ho_ten?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        className="hidden"
        onChange={handleAvatarChange}
      />

      {/* Avatar */}
      <div className="flex items-center gap-10 mb-12">
        <div className="relative">
          <div className="w-28 h-28 rounded-2xl overflow-hidden bg-[#008A3D] flex items-center justify-center text-5xl text-white font-bold shadow-lg">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md border border-slate-100 text-[#008A3D] hover:bg-emerald-50 transition-colors"
          >
            <Camera size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-bold text-slate-800">Ảnh đại diện</h3>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-[#008A3D] text-white rounded-xl text-sm font-bold hover:bg-[#007031] transition-all"
            >
              Thay đổi ảnh đại diện
            </button>
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="px-6 py-3 bg-[#E2E8E2] text-slate-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-500 transition-all flex items-center gap-2"
              >
                <X size={14} /> Xóa ảnh
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Tối đa 2MB. Định dạng: JPG, PNG, GIF
          </p>
        </div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {/* Họ và tên */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 ml-1">
            Họ và tên
          </label>
          <input
            name="ho_ten"
            defaultValue={user?.ho_so_nguoi_dung?.ho_ten || ""}
            placeholder="Họ tên"
            onChange={handleHoTenChange}
            className={`w-full bg-[#E9F0E9] border-none rounded-xl px-6 py-4 text-base font-bold text-slate-700 outline-none focus:ring-2 transition-all ${hoTenError ? "ring-2 ring-red-400" : "ring-[#008A3D]/20"}`}
          />
          {hoTenError && (
            <p className="text-xs text-red-500 ml-1">{hoTenError}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
          <input
            value={user?.email || ""}
            readOnly
            className="w-full bg-[#E9F0E9] border-none rounded-xl px-6 py-4 text-base font-bold text-slate-500 cursor-not-allowed"
          />
        </div>

        {/* Số điện thoại */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 ml-1">
            Số điện thoại
          </label>
          <input
            name="so_dien_thoai"
            defaultValue={user?.ho_so_nguoi_dung?.so_dien_thoai || ""}
            placeholder="09xx xxx xxx"
            onChange={handleSdtChange}
            inputMode="numeric"
            className={`w-full bg-[#E9F0E9] border-none rounded-xl px-6 py-4 text-base font-bold text-slate-700 outline-none focus:ring-2 transition-all ${sdtError ? "ring-2 ring-red-400" : "ring-[#008A3D]/20"}`}
          />
          {sdtError && <p className="text-xs text-red-500 ml-1">{sdtError}</p>}
        </div>

        {/* Giới tính */}
        <div className="md:col-span-2 space-y-5">
          <label className="text-sm font-bold text-slate-700 ml-1">
            Giới tính
          </label>
          <div className="flex gap-12">
            {["Nam", "Nữ", "Khác"].map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="gioi_tinh"
                  value={option}
                  checked={gioiTinh === option}
                  onChange={() => setGioiTinh(option)}
                  className="w-5 h-5 accent-[#008A3D] cursor-pointer"
                />
                <span className="text-base font-bold text-slate-600 hover:text-[#008A3D] transition-colors">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-12 flex justify-end">
        <button
          disabled={isPending}
          type="submit"
          className="px-12 py-5 bg-[#1EA34D] text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-[#168a3f] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <Save size={24} />
          )}
          Lưu thay đổi
        </button>
      </div>
    </form>
  );
}
