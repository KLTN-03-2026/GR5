"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

type AlertItem = {
  id: number;
  ma_lo_hang_id: number | null;
  ma_lo: string;
  san_pham: string;
  san_pham_id: number | null;
  ma_bien_the: number | null;
  ncc_id: number | null;
  ncc_ten: string | null;
  so_luong: number;
  vi_tri: string;
  han_su_dung: string;
  days_left: number | null;
  loai_canh_bao: string;
  da_xu_ly: boolean;
  phuong_thuc_xu_ly: string | null;
  ghi_chu_xu_ly: string | null;
  proposed_action: string | null;
  evidence_images: string[];
};

type AlertsResponse = {
  items: AlertItem[];
  grouped: {
    actionNeeded: AlertItem[];
    pendingReview: AlertItem[];
  };
};

const FILTER_TABS = [
  { value: "action-needed", label: "Cần xử lý" },
  { value: "pending", label: "Chờ Admin duyệt" },
  { value: "all", label: "Tất cả" },
];

function suggestDiscount(daysLeft: number | null) {
  if (daysLeft === null) return 20;
  if (daysLeft <= 3) return 50;
  if (daysLeft <= 7) return 30;
  return 15;
}

function suggestEndDate(daysLeft: number | null) {
  const target = new Date();
  target.setDate(
    target.getDate() + (daysLeft && daysLeft > 0 ? Math.min(daysLeft, 14) : 14),
  );
  return target.toISOString().slice(0, 10);
}

export default function WarehouseAlertsClient() {
  const router = useRouter();
  const [filter, setFilter] = useState("action-needed");
  const [data, setData] = useState<AlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [clearanceModal, setClearanceModal] = useState<{
    alert: AlertItem;
    discount: number;
    endDate: string;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/warehouse/alerts?filter=${encodeURIComponent(filter)}`,
        { cache: "no-store" },
      );
      const json = (await response.json()) as AlertsResponse;
      setData(json);
      setSelectedAlert(json.items[0] || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const currentItems = useMemo(() => data?.items || [], [data]);
  const actionNeeded = data?.grouped.actionNeeded || [];
  const pendingReview = data?.grouped.pendingReview || [];

  const refresh = async () => {
    await loadData();
  };

  const approveDestroy = async (alert: AlertItem) => {
    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/admin/warehouse/alerts/${alert.id}/destroy`,
        { method: "POST" },
      );
      const json = await response.json();
      if (!response.ok)
        throw new Error(json.error || "Không thể duyệt tiêu hủy");
      await refresh();
      setSelectedAlert(null);
    } catch (error: any) {
      alert(error?.message || "Không thể duyệt tiêu hủy");
    } finally {
      setActionLoading(false);
    }
  };

  const approveClearance = async () => {
    if (!clearanceModal) return;
    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/admin/warehouse/alerts/${clearanceModal.alert.id}/clearance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            discountPercent: clearanceModal.discount,
            endDate: clearanceModal.endDate,
          }),
        },
      );
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Không thể duyệt xả kho");
      setClearanceModal(null);
      await refresh();
      router.push(`/admin/promotions?highlight=${json.promoId}`);
    } catch (error: any) {
      alert(error?.message || "Không thể duyệt xả kho");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <AlertCard
          icon={<ShieldAlert className="h-5 w-5" />}
          label="Cần xử lý"
          value={actionNeeded.length}
        />
        <AlertCard
          icon={<Sparkles className="h-5 w-5" />}
          label="Chờ duyệt"
          value={pendingReview.length}
        />
        <AlertCard
          icon={<Flame className="h-5 w-5" />}
          label="Đang xem"
          value={currentItems.length}
        />
        <AlertCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Tab"
          value={FILTER_TABS.find((tab) => tab.value === filter)?.label || ""}
        />
      </div>

      <div className="rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Cảnh báo HSD
            </h2>
            <p className="text-sm text-slate-500">
              Hai tab chính: các lô cần xử lý ngay và lô có đề xuất nhân viên
              chờ admin duyệt.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${filter === tab.value ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.88fr]">
          <section className="space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Đang tải cảnh báo...
              </div>
            ) : currentItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Không có cảnh báo nào ở bộ lọc này.
              </div>
            ) : (
              <>
                <AlertGroup
                  title="Cần xử lý ngay"
                  items={actionNeeded}
                  onOpen={setSelectedAlert}
                  onDestroy={approveDestroy}
                  onClearance={(alert) =>
                    setClearanceModal({
                      alert,
                      discount: suggestDiscount(alert.days_left),
                      endDate: suggestEndDate(alert.days_left),
                    })
                  }
                  actionLoading={actionLoading}
                />
                <AlertGroup
                  title="Chờ Admin duyệt"
                  items={pendingReview}
                  onOpen={setSelectedAlert}
                  onDestroy={approveDestroy}
                  onClearance={(alert) =>
                    setClearanceModal({
                      alert,
                      discount: suggestDiscount(alert.days_left),
                      endDate: suggestEndDate(alert.days_left),
                    })
                  }
                  actionLoading={actionLoading}
                />
                {filter === "all" &&
                  actionNeeded.length === 0 &&
                  pendingReview.length === 0 &&
                  currentItems.map((alert) => (
                    <AlertGroup
                      key={alert.id}
                      title={
                        alert.proposed_action
                          ? "Đề xuất chờ duyệt"
                          : "Cần xử lý"
                      }
                      items={[alert]}
                      onOpen={setSelectedAlert}
                      onDestroy={approveDestroy}
                      onClearance={(entry) =>
                        setClearanceModal({
                          alert: entry,
                          discount: suggestDiscount(entry.days_left),
                          endDate: suggestEndDate(entry.days_left),
                        })
                      }
                      actionLoading={actionLoading}
                    />
                  ))}
              </>
            )}
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-slate-300">
                Chi tiết lô cảnh báo
              </div>
              <h3 className="mt-3 text-2xl font-semibold">
                {selectedAlert?.san_pham || "Chọn một thẻ cảnh báo"}
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Mỗi thẻ cho phép duyệt tiêu hủy hoặc xả kho kèm tạo khuyến mãi.
              </p>
            </div>

            {selectedAlert ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <span>Mã lô</span>
                    <span className="font-semibold text-white">
                      {selectedAlert.ma_lo}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span>HSD</span>
                    <span className="font-semibold text-white">
                      {selectedAlert.han_su_dung}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span>Ngày còn lại</span>
                    <span className="font-semibold text-white">
                      {selectedAlert.days_left ?? "N/A"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span>Số lượng</span>
                    <span className="font-semibold text-white">
                      {selectedAlert.so_luong}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span>Vị trí</span>
                    <span className="font-semibold text-white">
                      {selectedAlert.vi_tri}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white">
                    Đề xuất hiện có
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    {selectedAlert.proposed_action ||
                      "Chưa có đề xuất rõ ràng từ nhân viên."}
                  </div>
                  {selectedAlert.ghi_chu_xu_ly && (
                    <div className="mt-3 rounded-xl bg-slate-900/80 p-3 text-sm text-slate-200">
                      {selectedAlert.ghi_chu_xu_ly}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white">
                    Ảnh minh chứng
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {selectedAlert.evidence_images.length > 0 ? (
                      selectedAlert.evidence_images.map((src) => (
                        <img
                          key={src}
                          src={src}
                          alt="minh chứng"
                          className="h-28 w-full rounded-xl object-cover"
                        />
                      ))
                    ) : (
                      <div className="text-sm text-slate-300">
                        Không có ảnh minh chứng được backend trả về.
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => approveDestroy(selectedAlert)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Duyệt tiêu hủy
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() =>
                      setClearanceModal({
                        alert: selectedAlert,
                        discount: suggestDiscount(selectedAlert.days_left),
                        endDate: suggestEndDate(selectedAlert.days_left),
                      })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    Duyệt xả kho
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                Chọn một lô để xem đề xuất và xử lý.
              </div>
            )}
          </aside>
        </div>
      </div>

      {clearanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-6 shadow-2xl">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Duyệt xả kho
            </div>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {clearanceModal.alert.san_pham}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Hệ thống sẽ tạo mã giảm giá và chuyển sang trang khuyến mãi để
              được highlight.
            </p>

            <div className="mt-5 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                % giảm giá
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={clearanceModal.discount}
                  onChange={(event) =>
                    setClearanceModal({
                      ...clearanceModal,
                      discount: Number(event.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Ngày kết thúc
                <input
                  type="date"
                  value={clearanceModal.endDate}
                  onChange={(event) =>
                    setClearanceModal({
                      ...clearanceModal,
                      endDate: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                />
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setClearanceModal(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={approveClearance}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertGroup({
  title,
  items,
  onOpen,
  onDestroy,
  onClearance,
  actionLoading,
}: {
  title: string;
  items: AlertItem[];
  onOpen: (item: AlertItem) => void;
  onDestroy: (item: AlertItem) => void;
  onClearance: (item: AlertItem) => void;
  actionLoading: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <span className="text-sm text-slate-500">{items.length} lô</span>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item)}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-900">
                  {item.san_pham}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {item.ma_lo} · {item.vi_tri}
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${item.days_left !== null && item.days_left <= 3 ? "bg-red-100 text-red-700" : item.days_left !== null && item.days_left <= 7 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
              >
                {item.days_left === null ? "N/A" : `${item.days_left} ngày`}
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                Số lượng:{" "}
                <span className="font-semibold text-slate-900">
                  {item.so_luong}
                </span>
              </div>
              <div>
                HSD:{" "}
                <span className="font-semibold text-slate-900">
                  {item.han_su_dung}
                </span>
              </div>
              <div>
                Loại:{" "}
                <span className="font-semibold text-slate-900">
                  {item.loai_canh_bao}
                </span>
              </div>
              <div>
                Trạng thái:{" "}
                <span className="font-semibold text-slate-900">
                  {item.proposed_action || "Cần xử lý"}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={(event) => {
                  event.stopPropagation();
                  onDestroy(item);
                }}
                className="rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tiêu hủy
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={(event) => {
                  event.stopPropagation();
                  onClearance(item);
                }}
                className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Xả kho
              </button>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AlertCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/95 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-bold text-slate-950">{value}</div>
        </div>
        <div className="rounded-2xl bg-slate-950 p-3 text-white">{icon}</div>
      </div>
    </div>
  );
}
