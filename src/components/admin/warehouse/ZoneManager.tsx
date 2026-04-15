"use client";

import React, { useState } from "react";
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronRight,
  FolderOpen, Layers, TriangleAlert, X, Check, AlertCircle,
} from "lucide-react";

interface ZoneTree {
  name: string;
  totalCapacity: number;
  totalCurrent: number;
  expiringSoon: number;
  days: {
    name: string;
    shelves: {
      name: string;
      floors: {
        id: number;
        tang: string;
        capacity: number;
        current: number;
        expiring: number;
        suc_chua_toi_da: number | null;
        ghi_chu: string | null;
      }[];
    }[];
  }[];
}

interface Props {
  zones: ZoneTree[];
  onRefresh: () => void;
}

export default function ZoneManager({ zones, onRefresh }: Props) {
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    zoneName: string; zoneId: number; stock: any[]
  } | null>(null);
  const [transferTarget, setTransferTarget] = useState("");
  const [editModal, setEditModal] = useState<{ id: number; capacity: number; note: string } | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [form, setForm] = useState({
    ten_khu: "", so_day: "2", so_ke: "3", so_tang: "2", suc_chua_toi_da: "100",
  });

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleZone = (name: string) => {
    setExpandedZones((p) => ({ ...p, [name]: !p[name] }));
  };

  // ── Thêm khu vực ──
  const handleAdd = async () => {
    if (!form.ten_khu.trim()) return showToast("error", "Vui lòng nhập tên khu");
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/warehouse/zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ten_khu: form.ten_khu.trim(),
          so_day: Number(form.so_day),
          so_ke: Number(form.so_ke),
          so_tang: Number(form.so_tang),
          suc_chua_toi_da: Number(form.suc_chua_toi_da),
        }),
      });
      const data = await res.json();
      if (!res.ok) return showToast("error", data.error || "Lỗi tạo khu");
      showToast("success", data.message);
      setForm({ ten_khu: "", so_day: "2", so_ke: "3", so_tang: "2", suc_chua_toi_da: "100" });
      setShowAddForm(false);
      onRefresh();
    } catch {
      showToast("error", "Lỗi kết nối máy chủ");
    } finally {
      setAddLoading(false);
    }
  };

  // ── Xóa khu vực ──
  const handleDelete = async (zoneId: number, zoneName: string, transferId?: number) => {
    try {
      const body: any = {};
      if (transferId) body.ma_vi_tri_dich = transferId;
      const res = await fetch(`/api/admin/warehouse/zones/${zoneId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.status === 409) {
        // Có hàng tồn → mở modal chọn khu đích
        setDeleteModal({ zoneName, zoneId, stock: data.stock });
        return;
      }
      if (!res.ok) return showToast("error", data.error || "Lỗi xóa");
      showToast("success", data.message);
      setDeleteModal(null);
      onRefresh();
    } catch {
      showToast("error", "Lỗi kết nối máy chủ");
    }
  };

  // ── Sửa vị trí ──
  const handleEdit = async () => {
    if (!editModal) return;
    try {
      const res = await fetch(`/api/admin/warehouse/zones/${editModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suc_chua_toi_da: editModal.capacity, ghi_chu: editModal.note }),
      });
      const data = await res.json();
      if (!res.ok) return showToast("error", data.error || "Lỗi cập nhật");
      showToast("success", "Đã cập nhật vị trí");
      setEditModal(null);
      onRefresh();
    } catch {
      showToast("error", "Lỗi kết nối");
    }
  };

  // Lấy id đại diện của mỗi zone (floor đầu tiên)
  const getZoneRepId = (zone: ZoneTree): number | null => {
    return zone.days?.[0]?.shelves?.[0]?.floors?.[0]?.id ?? null;
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className={`absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium transition-all animate-in slide-in-from-top-2 ${toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {toast.type === "success" ? <Check size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Tiêu đề panel */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen size={18} className="text-[#1D9E75]" />
          <span className="font-bold text-gray-800 text-sm">Quản lý khu vực</span>
        </div>
        <button
          onClick={() => setShowAddForm((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1D9E75] text-white text-xs font-semibold rounded-lg hover:bg-[#158a63] transition-colors"
        >
          <Plus size={14} /> Thêm khu
        </button>
      </div>

      {/* Form thêm khu vực */}
      {showAddForm && (
        <div className="px-5 py-4 border-b border-gray-100 bg-green-50/50 space-y-3">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tạo khu vực mới</p>
          <input
            value={form.ten_khu}
            onChange={(e) => setForm((p) => ({ ...p, ten_khu: e.target.value }))}
            placeholder="Tên khu (VD: Khu A)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]/20 bg-white"
          />
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "so_day", label: "Số dãy" },
              { key: "so_ke", label: "Số kệ" },
              { key: "so_tang", label: "Số tầng" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-[10px] text-gray-500 font-medium block mb-1">{label}</label>
                <input
                  type="number"
                  min={1}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1D9E75] bg-white text-center font-bold"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-medium block mb-1">Sức chứa/ô (thùng)</label>
            <input
              type="number"
              min={1}
              value={form.suc_chua_toi_da}
              onChange={(e) => setForm((p) => ({ ...p, suc_chua_toi_da: e.target.value }))}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1D9E75] bg-white"
            />
          </div>
          <div className="text-xs text-gray-400 bg-white rounded-lg px-3 py-2 border border-gray-100">
            Sẽ tạo: <strong className="text-gray-700">{Number(form.so_day) * Number(form.so_ke) * Number(form.so_tang)}</strong> ô vị trí •
            Sức chứa tổng: <strong className="text-[#1D9E75]">{Number(form.so_day) * Number(form.so_ke) * Number(form.so_tang) * Number(form.suc_chua_toi_da)}</strong> thùng
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={addLoading} className="flex-1 py-2 bg-[#1D9E75] text-white text-sm font-semibold rounded-lg hover:bg-[#158a63] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
              {addLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={14} />}
              Tạo khu
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* Danh sách cây khu vực */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {zones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <FolderOpen size={32} className="opacity-30 mb-2" />
            <p className="text-xs">Chưa có khu vực nào</p>
          </div>
        ) : (
          zones.map((zone) => {
            const percent = zone.totalCapacity > 0
              ? Math.round((zone.totalCurrent / zone.totalCapacity) * 100)
              : 0;
            const color = percent > 90 ? "text-red-600" : percent > 75 ? "text-amber-600" : "text-[#1D9E75]";
            const repId = getZoneRepId(zone);
            const isOpen = expandedZones[zone.name];

            return (
              <div key={zone.name}>
                {/* Dòng tên khu */}
                <div className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <button onClick={() => toggleZone(zone.name)} className="flex-1 flex items-center gap-2 min-w-0 text-left">
                    <span className="text-gray-400 transition-transform duration-200" style={{ display: "inline-flex", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>
                      <ChevronRight size={14} />
                    </span>
                    <FolderOpen size={14} className="text-[#1D9E75] shrink-0" />
                    <span className="font-semibold text-gray-800 text-sm truncate">{zone.name}</span>
                    <span className={`text-xs font-bold ml-auto shrink-0 ${color}`}>{percent}%</span>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    {zone.expiringSoon > 0 && (
                      <span title={`${zone.expiringSoon} lô sắp hết hạn`}>
                        <TriangleAlert size={13} className="text-amber-500" />
                      </span>
                    )}
                    {repId && (
                      <button
                        onClick={() => handleDelete(repId, zone.name)}
                        className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Xóa khu"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Nội dung con (dãy → kệ → tầng) */}
                {isOpen && (
                  <div className="bg-gray-50/50 border-t border-gray-100">
                    {zone.days.map((day) => (
                      <div key={day.name} className="pl-8 py-1">
                        <div className="flex items-center gap-2 py-1.5 text-xs text-gray-500 font-medium">
                          <Layers size={12} className="text-blue-400" />
                          {day.name}
                        </div>
                        {day.shelves.map((shelf) => (
                          <div key={shelf.name} className="pl-4">
                            <div className="text-[11px] text-gray-400 py-1 flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-300 rounded-full" />
                              Kệ {shelf.name}
                            </div>
                            {shelf.floors.map((floor) => {
                              const fp = floor.capacity > 0 ? Math.round((floor.current / floor.capacity) * 100) : 0;
                              const fc = fp > 90 ? "text-red-500" : fp > 75 ? "text-amber-500" : "text-green-500";
                              return (
                                <div key={floor.id} className="pl-4 flex items-center justify-between py-1 group">
                                  <span className="text-[11px] text-gray-400">{floor.tang}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold ${fc}`}>{fp}%</span>
                                    <button
                                      onClick={() => setEditModal({ id: floor.id, capacity: floor.suc_chua_toi_da ?? 100, note: floor.ghi_chu ?? "" })}
                                      className="p-0.5 text-gray-200 group-hover:text-blue-400 hover:bg-blue-50 rounded transition-colors"
                                    >
                                      <Pencil size={11} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal xác nhận xóa khi có hàng */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteModal(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-800 text-sm">Khu còn hàng tồn!</h3>
                <p className="text-red-600 text-xs">Phải chuyển hàng trước khi xóa "{deleteModal.zoneName}"</p>
              </div>
              <button onClick={() => setDeleteModal(null)} className="ml-auto p-1 hover:bg-red-100 rounded-lg"><X size={16} className="text-red-500" /></button>
            </div>
            <div className="px-6 py-4 max-h-48 overflow-y-auto space-y-2">
              {deleteModal.stock.map((s: any, i: number) => (
                <div key={i} className="flex justify-between text-xs py-1 border-b border-gray-50">
                  <span className="text-gray-700 truncate">{s.san_pham}</span>
                  <span className="text-gray-500 shrink-0 ml-2">{s.so_luong?.toLocaleString()} thùng</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 space-y-3">
              <label className="text-xs font-semibold text-gray-600">Chọn vị trí đích để chuyển hàng:</label>
              <select value={transferTarget} onChange={(e) => setTransferTarget(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1D9E75]">
                <option value="">-- Chọn vị trí đích --</option>
                {zones.filter((z) => z.name !== deleteModal.zoneName).flatMap((z) =>
                  z.days.flatMap((d) =>
                    d.shelves.flatMap((s) =>
                      s.floors.map((f) => (
                        <option key={f.id} value={f.id}>
                          {z.name} / {d.name} / {s.name} / {f.tang}
                        </option>
                      ))
                    )
                  )
                )}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(deleteModal.zoneId, deleteModal.zoneName, transferTarget ? Number(transferTarget) : undefined)}
                  disabled={!transferTarget}
                  className="flex-1 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-40 transition-colors"
                >
                  Chuyển & Xóa khu
                </button>
                <button onClick={() => setDeleteModal(null)} className="px-4 py-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                  Huỷ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal sửa vị trí */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditModal(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="font-bold text-gray-800 text-sm flex items-center gap-2"><Pencil size={15} className="text-[#1D9E75]" /> Chỉnh sửa ô vị trí #{editModal.id}</span>
              <button onClick={() => setEditModal(null)}><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Sức chứa tối đa (thùng)</label>
                <input type="number" min={1} value={editModal.capacity} onChange={(e) => setEditModal((p) => p ? { ...p, capacity: Number(e.target.value) } : p)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1D9E75]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Ghi chú</label>
                <input value={editModal.note} onChange={(e) => setEditModal((p) => p ? { ...p, note: e.target.value } : p)}
                  placeholder="Ghi chú về vị trí..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1D9E75]" />
              </div>
            </div>
            <div className="px-6 pb-4 flex gap-2">
              <button onClick={handleEdit} className="flex-1 py-2 bg-[#1D9E75] text-white text-sm font-semibold rounded-lg hover:bg-[#158a63] transition-colors">Lưu thay đổi</button>
              <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100">Huỷ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
