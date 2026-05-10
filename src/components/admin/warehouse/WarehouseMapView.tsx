"use client";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, ArrowLeft, ChevronRight,
  Clock, History, Layers3, LayoutGrid, Maximize2, Minimize2,
  Package, PlusCircle, RefreshCw, TrendingUp, X, ZoomIn, ZoomOut,
} from "lucide-react";
import ExpirationWarnings from "./ExpirationWarnings";
import IssueHistory from "./IssueHistory";
import ZoneManager from "./ZoneManager";
import { type Day, type Floor, type Shelf, type Zone } from "./WarehouseFloorPlan";

type MapData = { zones: Zone[]; stats: { totalBoxes: number; expiringBoxes: number; zonesCount: number } };


/* ── Helpers ──────────────────────────────────────────────────── */
const pctColor = (p: number) => p > 80 ? { bg: "#fee2e2", text: "#991b1b", bar: "#ef4444" } : p > 50 ? { bg: "#fef9c3", text: "#92400e", bar: "#f59e0b" } : { bg: "#f0fdf4", text: "#065f46", bar: "#059669" };
const zonePct = (z: Zone) => z.totalCapacity > 0 ? Math.round((z.totalCurrent / z.totalCapacity) * 100) : 0;
const shelfAvgPct = (sh: Shelf) => sh.floors.length ? Math.round(sh.floors.reduce((a,f) => a + f.percent, 0) / sh.floors.length) : 0;

/* ── Tab bar ──────────────────────────────────────────────────── */
function TabBar({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  return (
    <div style={{ display:"flex", borderBottom:"0.5px solid #e2e8f0", background:"#fff" }}>
      {[["map","Sơ đồ kho",LayoutGrid],["warnings","Cảnh báo HSD",AlertTriangle],["history","Lịch sử",Clock]].map(([id,lbl,Icon]: any) => (
        <button key={id} onClick={() => onChange(id)} style={{ display:"flex",alignItems:"center",gap:6,padding:"10px 16px",fontSize:13,fontWeight:active===id?500:400,color:active===id?"#047857":"#64748b",background:"none",border:"none",borderBottom:active===id?"2px solid #059669":"2px solid transparent",cursor:"pointer" }}>
          <Icon size={14} />{lbl}
        </button>
      ))}
    </div>
  );
}

/* ── Zone List card ───────────────────────────────────────────── */
function ZoneCard({ zone, onClick }: { zone: Zone; onClick: () => void }) {
  const pct = zonePct(zone);
  const col = pctColor(pct);
  const dayCount = zone.days.length;
  const shelfCount = zone.days.reduce((a, d) => a + d.shelves.length, 0);
  return (
    <div onClick={onClick} style={{ width:280,height:160,background:"#fff",border:"0.5px solid #e2e8f0",borderRadius:10,padding:"14px 16px",cursor:"pointer",flexShrink:0,display:"flex",flexDirection:"column",justifyContent:"space-between",transition:"border-color 0.15s,box-shadow 0.15s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor="#059669"; (e.currentTarget as HTMLDivElement).style.boxShadow="0 2px 8px rgba(0,0,0,0.06)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor="#e2e8f0"; (e.currentTarget as HTMLDivElement).style.boxShadow="none"; }}>
      {/* Header */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <span style={{ fontSize:14,fontWeight:500,color:"#0f172a" }}>{zone.name}</span>
        <span style={{ fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:col.bg,color:col.text }}>{pct}%</span>
      </div>
      {/* Bar */}
      <div style={{ height:6,background:"#f1f5f9",borderRadius:3,overflow:"hidden",margin:"10px 0" }}>
        <div style={{ height:"100%",width:`${Math.min(pct,100)}%`,background:col.bar,borderRadius:3,transition:"width 0.3s" }} />
      </div>
      {/* Stats */}
      <div style={{ display:"flex",gap:12,fontSize:12,color:"#64748b" }}>
        <span>📦 {dayCount} dãy</span>
        <span>🗄 {shelfCount} kệ</span>
        <span>⚠ {zone.expiringSoon} sắp HH</span>
      </div>
      {/* Footer */}
      <div style={{ textAlign:"right",fontSize:11,color:"#94a3b8",marginTop:8 }}>Xem chi tiết →</div>
    </div>
  );
}

/* ── Detail panel (360px right) ──────────────────────────────── */
function DetailPanel({ zone, day, shelf, floor, onClose, onExport, onHistory }: { zone: Zone|null; day: Day|null; shelf: Shelf|null; floor: Floor|null; onClose: () => void; onExport: () => void; onHistory: () => void }) {
  const sp = shelf ? shelfAvgPct(shelf) : 0;
  const col = pctColor(sp);
  const hsdBadge = (days: number|null) => {
    if (days == null) return { bg:"#f1f5f9", text:"#64748b", label:"N/A" };
    if (days < 7)  return { bg:"#fee2e2", text:"#991b1b", label:`${days}n` };
    if (days < 30) return { bg:"#fef9c3", text:"#92400e", label:`${days}n` };
    return { bg:"#f0fdf4", text:"#065f46", label:`${days}n` };
  };
  return (
    <div style={{ width:360,height:"100%",background:"#fff",borderLeft:"1px solid #e2e8f0",flexShrink:0,display:"flex",flexDirection:"column",overflow:"hidden" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderBottom:"0.5px solid #e2e8f0" }}>
        <span style={{ fontSize:14,fontWeight:500,color:"#334155",display:"flex",alignItems:"center",gap:6 }}><Layers3 size={14} color="#94a3b8"/>Chi tiết</span>
        <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#94a3b8" }}><X size={14}/></button>
      </div>
      {!shelf ? (
        <p style={{ padding:16,fontSize:12,color:"#94a3b8",fontStyle:"italic" }}>Chọn một kệ để xem chi tiết.</p>
      ) : (
        <div style={{ overflowY:"auto",flex:1 }}>
          {/* Key-value rows */}
          {[["Khu",zone?.name??""],["Dãy",day?.name??"—"],["Kệ",shelf.name]].map(([k,v]) => (
            <div key={k} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",height:36,padding:"0 16px",borderBottom:"0.5px solid #f1f5f9" }}>
              <span style={{ fontSize:12,color:"#94a3b8" }}>{k}</span>
              <span style={{ fontSize:13,fontWeight:500,color:"#0f172a" }}>{v}</span>
            </div>
          ))}
          {/* Occupancy bar */}
          <div style={{ padding:"12px 16px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
              <span style={{ fontSize:12,color:"#64748b" }}>Sức chứa kệ</span>
              <span style={{ fontSize:13,fontWeight:500,color:col.text }}>{sp}%</span>
            </div>
            <div style={{ height:8,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}>
              <div style={{ height:"100%",width:`${Math.min(sp,100)}%`,background:col.bar,borderRadius:4 }}/>
            </div>
          </div>
          {/* Warning chip */}
          {zone && zone.expiringSoon > 0 && (
            <div style={{ margin:"0 16px 12px",padding:"8px 12px",background:"#fef9c3",border:"0.5px solid #fbbf24",borderRadius:8,fontSize:12,color:"#92400e" }}>
              ⚠ {zone.expiringSoon} lô sắp hết hạn trong khu này
            </div>
          )}
          {/* Dynamic action buttons */}
          <div style={{ margin:"0 16px 16px",display:"flex",flexDirection:"column",gap:8 }}>
            {/* Always: shelf history */}
            <button
              onClick={onHistory}
              style={{ display:"flex",alignItems:"center",gap:6,height:36,borderWidth:"0.5px",borderStyle:"solid",borderColor:"#e2e8f0",borderRadius:8,background:"#fff",fontSize:13,color:"#475569",cursor:"pointer",width:"100%",paddingLeft:12 }}>
              <History size={14}/>Lịch sử kệ này
            </button>
            {/* Conditional: order OR export based on occupancy */}
            {sp >= 80 && (
              <button
                onClick={onExport}
                style={{ display:"flex",alignItems:"center",gap:6,height:36,borderWidth:"0.5px",borderStyle:"solid",borderColor:"#f59e0b",borderRadius:8,background:"#fef9c3",fontSize:13,color:"#92400e",cursor:"pointer",width:"100%",paddingLeft:12 }}>
                <TrendingUp size={14}/>↗ Tạo phiếu xuất kho
              </button>
            )}
            {/* Conditional: HSD warning if expiring */}
            {shelf.floors.some(f => f.expiringSoon) && (
              <button
                onClick={() => window.location.href=`/warehouse/map?tab=canh-bao-hsd&shelf=${encodeURIComponent(shelf.name)}`}
                style={{ display:"flex",alignItems:"center",gap:6,height:36,borderWidth:"0.5px",borderStyle:"solid",borderColor:"#ef4444",borderRadius:8,background:"#fee2e2",fontSize:13,color:"#991b1b",cursor:"pointer",width:"100%",paddingLeft:12 }}>
                <AlertTriangle size={14}/>⚠ Xem cảnh báo HSD
              </button>
            )}
          </div>
          {/* Lot rows */}
          <p style={{ fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",color:"#94a3b8",padding:"12px 16px 8px" }}>LÔ HÀNG</p>
          {shelf.floors.flatMap(f => f.batches).length === 0 ? (
            <p style={{ padding:"0 16px",fontSize:12,color:"#94a3b8",fontStyle:"italic" }}>Chưa có lô hàng.</p>
          ) : shelf.floors.flatMap(f => f.batches).map(b => {
            const hsd = hsdBadge(b.days_left);
            return (
              <div key={b.id} style={{ padding:"10px 16px",borderBottom:"0.5px solid #f1f5f9",cursor:"default" }}
                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="#f8fafc"}
                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="#fff"}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <span style={{ fontSize:13,fontWeight:500,color:"#0f172a" }}>{b.san_pham}</span>
                  <span style={{ fontSize:12,padding:"2px 6px",borderRadius:4,background:hsd.bg,color:hsd.text,whiteSpace:"nowrap" }}>{hsd.label}</span>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",marginTop:3 }}>
                  <span style={{ fontSize:11,color:"#94a3b8",fontFamily:"monospace" }}>{b.ma_lo_hang}</span>
                  <span style={{ fontSize:11,color:"#64748b" }}>SL: {b.so_luong}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Zone Detail overlay ──────────────────────────────────────── */
function ZoneDetail({ zone, onBack, readOnly, onShowHistory }: { zone: Zone; onBack: () => void; readOnly: boolean; onShowHistory: () => void }) {
  const [selDay,   setSelDay]   = useState<Day|null>(zone.days[0]??null);
  const [selShelf, setSelShelf] = useState<Shelf|null>(null);
  const [zoom,     setZoom]     = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const pct = zonePct(zone);
  const col = pctColor(pct);

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
          shelf_id: selShelf?.name, // Use name since mock data lacks real DB id
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

  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,background:"#fff",display:"flex",flexDirection:"column",animation:"fadeIn 0.15s ease" }}>
      {/* Top bar */}
      <div style={{ height:52,borderBottom:"0.5px solid #e2e8f0",display:"flex",alignItems:"center",gap:10,padding:"0 16px",flexShrink:0 }}>
        <button onClick={onBack} style={{ display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,border:"0.5px solid #e2e8f0",borderRadius:6,background:"#fff",cursor:"pointer",color:"#475569" }}>
          <ArrowLeft size={14}/>
        </button>
        <span style={{ fontSize:16,fontWeight:500,color:"#0f172a" }}>{zone.name}</span>
        <span style={{ fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:col.bg,color:col.text }}>{pct}%</span>
        <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ display:"flex",alignItems:"center",gap:0,border:"0.5px solid #e2e8f0",borderRadius:6,overflow:"hidden" }}>
            <button onClick={() => setZoom(z => Math.max(50,z-10))} style={{ width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:"none",cursor:"pointer",color:"#64748b" }}><ZoomOut size={13}/></button>
            <span style={{ fontSize:11,fontWeight:500,color:"#334155",padding:"0 6px",borderLeft:"0.5px solid #e2e8f0",borderRight:"0.5px solid #e2e8f0" }}>{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(150,z+10))} style={{ width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:"none",cursor:"pointer",color:"#64748b" }}><ZoomIn size={13}/></button>
          </div>
          <button onClick={() => setFullscreen(f => !f)} style={{ display:"flex",alignItems:"center",gap:4,height:28,padding:"0 10px",border:"0.5px solid #e2e8f0",borderRadius:6,background:"none",cursor:"pointer",fontSize:11,color:"#64748b" }}>
            {fullscreen ? <Minimize2 size={13}/> : <Maximize2 size={13}/>} Toàn màn hình
          </button>
        </div>
      </div>

      {/* Main content: 2-col grid */}
      <div style={{ flex:1,display:"grid",gridTemplateColumns:`calc(100% - ${selShelf?360:0}px) ${selShelf?360:0}px`,overflow:"hidden",transition:"grid-template-columns 0.2s ease" }}>
        {/* Left column */}
        <div style={{ overflowY:"auto",minWidth:0 }}>
          {/* KPI inline strip */}
          <div style={{ display:"flex",borderBottom:"1px solid #e2e8f0" }}>
            {[
              { label:"KHU",         val:zone.name,                                      accent:"#94a3b8" },
              { label:"DÃY",          val:zone.days.length,                               accent:"#059669" },
              { label:"KỆ",           val:zone.days.reduce((a,d)=>a+d.shelves.length,0), accent:"#3b82f6" },
              { label:"SẮP HẾT HẠN", val:zone.expiringSoon,                              accent:"#f59e0b" },
            ].map((k,i,arr) => (
              <div key={k.label} style={{ flex:1,height:56,display:"flex",alignItems:"center",padding:"0 16px",borderTopWidth:0,borderBottomWidth:0,borderLeftWidth:3,borderLeftStyle:"solid",borderLeftColor:k.accent,borderRightWidth:i<arr.length-1?1:0,borderRightStyle:"solid",borderRightColor:"#e2e8f0" }}>
                <div>
                  <div style={{ fontSize:10,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",lineHeight:1,marginBottom:4 }}>{k.label}</div>
                  <div style={{ fontSize:18,fontWeight:500,color:"#0f172a",lineHeight:1 }}>{k.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display:"flex",gap:14,padding:"12px 16px",borderBottom:"0.5px solid #e2e8f0" }}>
            {[["#ecfdf5","#059669","Trống (0–50%)"],["#fef9c3","#f59e0b","Vừa (51–80%)"],["#fee2e2","#ef4444","Gần đầy (>80%)"],["#fef3c7","#f59e0b","Sắp hết hạn"]].map(([bg,border,lbl]) => (
              <div key={lbl} style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#64748b" }}>
                <div style={{ width:10,height:10,borderRadius:2,background:bg,border:`1px solid ${border}` }}/>{lbl}
              </div>
            ))}
          </div>

          {/* Dãy sections */}
          {zone.days.map((day) => (
            <div key={day.name} style={{ marginBottom:4 }}>
              {/* Section header */}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",height:32,padding:"0 16px",background:"#f8fafc",borderTop:"0.5px solid #e2e8f0",borderBottom:"0.5px solid #e2e8f0" }}>
                <span style={{ fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.07em",color:"#64748b" }}>{day.name}</span>
                <span style={{ fontSize:10,color:"#94a3b8" }}>{day.shelves.length} kệ</span>
              </div>
              {/* Shelf cells */}
              <div style={{ display:"flex",flexWrap:"wrap",gap:12,padding:16,transform:`scale(${zoom/100})`,transformOrigin:"top left" }}>
                {day.shelves.map(sh => {
                  const sp = shelfAvgPct(sh);
                  const c = pctColor(sp);
                  const isAct = selShelf?.name === sh.name && selDay?.name === day.name;
                  const hasWarn = sh.floors.some(f => f.expiringSoon);
                  const numCol = sp > 80 ? "#991b1b" : sp > 50 ? "#92400e" : "#059669";
                  return (
                    <div key={sh.name} onClick={() => { setSelDay(day); setSelShelf(sh); }}
                      style={{ position:"relative",width:120,height:110,borderRadius:10,border:isAct?`2px solid #059669`:`1px solid ${c.bar}`,background:c.bg,cursor:"pointer",padding:12,boxSizing:"border-box",display:"flex",flexDirection:"column",transition:"all 0.15s",boxShadow:isAct?"0 0 0 3px rgba(5,150,105,0.15)":"none" }}>
                      {/* Row 1 */}
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <span style={{ fontSize:14,fontWeight:500,color:isAct?"#065f46":"#1e293b" }}>{sh.name}</span>
                        {hasWarn && <div style={{ width:8,height:8,borderRadius:"50%",background:"#f59e0b",flexShrink:0 }}/>}
                      </div>
                      {/* Row 2 */}
                      <div style={{ fontSize:22,fontWeight:500,color:numCol,fontVariantNumeric:"tabular-nums",textAlign:"center",flex:1,display:"flex",alignItems:"center",justifyContent:"center" }}>{sp}%</div>
                      {/* Row 3 bar */}
                      <div style={{ height:5,background:"#e2e8f0",borderRadius:3,overflow:"hidden",marginTop:"auto" }}>
                        <div style={{ height:"100%",width:`${Math.min(sp,100)}%`,background:c.bar,borderRadius:3 }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right detail panel (no wrapper div needed — panel handles its own width) */}
        <DetailPanel zone={zone} day={selDay} shelf={selShelf} floor={null} onClose={() => setSelShelf(null)} onExport={() => setShowExportModal(true)} onHistory={onShowHistory} />
      </div>

      {/* Export Modal */}
      {showExportModal && selShelf && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyItems: "center" }}>
          <div style={{ background: "#fff", width: 480, margin: "auto", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 15, fontWeight: 500, color: "#0f172a", margin: 0 }}>Tạo phiếu xuất kho</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Vị trí: {zone.name} &gt; {selDay?.name} &gt; {selShelf.name}</p>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {exportError && <div style={{ padding: 12, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13 }}>{exportError}</div>}
              {exportSuccess && <div style={{ padding: 12, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 13 }}>{exportSuccess}</div>}
              
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#475569", marginBottom: 6 }}>Sản phẩm (Lô hàng)</label>
                <select 
                  value={exportForm.lo_hang_id} 
                  onChange={e => setExportForm(p => ({ ...p, lo_hang_id: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, color: "#0f172a", outline: "none" }}>
                  <option value="">-- Chọn lô hàng --</option>
                  {selShelf.floors.flatMap(f => f.batches).map(b => (
                    <option key={b.id} value={b.id}>{b.san_pham} ({b.ma_lo_hang}) - Tồn: {b.so_luong}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#475569", marginBottom: 6 }}>Số lượng xuất *</label>
                <input 
                  type="number" 
                  value={exportForm.so_luong_xuat} 
                  onChange={e => setExportForm(p => ({ ...p, so_luong_xuat: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, color: "#0f172a", outline: "none" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#475569", marginBottom: 6 }}>Lý do xuất</label>
                <select 
                  value={exportForm.ly_do} 
                  onChange={e => setExportForm(p => ({ ...p, ly_do: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, color: "#0f172a", outline: "none" }}>
                  <option value="Giao khách hàng">Giao khách hàng</option>
                  <option value="Chuyển kho">Chuyển kho</option>
                  <option value="Hàng lỗi/hỏng">Hàng lỗi/hỏng</option>
                  <option value="Hết hạn sử dụng">Hết hạn sử dụng</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#475569", marginBottom: 6 }}>Ghi chú (Tùy chọn)</label>
                <textarea 
                  value={exportForm.ghi_chu} 
                  onChange={e => setExportForm(p => ({ ...p, ghi_chu: e.target.value }))}
                  rows={2}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, color: "#0f172a", outline: "none", resize: "none" }} />
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowExportModal(false)} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", fontSize: 13, fontWeight: 500, color: "#475569", cursor: "pointer" }}>Hủy</button>
              <button onClick={handleCreateExport} disabled={exportLoading} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#f59e0b", fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                {exportLoading ? "Đang tạo..." : "Tạo phiếu xuất"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function WarehouseMapView({ readOnly = false }: { readOnly?: boolean }) {
  const [stats,   setStats]   = useState({ totalBoxes: 0, expiringBoxes: 0, zonesCount: 0 });
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("map");
  const [zones,   setZones]   = useState<Zone[]>([]);
  const [activeZone, setActiveZone] = useState<Zone|null>(null);
  const [zoneManagerData, setZoneManagerData] = useState<any[]>([]);

  const load = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const r = await fetch("/api/admin/warehouse/map", { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json() as MapData;
      setZones(j.zones ?? []);
      setStats({
        totalBoxes:    j.stats?.totalBoxes    ?? 0,
        expiringBoxes: j.stats?.expiringBoxes ?? 0,
        zonesCount:    j.stats?.zonesCount    ?? 0,
      });
    } catch {}
    finally { setLoading(false); }
  };

  const loadZoneManager = async () => {
    try {
      const r = await fetch("/api/admin/warehouse/zones", { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      setZoneManagerData(j.zones ?? []);
    } catch {}
  };

  const handleRefreshAll = () => { load(); loadZoneManager(); };

  useEffect(() => { load(); if (!readOnly) loadZoneManager(); }, []);

  return (
    <div style={{ fontFamily:"Inter,system-ui,sans-serif",color:"#0f172a" }}>
      {/* Zone detail overlay */}
      {activeZone && tab === "map" && <ZoneDetail zone={activeZone} onBack={() => setActiveZone(null)} readOnly={readOnly} onShowHistory={() => { setActiveZone(null); setTab("history"); }} />}

      <div style={{ background:"#fff",border:"0.5px solid #e2e8f0",borderRadius:10 }}>
        {!readOnly && <TabBar active={tab} onChange={setTab} />}
        <div style={{ padding:16 }}>
          {tab === "map" && (
            loading ? (
              <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:300,gap:8,color:"#94a3b8" }}>
                <RefreshCw size={20} style={{ animation:"spin 1s linear infinite" }}/>
                <span style={{ fontSize:13 }}>Đang tải sơ đồ kho...</span>
              </div>
            ) : (
              <>
                {/* KPI cards */}
                <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16 }}>
                  {[
                    { label:"KHU THEO DÕI",   val:stats.zonesCount,    accent:"#94a3b8" },
                    { label:"KIỆN TRONG KHO",  val:stats.totalBoxes,    accent:"#059669" },
                    { label:"LÔ GẦN HẾT HẠN", val:stats.expiringBoxes, accent:"#f59e0b" },
                    { label:"TỔNG DÃY",         val:zones.reduce((a,z)=>a+z.days.length,0), accent:"#3b82f6" },
                  ].map(k => (
                    <div key={k.label} style={{ background:"#fff",border:"0.5px solid #e2e8f0",borderLeft:`3px solid ${k.accent}`,borderRadius:8,padding:"8px 12px" }}>
                      <div style={{ fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3 }}>{k.label}</div>
                      <div style={{ fontSize:22,fontWeight:500,color:"#0f172a",lineHeight:1 }}>{k.val}</div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div style={{ display:"flex",gap:14,marginBottom:14 }}>
                  {[["#ecfdf5","#059669","Trống"],["#fef9c3","#f59e0b","Vừa"],["#fee2e2","#ef4444","Gần đầy"],["#fef3c7","#f59e0b","Sắp hết hạn"]].map(([bg,border,lbl]) => (
                    <div key={lbl} style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#64748b" }}>
                      <div style={{ width:10,height:10,borderRadius:2,background:bg,border:`1px solid ${border}` }}/>{lbl}
                    </div>
                  ))}
                </div>

                {/* Zone card row */}
                <div style={{ display:"flex",gap:12,overflowX:"auto",paddingBottom:8 }}>
                  {zones.map(zone => <ZoneCard key={zone.name} zone={zone} onClick={() => setActiveZone(zone)} />)}
                </div>

                {/* Zone Manager — only for admin (not readOnly) */}
                {!readOnly && (
                  <div style={{ marginTop: 20 }}>
                    <ZoneManager zones={zoneManagerData} onRefresh={handleRefreshAll} />
                  </div>
                )}
              </>
            )
          )}
          {!readOnly && tab === "warnings" && <ExpirationWarnings />}
          {!readOnly && tab === "history"  && <IssueHistory />}
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
