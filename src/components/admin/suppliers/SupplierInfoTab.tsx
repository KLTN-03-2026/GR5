"use client";

import React, { useState } from "react";
import { Edit3, PauseCircle, XCircle, Save, X } from "lucide-react";

const CHU_KY_LABELS: Record<string, string> = {
  NGAY_GIAO: "Ngay khi giao", "7_NGAY": "Sau 7 ngày", "15_NGAY": "Sau 15 ngày", "30_NGAY": "Sau 30 ngày",
};
const HTTT_LABELS: Record<string, string> = {
  CHUYEN_KHOAN: "Chuyển khoản", TIEN_MAT: "Tiền mặt", COD: "COD",
};
const LOAI_LABELS: Record<string, string> = {
  NONG_DAN: "Nông dân nhỏ lẻ", HTX: "Hợp tác xã (HTX)", CONG_TY: "Công ty", DANH_LE: "Đánh lẻ / Chợ đầu mối",
};

interface Props { ncc: Record<string, unknown>; onRefresh: () => void; }

export default function SupplierInfoTab({ ncc, onRefresh }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({ ...ncc });
  const [showStopModal, setShowStopModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [stopReason, setStopReason] = useState("");
  const [stopWarning, setStopWarning] = useState<{ cong_no: number; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/admin/ncc/${ncc.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    setSaving(false);
    setEditing(false);
    onRefresh();
  };

  const handleStatusChange = async (status: string, confirmed = false) => {
    if (status === "NGUNG" && !confirmed) {
      const res = await fetch(`/api/admin/ncc/${ncc.id}/trang-thai`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trang_thai: status, ly_do: stopReason }),
      });
      const data = await res.json();
      if (data.warning) { setStopWarning(data); return; }
    }
    await fetch(`/api/admin/ncc/${ncc.id}/trang-thai`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trang_thai: status, ly_do: stopReason }),
    });
    setShowStopModal(false);
    setShowPauseModal(false);
    setStopWarning(null);
    setStopReason("");
    onRefresh();
  };

  const field = (label: string, key: string, type = "text") => (
    <div className="group">
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      {editing ? (
        <input type={type} value={(form[key] as string) ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
      ) : (
        <div className="flex items-center gap-2">
          <p className={`font-medium ${ncc[key] ? "text-gray-900" : "text-slate-300"}`}>
            {(ncc[key] as string) || "—"}
          </p>
          {!ncc[key] && (
            <button
              onClick={() => setEditing(true)}
              className="hidden group-hover:inline-flex items-center gap-1 text-[11px] text-slate-400 transition-colors hover:text-slate-600"
              title="Thêm thông tin"
            >
              <Edit3 size={10} /> Thêm
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Thông tin chung */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-800">Hồ sơ nhà cung cấp</h2>
            {editing ? (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                  <X size={14} /> Hủy
                </button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">
                  <Save size={14} /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                <Edit3 size={14} /> Chỉnh sửa
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-5">
            {field("Tên NCC", "ten_ncc")}
            {editing ? (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Loại NCC</label>
                <select value={(form.loai_ncc as string) ?? ""} onChange={(e) => setForm({ ...form, loai_ncc: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.entries(LOAI_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            ) : (
              <div className="group">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Loại NCC</label>
                <div className="flex items-center gap-2">
                  <p className={`font-medium ${ncc.loai_ncc ? "text-gray-900" : "text-slate-300"}`}>
                    {LOAI_LABELS[(ncc.loai_ncc as string) ?? ""] ?? "—"}
                  </p>
                  {!ncc.loai_ncc && (
                    <button onClick={() => setEditing(true)} className="hidden group-hover:inline-flex items-center gap-1 text-[11px] text-slate-400 transition-colors hover:text-slate-600" title="Thêm thông tin">
                      <Edit3 size={10} /> Thêm
                    </button>
                  )}
                </div>
              </div>
            )}
            {field("Tỉnh thành", "tinh_thanh")}
            {field("Địa chỉ", "dia_chi")}
            {field("Người liên hệ", "nguoi_lien_he")}
            {field("Số điện thoại", "so_dien_thoai")}
            {field("Zalo", "zalo")}
            {field("Email", "email")}
          </div>
        </div>

        {/* Pháp lý & Thanh toán */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-5">Pháp lý & Thanh toán</h2>
          <div className="grid grid-cols-2 gap-5">
            {field("Mã số thuế", "ma_so_thue")}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Hóa đơn VAT</label>
              {editing ? (
                <select value={String(form.co_hoa_don_vat ?? false)} onChange={(e) => setForm({ ...form, co_hoa_don_vat: e.target.value === "true" })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="false">Không xuất được VAT</option>
                  <option value="true">Có xuất hóa đơn VAT</option>
                </select>
              ) : (
                <p className={`font-medium ${ncc.co_hoa_don_vat ? "text-green-600" : "text-gray-500"}`}>
                  {ncc.co_hoa_don_vat ? "✓ Có xuất hóa đơn VAT" : "Không xuất được VAT"}
                </p>
              )}
            </div>
            {editing ? (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Hình thức thanh toán</label>
                <select value={(form.hinh_thuc_thanh_toan as string) ?? ""} onChange={(e) => setForm({ ...form, hinh_thuc_thanh_toan: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.entries(HTTT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Hình thức thanh toán</label>
                <p className="text-gray-900 font-medium">{HTTT_LABELS[(ncc.hinh_thuc_thanh_toan as string) ?? ""] ?? "—"}</p>
              </div>
            )}
            {editing ? (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Chu kỳ thanh toán</label>
                <select value={(form.chu_ky_thanh_toan as string) ?? ""} onChange={(e) => setForm({ ...form, chu_ky_thanh_toan: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.entries(CHU_KY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Chu kỳ thanh toán</label>
                <p className="text-gray-900 font-medium">{CHU_KY_LABELS[(ncc.chu_ky_thanh_toan as string) ?? ""] ?? "—"}</p>
              </div>
            )}
            {field("Số tài khoản", "so_tai_khoan")}
            {field("Ngân hàng", "ten_ngan_hang")}
          </div>
        </div>
      </div>

      {/* Sidebar phải */}
      <div className="space-y-4">
        {/* Ghi chú nội bộ */}
        <div className="bg-white border border-slate-200 border-l-[3px] border-l-[#f59e0b] p-3 shadow-sm">
          <h3 className="text-[12px] font-medium text-slate-700 mb-2 flex items-center gap-1.5">
            🔒 Ghi chú nội bộ <span className="text-[10px] font-normal text-slate-400">(Chỉ Admin thấy)</span>
          </h3>
          {editing ? (
            <textarea rows={4} value={(form.ghi_chu_noi_bo as string) ?? ""} onChange={(e) => setForm({ ...form, ghi_chu_noi_bo: e.target.value })}
              className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
          ) : (
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
              {(ncc.ghi_chu_noi_bo as string) || <span className="text-slate-300">—</span>}
            </p>
          )}
        </div>

        {/* Nút hành động trạng thái */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Hành động hợp tác</h3>
          <div className="flex flex-wrap items-center gap-3">
            {ncc.trang_thai !== "DANG_HOP_TAC" && (
              <button onClick={() => handleStatusChange("DANG_HOP_TAC")}
                className="py-1.5 px-3 bg-[#059669] hover:bg-[#047857] text-white font-medium text-[13px] rounded flex items-center gap-1.5 transition-colors">
                <RefreshCw size={14} /> Khôi phục
              </button>
            )}
            {ncc.trang_thai === "DANG_HOP_TAC" && (
              <button onClick={() => setShowPauseModal(true)}
                title="Hành động này cần được xác nhận"
                className="py-1.5 px-3 bg-white border border-[#f59e0b] hover:bg-[#fef9c3] text-[#92400e] text-[13px] rounded flex items-center gap-1.5 transition-colors">
                <PauseCircle size={14} /> Tạm dừng hợp tác
              </button>
            )}
            {ncc.trang_thai !== "NGUNG" && (
              <button onClick={() => setShowStopModal(true)}
                title="Hành động này cần được xác nhận"
                className="ml-auto py-1.5 px-3 bg-white border border-[#ef4444] hover:bg-[#fee2e2] text-[#991b1b] text-[13px] rounded flex items-center gap-1.5 transition-colors">
                <XCircle size={14} /> Ngừng hợp tác
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Tạm dừng hợp tác */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-amber-700 mb-2">Xác nhận Tạm dừng hợp tác</h3>
            <p className="text-gray-600 text-sm mb-4">Nhập lý do tạm dừng hợp tác để lưu vào ghi chú nội bộ:</p>
            <textarea rows={3} value={stopReason} onChange={(e) => setStopReason(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 mb-4" placeholder="VD: NCC đang sửa xưởng..." />
            <div className="flex gap-3">
              <button onClick={() => { setShowPauseModal(false); setStopReason(""); }} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50">Hủy</button>
              <button onClick={() => handleStatusChange("TAM_DUNG")}
                className="flex-1 py-2.5 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700">
                Tạm dừng hợp tác
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ngừng hợp tác */}
      {showStopModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-red-700 mb-2">Xác nhận Ngừng hợp tác</h3>
            {stopWarning && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
                <strong>⚠️ Cảnh báo:</strong> {stopWarning.message}
              </div>
            )}
            <p className="text-gray-600 text-sm mb-4">Nhập lý do ngừng hợp tác để lưu vào ghi chú nội bộ:</p>
            <textarea rows={3} value={stopReason} onChange={(e) => setStopReason(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400 mb-4" placeholder="VD: Chất lượng không đồng đều, giao hàng hay trễ..." />
            <div className="flex gap-3">
              <button onClick={() => { setShowStopModal(false); setStopWarning(null); setStopReason(""); }} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50">Hủy</button>
              <button onClick={() => handleStatusChange("NGUNG", !!stopWarning)}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">
                {stopWarning ? "Xác nhận dù còn nợ" : "Ngừng hợp tác"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
