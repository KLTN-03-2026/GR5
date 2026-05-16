"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── tiny hook: trigger once when element enters viewport ─── */
function useInView(threshold = 0.15) {
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

/* ─── animated counter ─── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useInView();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target]);
  return <span ref={ref}>{val.toLocaleString("vi-VN")}{suffix}</span>;
}

/* ─── fade-up wrapper ─── */
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "var(--font-sans)", background: "#fff", overflowX: "hidden" }}>

      {/* ══════════════════════════════════════════
          HERO — cánh đồng + câu mở đầu
      ══════════════════════════════════════════ */}
      <section ref={heroRef} style={{ position: "relative", height: "100vh", minHeight: 600, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {/* parallax bg */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1800&q=80)`,
          backgroundSize: "cover", backgroundPosition: "center",
          transform: `translateY(${scrollY * 0.35}px)`,
          transition: "transform 0s",
          willChange: "transform",
        }} />
        {/* gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,20,8,0.7) 60%, #0a1a0c 100%)" }} />

        <div style={{ position: "relative", textAlign: "center", padding: "0 24px", maxWidth: 780, zIndex: 2 }}>
          <div style={{ display: "inline-block", background: "rgba(22,163,74,0.25)", border: "1px solid rgba(134,239,172,0.4)", borderRadius: 99, padding: "6px 18px", fontSize: 12, color: "#86efac", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 28 }}>
            Câu chuyện của chúng tôi
          </div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800, color: "#fff", margin: "0 0 24px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Từ bàn tay nông dân<br />
            <span style={{ color: "#4ade80" }}>đến bàn ăn của bạn</span>
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.75)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 40px" }}>
            Không qua trung gian. Không hoá chất. Chỉ là tình yêu của người trồng
            và sự tin tưởng của người dùng — kết nối bằng công nghệ.
          </p>
          <a href="#story" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#16a34a", color: "#fff", padding: "14px 32px", borderRadius: 99, fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 0 32px rgba(22,163,74,0.5)" }}>
            Đọc câu chuyện ↓
          </a>
        </div>

        {/* scroll cue */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.5))", animation: "scrollLine 1.8s ease-in-out infinite" }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CÂU CHUYỆN — Ông Tám
      ══════════════════════════════════════════ */}
      <section id="story" style={{ background: "#0a1a0c", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* quote lớn */}
          <FadeUp>
            <blockquote style={{ textAlign: "center", margin: "0 0 80px" }}>
              <p style={{ fontSize: "clamp(22px, 3.5vw, 40px)", color: "#f0fdf4", fontWeight: 300, lineHeight: 1.7, fontStyle: "italic", maxWidth: 800, margin: "0 auto 20px" }}>
                "Con cháu tôi ăn rau tôi trồng. Khách hàng của Verdant Curator cũng vậy.
                Tôi chỉ trồng một loại rau thôi — loại rau tôi dám cho gia đình ăn."
              </p>
              <cite style={{ fontSize: 14, color: "#4ade80", fontStyle: "normal", fontWeight: 600, letterSpacing: "0.05em" }}>
                — Ông Nguyễn Văn Tám, 62 tuổi · Nông trại Đà Lạt
              </cite>
            </blockquote>
          </FadeUp>

          {/* timeline */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2px 1fr", gap: "0 0", position: "relative" }} className="story-timeline">
            {[
              {
                year: "2018",
                side: "left",
                title: "Mùa hạn hán đầu tiên",
                body: "Ông Tám mất trắng vụ rau vì không có đầu ra. Thương lái ép giá 500đ/kg cải, trong khi siêu thị bán 18.000đ. Ông ngồi khóc giữa ruộng, tay vẫn cầm bó rau.",
                img: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80",
                color: "#fbbf24",
              },
              {
                year: "2020",
                side: "right",
                title: "Người trẻ về làng",
                body: "Minh — 26 tuổi, bỏ việc IT ở Sài Gòn — về Đà Lạt thăm ông ngoại. Nhìn thấy cánh đồng rau sạch không ai mua, anh chụp ảnh đăng Facebook. 3 ngày, 400 đơn hàng đổ về.",
                img: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&q=80",
                color: "#60a5fa",
              },
              {
                year: "2021",
                side: "left",
                title: "Verdant Curator ra đời",
                body: "Không phải startup bóng bẩy. Chỉ là một website đơn giản, một kho lạnh thuê ở Bình Dương, và 12 nông dân tin tưởng giao sản phẩm. Slogan đầu tiên viết tay trên tường: \"Sạch từ đất. Thật từ tâm.\"",
                img: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80",
                color: "#4ade80",
              },
              {
                year: "2024",
                side: "right",
                title: "Hôm nay",
                body: "300+ nông hộ. 50.000 gia đình tin dùng. Mỗi đơn hàng rời kho trong vòng 24 giờ. Ông Tám giờ gọi video với khách hàng ở Hà Nội mỗi tuần — ông vẫn không biết dùng smartphone, nhưng ông biết tên từng người mua.",
                img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
                color: "#f472b6",
              },
            ].map((item, i) => (
              <React.Fragment key={i}>
                {item.side === "left" ? (
                  <>
                    <FadeUp delay={0.1} className="story-left">
                      <div style={{ padding: "0 48px 80px 0", textAlign: "right" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: item.color, letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.year}</span>
                        <h3 style={{ fontSize: 22, fontWeight: 700, color: "#f0fdf4", margin: "8px 0 12px", lineHeight: 1.3 }}>{item.title}</h3>
                        <p style={{ fontSize: 15, color: "rgba(240,253,244,0.65)", lineHeight: 1.85, marginBottom: 16 }}>{item.body}</p>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <img src={item.img} alt={item.title} style={{ width: "100%", maxWidth: 340, height: 200, objectFit: "cover", borderRadius: 12, opacity: 0.9 }} />
                        </div>
                      </div>
                    </FadeUp>
                    {/* center line + dot */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: item.color, boxShadow: `0 0 12px ${item.color}`, marginTop: 4, flexShrink: 0 }} />
                      <div style={{ flex: 1, width: 2, background: "rgba(255,255,255,0.08)" }} />
                    </div>
                    <div />
                  </>
                ) : (
                  <>
                    <div />
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: item.color, boxShadow: `0 0 12px ${item.color}`, marginTop: 4, flexShrink: 0 }} />
                      <div style={{ flex: 1, width: 2, background: "rgba(255,255,255,0.08)" }} />
                    </div>
                    <FadeUp delay={0.1} className="story-right">
                      <div style={{ padding: "0 0 80px 48px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: item.color, letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.year}</span>
                        <h3 style={{ fontSize: 22, fontWeight: 700, color: "#f0fdf4", margin: "8px 0 12px", lineHeight: 1.3 }}>{item.title}</h3>
                        <p style={{ fontSize: 15, color: "rgba(240,253,244,0.65)", lineHeight: 1.85, marginBottom: 16 }}>{item.body}</p>
                        <img src={item.img} alt={item.title} style={{ width: "100%", maxWidth: 340, height: 200, objectFit: "cover", borderRadius: 12, opacity: 0.9 }} />
                      </div>
                    </FadeUp>
                  </>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          NUMBERS — con số biết nói
      ══════════════════════════════════════════ */}
      <section style={{ background: "#052e16", padding: "80px 24px", borderTop: "1px solid rgba(74,222,128,0.15)", borderBottom: "1px solid rgba(74,222,128,0.15)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <FadeUp>
            <p style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#4ade80", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 48 }}>Con số không biết nói dối</p>
          </FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, textAlign: "center" }} className="stats-grid">
            {[
              { target: 300, suffix: "+", label: "Nông hộ hợp tác", color: "#4ade80" },
              { target: 50000, suffix: "+", label: "Gia đình tin dùng", color: "#60a5fa" },
              { target: 24, suffix: "h", label: "Giao hàng tươi", color: "#fbbf24" },
              { target: 0, suffix: " hoá chất", label: "Cam kết tuyệt đối", color: "#f472b6" },
            ].map((s, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div style={{ padding: "24px 16px" }}>
                  <p style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, color: s.color, margin: "0 0 8px", lineHeight: 1 }}>
                    <Counter target={s.target} suffix={s.suffix} />
                  </p>
                  <p style={{ fontSize: 13, color: "rgba(240,253,244,0.55)", margin: 0, lineHeight: 1.5 }}>{s.label}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          GIÁ TRỊ CỐT LÕI
      ══════════════════════════════════════════ */}
      <section style={{ background: "#f0fdf4", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Chúng tôi tin vào điều gì</p>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#052e16", margin: 0, lineHeight: 1.2 }}>Ba nguyên tắc không thỏa hiệp</h2>
            </div>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="values-grid">
            {[
              {
                icon: "🌱",
                title: "Sạch từ gốc rễ",
                desc: "Mỗi nông trại hợp tác được kiểm định đất, nước, và quy trình canh tác trước khi ký hợp đồng. Chúng tôi từ chối 60% đơn xin hợp tác vì không đạt tiêu chuẩn.",
                accent: "#16a34a",
                bg: "#dcfce7",
              },
              {
                icon: "🤝",
                title: "Công bằng với nông dân",
                desc: "Nông dân nhận tối thiểu 70% giá bán lẻ — cao gấp 4 lần mức thương lái trả. Không ép giá. Không bỏ hàng tồn. Chúng tôi chia sẻ rủi ro cùng họ.",
                accent: "#0284c7",
                bg: "#e0f2fe",
              },
              {
                icon: "♻️",
                title: "Trách nhiệm với đất",
                desc: "100% bao bì có thể tái chế. Carbon neutral từ 2023. Mỗi đơn hàng trên 200.000đ, chúng tôi trồng thêm 1 cây xanh tại Tây Nguyên.",
                accent: "#d97706",
                bg: "#fef3c7",
              },
            ].map((v, i) => (
              <FadeUp key={i} delay={i * 0.15}>
                <div style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", border: "1px solid #e5e7eb", height: "100%", boxSizing: "border-box", transition: "transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.transform = "none"; el.style.boxShadow = "none"; }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: v.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 20 }}>
                    {v.icon}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#052e16", margin: "0 0 12px" }}>{v.title}</h3>
                  <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.85, margin: 0 }}>{v.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          NÔNG DÂN — mặt người thật
      ══════════════════════════════════════════ */}
      <section style={{ background: "#fff", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Con người</p>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#052e16", margin: 0 }}>Những người giữ đất sống</h2>
            </div>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="farmers-grid">
            {[
              {
                name: "Ông Nguyễn Văn Tám",
                role: "Rau thủy canh · Đà Lạt · 22 năm",
                quote: "Tôi không biết marketing là gì. Tôi chỉ biết trồng rau đúng cách.",
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
                products: ["Rau muống", "Cải thìa", "Xà lách"],
                tag: "#1 bán chạy",
                tagColor: "#16a34a",
              },
              {
                name: "Bà Trần Thị Hoa",
                role: "Trái cây hữu cơ · Tiền Giang · 15 năm",
                quote: "Xoài nhà tôi ngọt vì đất ngọt, không phải vì thuốc.",
                img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
                products: ["Xoài cát", "Chôm chôm", "Sầu riêng"],
                tag: "Bestseller tháng",
                tagColor: "#d97706",
              },
              {
                name: "Anh Lê Văn Bình",
                role: "Nấm sạch · Gia Lai · 8 năm",
                quote: "Ba tôi trồng cà phê, tôi chuyển sang nấm. Đất vẫn là đất của gia đình.",
                img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
                products: ["Nấm rơm", "Nấm linh chi", "Nấm bào ngư"],
                tag: "Mới hợp tác",
                tagColor: "#7c3aed",
              },
            ].map((f, i) => (
              <FadeUp key={i} delay={i * 0.12}>
                <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e5e7eb", background: "#fff" }}>
                  <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
                    <img src={f.img} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,46,22,0.7) 0%, transparent 60%)" }} />
                    <span style={{ position: "absolute", top: 14, right: 14, background: f.tagColor, color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>{f.tag}</span>
                    <div style={{ position: "absolute", bottom: 14, left: 16, right: 16 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 2px" }}>{f.name}</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0 }}>{f.role}</p>
                    </div>
                  </div>
                  <div style={{ padding: "20px 20px 24px" }}>
                    <p style={{ fontSize: 14, color: "#374151", fontStyle: "italic", lineHeight: 1.75, margin: "0 0 16px" }}>"{f.quote}"</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {f.products.map(p => (
                        <span key={p} style={{ fontSize: 11, background: "#f0fdf4", color: "#16a34a", padding: "3px 10px", borderRadius: 99, fontWeight: 500, border: "1px solid #bbf7d0" }}>{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HÀNH TRÌNH RAU — infographic ngang
      ══════════════════════════════════════════ */}
      <section style={{ background: "#052e16", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeUp>
            <p style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#4ade80", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Từ đồng ruộng đến tay bạn</p>
            <h2 style={{ textAlign: "center", fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, color: "#f0fdf4", margin: "0 0 56px" }}>Chỉ 36 giờ</h2>
          </FadeUp>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
            {[
              { icon: "🌿", time: "Sáng sớm", title: "Thu hoạch", desc: "Nông dân hái lúc 4–5 giờ sáng khi rau còn đẫm sương" },
              { icon: "🧊", time: "6:00 SA", title: "Làm lạnh nhanh", desc: "Đưa vào kho lạnh 2–4°C trong vòng 1 giờ sau thu hoạch" },
              { icon: "🔍", time: "7:00 SA", title: "Kiểm định", desc: "Mẫu rau được test dư lượng thuốc trừ sâu tại chỗ" },
              { icon: "📦", time: "9:00 SA", title: "Đóng gói", desc: "Bao bì tái chế, dán QR truy xuất nguồn gốc" },
              { icon: "🚚", time: "11:00 SA", title: "Lên xe", desc: "Xe lạnh chuyên dụng xuất bến, tối ưu tuyến đường" },
              { icon: "🏠", time: "Tối hôm đó", title: "Đến tay bạn", desc: "Tươi ngon, đúng hẹn — không thì hoàn tiền 100%" },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <FadeUp delay={i * 0.08}>
                  <div style={{ textAlign: "center", minWidth: 130, flex: "1 0 130px", padding: "0 8px" }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 10px" }}>
                      {step.icon}
                    </div>
                    <p style={{ fontSize: 11, color: "#4ade80", fontWeight: 700, margin: "0 0 4px", letterSpacing: "0.05em" }}>{step.time}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#f0fdf4", margin: "0 0 6px" }}>{step.title}</p>
                    <p style={{ fontSize: 12, color: "rgba(240,253,244,0.5)", lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                  </div>
                </FadeUp>
                {i < 5 && (
                  <div style={{ flex: "0 0 24px", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 16, color: "rgba(74,222,128,0.3)", fontSize: 18, minWidth: 24 }}>›</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section style={{ background: "#fafaf9", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeUp>
            <p style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#16a34a", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Họ nói về chúng tôi</p>
            <h2 style={{ textAlign: "center", fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 800, color: "#052e16", margin: "0 0 56px" }}>Không phải quảng cáo, đây là sự thật</h2>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="testimonials-grid">
            {[
              { name: "Chị Nguyễn Thảo", role: "Mẹ 2 con · Hà Nội", text: "Con tôi vốn không chịu ăn rau, nhưng kể từ khi dùng rau của Verdant, nó tự đòi ăn thêm. Có lẽ vì rau ngon thật sự.", stars: 5, img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" },
              { name: "Anh Trần Minh Đức", role: "Bếp trưởng nhà hàng · TP.HCM", text: "Tôi đã thử 12 nhà cung cấp rau sạch trong 5 năm. Verdant Curator là nhà cung cấp duy nhất tôi không cần kiểm tra lại sau khi nhận hàng.", stars: 5, img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" },
              { name: "Bà Lê Bích Thủy", role: "Hưu trí · Đà Nẵng", text: "Tôi 68 tuổi, lần đầu mua hàng online là vì con gái đặt thử. Giờ mỗi tuần tôi tự đặt, không cần con giúp nữa. Giao diện dễ quá.", stars: 5, img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&q=80" },
            ].map((t, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", border: "1px solid #e5e7eb", height: "100%", boxSizing: "border-box" }}>
                  <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                    {[...Array(t.stars)].map((_, j) => <span key={j} style={{ color: "#fbbf24", fontSize: 15 }}>★</span>)}
                  </div>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.85, fontStyle: "italic", margin: "0 0 20px" }}>"{t.text}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={t.img} alt={t.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{t.name}</p>
                      <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA cuối trang
      ══════════════════════════════════════════ */}
      <section style={{ background: "#052e16", padding: "100px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* bg decoration */}
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

        <FadeUp>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20, position: "relative" }}>Bắt đầu hành trình</p>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 800, color: "#f0fdf4", margin: "0 0 20px", lineHeight: 1.2, position: "relative" }}>
            Mỗi bữa ăn là một<br />
            <span style={{ color: "#4ade80" }}>lựa chọn có ý nghĩa</span>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(240,253,244,0.6)", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.8, position: "relative" }}>
            Khi bạn chọn rau sạch từ Verdant Curator, bạn không chỉ nuôi dưỡng gia đình —
            bạn đang giúp một ông nông dân ở Đà Lạt tiếp tục trồng rau đúng cách.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
            <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#16a34a", color: "#fff", padding: "16px 36px", borderRadius: 99, fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 0 40px rgba(22,163,74,0.4)", transition: "transform 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
              Khám phá nông sản →
            </Link>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#f0fdf4", padding: "16px 36px", borderRadius: 99, fontSize: 15, fontWeight: 500, textDecoration: "none", border: "1px solid rgba(240,253,244,0.2)", transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(240,253,244,0.5)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(240,253,244,0.2)")}>
              Về trang chủ
            </Link>
          </div>
        </FadeUp>
      </section>

      <style>{`
        @keyframes scrollLine {
          0% { opacity: 0; transform: scaleY(0); transform-origin: top; }
          50% { opacity: 1; transform: scaleY(1); transform-origin: top; }
          100% { opacity: 0; transform: scaleY(1); transform-origin: bottom; }
        }
        @media (max-width: 900px) {
          .story-timeline { grid-template-columns: 2px 1fr !important; }
          .story-left > div { padding: 0 0 60px 24px !important; text-align: left !important; }
          .story-left > div img { max-width: 100% !important; }
          .story-left > div > div { justify-content: flex-start !important; }
          .story-right > div { padding: 0 0 60px 24px !important; }
          .story-right > div img { max-width: 100% !important; }
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .values-grid { grid-template-columns: 1fr !important; }
          .farmers-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
