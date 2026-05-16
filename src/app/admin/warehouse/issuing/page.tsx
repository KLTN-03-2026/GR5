"use client";

import React, { useState, useEffect } from "react";
import {
  PackageMinus, Search, Loader2, CheckCircle2, AlertTriangle,
  Package, ArrowRight, Boxes,
} from "lucide-react";
import toast from "react-hot-toast";

type SuggestedLot = {
  ma_lo: string;
  lo_hang_id: number;
  so_luong_ton: number;
  so_luong_xuat: number;
  han_su_dung: string;
  days_left: number;
  vi_tri: string;
  urgent: boolean;
};

type Variant = {
  id: number;
  label: string;
};

export default function IssuingPage() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestedLot[]>([]);
  const [totalStock, setTotalStock] = useState(0);
  const [shortage, setShortage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  // QR mode
  const [mode, setMode] = useState<"manual" | "qr">("manual");
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    fetch("/api/admin/products?limit=200").then(r => r.json()).then(d => {
      const products = Array.isArray(d) ? d : d.data || [];
      const vts: Variant[] = [];
      products.forEach((p: any) => {
        (p.bien_the_san_pham || []).forEach((v: any) => {
          vts.push({ id: v.id, label: `${p.ten_san_pham} - ${v.ten_bien_the}` });
        });
      });
      setVariants(vts);
    }).catch(() => {});
  }, []);

  const handleSuggest = async () => {
    if (!selectedVariant || !quantity) {
      toast.error("Vui lòng chọn sản phẩm và nhập số lượng!");
      return;
    }
    setLoading(true);
    setSuggestions([]);
    setDone(null);
    try {
      const res = await fetch(`/api/admin/warehouse/issue?ma_bien_the=${selectedVariant}&so_luong=${quantity}`);
      const data = await res.json();
      setSuggestions(data.lo_list || []);
      setTotalStock(data.total_ton || 0);
      setShortage(data.thieu || 0);
      if (data.thieu > 0) {
        toast.error(`Kho không đủ hàng — thiếu ${data.thieu} kiện`);
      }
    } catch { toast.error("Lỗi tải gợi ý xuất kho"); }
    finally { setLoading(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const body = mode === "qr"
        ? { mode: "qr", qrCode }
        : { mode: "manual", ma_bien_the: Number(selectedVariant), so_luong: Number(quantity), force_partial: shortage > 0 };

      const res = await fetch("/api/admin/warehouse/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Xuất kho thành công!");
        setDone(data.message || "Xuất kho thành công!");
        setSuggestions([]);
        setSelectedVariant("");
        setQuantity("");
        setQrCode("");
      } else {
        toast.error(data.error || "Lỗi xuất kho");
      }
    } catch { toast.error("Lỗi kết nối"); }
    finally { setExporting(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <PackageMinus size={20} className="text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Xuất kho (FEFO)</h2>
            <p className="text-sm text-gray-500">Hệ thống tự động gợi ý lô hàng theo thứ tự hết hạn sớm nhất</p>
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setMode("manual")}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition border-2 ${mode === "manual" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
            <Package size={18} className="inline mr-2" /> Chọn sản phẩm (thủ công)
          </button>
          <button onClick={() => setMode("qr")}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition border-2 ${mode === "qr" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
            <Search size={18} className="inline mr-2" /> Quét mã QR kiện hàng
          </button>
        </div>

        {mode === "manual" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm (biến thể)</label>
                <select value={selectedVariant} onChange={e => setSelectedVariant(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Chọn sản phẩm cần xuất...</option>
                  {variants.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng xuất</label>
                <input type="number" min={1} value={quantity}
                  onChange={e => { const v = e.target.value.replace(/^-/, ''); if (v === '' || Number(v) >= 1) setQuantity(v); }}
                  onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="VD: 10" />
              </div>
            </div>
            <button onClick={handleSuggest} disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Tìm lô hàng (FEFO)
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã vạch / QR kiện hàng</label>
              <input type="text" value={qrCode} onChange={e => setQrCode(e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Quét hoặc nhập mã vạch kiện hàng..." />
            </div>
            <button onClick={handleExport} disabled={exporting || !qrCode}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition text-sm disabled:opacity-50">
              {exporting ? <Loader2 size={16} className="animate-spin" /> : <PackageMinus size={16} />}
              Xuất kiện hàng
            </button>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Boxes size={18} className="text-blue-600" /> Gợi ý lô xuất (FEFO)
            </h3>
            <span className="text-sm text-gray-500">Tồn kho: <strong>{totalStock}</strong></span>
          </div>

          {shortage > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm text-amber-700">
              <AlertTriangle size={16} /> Kho thiếu <strong>{shortage}</strong> kiện — chỉ xuất được một phần
            </div>
          )}

          <div className="space-y-3">
            {suggestions.map((lot, i) => (
              <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${lot.urgent ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-gray-50"}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${lot.urgent ? "bg-amber-200 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lot.ma_lo}</p>
                    <p className="text-xs text-gray-500">Vị trí: {lot.vi_tri || "Chưa xác định"} · Tồn: {lot.so_luong_ton}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">Xuất: {lot.so_luong_xuat}</p>
                  <p className={`text-xs ${lot.days_left <= 7 ? "text-red-600 font-bold" : lot.days_left <= 14 ? "text-amber-600" : "text-gray-500"}`}>
                    HSD: {new Date(lot.han_su_dung).toLocaleDateString("vi-VN")} ({lot.days_left} ngày)
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4 pt-4 border-t">
            <button onClick={handleExport} disabled={exporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition text-sm disabled:opacity-50">
              {exporting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              Xác nhận xuất kho
            </button>
          </div>
        </div>
      )}

      {/* Done */}
      {done && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">{done}</p>
        </div>
      )}
    </div>
  );
}
