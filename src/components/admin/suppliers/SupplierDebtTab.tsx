"use client";

import React, { useEffect, useState, useCallback } from "react";
import { TrendingDown, Plus, X } from "lucide-react";

interface GiaoDich {
  id: number;
  loai_giao_dich?: string;
  so_tien?: number;
  so_du_sau?: number;
  phuong_thuc?: string;
  ma_giao_dich?: string;
  ghi_chu?: string;
  ngay_giao_dich: string;
}

const LOAI_LABELS: Record<string, { label: string; color: string }> = {
  PHAT_SINH_NO: { label: "Phát sinh nợ", color: "text-red-600" },
  THANH_TOAN: { label: "Thanh toán", color: "text-green-600" },
  TRA_HANG_HOAN_TIEN: { label: "Trả hàng / Hoàn tiền", color: "text-blue-600" },
};

export default function SupplierDebtTab({ nccId }: { nccId: number }) {
  const [lichSu, setLichSu] = useState<GiaoDich[]>([]);
  const [congNo, setCongNo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ so_tien: "", phuong_thuc: "CHUYEN_KHOAN", ma_giao_dich: "", ghi_chu: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/admin/ncc/${nccId}/thanh-toan`);
    const data = await res.json();
    setCongNo(Number(data.cong_no_hien_tai ?? 0));
    setLichSu(data.lich_su ?? []);
    setLoading(false);
  }, [nccId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/admin/ncc/${nccId}/thanh-toan`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, so_tien: Number(form.so_tien), nguoi_thuc_hien_id: 1 }),
    });
    setSaving(false);
    setShowModal(false);
    setForm({ so_tien: "", phuong_thuc: "CHUYEN_KHOAN", ma_giao_dich: "", ghi_chu: "" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Banner công nợ */}
      <div className={`rounded-2xl p-6 flex items-center justify-between ${congNo > 0 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
        <div className="flex items-center gap-4">
          <TrendingDown size={40} className={congNo > 0 ? "text-red-400" : "text-green-400"} />
          <div>
            <p className="text-sm font-medium text-gray-600">Công nợ hiện tại đang nợ NCC</p>
            <p className={`text-4xl font-bold mt-1 ${congNo > 0 ? "text-red-600" : "text-green-600"}`}>
              {congNo > 0 ? `${congNo.toLocaleString("vi-VN")}đ` : "Đã thanh toán hết"}
            </p>
          </div>
        </div>
        {congNo > 0 && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-sm">
            <Plus size={18} /> Ghi nhận thanh toán
          </button>
        )}
      </div>

      {/* Lịch sử giao dịch */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">Lịch sử giao dịch</h2>
        {loading ? (
          <div className="text-center py-10 text-gray-400">Đang tải...</div>
        ) : lichSu.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Chưa có giao dịch nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Ngày</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Loại</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Số tiền</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Số dư sau</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Phương thức</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Mã GD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lichSu.map((gd) => {
                  const loai = LOAI_LABELS[gd.loai_giao_dich ?? ""] ?? { label: gd.loai_giao_dich, color: "text-gray-600" };
                  return (
                    <tr key={gd.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-600">{new Date(gd.ngay_giao_dich).toLocaleDateString("vi-VN")}</td>
                      <td className={`px-4 py-3 font-medium ${loai.color}`}>{loai.label}</td>
                      <td className="px-4 py-3 text-right font-bold">{Number(gd.so_tien ?? 0).toLocaleString("vi-VN")}đ</td>
                      <td className={`px-4 py-3 text-right font-bold ${Number(gd.so_du_sau) > 0 ? "text-red-600" : "text-green-600"}`}>
                        {Number(gd.so_du_sau ?? 0).toLocaleString("vi-VN")}đ
                      </td>
                      <td className="px-4 py-3 text-gray-600">{gd.phuong_thuc ?? "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{gd.ma_giao_dich || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal thanh toán */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Ghi nhận Thanh toán</h3>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền thanh toán *</label>
                <input required type="number" value={form.so_tien} onChange={(e) => setForm({ ...form, so_tien: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="VD: 5000000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức</label>
                <select value={form.phuong_thuc} onChange={(e) => setForm({ ...form, phuong_thuc: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400">
                  <option value="CHUYEN_KHOAN">Chuyển khoản</option>
                  <option value="TIEN_MAT">Tiền mặt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã giao dịch (nếu có)</label>
                <input type="text" value={form.ma_giao_dich} onChange={(e) => setForm({ ...form, ma_giao_dich: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Mã chuyển khoản từ ngân hàng" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea rows={2} value={form.ghi_chu} onChange={(e) => setForm({ ...form, ghi_chu: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Hủy</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
                  {saving ? "Đang ghi nhận..." : "Xác nhận thanh toán"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
