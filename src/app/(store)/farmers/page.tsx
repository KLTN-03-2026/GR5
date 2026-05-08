"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── hook: fade-in khi vào viewport ─── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeUp({ children, delay = 0, style = {} }: {
  children: React.ReactNode; delay?: number; style?: React.CSSProperties;
}) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Data ─── */
const FARMERS = [
  {
    id: 1,
    name: "Ông Nguyễn Văn Tám",
    age: 62,
    location: "Đà Lạt, Lâm Đồng",
    since: 2018,
    specialty: "Rau thủy canh",
    products: ["Rau muống", "Cải thìa", "Xà lách", "Cần tây"],
    cert: "VietGAP",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80",
    farm_img: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
    quote: "Con cháu tôi ăn rau tôi trồng. Khách hàng cũng vậy. Tôi chỉ trồng một loại rau — loại tôi dám cho gia đình ăn.",
    story: "Ông Tám gắn bó với đất Đà Lạt hơn 40 năm. Từng mất trắng vì thương lái ép giá, nay ông là nông dân đầu tiên hợp tác với Verdant Curator và thu nhập tăng gấp 4 lần nhờ bán thẳng đến người dùng.",
    income_change: "+320%",
    rating: 4.9,
    reviews: 847,
    tag: "Bestseller",
    tag_color: "#16a34a",
    accent: "#4ade80",
  },
  {
    id: 2,
    name: "Bà Trần Thị Hoa",
    age: 54,
    location: "Cái Bè, Tiền Giang",
    since: 2020,
    specialty: "Trái cây hữu cơ",
    products: ["Xoài cát Hoà Lộc", "Chôm chôm", "Sầu riêng Ri6", "Thanh long"],
    cert: "Organic",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80",
    farm_img: "https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=800&q=80",
    quote: "Xoài nhà tôi ngọt vì đất ngọt, không phải vì thuốc. Người mua biết điều đó, nên họ quay lại.",
    story: "Bà Hoa kế thừa 3 hecta vườn xoài của cha. Dù nhiều người khuyên chuyển sang trồng công nghiệp, bà vẫn kiên trì canh tác tự nhiên. Khi Verdant tìm đến, bà là người khóc nhiều nhất trong buổi ký hợp đồng.",
    income_change: "+280%",
    rating: 4.8,
    reviews: 612,
    tag: "Top rated",
    tag_color: "#d97706",
    accent: "#fbbf24",
  },
  {
    id: 3,
    name: "Anh Lê Văn Bình",
    age: 34,
    location: "Pleiku, Gia Lai",
    since: 2022,
    specialty: "Nấm sạch",
    products: ["Nấm rơm", "Nấm linh chi đỏ", "Nấm bào ngư", "Nấm đông cô"],
    cert: "GlobalGAP",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&q=80",
    farm_img: "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=800&q=80",
    quote: "Ba tôi trồng cà phê suốt 30 năm. Tôi chuyển sang nấm. Đất vẫn là đất gia đình — chỉ là chúng tôi đang kể một câu chuyện mới.",
    story: "Bình tốt nghiệp Đại học Nông Lâm, bỏ phố về quê khi thấy cha già vẫn phải gánh nặng nợ nần. Anh chuyển đổi 1,2ha cà phê già cỗi thành trại nấm hiện đại, ứng dụng IoT kiểm soát nhiệt độ. Nay là nông trại công nghệ duy nhất trong mạng lưới.",
    income_change: "+510%",
    rating: 4.7,
    reviews: 289,
    tag: "Rising star",
    tag_color: "#7c3aed",
    accent: "#a78bfa",
  },
  {
    id: 4,
    name: "Chị Nguyễn Thị Lan",
    age: 41,
    location: "Sa Pa, Lào Cai",
    since: 2021,
    specialty: "Rau bản địa núi",
    products: ["Su su", "Bắp cải tím", "Cải mèo", "Rau ngót rừng"],
    cert: "VietGAP",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=500&q=80",
    farm_img: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80",
    quote: "Người Mông chúng tôi trồng rau trên núi hàng trăm năm. Bây giờ người thành phố mới biết những gì chúng tôi ăn ngon đến vậy.",
    story: "Lan là người H'Mông đầu tiên trong bản có smartphone, cũng là người đầu tiên bán rau trực tuyến. Chị học tiếng Kinh để có thể đọc hợp đồng, rồi dạy lại cho 15 hộ trong bản cùng tham gia.",
    income_change: "+390%",
    rating: 4.9,
    reviews: 431,
    tag: "Câu chuyện nổi bật",
    tag_color: "#0284c7",
    accent: "#60a5fa",
  },
  {
    id: 5,
    name: "Ông Phạm Thanh Tùng",
    age: 58,
    location: "Đắk Lắk",
    since: 2019,
    specialty: "Cà phê & Gia vị",
    products: ["Cà phê Arabica", "Tiêu đen", "Gừng", "Nghệ vàng"],
    cert: "Rainforest Alliance",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&q=80",
    farm_img: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=800&q=80",
    quote: "Cà phê của tôi được trồng dưới tán rừng. Không chặt cây để lấy nắng, không bơm phân để nhanh có hạt. Chậm mà chắc.",
    story: "Tùng từng là kỹ sư xây dựng. Sau 2 năm làm việc ở Sài Gòn, anh nhận ra mình không hạnh phúc. Anh về Đắk Lắk mua 5ha đất bạc màu, mất 4 năm để phục hồi độ màu tự nhiên trước khi trồng cà phê.",
    income_change: "+180%",
    rating: 4.8,
    reviews: 723,
    tag: "Certified",
    tag_color: "#059669",
    accent: "#34d399",
  },
  {
    id: 6,
    name: "Bà Võ Thị Mai",
    age: 67,
    location: "Hội An, Quảng Nam",
    since: 2023,
    specialty: "Rau làng Trà Quế",
    products: ["Húng quế", "Rau thơm", "Hành lá", "Kinh giới"],
    cert: "Làng rau truyền thống",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&q=80",
    farm_img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
    quote: "Làng Trà Quế 500 năm chỉ dùng rong biển và bùn sông để bón rau. Không ai bày chúng tôi — đó là bí quyết của tổ tiên.",
    story: "Bà Mai là đời thứ 6 trồng rau Trà Quế. Khi dự án du lịch đe dọa diện tích đất làng, bà đứng ra vận động và cuối cùng ký được hợp đồng với Verdant — đảm bảo đầu ra ổn định mà không cần bán đất.",
    income_change: "+220%",
    rating: 5.0,
    reviews: 156,
    tag: "Di sản",
    tag_color: "#b45309",
    accent: "#f59e0b",
  },
];

const STATS = [
  { value: "300+", label: "Nông hộ đối tác", icon: "🌾" },
  { value: "70%", label: "Giá trị nông dân nhận được", icon: "💰" },
  { value: "6", label: "Tỉnh thành hợp tác", icon: "📍" },
  { value: "4.8★", label: "Đánh giá trung bình", icon: "⭐" },
];

/* ─── CERT badge colors ─── */
const certColors: Record<string, { bg: string; color: string }> = {
  "VietGAP":              { bg: "#dcfce7", color: "#15803d" },
  "Organic":              { bg: "#fef3c7", color: "#92400e" },
  "GlobalGAP":            { bg: "#dbeafe", color: "#1d4ed8" },
  "Rainforest Alliance":  { bg: "#d1fae5", color: "#065f46" },
  "Làng rau truyền thống":{ bg: "#fce7f3", color: "#9d174d" },
};

/* ─── FARMER CARD ─── */
function FarmerCard({ farmer, onOpen }: { farmer: typeof FARMERS[0]; onOpen: (f: typeof FARMERS[0]) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onOpen(farmer)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16, overflow: "hidden", background: "#fff",
        border: "1px solid #e5e7eb", cursor: "pointer",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.10)" : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Farm photo */}
      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
        <img src={farmer.farm_img} alt={farmer.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.06)" : "scale(1)", transition: "transform 0.5s ease" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,46,22,0.75) 0%, transparent 55%)" }} />

        {/* tag */}
        <span style={{ position: "absolute", top: 12, left: 12, background: farmer.tag_color, color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>
          {farmer.tag}
        </span>

        {/* cert */}
        <span style={{ position: "absolute", top: 12, right: 12, background: certColors[farmer.cert]?.bg ?? "#f3f4f6", color: certColors[farmer.cert]?.color ?? "#374151", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, border: "1px solid rgba(0,0,0,0.06)" }}>
          ✓ {farmer.cert}
        </span>

        {/* avatar + name overlay */}
        <div style={{ position: "absolute", bottom: 12, left: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <img src={farmer.avatar} alt={farmer.name}
            style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", objectPosition: "top" }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.3 }}>{farmer.name}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>{farmer.location}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: "0 0 2px" }}>{farmer.specialty}</p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Hợp tác từ {farmer.since}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", margin: "0 0 1px" }}>
              {farmer.rating} ★
            </p>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{farmer.reviews.toLocaleString()} đánh giá</p>
          </div>
        </div>

        {/* quote snippet */}
        <p style={{ fontSize: 13, color: "#6b7280", fontStyle: "italic", lineHeight: 1.65, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          "{farmer.quote}"
        </p>

        {/* products */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
          {farmer.products.slice(0, 3).map(p => (
            <span key={p} style={{ fontSize: 11, background: "#f0fdf4", color: "#15803d", padding: "2px 8px", borderRadius: 99, border: "1px solid #bbf7d0", fontWeight: 500 }}>{p}</span>
          ))}
          {farmer.products.length > 3 && (
            <span style={{ fontSize: 11, color: "#9ca3af", padding: "2px 6px" }}>+{farmer.products.length - 3}</span>
          )}
        </div>

        {/* income badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>Thu nhập tăng</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: farmer.accent, background: `${farmer.accent}18`, padding: "2px 10px", borderRadius: 99 }}>
            {farmer.income_change}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── MODAL CHI TIẾT ─── */
function FarmerModal({ farmer, onClose }: { farmer: typeof FARMERS[0] | null; onClose: () => void }) {
  useEffect(() => {
    if (farmer) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [farmer]);

  if (!farmer) return null;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}
    >
      <div style={{ background: "#fff", borderRadius: 20, maxWidth: 720, width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 32px 80px rgba(0,0,0,0.25)" }}>

        {/* Header ảnh */}
        <div style={{ position: "relative", height: 260, overflow: "hidden", borderRadius: "20px 20px 0 0" }}>
          <img src={farmer.farm_img} alt={farmer.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,46,22,0.85) 0%, rgba(0,0,0,0.1) 60%)" }} />

          {/* Close */}
          <button onClick={onClose}
            style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.4)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
            ×
          </button>

          {/* Person info */}
          <div style={{ position: "absolute", bottom: 20, left: 24, display: "flex", gap: 14, alignItems: "flex-end" }}>
            <img src={farmer.avatar} alt={farmer.name}
              style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", objectPosition: "top", border: "3px solid #fff" }} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>{farmer.name}</h2>
                <span style={{ fontSize: 11, background: farmer.tag_color, color: "#fff", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{farmer.tag}</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: 0 }}>
                {farmer.age} tuổi · {farmer.location} · Hợp tác từ {farmer.since}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "28px 28px 32px" }}>

          {/* stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Chứng nhận", value: farmer.cert, color: certColors[farmer.cert]?.color ?? "#374151", bg: certColors[farmer.cert]?.bg ?? "#f3f4f6" },
              { label: "Đánh giá", value: `${farmer.rating} ★ (${farmer.reviews})`, color: "#92400e", bg: "#fef3c7" },
              { label: "Thu nhập tăng", value: farmer.income_change, color: "#065f46", bg: "#d1fae5" },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: s.color, margin: "0 0 3px" }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* quote */}
          <blockquote style={{ borderLeft: `4px solid ${farmer.accent}`, paddingLeft: 16, margin: "0 0 20px", fontStyle: "italic", fontSize: 16, color: "#374151", lineHeight: 1.75 }}>
            "{farmer.quote}"
          </blockquote>

          {/* story */}
          <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.85, marginBottom: 24 }}>{farmer.story}</p>

          {/* products */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 10 }}>Sản phẩm cung cấp</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {farmer.products.map(p => (
                <span key={p} style={{ fontSize: 13, background: "#f0fdf4", color: "#15803d", padding: "5px 14px", borderRadius: 99, border: "1px solid #bbf7d0", fontWeight: 500 }}>{p}</span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link href="/products"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#16a34a", color: "#fff", padding: "12px 28px", borderRadius: 99, fontSize: 14, fontWeight: 600, textDecoration: "none" }}
            onClick={onClose}
          >
            Xem sản phẩm của {farmer.name.split(" ").pop()} →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── PAGE ─── */
export default function FarmersPage() {
  const [selected, setSelected] = useState<typeof FARMERS[0] | null>(null);
  const [filter, setFilter] = useState<string>("Tất cả");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const specialties = ["Tất cả", ...Array.from(new Set(FARMERS.map(f => f.specialty)))];
  const shown = filter === "Tất cả" ? FARMERS : FARMERS.filter(f => f.specialty === filter);

  return (
    <div style={{ fontFamily: "var(--font-sans)", background: "#fff", overflowX: "hidden" }}>

      {/* ── HERO ── */}
      <section style={{ position: "relative", height: "70vh", minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1800&q=80)",
          backgroundSize: "cover", backgroundPosition: "center 30%",
          transform: `translateY(${scrollY * 0.3}px)`,
          willChange: "transform",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(5,46,22,0.82) 0%, rgba(5,46,22,0.55) 50%, rgba(5,46,22,0.8) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px", maxWidth: 700 }}>
          <div style={{ display: "inline-block", background: "rgba(74,222,128,0.2)", border: "1px solid rgba(134,239,172,0.4)", borderRadius: 99, padding: "5px 16px", fontSize: 11, color: "#86efac", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24 }}>
            Những người giữ đất sống
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5.5vw, 64px)", fontWeight: 800, color: "#fff", margin: "0 0 20px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Gặp gỡ<br />
            <span style={{ color: "#4ade80" }}>các nông dân của chúng tôi</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.72)", lineHeight: 1.8, maxWidth: 520, margin: "0 auto" }}>
            Đằng sau mỗi bó rau, mỗi quả xoài, mỗi hạt cà phê — là một gia đình, một câu chuyện,
            và một người đang canh tác đúng cách ngay lúc này.
          </p>
        </div>

        {/* scroll cue */}
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", opacity: 0.5 }}>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, transparent, white)", margin: "0 auto" }} />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: "#052e16", padding: "32px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center" }} className="farmers-stats">
          {STATS.map((s, i) => (
            <FadeUp key={i} delay={i * 0.06}>
              <div style={{ padding: "8px 0" }}>
                <p style={{ fontSize: 10, marginBottom: 4 }}>{s.icon}</p>
                <p style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 800, color: "#4ade80", margin: "0 0 4px" }}>{s.value}</p>
                <p style={{ fontSize: 12, color: "rgba(240,253,244,0.55)", margin: 0 }}>{s.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── MAIN GRID ── */}
      <section style={{ background: "#f7f8f6", padding: "64px 24px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Filter tabs */}
          <FadeUp>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 40, justifyContent: "center" }}>
              {specialties.map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  style={{
                    padding: "8px 18px", borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1.5px solid",
                    borderColor: filter === s ? "#16a34a" : "#e5e7eb",
                    background: filter === s ? "#16a34a" : "#fff",
                    color: filter === s ? "#fff" : "#374151",
                    transition: "all 0.15s",
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </FadeUp>

          {/* Cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="farmers-grid">
            {shown.map((farmer, i) => (
              <FadeUp key={farmer.id} delay={i * 0.07}>
                <FarmerCard farmer={farmer} onOpen={setSelected} />
              </FadeUp>
            ))}
          </div>

          {shown.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>🌾</p>
              <p style={{ fontSize: 16 }}>Không tìm thấy nông dân phù hợp</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CÂU CHUYỆN NỔI BẬT — featured ── */}
      <section style={{ background: "#0a1a0c", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeUp>
            <p style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#4ade80", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>Góc nhìn gần</p>
            <h2 style={{ textAlign: "center", fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 800, color: "#f0fdf4", margin: "0 0 56px" }}>Một ngày cùng ông Tám</h2>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }} className="featured-grid">
            <FadeUp delay={0.1}>
              <div style={{ position: "relative" }}>
                <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&q=85"
                  alt="Ông Tám" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 16 }} />
                {/* floating time badge */}
                <div style={{ position: "absolute", bottom: -18, right: 24, background: "#16a34a", color: "#fff", borderRadius: 12, padding: "10px 18px", boxShadow: "0 8px 24px rgba(22,163,74,0.4)" }}>
                  <p style={{ fontSize: 11, opacity: 0.8, margin: "0 0 2px" }}>Bắt đầu lúc</p>
                  <p style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>4:30 SA</p>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  {[
                    { time: "4:30 SA", icon: "🌙", title: "Thức dậy", desc: "Ông Tám thức lúc trời còn tối. 'Rau sáng sớm ngon hơn. Nó còn ngủ, mình phải đánh thức nhẹ nhàng.'" },
                    { time: "5:30 SA", icon: "🌿", title: "Thu hoạch", desc: "Tay không dùng găng để cảm nhận rau có đủ già chưa. 40 năm kinh nghiệm không thể đọc từ sách vở." },
                    { time: "7:00 SA", icon: "📦", title: "Đóng gói", desc: "Từng bó rau buộc đúng 200g, dán nhãn tay, đặt nhẹ vào thùng xốp. 'Tôi gửi rau như gửi quà cho con.'" },
                    { time: "8:00 SA", icon: "🚐", title: "Xe Verdant đến", desc: "Xe lạnh từ kho Bình Dương lên mỗi sáng. Tài xế biết tên ông, ông biết tên tài xế." },
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 16 }}>
                      <div style={{ flexShrink: 0, textAlign: "center" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                          {step.icon}
                        </div>
                        {i < 3 && <div style={{ width: 1, height: 20, background: "rgba(74,222,128,0.15)", margin: "4px auto" }} />}
                      </div>
                      <div style={{ paddingTop: 8 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 700 }}>{step.time}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#f0fdf4" }}>{step.title}</span>
                        </div>
                        <p style={{ fontSize: 13, color: "rgba(240,253,244,0.6)", lineHeight: 1.75, margin: 0 }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── COMMITMENT ── */}
      <section style={{ background: "#f0fdf4", padding: "72px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <FadeUp>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>Cam kết của chúng tôi</p>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, color: "#052e16", margin: "0 0 24px" }}>
              Khi bạn mua, nông dân thắng
            </h2>
            <p style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.85, maxWidth: 600, margin: "0 auto 40px" }}>
              Mô hình của chúng tôi đơn giản: loại bỏ tất cả trung gian không cần thiết, trả lại giá trị thực
              cho người trồng. Mỗi đồng bạn chi tiêu, ít nhất 70% về tay nông dân trực tiếp.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
              <Link href="/products"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#16a34a", color: "#fff", padding: "14px 32px", borderRadius: 99, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 20px rgba(22,163,74,0.35)" }}>
                Mua ngay để ủng hộ →
              </Link>
              <Link href="/about"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#16a34a", padding: "14px 32px", borderRadius: 99, fontSize: 14, fontWeight: 500, textDecoration: "none", border: "1.5px solid #86efac" }}>
                Xem câu chuyện đầy đủ
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── MODAL ── */}
      <FarmerModal farmer={selected} onClose={() => setSelected(null)} />

      <style>{`
        @media (max-width: 900px) {
          .featured-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .farmers-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .farmers-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .farmers-grid { grid-template-columns: 1fr !important; }
          .farmers-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
