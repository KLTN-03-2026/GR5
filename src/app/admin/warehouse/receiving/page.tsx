"use client";

import React, { useState, useEffect } from "react";
import {
  PackagePlus, Search, Eye, CheckCircle2, Clock, XCircle,
  Plus, Loader2, ChevronRight, Truck, Package, AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

type PhieuNhap = {
  id: number;
  ma_ncc: number;
  trang_thai: string;
  tong_tien: number;
  ngay_tao: string;
  ghi_chu?: string;
  nha_cung_cap?: { ten_ncc: string };
  nguoi_dung?: { ho_so_nguoi_dung?: { ho_ten: string } };
  chi_tiet_phieu_nhap: {
    id: number;
    ma_bien_the: number;
    so_luong_yeu_cau: number;
    so_luong_thuc_nhan: number;
    don_gia: number;
    bien_the_san_pham?: { ten_bien_the: string; san_pham?: { ten_san_pham: string } };
  }[];
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  CHO_GIAO_HANG: { label: "Chờ giao hàng", color: "text-amber-700", bg: "bg-amber-50", icon: Truck },
  CHO_KIEM_TRA: { label: "Chờ kiểm tra", color: "text-blue-700", bg: "bg-blue-50", icon: Search },
  DA_DUYET: { label: "Đã duyệt", color: "text-emerald-700", bg: "bg-emerald-50", icon: CheckCircle2 },
  HOAN_THANH: { label: "Hoàn thành", color: "text-green-700", bg: "bg-green-50", icon: CheckCircle2 },
  TU_CHOI: { label: "Từ chối", color: "text-red-700", bg: "bg-red-50", icon: XCircle },
};

export default function ReceivingPage() {
  const [receipts, setReceipts] = useState<PhieuNhap[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing] = useState<PhieuNhap | null>(null);

  // Form tạo phiếu nhập
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [form, setForm] = useState({ ma_ncc: "", ma_bien_the: "", so_luong_thung: "", han_su_dung: "", don_gia: "" });
  const [creating, setCreating] = useState(false);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "ALL") params.set("status", filter);
      const res = await fetch(`/api/admin/warehouse/import?${params}`);
      const data = await res.json();
      setReceipts(Array.isArray(data) ? data : data.data || []);
    } catch { toast.error("Lỗi tải danh sách phiếu nhập"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReceipts(); }, [filter]);

  useEffect(() => {
    fetch("/api/admin/ncc").then(r => r.json()).then(d => setSuppliers(Array.isArray(d) ? d : d.data || [])).catch(() => {});
    fetch("/api/admin/products?limit=200").then(r => r.json()).then(d => {
      const products = Array.isArray(d) ? d : d.data || [];
      const vts: any[] = [];
      products.forEach((p: any) => {
        (p.bien_the_san_pham || []).forEach((v: any) => {
          vts.push({ id: v.id, label: `${p.ten_san_pham} - ${v.ten_bien_the}` });
        });
      });
      setVariants(vts);
    }).catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ma_ncc || !form.ma_bien_the || !form.so_luong_thung || !form.han_su_dung || !form.don_gia) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/warehouse/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ma_ncc: Number(form.ma_ncc),
          ma_bien_the: Number(form.ma_bien_the),
          so_luong_thung: Number(form.so_luong_thung),
          han_su_dung: form.han_su_dung,
          don_gia: Number(form.don_gia),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Tạo phiếu nhập thành công!");
        setShowCreate(false);
        setForm({ ma_ncc: "", ma_bien_the: "", so_luong_thung: "", han_su_dung: "", don_gia: "" });
        fetchReceipts();
      } else {
        toast.error(data.error || data.message || "Lỗi tạo phiếu nhập");
      }
    } catch { toast.error("Lỗi kết nối!"); }
    finally { setCreating(false); }
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/warehouse/import/${id}/approve`, { method: "POST" });
      if (res.ok) { toast.success("Đã duyệt phiếu nhập!"); fetchReceipts(); setViewing(null); }
      else { const d = await res.json(); toast.error(d.error || "Lỗi duyệt"); }
    } catch { toast.error("Lỗi kết nối!"); }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/warehouse/import/${id}/reject`, { method: "POST" });
      if (res.ok) { toast.success("Đã từ chối phiếu nhập!"); fetchReceipts(); setViewing(null); }
      else { const d = await res.json(); toast.error(d.error || "Lỗi từ chối"); }
    } catch { toast.error("Lỗi kết nối!"); }
  };

  const filtered = receipts.filter(r =>
    !search || r.nha_cung_cap?.ten_ncc?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: receipts.length,
    pending: receipts.filter(r => r.trang_thai === "CHO_GIAO_HANG" || r.trang_thai === "CHO_KIEM_TRA").length,
    approved: receipts.filter(r => r.trang_thai === "DA_DUYET" || r.trang_thai === "HOAN_THANH").length,
    rejected: receipts.filter(r => r.trang_thai === "TU_CHOI").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng phiếu nhập", value: stats.total, icon: Package, color: "blue" },
          { label: "Đang chờ xử lý", value: stats.pending, icon: Clock, color: "amber" },
          { label: "Đã duyệt", value: stats.approved, icon: CheckCircle2, color: "emerald" },
          { label: "Từ chối", value: stats.rejected, icon: XCircle, color: "red" },
        ].map(s => (
          <div key={s.label} className={`bg-${s.color}-50 border border-${s.color}-100 rounded-xl p-4 flex items-center gap-4`}>
            <div className={`bg-${s.color}-100 rounded-xl p-2.5`}>
              <s.icon size={20} className={`text-${s.color}-600`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className={`text-2xl font-bold text-${s.color}-700`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-b">
          <div className="flex items-center gap-2 flex-wrap">
            {["ALL", "CHO_GIAO_HANG", "CHO_KIEM_TRA", "DA_DUYET", "HOAN_THANH", "TU_CHOI"].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === s ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {s === "ALL" ? "Tất cả" : STATUS_MAP[s]?.label || s}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition text-sm"
          >
            <Plus size={16} /> Tạo phiếu nhập
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo nhà cung cấp..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-gray-400" size={24} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <PackagePlus size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Không có phiếu nhập nào</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nhà cung cấp</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Sản phẩm</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Số lượng</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Tổng tiền</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ngày tạo</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const st = STATUS_MAP[r.trang_thai] || { label: r.trang_thai, color: "text-gray-700", bg: "bg-gray-50", icon: Package };
                  const StIcon = st.icon;
                  const totalQty = r.chi_tiet_phieu_nhap?.reduce((sum, ct) => sum + ct.so_luong_yeu_cau, 0) || 0;
                  return (
                    <tr key={r.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">#{r.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.nha_cung_cap?.ten_ncc || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.chi_tiet_phieu_nhap?.[0]?.bien_the_san_pham?.san_pham?.ten_san_pham || "—"}
                        {r.chi_tiet_phieu_nhap.length > 1 && <span className="text-xs text-gray-400 ml-1">(+{r.chi_tiet_phieu_nhap.length - 1})</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{totalQty.toLocaleString("vi-VN")}</td>
                      <td className="px-4 py-3 text-right font-medium">{Number(r.tong_tien || 0).toLocaleString("vi-VN")}đ</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${st.bg} ${st.color}`}>
                          <StIcon size={12} /> {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.ngay_tao).toLocaleDateString("vi-VN")}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setViewing(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Tạo phiếu nhập */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PackagePlus size={20} className="text-emerald-600" /> Tạo phiếu nhập kho
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp *</label>
                <select value={form.ma_ncc} onChange={e => setForm({ ...form, ma_ncc: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Chọn NCC</option>
                  {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.ten_ncc}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm (biến thể) *</label>
                <select value={form.ma_bien_the} onChange={e => setForm({ ...form, ma_bien_the: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Chọn sản phẩm</option>
                  {variants.map((v: any) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng (thùng/kiện) *</label>
                  <input type="number" min={1} value={form.so_luong_thung}
                    onChange={e => { const v = e.target.value.replace(/^-/, ''); if (v === '' || Number(v) >= 1) setForm({ ...form, so_luong_thung: v }); }}
                    onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="VD: 50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn giá (VNĐ) *</label>
                  <input type="number" min={0} value={form.don_gia}
                    onChange={e => { const v = e.target.value.replace(/^-/, ''); setForm({ ...form, don_gia: v }); }}
                    onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="VD: 50000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hạn sử dụng *</label>
                <input type="date" value={form.han_su_dung} onChange={e => setForm({ ...form, han_su_dung: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-50">Hủy</button>
                <button type="submit" disabled={creating}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Tạo phiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chi tiết phiếu nhập */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Phiếu nhập #{viewing.id}</h3>
                <p className="text-sm text-gray-500">NCC: {viewing.nha_cung_cap?.ten_ncc || "—"}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${STATUS_MAP[viewing.trang_thai]?.bg || "bg-gray-50"} ${STATUS_MAP[viewing.trang_thai]?.color || "text-gray-700"}`}>
                {STATUS_MAP[viewing.trang_thai]?.label || viewing.trang_thai}
              </span>
            </div>

            <div className="border rounded-xl overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Sản phẩm</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">Yêu cầu</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">Thực nhận</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">Đơn giá</th>
                  </tr>
                </thead>
                <tbody>
                  {viewing.chi_tiet_phieu_nhap.map(ct => (
                    <tr key={ct.id} className="border-b last:border-0">
                      <td className="px-4 py-2.5">{ct.bien_the_san_pham?.san_pham?.ten_san_pham || "—"} <span className="text-gray-400 text-xs">({ct.bien_the_san_pham?.ten_bien_the})</span></td>
                      <td className="px-4 py-2.5 text-right font-medium">{ct.so_luong_yeu_cau}</td>
                      <td className="px-4 py-2.5 text-right font-medium">{ct.so_luong_thuc_nhan || 0}</td>
                      <td className="px-4 py-2.5 text-right">{Number(ct.don_gia).toLocaleString("vi-VN")}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Ngày tạo: {new Date(viewing.ngay_tao).toLocaleString("vi-VN")}</span>
              <span className="font-bold text-gray-900">Tổng: {Number(viewing.tong_tien || 0).toLocaleString("vi-VN")}đ</span>
            </div>

            {(viewing.trang_thai === "CHO_KIEM_TRA" || viewing.trang_thai === "CHO_GIAO_HANG") && (
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button onClick={() => handleReject(viewing.id)} className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50">
                  Từ chối
                </button>
                <button onClick={() => handleApprove(viewing.id)} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
                  Duyệt phiếu nhập
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
