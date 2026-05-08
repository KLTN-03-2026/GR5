"use client";

import React, { useState } from "react";
import { Save, Loader2, Pencil, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { updateProfile } from "@/app/actions/profile";
import toast from "react-hot-toast";

export default function ProfileForm({ user }: { user: any }) {
  const [isPending, setIsPending] = useState(false);
  const [gender, setGender] = useState<string>(user?.gioi_tinh || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.anh_dai_dien || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleGenderChange(value: string) {
    setGender(value);
    const fd = new FormData();
    fd.set("gioi_tinh", value);
    fd.set("ho_ten", user?.ho_ten || "");
    fd.set("so_dien_thoai", user?.so_dien_thoai || "");
    const res = await updateProfile(fd);
    if ("success" in res) toast.success("Đã lưu giới tính!");
    else toast.error(res.error);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    formData.set("gioi_tinh", gender);
    const res = await updateProfile(formData);
    if ("success" in res) {
      toast.success(res.success);
      if (res.anh_dai_dien) {
        window.dispatchEvent(new CustomEvent("update-avatar", { detail: res.anh_dai_dien }));
      }
      window.dispatchEvent(new CustomEvent("update-name", { detail: formData.get("ho_ten") }));
    } else {
      toast.error(res.error);
    }
    setIsPending(false);
  }

  const initials = user?.ho_ten
    ? user.ho_ten.trim().split(" ").slice(-1)[0][0].toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const displayName = user?.ho_ten?.trim() || "Chưa cập nhật tên";

  return (
    <div className="profile-page animate-fade-in-up">

      {/* Page title */}
      <div className="profile-page-title">
        <h1>Hồ sơ cá nhân</h1>
        <p>Cập nhật thông tin để bảo mật tài khoản và nhận ưu đãi</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
      >
        <form action={handleSubmit}>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            name="avatar"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {/* Avatar card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="profile-identity"
          >
            {/* Avatar */}
            <div className="profile-identity__avatar-wrap">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div className="profile-identity__avatar">{initials}</div>
              )}
              <button
                type="button"
                className="profile-identity__camera"
                aria-label="Đổi ảnh đại diện"
                onClick={() => fileInputRef.current?.click()}
              >
                <Pencil size={12} />
              </button>
            </div>

            {/* Name + Email + Badge */}
            <div className="profile-identity__info">
              <h3 className="profile-identity__name">{displayName}</h3>
              <p className="profile-identity__email">{user?.email || ""}</p>
              <div className="profile-identity__badges">
                <span className="profile-identity__badge profile-identity__badge--tier">
                  ★ Thành viên Bạc
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="profile-identity__actions">
              <button
                type="button"
                className="btn-photo btn-photo--primary"
                onClick={() => fileInputRef.current?.click()}
              >
                Đổi ảnh mới
              </button>
              <button
                type="button"
                className="btn-photo btn-photo--ghost"
                onClick={() => {
                  setAvatarPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Xóa ảnh
              </button>
              <p style={{
                fontSize: "0.6rem",
                color: "#9ca3af",
                margin: 0,
                textAlign: "right",
              }}>
                JPG, PNG · Tối đa 2MB
              </p>
            </div>
          </motion.div>

          {/* Form card */}
          <div className="profile-form-card">
            <div className="profile-form-card__header">
              <p className="profile-form-card__title">Thông tin cá nhân</p>
            </div>

            <div className="profile-form-card__body">
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "20px 1.5rem",
              }}>

                {/* Họ và tên */}
                <div>
                  <label className="profile-section-label" htmlFor="ho_ten">
                    Họ và tên
                  </label>
                  <input
                    id="ho_ten"
                    name="ho_ten"
                    defaultValue={user?.ho_ten || ""}
                    placeholder="Nhập họ và tên đầy đủ"
                    className="profile-input"
                  />
                </div>

                {/* Email (read-only) with lock icon */}
                <div>
                  <label className="profile-section-label" htmlFor="email">
                    Email
                  </label>
                  <div className="profile-input-wrap">
                    <input
                      id="email"
                      value={user?.email || ""}
                      readOnly
                      className="profile-input"
                    />
                    <span className="profile-input-wrap__icon">
                      <Lock size={14} />
                    </span>
                  </div>
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="profile-section-label" htmlFor="so_dien_thoai">
                    Số điện thoại
                  </label>
                  <input
                    id="so_dien_thoai"
                    name="so_dien_thoai"
                    defaultValue={user?.so_dien_thoai || ""}
                    placeholder="09xx xxx xxx"
                    className="profile-input"
                  />
                </div>

                {/* Ngày sinh */}
                <div>
                  <label className="profile-section-label" htmlFor="ngay_sinh">
                    Ngày sinh
                  </label>
                  <input
                    id="ngay_sinh"
                    type="date"
                    name="ngay_sinh"
                    defaultValue={
                      user?.ngay_sinh
                        ? new Date(user.ngay_sinh).toISOString().split("T")[0]
                        : ""
                    }
                    className="profile-input"
                  />
                </div>

                {/* Giới tính — toggle button group */}
                <div style={{ gridColumn: "span 2" }}>
                  <span className="profile-section-label">Giới tính</span>
                  <div className="profile-gender-group" style={{ marginTop: "6px" }}>
                    {(["Nam", "Nữ", "Khác"] as const).map((option) => {
                      const isSelected = gender === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          className={`profile-gender-btn${isSelected ? " profile-gender-btn--selected" : ""}`}
                          onClick={() => { if (!isSelected) handleGenderChange(option); }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Save footer */}
            <div className="profile-save-wrapper">
              <span className="profile-save-hint">Cập nhật lần cuối: --</span>
              <button
                type="submit"
                disabled={isPending}
                className="profile-save-btn"
              >
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
