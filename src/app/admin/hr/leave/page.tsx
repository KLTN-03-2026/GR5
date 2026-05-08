"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2, XCircle, Clock, FileText, Filter,
  CalendarRange, User, MessageSquare, ChevronDown,
} from "lucide-react";

type DonNghiPhep = {
  id: number;
  loai_nghi: string;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  ly_do: string;
  trang_thai: "CHO_DUYET" | "DA_DUYET" | "TU_CHOI";
  nguoi_dung: { ho_so_nguoi_dung: { ho_ten: string; chuc_vu: string } | null } | null;
};

const LOAI_NGHI_LABEL: Record<string, string> = {
  PHEP_NAM: "Phép năm",
  NGHI_BENH: "Nghỉ bệnh",
  NGHI_KHONG_LUONG: "Không lương",
  NGHI_LE: "Nghỉ lễ",
  VIEC_RIENG: "Việc riêng",
};

const STATUS_CONFIG = {
  CHO_DUYET: { label: "Chờ duyệt", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-400", icon: Clock },
  DA_DUYET: { label: "Đã duyệt", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500", icon: CheckCircle2 },
  TU_CHOI: { label: "Từ chối", bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-400", icon: XCircle },
};

function Avatar({ name }: { name: string }) {
  const initials = name?.split(" ").slice(-1)[0]?.[0]?.toUpperCase() || "?";
  const colors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
      {initials}
    </div>
  );
}

export default function LeaveManagementPage() {
  const [list, setList] = useState<DonNghiPhep[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "CHO_DUYET" | "DA_DUYET" | "TU_CHOI">("ALL");
  const [rejectModal, setRejectModal] = useState<{ id: number; open: boolean }>({ id: 0, open: false });
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchLeaves = async () => {
    setLoading(true);
    const res = await fetch("/api/nghi-phep");
    const result = await res.json();
    if (result.success) setList(result.data);
    setLoading(false);
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleApprove = async (id: number) => {
    setProcessing(id);
    await fetch(`/api/nghi-phep/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trang_thai: "DA_DUYET", phan_hoi_admin: "Đã phê duyệt", ma_nguoi_duyet: 1 }),
    });
    setProcessing(null);
    fetchLeaves();
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setProcessing(rejectModal.id);
    await fetch(`/api/nghi-phep/${rejectModal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trang_thai: "TU_CHOI", phan_hoi_admin: rejectReason, ma_nguoi_duyet: 1 }),
    });
    setProcessing(null);
    setRejectModal({ id: 0, open: false });
    setRejectReason("");
    fetchLeaves();
  };

  const countByStatus = (s: string) => list.filter((d) => d.trang_thai === s).length;

  const filtered = filter === "ALL" ? list : list.filter((d) => d.trang_thai === filter);

  const getDays = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / 86400000) + 1;
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Nghỉ Phép</h1>
          <p className="text-sm text-gray-500 mt-0.5">Xét duyệt đơn xin nghỉ của nhân viên kho</p>
        </div>

        {/* Quick stats */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "CHO_DUYET", label: "Chờ duyệt", color: "bg-amber-100 text-amber-700 border-amber-200" },
            { key: "DA_DUYET", label: "Đã duyệt", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
            { key: "TU_CHOI", label: "Từ chối", color: "bg-red-100 text-red-700 border-red-200" },
          ].map((s) => (
            <div key={s.key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${s.color}`}>
              <span className="text-base font-bold">{countByStatus(s.key)}</span>
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "ALL", label: `Tất cả (${list.length})` },
          { key: "CHO_DUYET", label: `Chờ duyệt (${countByStatus("CHO_DUYET")})` },
          { key: "DA_DUYET", label: `Đã duyệt (${countByStatus("DA_DUYET")})` },
          { key: "TU_CHOI", label: `Từ chối (${countByStatus("TU_CHOI")})` },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
              filter === tab.key
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-24 bg-white rounded-xl border shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Đang tải danh sách...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border shadow-sm gap-3">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">Không có đơn nào</p>
            <p className="text-sm text-gray-400">Không tìm thấy đơn xin nghỉ phù hợp</p>
          </div>
        ) : (
          filtered.map((don) => {
            const cfg = STATUS_CONFIG[don.trang_thai];
            const StatusIcon = cfg.icon;
            const days = getDays(don.ngay_bat_dau, don.ngay_ket_thuc);
            const loaiLabel = LOAI_NGHI_LABEL[don.loai_nghi] || don.loai_nghi;

            return (
              <div key={don.id}
                className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Status bar */}
                  <div className={`w-full md:w-1 h-1 md:h-auto flex-shrink-0 ${cfg.dot}`} />

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 flex-1">
                    {/* Avatar + Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar name={don.nguoi_dung?.ho_so_nguoi_dung?.ho_ten ?? "?"} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-sm">
                            {don.nguoi_dung?.ho_so_nguoi_dung?.ho_ten ?? "—"}
                          </h3>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            {don.nguoi_dung?.ho_so_nguoi_dung?.chuc_vu || "Nhân viên"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <FileText size={11} />
                            {loaiLabel}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <CalendarRange size={11} />
                            {new Date(don.ngay_bat_dau).toLocaleDateString("vi-VN")}
                            {" → "}
                            {new Date(don.ngay_ket_thuc).toLocaleDateString("vi-VN")}
                            <span className="font-semibold text-gray-700">({days} ngày)</span>
                          </span>
                        </div>
                        {don.ly_do && (
                          <p className="flex items-start gap-1 text-xs text-gray-400 mt-1 italic max-w-md truncate">
                            <MessageSquare size={11} className="flex-shrink-0 mt-0.5" />
                            {don.ly_do}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status + Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-center">
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                        <StatusIcon size={12} />
                        {cfg.label}
                      </span>

                      {don.trang_thai === "CHO_DUYET" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setRejectModal({ id: don.id, open: true }); setRejectReason(""); }}
                            disabled={processing === don.id}
                            className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium text-xs transition disabled:opacity-50"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => handleApprove(don.id)}
                            disabled={processing === don.id}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-xs transition shadow-sm disabled:opacity-50 flex items-center gap-1"
                          >
                            {processing === don.id ? (
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle2 size={12} />
                            )}
                            Phê duyệt
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setRejectModal({ id: 0, open: false })}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-6 py-4 border-b bg-red-50">
              <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Từ chối đơn nghỉ phép</h3>
                <p className="text-xs text-gray-500">Nhân viên sẽ nhận được lý do từ chối</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do từ chối <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối để thông báo cho nhân viên..."
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setRejectModal({ id: 0, open: false })}
                className="flex-1 py-2.5 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                Hủy
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || processing !== null}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 shadow-sm">
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
