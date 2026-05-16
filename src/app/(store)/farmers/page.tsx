"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform, useInView, useSpring } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Droplets,
  Leaf,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  SunMedium,
  Tractor,
  X,
  Heart,
  Award,
  TreePine,
  Quote,
} from "lucide-react";

type Farmer = {
  id: number;
  name: string;
  age: number;
  location: string;
  since: number;
  specialty: string;
  products: string[];
  cert: string;
  avatar: string;
  farm_img: string;
  quote: string;
  story: string;
  income_change: string;
  rating: number;
  reviews: number;
  tag: string;
};

const FARMERS: Farmer[] = [
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
    farm_img: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=900&q=85",
    quote: "Con cháu tôi ăn rau tôi trồng. Khách hàng cũng vậy.",
    story: "Ông Tám gắn bó với đất Đà Lạt hơn 40 năm. Từng mất trắng vì thương lái ép giá, nay ông là nông dân đầu tiên hợp tác với Freshy và thu nhập tăng gấp 4 lần nhờ bán thẳng đến người dùng.",
    income_change: "+320%",
    rating: 4.9,
    reviews: 847,
    tag: "Bestseller",
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
    farm_img: "https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=900&q=85",
    quote: "Xoài nhà tôi ngọt vì đất ngọt, không phải vì thuốc.",
    story: "Bà Hoa kế thừa 3 hecta vườn xoài của cha. Dù nhiều người khuyên chuyển sang trồng công nghiệp, bà vẫn kiên trì canh tác tự nhiên.",
    income_change: "+280%",
    rating: 4.8,
    reviews: 612,
    tag: "Top rated",
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
    farm_img: "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=900&q=85",
    quote: "Đất vẫn là đất gia đình, chỉ là chúng tôi đang kể một câu chuyện mới.",
    story: "Bình tốt nghiệp Đại học Nông Lâm, bỏ phố về quê khi thấy cha già vẫn phải gánh nặng nợ nần. Anh chuyển đổi 1,2ha cà phê già cỗi thành trại nấm hiện đại, ứng dụng IoT kiểm soát nhiệt độ.",
    income_change: "+510%",
    rating: 4.7,
    reviews: 289,
    tag: "Rising star",
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
    farm_img: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=85",
    quote: "Người Mông chúng tôi trồng rau trên núi hàng trăm năm.",
    story: "Lan là người H'Mông đầu tiên trong bản có smartphone, cũng là người đầu tiên bán rau trực tuyến. Chị học tiếng Kinh để có thể đọc hợp đồng, rồi dạy lại cho 15 hộ trong bản cùng tham gia.",
    income_change: "+390%",
    rating: 4.9,
    reviews: 431,
    tag: "Câu chuyện nổi bật",
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
    farm_img: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=900&q=85",
    quote: "Cà phê của tôi được trồng dưới tán rừng. Chậm mà chắc.",
    story: "Tùng từng là kỹ sư xây dựng. Về Đắk Lắk mua 5ha đất bạc màu, mất 4 năm để phục hồi độ màu tự nhiên trước khi trồng cà phê dưới tán rừng.",
    income_change: "+180%",
    rating: 4.8,
    reviews: 723,
    tag: "Certified",
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
    farm_img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=85",
    quote: "Làng Trà Quế 500 năm chỉ dùng rong biển và bùn sông để bón rau.",
    story: "Bà Mai là đời thứ 6 trồng rau Trà Quế. Khi dự án du lịch đe dọa diện tích đất làng, bà đứng ra vận động và ký được hợp đồng với Freshy, đảm bảo đầu ra ổn định.",
    income_change: "+220%",
    rating: 5.0,
    reviews: 156,
    tag: "Di sản",
  },
];

const STATS = [
  { value: 300, suffix: "+", label: "Nông hộ đang canh tác", icon: Sprout },
  { value: 24, suffix: "h", label: "Từ vườn đến kho lạnh", icon: Clock3 },
  { value: 70, suffix: "%", label: "Giá trị về tay nhà vườn", icon: Heart },
  { value: 4.8, suffix: "", label: "Điểm đánh giá trung bình", icon: Star },
];

const CERT_MAP: Record<string, string> = {
  VietGAP: "#16a34a",
  Organic: "#ea580c",
  GlobalGAP: "#2563eb",
  "Rainforest Alliance": "#059669",
  "Làng rau truyền thống": "#b45309",
};

const GARDEN_STEPS = [
  { time: "04:30", icon: SunMedium, title: "Đón sương sớm", desc: "Nhà vườn hái khi lá còn mát, giữ độ giòn và mùi rau non tự nhiên." },
  { time: "06:10", icon: Droplets, title: "Rửa bằng nước sạch", desc: "Từng bó rau được làm sạch nhẹ tay, không ngâm hóa chất tạo bóng." },
  { time: "07:20", icon: ShieldCheck, title: "Kiểm tra tại vườn", desc: "Đội thu mua ghi nhận lô, nguồn nước, tình trạng lá và chứng nhận." },
  { time: "09:00", icon: PackageCheck, title: "Đóng gói mát", desc: "Rau vào thùng thoáng khí, đi kho lạnh ngay trong buổi sáng." },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const spring = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (isInView) spring.set(value);
  }, [isInView, value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => {
      if (ref.current) {
        const display = value % 1 !== 0 ? v.toFixed(1) : Math.round(v).toString();
        ref.current.textContent = display + suffix;
      }
    });
    return unsubscribe;
  }, [spring, value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

function FarmerCard({ farmer, onOpen, index }: { farmer: Farmer; onOpen: (f: Farmer) => void; index: number }) {
  const certColor = CERT_MAP[farmer.cert] || "#16a34a";

  return (
    <motion.button
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      onClick={() => onOpen(farmer)}
      type="button"
      style={{
        display: "flex", flexDirection: "column", width: "100%", border: "none",
        borderRadius: 20, overflow: "hidden", background: "#fff", textAlign: "left",
        cursor: "pointer", boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.3s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 20px 50px rgba(22,163,106,0.12), 0 4px 12px rgba(0,0,0,0.06)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)"; }}
    >
      <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden" }}>
        <motion.img
          src={farmer.farm_img}
          alt={farmer.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6))" }} />

        <span style={{
          position: "absolute", top: 12, left: 12,
          background: certColor, color: "#fff",
          padding: "5px 10px", borderRadius: 8,
          fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <BadgeCheck size={12} />
          {farmer.cert}
        </span>

        <span style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
          color: "#fff", padding: "5px 9px", borderRadius: 8,
          fontSize: 12, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <Star size={12} fill="#fbbf24" color="#fbbf24" />
          {farmer.rating}
        </span>

        <div style={{
          position: "absolute", bottom: 12, left: 12, right: 12,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <img src={farmer.avatar} alt="" style={{
            width: 44, height: 44, borderRadius: "50%", objectFit: "cover", objectPosition: "top",
            border: "2.5px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }} />
          <div>
            <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{farmer.name}</p>
            <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 12, display: "flex", alignItems: "center", gap: 3 }}>
              <MapPin size={11} /> {farmer.location}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0",
            padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
          }}>
            {farmer.specialty}
          </span>
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            Từ {farmer.since}
          </span>
        </div>

        <p style={{
          margin: 0, color: "#4b5563", fontSize: 13.5, lineHeight: 1.6,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          fontStyle: "italic",
        }}>
          &ldquo;{farmer.quote}&rdquo;
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {farmer.products.slice(0, 3).map((p) => (
            <span key={p} style={{
              background: "#f9fafb", border: "1px solid #e5e7eb",
              padding: "3px 8px", borderRadius: 6, fontSize: 11.5, color: "#374151", fontWeight: 500,
            }}>{p}</span>
          ))}
          {farmer.products.length > 3 && (
            <span style={{ padding: "3px 8px", fontSize: 11.5, color: "#9ca3af" }}>
              +{farmer.products.length - 3}
            </span>
          )}
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: "auto", paddingTop: 12, borderTop: "1px solid #f3f4f6",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#16a34a", fontWeight: 800, fontSize: 16 }}>{farmer.income_change}</span>
            <span style={{ color: "#9ca3af", fontSize: 11.5 }}>thu nhập</span>
          </div>
          <span style={{
            display: "flex", alignItems: "center", gap: 4,
            color: "#16a34a", fontSize: 13, fontWeight: 600,
          }}>
            Xem vườn <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function FarmerModal({ farmer, onClose }: { farmer: Farmer | null; onClose: () => void }) {
  useEffect(() => {
    if (farmer) {
      document.body.style.overflow = "hidden";
      const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
      window.addEventListener("keydown", handler);
      return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handler); };
    }
    document.body.style.overflow = "";
  }, [farmer, onClose]);

  return (
    <AnimatePresence>
      {farmer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          }}
        >
          <motion.article
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{
              width: "min(780px, 100%)", maxHeight: "88vh", overflow: "auto",
              borderRadius: 24, background: "#fff",
              boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ position: "relative", height: 280, overflow: "hidden" }}>
              <img src={farmer.farm_img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.7))" }} />

              <button onClick={onClose} style={{
                position: "absolute", top: 16, right: 16, zIndex: 2,
                width: 40, height: 40, borderRadius: 12,
                background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <X size={18} />
              </button>

              <div style={{
                position: "absolute", bottom: 20, left: 24, right: 24,
                display: "flex", alignItems: "flex-end", gap: 14, color: "#fff",
              }}>
                <img src={farmer.avatar} alt="" style={{
                  width: 64, height: 64, borderRadius: "50%", objectFit: "cover", objectPosition: "top",
                  border: "3px solid #fff", boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                }} />
                <div>
                  <span style={{
                    display: "inline-block", background: "#16a34a", color: "#fff",
                    padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, marginBottom: 6,
                  }}>{farmer.tag}</span>
                  <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>{farmer.name}</h2>
                  <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                    {farmer.age} tuổi · {farmer.location}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ padding: "24px 28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0",
                  padding: "7px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                }}>
                  <BadgeCheck size={15} /> {farmer.cert}
                </span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: "#fefce8", color: "#a16207", border: "1px solid #fde047",
                  padding: "7px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                }}>
                  <Star size={15} fill="#fbbf24" color="#fbbf24" /> {farmer.rating} ({farmer.reviews} đánh giá)
                </span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0",
                  padding: "7px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                }}>
                  <Sprout size={15} /> {farmer.income_change} thu nhập
                </span>
              </div>

              <blockquote style={{
                margin: 0, padding: "18px 20px", borderRadius: 14,
                background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                border: "1px solid #d1fae5",
                fontSize: 16, lineHeight: 1.7, color: "#1f2937", fontWeight: 500, fontStyle: "italic",
                position: "relative",
              }}>
                <Quote size={20} style={{ position: "absolute", top: 12, left: 14, color: "#86efac", opacity: 0.6 }} />
                <span style={{ position: "relative", zIndex: 1 }}>&ldquo;{farmer.quote}&rdquo;</span>
              </blockquote>

              <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.75, fontSize: 14.5 }}>
                {farmer.story}
              </p>

              <div>
                <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#111827" }}>Sản phẩm đang vào mùa</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {farmer.products.map((p) => (
                    <span key={p} style={{
                      background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0",
                      padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                    }}>{p}</span>
                  ))}
                </div>
              </div>

              <Link href="/products" onClick={onClose} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", padding: "14px 0", borderRadius: 12,
                background: "#16a34a", color: "#fff",
                fontSize: 15, fontWeight: 700, textDecoration: "none",
                transition: "background 0.2s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#15803d"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#16a34a"; }}
              >
                Xem nông sản từ vườn này <ArrowRight size={18} />
              </Link>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function FarmersPage() {
  const [selected, setSelected] = useState<Farmer | null>(null);
  const [filter, setFilter] = useState("Tất cả");
  const [query, setQuery] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const specialties = useMemo(() => ["Tất cả", ...Array.from(new Set(FARMERS.map((f) => f.specialty)))], []);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FARMERS.filter((f) => {
      const matchFilter = filter === "Tất cả" || f.specialty === filter;
      const matchQuery = !q || [f.name, f.location, f.specialty, f.cert, ...f.products].join(" ").toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [filter, query]);

  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <div style={{ background: "#fafdf7", minHeight: "100vh", overflow: "hidden" }}>

      {/* ===== HERO ===== */}
      <section ref={heroRef} style={{
        position: "relative", minHeight: "92vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        <motion.div style={{ position: "absolute", inset: "-10%", y: heroY, scale: heroScale }}>
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=2200&q=86"
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%" }}
          />
        </motion.div>

        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(5,46,22,0.82) 0%, rgba(20,83,45,0.55) 50%, rgba(5,46,22,0.7) 100%)",
        }} />

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0], x: [0, i % 2 ? 15 : -15, 0],
              rotate: [0, i % 2 ? 10 : -10, 0],
            }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              left: `${15 + i * 17}%`, top: `${20 + (i % 3) * 20}%`,
              width: 60 + i * 10, height: 30 + i * 5,
              borderRadius: "60% 10% 60% 10%",
              background: `rgba(134,239,172,${0.08 + i * 0.02})`,
              filter: "blur(1px)",
              pointerEvents: "none",
            }}
          />
        ))}

        <motion.div style={{ opacity: heroOpacity, position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px", maxWidth: 900 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "8px 16px", borderRadius: 50, marginBottom: 24,
              color: "#bbf7d0", fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
            }}>
              <Sparkles size={14} /> Sạch từ đất, tươi từ sớm
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            style={{
              margin: 0, color: "#fff",
              fontSize: "clamp(2.5rem, 7vw, 4.5rem)", fontWeight: 900,
              lineHeight: 1.05, letterSpacing: "-0.02em",
            }}
          >
            Bước vào vườn rau sạch<br />
            <span style={{ color: "#86efac" }}>của những người trồng thật</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            style={{
              maxWidth: 600, margin: "20px auto 0",
              color: "rgba(255,255,255,0.8)", fontSize: "clamp(1rem, 2vw, 1.15rem)", lineHeight: 1.7,
            }}
          >
            Mỗi luống rau trên Freshy có tên người chăm, vùng đất, mùa thu hoạch và câu chuyện phía sau.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}
          >
            <Link href="#garden-list" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#86efac", color: "#052e16",
              padding: "14px 28px", borderRadius: 12,
              fontSize: 15, fontWeight: 700, textDecoration: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 8px 30px rgba(134,239,172,0.3)",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(134,239,172,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(134,239,172,0.3)"; }}
            >
              Gặp nhà vườn <ArrowRight size={18} />
            </Link>
            <Link href="/products" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff", padding: "14px 28px", borderRadius: 12,
              fontSize: 15, fontWeight: 600, textDecoration: "none",
              transition: "background 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            >
              <Leaf size={16} /> Mua rau đang vào mùa
            </Link>
          </motion.div>
        </motion.div>

        {/* Fresh badge */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          style={{
            position: "absolute", bottom: 32, right: "clamp(16px, 4vw, 48px)",
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.15)",
            padding: "12px 16px", borderRadius: 14, color: "#fff", zIndex: 1,
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(134,239,172,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sprout size={18} color="#86efac" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Thu hoạch sáng nay</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: "#86efac" }}>Đà Lạt, Hội An, Cái Bè</p>
          </div>
        </motion.div>
      </section>

      {/* ===== STATS ===== */}
      <section style={{
        position: "relative", zIndex: 2, maxWidth: 1100, margin: "-48px auto 0",
        padding: "0 20px", display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14,
      }}>
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              style={{
                background: "#fff", borderRadius: 16, padding: "22px 20px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                display: "flex", flexDirection: "column", gap: 6,
              }}
            >
              <Icon size={20} color="#16a34a" />
              <span style={{ fontSize: 28, fontWeight: 900, color: "#111827", lineHeight: 1 }}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </span>
              <span style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.4 }}>{stat.label}</span>
            </motion.div>
          );
        })}
      </section>

      {/* ===== INTRO ===== */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 20px 40px" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "end" }}
        >
          <div>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              padding: "6px 12px", borderRadius: 8,
              fontSize: 12, fontWeight: 700, color: "#16a34a",
              textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14,
            }}>
              <TreePine size={13} /> Mạng lưới nhà vườn
            </span>
            <h2 style={{
              margin: 0, fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 900, color: "#111827", lineHeight: 1.1, maxWidth: 600,
            }}>
              Không phải danh sách nhà cung cấp.<br />
              <span style={{ color: "#16a34a" }}>Đây là những khu vườn đang thở.</span>
            </h2>
          </div>
          <div style={{
            maxWidth: 320, padding: 20, borderRadius: 16,
            background: "#052e16", color: "#d1fae5",
          }}>
            <Tractor size={22} color="#86efac" />
            <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.65, color: "#a7f3d0" }}>
              Ưu tiên nông hộ nhỏ, canh tác rõ nguồn nước, đất và nhật ký mùa vụ.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ===== FARMER LIST ===== */}
      <section id="garden-list" style={{ maxWidth: 1180, margin: "0 auto", padding: "20px 20px 80px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}
        >
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            maxWidth: 480, padding: "12px 16px",
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14,
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}>
            <Search size={18} color="#16a34a" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo vùng, chứng nhận, nông sản..."
              style={{
                flex: 1, border: "none", outline: "none", background: "transparent",
                fontSize: 14, color: "#111827",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {specialties.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  border: "none", borderRadius: 10, cursor: "pointer",
                  padding: "9px 16px", fontSize: 13, fontWeight: 600,
                  background: filter === s ? "#16a34a" : "#f3f4f6",
                  color: filter === s ? "#fff" : "#4b5563",
                  transition: "all 0.2s",
                  boxShadow: filter === s ? "0 4px 14px rgba(22,163,106,0.25)" : "none",
                }}
              >{s}</button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {shown.length > 0 ? (
            <motion.div
              key={filter + query}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 20,
              }}
            >
              {shown.map((farmer, idx) => (
                <FarmerCard key={farmer.id} farmer={farmer} onOpen={setSelected} index={idx} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280" }}
            >
              <Sprout size={48} color="#d1d5db" style={{ marginBottom: 16 }} />
              <h3 style={{ margin: "0 0 8px", color: "#374151", fontSize: 18 }}>Chưa tìm thấy khu vườn phù hợp</h3>
              <p style={{ margin: 0, fontSize: 14 }}>Thử bỏ bớt bộ lọc hoặc tìm theo tên nông sản khác.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ===== MORNING PATH ===== */}
      <section style={{
        maxWidth: 1180, margin: "0 auto", padding: "40px 20px 80px",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center",
      }}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ position: "relative", borderRadius: 20, overflow: "hidden", aspectRatio: "3/4", maxHeight: 540 }}
        >
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=86"
            alt="Luống rau xanh"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute", bottom: 16, left: 16, right: 16,
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
            padding: "10px 14px", borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 600,
          }}>
            <Droplets size={16} color="#86efac" /> Rau còn hơi sương khi lên xe lạnh
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            padding: "6px 12px", borderRadius: 8,
            fontSize: 12, fontWeight: 700, color: "#16a34a",
            textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14,
          }}>
            <Clock3 size={13} /> Một buổi sáng ở vườn
          </span>
          <h2 style={{ margin: "0 0 24px", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 900, color: "#111827", lineHeight: 1.15 }}>
            Từ luống rau đến giỏ hàng,<br />mọi bước đều giữ độ tươi.
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {GARDEN_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  style={{
                    display: "grid", gridTemplateColumns: "50px 40px 1fr", gap: 12, alignItems: "center",
                    padding: "14px 16px", borderRadius: 14,
                    background: "#fff", border: "1px solid #f3f4f6",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  }}
                >
                  <time style={{ color: "#16a34a", fontWeight: 800, fontSize: 14 }}>{step.time}</time>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={18} color="#16a34a" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#111827" }}>{step.title}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ===== PLEDGE CTA ===== */}
      <section style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)",
        padding: "80px 20px",
      }}>
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 300, height: 300, borderRadius: "50%",
          background: "rgba(134,239,172,0.2)", filter: "blur(60px)",
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}
        >
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#dcfce7", border: "1px solid #bbf7d0",
            padding: "6px 12px", borderRadius: 8,
            fontSize: 12, fontWeight: 700, color: "#16a34a",
            textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16,
          }}>
            <Award size={13} /> Cam kết từ Freshy
          </span>

          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, color: "#111827", lineHeight: 1.1 }}>
            Mua rau sạch cũng là chọn cách<br /><span style={{ color: "#16a34a" }}>đất được chăm lại.</span>
          </h2>

          <p style={{ margin: "0 0 28px", color: "#4b5563", fontSize: 15, lineHeight: 1.7, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
            Mỗi đơn hàng hỗ trợ trực tiếp cho nông hộ canh tác tử tế. Chúng tôi trả giá minh bạch, kiểm tra chất lượng tại nguồn.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#16a34a", color: "#fff",
              padding: "14px 28px", borderRadius: 12,
              fontSize: 15, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 8px 24px rgba(22,163,106,0.2)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Chọn nông sản hôm nay <ArrowRight size={18} />
            </Link>
            <Link href="/about" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              border: "1.5px solid #16a34a", color: "#16a34a",
              padding: "14px 24px", borderRadius: 12,
              fontSize: 15, fontWeight: 600, textDecoration: "none", background: "transparent",
              transition: "background 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(22,163,106,0.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              Câu chuyện Freshy
            </Link>
          </div>
        </motion.div>
      </section>

      <FarmerModal farmer={selected} onClose={handleClose} />

      <style>{`
        @media (max-width: 900px) {
          section[style*="gridTemplateColumns: \"1fr 1fr\""],
          section:has(> .morning-path-grid) {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          section[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          section[style*="grid-template-columns: 1fr auto"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
