"use client";

import React, { useEffect, useState } from "react";
import { X, Package, Clock, AlertTriangle, ChevronRight } from "lucide-react";

interface Batch {
  id: number;
  ma_lo: string;
  san_pham: string;
  so_luong: number | null;
  han_su_dung: string;
  days_left: number | null;
  ma_lo_hang_id: number | null;
  vi_tri: string;
}

interface Props {
  positionId: number | null;
  positionLabel: string;
  onClose: () => void;
}

export default function BatchPopup({ positionId, positionLabel, onClose }: Props) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!positionId) return;
    setLoading(true);
    fetch(`/api/admin/warehouse/zones/${positionId}/batches`)
      .then((r) => r.json())
      .then((d) => setBatches(d.batches || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [positionId]);

  if (!positionId) return null;

  const getBadge = (days: number | null) => {
    if (days === null) return { color: "bg-gray-100 text-gray-500", label: "N/A" };
    if (days < 0) return { color: "bg-red-100 text-red-700", label: "Đã hết hạn" };
    if (days <= 30) return { color: "bg-red-100 text-red-600", label: `${days} ngày` };
    if (days <= 90) return { color: "bg-amber-100 text-amber-700", label: `${days} ngày` };
    return { color: "bg-green-100 text-green-700", label: `${days} ngày` };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1D9E75] to-[#158a63] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">Lô hàng tại ô kệ</h3>
              <p className="text-white/70 text-xs font-mono">{positionLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-[#1D9E75]/30 border-t-[#1D9E75] rounded-full animate-spin" />
            </div>
          ) : batches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Package size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">Ô kệ này đang trống</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {batches.map((batch) => {
                const badge = getBadge(batch.days_left);
                return (
                  <div key={batch.id} className="px-6 py-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{batch.san_pham}</p>
                        <p className="text-xs text-[#1D9E75] font-mono mt-0.5">{batch.ma_lo}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badge.color}`}>
                          <Clock size={10} />
                          {badge.label}
                        </div>
                        {batch.days_left !== null && batch.days_left <= 30 && (
                          <AlertTriangle size={14} className="text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">
                        SL: <span className="font-bold text-gray-800">{batch.so_luong?.toLocaleString()}</span> thùng
                      </span>
                      <span className="text-xs text-gray-400">HSD: {batch.han_su_dung}</span>
                      {batch.ma_lo_hang_id && (
                        <a
                          href={`/admin/warehouse/batches/${batch.ma_lo_hang_id}`}
                          className="ml-auto flex items-center gap-1 text-xs text-[#1D9E75] hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Chi tiết <ChevronRight size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">{batches.length} lô hàng</p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
