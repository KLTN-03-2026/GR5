"use client";

import React, { useState, useCallback } from "react";
import {
  Package, AlertTriangle, Download, Map as MapIcon, Box,
  ChevronRight, Home, RefreshCw, Grid3x3, Layers, LayoutGrid,
} from "lucide-react";
import BatchPopup from "./BatchPopup";
import ZoneManager from "./ZoneManager";

// ─── Types ───────────────────────────────────────────────
interface Floor {
  id: number;
  tang: string;
  capacity: number;
  current: number;
  expiring: number;
  suc_chua_toi_da: number | null;
  ghi_chu: string | null;
  so_luong_ton: number;
}
interface Shelf { name: string; floors: Floor[] }
interface Day   { name: string; shelves: Shelf[] }
interface Zone  {
  name: string;
  totalCapacity: number;
  totalCurrent: number;
  expiringSoon: number;
  days: Day[];
}

// ─── Helpers ─────────────────────────────────────────────
const getColor = (percent: number, isEmpty: boolean) => {
  if (isEmpty) return { bg: "bg-gray-100", border: "border-gray-200", text: "text-gray-400", bar: "#d1d5db", badge: "bg-gray-100 text-gray-400" };
  if (percent > 90) return { bg: "bg-red-50",   border: "border-red-200",   text: "text-red-600",   bar: "#ef4444", badge: "bg-red-100 text-red-700" };
  if (percent > 75) return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", bar: "#f59e0b", badge: "bg-amber-100 text-amber-700" };
  return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", bar: "#10b981", badge: "bg-emerald-100 text-emerald-700" };
};

const StatCard = ({ icon: Icon, label, value, color, bg }: any) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg}`}>
      <Icon className={color} size={22} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────
export default function WarehouseMap({ mapData, statsData, inventoryData, zonesRaw: initialZones }: {
  mapData?: any[];
  statsData?: any;
  inventoryData?: any[];
  zonesRaw?: Zone[];
}) {
  // Drill-down state: null = zone level, string = selected zone name
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedDay,  setSelectedDay]  = useState<Day | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null);

  // Popup state
  const [popup, setPopup] = useState<{ id: number; label: string } | null>(null);

  // Live zones data (refreshed after CRUD)
  const [zones, setZones] = useState<Zone[]>(initialZones || []);
  const [refreshing, setRefreshing] = useState(false);

  const refreshZones = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/warehouse/zones");
      const data = await res.json();
      setZones(data.zones || []);
      // Reset drill-down on refresh
      setSelectedZone(null);
      setSelectedDay(null);
      setSelectedShelf(null);
    } catch (e) { console.error(e); }
    finally { setRefreshing(false); }
  }, []);

  // ── Level helpers ──────────────────────────────────────
  const goHome    = () => { setSelectedZone(null); setSelectedDay(null); setSelectedShelf(null); };
  const goToZone  = (z: Zone) => { setSelectedZone(z); setSelectedDay(null); setSelectedShelf(null); };
  const goToDay   = (d: Day)  => { setSelectedDay(d);  setSelectedShelf(null); };
  const goToShelf = (s: Shelf) => setSelectedShelf(s);

  // ── Color legend ──────────────────────────────────────
  const Legend = () => (
    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
      {[
        { color: "bg-gray-200",    label: "Trống" },
        { color: "bg-emerald-400", label: "< 75%" },
        { color: "bg-amber-400",   label: "75–90%" },
        { color: "bg-red-400",     label: "> 90%" },
      ].map(({ color, label }) => (
        <span key={label} className="flex items-center gap-1.5 font-medium">
          <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
          {label}
        </span>
      ))}
    </div>
  );

  // ── Breadcrumb ─────────────────────────────────────────
  const Breadcrumb = () => (
    <div className="flex items-center gap-1 text-sm flex-wrap">
      <button onClick={goHome} className="flex items-center gap-1 text-[#1D9E75] hover:underline font-medium">
        <Home size={13} /> Kho
      </button>
      {selectedZone && (
        <>
          <ChevronRight size={13} className="text-gray-300" />
          <button onClick={() => { setSelectedDay(null); setSelectedShelf(null); }} className="text-[#1D9E75] hover:underline font-medium">
            {selectedZone.name}
          </button>
        </>
      )}
      {selectedDay && (
        <>
          <ChevronRight size={13} className="text-gray-300" />
          <button onClick={() => setSelectedShelf(null)} className="text-[#1D9E75] hover:underline font-medium">
            {selectedDay.name}
          </button>
        </>
      )}
      {selectedShelf && (
        <>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="text-gray-600 font-medium">Kệ {selectedShelf.name}</span>
        </>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────
  // LEVEL 0: Danh sách khu vực
  // ─────────────────────────────────────────────────────────
  const ZoneGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {zones.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-300">
          <Grid3x3 size={48} className="mb-3 opacity-40" />
          <p className="text-sm font-medium text-gray-400">Chưa có khu vực nào</p>
          <p className="text-xs text-gray-300 mt-1">Thêm khu vực từ panel bên phải</p>
        </div>
      ) : (
        zones.map((zone) => {
          const pct = zone.totalCapacity > 0 ? Math.round((zone.totalCurrent / zone.totalCapacity) * 100) : 0;
          const isEmpty = zone.totalCurrent === 0;
          const c = getColor(pct, isEmpty);
          return (
            <button
              key={zone.name}
              onClick={() => goToZone(zone)}
              className={`relative p-5 rounded-2xl border-2 ${c.bg} ${c.border} hover:shadow-lg transition-all duration-200 text-left group active:scale-[0.98]`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${c.badge} flex items-center justify-center`}>
                    <LayoutGrid size={15} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{zone.name}</h3>
                    <p className="text-[10px] text-gray-400">{zone.days.length} dãy • {zone.days.reduce((a, d) => a + d.shelves.length, 0)} kệ</p>
                  </div>
                </div>
                {zone.expiringSoon > 0 && (
                  <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <AlertTriangle size={9} /> {zone.expiringSoon}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm mb-3">
                <Box size={14} className="text-gray-400" />
                <span className="font-semibold text-gray-800">{zone.totalCurrent.toLocaleString()}</span>
                <span className="text-gray-400">/ {zone.totalCapacity.toLocaleString()} thùng</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: c.bar }} />
              </div>
              <div className={`text-right text-[11px] font-bold ${c.text}`}>
                {isEmpty ? "Trống" : `${pct}% đã dùng`}
              </div>

              <div className="absolute top-4 right-4 text-gray-200 group-hover:text-gray-400 transition-colors">
                <ChevronRight size={16} />
              </div>
            </button>
          );
        })
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────
  // LEVEL 1: Các dãy trong khu
  // ─────────────────────────────────────────────────────────
  const DayGrid = ({ zone }: { zone: Zone }) => (
    <div>
      <p className="text-xs text-gray-400 mb-3 font-medium">Chọn dãy để xem chi tiết kệ</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
        {zone.days.map((day) => {
          const total = day.shelves.reduce((a, s) => a + s.floors.reduce((b, f) => b + f.capacity, 0), 0);
          const curr  = day.shelves.reduce((a, s) => a + s.floors.reduce((b, f) => b + f.current, 0), 0);
          const pct = total > 0 ? Math.round((curr / total) * 100) : 0;
          const c = getColor(pct, curr === 0);
          return (
            <button key={day.name} onClick={() => goToDay(day)}
              className={`p-4 rounded-xl border-2 ${c.bg} ${c.border} hover:shadow-md transition-all text-left active:scale-[0.97] group`}>
              <div className="flex items-center gap-2 mb-2">
                <Layers size={14} className={c.text} />
                <span className="font-bold text-gray-700 text-sm">{day.name}</span>
              </div>
              <p className="text-[11px] text-gray-400">{day.shelves.length} kệ</p>
              <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: c.bar }} />
              </div>
              <div className={`text-[10px] font-bold mt-1 ${c.text} text-right`}>{pct}%</div>
              <ChevronRight size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-200 group-hover:text-gray-400 transition-colors hidden group-hover:block" />
            </button>
          );
        })}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────
  // LEVEL 2: Các kệ trong dãy
  // ─────────────────────────────────────────────────────────
  const ShelfGrid = ({ day }: { day: Day }) => (
    <div>
      <p className="text-xs text-gray-400 mb-3 font-medium">Chọn kệ để xem từng tầng</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
        {day.shelves.map((shelf) => {
          const total = shelf.floors.reduce((a, f) => a + f.capacity, 0);
          const curr  = shelf.floors.reduce((a, f) => a + f.current, 0);
          const pct = total > 0 ? Math.round((curr / total) * 100) : 0;
          const c = getColor(pct, curr === 0);
          return (
            <button key={shelf.name} onClick={() => goToShelf(shelf)}
              className={`p-4 rounded-xl border-2 ${c.bg} ${c.border} hover:shadow-md transition-all text-left active:scale-[0.97]`}>
              <div className="flex items-center gap-2 mb-2">
                <Grid3x3 size={14} className={c.text} />
                <span className="font-bold text-gray-700 text-sm">Kệ {shelf.name}</span>
              </div>
              <p className="text-[11px] text-gray-400">{shelf.floors.length} tầng</p>
              <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: c.bar }} />
              </div>
              <div className={`text-[10px] font-bold mt-1 ${c.text} text-right`}>{pct}%</div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────
  // LEVEL 3: Các tầng (ô lá) — có thể click mở popup lô
  // ─────────────────────────────────────────────────────────
  const FloorGrid = ({ shelf }: { shelf: Shelf }) => (
    <div>
      <p className="text-xs text-gray-400 mb-3 font-medium">Click vào ô tầng để xem lô hàng đang lưu trữ</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
        {shelf.floors.map((floor) => {
          const pct = floor.capacity > 0 ? Math.round((floor.current / floor.capacity) * 100) : 0;
          const isEmpty = floor.current === 0;
          const c = getColor(pct, isEmpty);
          const label = `${selectedZone?.name || ""} / ${selectedDay?.name || ""} / Kệ ${shelf.name} / ${floor.tang}`;
          return (
            <button
              key={floor.id}
              onClick={() => setPopup({ id: floor.id, label })}
              className={`relative p-4 rounded-xl border-2 ${c.bg} ${c.border} hover:shadow-lg transition-all active:scale-[0.96] text-left group`}
            >
              {floor.expiring > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <AlertTriangle size={9} className="text-white" />
                </span>
              )}
              <div className="flex items-center gap-1.5 mb-2">
                <Box size={13} className={c.text} />
                <span className="font-bold text-gray-700 text-xs">{floor.tang}</span>
              </div>
              <div className="text-[11px] text-gray-500 mb-1">
                <span className="font-semibold text-gray-700">{floor.current}</span>
                <span className="text-gray-400">/{floor.capacity} thùng</span>
              </div>
              {floor.expiring > 0 && (
                <span className="text-[10px] text-amber-600 font-medium">⚠ {floor.expiring} lô sắp HH</span>
              )}
              <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: c.bar }} />
              </div>
              <div className={`text-[10px] font-bold mt-1 text-right ${c.text}`}>
                {isEmpty ? "Trống" : `${pct}%`}
              </div>
              {floor.ghi_chu && (
                <p className="text-[10px] text-gray-400 mt-1.5 truncate italic">{floor.ghi_chu}</p>
              )}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] text-gray-400 font-medium">Xem lô →</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard icon={Package}       label="Tổng thùng trong kho"  value={(statsData?.totalBoxes || 0).toLocaleString()} color="text-[#1D9E75]" bg="bg-[#1D9E75]/10" />
        <StatCard icon={AlertTriangle} label="Sắp hết hạn"            value={(statsData?.expiringBoxes || 0).toLocaleString()} color="text-amber-500" bg="bg-amber-50" />
        <StatCard icon={Download}      label="Đã xuất trong tháng"    value={(statsData?.exportedBoxes || 0).toLocaleString()} color="text-blue-500" bg="bg-blue-50" />
      </div>

      {/* Map + Manager split */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">

        {/* ── BẢN ĐỒ TƯƠNG TÁC ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Map header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center">
                <MapIcon size={18} className="text-[#1D9E75]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  Bản đồ Sức chứa
                  {refreshing && <RefreshCw size={13} className="text-gray-400 animate-spin" />}
                </h2>
                <Breadcrumb />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Legend />
              <button onClick={refreshZones} disabled={refreshing}
                className="p-2 text-gray-400 hover:text-[#1D9E75] hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40">
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* Map body */}
          <div className="p-6 min-h-[320px]">
            {!selectedZone  && <ZoneGrid />}
            {selectedZone && !selectedDay   && <DayGrid  zone={selectedZone} />}
            {selectedDay  && !selectedShelf && <ShelfGrid day={selectedDay} />}
            {selectedShelf && <FloorGrid shelf={selectedShelf} />}
          </div>
        </div>

        {/* ── ZONE MANAGER (CRUD) ── */}
        <div className="sticky top-6 h-[600px]">
          <ZoneManager zones={zones} onRefresh={refreshZones} />
        </div>
      </div>

      {/* Bảng tồn kho chi tiết */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-blue-500" />
            <h2 className="text-base font-bold text-gray-800">Danh sách tồn kho chi tiết</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 rounded-tl-lg">Sản phẩm</th>
                <th className="px-4 py-3">Mã Lô</th>
                <th className="px-4 py-3 text-right">Tồn (thùng)</th>
                <th className="px-4 py-3">Vị trí</th>
                <th className="px-4 py-3 rounded-tr-lg">Hạn SD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inventoryData && inventoryData.length > 0 ? (
                inventoryData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.san_pham}</td>
                    <td className="px-4 py-3 text-[#1D9E75] font-mono text-xs">{item.ma_lo}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">{item.so_luong?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.vi_tri}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.han_su_dung}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">Không có hàng trong kho</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Popup */}
      {popup && (
        <BatchPopup positionId={popup.id} positionLabel={popup.label} onClose={() => setPopup(null)} />
      )}
    </div>
  );
}
