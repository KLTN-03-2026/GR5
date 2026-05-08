import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: "#fff", borderTop: "1px solid #e5e7eb", marginTop: "auto" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "40px 24px 0",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 32,
        }}
        className="footer-grid"
      >
        {/* Brand */}
        <div>
          <Link
            href="/"
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#16a34a",
              textDecoration: "none",
              display: "block",
              marginBottom: 12,
            }}
          >
            Verdant Curator
          </Link>
          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              lineHeight: 1.7,
              marginBottom: 20,
              maxWidth: 200,
            }}
          >
            Rau củ quả tươi sạch Đà Nẵng — giao nội thành 2 giờ. Đặc sản miền Trung ship toàn quốc.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="#" className="footer-social-btn">
              <FaFacebookF style={{ width: 14, height: 14 }} />
            </a>
            <a href="#" className="footer-social-btn">
              <FaInstagram style={{ width: 14, height: 14 }} />
            </a>
            <a href="#" className="footer-social-btn">
              <FaYoutube style={{ width: 14, height: 14 }} />
            </a>
          </div>
        </div>

        {/* Hệ thống */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
            Hệ thống
          </h4>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {["Về chúng tôi", "Nguồn cung bền vững", "Hệ thống đối tác", "Liên hệ"].map((text) => (
              <li key={text}>
                <a href="#" className="footer-link">{text}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Chính sách */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
            Chính sách
          </h4>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Chính sách giao hàng",
              "Điều khoản dịch vụ",
              "Bảo mật thông tin",
              "Hoàn trả hàng",
            ].map((text) => (
              <li key={text}>
                <a href="#" className="footer-link">{text}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Khu vực phục vụ */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
            Khu vực phục vụ
          </h4>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            <li style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
              <span style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                <span style={{ color: "#16a34a", fontWeight: 700, flexShrink: 0 }}>🛵</span>
                <span>
                  <span style={{ color: "#111827", fontWeight: 600 }}>Nội thành Đà Nẵng</span>
                  <br />
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>Giao trong 2 giờ</span>
                </span>
              </span>
            </li>
            <li style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
              <span style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                <span style={{ color: "#1d4ed8", fontWeight: 700, flexShrink: 0 }}>🚚</span>
                <span>
                  <span style={{ color: "#111827", fontWeight: 600 }}>Hội An · Điện Bàn · Tam Kỳ</span>
                  <br />
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>Giao 4–6 giờ</span>
                </span>
              </span>
            </li>
            <li style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
              <span style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                <span style={{ color: "#c2410c", fontWeight: 700, flexShrink: 0 }}>✈️</span>
                <span>
                  <span style={{ color: "#111827", fontWeight: 600 }}>Toàn quốc — đặc sản khô</span>
                  <br />
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>2–3 ngày</span>
                </span>
              </span>
            </li>
            <li style={{ marginTop: 4 }}>
              <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
                📞 Hotline: 1900 xxxx
              </span>
            </li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
            Liên hệ
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <MapPin style={{ width: 14, height: 14, color: "#16a34a", flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                123 Đường Nông Nghiệp, Quận 1, TP.HCM
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <Phone style={{ width: 14, height: 14, color: "#16a34a", flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                1900 1234 (8:00 - 21:00)
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <Mail style={{ width: 14, height: 14, color: "#16a34a", flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                hello@verdantcurator.vn
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div
        style={{
          maxWidth: 1200,
          margin: "24px auto 0",
          padding: "16px 24px",
          borderTop: "1px solid #f3f4f6",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
          © 2026 Verdant Curator · Rau sạch Đà Nẵng · Giao 2 giờ nội thành · Đặc sản miền Trung ship toàn quốc
        </p>
      </div>
    </footer>
  );
}
