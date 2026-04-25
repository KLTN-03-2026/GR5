"use client";

import React, { useState } from "react";
import { Camera, Save, Bell, Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { updateProfile } from "@/app/actions/profile";
import toast from "react-hot-toast";

export default function ProfileForm({ user }: { user: any }) {
  const [isPending, setIsPending] = useState(false);
  const [gender, setGender] = useState<string>(user?.gioi_tinh || "");

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    const res = await updateProfile(formData);
    if (res?.success) toast.success(res.success);
    else if (res?.error) toast.error(res.error);
    setIsPending(false);
  }

  const initials = user?.ho_ten
    ? user.ho_ten.trim().split(" ").slice(-1)[0][0].toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const displayName = user?.ho_ten?.trim() || "Chưa cập nhật tên";

  return (
    <div className="profile-page animate-fade-in-up">

      {/* ── Header ── */}
      <header className="profile-header">
        <div>
          <h2 className="profile-header__title">Hồ sơ cá nhân</h2>
          <p className="profile-header__sub">
            Cập nhật thông tin để bảo mật tài khoản và nhận ưu đãi
          </p>
        </div>
        <button
          className="profile-header__bell"
          aria-label="Thông báo"
          type="button"
        >
          <Bell size={18} />
        </button>
      </header>

      {/* ── Identity Card: Avatar + Tên + Role ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="profile-identity"
      >
        {/* Avatar */}
        <div className="profile-identity__avatar-wrap">
          <div className="profile-identity__avatar">{initials}</div>
          <label className="profile-identity__camera" aria-label="Đổi ảnh đại diện">
            <Camera size={13} />
            <input type="file" accept="image/*" className="hidden" style={{ display: "none" }} />
          </label>
        </div>

        {/* Tên + Email + Badges */}
        <div className="profile-identity__info">
          <h3 className="profile-identity__name">{displayName}</h3>
          <p className="profile-identity__email">{user?.email || ""}</p>
          <div className="profile-identity__badges">
            <span className="profile-identity__badge profile-identity__badge--role">
              Khách hàng
            </span>
            <span className="profile-identity__badge profile-identity__badge--tier">
              ✦ Thành viên Bạc
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="profile-identity__actions">
          <button type="button" className="btn-photo btn-photo--primary">
            Đổi ảnh mới
          </button>
          <button type="button" className="btn-photo btn-photo--ghost">
            Xóa ảnh
          </button>
          <p style={{
            fontSize: "0.625rem",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 600,
            textAlign: "right",
            margin: 0,
          }}>
            JPG, PNG · Tối đa 2MB
          </p>
        </div>
      </motion.div>

      {/* ── Form Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
        className="profile-form-card"
      >
        <form action={handleSubmit}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem 1.5rem",
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

            {/* Email (read-only) */}
            <div>
              <label className="profile-section-label" htmlFor="email">
                Email (cố định)
              </label>
              <input
                id="email"
                value={user?.email || ""}
                readOnly
                className="profile-input"
              />
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

            {/* Giới tính — full width */}
            <div style={{ gridColumn: "span 2" }}>
              <span className="profile-section-label">Giới tính</span>
              <div className="profile-radio-group" style={{ marginTop: "0.5rem" }}>
                {(["Nam", "Nữ", "Khác"] as const).map((option) => {
                  const isSelected = gender === option;
                  return (
                    <label
                      key={option}
                      className="profile-radio-label"
                      onClick={() => setGender(option)}
                    >
                      <input
                        type="radio"
                        name="gioi_tinh"
                        value={option}
                        checked={isSelected}
                        onChange={() => setGender(option)}
                        style={{ display: "none" }}
                      />
                      <div
                        className="profile-radio-indicator"
                        style={{
                          borderColor: isSelected ? "var(--color-brand)" : undefined,
                          background: isSelected ? "var(--color-brand)" : undefined,
                        }}
                      >
                        <div
                          className="profile-radio-dot"
                          style={{ transform: isSelected ? "scale(1)" : "scale(0)" }}
                        />
                      </div>
                      <span
                        className="profile-radio-text"
                        style={{ color: isSelected ? "var(--color-brand)" : undefined, fontWeight: isSelected ? 700 : undefined }}
                      >
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Save action */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "1.75rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--color-border)",
          }}>
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
              Lưu thay đổi
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
