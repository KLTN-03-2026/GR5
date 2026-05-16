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
  RotateCcw,
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
  { href: "products", label: "Sản phẩm", icon: LayoutGrid },
  { href: "history", label: "Lịch sử nhập", icon: History },
  { href: "debt", label: "Công nợ", icon: CreditCard },
  { href: "quality", label: "Chất lượng", icon: ShieldCheck },
  { href: "returns", label: "Trả hàng", icon: RotateCcw },
];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DANG_HOP_TAC: {
    label: "Đang hợp tác",
    className: "border-emerald-600 bg-[#f0fdf4] text-[#065f46]",
  },
  TAM_DUNG: { label: "Tạm dừng", className: "border-amber-400 bg-amber-50 text-amber-900" },
  NGUNG: { label: "Đã ngừng", className: "border-rose-400 bg-rose-50 text-rose-800" },
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
          href={pathname.startsWith("/warehouse-manager") ? "/warehouse-manager/suppliers" : "/admin/suppliers"}
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={16} /> Quay lại danh sách NCC
        </Link>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b-[0.5px] border-slate-200 bg-white px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-full bg-[#f0fdf4] text-lg font-bold text-[#059669]">
                  {(ncc?.ten_ncc?.[0] ?? "N").toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[18px] font-medium text-slate-900">
                      {ncc?.ten_ncc ?? "Đang tải nhà cung cấp"}
                    </h1>
                    <span className="text-[11px] text-slate-400">
                      #{ncc?.ma_ncc ?? nccId}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                    {diemUyTin < 6 && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${diemUyTin < 4 ? "border-rose-500 bg-rose-50 text-rose-700" : "border-[#fbbf24] bg-[#fef9c3] text-[#92400e]"}`}
                      >
                        <AlertTriangle size={11} />{" "}
                        {diemUyTin < 4
                          ? "Cân nhắc dừng hợp tác"
                          : "Cần theo dõi"}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[13px] text-slate-500">
                    {ncc?.so_dien_thoai && <span>{ncc.so_dien_thoai}</span>}
                    {ncc?.tinh_thanh && <span>• {ncc.tinh_thanh}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">
                    Điểm uy tín
                  </div>
                  <div className="mt-0.5 text-[20px] font-medium text-slate-900">
                    {diemUyTin.toFixed(1)}<span className="text-sm text-slate-400">/5</span>
                  </div>
                </div>
                <div className="h-8 w-[1px] bg-[#e2e8f0]"></div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">
                    Công nợ
                  </div>
                  <div className={`mt-0.5 text-[14px] font-medium ${congNo > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {congNo > 0
                      ? `${congNo.toLocaleString("vi-VN")}đ`
                      : "Sạch nợ"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-white px-6 pt-2">
            <div className="flex items-center gap-6 overflow-x-auto">
              {TAB_ITEMS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.href;
                const baseUrl = pathname.startsWith("/warehouse-manager") ? "/warehouse-manager/suppliers" : "/admin/suppliers";
                return (
                  <Link
                    key={tab.href}
                    href={`${baseUrl}/${nccId}/${tab.href}`}
                    className={`inline-flex items-center gap-2 border-b-2 py-3 text-sm transition ${active ? "border-[#059669] font-medium text-[#059669]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                  >
                    <Icon size={15} /> {tab.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={refresh}
                className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <RefreshCw size={14} /> Tải lại
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

