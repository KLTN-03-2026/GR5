"use client";

import React, { useState, useEffect } from "react";
import { Package, Truck, CheckCircle2, Clock, MapPin, RefreshCw, ExternalLink } from "lucide-react";

const GHN_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ready_to_pick:  { label: "Đang chờ lấy hàng",    color: "#f59e0b" },
  picking:        { label: "Shipper đang lấy hàng", color: "#3b82f6" },
  picked:         { label: "Đã lấy hàng",           color: "#3b82f6" },
  storing:        { label: "Đang lưu kho trung chuyển", color: "#6366f1" },
  transporting:   { label: "Đang trung chuyển",     color: "#6366f1" },
  sorting:        { label: "Đang phân loại",         color: "#6366f1" },
  delivering:     { label: "Shipper đang giao hàng",color: "#0ea5e9" },
  money_collect_delivering: { label: "Shipper đang giao hàng", color: "#0ea5e9" },
  delivered:      { label: "Giao hàng thành công",  color: "#10b981" },
  delivery_fail:  { label: "Giao hàng thất bại",    color: "#ef4444" },
  waiting_to_return: { label: "Chờ trả lại",        color: "#f59e0b" },
  return:         { label: "Đang hoàn hàng",         color: "#8b5cf6" },
  returned:       { label: "Đã hoàn hàng",           color: "#8b5cf6" },
  cancel:         { label: "Đã hủy vận đơn",        color: "#ef4444" },
};

export default function TrackingTimeline({ orderId, orderCode }: { orderId?: number; orderCode?: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async () => {
    if (!orderId && !orderCode) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ghn/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, order_code: orderCode }),
      });
      const d = await res.json();
      if (d.error) { setError(d.error); return; }
      setData(d);
    } catch {
      setError('Không thể kết nối GHN');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTracking(); }, [orderId, orderCode]);

  if (!orderId && !orderCode) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 bg-gray-50 rounded-xl">
        <div className="w-4 h-4 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-400">Đang tải trạng thái vận chuyển...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-between py-3 px-4 bg-amber-50 rounded-xl border border-amber-100">
        <span className="text-xs text-amber-700">{error}</span>
        <button onClick={fetchTracking} className="text-xs font-semibold text-amber-600 flex items-center gap-1">
          <RefreshCw size={11} /> Thử lại
        </button>
      </div>
    );
  }

  if (!data) return null;

  const statusInfo = GHN_STATUS_LABEL[data.status?.toLowerCase()] || { label: data.status_name || data.status, color: "#6b7280" };
  const logs: any[] = (data.log || []).slice().reverse();

  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50/60 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">Giao hàng GHN</span>
          {data.order_code && (
            <span className="font-mono text-[11px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">{data.order_code}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: statusInfo.color }}>
            {statusInfo.label}
          </span>
          {data.order_code && (
            <a href={`https://donhang.ghn.vn/?order_code=${data.order_code}`} target="_blank" rel="noreferrer"
              className="text-blue-500 hover:text-blue-600">
              <ExternalLink size={12} />
            </a>
          )}
          <button onClick={fetchTracking} className="text-gray-400 hover:text-gray-600 transition-colors">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Ngày giao dự kiến */}
      {data.expected_delivery_time && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100">
          <Clock size={12} className="text-blue-400" />
          <span className="text-xs text-blue-700">
            Dự kiến giao: <strong>
              {new Date(data.expected_delivery_time * 1000).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </strong>
          </span>
        </div>
      )}

      {/* Timeline log */}
      {logs.length > 0 && (
        <div className="px-4 py-3 space-y-3 max-h-52 overflow-y-auto">
          {logs.map((log, idx) => {
            const logInfo = GHN_STATUS_LABEL[log.status?.toLowerCase()] || { label: log.status, color: "#6b7280" };
            const isFirst = idx === 0;
            return (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2"
                    style={{ borderColor: isFirst ? logInfo.color : '#e5e7eb', background: isFirst ? logInfo.color : '#fff' }}>
                    {isFirst && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  {idx < logs.length - 1 && <div className="w-px h-5 bg-gray-100 mt-1" />}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <p className="text-xs font-semibold text-gray-800" style={{ color: isFirst ? logInfo.color : undefined }}>
                    {logInfo.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {new Date(log.updated_date).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
