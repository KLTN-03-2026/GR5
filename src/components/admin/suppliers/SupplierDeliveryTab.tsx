"use client";

import React, { useState } from "react";
import { Star, AlertTriangle, CheckCircle, Upload } from "lucide-react";

interface Props {
  ncc: Record<string, unknown>;
  nccId: number;
  onRefresh: () => void;
}

interface DanhGia {
  id: number;
  ngay_danh_gia: string;
  diem_trung_binh?: number;
  co_van_de?: boolean;
  mo_ta_van_de?: string;
  diem_chat_luong?: number;
  diem_dung_so_luong?: number;
  diem_dung_han?: number;
  diem_bao_goi?: number;
  phieu_nhap_kho?: { id: number; ngay_tao: string; tong_tien?: number };
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange?.(s)}
          className={onChange ? "cursor-pointer" : "cursor-default"}>
          <Star size={18} fill={s <= value ? "#f59e0b" : "none"} className={s <= value ? "text-amber-400" : "text-gray-300"} />
        </button>
      ))}
    </div>
  );
}

export default function SupplierDeliveryTab({ ncc, nccId, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ma_phieu_nhap: 0, diem_chat_luong: 4, diem_dung_so_luong: 4, diem_dung_han: 4, diem_bao_goi: 4, co_van_de: false, mo_ta_van_de: "", nguoi_danh_gia_id: 1 });
  const [saving, setSaving] = useState(false);

  const danhGias: DanhGia[] = (ncc.danh_gia_giao_hang_ncc as DanhGia[]) ?? [];
  const chiSo = ncc.chi_so as Record<string, number> | undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ma_phieu_nhap) return alert("Vui lòng nhập mã phiếu nhập kho");
    setSaving(true);
    await fetch(`/api/admin/ncc/${nccId}/danh-gia`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    setSaving(false);
    setShowForm(false);
    onRefresh();
  };

  const ChiSoCard = ({ label, value, suffix = "%" }: { label: string; value: number; suffix?: string }) => (
    <div className="bg-gray-50 rounded-xl p-4 text-center">
      <div className={`text-2xl font-bold ${value >= 80 ? "text-green-600" : value >= 60 ? "text-amber-500" : "text-red-500"}`}>
        {value}{suffix}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Chỉ số tổng quan */}
      {chiSo && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">Chỉ số tổng hợp</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ChiSoCard label="Tỉ lệ giao đúng hạn" value={chiSo.ti_le_dung_han} />
            <ChiSoCard label="Tỉ lệ giao đủ số lượng" value={chiSo.ti_le_du_so_luong} />
            <ChiSoCard label="Điểm chất lượng TB (3 tháng)" value={chiSo.diem_tb_3_thang} suffix="/5" />
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${chiSo.so_lan_van_de === 0 ? "text-green-600" : chiSo.so_lan_van_de < 3 ? "text-amber-500" : "text-red-500"}`}>
                {chiSo.so_lan_van_de}
              </div>
              <div className="text-xs text-gray-500 mt-1">Lần phát sinh vấn đề</div>
              {chiSo.so_lan_van_de >= 3 && (
                <div className="mt-1 text-[10px] text-red-600 font-bold flex items-center justify-center gap-1">
                  <AlertTriangle size={10} /> Cân nhắc tìm NCC thay thế
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lịch sử đánh giá */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-800">Lịch sử giao hàng & Đánh giá</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg">
            + Thêm đánh giá
          </button>
        </div>

        {/* Form đánh giá nhanh */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
            <h3 className="font-bold text-blue-800 mb-4">Đánh giá lần giao hàng</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mã phiếu nhập *</label>
                <input type="number" required value={form.ma_phieu_nhap || ""} onChange={(e) => setForm({ ...form, ma_phieu_nhap: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập ID phiếu nhập kho" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="co-van-de" checked={form.co_van_de} onChange={(e) => setForm({ ...form, co_van_de: e.target.checked })} />
                <label htmlFor="co-van-de" className="text-sm font-medium text-red-700 flex items-center gap-1">
                  <AlertTriangle size={14} /> Có phát sinh vấn đề
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { key: "diem_chat_luong", label: "Chất lượng hàng hóa" },
                { key: "diem_dung_so_luong", label: "Giao đúng số lượng" },
                { key: "diem_dung_han", label: "Giao đúng hẹn" },
                { key: "diem_bao_goi", label: "Bao gói đóng thùng" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-2">{label}</label>
                  <StarRating value={(form as unknown as Record<string, number>)[key]} onChange={(v) => setForm({ ...form, [key]: v })} />
                </div>
              ))}
            </div>
            {form.co_van_de && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả vấn đề & Hướng xử lý</label>
                <textarea rows={2} value={form.mo_ta_van_de} onChange={(e) => setForm({ ...form, mo_ta_van_de: e.target.value })}
                  className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400" />
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Upload size={11} /> Upload ảnh minh chứng sẽ khả dụng khi tích hợp S3</p>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Hủy</button>
              <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">
                {saving ? "Đang lưu..." : "Lưu đánh giá"}
              </button>
            </div>
          </form>
        )}

        {danhGias.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <CheckCircle size={36} className="mx-auto mb-2 opacity-30" />
            <p>Chưa có lần giao hàng nào được đánh giá</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Ngày đánh giá</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Phiếu nhập</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Điểm TB</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Vấn đề</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {danhGias.map((dg) => (
                  <tr key={dg.id} className={`hover:bg-gray-50/50 ${dg.co_van_de ? "bg-red-50/30" : ""}`}>
                    <td className="px-4 py-3 text-gray-600">{new Date(dg.ngay_danh_gia).toLocaleDateString("vi-VN")}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{dg.phieu_nhap_kho?.id ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StarRating value={Math.round(Number(dg.diem_trung_binh ?? 0))} />
                    </td>
                    <td className="px-4 py-3">
                      {dg.co_van_de ? (
                        <span className="text-red-600 text-xs font-medium flex items-center gap-1">
                          <AlertTriangle size={12} /> {dg.mo_ta_van_de || "Có vấn đề"}
                        </span>
                      ) : (
                        <span className="text-green-600 text-xs font-medium">Không có vấn đề</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
