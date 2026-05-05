"use client";

import React, { useState, useEffect } from "react";
import { Clock, ArrowDownToLine, ArrowUpFromLine, Package } from "lucide-react";
import Pagination from "@/components/ui/Pagination";

export default function IssueHistory({
  historyData,
  importHistoryData,
  // Pagination and Tab Props (Optional)
  currentPage,
  totalPages,
  onPageChange,
  activeTab,
  onTabChange,
}: {
  historyData?: any[];
  importHistoryData?: any[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  activeTab?: "import" | "export";
  onTabChange?: (tab: "import" | "export") => void;
}) {
  // Tạo state để làm nút gạt chuyển đổi giữa 2 bảng
  const [subTab, setSubTab] = useState<"import" | "export">(activeTab || "import");

  useEffect(() => {
    if (activeTab) setSubTab(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab: "import" | "export") => {
    setSubTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const exportData = historyData || [];
  const importData = importHistoryData || [];

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header & Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8" }}>
          Lịch sử xuất nhập kho
        </p>

        {/* Cụm nút gạt mượt mà */}
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

      {/* ======================= */}
      {/* BẢNG 1: LỊCH SỬ NHẬP KHO */}
      {/* ======================= */}
      {subTab === "import" && (
        <div style={{ border: "0.5px solid #e2e8f0", borderRadius: 8, overflow: "hidden", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid #e2e8f0", background: "#f8fafc" }}>
                {["Thời gian", "Mã Phiếu", "Nhà cung cấp", "Sản phẩm chính", "SL (Thùng)", "Trạng thái"].map((h, i) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: i === 4 ? "right" : "left", fontWeight: 500, color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {importData.length > 0 ? (
                importData.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "0.5px solid #f1f5f9", background: "#fff" }}>
                    <td style={{ padding: "8px 12px", color: "#64748b", whiteSpace: "nowrap" }}>{item.ngay_nhap}</td>
                    <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#0f172a" }}>{item.ma_phieu}</td>
                    <td style={{ padding: "8px 12px", color: "#475569" }}>{item.ncc}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 500, color: "#0f172a" }}>{item.san_pham}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{item.so_luong}</td>
                      <td style={{ padding: "8px 12px" }}>
                        {(() => {
                          const s = item.trang_thai || "N/A";
                          const cls: Record<string, any> = {
                            CHO_DUYET:    { bg: "#fef3c7", col: "#92400e", brd: "#fcd34d" },
                            CHO_KIEM_TRA: { bg: "#eff6ff", col: "#1e40af", brd: "#bfdbfe" },
                            DA_DUYET:     { bg: "#ecfdf5", col: "#065f46", brd: "#6ee7b7" },
                            HOAN_THANH:   { bg: "#ecfdf5", col: "#065f46", brd: "#6ee7b7" },
                            DA_HUY:       { bg: "#fef2f2", col: "#991b1b", brd: "#fca5a5" },
                          };
                          const lbl: Record<string, string> = {
                            CHO_DUYET: "Chờ duyệt", CHO_KIEM_TRA: "Chờ kiểm tra",
                            DA_DUYET: "Đã duyệt", HOAN_THANH: "Hoàn thành", DA_HUY: "Đã hủy",
                          };
                          const c = cls[s] || { bg: "#f1f5f9", col: "#475569", brd: "#e2e8f0" };
                          return (
                            <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 6px", borderRadius: 4, background: c.bg, color: c.col, border: `0.5px solid ${c.brd}`, whiteSpace: "nowrap" }}>
                              {lbl[s] || s}
                            </span>
                          );
                        })()}
                      </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: "32px 12px", textAlign: "center", color: "#94a3b8", fontStyle: "italic", fontSize: 12 }}>
                    Chưa có dữ liệu nhập kho.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================= */}
      {/* BẢNG 2: LỊCH SỬ XUẤT KHO */}
      {/* ======================= */}
      {subTab === "export" && (
        <div style={{ border: "0.5px solid #e2e8f0", borderRadius: 8, overflow: "hidden", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid #e2e8f0", background: "#f8fafc" }}>
                {["Thời gian quét", "Mã QR đã xuất", "Sản phẩm", "Lý do / Số phiếu", "Người quét"].map((h, i) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: i === 4 ? "right" : "left", fontWeight: 500, color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exportData.length > 0 ? (
                exportData.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "0.5px solid #f1f5f9", background: "#fff" }}>
                    <td style={{ padding: "8px 12px", color: "#64748b", whiteSpace: "nowrap" }}>{item.ngay_xuat}</td>
                    <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#0f172a" }}>{item.qr}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 500, color: "#0f172a" }}>{item.san_pham}</td>
                    <td style={{ padding: "8px 12px", color: "#475569" }}>{item.phieu}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "#475569" }}>{item.nguoi_xuat}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "32px 12px", textAlign: "center", color: "#94a3b8", fontStyle: "italic", fontSize: 12 }}>
                    Chưa có dữ liệu xuất kho.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination (nếu component cha truyền props) */}
      {onPageChange && totalPages !== undefined && currentPage !== undefined && (
        <Pagination 
          currentPage={currentPage!}
          totalPages={totalPages!}
          onPageChange={onPageChange!}
        />
      )}
    </div>
  );
}
