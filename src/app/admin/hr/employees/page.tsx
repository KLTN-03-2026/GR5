"use client";

import { useEffect, useState } from "react";
import { EmployeeTable, NhanVien } from "@/components/admin/employees/EmployeeTable";
import Pagination from "@/components/ui/Pagination";
import * as XLSX from "xlsx";
import {
  X, Plus, Loader2, Users, UserCheck, Palmtree, UserX, Search, Download,
} from "lucide-react";
import toast from "react-hot-toast";

const CHUC_VU_OPTIONS = [
  "Nhân viên kho",
  "Nhân viên giao nhận",
  "Nhân viên kiểm phẩm",
  "Nhân viên đóng gói",
  "Nhân viên bán hàng",
  "Nhân viên giao hàng",
  "Thủ kho",
  "Kế toán kho",
  "Quản lý ca",
  "Tài xế",
  "Bảo vệ",
];

const BO_PHAN_OPTIONS = [
  "Kho Vận",
  "Kiểm Phẩm",
  "Bán Hàng",
  "Giao Hàng",
  "Kế Toán",
  "Hành Chính",
  "Bảo Vệ",
];

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
  vai_tro: "STAFF",
};

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<NhanVien[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const itemsPerPage = 15;

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

  useEffect(() => { fetchEmployees(search, currentPage); }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEmployees(search, 1);
  };

  const openModal = () => { setForm({ ...EMPTY_FORM }); setIsModalOpen(true); };
  const closeModal = () => { if (isSaving) return; setIsModalOpen(false); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim()) return toast.error("Vui lòng nhập Email!");
    if (!form.mat_khau.trim() || form.mat_khau.length < 6) return toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
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
        toast.success("Tạo nhân viên thành công!");
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

  const handleExportExcel = () => {
    if (employees.length === 0) { toast.error("Không có nhân viên để xuất"); return; }
    const STATUS_VI: Record<string, string> = {
      DANG_LAM_VIEC: "Đang làm việc", CHUA_VAO_CA: "Chưa vào ca",
      VANG_MAT: "Vắng mặt", NGHI_PHEP: "Nghỉ phép",
      DA_VE: "Đã về", KHONG_CO_CA: "Không có ca",
    };
    const rows = employees.map((e, i) => ({
      STT: i + 1,
      "Mã NV": e.id,
      "Họ tên": e.ho_ten,
      "Email": e.email,
      "SĐT": e.sdt || "",
      "Chức vụ": e.chuc_vu || "",
      "Bộ phận": e.bo_phan || "",
      "Vai trò": (e.roles || []).join(", "),
      "Ca hôm nay": e.ca_hom_nay || "",
      "Trạng thái": STATUS_VI[e.trang_thai] || e.trang_thai,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "NhanVien");
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `NhanVien_${today}.xlsx`);
    toast.success(`Đã xuất ${employees.length} nhân viên`);
  };

  const workingToday = employees.filter((e) => e.trang_thai === "DANG_LAM_VIEC").length;
  const onLeave = employees.filter((e) => e.trang_thai === "NGHI_PHEP").length;
  const absent = employees.filter((e) => e.trang_thai === "VANG_MAT").length;

  const statCards = [
    { label: "Tổng nhân sự", value: totalEmployees, icon: Users, color: "blue", bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { label: "Đang làm việc", value: workingToday, icon: UserCheck, color: "emerald", bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { label: "Nghỉ phép", value: onLeave, icon: Palmtree, color: "violet", bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-700", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
    { label: "Vắng mặt", value: absent, icon: UserX, color: "red", bg: "bg-red-50", border: "border-red-100", text: "text-red-700", iconBg: "bg-red-100", iconColor: "text-red-600" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">


      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh Sách Nhân Viên</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý hồ sơ và trạng thái toàn bộ nhân sự kho</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm text-sm whitespace-nowrap"
        >
          <Plus size={16} />
          Thêm nhân viên
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className={`${s.bg} ${s.border} border rounded-xl p-4 flex items-center gap-4`}>
            <div className={`${s.iconBg} rounded-xl p-2.5 flex-shrink-0`}>
              <s.icon size={20} className={s.iconColor} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-b">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-sm w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên nhân viên..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <Download size={15} />
            Xuất Excel
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-sm animate-pulse">Đang tải danh sách...</div>
        ) : (
          <>
            <EmployeeTable employees={employees} onRefresh={() => fetchEmployees(search, currentPage)} isAdmin={true} />
            <div className="p-4 border-t">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        )}
      </div>

      {/* Modal Thêm nhân viên */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-emerald-600 to-emerald-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Thêm Nhân Viên Mới</h2>
                  <p className="text-xs text-emerald-100">Điền đầy đủ thông tin để tạo tài khoản</p>
                </div>
              </div>
              <button onClick={closeModal} disabled={isSaving} className="p-2 rounded-full hover:bg-white/20 transition text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="p-6 space-y-6 max-h-[68vh] overflow-y-auto">

                {/* Section: Tài khoản */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Thông tin đăng nhập</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Email", name: "email", type: "email", placeholder: "nhanvien@email.com", required: true },
                      { label: "Mật khẩu", name: "mat_khau", type: "password", placeholder: "Tối thiểu 6 ký tự", required: true },
                    ].map((f) => (
                      <div key={f.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {f.label} {f.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type={f.type}
                          name={f.name}
                          value={form[f.name as keyof typeof form]}
                          onChange={handleChange}
                          placeholder={f.placeholder}
                          className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
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

                {/* Section: Hồ sơ */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Hồ sơ cá nhân</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        CCCD / CMND <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="cccd"
                        value={form.cccd}
                        onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 12); handleChange({ target: { name: 'cccd', value: v } } as any); }}
                        placeholder="012345678901"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={12}
                        onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && !['Backspace','Tab','Delete','ArrowLeft','ArrowRight','Home','End'].includes(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="so_dien_thoai"
                        value={form.so_dien_thoai}
                        onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 11); handleChange({ target: { name: 'so_dien_thoai', value: v } } as any); }}
                        placeholder="0901234567"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={11}
                        onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && !['Backspace','Tab','Delete','ArrowLeft','ArrowRight','Home','End'].includes(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Ngày vào làm
                      </label>
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

                {/* Section: Công việc */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-violet-500 rounded-full" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Thông tin công việc</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Chức vụ</label>
                      <select name="chuc_vu" value={form.chuc_vu} onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                        <option value="">-- Chọn chức vụ --</option>
                        {CHUC_VU_OPTIONS.map((cv) => (
                          <option key={cv} value={cv}>{cv}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Bộ phận</label>
                      <select name="bo_phan" value={form.bo_phan} onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                        <option value="">-- Chọn bộ phận --</option>
                        {BO_PHAN_OPTIONS.map((bp) => (
                          <option key={bp} value={bp}>{bp}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại hợp đồng</label>
                      <select name="loai_hop_dong" value={form.loai_hop_dong} onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                        <option value="CHINH_THUC">Chính thức</option>
                        <option value="PART_TIME">Bán thời gian</option>
                        <option value="THU_VIEC">Thử việc</option>
                        <option value="THOI_VU">Thời vụ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày hết hạn HĐ</label>
                      <input type="date" name="hop_dong_het_han" value={form.hop_dong_het_han} onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Lương theo giờ (VNĐ)</label>
                      <input type="number" name="luong_theo_gio" value={form.luong_theo_gio}
                        onChange={(e) => { const v = e.target.value; if (v === '' || Number(v) >= 0) setForm((prev) => ({ ...prev, luong_theo_gio: v })); }}
                        placeholder="VD: 35000" min={0}
                        onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
                <button type="button" onClick={closeModal} disabled={isSaving}
                  className="flex-1 py-2.5 border rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 text-sm">
                  Hủy bỏ
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-60 text-sm shadow-sm">
                  {isSaving ? <><Loader2 size={15} className="animate-spin" />Đang tạo...</> : <><Plus size={15} />Tạo nhân viên</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
