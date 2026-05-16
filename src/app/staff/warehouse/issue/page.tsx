"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package, Clock, MapPin, Loader2, RefreshCw,
  AlertTriangle, ChevronRight, Truck, Boxes,
} from "lucide-react";

type PendingItem = {
  phieu_xuat_id: number;
  don_hang_id: number;
  ma_don: string;
  ho_ten_nguoi_nhan: string;
  dia_chi: string | null;
  loai_don: "GAN" | "TRUNG" | "XA";
  tien_do: { da_xuat: number; tong: number };
  thoi_gian_cho_phut: number;
  is_urgent: boolean;
  san_phams: { ten: string; bien_the: string; so_luong: number }[];
  ngay_tao: string;
};

type Summary = { gan: number; trung: number; xa: number; urgent: number };

const LOAI_CONFIG = {
  GAN: { label: "Gần", color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  TRUNG: { label: "Trung", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  XA: { label: "Xa", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
};

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}p` : `${h}h`;
}

export default function StaffWarehouseIssuePage() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [summary, setSummary] = useState<Summary>({ gan: 0, trung: 0, xa: 0, urgent: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "GAN" | "TRUNG" | "XA">("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== "ALL" ? `?loai_don=${filter}` : "";
      const res = await fetch(`/api/staff/warehouse/issue/pending${params}`);
      const data = await res.json();
      setItems(data.items || []);
      setSummary(data.summary || { gan: 0, trung: 0, xa: 0, urgent: 0 });
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const TABS = [
    { key: "ALL", label: "Tất cả", count: items.length },
    { key: "GAN", label: "Gần", count: summary.gan },
    { key: "TRUNG", label: "Trung", count: summary.trung },
    { key: "XA", label: "Xa", count: summary.xa },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Boxes size={20} className="text-emerald-600" />
            Xuất Kho Đơn Hàng
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {items.length} đơn chờ xuất · {summary.urgent} khẩn cấp
          </p>
        </div>
        <button onClick={load} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
        {TABS.map(({ key, label, count }) => (
          <button key={key} onClick={() => setFilter(key as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-all
              ${filter === key
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"}`}>
            {label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center
              ${filter === key ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Đang tải...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Package size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Không có đơn nào chờ xuất kho</p>
          <p className="text-xs text-slate-400 mt-1">Đơn hàng sẽ xuất hiện khi được xác nhận</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const cfg = LOAI_CONFIG[item.loai_don];
            const progress = item.tien_do.tong > 0 ? (item.tien_do.da_xuat / item.tien_do.tong) * 100 : 0;

            return (
              <Link key={item.phieu_xuat_id} href={`/staff/warehouse/issue/${item.don_hang_id}`}
                className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-200 hover:shadow-sm transition-all group">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.is_urgent ? "bg-red-50" : "bg-emerald-50"}`}>
                    {item.is_urgent ? <AlertTriangle size={18} className="text-red-500" /> : <Package size={18} className="text-emerald-600" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 text-[13px] font-mono">{item.ma_don}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      {item.is_urgent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                          KHẨN
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {item.ho_ten_nguoi_nhan || "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> Chờ {formatTime(item.thoi_gian_cho_phut)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck size={11} /> {item.san_phams.length} SP
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {item.tien_do.da_xuat}/{item.tien_do.tong}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors mt-2" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
