"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FileText, Plus, X, ExternalLink, AlertTriangle } from "lucide-react";

interface HopDong {
  id: number;
  so_hop_dong?: string;
  loai_hop_dong?: string;
  ngay_ky?: string;
  ngay_het_han?: string;
  gia_tri_hop_dong?: number;
  trang_thai?: string;
  file_hop_dong?: string;
  ghi_chu?: string;
}

const LOAI_HD_LABELS: Record<string, string> = {
  CHINH_THUC: "Hợp đồng chính thức",
  THOA_THUAN_MIENG: "Thỏa thuận miệng",
  EMAIL: "Qua Email",
};

function isExpiringSoon(ngayHetHan?: string): boolean {
  if (!ngayHetHan) return false;
  const diff = new Date(ngayHetHan).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

export default function SupplierContractsTab({ nccId }: { nccId: number }) {
  const [hopDongs, setHopDongs] = useState<HopDong[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ so_hop_dong: "", loai_hop_dong: "CHINH_THUC", ngay_ky: "", ngay_het_han: "", gia_tri_hop_dong: "", dieu_khoan_phat: "", file_hop_dong: "", ghi_chu: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/admin/ncc/${nccId}/hop-dong`);
    const data = await res.json();
    setHopDongs(data);
    setLoading(false);
  }, [nccId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/admin/ncc/${nccId}/hop-dong`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, gia_tri_hop_dong: form.gia_tri_hop_dong ? Number(form.gia_tri_hop_dong) : null }),
    });
    setSaving(false);
    setShowForm(false);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-800">Hợp đồng & Tài liệu</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg">
            <Plus size={16} /> Thêm hợp đồng
          </button>
        </div>

        {/* Form tạo hợp đồng */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 space-y-4">
            <h3 className="font-bold text-blue-800">Tạo hợp đồng / Thỏa thuận mới</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Số hợp đồng</label>
                <input type="text" value={form.so_hop_dong} onChange={(e) => setForm({ ...form, so_hop_dong: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="VD: HD-2026-001" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Loại hợp đồng</label>
                <select value={form.loai_hop_dong} onChange={(e) => setForm({ ...form, loai_hop_dong: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="CHINH_THUC">Hợp đồng chính thức</option>
                  <option value="THOA_THUAN_MIENG">Thỏa thuận miệng</option>
                  <option value="EMAIL">Qua Email</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ngày ký</label>
                <input type="date" value={form.ngay_ky} onChange={(e) => setForm({ ...form, ngay_ky: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ngày hết hạn (để trống nếu không thời hạn)</label>
                <input type="date" value={form.ngay_het_han} onChange={(e) => setForm({ ...form, ngay_het_han: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Giá trị cam kết (đ)</label>
                <input type="number" value={form.gia_tri_hop_dong} onChange={(e) => setForm({ ...form, gia_tri_hop_dong: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  File đính kèm (S3 URL — Upload thủ công trước)
                </label>
                <input type="url" value={form.file_hop_dong} onChange={(e) => setForm({ ...form, file_hop_dong: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://s3.amazonaws.com/..." />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Điều khoản phạt vi phạm</label>
                <textarea rows={2} value={form.dieu_khoan_phat} onChange={(e) => setForm({ ...form, dieu_khoan_phat: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Hủy</button>
              <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">
                {saving ? "Đang lưu..." : "Tạo hợp đồng"}
              </button>
            </div>
          </form>
        )}

        {/* Danh sách hợp đồng */}
        {loading ? (
          <div className="text-center py-10 text-gray-400">Đang tải...</div>
        ) : hopDongs.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FileText size={36} className="mx-auto mb-2 opacity-30" />
            <p>Chưa có hợp đồng nào được lưu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {hopDongs.map((hd) => {
              const soonExpire = isExpiringSoon(hd.ngay_het_han);
              return (
                <div key={hd.id} className={`border rounded-xl p-4 flex items-center justify-between gap-4 ${soonExpire ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-gray-50/30"}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-800 text-sm">{hd.so_hop_dong || "(Không số)"}</h3>
                      <span className="text-[11px] bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600">
                        {LOAI_HD_LABELS[hd.loai_hop_dong ?? ""] ?? hd.loai_hop_dong}
                      </span>
                      {soonExpire && (
                        <span className="text-[11px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <AlertTriangle size={10} /> Sắp hết hạn
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      {hd.ngay_ky && <span>Ký: {new Date(hd.ngay_ky).toLocaleDateString("vi-VN")}</span>}
                      {hd.ngay_het_han
                        ? <span className={soonExpire ? "text-amber-600 font-medium" : ""}>Hết hạn: {new Date(hd.ngay_het_han).toLocaleDateString("vi-VN")}</span>
                        : <span>Không thời hạn</span>}
                      {hd.gia_tri_hop_dong && <span>Giá trị: {Number(hd.gia_tri_hop_dong).toLocaleString("vi-VN")}đ</span>}
                    </div>
                  </div>
                  {hd.file_hop_dong && (
                    <a href={hd.file_hop_dong} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium border border-blue-200 bg-white px-3 py-1.5 rounded-lg">
                      <ExternalLink size={12} /> Xem file
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
