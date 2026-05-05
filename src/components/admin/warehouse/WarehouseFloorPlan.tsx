"use client";
import { useMemo } from "react";

export type Batch = { id: number; ma_lo_hang: string; san_pham: string; so_luong: number; han_su_dung: string; days_left: number | null; warning: boolean; vi_tri: string; ncc: string | null; };
export type Floor = { id: number; tang: string; capacity: number; current: number; percent: number; expiringSoon: boolean; so_luong_ton: number; batches: Batch[]; };
export type Shelf = { name: string; floors: Floor[] };
export type Day   = { name: string; shelves: Shelf[] };
export type Zone  = { name: string; totalCapacity: number; totalCurrent: number; expiringSoon: number; days: Day[] };

/* ── Fixed geometry (per spec) ─────────────────────────────── */
const CANVAS_H  = 480;
const ZONE_H    = 440;   // 480 - top 20 - bottom 20
const ZONE_W    = 260;
const AISLE_W   = 20;
const MARGIN    = 20;
const HDR_H     = 28;    // zone header strip height
const ROW_H     = 60;    // each Dãy strip
const ROW_GAP   = 8;     // aisle gap between Dãy rows
const CELL_W    = 34;
const CELL_H    = 42;
const CELL_GAP  = 4;
const INNER_PAD = 24;    // Increased padding to leave room for the Dãy label on the left

/* ── Color helpers ─────────────────────────────────────────── */
const cFill   = (p: number) => p > 80 ? "#fee2e2" : p > 50 ? "#fef9c3" : "#f8fafc";
const cStroke = (p: number) => p > 80 ? "#f87171" : p > 50 ? "#fbbf24" : "#e2e8f0";
const bFill   = (p: number) => p > 80 ? "#ef4444" : p > 50 ? "#f59e0b" : "#059669";

const shelfPct = (s: Shelf) => {
  const floors = s?.floors ?? [];
  return floors.length
    ? Math.round(floors.reduce((a, f) => a + (f.percent ?? 0), 0) / floors.length)
    : 0;
};

const zonePct = (z: Zone) =>
  z.totalCapacity > 0 ? Math.round((z.totalCurrent / z.totalCapacity) * 100) : 0;

/* ── Zone x-positions (absolute, dynamic) ─────────────────── */
function zoneX(i: number) {
  return MARGIN + i * (ZONE_W + AISLE_W);
}

/* ── How many cells fit per row inside a zone ────────────────  */
const CELLS_PER_ROW = Math.floor((ZONE_W - INNER_PAD * 2 + CELL_GAP) / (CELL_W + CELL_GAP));

export default function WarehouseFloorPlan({
  zones, selZone, selShelf,
  onZone, onShelf,
}: {
  zones: Zone[];
  selZone: number;
  selShelf: string | null;
  onZone: (i: number) => void;
  onShelf: (zi: number, day: Day, shelf: Shelf) => void;
}) {
  const n = zones.length;
  const totalW = useMemo(
    () => (n === 0 ? 860 : MARGIN + n * ZONE_W + (n - 1) * AISLE_W + MARGIN),
    [n],
  );

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", background: "#f1f5f9" }}>
      <svg
        viewBox={`0 0 ${totalW} ${CANVAS_H}`}
        width="100%"
        height={CANVAS_H}
        style={{ display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Aisle corridors (behind zones) ── */}
        {Array.from({ length: n - 1 }, (_, i) => {
          const ax = zoneX(i) + ZONE_W;
          return (
            <rect
              key={`aisle-${i}`}
              x={ax} y={MARGIN}
              width={AISLE_W} height={ZONE_H}
              fill="#e2e8f0"
            />
          );
        })}

        {/* ── Zones ── */}
        {zones.map((zone, zi) => {
          const zx = zoneX(zi);
          const zy = MARGIN;
          const active = zi === selZone;
          const pct = zonePct(zone);

          return (
            <g key={zone.name} onClick={() => onZone(zi)} style={{ cursor: "pointer" }}>

              {/* Zone background */}
              <rect
                x={zx} y={zy}
                width={ZONE_W} height={ZONE_H}
                fill="white"
                stroke={active ? "#059669" : "#cbd5e1"}
                strokeWidth={active ? 2 : 0.5}
              />

              {/* Header strip */}
              <rect
                x={zx} y={zy}
                width={ZONE_W} height={HDR_H}
                fill={active ? "#d1fae5" : "#f1f5f9"}
              />

              {/* Zone name — top-left */}
              <text
                x={zx + 8} y={zy + 10}
                dominantBaseline="middle"
                fontSize="11" fontWeight="700"
                fill={active ? "#065f46" : "#1e293b"}
                fontFamily="Inter,system-ui,sans-serif"
              >
                {zone.name}
              </text>

              {/* Occupancy % — top-right */}
              <text
                x={zx + ZONE_W - 8} y={zy + 10}
                textAnchor="end" dominantBaseline="middle"
                fontSize="11" fill="#64748b"
                fontFamily="Inter,system-ui,sans-serif"
              >
                {pct}%
              </text>

              {/* Dãy rows */}
              {(zone.days ?? []).map((day, di) => {
                const ry = zy + HDR_H + 6 + di * (ROW_H + ROW_GAP);
                // Don't render rows that overflow the zone bottom
                if (ry + ROW_H > zy + ZONE_H - 4) return null;

                return (
                  <g key={day.name}>
                    {/* Row background strip */}
                    <rect
                      x={zx + 3} y={ry}
                      width={ZONE_W - 6} height={ROW_H}
                      fill="#f8fafc"
                      stroke="#e2e8f0" strokeWidth="0.5"
                      rx="2"
                    />

                    {/* Dãy label — middle left */}
                    <text
                      x={zx + 8} y={ry + ROW_H / 2}
                      fontSize="9" fill="#64748b" fontWeight="600"
                      fontFamily="Inter,system-ui,sans-serif"
                      dominantBaseline="middle"
                    >
                      {day.name}
                    </text>

                    {/* Shelf cells */}
                    {(day.shelves ?? []).slice(0, CELLS_PER_ROW).map((shelf, si) => {
                      const cx = zx + INNER_PAD + si * (CELL_W + CELL_GAP);
                      const cy = ry + (ROW_H - CELL_H) / 2; // Center cells vertically in row
                      const cp = shelfPct(shelf);
                      const warn = (shelf.floors ?? []).some(f => f.expiringSoon);
                      const isActive = shelf.name === selShelf;

                      return (
                        <g
                          key={shelf.name}
                          onClick={e => { e.stopPropagation(); onShelf(zi, day, shelf); }}
                          style={{ cursor: "pointer" }}
                        >
                          {/* Cell body */}
                          <rect
                            x={cx} y={cy}
                            width={CELL_W} height={CELL_H}
                            rx="2"
                            fill={cFill(cp)}
                            stroke={isActive ? "#059669" : cStroke(cp)}
                            strokeWidth={isActive ? 1.5 : 0.5}
                          />

                          {/* Shelf name */}
                          <text
                            x={cx + CELL_W / 2} y={cy + CELL_H / 2 - 4}
                            textAnchor="middle" dominantBaseline="middle"
                            fontSize="7" fill="#475569"
                            fontFamily="Inter,system-ui,sans-serif"
                          >
                            {shelf.name}
                          </text>

                          {/* % label */}
                          <text
                            x={cx + CELL_W / 2} y={cy + CELL_H / 2 + 5}
                            textAnchor="middle" dominantBaseline="middle"
                            fontSize="6.5" fill="#94a3b8"
                            fontFamily="Inter,system-ui,sans-serif"
                          >
                            {cp}%
                          </text>

                          {/* Mini bar */}
                          <rect x={cx + 4} y={cy + CELL_H - 7} width={CELL_W - 8} height="3" rx="1" fill="#e2e8f0" />
                          <rect
                            x={cx + 4} y={cy + CELL_H - 7}
                            width={Math.max(0, (CELL_W - 8) * Math.min(cp, 100) / 100)}
                            height="3" rx="1"
                            fill={bFill(cp)}
                          />

                          {/* Expiry warning dot */}
                          {warn && (
                            <circle cx={cx + CELL_W - 4} cy={cy + 4} r="3" fill="#f59e0b" />
                          )}

                          {/* Active ring */}
                          {isActive && (
                            <rect
                              x={cx - 1} y={cy - 1}
                              width={CELL_W + 2} height={CELL_H + 2}
                              rx="3" fill="none"
                              stroke="#059669" strokeWidth="1.5"
                              opacity="0.6"
                            />
                          )}
                        </g>
                      );
                    })}

                    {/* "overflow" indicator if more shelves than cells fit */}
                    {day.shelves.length > CELLS_PER_ROW && (
                      <text
                        x={zx + ZONE_W - INNER_PAD}
                        y={ry + ROW_H / 2}
                        textAnchor="end" dominantBaseline="middle"
                        fontSize="7" fill="#94a3b8"
                        fontFamily="Inter,system-ui,sans-serif"
                      >
                        +{day.shelves.length - CELLS_PER_ROW}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Active zone border overlay */}
              {active && (
                <rect
                  x={zx} y={zy}
                  width={ZONE_W} height={ZONE_H}
                  rx="1" fill="none"
                  stroke="#059669" strokeWidth="2"
                  pointerEvents="none"
                />
              )}
            </g>
          );
        })}

        {/* ── Entrance marker ── */}
        <rect
          x={totalW / 2 - 40} y={CANVAS_H - 14}
          width={80} height={12}
          rx="3" fill="#e2e8f0"
        />
        <text
          x={totalW / 2} y={CANVAS_H - 7}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="7.5" fill="#94a3b8"
          fontFamily="Inter,system-ui,sans-serif"
        >
          ↕  CỬA VÀO / RA
        </text>
      </svg>

      {/* ── Legend ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "6px 12px",
        borderTop: "1px solid #e2e8f0",
        background: "white",
        flexWrap: "wrap",
      }}>
        {([
          ["#f8fafc", "#e2e8f0", "Trống (0–50%)"],
          ["#fef9c3", "#fbbf24", "Vừa (51–80%)"],
          ["#fee2e2", "#f87171", "Gần đầy (>80%)"],
        ] as const).map(([bg, bd, lbl]) => (
          <span key={lbl} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#64748b" }}>
            <span style={{ width: 14, height: 10, borderRadius: 2, border: `0.5px solid ${bd}`, background: bg, display: "inline-block", flexShrink: 0 }} />
            {lbl}
          </span>
        ))}
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#64748b" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", display: "inline-block", flexShrink: 0 }} />
          Sắp hết hạn
        </span>
      </div>
    </div>
  );
}
