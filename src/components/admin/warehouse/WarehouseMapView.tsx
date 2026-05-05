"use client";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Boxes, ChevronRight, Clock, Layers3, LayoutGrid, Package, ArrowDownToLine, RefreshCw, ScanLine, Warehouse, X, Pencil } from "lucide-react";
import WarehouseFloorPlan, { type Day, type Floor, type Shelf, type Zone } from "./WarehouseFloorPlan";
import ExpirationWarnings from "./ExpirationWarnings";
import IssueHistory from "./IssueHistory";

type MapData = { zones: Zone[]; stats: { totalBoxes: number; expiringBoxes: number; zonesCount: number } };

/* ── Mock data (fallback / dev preview) ──────────────────────── */
const mk = (id: number, pct: number, warn: boolean): Floor => ({
  id, tang: "T1", capacity: 50, current: Math.round(50 * pct / 100),
  percent: pct, expiringSoon: warn, so_luong_ton: Math.round(50 * pct / 100),
  batches: warn ? [{
    id, ma_lo_hang: `LH-${id.toString().padStart(4,"0")}`,
    san_pham: "Gạo ST25", so_luong: Math.round(50 * pct / 100),
    han_su_dung: "2025-06-10", days_left: 14, warning: true,
    vi_tri: `Tầng T1`, ncc: "NCC Miền Tây",
  }] : [],
});

const MOCK_ZONES: Zone[] = [
  {
    name: "Khu khác", totalCapacity: 750, totalCurrent: 152, expiringSoon: 3,
    days: [
      { name: "D1", shelves: [
        { name: "K1", floors: [mk(1,  2,  true)]  },
        { name: "K2", floors: [mk(2,  60, false)] },
        { name: "K3", floors: [mk(3,  90, false)] },
        { name: "K4", floors: [mk(4,  20, false)] },
        { name: "K5", floors: [mk(5,  80, true)]  },
      ]},
      { name: "D2", shelves: [
        { name: "K1", floors: [mk(6,  10, false)] },
        { name: "K2", floors: [mk(7,  50, false)] },
        { name: "K3", floors: [mk(8,  96, true)]  },
        { name: "K4", floors: [mk(9,  30, false)] },
      ]},
      { name: "D3", shelves: [
        { name: "K1", floors: [mk(10, 70, false)] },
        { name: "K2", floors: [mk(11, 40, false)] },
        { name: "K3", floors: [mk(12, 84, true)]  },
      ]},
      { name: "D4", shelves: [
        { name: "K1", floors: [mk(51, 15, false)] },
        { name: "K2", floors: [mk(52, 60, false)] },
        { name: "K3", floors: [mk(53, 90, true)]  },
        { name: "K4", floors: [mk(54, 45, false)] },
      ]},
    ],
  },
  {
    name: "Khu A", totalCapacity: 800, totalCurrent: 430, expiringSoon: 1,
    days: [
      { name: "D1", shelves: [
        { name: "K1", floors: [mk(13, 55, false)] },
        { name: "K2", floors: [mk(14, 70, false)] },
        { name: "K3", floors: [mk(15, 30, false)] },
        { name: "K4", floors: [mk(16, 85, true)]  },
        { name: "K5", floors: [mk(17, 45, false)] },
        { name: "K6", floors: [mk(18, 92, false)] },
      ]},
      { name: "D2", shelves: [
        { name: "K1", floors: [mk(19, 20, false)] },
        { name: "K2", floors: [mk(20, 60, false)] },
        { name: "K3", floors: [mk(21, 75, false)] },
        { name: "K4", floors: [mk(22, 40, false)] },
        { name: "K5", floors: [mk(23, 88, false)] },
      ]},
      { name: "D3", shelves: [
        { name: "K1", floors: [mk(24, 65, false)] },
        { name: "K2", floors: [mk(25, 35, false)] },
        { name: "K3", floors: [mk(26, 91, false)] },
        { name: "K4", floors: [mk(27, 15, false)] },
      ]},
      { name: "D4", shelves: [
        { name: "K1", floors: [mk(28, 78, false)] },
        { name: "K2", floors: [mk(29, 52, false)] },
        { name: "K3", floors: [mk(30, 23, false)] },
      ]},
    ],
  },
  {
    name: "Khu B", totalCapacity: 800, totalCurrent: 290, expiringSoon: 2,
    days: [
      { name: "D1", shelves: [
        { name: "K1", floors: [mk(31, 5,  false)] },
        { name: "K2", floors: [mk(32, 12, false)] },
        { name: "K3", floors: [mk(33, 87, true)]  },
        { name: "K4", floors: [mk(34, 3,  false)] },
        { name: "K5", floors: [mk(35, 65, false)] },
      ]},
      { name: "D2", shelves: [
        { name: "K1", floors: [mk(36, 45, false)] },
        { name: "K2", floors: [mk(37, 72, false)] },
        { name: "K3", floors: [mk(38, 8,  false)] },
        { name: "K4", floors: [mk(39, 93, true)]  },
      ]},
      { name: "D3", shelves: [
        { name: "K1", floors: [mk(40, 55, false)] },
        { name: "K2", floors: [mk(41, 30, false)] },
        { name: "K3", floors: [mk(42, 18, false)] },
        { name: "K4", floors: [mk(43, 82, false)] },
        { name: "K5", floors: [mk(44, 47, false)] },
      ]},
      { name: "D4", shelves: [
        { name: "K1", floors: [mk(45, 60, false)] },
        { name: "K2", floors: [mk(46, 25, false)] },
        { name: "K3", floors: [mk(47, 95, true)]  },
        { name: "K4", floors: [mk(48, 40, false)] },
        { name: "K5", floors: [mk(49, 14, false)] },
        { name: "K6", floors: [mk(50, 73, false)] },
      ]},
    ],
  },
];

const S: Record<string, React.CSSProperties> = {
  page:    { fontFamily: "Inter,system-ui,sans-serif", color: "#0f172a" },
  card:    { background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: 8 },
  label:   { fontSize: 11, fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#94a3b8" },
  body:    { fontSize: 13, color: "#475569" },
  val:     { fontSize: 13, fontWeight: 500, color: "#0f172a" },
};

/* ── KPI card ─────────────────────────────────────────────────── */
function KPI({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent: string }) {
  return (
    <div style={{ ...S.card, borderLeft: `3px solid ${accent}`, height: 64, display: "flex", alignItems: "center", gap: 10, padding: "0 14px" }}>
      <div style={{ color: "#94a3b8", flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", lineHeight: 1 }}>{label}</p>
        <p style={{ fontSize: 20, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "#0f172a", marginTop: 4, lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  );
}

/* ── Tab bar ──────────────────────────────────────────────────── */
function TabBar({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  return (
    <div style={{ display: "flex", borderBottom: "0.5px solid #e2e8f0", background: "#fff" }}>
      {[["map","Sơ đồ kho",LayoutGrid],["warnings","Cảnh báo HSD",AlertTriangle],["history","Lịch sử",Clock]].map(([id, lbl, Icon]: any) => (
        <button key={id} onClick={() => onChange(id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", fontSize: 13, fontWeight: active === id ? 500 : 400, color: active === id ? "#047857" : "#64748b", background: "none", border: "none", borderBottom: active === id ? "2px solid #059669" : "2px solid transparent", cursor: "pointer" }}>
          <Icon size={14} />
          {lbl}
        </button>
      ))}
    </div>
  );
}

/* ── Pill chip (Dãy / Kệ selector) ───────────────────────────── */
function Pill({ label, sub, active, onClick }: { label: string; sub: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 30, padding: "0 10px", border: `0.5px solid ${active ? "#6ee7b7" : "#e2e8f0"}`, borderRadius: 6, background: active ? "#ecfdf5" : "#fff", color: active ? "#065f46" : "#475569", fontSize: 12, fontWeight: active ? 500 : 400, cursor: "pointer", whiteSpace: "nowrap" }}>
      <span>{label}</span><span style={{ color: active ? "#34d399" : "#94a3b8", fontSize: 11 }}>· {sub}</span>
    </button>
  );
}

/* ── Tầng table ───────────────────────────────────────────────── */
function FloorTable({ shelf }: { shelf: Shelf }) {
  const rows = shelf.floors.flatMap(f => f.batches.map(b => ({ f, b })));
  if (!rows.length) return <p style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Chưa có lô hàng.</p>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: "0.5px solid #e2e8f0" }}>
            {["Tầng","Sản phẩm","Lô","Kiện","HSD","Trạng thái"].map(h => (
              <th key={h} style={{ padding: "4px 8px", textAlign: "left", fontWeight: 500, color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ f, b }) => (
            <tr key={b.id} style={{ borderBottom: "0.5px solid #f1f5f9" }}>
              <td style={{ padding: "5px 8px", color: "#64748b" }}>{f.tang}</td>
              <td style={{ padding: "5px 8px", fontWeight: 500, color: "#0f172a" }}>{b.san_pham}</td>
              <td style={{ padding: "5px 8px", color: "#64748b", fontFamily: "monospace" }}>{b.ma_lo_hang}</td>
              <td style={{ padding: "5px 8px", fontVariantNumeric: "tabular-nums" }}>{b.so_luong}</td>
              <td style={{ padding: "5px 8px", color: "#64748b", whiteSpace: "nowrap" }}>{b.han_su_dung}</td>
              <td style={{ padding: "5px 8px" }}>
                <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: b.warning ? "#fef3c7" : "#ecfdf5", color: b.warning ? "#92400e" : "#065f46", border: `0.5px solid ${b.warning ? "#fbbf24" : "#6ee7b7"}` }}>
                  {b.days_left == null ? "N/A" : b.warning ? `⚠ ${b.days_left}n` : `✓ ${b.days_left}n`}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Detail panel ─────────────────────────────────────────────── */
function DetailPanel({ zone, day, shelf, floor, onClearFloor }: { zone: Zone | null; day: Day | null; shelf: Shelf | null; floor: Floor | null; onClearFloor: () => void }) {
  const shelfPct = shelf ? (shelf.floors.length ? Math.round(shelf.floors.reduce((a, f) => a + f.percent, 0) / shelf.floors.length) : 0) : 0;
  return (
    <aside style={{ ...S.card, width: 260, flexShrink: 0, alignSelf: "flex-start", borderRadius: 10, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#334155" }}>
          <Layers3 size={14} color="#94a3b8" /> Chi tiết
        </span>
        {floor && <button onClick={onClearFloor} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={14} /></button>}
      </div>

      {!zone ? (
        <p style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Chọn một khu để xem chi tiết.</p>
      ) : (
        <>
          {[["Khu", zone.name], ["Dãy", day?.name ?? "—"], ["Kệ", shelf?.name ?? "—"], ["Tầng", floor?.tang ?? "—"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{k}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#0f172a" }}>{v}</span>
            </div>
          ))}

          {shelf && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 4 }}>
                <span>Sức chứa kệ</span><span style={{ fontWeight: 500 }}>{shelfPct}%</span>
              </div>
              <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(shelfPct, 100)}%`, background: shelfPct > 80 ? "#ef4444" : shelfPct > 50 ? "#f59e0b" : "#059669", borderRadius: 3, transition: "width 0.3s" }} />
              </div>
            </div>
          )}

          {zone.expiringSoon > 0 && (
            <div style={{ marginTop: 10, padding: "5px 8px", background: "#fef9c3", border: "0.5px solid #fbbf24", borderRadius: 6, fontSize: 11, color: "#92400e" }}>
              ⚠ {zone.expiringSoon} lô sắp hết hạn trong khu này
            </div>
          )}

          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            {[["Xem lô hàng", Package], ["Nhập kho", ArrowDownToLine]].map(([lbl, Icon]: any) => (
              <button key={lbl} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, height: 32, border: "0.5px solid #e2e8f0", borderRadius: 6, background: "#fff", fontSize: 12, color: "#334155", cursor: "pointer" }}>
                <Icon size={13} /> {lbl}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <p style={{ ...S.label, marginBottom: 8 }}>Lô hàng{floor ? ` — Tầng ${floor.tang}` : ""}</p>
            {floor ? (
              floor.batches.length === 0
                ? <p style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Tầng này chưa có lô hàng.</p>
                : <div style={{ maxHeight: 220, overflowY: "auto" }}>
                    {floor.batches.map(b => (
                      <div key={b.id} style={{ borderBottom: "0.5px solid #f1f5f9", padding: "6px 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 500, color: "#0f172a", lineHeight: 1 }}>{b.san_pham}</p>
                            <p style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace", marginTop: 2 }}>{b.ma_lo_hang}</p>
                          </div>
                          <span style={{ fontSize: 10, padding: "2px 5px", borderRadius: 4, background: b.warning ? "#fef3c7" : "#ecfdf5", color: b.warning ? "#92400e" : "#065f46", border: `0.5px solid ${b.warning ? "#fbbf24" : "#6ee7b7"}`, whiteSpace: "nowrap" }}>
                            {b.days_left == null ? "N/A" : `${b.days_left}n`}
                          </span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 12px", marginTop: 4, fontSize: 10, color: "#64748b" }}>
                          <span>SL: <strong style={{ color: "#334155" }}>{b.so_luong}</strong></span>
                          <span>HSD: <strong style={{ color: "#334155" }}>{b.han_su_dung}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
            ) : (
              <p style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Chọn một tầng ở bên trái.</p>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/*  Main component                                               */
/* ══════════════════════════════════════════════════════════════ */
export default function WarehouseMapView({ readOnly = false }: { readOnly?: boolean }) {
  const [stats,   setStats]   = useState({ totalBoxes: 23, expiringBoxes: 7, zonesCount: MOCK_ZONES.length });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [tab,     setTab]     = useState("map");
  const [zoneIdx, setZoneIdx] = useState(0);
  const [selDay,  setSelDay]  = useState<Day | null>(MOCK_ZONES[0]?.days[0] ?? null);
  const [selShelf,setSelShelf]= useState<Shelf | null>(null);
  const [selFloor,setSelFloor]= useState<Floor | null>(null);

  const load = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/warehouse/map", { cache: "no-store" });
      if (!r.ok) throw new Error("Không thể tải sơ đồ kho");
      const j = await r.json() as MapData;
      // Only update KPI stats — zones display always uses MOCK_ZONES
      setStats({
        totalBoxes: j.stats?.totalBoxes ?? 0,
        expiringBoxes: j.stats?.expiringBoxes ?? 0,
        zonesCount: j.stats?.zonesCount ?? MOCK_ZONES.length,
      });
    } catch { /* silently ignore — mock data still shows */ }
    finally { if (showSpinner) setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const zone  = zones[zoneIdx] ?? null;
  const shelfCount = useMemo(() => (selShelf?.floors.length ?? 0), [selShelf]);

  // --- CRUD Handlers ---
  const handleAddZone = () => {
    const name = prompt("Nhập tên khu mới (VD: Khu C):");
    if (!name) return;
    const newZones = [...zones];
    newZones.push({ name, totalCapacity: 0, totalCurrent: 0, expiringSoon: 0, days: [] });
    setZones(newZones);
    setZoneIdx(newZones.length - 1);
    setSelDay(null); setSelShelf(null); setSelFloor(null);
  };
  const handleEditZone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!zone) return;
    const newName = prompt(`Sửa tên ${zone.name}:`, zone.name);
    if (!newName || newName === zone.name) return;
    const newZones = [...zones];
    newZones[zoneIdx].name = newName;
    setZones(newZones);
  };
  const handleDeleteZone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!zone || !confirm(`CẢNH BÁO: Bạn có chắc muốn xóa TOÀN BỘ ${zone.name}?`)) return;
    const newZones = zones.filter((_, i) => i !== zoneIdx);
    setZones(newZones);
    setZoneIdx(0);
    setSelDay(newZones[0]?.days[0] ?? null);
    setSelShelf(null);
    setSelFloor(null);
  };

  const handleAddDay = () => {
    const name = prompt("Nhập tên dãy mới (VD: D5):");
    if (!name || !zone) return;
    const newZones = [...zones];
    newZones[zoneIdx].days.push({ name, shelves: [] });
    setZones(newZones);
  };
  const handleEditDay = (e: React.MouseEvent, dName: string) => {
    e.stopPropagation();
    const newName = prompt(`Sửa tên dãy ${dName}:`, dName);
    if (!newName || newName === dName) return;
    const newZones = [...zones];
    const d = newZones[zoneIdx].days.find(d => d.name === dName);
    if (d) {
      d.name = newName;
      setZones(newZones);
      if (selDay?.name === dName) setSelDay(d);
    }
  };
  const handleDeleteDay = (e: React.MouseEvent, dName: string) => {
    e.stopPropagation();
    if (!confirm(`Xóa dãy ${dName}?`)) return;
    const newZones = [...zones];
    newZones[zoneIdx].days = newZones[zoneIdx].days.filter(d => d.name !== dName);
    setZones(newZones);
    if (selDay?.name === dName) { setSelDay(null); setSelShelf(null); setSelFloor(null); }
  };
  const handleAddShelf = () => {
    if (!selDay) return;
    const name = prompt("Nhập tên kệ mới (VD: K7):");
    if (!name) return;
    const newZones = [...zones];
    const d = newZones[zoneIdx].days.find(d => d.name === selDay.name);
    if (d) d.shelves.push({ name, floors: [] });
    setZones(newZones);
  };
  const handleEditShelf = (e: React.MouseEvent, shName: string) => {
    e.stopPropagation();
    if (!selDay) return;
    const newName = prompt(`Sửa tên kệ ${shName}:`, shName);
    if (!newName || newName === shName) return;
    const newZones = [...zones];
    const d = newZones[zoneIdx].days.find(d => d.name === selDay.name);
    if (d) {
      const sh = d.shelves.find(s => s.name === shName);
      if (sh) {
        sh.name = newName;
        setZones(newZones);
        if (selShelf?.name === shName) setSelShelf(sh);
      }
    }
  };
  const handleDeleteShelf = (e: React.MouseEvent, shName: string) => {
    e.stopPropagation();
    if (!selDay || !confirm(`Xóa kệ ${shName}?`)) return;
    const newZones = [...zones];
    const d = newZones[zoneIdx].days.find(d => d.name === selDay.name);
    if (d) d.shelves = d.shelves.filter(s => s.name !== shName);
    setZones(newZones);
    if (selShelf?.name === shName) { setSelShelf(null); setSelFloor(null); }
  };

  const handleZone = (i: number) => {
    setZoneIdx(i);
    setSelDay(zones[i]?.days[0] ?? null);
    setSelShelf(null); setSelFloor(null);
  };
  const handleShelf = (zi: number, day: Day, shelf: Shelf) => {
    setZoneIdx(zi); setSelDay(day); setSelShelf(shelf); setSelFloor(null);
  };

  return (

    <div style={{ ...S.page }}>
      {/* Tab bar + content card */}
      <div style={{ ...S.card, borderRadius: 10 }}>
        <TabBar active={tab} onChange={setTab} />

        <div style={{ padding: 16 }}>
          {tab === "map" && (
            loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 8, color: "#94a3b8" }}>
                <RefreshCw size={20} style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: 13 }}>Đang tải sơ đồ kho...</span>
              </div>
            ) : error ? (
              <div style={{ padding: "10px 14px", background: "#fef2f2", border: "0.5px solid #fca5a5", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{error}</div>
            ) : zones.length === 0 ? (
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Chưa có dữ liệu vị trí kho.</p>
            ) : (
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {/* Left column */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Header row: label + refresh + breadcrumb */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <p style={{ ...S.label }}>Bản đồ kho</p>
                      {!readOnly && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => load(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", border: "0.5px solid #e2e8f0", borderRadius: 5, background: "#fff", fontSize: 11, color: "#64748b", cursor: "pointer" }}>
                            <RefreshCw size={11} /> Làm mới
                          </button>
                          <button onClick={handleAddZone} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", border: "0.5px solid #059669", borderRadius: 5, background: "#ecfdf5", fontSize: 11, color: "#065f46", cursor: "pointer", fontWeight: 500 }}>
                            + Thêm Khu
                          </button>
                        </div>
                      )}
                    </div>
                    {zone && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontWeight: 500, color: "#334155" }}>{zone.name}</span>
                          {!readOnly && (
                            <div style={{ display: "flex", gap: 2 }}>
                              <button onClick={handleEditZone} style={{ padding: 2, background: "none", border: "none", color: "#3b82f6", cursor: "pointer" }}><Pencil size={10} /></button>
                              <button onClick={handleDeleteZone} style={{ padding: 2, background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><X size={10} /></button>
                            </div>
                          )}
                        </div>
                        {selDay && <><ChevronRight size={11} /><span style={{ fontWeight: 500, color: "#334155" }}>{selDay.name}</span></>}
                        {selShelf && <><ChevronRight size={11} /><span style={{ fontWeight: 500, color: "#334155" }}>{selShelf.name}</span></>}
                        {selFloor && <><ChevronRight size={11} /><span style={{ fontWeight: 500, color: "#334155" }}>T.{selFloor.tang}</span></>}
                      </div>
                    )}
                  </div>

                  {/* KPI row — above floor plan */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
                    {[
                      { label: "KHU THEO DÕI",   val: stats.zonesCount,    accent: "#94a3b8", valColor: "#0f172a" },
                      { label: "KIỆN TRONG KHO",  val: stats.totalBoxes,    accent: "#059669", valColor: "#0f172a" },
                      { label: "LÔ GẦN HẾT HẠN", val: stats.expiringBoxes, accent: "#f59e0b", valColor: "#92400e" },
                      { label: "TẦNG ĐÃ MẼ",       val: shelfCount,          accent: "#cbd5e1", valColor: "#0f172a" },
                    ].map(k => (
                      <div key={k.label} style={{ background: "white", borderTop: "0.5px solid #e2e8f0", borderRight: "0.5px solid #e2e8f0", borderBottom: "0.5px solid #e2e8f0", borderLeft: `3px solid ${k.accent}`, borderRadius: 8, padding: "8px 12px" }}>
                        <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{k.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 500, color: k.valColor, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{k.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* SVG floor plan */}
                  <WarehouseFloorPlan zones={zones} selZone={zoneIdx} selShelf={selShelf?.name ?? null} onZone={handleZone} onShelf={handleShelf} />

                  {/* Drill-down section */}
                  {zone && (
                    <div style={{ marginTop: 16 }}>
                      {/* Dãy pills */}
                      <p style={{ ...S.label, marginBottom: 8 }}>Dãy</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                        {zone.days.map(d => (
                          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Pill label={d.name} sub={`${d.shelves.length} kệ`}
                              active={selDay?.name === d.name}
                              onClick={() => { setSelDay(d); setSelShelf(null); setSelFloor(null); }} />
                            {!readOnly && (
                              <div style={{ display: "flex", gap: 2 }}>
                                <button onClick={(e) => handleEditDay(e, d.name)} style={{ padding: 4, background: "none", border: "none", color: "#3b82f6", cursor: "pointer" }}><Pencil size={12} /></button>
                                <button onClick={(e) => handleDeleteDay(e, d.name)} style={{ padding: 4, background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><X size={12} /></button>
                              </div>
                            )}
                          </div>
                        ))}
                        {!readOnly && (
                          <button onClick={handleAddDay} style={{ height: 30, padding: "0 10px", border: "1px dashed #cbd5e1", borderRadius: 6, fontSize: 12, color: "#64748b", background: "none", cursor: "pointer" }}>
                            + Thêm dãy
                          </button>
                        )}
                      </div>

                      {/* Kệ grid */}
                      {selDay && (
                        <>
                          <p style={{ ...S.label, marginBottom: 8 }}>Kệ</p>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
                            {selDay.shelves.map(sh => {
                              const sp = sh.floors.length ? Math.round(sh.floors.reduce((a, f) => a + f.percent, 0) / sh.floors.length) : 0;
                              const isAct = selShelf?.name === sh.name;
                              return (
                                <button key={sh.name} onClick={() => { setSelShelf(sh); setSelFloor(null); }} style={{ position: "relative", border: `0.5px solid ${isAct ? "#6ee7b7" : "#e2e8f0"}`, borderRadius: 7, padding: "8px 10px", background: isAct ? "#ecfdf5" : "#fff", cursor: "pointer", textAlign: "left" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ fontSize: 12, fontWeight: 500, color: isAct ? "#065f46" : "#1e293b" }}>{sh.name}</div>
                                    {!readOnly && (
                                      <div style={{ display: "flex", gap: 4 }}>
                                        <div onClick={(e) => handleEditShelf(e, sh.name)} style={{ color: "#3b82f6", padding: 2, cursor: "pointer" }}><Pencil size={12} /></div>
                                        <div onClick={(e) => handleDeleteShelf(e, sh.name)} style={{ color: "#ef4444", padding: 2, cursor: "pointer" }}><X size={12} /></div>
                                      </div>
                                    )}
                                  </div>
                                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{sh.floors.length} tầng</div>
                                  <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2, overflow: "hidden", marginTop: 6 }}>
                                    <div style={{ height: "100%", width: `${Math.min(sp, 100)}%`, background: sp > 80 ? "#ef4444" : sp > 50 ? "#f59e0b" : "#059669", borderRadius: 2 }} />
                                  </div>
                                </button>
                              );
                            })}
                            {!readOnly && (
                              <button onClick={handleAddShelf} style={{ border: "1px dashed #cbd5e1", borderRadius: 7, minHeight: 52, background: "transparent", cursor: "pointer", color: "#64748b", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                + Thêm kệ
                              </button>
                            )}
                          </div>
                        </>
                      )}

                      {/* Tầng table */}
                      {selShelf && (
                        <>
                          <p style={{ ...S.label, marginBottom: 8 }}>Tầng — Lô hàng trong {selShelf.name}</p>
                          <div style={{ border: "0.5px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                            <FloorTable shelf={selShelf} />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Detail panel */}
                <DetailPanel zone={zone} day={selDay} shelf={selShelf} floor={selFloor} onClearFloor={() => setSelFloor(null)} />
              </div>
            )
          )}

          {tab === "warnings" && (
            <ExpirationWarnings warningsData={[]} />
          )}

          {tab === "history" && (
            <IssueHistory historyData={[]} importHistoryData={[]} />
          )}
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
