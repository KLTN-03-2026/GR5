"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Bell, CheckCheck, Package, Tag, AlertCircle,
  Loader2, Inbox,
} from "lucide-react";
import { motion } from "framer-motion";

interface Notification {
  id: number;
  tieu_de: string | null;
  noi_dung: string | null;
  loai_thong_bao: string | null;
  da_doc: boolean | null;
  ngay_tao: string | null;
}

const ICON_MAP: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  don_hang: { icon: Package, color: "#3b82f6", bg: "#eff6ff" },
  khuyen_mai: { icon: Tag, color: "#f59e0b", bg: "#fffbeb" },
  he_thong: { icon: AlertCircle, color: "#6b7280", bg: "#f3f4f6" },
};

function getNotifIcon(type: string | null) {
  return ICON_MAP[type || ""] || { icon: Bell, color: "#16a34a", bg: "#f0fdf4" };
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/store/account/notifications?limit=50");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.meta?.unreadCount || 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    await fetch("/api/store/account/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "read" }),
    });
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, da_doc: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    await fetch("/api/store/account/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read-all" }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, da_doc: true })));
    setUnreadCount(0);
    setMarkingAll(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 700 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={20} color="#16a34a" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#1a1a1a" }}>Thông báo</h1>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#9ca3af" }}>
              {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Tất cả đã đọc"}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "0.5rem 1rem", borderRadius: 8,
              border: "1px solid #e5e7eb", background: "#fff",
              fontSize: "0.8rem", fontWeight: 500, color: "#374151",
              cursor: "pointer",
            }}
          >
            {markingAll ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
            Đọc tất cả
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 0", color: "#9ca3af", gap: 8 }}>
          <Loader2 size={20} className="animate-spin" /> Đang tải...
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <Inbox size={24} color="#9ca3af" />
          </div>
          <p style={{ fontSize: "1rem", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>Chưa có thông báo</p>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af", margin: 0 }}>Thông báo về đơn hàng và khuyến mãi sẽ hiện ở đây</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifications.map((notif, i) => {
            const { icon: Icon, color, bg } = getNotifIcon(notif.loai_thong_bao);
            const isUnread = !notif.da_doc;

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => isUnread && markAsRead(notif.id)}
                style={{
                  display: "flex", gap: 12, padding: "1rem",
                  borderRadius: 12, cursor: isUnread ? "pointer" : "default",
                  background: isUnread ? "#f0fdf4" : "#fff",
                  border: `1px solid ${isUnread ? "#bbf7d0" : "#f3f4f6"}`,
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: isUnread ? 600 : 500, color: "#1a1a1a", flex: 1 }}>
                      {notif.tieu_de || "Thông báo"}
                    </p>
                    {isUnread && (
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a", flexShrink: 0 }} />
                    )}
                  </div>
                  {notif.noi_dung && (
                    <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#6b7280", lineHeight: 1.4 }}>
                      {notif.noi_dung}
                    </p>
                  )}
                  <p style={{ margin: "6px 0 0", fontSize: "0.7rem", color: "#9ca3af" }}>
                    {timeAgo(notif.ngay_tao)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
