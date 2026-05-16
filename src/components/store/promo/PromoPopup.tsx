"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PromoBanner {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
}

interface Props {
  banners: PromoBanner[];
}

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
};

const storageKey = (id: number) => `promo_popup_${id}_${todayKey()}`;

export default function PromoPopup({ banners }: Props) {
  // Lấy banner đầu tiên chưa dismiss hôm nay
  const [activeBanner, setActiveBanner] = useState<PromoBanner | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (banners.length === 0) return;
    const candidate = banners.find((b) => {
      try {
        return localStorage.getItem(storageKey(b.id)) !== "1";
      } catch {
        return true;
      }
    });
    if (!candidate) return;

    // Delay 800ms để không xuất hiện ngay khi page chưa render xong
    const timer = setTimeout(() => {
      setActiveBanner(candidate);
      setShow(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [banners]);

  const handleDismiss = () => {
    if (activeBanner) {
      try {
        localStorage.setItem(storageKey(activeBanner.id), "1");
      } catch {}
    }
    setShow(false);
  };

  if (!activeBanner) return null;

  const hasLink = !!activeBanner.link;
  const isExternal = hasLink && /^https?:\/\//i.test(activeBanner.link);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleDismiss}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: 20,
              maxWidth: 480,
              width: "100%",
              maxHeight: "90vh",
              overflow: "hidden",
              boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              aria-label="Đóng"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 2,
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.95)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#374151",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(90deg)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "rotate(0deg)")}
            >
              <X size={18} />
            </button>

            {/* Image */}
            {activeBanner.image && (
              <div style={{ width: "100%", aspectRatio: "16 / 10", overflow: "hidden", background: "#f3f4f6" }}>
                <img
                  src={activeBanner.image}
                  alt={activeBanner.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                />
              </div>
            )}

            {/* Content */}
            <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#16a34a" }}>
                <Sparkles size={14} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Ưu đãi đặc biệt
                </span>
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.3 }}>
                {activeBanner.title || "Ưu đãi từ NôngSản"}
              </h3>

              {activeBanner.description && (
                <p style={{ fontSize: 14, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
                  {activeBanner.description}
                </p>
              )}

              {/* CTA */}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                {hasLink ? (
                  isExternal ? (
                    <a
                      href={activeBanner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleDismiss}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        padding: "12px 16px",
                        background: "#16a34a",
                        color: "#fff",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Xem ngay
                    </a>
                  ) : (
                    <Link
                      href={activeBanner.link}
                      onClick={handleDismiss}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        padding: "12px 16px",
                        background: "#16a34a",
                        color: "#fff",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Xem ngay
                    </Link>
                  )
                ) : null}
                <button
                  onClick={handleDismiss}
                  style={{
                    flex: hasLink ? "0 0 auto" : 1,
                    padding: "12px 16px",
                    background: hasLink ? "#fff" : "#f3f4f6",
                    color: "#374151",
                    border: hasLink ? "1px solid #e5e7eb" : "none",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Để sau
                </button>
              </div>

              <p style={{ fontSize: 11, color: "#9ca3af", margin: "4px 0 0", textAlign: "center" }}>
                Đóng popup này sẽ không hiển thị lại trong hôm nay.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
