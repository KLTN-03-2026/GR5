"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  ClipboardList,
  RefreshCw,
  ShieldAlert,
  Truck,
  XCircle,
} from "lucide-react";

type ReceiptListItem = {
  id: number;
  ma_phieu: string;
  ncc_ten: string;
  ngay_tao: string | null;
  trang_thai: string;
  nguoi_tao: string;
  tong_san_pham: number;
  tong_so_luong: number;
  co_chenh_lech: boolean;
};

type ReceiptDetail = {
  phieu: {
    id: number;
    ma_phieu: string;
    ncc: string;
    ngay_tao: string | null;
    trang_thai: string;
    nguoi_tao: string;
  };
  items: Array<{
    id: number;
    san_pham: string;
    ma_bien_the: number | null;
    yeu_cau: number;
    thuc_nhan: number;
    chenh_lech: number;
    ly_do_chenh_lech: string | null;
    ghi_chu: string | null;
  }>;
  history: Array<{ at: string; text: string }>;
};

const STATUS_TABS = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "CHO_DUYET", label: "Chờ duyệt" },
  { value: "CHO_KIEM_TRA", label: "Cần đếm lại" },
  { value: "DA_DUYET", label: "Đã duyệt" },
  { value: "DA_HUY", label: "Đã hủy" },
  { value: "all", label: "Tất cả" },
];

function formatDateTime(value: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("vi-VN");
}

export default function WarehouseReceivingClient() {
  const [status, setStatus] = useState("pending");
  const [receipts, setReceipts] = useState<ReceiptListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ReceiptDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [summary, setSummary] = useState<{
    qrCount: number;
    totalQuantity: number;
    debtAfter: number;
    supplierName: string;
    receiptCode: string;
  } | null>(null);

  const filteredLabel = useMemo(
    () => STATUS_TABS.find((tab) => tab.value === status)?.label || "",
    [status],
  );

  const loadReceipts = async () => {
    setListLoading(true);
    try {
      const response = await fetch(
        `/api/admin/warehouse/import?status=${encodeURIComponent(status)}`,
        { cache: "no-store" },
      );
      const json = await response.json();
      setReceipts(json.phieus || []);
    } finally {
      setListLoading(false);
    }
  };

  const loadDetail = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/warehouse/import/${id}`, {
        cache: "no-store",
      });
      const json = (await response.json()) as ReceiptDetail;
      setDetail(json);
      setRejectReason("");
      setConfirmChecked(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, [status]);

  useEffect(() => {
    if (!selectedId && receipts.length > 0) {
      setSelectedId(receipts[0].id);
      loadDetail(receipts[0].id);
    }
  }, [receipts, selectedId]);

  const onSelectReceipt = (id: number) => {
    setSelectedId(id);
    loadDetail(id);
  };

  const refreshAll = async () => {
    await loadReceipts();
    if (selectedId) {
      await loadDetail(selectedId);
    }
  };

  const approveReceipt = async () => {
    if (!selectedId || !confirmChecked) return;
    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/admin/warehouse/import/${selectedId}/approve`,
        { method: "POST" },
      );
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Không thể duyệt phiếu");
      setSummary(json);
      await refreshAll();
    } catch (error: any) {
      alert(error?.message || "Không thể duyệt phiếu");
    } finally {
      setActionLoading(false);
    }
  };

  const rejectReceipt = async () => {
    if (!selectedId || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/admin/warehouse/import/${selectedId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectReason.trim() }),
        },
      );
      const json = await response.json();
      if (!response.ok)
        throw new Error(json.error || "Không thể từ chối phiếu");
      await refreshAll();
      setRejectReason("");
      setConfirmChecked(false);
    } catch (error: any) {
      alert(error?.message || "Không thể từ chối phiếu");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <InfoCard
          icon={<ClipboardList className="h-5 w-5" />}
          label="Danh sách đang xem"
          value={filteredLabel}
        />
        <InfoCard
          icon={<Truck className="h-5 w-5" />}
          label="Tổng phiếu"
          value={receipts.length}
        />
        <InfoCard
          icon={<BadgeCheck className="h-5 w-5" />}
          label="Phiếu có chênh lệch"
          value={receipts.filter((item) => item.co_chenh_lech).length}
        />
        <InfoCard
          icon={<ShieldAlert className="h-5 w-5" />}
          label="Phiếu cần xử lý"
          value={
            receipts.filter((item) => item.trang_thai === "CHO_KIEM_TRA").length
          }
        />
      </div>

      <div className="rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Nhập kho master-detail
            </h2>
            <p className="text-sm text-slate-500">
              Bảng trái là danh sách phiếu, bảng phải là chi tiết và nút
              duyệt/từ chối.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshAll}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${status === tab.value ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Danh sách phiếu</h3>
              <span className="text-sm text-slate-500">
                {receipts.length} phiếu
              </span>
            </div>

            <div className="space-y-3">
              {listLoading ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                  Đang tải danh sách...
                </div>
              ) : receipts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                  Không có phiếu phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                receipts.map((receipt) => {
                  const active = receipt.id === selectedId;
                  return (
                    <button
                      key={receipt.id}
                      type="button"
                      onClick={() => onSelectReceipt(receipt.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${active ? "border-slate-950 bg-slate-950 text-white shadow-lg" : "border-slate-200 bg-white hover:border-slate-300"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold">
                            {receipt.ma_phieu}
                          </div>
                          <div
                            className={`mt-1 text-sm ${active ? "text-slate-300" : "text-slate-500"}`}
                          >
                            {receipt.ncc_ten}
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${receipt.co_chenh_lech ? (active ? "bg-amber-400/20 text-amber-200" : "bg-amber-100 text-amber-700") : active ? "bg-white/10 text-white" : "bg-emerald-100 text-emerald-700"}`}
                        >
                          {receipt.trang_thai}
                        </span>
                      </div>
                      <div
                        className={`mt-3 grid grid-cols-2 gap-2 text-sm ${active ? "text-slate-300" : "text-slate-500"}`}
                      >
                        <div>{receipt.tong_san_pham} dòng hàng</div>
                        <div>{receipt.tong_so_luong} đơn vị</div>
                        <div>{formatDateTime(receipt.ngay_tao)}</div>
                        <div>{receipt.nguoi_tao}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
            {loading ? (
              <div className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-500">
                Đang tải chi tiết phiếu...
              </div>
            ) : !detail ? (
              <div className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-500">
                Chọn một phiếu để xem master-detail.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-950 p-4 text-white">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-300">
                        Phiếu nhập
                      </div>
                      <div className="mt-2 text-2xl font-semibold">
                        {detail.phieu.ma_phieu}
                      </div>
                      <div className="mt-1 text-sm text-slate-300">
                        {detail.phieu.ncc} · {detail.phieu.nguoi_tao}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
                      <div className="text-xs text-slate-300">Trạng thái</div>
                      <div className="mt-1 text-sm font-semibold">
                        {detail.phieu.trang_thai}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200">
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    Danh sách sản phẩm
                  </div>
                  <div className="divide-y divide-slate-200">
                    {detail.items.map((item) => (
                      <div
                        key={item.id}
                        className={`grid gap-3 px-4 py-3 md:grid-cols-[1.4fr_0.5fr_0.5fr_0.5fr] ${item.chenh_lech !== 0 ? "bg-amber-50/80" : "bg-white"}`}
                      >
                        <div>
                          <div className="font-medium text-slate-900">
                            {item.san_pham}
                          </div>
                          <div className="text-xs text-slate-500">
                            Biến thể #{item.ma_bien_the ?? "N/A"}
                          </div>
                        </div>
                        <div className="text-sm text-slate-600">
                          Yêu cầu:{" "}
                          <span className="font-semibold text-slate-900">
                            {item.yeu_cau}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">
                          Thực nhận:{" "}
                          <span className="font-semibold text-slate-900">
                            {item.thuc_nhan}
                          </span>
                        </div>
                        <div
                          className={`text-sm font-semibold ${item.chenh_lech === 0 ? "text-emerald-600" : "text-amber-700"}`}
                        >
                          Chênh lệch: {item.chenh_lech > 0 ? "+" : ""}
                          {item.chenh_lech}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-semibold text-slate-900">
                        Lịch sử xử lý
                      </h4>
                      <span className="text-xs text-slate-500">
                        {detail.history.length} dòng
                      </span>
                    </div>
                    <div className="mt-3 space-y-3">
                      {detail.history.length > 0 ? (
                        detail.history.map((entry, index) => (
                          <div
                            key={`${entry.at}-${index}`}
                            className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600"
                          >
                            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                              {entry.at || "N/A"}
                            </div>
                            <div className="mt-1">{entry.text}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-500">
                          Chưa có lịch sử xử lý.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="font-semibold text-slate-900">
                      Phê duyệt master-detail
                    </h4>
                    <div className="mt-3 space-y-3 text-sm text-slate-600">
                      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                        <input
                          type="checkbox"
                          checked={confirmChecked}
                          onChange={(event) =>
                            setConfirmChecked(event.target.checked)
                          }
                          className="mt-1 h-4 w-4 rounded border-slate-300"
                        />
                        <span>
                          Tôi đã kiểm tra đủ số lượng, lô hàng, QR và vị trí
                          trước khi duyệt.
                        </span>
                      </label>

                      <textarea
                        value={rejectReason}
                        onChange={(event) =>
                          setRejectReason(event.target.value)
                        }
                        placeholder="Nhập lý do từ chối hoặc yêu cầu đếm lại..."
                        className="min-h-[112px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-900"
                      />

                      <div className="grid gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          disabled={!confirmChecked || actionLoading}
                          onClick={approveReceipt}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <BadgeCheck className="h-4 w-4" />
                          Duyệt phiếu
                        </button>
                        <button
                          type="button"
                          disabled={!rejectReason.trim() || actionLoading}
                          onClick={rejectReceipt}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Từ chối / đếm lại
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white p-6 shadow-2xl">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Phiếu đã duyệt
            </div>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.receiptCode}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Vào in mã QR cho {summary.supplierName} để hoàn tất nhập kho.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                <div className="text-slate-500">QR tạo ra</div>
                <div className="mt-1 text-xl font-semibold text-slate-900">
                  {summary.qrCount}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                <div className="text-slate-500">Số lượng</div>
                <div className="mt-1 text-xl font-semibold text-slate-900">
                  {summary.totalQuantity}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                <div className="text-slate-500">Công nợ sau</div>
                <div className="mt-1 text-xl font-semibold text-slate-900">
                  {summary.debtAfter.toLocaleString("vi-VN")}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSummary(null)}
                className="rounded-full bg-slate-950 px-4 py-2 font-medium text-white"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({
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
