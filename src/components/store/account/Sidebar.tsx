"use client";

import React from "react";
import {
  LayoutDashboard,
  Package,
  User,
  MapPin,
  Heart,
  KeyRound,
  Settings,
  LogOut,
  Leaf,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();

  const navItems = [
    { id: "overview",         name: "Tổng quan",          icon: LayoutDashboard, path: "/account" },
    { id: "orders",           name: "Đơn hàng của tôi",   icon: Package,         path: "/account/orders" },
    { id: "profile",          name: "Hồ sơ cá nhân",      icon: User,            path: "/account/profile" },
    { id: "address",          name: "Địa chỉ giao hàng",  icon: MapPin,          path: "/account/addresses" },
    { id: "favorites",        name: "Yêu thích",           icon: Heart,           path: "/account/favorites" },
    { id: "change-password",  name: "Bảo mật",             icon: KeyRound,        path: "/account/change-password" },
  ];

  const initials = user?.ho_ten
    ? user.ho_ten.trim().split(" ").slice(-1)[0][0].toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const displayName = user?.ho_ten?.trim() || user?.email?.split("@")[0] || "Người dùng";

  return (
    <aside className="account-sidebar">
      {/* Brand */}
      <div className="account-sidebar__brand">
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Leaf size={15} color="var(--color-brand)" />
          <h1 style={{
            margin: 0,
            fontSize: "1.1rem",
            fontWeight: 800,
            color: "var(--color-brand)",
            letterSpacing: "-0.02em",
          }}>
            Nông Sản Việt
          </h1>
        </div>
      </div>

      {/* User info card */}
      <div className="account-sidebar__user">
        <div className="account-sidebar__avatar">{initials}</div>
        <div style={{ minWidth: 0 }}>
          <p className="account-sidebar__user-name" style={{ margin: 0 }}>
            {displayName.split(" ").slice(-2).join(" ")}
          </p>
          <span className="account-sidebar__user-role">Thành viên Bạc</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="account-sidebar__nav">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.id} href={item.path} style={{ display: "block", textDecoration: "none" }}>
              <motion.div
                whileHover={{ x: 3 }}
                transition={{ duration: 0.15 }}
                className={`account-sidebar__nav-item${isActive ? " account-sidebar__nav-item--active" : ""}`}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-dot"
                    className="account-sidebar__nav-dot"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      <div style={{ padding: "0.75rem 1rem" }}>
        <button className="account-sidebar__upgrade">
          ✦ Nâng cấp tài khoản
        </button>
      </div>

      {/* Footer */}
      <div className="account-sidebar__footer">
        <Link
          href="/account/settings"
          className="account-sidebar__footer-item"
          style={{ display: "flex", textDecoration: "none" }}
        >
          <Settings size={17} />
          <span>Cài đặt</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="account-sidebar__footer-item account-sidebar__footer-item--danger"
        >
          <LogOut size={17} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
