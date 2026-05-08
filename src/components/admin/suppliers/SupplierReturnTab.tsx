"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  PackageX,
  Plus,
  X,
  AlertTriangle,
  Package,
  ChevronDown,
  RotateCcw,
  Info,
} from "lucide-react";

interface PhieuTra {
  id: number;
  tong_tien_hoan_du_kien?: number;
  trang_thai?: string;
  ngay_tao: string;
  phieu_xuat_kho?: {
    id: number;
    ly_do_xuat?: string;
    chi_tiet_phieu_xuat?: {
      id: number;
      so_luong_thuc_xuat?: number;
      bien_the_san_pham?: { ten_bien_the?: string; san_pham?: { ten_san_pham?: string } };
    }[];
  }[];
}

interface LoHang {
  id: number;
  ma_lo_hang: string;
  han_su_dung: string;
  bien_the_san_pham?: { ten_bien_the?: string; san_pham?: { ten_san_pham?: string } };
  kien_hang_chi_tiet?: { id: number; trang_thai: string }[];
}

const TRANG_THAI_LABELS: Record<string, { label: string; cls: string }> = {
  HOAN_THANH: { label: "Hoàn thành", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  DANG_XU_LY: { label: "Đang xử lý", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  HUY: { label: "Đã hủy", cls: "bg-slate-100 text-slate-500 border-slate-200" },
};

export default function SupplierReturnTab({ nccId }: { nccId: number }) {
  const [phieuTraList, setPhieuTraList] = useState<PhieuTra[]>([]);
  const [congNo, setCongNo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [loHangList, setLoHangList] = useState<LoHang[]>([]);
  const [loadingLo, setLoadingLo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    ma_lo_hang: "",
    so_kien_tra: "",
    don_gia_tra: "",
    ly_do: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/ncc/${nccId}/tra-hang`);
    const data = await res.json();
    setPhieuTraList(data.phieu_tra_list ?? []);
    setCongNo(Number(data.cong_no_hien_tai ?? 0));
    setLoading(false);
  }, [nccId]);

  const fetchLoHang = useCallback(async () => {
    setLoadingLo(true);
    // Lấy detail NCC để có danh sách lô hàng thuộc NCC này
    const res = await fetch(`/api/admin/ncc/${nccId}`);
    const data = await res.json();
    // Lấy các lô hàng có kiện đang TRONG_KHO
    const phieuNhapList = data.phieu_nhap_kho ?? [];
    const loRes = await Promise.all(
      phieuNhapList.slice(0, 10).map((p: any) =>
        fetch(`/api/admin/warehouse/import/${p.id}/review`)
          .then((r) => r.json())
          .catch(() => null)
      )
    );
    // Trực tiếp query lô hàng có trong kho
    const loHangRes = await fetch(`/api/admin/ncc/${nccId}/lo-hang-trong-kho`).catch(() => null);
    if (loHangRes?.ok) {
      const loData = await loHangRes.json();
      setLoHangList(loData.lo_hang ?? []);
    }
    setLoadingLo(false);
  }, [nccId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = () => {
    setShowModal(true);
    setError("");
    setForm({ ma_lo_hang: "", so_kien_tra: "", don_gia_tra: "", ly_do: "" });
    fetchLoHang();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ma_lo_hang || !form.so_kien_tra || !form.don_gia_tra || !form.ly_do) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/ncc/${nccId}/tra-hang`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ma_lo_hang: Number(form.ma_lo_hang),
        so_kien_tra: Number(form.so_kien_tra),
        don_gia_tra: Number(form.don_gia_tra),
        ly_do: form.ly_do,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Đã có lỗi xảy ra");
      return;
    }
    setShowModal(false);
    fetchData();
  };

  const loHangSelected = loHangList.find((l) => l.id === Number(form.ma_lo_hang));
  const soKienTrongKho =
    loHangSelected?.kien_hang_chi_tiet?.filter((k) => k.trang_thai === "TRONG_KHO").length ?? 0;
  const tongTienDuKien =
    form.so_kien_tra && form.don_gia_tra
      ? Number(form.so_kien_tra) * Number(form.don_gia_tra)
      : 0;

  return (
    <div className="space-y-6">
      {/* Banner tổng quan */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-rose-50 text-rose-500">
            <PackageX size={22} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Công nợ hiện tại
            </p>
            <p className={`text-2xl font-bold mt-0.5 ${congNo > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {congNo > 0 ? `${congNo.toLocaleString("vi-VN")}đ` : "Sạch nợ"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500">Tổng phiếu trả</p>
            <p className="text-xl font-bold text-slate-900">{phieuTraList.length}</p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-medium text-[13px] shadow-sm transition-colors"
          >
            <RotateCcw size={15} /> Tạo phiếu trả hàng
          </button>
        </div>
      </div>

      {/* Hướng dẫn nghiệp vụ */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
        <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-[13px] text-blue-700 leading-relaxed">
          <strong>Luồng trả hàng:</strong> Phiếu trả hàng sẽ tự động xuất kiện hàng ra khỏi kho,
          đồng bộ tồn kho, và ghi giao dịch{" "}
          <span className="font-semibold">Trả hàng / Hoàn tiền</span> để
          giảm trừ công nợ NCC tương ứng.
        </p>
      </div>

      {/* Danh sách phiếu trả */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-800 mb-5">Lịch sử trả hàng</h2>

        {loading ? (
          <div className="text-center py-10 text-slate-400">Đang tải...</div>
        ) : phieuTraList.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            <PackageX size={40} className="mx-auto mb-3 opacity-25" />
            <p className="font-medium">Chưa có phiếu trả hàng nào</p>
            <p className="text-sm mt-1">Tạo phiếu trả khi hàng nhận bị lỗi, sai quy cách hoặc dư số lượng</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Mã phiếu</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Ngày tạo</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Hàng trả</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">Tiền hoàn</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {phieuTraList.map((pt) => {
                  const ttCfg = TRANG_THAI_LABELS[pt.trang_thai ?? ""] ?? {
                    label: pt.trang_thai,
                    cls: "bg-slate-100 text-slate-500 border-slate-200",
                  };
                  const chiTiet = pt.phieu_xuat_kho?.[0]?.chi_tiet_phieu_xuat?.[0];
                  const tenSp =
                    chiTiet?.bien_the_san_pham?.ten_bien_the ||
                    chiTiet?.bien_the_san_pham?.san_pham?.ten_san_pham ||
                    "—";
                  return (
                    <tr key={pt.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        #TRA-{pt.id}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(pt.ngay_tao).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-slate-400" />
                          <span className="text-slate-700">{tenSp}</span>
                          {chiTiet?.so_luong_thuc_xuat && (
                            <span className="text-slate-400 text-xs">
                              × {chiTiet.so_luong_thuc_xuat} kiện
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-rose-600">
                        {Number(pt.tong_tien_hoan_du_kien ?? 0).toLocaleString("vi-VN")}đ
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${ttCfg.cls}`}>
                          {ttCfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL TẠO PHIẾU TRẢ ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <RotateCcw size={18} className="text-rose-600" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900">Tạo phiếu trả hàng NCC</h3>
                  <p className="text-xs text-slate-500">Hàng xuất trả → Tồn kho giảm → Công nợ giảm</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)}>
                <X size={20} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Chọn lô hàng */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lô hàng cần trả *
                </label>
                {loadingLo ? (
                  <div className="text-sm text-slate-400 py-2">Đang tải danh sách lô hàng...</div>
                ) : loHangList.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 flex items-center gap-2">
                    <AlertTriangle size={14} />
                    Không tìm thấy lô hàng nào đang trong kho của NCC này
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      required
                      value={form.ma_lo_hang}
                      onChange={(e) => setForm({ ...form, ma_lo_hang: e.target.value })}
                      className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                    >
                      <option value="">-- Chọn lô hàng --</option>
                      {loHangList.map((lo) => {
                        const soKien = lo.kien_hang_chi_tiet?.filter(
                          (k) => k.trang_thai === "TRONG_KHO"
                        ).length ?? 0;
                        const tenSp =
                          lo.bien_the_san_pham?.ten_bien_the ||
                          lo.bien_the_san_pham?.san_pham?.ten_san_pham ||
                          "Không rõ SP";
                        return (
                          <option key={lo.id} value={lo.id}>
                            {lo.ma_lo_hang} — {tenSp} ({soKien} kiện trong kho)
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                )}
                {loHangSelected && (
                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                    <Package size={11} />
                    Còn <strong>{soKienTrongKho}</strong> kiện trong kho •
                    HSD: {new Date(loHangSelected.han_su_dung).toLocaleDateString("vi-VN")}
                  </p>
                )}
              </div>

              {/* Số kiện trả */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Số kiện trả *
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  max={soKienTrongKho || undefined}
                  value={form.so_kien_tra}
                  onChange={(e) => setForm({ ...form, so_kien_tra: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400"
                  placeholder={`Tối đa ${soKienTrongKho} kiện`}
                />
              </div>

              {/* Đơn giá hoàn */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Đơn giá hoàn trả / kiện (đ) *
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  value={form.don_gia_tra}
                  onChange={(e) => setForm({ ...form, don_gia_tra: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400"
                  placeholder="VD: 250000"
                />
              </div>

              {/* Preview tổng tiền */}
              {tongTienDuKien > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-rose-50 border border-rose-100 px-4 py-2.5">
                  <span className="text-sm text-rose-700 font-medium">Tổng tiền hoàn dự kiến</span>
                  <span className="text-base font-bold text-rose-700">
                    {tongTienDuKien.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}

              {/* Lý do */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lý do trả hàng *
                </label>
                <textarea
                  required
                  rows={2}
                  value={form.ly_do}
                  onChange={(e) => setForm({ ...form, ly_do: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                  placeholder="VD: Hàng bị dập, không đúng quy cách, số lượng dư..."
                />
              </div>

              {/* Cảnh báo */}
              <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5">
                <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Sau khi xác nhận, hệ thống sẽ tự động xuất kiện hàng khỏi kho và ghi giảm công nợ NCC.
                  Thao tác này <strong>không thể hoàn tác</strong>.
                </p>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving || loHangList.length === 0}
                  className="flex-1 py-2.5 bg-rose-600 text-white text-[13px] font-medium rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-60"
                >
                  {saving ? "Đang xử lý..." : "Xác nhận trả hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
