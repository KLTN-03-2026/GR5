"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Store,
  TrendingDown,
  AlertTriangle,
  FileWarning,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Star,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Pagination from "@/components/ui/Pagination";

interface NCC {
  id: number;
  ten_ncc: string;
  ma_ncc?: string;
  loai_ncc?: string;
  tinh_thanh?: string;
  trang_thai?: string;
  diem_uy_tin?: number;
  cong_no_hien_tai?: number;
  ncc_san_pham: Array<{ san_pham: { ten_san_pham: string } }>;
  hop_dong_ncc: Array<{ ngay_het_han?: string }>;
}

interface KPI {
  tong_dang_hop_tac: number;
  tong_cong_no: number;
  ncc_diem_thap: number;
  hop_dong_sap_het_han: number;
}

const LOAI_NCC_LABELS: Record<string, string> = {
  NONG_DAN: "Nông dân",
  HTX: "HTX",
  CONG_TY: "Công ty",
  DANH_LE: "Đánh lẻ",
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DANG_HOP_TAC: {
    label: "Đang hợp tác",
    className: "bg-green-100 text-green-700",
  },
  TAM_DUNG: { label: "Tạm dừng", className: "bg-yellow-100 text-yellow-700" },
  NGUNG: { label: "Đã ngừng", className: "bg-red-100 text-red-700" },
};

function DiemUyTin({ diem }: { diem: number }) {
  const color =
    diem >= 7
      ? "text-green-600"
      : diem >= 5
        ? "text-amber-500"
        : "text-red-500";
  const bg =
    diem >= 7 ? "bg-green-100" : diem >= 5 ? "bg-amber-100" : "bg-red-100";
  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${bg} ${color}`}
    >
      <Star size={11} fill="currentColor" />
      {diem.toFixed(1)}
      {diem < 6 && (
        <span className="ml-1 text-[10px]">
          {diem < 4 ? "⚠️ Nghiêm trọng" : "Cần xem"}
        </span>
      )}
    </div>
  );
}

export default function AdminSuppliersPage() {
  const [data, setData] = useState<NCC[]>([]);
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLoai, setFilterLoai] = useState("");
  const [filterTrangThai, setFilterTrangThai] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pathname = usePathname();
  const baseUrl = pathname?.startsWith("/warehouse-manager") ? "/warehouse-manager/suppliers" : "/admin/suppliers";

  const fetchData = useCallback(async (page = 1, currentSearch = "") => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterLoai) params.set("loai_ncc", filterLoai);
    if (filterTrangThai) params.set("trang_thai", filterTrangThai);
    params.set("page", page.toString());
    params.set("limit", "15");
    if (currentSearch) params.set("search", currentSearch);

    const res = await fetch(`/api/admin/ncc?${params.toString()}`);
    const json = await res.json();
    setData(json.data ?? []);
    setTotalPages(json.meta?.totalPages || 1);
    setKpi(json.kpi ?? null);
    setLoading(false);
  }, [filterLoai, filterTrangThai]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(currentPage, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData, currentPage, search]);

  const filtered = data; // Already filtered by backend

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Nhà Cung Cấp
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Theo dõi chất lượng, hợp đồng và công nợ từng NCC
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors"
        >
          <Plus size={18} /> Thêm NCC mới
        </button>
      </div>

      {/* KPI Cards */}
      {kpi && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Store size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Đang hợp tác</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpi.tong_dang_hop_tac}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingDown size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tổng công nợ</p>
              <p className="text-xl font-bold text-red-600">
                {Number(kpi.tong_cong_no).toLocaleString("vi-VN")}đ
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Điểm uy tín thấp (&lt;6)</p>
              <p className="text-2xl font-bold text-amber-600">
                {kpi.ncc_diem_thap}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileWarning size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">HĐ sắp hết hạn (30 ngày)</p>
              <p className="text-2xl font-bold text-orange-600">
                {kpi.hop_dong_sap_het_han}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bộ lọc & Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={16} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm tên NCC, mã NCC..."
              className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Filter size={14} />
          </div>
          <select
            value={filterLoai}
            onChange={(e) => setFilterLoai(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 outline-none"
          >
            <option value="">Tất cả loại</option>
            <option value="NONG_DAN">Nông dân</option>
            <option value="HTX">HTX</option>
            <option value="CONG_TY">Công ty</option>
            <option value="DANH_LE">Đánh lẻ</option>
          </select>
          <select
            value={filterTrangThai}
            onChange={(e) => setFilterTrangThai(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DANG_HOP_TAC">Đang hợp tác</option>
            <option value="TAM_DUNG">Tạm dừng</option>
            <option value="NGUNG">Đã ngừng</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Mã
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Tên NCC
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Tỉnh thành
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Sản phẩm
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Điểm uy tín
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Công nợ
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Trạng thái
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    <Store size={40} className="mx-auto mb-2 opacity-30" />
                    <p>Chưa có nhà cung cấp nào</p>
                    <button
                      onClick={() => setShowCreate(true)}
                      className="mt-2 text-blue-600 hover:underline text-sm"
                    >
                      Thêm NCC đầu tiên
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((ncc) => {
                  const status =
                    STATUS_CONFIG[ncc.trang_thai ?? "DANG_HOP_TAC"];
                  const sanPhams = ncc.ncc_san_pham?.slice(0, 3) ?? [];
                  return (
                    <tr
                      key={ncc.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-gray-500 text-xs">
                        {ncc.ma_ncc ?? `#${ncc.id}`}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">
                          {ncc.ten_ncc}
                        </p>
                        {ncc.loai_ncc && (
                          <span className="text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                            {LOAI_NCC_LABELS[ncc.loai_ncc] ?? ncc.loai_ncc}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {ncc.tinh_thanh ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {sanPhams.map((sp, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                            >
                              {sp.san_pham.ten_san_pham}
                            </span>
                          ))}
                          {ncc.ncc_san_pham?.length > 3 && (
                            <span className="text-[11px] text-gray-400">
                              +{ncc.ncc_san_pham.length - 3}
                            </span>
                          )}
                          {sanPhams.length === 0 && (
                            <span className="text-gray-300 text-xs">
                              Chưa có
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <DiemUyTin diem={Number(ncc.diem_uy_tin ?? 5)} />
                      </td>
                      <td className="px-4 py-3">
                        {Number(ncc.cong_no_hien_tai) > 0 ? (
                          <span className="font-bold text-red-600">
                            {Number(ncc.cong_no_hien_tai).toLocaleString(
                              "vi-VN",
                            )}
                            đ
                          </span>
                        ) : (
                          <span className="text-green-600 text-xs font-medium">
                            Đã thanh toán
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${status?.className}`}
                        >
                          {status?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`${baseUrl}/${ncc.id}/info`}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                        >
                          Chi tiết <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modal Thêm NCC mới */}
      {showCreate && (
        <CreateNCCModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function CreateNCCModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    ten_ncc: "",
    loai_ncc: "NONG_DAN",
    tinh_thanh: "",
    nguoi_lien_he: "",
    so_dien_thoai: "",
    zalo: "",
    email: "",
    chu_ky_thanh_toan: "7_NGAY",
    hinh_thuc_thanh_toan: "CHUYEN_KHOAN",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/ncc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Thêm Nhà Cung Cấp Mới
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Mã NCC sẽ được tự động tạo (VD: NCC-001)
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên nhà cung cấp *
              </label>
              <input
                required
                value={form.ten_ncc}
                onChange={(e) => setForm({ ...form, ten_ncc: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Trang trại Rau Xanh Đà Lạt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại NCC
              </label>
              <select
                value={form.loai_ncc}
                onChange={(e) => setForm({ ...form, loai_ncc: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NONG_DAN">Nông dân nhỏ lẻ</option>
                <option value="HTX">Hợp tác xã (HTX)</option>
                <option value="CONG_TY">Công ty</option>
                <option value="DANH_LE">Đánh lẻ / Chợ đầu mối</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tỉnh thành
              </label>
              <input
                value={form.tinh_thanh}
                onChange={(e) =>
                  setForm({ ...form, tinh_thanh: e.target.value })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Lâm Đồng"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Người liên hệ
              </label>
              <input
                value={form.nguoi_lien_he}
                onChange={(e) =>
                  setForm({ ...form, nguoi_lien_he: e.target.value })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tên người liên hệ trực tiếp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                value={form.so_dien_thoai}
                onChange={(e) =>
                  setForm({ ...form, so_dien_thoai: e.target.value })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0912..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zalo
              </label>
              <input
                value={form.zalo}
                onChange={(e) => setForm({ ...form, zalo: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Số Zalo (nếu khác SĐT)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hình thức thanh toán
              </label>
              <select
                value={form.hinh_thuc_thanh_toan}
                onChange={(e) =>
                  setForm({ ...form, hinh_thuc_thanh_toan: e.target.value })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CHUYEN_KHOAN">Chuyển khoản</option>
                <option value="TIEN_MAT">Tiền mặt</option>
                <option value="COD">COD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chu kỳ thanh toán
              </label>
              <select
                value={form.chu_ky_thanh_toan}
                onChange={(e) =>
                  setForm({ ...form, chu_ky_thanh_toan: e.target.value })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NGAY_GIAO">Ngay khi giao</option>
                <option value="7_NGAY">Sau 7 ngày</option>
                <option value="15_NGAY">Sau 15 ngày</option>
                <option value="30_NGAY">Sau 30 ngày</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2 justify-end border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-70"
            >
              {loading ? "Đang tạo..." : "Tạo NCC"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
