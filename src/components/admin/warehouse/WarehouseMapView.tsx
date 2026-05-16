"use client";
import { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle, ArrowLeft, ChevronRight, ChevronDown,
  Clock, History, Layers3, LayoutGrid,
  Package, RefreshCw, TrendingUp, X, ZoomIn, ZoomOut,
  MapPin, Box, ShieldAlert, BarChart3, Thermometer,
  Eye, FileText, Search, Filter, ArrowUpDown,
  Warehouse, Timer, PackageCheck, Truck,
} from "lucide-react";
import ExpirationWarnings from "./ExpirationWarnings";
import IssueHistory from "./IssueHistory";
import ZoneManager from "./ZoneManager";
import { type Day, type Floor, type Shelf, type Zone } from "./WarehouseFloorPlan";

type MapData = { zones: Zone[]; stats: { totalBoxes: number; expiringBoxes: number; zonesCount: number } };

const pctColor = (p: number) => p > 80
  ? { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500", border: "border-red-200", badge: "bg-red-100 text-red-700", ring: "ring-red-500/20" }
  : p > 50
    ? { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", ring: "ring-amber-500/20" }
    : { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", ring: "ring-emerald-500/20" };

const zonePct = (z: Zone) => z.totalCapacity > 0 ? Math.round((z.totalCurrent / z.totalCapacity) * 100) : 0;
const shelfAvgPct = (sh: Shelf) => sh.floors.length ? Math.round(sh.floors.reduce((a, f) => a + f.percent, 0) / sh.floors.length) : 0;

/* ── Tab bar ── */
function TabBar({ active, onChange, readOnly }: { active: string; onChange: (t: string) => void; readOnly?: boolean }) {
  const allTabs = [
    { id: "map", label: "Sơ đồ kho", icon: LayoutGrid },
    { id: "warnings", label: "Cảnh báo HSD", icon: AlertTriangle },
    { id: "history", label: "Lịch sử", icon: Clock },
  ];
  const tabs = readOnly ? allTabs.filter(t => t.id !== "warnings") : allTabs;
  return (
    <div className="flex border-b border-gray-200 bg-white rounded-t-xl">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
            active === id
              ? "text-emerald-700 border-emerald-600"
              : "text-gray-500 border-transparent hover:text-gray-700"
          }`}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </div>
  );
}

/* ── KPI Card ── */
function KpiCard({ icon: Icon, label, value, accent, warning }: { icon: React.ElementType; label: string; value: number | string; accent: string; warning?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border ${warning ? "border-red-200" : "border-gray-100"} p-4 flex items-start gap-3 shadow-sm`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${warning ? "text-red-600" : "text-gray-900"}`}>{value}</p>
      </div>
      {warning && (
        <div className="ml-auto">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
            <AlertTriangle size={10} /> Cảnh báo
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Zone Card (overview grid) ── */
function ZoneCard({ zone, onClick }: { zone: Zone; onClick: () => void }) {
  const pct = zonePct(zone);
  const col = pctColor(pct);
  const dayCount = zone.days.length;
  const shelfCount = zone.days.reduce((a, d) => a + d.shelves.length, 0);
  const hasWarning = zone.expiringSoon > 3;

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-xl border ${hasWarning ? "border-red-300" : "border-gray-100"} p-5 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all group overflow-hidden`}
    >
      {hasWarning && (
        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
          <div className="absolute top-3 -right-6 w-32 text-center transform rotate-45 bg-red-500 text-white text-[10px] font-bold py-0.5 shadow-sm">
            CẢNH BÁO
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">{zone.name}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Mã khu: {zone.name.replace(/\s/g, "-").toUpperCase()}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${col.badge}`}>
          {pct}% đầy
        </span>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-[11px] text-gray-500 mb-1">
          <span>Sức chứa</span>
          <span className="font-medium">{zone.totalCurrent}/{zone.totalCapacity}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          {hasWarning ? (
            <div className="h-full flex">
              <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${Math.max(pct - zone.expiringSoon, 0)}%` }} />
              <div className="h-full bg-red-500 rounded-r-full" style={{ width: `${Math.min(zone.expiringSoon * 2, pct)}%` }} />
            </div>
          ) : (
            <div className={`h-full ${col.bar} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-[12px] text-gray-500 mb-3">
        <span className="flex items-center gap-1"><Box size={12} className="text-gray-400" /> {dayCount} dãy</span>
        <span className="flex items-center gap-1"><BarChart3 size={12} className="text-gray-400" /> {shelfCount} kệ</span>
        {zone.expiringSoon > 0 && (
          <span className="flex items-center gap-1 text-red-600 font-medium">
            <AlertTriangle size={12} /> {zone.expiringSoon} sắp HH
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {zone.days.slice(0, 12).map((day, i) => {
          const dayPct = day.shelves.length > 0
            ? Math.round(day.shelves.reduce((a, s) => a + shelfAvgPct(s), 0) / day.shelves.length)
            : 0;
          const cellCol = dayPct > 80 ? "bg-red-400" : dayPct > 50 ? "bg-amber-400" : dayPct > 0 ? "bg-emerald-400" : "bg-gray-200";
          return <div key={i} className={`w-5 h-5 rounded ${cellCol} opacity-80`} title={`${day.name}: ${dayPct}%`} />;
        })}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {hasWarning ? (
          <button className="flex items-center gap-1.5 text-[12px] font-semibold text-red-600 hover:text-red-700">
            <ShieldAlert size={13} /> Xử lý hàng
          </button>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-1 text-[12px] text-emerald-600 font-medium group-hover:gap-2 transition-all">
          Xem chi tiết <ChevronRight size={13} />
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ZONE DETAIL — Full-page immersive view
   ═══════════════════════════════════════════════════════════════════ */
function ZoneDetail({ zone, onBack, readOnly, onShowHistory }: { zone: Zone; onBack: () => void; readOnly: boolean; onShowHistory: () => void }) {
  const [activeDay, setActiveDay] = useState<number>(0);
  const [selShelf, setSelShelf] = useState<Shelf | null>(null);
  const [zoom, setZoom] = useState(100);
  const [searchBatch, setSearchBatch] = useState("");
  const [showBatchTable, setShowBatchTable] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "pct" | "hsd">("pct");

  const pct = zonePct(zone);
  const col = pctColor(pct);
  const currentDay = zone.days[activeDay] ?? null;
  const totalShelves = zone.days.reduce((a, d) => a + d.shelves.length, 0);
  const totalBatches = zone.days.reduce((a, d) => a + d.shelves.reduce((b, s) => b + s.floors.reduce((c, f) => c + f.batches.length, 0), 0), 0);

  const allBatches = useMemo(() => {
    return zone.days.flatMap(d =>
      d.shelves.flatMap(s =>
        s.floors.flatMap(f =>
          f.batches.map(b => ({ ...b, shelf: s.name, day: d.name }))
        )
      )
    ).filter(b => !searchBatch || b.san_pham.toLowerCase().includes(searchBatch.toLowerCase()) || b.ma_lo_hang.toLowerCase().includes(searchBatch.toLowerCase()));
  }, [zone, searchBatch]);

  const sortedShelves = useMemo(() => {
    if (!currentDay) return [];
    const shelves = [...currentDay.shelves];
    if (sortBy === "pct") shelves.sort((a, b) => shelfAvgPct(b) - shelfAvgPct(a));
    if (sortBy === "hsd") shelves.sort((a, b) => {
      const aWarn = a.floors.some(f => f.expiringSoon) ? 1 : 0;
      const bWarn = b.floors.some(f => f.expiringSoon) ? 1 : 0;
      return bWarn - aWarn;
    });
    return shelves;
  }, [currentDay, sortBy]);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportForm, setExportForm] = useState({ lo_hang_id: "", so_luong_xuat: "", ly_do: "Giao khách hàng", ghi_chu: "" });
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exportSuccess, setExportSuccess] = useState("");

  const handleCreateExport = async () => {
    setExportError(""); setExportSuccess("");
    if (!exportForm.so_luong_xuat || isNaN(Number(exportForm.so_luong_xuat))) return setExportError("Vui lòng nhập số lượng hợp lệ");
    if (!exportForm.lo_hang_id) return setExportError("Vui lòng chọn lô hàng");
    setExportLoading(true);
    try {
      const r = await fetch("/api/admin/warehouse/export-receipt", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shelf_id: selShelf?.name,
          lo_hang_id: Number(exportForm.lo_hang_id),
          so_luong_xuat: Number(exportForm.so_luong_xuat),
          ly_do: exportForm.ly_do,
          ghi_chu: exportForm.ghi_chu,
        })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Có lỗi xảy ra");
      setExportSuccess(`Đã tạo phiếu xuất ${d.ma_phieu}`);
      setTimeout(() => { setShowExportModal(false); setExportSuccess(""); }, 2000);
    } catch (e: any) {
      setExportError(e.message);
    } finally { setExportLoading(false); }
  };

  const hsdBadge = (days: number | null) => {
    if (days == null) return { cls: "bg-gray-100 text-gray-500", label: "N/A" };
    if (days < 7) return { cls: "bg-red-100 text-red-700 border border-red-200", label: `${days} ngày` };
    if (days < 30) return { cls: "bg-amber-100 text-amber-700 border border-amber-200", label: `${days} ngày` };
    return { cls: "bg-emerald-100 text-emerald-700 border border-emerald-200", label: `${days} ngày` };
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col animate-fadeIn">
      {/* ─── Top Navigation Bar ─── */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0 shadow-sm">
        <button onClick={onBack} className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all hover:shadow-sm mr-4">
          <ArrowLeft size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Warehouse size={18} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-gray-900 leading-tight">{zone.name}</h1>
            <p className="text-[11px] text-gray-400">Chi tiết khu vực kho</p>
          </div>
        </div>

        <span className={`ml-4 px-3 py-1 rounded-full text-[11px] font-bold ${col.badge}`}>{pct}% sức chứa</span>

        <div className="ml-auto flex items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setZoom(z => Math.max(60, z - 10))} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white transition-colors">
              <ZoomOut size={14} />
            </button>
            <span className="text-[11px] font-semibold text-gray-700 px-2 min-w-[36px] text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(140, z + 10))} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white transition-colors">
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Toggle batch table */}
          <button
            onClick={() => setShowBatchTable(!showBatchTable)}
            className={`flex items-center gap-2 h-8 px-3 rounded-lg border text-[12px] font-medium transition-all ${
              showBatchTable ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FileText size={13} /> Bảng lô hàng
          </button>

          <button onClick={onShowHistory} className="flex items-center gap-2 h-8 px-3 rounded-lg border border-gray-200 bg-white text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <History size={13} /> Lịch sử
          </button>
        </div>
      </header>

      {/* ─── KPI Strip ─── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="grid grid-cols-5 gap-4">
          {[
            { icon: Box, label: "Dãy", value: zone.days.length, color: "text-blue-600 bg-blue-50" },
            { icon: BarChart3, label: "Kệ", value: totalShelves, color: "text-emerald-600 bg-emerald-50" },
            { icon: Package, label: "Lô hàng", value: totalBatches, color: "text-violet-600 bg-violet-50" },
            { icon: PackageCheck, label: "Đang chứa", value: `${zone.totalCurrent}/${zone.totalCapacity}`, color: "text-slate-600 bg-slate-50" },
            { icon: AlertTriangle, label: "Sắp hết hạn", value: zone.expiringSoon, color: zone.expiringSoon > 0 ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50" },
          ].map(kpi => (
            <div key={kpi.label} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <kpi.icon size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{kpi.label}</p>
                <p className="text-[16px] font-bold text-gray-900 leading-tight">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Shelf Grid / Batch Table */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Day tabs + controls */}
          <div className="flex items-center gap-2 px-6 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              {zone.days.map((day, i) => (
                <button
                  key={day.name}
                  onClick={() => { setActiveDay(i); setSelShelf(null); }}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                    activeDay === i
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {day.name}
                  <span className="ml-1.5 text-[10px] text-gray-400">({day.shelves.length})</span>
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <ArrowUpDown size={11} />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-transparent text-[11px] text-gray-600 font-medium outline-none cursor-pointer"
                >
                  <option value="pct">Sức chứa</option>
                  <option value="name">Tên kệ</option>
                  <option value="hsd">Cảnh báo HSD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Legend mini */}
          <div className="flex items-center gap-4 px-6 py-2 bg-gray-50/50 border-b border-gray-100">
            {[
              { bg: "bg-emerald-400", label: "Trống" },
              { bg: "bg-amber-400", label: "Trung bình" },
              { bg: "bg-red-400", label: "Gần đầy" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <div className={`w-2.5 h-2.5 rounded-sm ${l.bg}`} />
                {l.label}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              Sắp HSD
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-6">
            {showBatchTable ? (
              /* ─── Batch Table View ─── */
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchBatch}
                      onChange={e => setSearchBatch(e.target.value)}
                      placeholder="Tìm theo tên sản phẩm, mã lô..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    />
                  </div>
                  <span className="text-[12px] text-gray-400">{allBatches.length} lô hàng</span>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Sản phẩm</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Mã lô</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Vị trí</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-gray-600">Số lượng</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-gray-600">Hạn SD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allBatches.map(b => {
                        const hsd = hsdBadge(b.days_left);
                        return (
                          <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900">{b.san_pham}</td>
                            <td className="px-4 py-3 text-gray-500 font-mono text-[12px]">{b.ma_lo_hang}</td>
                            <td className="px-4 py-3 text-gray-500">{b.day} / {b.shelf}</td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900">{b.so_luong}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${hsd.cls}`}>{hsd.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                      {allBatches.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-[13px]">Không tìm thấy lô hàng nào</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* ─── Shelf Grid View ─── */
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(auto-fill, minmax(${Math.round(140 * zoom / 100)}px, 1fr))`,
                  transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
                  transformOrigin: "top left",
                }}
              >
                {sortedShelves.map(sh => {
                  const sp = shelfAvgPct(sh);
                  const c = pctColor(sp);
                  const isAct = selShelf?.name === sh.name;
                  const hasWarn = sh.floors.some(f => f.expiringSoon);
                  const batchCount = sh.floors.reduce((a, f) => a + f.batches.length, 0);

                  return (
                    <div
                      key={sh.name}
                      onClick={() => setSelShelf(isAct ? null : sh)}
                      className={`relative rounded-xl border-2 p-4 cursor-pointer flex flex-col transition-all duration-200 ${
                        isAct
                          ? `border-emerald-500 ${c.ring} ring-4 shadow-lg scale-[1.02]`
                          : `${c.border} hover:shadow-md hover:scale-[1.01]`
                      } ${c.bg}`}
                    >
                      {/* Shelf header */}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`text-[14px] font-bold ${isAct ? "text-emerald-700" : "text-gray-800"}`}>{sh.name}</span>
                          <p className="text-[10px] text-gray-400 mt-0.5">{batchCount} lô · {sh.floors.length} tầng</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {hasWarn && (
                            <div className="relative">
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping opacity-40" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Percentage display */}
                      <div className={`text-2xl font-black text-center py-2 tabular-nums ${
                        sp > 80 ? "text-red-600" : sp > 50 ? "text-amber-600" : "text-emerald-600"
                      }`}>
                        {sp}%
                      </div>

                      {/* Mini floor indicators */}
                      <div className="flex gap-0.5 justify-center mb-2">
                        {sh.floors.map((f, fi) => {
                          const fc = f.percent > 80 ? "bg-red-400" : f.percent > 50 ? "bg-amber-400" : f.percent > 0 ? "bg-emerald-400" : "bg-gray-200";
                          return <div key={fi} className={`w-3 h-1.5 rounded-sm ${fc}`} title={`Tầng ${f.tang}: ${f.percent}%`} />;
                        })}
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 bg-white/70 rounded-full overflow-hidden mt-auto">
                        <div className={`h-full ${c.bar} rounded-full transition-all duration-500`} style={{ width: `${Math.min(sp, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        {selShelf && (
          <aside className="w-[380px] bg-white border-l border-gray-200 flex-shrink-0 flex flex-col overflow-hidden shadow-lg">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Layers3 size={15} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900">{selShelf.name}</h3>
                  <p className="text-[11px] text-gray-400">{currentDay?.name} · {zone.name}</p>
                </div>
              </div>
              <button onClick={() => setSelShelf(null)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
                <X size={14} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {/* Capacity section */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[12px] font-medium text-gray-500">Sức chứa kệ</span>
                  <span className={`text-[15px] font-bold ${pctColor(shelfAvgPct(selShelf)).text}`}>{shelfAvgPct(selShelf)}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div className={`h-full ${pctColor(shelfAvgPct(selShelf)).bar} rounded-full transition-all duration-500`} style={{ width: `${Math.min(shelfAvgPct(selShelf), 100)}%` }} />
                </div>

                {/* Floor breakdown */}
                <div className="space-y-2">
                  {selShelf.floors.map((f, fi) => {
                    const fc = pctColor(f.percent);
                    return (
                      <div key={fi} className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400 w-12 flex-shrink-0">Tầng {f.tang}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${fc.bar} rounded-full`} style={{ width: `${Math.min(f.percent, 100)}%` }} />
                        </div>
                        <span className={`text-[10px] font-semibold ${fc.text} w-8 text-right`}>{f.percent}%</span>
                        {f.expiringSoon && <Timer size={10} className="text-amber-500" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Warning */}
              {selShelf.floors.some(f => f.expiringSoon) && (
                <div className="mx-5 my-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[12px] font-semibold text-red-700">Có lô hàng sắp hết hạn!</p>
                    <p className="text-[11px] text-red-500 mt-0.5">Kiểm tra và xử lý trước khi quá hạn</p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="px-5 py-3 flex flex-col gap-2 border-b border-gray-100">
                {shelfAvgPct(selShelf) >= 80 && (
                  <button onClick={() => setShowExportModal(true)} className="flex items-center justify-center gap-2 h-9 rounded-lg bg-amber-500 text-white text-[12px] font-semibold hover:bg-amber-600 transition-colors w-full shadow-sm">
                    <Truck size={14} /> Tạo phiếu xuất kho
                  </button>
                )}
                <button onClick={onShowHistory} className="flex items-center justify-center gap-2 h-9 rounded-lg border border-gray-200 bg-white text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors w-full">
                  <History size={14} /> Lịch sử kệ này
                </button>
              </div>

              {/* Batch list */}
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-gray-400">Lô hàng trong kệ</h4>
                  <span className="text-[11px] text-gray-400">{selShelf.floors.flatMap(f => f.batches).length} lô</span>
                </div>
              </div>

              {selShelf.floors.flatMap(f => f.batches).length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <Package size={28} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-[13px] text-gray-400">Chưa có lô hàng nào</p>
                </div>
              ) : (
                <div className="px-5 pb-4 space-y-2">
                  {selShelf.floors.flatMap(f => f.batches).map(b => {
                    const hsd = hsdBadge(b.days_left);
                    const isUrgent = b.days_left !== null && b.days_left < 7;
                    return (
                      <div key={b.id} className={`rounded-xl border p-3 transition-all hover:shadow-sm ${isUrgent ? "border-red-200 bg-red-50/50" : "border-gray-100 bg-white hover:bg-gray-50"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-gray-900 truncate">{b.san_pham}</p>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">{b.ma_lo_hang}</p>
                          </div>
                          <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold ${hsd.cls}`}>{hsd.label}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
                          <span className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Package size={10} /> SL: <strong className="text-gray-700">{b.so_luong}</strong>
                          </span>
                          {b.ncc && (
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Truck size={10} /> {b.ncc}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && selShelf && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[480px] rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
              <h3 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                <Truck size={18} className="text-amber-600" /> Tạo phiếu xuất kho
              </h3>
              <p className="text-[12px] text-gray-400 mt-1">{zone.name} → {currentDay?.name} → {selShelf.name}</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {exportError && <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-[13px] flex items-center gap-2"><AlertTriangle size={14} />{exportError}</div>}
              {exportSuccess && <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-[13px] flex items-center gap-2"><PackageCheck size={14} />{exportSuccess}</div>}

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Lô hàng</label>
                <select
                  value={exportForm.lo_hang_id}
                  onChange={e => setExportForm(p => ({ ...p, lo_hang_id: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] text-gray-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 bg-gray-50"
                >
                  <option value="">-- Chọn lô hàng --</option>
                  {selShelf.floors.flatMap(f => f.batches).map(b => (
                    <option key={b.id} value={b.id}>{b.san_pham} ({b.ma_lo_hang}) - Tồn: {b.so_luong}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Số lượng xuất *</label>
                <input
                  type="number"
                  min={1}
                  value={exportForm.so_luong_xuat}
                  onChange={e => { const v = e.target.value.replace(/^-/, '').replace(/^0+(?=\d)/, ''); setExportForm(p => ({ ...p, so_luong_xuat: v })); }}
                  onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                  placeholder="Nhập số lượng"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] text-gray-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Lý do xuất</label>
                <select
                  value={exportForm.ly_do}
                  onChange={e => setExportForm(p => ({ ...p, ly_do: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] text-gray-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 bg-gray-50"
                >
                  <option value="Giao khách hàng">Giao khách hàng</option>
                  <option value="Chuyển kho">Chuyển kho</option>
                  <option value="Hàng lỗi/hỏng">Hàng lỗi/hỏng</option>
                  <option value="Hết hạn sử dụng">Hết hạn sử dụng</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Ghi chú</label>
                <textarea
                  value={exportForm.ghi_chu}
                  onChange={e => setExportForm(p => ({ ...p, ghi_chu: e.target.value }))}
                  rows={2}
                  placeholder="Ghi chú thêm (tùy chọn)"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] text-gray-900 outline-none resize-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 bg-gray-50"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
              <button onClick={() => setShowExportModal(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Hủy</button>
              <button onClick={handleCreateExport} disabled={exportLoading} className="px-5 py-2.5 rounded-xl bg-amber-500 text-[13px] font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2">
                {exportLoading ? <><RefreshCw size={13} className="animate-spin" /> Đang tạo...</> : <><Truck size={13} /> Tạo phiếu xuất</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function WarehouseMapView({ readOnly = false }: { readOnly?: boolean }) {
  const [stats, setStats] = useState({ totalBoxes: 0, expiringBoxes: 0, zonesCount: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("map");
  const [zones, setZones] = useState<Zone[]>([]);
  const [activeZone, setActiveZone] = useState<Zone | null>(null);
  const [zoneManagerData, setZoneManagerData] = useState<any[]>([]);

  const totalShelves = zones.reduce((a, z) => a + z.days.reduce((b, d) => b + d.shelves.length, 0), 0);

  const load = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const r = await fetch("/api/admin/warehouse/map", { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json() as MapData;
      setZones(j.zones ?? []);
      setStats({
        totalBoxes: j.stats?.totalBoxes ?? 0,
        expiringBoxes: j.stats?.expiringBoxes ?? 0,
        zonesCount: j.stats?.zonesCount ?? 0,
      });
    } catch { }
    finally { setLoading(false); }
  };

  const loadZoneManager = async () => {
    try {
      const r = await fetch("/api/admin/warehouse/zones", { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      setZoneManagerData(j.zones ?? []);
    } catch { }
  };

  const handleRefreshAll = () => { load(); loadZoneManager(); };

  useEffect(() => { load(); if (!readOnly) loadZoneManager(); }, []);

  return (
    <div className="font-sans text-gray-900">
      {activeZone && tab === "map" && (
        <ZoneDetail zone={activeZone} onBack={() => setActiveZone(null)} readOnly={readOnly} onShowHistory={() => { setActiveZone(null); setTab("history"); }} />
      )}

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        <TabBar active={tab} onChange={setTab} readOnly={readOnly} />

        <div className="p-5">
          {tab === "history" && (
            <IssueHistory
              onViewLocation={(khuVuc) => {
                const zone = zones.find(z => z.name === khuVuc);
                if (zone) {
                  setActiveZone(zone);
                  setTab("map");
                }
              }}
            />
          )}
          {tab === "warnings" && !readOnly && <ExpirationWarnings />}
          {tab === "map" && (
            loading ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] gap-2 text-gray-400">
                <RefreshCw size={22} className="animate-spin" />
                <span className="text-[13px]">Đang tải sơ đồ kho...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-4 mb-5">
                  <KpiCard icon={MapPin} label="Tổng khu vực" value={stats.zonesCount} accent="bg-slate-500" />
                  <KpiCard icon={Package} label="Kiện trong kho" value={stats.totalBoxes} accent="bg-emerald-600" />
                  <KpiCard icon={AlertTriangle} label="Lô gần hết hạn" value={stats.expiringBoxes} accent="bg-red-500" warning={stats.expiringBoxes > 0} />
                  <KpiCard icon={BarChart3} label="Tổng số kệ" value={totalShelves} accent="bg-blue-500" />
                </div>

                <div className="flex items-center justify-between mb-5 px-1">
                  <div className="flex gap-5">
                    {[
                      { bg: "bg-emerald-200", border: "border-emerald-500", label: "Trống (0–50%)" },
                      { bg: "bg-amber-200", border: "border-amber-500", label: "Vừa (51–80%)" },
                      { bg: "bg-red-200", border: "border-red-500", label: "Gần đầy (>80%)" },
                      { bg: "bg-amber-100", border: "border-amber-400", label: "Sắp hết hạn" },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5 text-[12px] text-gray-500">
                        <div className={`w-3 h-3 rounded ${l.bg} border ${l.border}`} />
                        {l.label}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => load(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-500 hover:bg-gray-50 transition-colors">
                    <RefreshCw size={12} /> Làm mới
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {zones.map(zone => <ZoneCard key={zone.name} zone={zone} onClick={() => setActiveZone(zone)} />)}
                </div>

                {!readOnly && (
                  <div className="mt-6">
                    <ZoneManager zones={zoneManagerData} onRefresh={handleRefreshAll} />
                  </div>
                )}
              </>
            )
          )}
        </div>
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}.animate-fadeIn{animation:fadeIn 0.15s ease}`}</style>
    </div>
  );
}
