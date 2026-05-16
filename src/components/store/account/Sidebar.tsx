"use client";

import React, { useEffect, useState } from "react";
import {
  Package, User, MapPin, Heart,
  KeyRound, LogOut, Leaf, ChevronRight, ShieldCheck,
  Star, ShoppingBag, Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useCart } from "@/lib/CartContext";

// ── nav config ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    id: "orders",
    name: "Đơn hàng",
    icon: Package,
    path: "/account/orders",
    exact: false,
    iconBg: "#eff6ff",
    iconColor: "#3b82f6",
  },
  {
    id: "profile",
    name: "Hồ sơ cá nhân",
    icon: User,
    path: "/account/profile",
    exact: false,
    iconBg: "#f5f3ff",
    iconColor: "#7c3aed",
  },
  {
    id: "address",
    name: "Địa chỉ giao hàng",
    icon: MapPin,
    path: "/account/addresses",
    exact: false,
    iconBg: "#fff7ed",
    iconColor: "#ea580c",
  },
  {
    id: "favorites",
    name: "Yêu thích",
    icon: Heart,
    path: "/account/favorites",
    exact: false,
    iconBg: "#fff1f2",
    iconColor: "#e11d48",
  },
  {
    id: "notifications",
    name: "Thông báo",
    icon: Bell,
    path: "/account/notifications",
    exact: false,
    iconBg: "#fef3c7",
    iconColor: "#d97706",
  },
  {
    id: "security",
    name: "Bảo mật",
    icon: KeyRound,
    path: "/account/change-password",
    exact: false,
    iconBg: "#f0fdf4",
    iconColor: "#16a34a",
  },
];

// ── membership tiers ──────────────────────────────────────────────────────────
function getMembership(orderCount: number) {
  if (orderCount >= 20) return { label: "Thành viên Vàng", color: "#b45309", bg: "#fef3c7", icon: "👑" };
  if (orderCount >= 5)  return { label: "Thành viên Bạc", color: "#475569", bg: "#f1f5f9", icon: "⭐" };
  return                       { label: "Thành viên Mới",  color: "#007A33", bg: "#e6f5ec", icon: "🌱" };
}

// ── component ─────────────────────────────────────────────────────────────────
export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const { clearCart } = useCart();

  const [stats, setStats] = useState({ orders: 0, favorites: 0 });
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const userId = user?.id ?? null;

  useEffect(() => {
    Promise.all([
      userId
        ? fetch(`/api/store/orders`).then(r => r.ok ? r.json() : [])
        : Promise.resolve([]),
      fetch("/api/store/account/favorites?page=1&limit=1").then(r => r.ok ? r.json() : null),
    ]).then(([ord, fav]) => {
      setStats({
        orders:    Array.isArray(ord) ? ord.length : 0,
        favorites: fav?.meta?.total ?? 0,
      });
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const displayName = user?.ho_ten?.trim() || user?.email?.split("@")[0] || "Người dùng";
  const email       = user?.email || "";
  const avatar      = user?.anh_dai_dien || null;
  const initials    = displayName.trim().split(" ").slice(-1)[0]?.[0]?.toUpperCase() ?? "?";
  const membership  = getMembership(stats.orders);

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    item.exact ? pathname === item.path : pathname.startsWith(item.path);

  return (
    <aside style={{
      width: 260,
      minWidth: 260,
      background: "#fff",
      borderRight: "1px solid #e8f0eb",
      display: "flex",
      flexDirection: "column",
      minHeight: "calc(100vh - 64px)",
      position: "sticky",
      top: 64,
      alignSelf: "flex-start",
      fontFamily: "var(--font-sans)",
    }}>

      {/* ── Brand ── */}
      <div style={{ padding: "1.5rem 1.5rem 0" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg,#007A33,#34d399)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Leaf size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: "1rem", fontWeight: 800, color: "#007A33", letterSpacing: "-0.02em" }}>
            Verdant
          </span>
        </Link>
      </div>

      {/* ── User card ── */}
      <div style={{ margin: "1.25rem 1rem 0", padding: "1rem", background: "#f7faf8", borderRadius: 14, border: "1px solid #e2ede7" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            {avatar ? (
              <img src={avatar} alt={displayName}
                style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}
              />
            ) : (
              <div style={{
                width: 46, height: 46, borderRadius: "50%",
                background: "linear-gradient(135deg,#007A33,#34d399)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.1rem", fontWeight: 700,
                boxShadow: "0 2px 8px rgba(0,122,51,.25)",
              }}>
                {initials}
              </div>
            )}
            {/* Online dot */}
            <span style={{
              position: "absolute", bottom: 1, right: 1,
              width: 11, height: 11, borderRadius: "50%",
              background: "#22c55e", border: "2px solid #f7faf8",
            }} />
          </div>

          {/* Info */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", color: "#1a3328", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {displayName.split(" ").slice(-2).join(" ")}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#8aaa98", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {email}
            </p>
            {/* Badge */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              marginTop: 5, fontSize: "0.68rem", fontWeight: 700,
              padding: "2px 8px", borderRadius: 20,
              background: membership.bg, color: membership.color,
            }}>
              {membership.icon} {membership.label}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", marginTop: "0.875rem", gap: "0.5rem" }}>
          {[
            { icon: ShoppingBag, label: "Đơn hàng", value: stats.orders,    color: "#3b82f6", bg: "#eff6ff" },
            { icon: Heart,       label: "Yêu thích", value: stats.favorites, color: "#e11d48", bg: "#fff1f2" },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, textAlign: "center", padding: "0.5rem 0.25rem",
              background: s.bg, borderRadius: 10,
            }}>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ margin: "2px 0 0", fontSize: "0.65rem", color: "#8aaa98", fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: "1rem 0.75rem 0" }}>
        <p style={{ margin: "0 0 0.5rem 0.5rem", fontSize: "0.65rem", fontWeight: 700, color: "#8aaa98", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Menu
        </p>

        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link key={item.id} href={item.path} style={{ display: "block", textDecoration: "none", marginBottom: 2 }}>
              <motion.div
                whileHover={{ x: active ? 0 : 2 }}
                transition={{ duration: 0.12 }}
                style={{
                  display: "flex", alignItems: "center", gap: "0.625rem",
                  padding: "0.55rem 0.75rem",
                  borderRadius: 10,
                  background: active ? "#e6f5ec" : "transparent",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "#f7faf8"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                {/* Icon bubble */}
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: active ? item.iconColor : item.iconBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s",
                }}>
                  <item.icon size={15} color={active ? "#fff" : item.iconColor} strokeWidth={active ? 2.5 : 2} />
                </div>

                <span style={{
                  flex: 1, fontSize: "0.85rem", fontWeight: active ? 700 : 500,
                  color: active ? "#005A25" : "#4a6659",
                }}>
                  {item.name}
                </span>

                {active ? (
                  <motion.div layoutId="nav-arrow">
                    <ChevronRight size={14} color="#007A33" strokeWidth={2.5} />
                  </motion.div>
                ) : null}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* ── Upgrade CTA ── */}
      <div style={{ margin: "1rem 0.75rem 0" }}>
        <div style={{
          background: "linear-gradient(135deg,#007A33 0%,#059669 100%)",
          borderRadius: 12, padding: "0.875rem 1rem",
          display: "flex", alignItems: "center", gap: "0.625rem",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0,122,51,.25)",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Star size={16} color="#fde68a" fill="#fde68a" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "#fff" }}>Nâng cấp tài khoản</p>
            <p style={{ margin: "2px 0 0", fontSize: "0.68rem", color: "rgba(255,255,255,0.75)" }}>Nhận ưu đãi độc quyền</p>
          </div>
          <ChevronRight size={14} color="rgba(255,255,255,0.7)" />
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: "1rem 0.75rem 1.25rem", marginTop: "0.75rem", borderTop: "1px solid #e8f0eb" }}>
        {/* Verified badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.5rem", marginBottom: "0.5rem" }}>
          <ShieldCheck size={14} color="#16a34a" />
          <span style={{ fontSize: "0.72rem", color: "#8aaa98" }}>Tài khoản đã xác thực</span>
        </div>

        {/* Logout */}
        {!logoutConfirm ? (
          <button
            onClick={() => setLogoutConfirm(true)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: "0.625rem",
              padding: "0.55rem 0.75rem", borderRadius: 10,
              background: "transparent", border: "none", cursor: "pointer",
              color: "#6b7280", fontSize: "0.85rem", fontWeight: 500,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2";
              (e.currentTarget as HTMLButtonElement).style.color = "#dc2626";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#6b7280";
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LogOut size={14} color="#dc2626" />
            </div>
            Đăng xuất
          </button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: "#fef2f2", borderRadius: 10, padding: "0.75rem", border: "1px solid #fecdd3" }}
            >
              <p style={{ margin: "0 0 0.6rem", fontSize: "0.78rem", color: "#dc2626", fontWeight: 600, textAlign: "center" }}>
                Xác nhận đăng xuất?
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setLogoutConfirm(false)}
                  style={{ flex: 1, padding: "0.4rem", borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", fontSize: "0.78rem", cursor: "pointer", fontWeight: 600, color: "#374151" }}
                >
                  Huỷ
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  style={{ flex: 1, padding: "0.4rem", borderRadius: 7, border: "none", background: "#dc2626", color: "#fff", fontSize: "0.78rem", cursor: "pointer", fontWeight: 700 }}
                >
                  Đăng xuất
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
}
