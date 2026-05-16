"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, MapPin } from "lucide-react";
import Pagination from "@/components/ui/Pagination";

interface ImportRow {
  ngay_nhap: string;
  ma_phieu: string;
  ncc: string;
  san_pham: string;
  bien_the?: string;
  don_vi_tinh?: string;
  so_luong: number;
  trang_thai: string;
  vi_tri?: { khu_vuc: string | null; day: string | null; ke: string | null; tang: string | null } | null;
}

// don_vi_tinh đôi khi bị nhập kèm số ("7Kg") thay vì chỉ đơn vị — strip số để hiển thị gọn.
const normalizeUnit = (raw?: string | null) => {
  const cleaned = (raw || "").trim().replace(/^\d+(?:[.,]\d+)?\s*/, "").trim();
  return cleaned;
};

interface ExportRow {
  ngay_xuat: string;
  qr: string;
  san_pham: string;
  phieu: string;
  nguoi_xuat: string;
}

const STATUS_MAP: Record<string, { bg: string; col: string; brd: string; lbl: string }> = {
  CHO_DUYET:    { bg: "#fef3c7", col: "#92400e", brd: "#fcd34d", lbl: "Chờ duyệt" },
  CHO_KIEM_TRA: { bg: "#eff6ff", col: "#1e40af", brd: "#bfdbfe", lbl: "Chờ kiểm tra" },
  DA_DUYET:     { bg: "#ecfdf5", col: "#065f46", brd: "#6ee7b7", lbl: "Đã duyệt" },
  HOAN_THANH:   { bg: "#ecfdf5", col: "#065f46", brd: "#6ee7b7", lbl: "Hoàn thành" },
  DA_HUY:       { bg: "#fef2f2", col: "#991b1b", brd: "#fca5a5", lbl: "Đã hủy" },
};

const PAGE_SIZE = 15;

export default function IssueHistory({
  activeTab,
  onTabChange,
  onViewLocation,
}: {
  historyData?: any[];
  importHistoryData?: any[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  activeTab?: "import" | "export";
  onTabChange?: (tab: "import" | "export") => void;
  onViewLocation?: (khuVuc: string) => void;
}) {
  const [subTab, setSubTab] = useState<"import" | "export">(activeTab || "import");
  const [importData, setImportData]   = useState<ImportRow[]>([]);
  const [exportData, setExportData]   = useState<ExportRow[]>([]);
  const [importPage, setImportPage]   = useState(1);
  const [exportPage, setExportPage]   = useState(1);
  const [importTotal, setImportTotal] = useState(0);
  const [exportTotal, setExportTotal] = useState(0);
  const [loading, setLoading]         = useState(false);

  const fetchImport = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/warehouse/history?type=import&page=${page}&limit=${PAGE_SIZE}`);
      const j = await r.json();
      setImportData(j.data || []);
      setImportTotal(j.meta?.total || 0);
    } catch {}
    finally { setLoading(false); }
  }, []);

  const fetchExport = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/warehouse/history?type=export&page=${page}&limit=${PAGE_SIZE}`);
      const j = await r.json();
      setExportData(j.data || []);
      setExportTotal(j.meta?.total || 0);
    } catch {}
    finally { setLoading(false); }
  }, []);

  // Fetch khi mount và khi đổi tab
  useEffect(() => {
    if (subTab === "import") fetchImport(importPage);
    else fetchExport(exportPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTab]);

  useEffect(() => {
    if (activeTab) setSubTab(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab: "import" | "export") => {
    setSubTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const importTotalPages = Math.ceil(importTotal / PAGE_SIZE);
  const exportTotalPages = Math.ceil(exportTotal / PAGE_SIZE);

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header & Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8" }}>
          Lịch sử xuất nhập kho
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => subTab === "import" ? fetchImport(importPage) : fetchExport(exportPage)}
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 12, fontWeight: 500, borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", opacity: loading ? 0.5 : 1 }}
          >
            <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Làm mới
          </button>

          <div style={{ display: "flex", background: "#f1f5f9", padding: 2, borderRadius: 6 }}>
            <button
              onClick={() => handleTabChange("import")}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 12, fontWeight: 500, borderRadius: 5, border: "none", background: subTab === "import" ? "#fff" : "transparent", color: subTab === "import" ? "#065f46" : "#64748b", boxShadow: subTab === "import" ? "0 1px 2px rgba(0,0,0,0.05)" : "none", cursor: "pointer", transition: "all 0.2s" }}
            >
              <ArrowDownToLine size={12} /> Nhập Kho
            </button>
            <button
              onClick={() => handleTabChange("export")}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 12, fontWeight: 500, borderRadius: 5, border: "none", background: subTab === "export" ? "#fff" : "transparent", color: subTab === "export" ? "#1d4ed8" : "#64748b", boxShadow: subTab === "export" ? "0 1px 2px rgba(0,0,0,0.05)" : "none", cursor: "pointer", transition: "all 0.2s" }}
            >
              <ArrowUpFromLine size={12} /> Xuất Kho
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "32px 0", color: "#94a3b8", fontSize: 13, gap: 8 }}>
          <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> Đang tải...
        </div>
      )}

      {/* BẢNG NHẬP KHO */}
      {!loading && subTab === "import" && (
        <>
          <div style={{ border: "0.5px solid #e2e8f0", borderRadius: 8, overflow: "hidden", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid #e2e8f0", background: "#f8fafc" }}>
                  {["Thời gian", "Mã Phiếu", "Nhà cung cấp", "Sản phẩm chính", "SL", "Trạng thái", "Vị trí"].map((h, i) => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: i === 4 ? "right" : i === 6 ? "center" : "left", fontWeight: 500, color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importData.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "32px 12px", textAlign: "center", color: "#94a3b8", fontStyle: "italic", fontSize: 12 }}>
                      Chưa có dữ liệu nhập kho.
                    </td>
                  </tr>
                ) : importData.map((item, idx) => {
                  const s = item.trang_thai || "N/A";
                  const c = STATUS_MAP[s] || { bg: "#f1f5f9", col: "#475569", brd: "#e2e8f0", lbl: s };
                  const unit = normalizeUnit(item.don_vi_tinh);
                  const vt = item.vi_tri;
                  const viTriLabel = vt && (vt.khu_vuc || vt.day || vt.ke)
                    ? [vt.khu_vuc, vt.day, vt.ke, vt.tang].filter(Boolean).join(" · ")
                    : null;
                  return (
                    <tr key={idx} style={{ borderBottom: "0.5px solid #f1f5f9", background: "#fff" }}>
                      <td style={{ padding: "8px 12px", color: "#64748b", whiteSpace: "nowrap" }}>{item.ngay_nhap}</td>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#0f172a" }}>{item.ma_phieu}</td>
                      <td style={{ padding: "8px 12px", color: "#475569" }}>{item.ncc}</td>
                      <td style={{ padding: "8px 12px", fontWeight: 500, color: "#0f172a", maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <div>{item.san_pham}</div>
                        {(item.bien_the || unit) && (
                          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>
                            {[item.bien_the, unit && `đv: ${unit}`].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 500, whiteSpace: "nowrap" }}>
                        {item.so_luong.toLocaleString()}
                        {unit && <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 4 }}>{unit}</span>}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 6px", borderRadius: 4, background: c.bg, color: c.col, border: `0.5px solid ${c.brd}`, whiteSpace: "nowrap" }}>
                          {c.lbl}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        {viTriLabel && vt?.khu_vuc ? (
                          <button
                            onClick={() => onViewLocation?.(vt.khu_vuc!)}
                            title={`Xem vị trí: ${viTriLabel}`}
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", fontSize: 11, fontWeight: 500, borderRadius: 6, border: "0.5px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            <MapPin size={11} /> {viTriLabel}
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: "#cbd5e1" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {importTotalPages > 1 && (
            <Pagination
              currentPage={importPage}
              totalPages={importTotalPages}
              onPageChange={(p) => { setImportPage(p); fetchImport(p); }}
            />
          )}
        </>
      )}

      {/* BẢNG XUẤT KHO */}
      {!loading && subTab === "export" && (
        <>
          <div style={{ border: "0.5px solid #e2e8f0", borderRadius: 8, overflow: "hidden", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid #e2e8f0", background: "#f8fafc" }}>
                  {["Thời gian", "Sản phẩm", "Lý do / Số phiếu", "Người xuất"].map((h) => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 500, color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exportData.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "32px 12px", textAlign: "center", color: "#94a3b8", fontStyle: "italic", fontSize: 12 }}>
                      Chưa có dữ liệu xuất kho.
                    </td>
                  </tr>
                ) : exportData.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "0.5px solid #f1f5f9", background: "#fff" }}>
                    <td style={{ padding: "8px 12px", color: "#64748b", whiteSpace: "nowrap" }}>{item.ngay_xuat}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 500, color: "#0f172a", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.san_pham}</td>
                    <td style={{ padding: "8px 12px", color: "#475569", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.phieu}</td>
                    <td style={{ padding: "8px 12px", color: "#64748b" }}>{item.nguoi_xuat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {exportTotalPages > 1 && (
            <Pagination
              currentPage={exportPage}
              totalPages={exportTotalPages}
              onPageChange={(p) => { setExportPage(p); fetchExport(p); }}
            />
          )}
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
