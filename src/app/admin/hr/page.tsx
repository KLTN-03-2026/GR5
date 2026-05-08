"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, CheckCircle2, Clock, AlertTriangle, XCircle,
  Banknote, CalendarDays, ClipboardList, Gift, Trophy,
  FileWarning, ChevronRight, TrendingUp, RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Metrics = {
  tongNhanVien: number; coMat: number; diTre: number;
  vangKhongPhep: number; nghiPhep: number; chiPhiLuong: number;
};

type CaNhanVien = { id: number; ho_ten: string; anh: string | null; da_cham_cong: boolean };
type Ca = { ma_ca: number; ten_ca: string; gio_bat_dau: string; gio_ket_thuc: string; so_nguoi: number; nhan_vien: CaNhanVien[] };

type DonNghi = {
  id: number; loai_nghi: string; ngay_bat_dau: string; ngay_ket_thuc: string;
  ly_do: string; ho_ten: string; chuc_vu: string | null; anh: string | null;
};

type SinhNhat = { ho_ten: string; ngay_sinh: string; chuc_vu: string | null; anh: string | null };

type TopNV = { id: number; ho_ten: string; chuc_vu: string | null; anh: string | null; tong_gio: number; so_ngay_cong: number };

type BieuDo = { ngay: string; dung_gio: number; di_tre: number; tong: number };

type HopDong = { ho_ten: string; chuc_vu: string | null; hop_dong_het_han: string; anh_dai_dien: string | null };

type DashboardData = {
  metrics: Metrics;
  lichCaHomNay: Ca[];
  donChoDuyet: DonNghi[];
  sinhNhatThang: SinhNhat[];
  bieuDoChuvenCan: BieuDo[];
  topNhanVien: TopNV[];
  hopDongSapHetHan: HopDong[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(n);

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

const fmtTime = (s: string | null) => {
  if (!s) return "--:--";
  const d = new Date(s);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};

const daysUntil = (s: string) => {
  const diff = new Date(s).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
};

function Avatar({ src, name, size = 32 }: { src?: string | null; name: string; size?: number }) {
  const initials = name.trim().split(" ").slice(-1)[0]?.[0]?.toUpperCase() ?? "?";
  if (src) {
    return (
      <img src={src} alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg,#059669,#34d399)",
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700,
    }}>
      {initials}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HrDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/hr/dashboard");
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id: number, status: "DA_DUYET" | "TU_CHOI") => {
    setApprovingId(id);
    try {
      await fetch(`/api/nghi-phep/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trang_thai: status, phan_hoi_admin: status === "DA_DUYET" ? "Đã duyệt" : "Từ chối", ma_nguoi_duyet: 1 }),
      });
      fetchData(true);
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#059669", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: "0.9rem" }}>Đang tải dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (!data) return <div style={{ padding: 24, color: "#ef4444" }}>Không thể tải dữ liệu.</div>;

  const { metrics, lichCaHomNay, donChoDuyet, sinhNhatThang, bieuDoChuvenCan, topNhanVien, hopDongSapHetHan } = data;

  // Metric cards config
  const metricCards = [
    {
      label: "Tổng nhân viên", value: metrics.tongNhanVien, unit: "người",
      icon: Users, color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe",
      sub: `${metrics.coMat} có mặt hôm nay`,
    },
    {
      label: "Có mặt hôm nay", value: metrics.coMat, unit: "người",
      icon: CheckCircle2, color: "#059669", bg: "#ecfdf5", border: "#a7f3d0",
      sub: `${Math.round((metrics.coMat / (metrics.tongNhanVien || 1)) * 100)}% tỉ lệ có mặt`,
    },
    {
      label: "Đi trễ hôm nay", value: metrics.diTre, unit: "người",
      icon: Clock, color: "#d97706", bg: "#fffbeb", border: "#fde68a",
      sub: "Trong số đã chấm công",
    },
    {
      label: "Vắng không phép", value: metrics.vangKhongPhep, unit: "người",
      icon: XCircle, color: "#dc2626", bg: "#fef2f2", border: "#fecaca",
      sub: "Cần xác minh ngay",
    },
    {
      label: "Nghỉ phép", value: metrics.nghiPhep, unit: "người",
      icon: AlertTriangle, color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe",
      sub: "Đã được phê duyệt",
    },
    {
      label: "Chi phí lương tháng", value: fmt(metrics.chiPhiLuong), unit: "₫",
      icon: Banknote, color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc",
      sub: "Tính từ giờ công thực tế",
    },
  ];

  // Bar chart max
  const maxTong = Math.max(...bieuDoChuvenCan.map((b) => b.tong), 1);

  return (
    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem", background: "#f9fafb", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
            Dashboard Nhân Sự
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
            Tổng quan hoạt động nhân sự kho —{" "}
            {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1rem",
              border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff",
              fontSize: "0.85rem", cursor: "pointer", color: "#374151",
            }}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
            Làm mới
          </button>
          {[
            { label: "Nhân viên", href: "/admin/hr/employees" },
            { label: "Chấm công", href: "/admin/hr/attendance" },
            { label: "Bảng lương", href: "/admin/hr/payroll" },
          ].map((link) => (
            <Link key={link.href} href={link.href} style={{
              padding: "0.5rem 1rem", background: "#059669", color: "#fff",
              borderRadius: 8, fontSize: "0.85rem", fontWeight: 600,
              textDecoration: "none",
            }}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        {metricCards.map((card) => (
          <div key={card.label} style={{
            background: card.bg, border: `1px solid ${card.border}`,
            borderRadius: 14, padding: "1.125rem 1.25rem",
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: card.color, letterSpacing: "0.02em" }}>
                {card.label.toUpperCase()}
              </span>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${card.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <card.icon size={17} color={card.color} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: "1.75rem", fontWeight: 800, color: card.color, lineHeight: 1 }}>
                {card.value}
              </span>
              <span style={{ fontSize: "0.8rem", color: card.color, opacity: 0.8 }}>{card.unit}</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "#6b7280" }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Row 2: Ca hôm nay + Đơn nghỉ ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>

        {/* Lịch ca hôm nay */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarDays size={17} color="#059669" />
              <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>Lịch ca hôm nay</h2>
            </div>
            <Link href="/admin/hr/shifts" style={{ fontSize: "0.78rem", color: "#059669", textDecoration: "none", fontWeight: 600 }}>
              Xem đầy đủ →
            </Link>
          </div>
          <div style={{ padding: "0.75rem 1.25rem 1.25rem", display: "flex", flexDirection: "column", gap: 12 }}>
            {lichCaHomNay.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "0.85rem", textAlign: "center", padding: "1.5rem 0" }}>
                Chưa có lịch phân ca hôm nay
              </p>
            ) : (
              lichCaHomNay.map((ca) => {
                const daVao = ca.nhan_vien.filter((nv) => nv.da_cham_cong).length;
                const pct = ca.so_nguoi > 0 ? Math.round((daVao / ca.so_nguoi) * 100) : 0;
                return (
                  <div key={ca.ma_ca} style={{ padding: "0.875rem 1rem", borderRadius: 10, background: "#f9fafb", border: "1px solid #f0f0f0" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#111827" }}>{ca.ten_ca}</span>
                        <span style={{ marginLeft: 8, fontSize: "0.75rem", color: "#6b7280" }}>
                          {fmtTime(ca.gio_bat_dau)} – {fmtTime(ca.gio_ket_thuc)}
                        </span>
                      </div>
                      <span style={{
                        fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                        background: pct >= 80 ? "#ecfdf5" : pct >= 50 ? "#fffbeb" : "#fef2f2",
                        color: pct >= 80 ? "#059669" : pct >= 50 ? "#d97706" : "#dc2626",
                      }}>
                        {daVao}/{ca.so_nguoi} người
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 4, background: "#e5e7eb", borderRadius: 4, marginBottom: 8 }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: pct >= 80 ? "#059669" : pct >= 50 ? "#f59e0b" : "#ef4444", transition: "width 0.4s" }} />
                    </div>
                    {/* Avatars */}
                    <div style={{ display: "flex", gap: 4 }}>
                      {ca.nhan_vien.map((nv, nvIdx) => (
                        <div key={`${ca.ma_ca}-${nv.id ?? nvIdx}`} style={{ position: "relative" }} title={nv.ho_ten}>
                          <Avatar src={nv.anh} name={nv.ho_ten} size={28} />
                          {nv.da_cham_cong && (
                            <span style={{
                              position: "absolute", bottom: -1, right: -1, width: 10, height: 10,
                              borderRadius: "50%", background: "#22c55e", border: "1.5px solid #fff",
                            }} />
                          )}
                        </div>
                      ))}
                      {ca.so_nguoi > 5 && (
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%", background: "#e5e7eb",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.65rem", fontWeight: 700, color: "#6b7280",
                        }}>
                          +{ca.so_nguoi - 5}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Đơn xin nghỉ chờ duyệt */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ClipboardList size={17} color="#7c3aed" />
              <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>
                Đơn xin nghỉ chờ duyệt
              </h2>
              {donChoDuyet.length > 0 && (
                <span style={{
                  background: "#7c3aed", color: "#fff", fontSize: "0.68rem", fontWeight: 700,
                  padding: "1px 7px", borderRadius: 20,
                }}>
                  {donChoDuyet.length}
                </span>
              )}
            </div>
            <Link href="/admin/hr/leave" style={{ fontSize: "0.78rem", color: "#7c3aed", textDecoration: "none", fontWeight: 600 }}>
              Xem tất cả →
            </Link>
          </div>
          <div style={{ padding: "0.75rem 1.25rem 1.25rem", display: "flex", flexDirection: "column", gap: 10 }}>
            {donChoDuyet.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "0.85rem", textAlign: "center", padding: "1.5rem 0" }}>
                Không có đơn nào chờ duyệt
              </p>
            ) : (
              donChoDuyet.map((don) => (
                <div key={don.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.75rem", background: "#faf5ff", borderRadius: 10, border: "1px solid #ede9fe" }}>
                  <Avatar src={don.anh} name={don.ho_ten} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#111827" }}>{don.ho_ten}</p>
                    <p style={{ margin: "1px 0 0", fontSize: "0.72rem", color: "#7c3aed" }}>
                      {don.loai_nghi} · {fmtDate(don.ngay_bat_dau)} – {fmtDate(don.ngay_ket_thuc)}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.7rem", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {don.ly_do}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                    <button
                      onClick={() => handleApprove(don.id, "TU_CHOI")}
                      disabled={approvingId === don.id}
                      style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #fecaca", background: "#fff", color: "#dc2626", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => handleApprove(don.id, "DA_DUYET")}
                      disabled={approvingId === don.id}
                      style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "#059669", color: "#fff", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}
                    >
                      Duyệt
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: Sinh nhật + Hợp đồng hết hạn ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>

        {/* Sinh nhật tháng */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "1rem 1.25rem", borderBottom: "1px solid #f3f4f6" }}>
            <Gift size={17} color="#db2777" />
            <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>
              Sinh nhật tháng {new Date().getMonth() + 1}
            </h2>
          </div>
          <div style={{ padding: "0.75rem 1.25rem 1.25rem", display: "flex", flexDirection: "column", gap: 8 }}>
            {sinhNhatThang.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "0.85rem", textAlign: "center", padding: "1.5rem 0" }}>
                Không có sinh nhật trong tháng này
              </p>
            ) : (
              sinhNhatThang.map((nv, i) => {
                const d = new Date(nv.ngay_sinh!);
                const isToday = d.getDate() === new Date().getDate();
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "0.625rem 0.75rem",
                    borderRadius: 9, background: isToday ? "#fdf2f8" : "#f9fafb",
                    border: `1px solid ${isToday ? "#f9a8d4" : "#f0f0f0"}`,
                  }}>
                    <Avatar src={nv.anh} name={nv.ho_ten} size={34} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#111827" }}>
                        {nv.ho_ten} {isToday && "🎂"}
                      </p>
                      <p style={{ margin: "1px 0 0", fontSize: "0.72rem", color: "#db2777" }}>
                        {d.getDate()}/{d.getMonth() + 1} · {nv.chuc_vu || "Nhân viên"}
                      </p>
                    </div>
                    {isToday && (
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#db2777", color: "#fff" }}>
                        Hôm nay!
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Hợp đồng sắp hết hạn */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "1rem 1.25rem", borderBottom: "1px solid #f3f4f6" }}>
            <FileWarning size={17} color="#dc2626" />
            <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>
              Hợp đồng sắp hết hạn
            </h2>
            <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>(trong 30 ngày)</span>
          </div>
          <div style={{ padding: "0.75rem 1.25rem 1.25rem", display: "flex", flexDirection: "column", gap: 8 }}>
            {hopDongSapHetHan.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "0.85rem", textAlign: "center", padding: "1.5rem 0" }}>
                Không có hợp đồng nào sắp hết hạn
              </p>
            ) : (
              hopDongSapHetHan.map((nv, i) => {
                const days = daysUntil(nv.hop_dong_het_han);
                const urgent = days <= 7;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "0.625rem 0.75rem",
                    borderRadius: 9, background: urgent ? "#fef2f2" : "#fffbeb",
                    border: `1px solid ${urgent ? "#fecaca" : "#fde68a"}`,
                  }}>
                    <Avatar src={nv.anh_dai_dien} name={nv.ho_ten} size={34} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#111827" }}>{nv.ho_ten}</p>
                      <p style={{ margin: "1px 0 0", fontSize: "0.72rem", color: "#6b7280" }}>
                        {nv.chuc_vu || "Nhân viên"} · Hết hạn {fmtDate(nv.hop_dong_het_han)}
                      </p>
                    </div>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                      background: urgent ? "#dc2626" : "#d97706", color: "#fff",
                    }}>
                      {days}d
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Row 4: Biểu đồ + Top nhân viên ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.25rem" }}>

        {/* Biểu đồ chuyên cần 30 ngày */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "1rem 1.25rem", borderBottom: "1px solid #f3f4f6" }}>
            <TrendingUp size={17} color="#059669" />
            <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>
              Tỉ lệ chuyên cần 30 ngày gần nhất
            </h2>
          </div>
          <div style={{ padding: "1.25rem" }}>
            {/* Bar chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 100 }}>
              {bieuDoChuvenCan.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }} title={`${d.ngay}: ${d.tong} chấm công (${d.di_tre} trễ)`}>
                  <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    {d.tong > 0 && (
                      <div style={{ width: "100%", borderRadius: "3px 3px 0 0", overflow: "hidden" }}>
                        {/* Stack: trễ + đúng giờ */}
                        {d.di_tre > 0 && (
                          <div style={{
                            height: Math.round((d.di_tre / maxTong) * 80),
                            background: "#fbbf24", width: "100%",
                          }} />
                        )}
                        <div style={{
                          height: Math.round(((d.tong - d.di_tre) / maxTong) * 80),
                          background: "#34d399", width: "100%",
                        }} />
                      </div>
                    )}
                    {d.tong === 0 && (
                      <div style={{ height: 2, width: "100%", background: "#e5e7eb", borderRadius: 2 }} />
                    )}
                  </div>
                  {/* Label ngày (chỉ hiện mỗi 5 cột) */}
                  {i % 5 === 0 && (
                    <span style={{ fontSize: "0.55rem", color: "#9ca3af", marginTop: 2, whiteSpace: "nowrap" }}>
                      {d.ngay}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "flex-end" }}>
              {[{ color: "#34d399", label: "Đúng giờ" }, { color: "#fbbf24", label: "Đi trễ" }].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                  <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 5 nhân viên */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "1rem 1.25rem", borderBottom: "1px solid #f3f4f6" }}>
            <Trophy size={17} color="#d97706" />
            <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>
              Top nhân viên tháng
            </h2>
          </div>
          <div style={{ padding: "0.75rem 1.25rem 1.25rem", display: "flex", flexDirection: "column", gap: 8 }}>
            {topNhanVien.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "0.85rem", textAlign: "center", padding: "1.5rem 0" }}>
                Chưa có dữ liệu tháng này
              </p>
            ) : (
              topNhanVien.map((nv, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div key={nv.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "1rem", width: 22, textAlign: "center" }}>
                      {medals[i] || `${i + 1}.`}
                    </span>
                    <Avatar src={nv.anh} name={nv.ho_ten} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.82rem", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {nv.ho_ten}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.68rem", color: "#6b7280" }}>
                        {nv.so_ngay_cong} ngày · {nv.tong_gio}h
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Quick links ── */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "1rem 1.25rem" }}>
        <h2 style={{ margin: "0 0 0.875rem", fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>
          Truy cập nhanh
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "Danh sách nhân viên", href: "/admin/hr/employees", color: "#3b82f6", bg: "#eff6ff" },
            { label: "Chấm công hôm nay", href: "/admin/hr/attendance", color: "#059669", bg: "#ecfdf5" },
            { label: "Lịch phân ca", href: "/admin/hr/shifts", color: "#7c3aed", bg: "#f5f3ff" },
            { label: "Bảng lương tháng", href: "/admin/hr/payroll", color: "#d97706", bg: "#fffbeb" },
            { label: "Quản lý nghỉ phép", href: "/admin/hr/leave", color: "#db2777", bg: "#fdf2f8" },
            { label: "Kanban giao việc", href: "/admin/hr/tasks", color: "#0891b2", bg: "#ecfeff" },
          ].map((link) => (
            <Link key={link.href} href={link.href} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.75rem 0.875rem", background: link.bg, borderRadius: 10,
              textDecoration: "none", border: `1px solid ${link.color}20`,
              transition: "box-shadow 0.15s",
            }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: link.color }}>{link.label}</span>
              <ChevronRight size={14} color={link.color} />
            </Link>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
