"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  CreditCard,
  History,
  Info,
  LayoutGrid,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

type SupplierDetail = Record<string, any>;

type SupplierDetailContextValue = {
  ncc: SupplierDetail | null;
  nccId: number;
  loading: boolean;
  refresh: () => Promise<void>;
};

const SupplierDetailContext = createContext<SupplierDetailContextValue | null>(
  null,
);

const TAB_ITEMS = [
  { href: "info", label: "Thông tin", icon: Info },
  { href: "history", label: "Lịch sử nhập", icon: History },
  { href: "debt", label: "Công nợ", icon: CreditCard },
  { href: "quality", label: "Chất lượng", icon: ShieldCheck },
];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DANG_HOP_TAC: {
    label: "Đang hợp tác",
    className: "bg-emerald-100 text-emerald-700",
  },
  TAM_DUNG: { label: "Tạm dừng", className: "bg-amber-100 text-amber-700" },
  NGUNG: { label: "Đã ngừng", className: "bg-rose-100 text-rose-700" },
};

export function useSupplierDetail() {
  const value = useContext(SupplierDetailContext);
  if (!value) {
    throw new Error(
      "useSupplierDetail must be used inside SupplierDetailShell",
    );
  }
  return value;
}

export default function SupplierDetailShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const nccId = Number(params.id);
  const [ncc, setNcc] = useState<SupplierDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (Number.isNaN(nccId)) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/ncc/${nccId}`, {
        cache: "no-store",
      });
      const data = await response.json();
      setNcc(data.error ? null : data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [nccId]);

  const contextValue = useMemo(
    () => ({ ncc, nccId, loading, refresh }),
    [ncc, nccId, loading],
  );

  const status =
    STATUS_CONFIG[String(ncc?.trang_thai ?? "DANG_HOP_TAC")] ??
    STATUS_CONFIG.DANG_HOP_TAC;
  const activeTab =
    TAB_ITEMS.find((tab) => pathname.endsWith(`/${tab.href}`))?.href || "info";
  const diemUyTin = Number(ncc?.diem_uy_tin ?? 5);
  const congNo = Number(ncc?.cong_no_hien_tai ?? 0);

  return (
    <SupplierDetailContext.Provider value={contextValue}>
      <div className="space-y-6">
        <Link
          href="/admin/suppliers"
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={16} /> Quay lại danh sách NCC
        </Link>

        <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold text-white">
                  {(ncc?.ten_ncc?.[0] ?? "N").toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold">
                      {ncc?.ten_ncc ?? "Đang tải nhà cung cấp"}
                    </h1>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                    {diemUyTin < 6 && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${diemUyTin < 4 ? "bg-rose-500/20 text-rose-100" : "bg-amber-400/20 text-amber-100"}`}
                      >
                        <AlertTriangle size={11} />{" "}
                        {diemUyTin < 4
                          ? "Cân nhắc dừng hợp tác"
                          : "Cần theo dõi"}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                    <span className="font-mono text-xs text-slate-400">
                      {ncc?.ma_ncc ?? `#${nccId}`}
                    </span>
                    {ncc?.tinh_thanh && <span>{ncc.tinh_thanh}</span>}
                    {ncc?.so_dien_thoai && <span>{ncc.so_dien_thoai}</span>}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard
                  label="Điểm uy tín"
                  value={diemUyTin.toFixed(1)}
                  hint="/5"
                />
                <MetricCard
                  label="Công nợ"
                  value={
                    congNo > 0
                      ? `${congNo.toLocaleString("vi-VN")}đ`
                      : "Sạch nợ"
                  }
                  hint={congNo > 0 ? "Đang nợ NCC" : "Đã thanh toán"}
                />
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
              {TAB_ITEMS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={`/admin/suppliers/${nccId}/${tab.href}`}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}
                  >
                    <Icon size={15} /> {tab.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={refresh}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <RefreshCw size={15} /> Tải lại
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid min-h-[320px] place-items-center rounded-3xl border border-dashed border-slate-200 bg-white/80 text-slate-500">
            Đang tải nhà cung cấp...
          </div>
        ) : (
          <div>{children}</div>
        )}
      </div>
    </SupplierDetailContext.Provider>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="min-w-[160px] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right backdrop-blur">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-300">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      <div className="text-xs text-slate-300">{hint}</div>
    </div>
  );
}
