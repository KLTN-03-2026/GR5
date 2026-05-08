"use client";

import { useEffect, useState } from "react";
import { EmployeeTable, NhanVien } from "@/components/admin/employees/EmployeeTable";
import Pagination from "@/components/ui/Pagination";
import { X, Plus, Loader2, Users, CheckCircle2, Clock, Palmtree, UserX } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// ─── Form State ────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  email: "",
  mat_khau: "",
  ho_ten: "",
  so_dien_thoai: "",
  cccd: "",
  chuc_vu: "",
  bo_phan: "",
  loai_hop_dong: "CHINH_THUC",
  ngay_vao_lam: "",
  hop_dong_het_han: "",
  luong_theo_gio: "",
  vai_tro: "STAFF", // STAFF | THU_KHO | CUSTOMER
};

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<NhanVien[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const itemsPerPage = 15;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const fetchEmployees = async (searchQuery = "", page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/nhan-vien?search=${encodeURIComponent(searchQuery)}&page=${page}&limit=${itemsPerPage}`
      );
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setEmployees(result.data);
        setTotalPages(result.meta?.totalPages || 1);
        setTotalEmployees(result.meta?.total || result.data.length);
      }
    } catch {
      toast.error("Không thể tải danh sách nhân viên!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(search, currentPage);
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEmployees(search, 1);
  };

  const openModal = () => {
    setForm({ ...EMPTY_FORM });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!form.email.trim()) return toast.error("Vui lòng nhập Email!");
    if (!form.mat_khau.trim() || form.mat_khau.length < 6)
      return toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
    if (!form.ho_ten.trim()) return toast.error("Vui lòng nhập Họ tên!");
    if (!form.cccd.trim()) return toast.error("Vui lòng nhập CCCD!");

    setIsSaving(true);
    try {
      const res = await fetch("/api/nhan-vien", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          mat_khau: form.mat_khau,
          ho_ten: form.ho_ten.trim(),
          so_dien_thoai: form.so_dien_thoai.trim(),
          cccd: form.cccd.trim(),
          chuc_vu: form.chuc_vu.trim(),
          bo_phan: form.bo_phan.trim(),
          loai_hop_dong: form.loai_hop_dong,
          ngay_vao_lam: form.ngay_vao_lam || null,
          hop_dong_het_han: form.hop_dong_het_han || null,
          luong_theo_gio: form.luong_theo_gio ? Number(form.luong_theo_gio) : 0,
          vai_tro: form.vai_tro,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("✅ Tạo nhân viên thành công!");
        setIsModalOpen(false);
        fetchEmployees(search, 1);
        setCurrentPage(1);
      } else {
        toast.error(data.message || "Có lỗi xảy ra!");
      }
    } catch {
      toast.error("Lỗi kết nối server!");
    } finally {
      setIsSaving(false);
    }
  };

  const workingToday = employees.filter((e) => e.trang_thai === "DANG_LAM_VIEC").length;
  const onLeave = employees.filter((e) => e.trang_thai === "NGHI_PHEP").length;
  const absent = employees.filter((e) => e.trang_thai === "VANG_MAT").length;

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" />

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Danh Sách Nhân Viên</h1>
          <p className="text-gray-500 text-sm mt-0.5">Quản lý hồ sơ và trạng thái làm việc hôm nay</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Tổng nhân sự", value: totalEmployees, color: "gray" },
            { label: "Đang làm việc", value: workingToday, color: "green" },
            { label: "Nghỉ phép", value: onLeave, color: "purple" },
            { label: "Vắng mặt", value: absent, color: "red" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`px-4 py-2 bg-${stat.color}-50 border border-${stat.color}-100 rounded-lg text-center min-w-[90px]`}
            >
              <div className={`text-xs text-${stat.color}-600`}>{stat.label}</div>
              <div className={`font-bold text-${stat.color}-700 text-lg`}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <form onSubmit={handleSearch} className="flex max-w-md w-full">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên nhân viên..."
            className="w-full px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 border border-l-0 rounded-r-lg hover:bg-gray-200 font-medium"
          >
            Tìm
          </button>
        </form>

        <button
          id="btn-add-employee"
          onClick={openModal}
          className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm whitespace-nowrap"
        >
          <Plus size={18} />
          Thêm nhân viên
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 animate-pulse">
          Đang tải danh sách...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <EmployeeTable employees={employees} onRefresh={() => fetchEmployees(search, currentPage)} />
          <div className="p-4 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* ── Modal Thêm nhân viên ──────────────────────────────────── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Users size={18} className="text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Thêm Nhân Viên Mới</h2>
                  <p className="text-xs text-gray-500">Điền đầy đủ thông tin để tạo tài khoản</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="p-2 rounded-full hover:bg-gray-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

                {/* Phần 1: Thông tin tài khoản */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    🔐 Thông tin đăng nhập
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="nhanvien@email.com"
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="mat_khau"
                        value={form.mat_khau}
                        onChange={handleChange}
                        placeholder="Tối thiểu 6 ký tự"
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vai trò <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="vai_tro"
                        value={form.vai_tro}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option value="STAFF">NV Vận Hành (STAFF)</option>
                        <option value="THU_KHO">Thủ Kho (THU_KHO)</option>
                        <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Phần 2: Hồ sơ cá nhân */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    👤 Hồ sơ cá nhân
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="ho_ten"
                        value={form.ho_ten}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CCCD / CMND <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="cccd"
                        value={form.cccd}
                        onChange={handleChange}
                        placeholder="012345678901"
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                      <input
                        type="tel"
                        name="so_dien_thoai"
                        value={form.so_dien_thoai}
                        onChange={handleChange}
                        placeholder="0901234567"
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày vào làm</label>
                      <input
                        type="date"
                        name="ngay_vao_lam"
                        value={form.ngay_vao_lam}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Phần 3: Công việc */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    🏢 Thông tin công việc
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                      <input
                        type="text"
                        name="chuc_vu"
                        value={form.chuc_vu}
                        onChange={handleChange}
                        placeholder="VD: Nhân viên kho"
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bộ phận</label>
                      <input
                        type="text"
                        name="bo_phan"
                        value={form.bo_phan}
                        onChange={handleChange}
                        placeholder="VD: Kho Vận"
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loại hợp đồng</label>
                      <select
                        name="loai_hop_dong"
                        value={form.loai_hop_dong}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option value="CHINH_THUC">Chính thức</option>
                        <option value="PART_TIME">Bán thời gian</option>
                        <option value="THU_VIEC">Thử việc</option>
                        <option value="THOI_VU">Thời vụ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn HĐ</label>
                      <input
                        type="date"
                        name="hop_dong_het_han"
                        value={form.hop_dong_het_han}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lương theo giờ (VNĐ)
                      </label>
                      <input
                        type="number"
                        name="luong_theo_gio"
                        value={form.luong_theo_gio}
                        onChange={handleChange}
                        placeholder="VD: 35000"
                        min={0}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="flex-1 py-2.5 border rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Tạo nhân viên
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
