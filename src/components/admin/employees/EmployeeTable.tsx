"use client";

import { useState, useEffect } from "react";
import { Pencil, UserMinus, X, Loader2, Save, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────────────────────────
export type NhanVien = {
  id: number;
  email: string;
  ho_ten: string;
  sdt: string;
  chuc_vu: string;
  bo_phan: string;
  anh_dai_dien: string | null;
  ca_hom_nay: string;
  trang_thai: string;
  roles?: string[];
};

interface EmployeeTableProps {
  employees: NhanVien[];
  onRefresh?: () => void;
  /** true = Admin (toàn quyền), false = Thủ kho (chỉ STAFF) */
  isAdmin?: boolean;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  DANG_LAM_VIEC: { label: "Đang làm việc", cls: "text-green-700 bg-green-100" },
  CHUA_VAO_CA:   { label: "Chưa vào ca",   cls: "text-yellow-700 bg-yellow-100" },
  VANG_MAT:      { label: "Vắng mặt",      cls: "text-red-700 bg-red-100" },
  NGHI_PHEP:     { label: "Nghỉ phép",     cls: "text-purple-700 bg-purple-100" },
  DA_VE:         { label: "Đã về",         cls: "text-blue-700 bg-blue-100" },
  KHONG_CO_CA:   { label: "Không có ca",   cls: "text-gray-600 bg-gray-100" },
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN:    "bg-purple-100 text-purple-700",
  THU_KHO:  "bg-blue-100 text-blue-700",
  STAFF:    "bg-emerald-100 text-emerald-700",
  CUSTOMER: "bg-gray-100 text-gray-600",
};

// ── Danh mục chuẩn ──────────────────────────────────────────────────
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

type FullProfile = {
  ho_ten: string;
  so_dien_thoai: string;
  cccd: string;
  chuc_vu: string;
  bo_phan: string;
  loai_hop_dong: string;
  ngay_vao_lam: string;
  hop_dong_het_han: string;
  luong_theo_gio: string;
  vai_tro: string; // chỉ Admin dùng
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function toDateInput(val: string | null | undefined): string {
  if (!val) return "";
  return new Date(val).toISOString().slice(0, 10);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 bg-emerald-500 rounded-full" />
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{children}</p>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition";
const inputDisabledCls = "w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed";

// ── Edit Modal ─────────────────────────────────────────────────────────────────
function EditModal({
  employee,
  isAdmin,
  onClose,
  onSaved,
}: {
  employee: NhanVien;
  isAdmin: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FullProfile>({
    ho_ten:          employee.ho_ten || "",
    so_dien_thoai:   employee.sdt   || "",
    cccd:            "",
    chuc_vu:         employee.chuc_vu  || "",
    bo_phan:         employee.bo_phan  || "",
    loai_hop_dong:   "CHINH_THUC",
    ngay_vao_lam:    "",
    hop_dong_het_han:"",
    luong_theo_gio:  "",
    vai_tro:         employee.roles?.[0] || "STAFF",
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch full profile khi mount
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`/api/nhan-vien/${employee.id}`);
        const data = await res.json();
        if (data.success && data.data) {
          const p = data.data.ho_so_nguoi_dung;
          const roles: string[] = data.data.vai_tro_nguoi_dung?.map((r: any) => r.vai_tro?.ten_vai_tro) ?? [];
          setForm({
            ho_ten:           p?.ho_ten           || "",
            so_dien_thoai:    p?.so_dien_thoai    || "",
            cccd:             p?.cccd             || "",
            chuc_vu:          p?.chuc_vu          || "",
            bo_phan:          p?.bo_phan          || "",
            loai_hop_dong:    p?.loai_hop_dong    || "CHINH_THUC",
            ngay_vao_lam:     toDateInput(p?.ngay_vao_lam),
            hop_dong_het_han: toDateInput(p?.hop_dong_het_han),
            luong_theo_gio:   p?.luong_theo_gio != null ? String(p.luong_theo_gio) : "",
            vai_tro:          roles[0]            || "STAFF",
          });
        }
      } catch { /* giữ giá trị mặc định */ }
      finally { setLoadingProfile(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ho_ten.trim()) return toast.error("Vui lòng nhập họ tên!");
    setIsSaving(true);
    try {
      const payload: any = {
        ho_ten:           form.ho_ten.trim(),
        so_dien_thoai:    form.so_dien_thoai.trim(),
        cccd:             form.cccd.trim(),
        chuc_vu:          form.chuc_vu.trim(),
        bo_phan:          form.bo_phan.trim(),
        loai_hop_dong:    form.loai_hop_dong,
        ngay_vao_lam:     form.ngay_vao_lam     || null,
        hop_dong_het_han: form.hop_dong_het_han || null,
        luong_theo_gio:   form.luong_theo_gio ? Number(form.luong_theo_gio) : 0,
      };
      if (isAdmin) payload.vai_tro = form.vai_tro;

      const res = await fetch(`/api/nhan-vien/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Cập nhật thành công!");
        onSaved();
        onClose();
      } else {
        toast.error(data.message || "Có lỗi xảy ra!");
      }
    } catch {
      toast.error("Lỗi kết nối server!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Pencil size={17} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Chỉnh sửa hồ sơ nhân viên</h2>
              <p className="text-xs text-blue-100">{employee.email}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSaving} className="p-2 rounded-full hover:bg-white/20 transition text-white">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        {loadingProfile ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto flex-1 p-6 space-y-6">

              {/* ── 1. Thông tin cá nhân ─────────────────────── */}
              <div>
                <SectionTitle>👤 Thông tin cá nhân</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Họ và tên" required>
                    <input type="text" name="ho_ten" value={form.ho_ten} onChange={handleChange}
                      placeholder="Nguyễn Văn A" className={inputCls} />
                  </Field>
                  <Field label="CCCD / CMND">
                    <input type="text" name="cccd" value={form.cccd}
                      onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 12); handleChange({ target: { name: 'cccd', value: v } } as any); }}
                      placeholder="012345678901" inputMode="numeric" pattern="[0-9]*" maxLength={12}
                      onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && !['Backspace','Tab','Delete','ArrowLeft','ArrowRight','Home','End'].includes(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                      className={inputCls} />
                  </Field>
                  <Field label="Số điện thoại">
                    <input type="tel" name="so_dien_thoai" value={form.so_dien_thoai}
                      onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 11); handleChange({ target: { name: 'so_dien_thoai', value: v } } as any); }}
                      placeholder="0901234567" inputMode="numeric" pattern="[0-9]*" maxLength={11}
                      onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && !['Backspace','Tab','Delete','ArrowLeft','ArrowRight','Home','End'].includes(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                      className={inputCls} />
                  </Field>
                  <Field label="Email">
                    <input type="email" value={employee.email} disabled className={inputDisabledCls} />
                  </Field>
                </div>
              </div>

              {/* ── 2. Thông tin công việc ───────────────────── */}
              <div>
                <SectionTitle>🏢 Thông tin công việc</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Chức vụ">
                    <select name="chuc_vu" value={form.chuc_vu} onChange={handleChange} className={inputCls}>
                      <option value="">-- Chọn chức vụ --</option>
                      {CHUC_VU_OPTIONS.map((cv) => (
                        <option key={cv} value={cv}>{cv}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Bộ phận">
                    <select name="bo_phan" value={form.bo_phan} onChange={handleChange} className={inputCls}>
                      <option value="">-- Chọn bộ phận --</option>
                      {BO_PHAN_OPTIONS.map((bp) => (
                        <option key={bp} value={bp}>{bp}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Ngày vào làm">
                    <input type="date" name="ngay_vao_lam" value={form.ngay_vao_lam} onChange={handleChange} className={inputCls} />
                  </Field>
                  <Field label="Loại hợp đồng">
                    <select name="loai_hop_dong" value={form.loai_hop_dong} onChange={handleChange} className={inputCls}>
                      <option value="CHINH_THUC">Chính thức</option>
                      <option value="PART_TIME">Bán thời gian</option>
                      <option value="THU_VIEC">Thử việc</option>
                      <option value="THOI_VU">Thời vụ</option>
                    </select>
                  </Field>
                  <Field label="Ngày hết hạn HĐ">
                    <input type="date" name="hop_dong_het_han" value={form.hop_dong_het_han} onChange={handleChange} className={inputCls} />
                  </Field>
                </div>
              </div>

              {/* ── 3. Quyền & Lương (chỉ Admin) ────────────── */}
              {isAdmin ? (
                <div>
                  <SectionTitle>🔐 Phân quyền & Lương (Chỉ Admin)</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Vai trò">
                      <select name="vai_tro" value={form.vai_tro} onChange={handleChange} className={inputCls}>
                        <option value="STAFF">NV Vận Hành (STAFF)</option>
                        <option value="THU_KHO">Thủ Kho (THU_KHO)</option>
                        <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                      </select>
                    </Field>
                    <Field label="Lương theo giờ (VNĐ)">
                      <input type="number" name="luong_theo_gio" value={form.luong_theo_gio}
                        onChange={(e) => { const v = e.target.value; if (v === '' || Number(v) >= 0) handleChange({ target: { name: 'luong_theo_gio', value: v } } as any); }}
                        placeholder="VD: 35000" min={0}
                        onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                        className={inputCls} />
                    </Field>
                  </div>
                  <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-purple-50 border border-purple-100 text-xs text-purple-700">
                    <ShieldCheck size={13} className="flex-shrink-0" />
                    Chỉ Admin mới có thể thay đổi vai trò và mức lương.
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                  <span>⚠️</span>
                  <span>Thủ kho chỉ được chỉnh sửa thông tin cơ bản. Vai trò và lương do Admin quản lý.</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t bg-gray-50 flex-shrink-0">
              <button type="button" onClick={onClose} disabled={isSaving}
                className="flex-1 py-2.5 border rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 text-sm">
                Hủy bỏ
              </button>
              <button type="submit" disabled={isSaving}
                className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-60 text-sm shadow-sm">
                {isSaving
                  ? <><Loader2 size={14} className="animate-spin" />Đang lưu...</>
                  : <><Save size={14} />Lưu thay đổi</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Confirm Delete Modal ───────────────────────────────────────────────────────
function ConfirmDeleteModal({
  employee,
  onClose,
  onConfirmed,
}: {
  employee: NhanVien;
  onClose: () => void;
  onConfirmed: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res  = await fetch(`/api/nhan-vien/${employee.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Đã cho nhân viên nghỉ việc!");
        onConfirmed();
        onClose();
      } else {
        toast.error(data.message || "Có lỗi xảy ra!");
      }
    } catch {
      toast.error("Lỗi kết nối server!");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <UserMinus size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Xác nhận cho nghỉ việc</h2>
              <p className="text-xs text-gray-500 mt-0.5">Hành động này không thể hoàn tác</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-700">
            Bạn có chắc muốn cho nhân viên{" "}
            <span className="font-bold text-gray-900">{employee.ho_ten}</span>{" "}
            (<span className="text-gray-500">{employee.email}</span>) nghỉ việc?
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Tài khoản sẽ bị vô hiệu hoá. Lịch sử chấm công và lương vẫn được giữ lại.
          </p>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
          <button onClick={onClose} disabled={isDeleting}
            className="flex-1 py-2.5 border rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 text-sm">
            Huỷ
          </button>
          <button onClick={handleDelete} disabled={isDeleting}
            className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
            {isDeleting
              ? <><Loader2 size={14} className="animate-spin" />Đang xử lý...</>
              : <><UserMinus size={14} />Cho nghỉ việc</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Table ─────────────────────────────────────────────────────────────────
export function EmployeeTable({ employees, onRefresh, isAdmin = false }: EmployeeTableProps) {
  const [editTarget,   setEditTarget]   = useState<NhanVien | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NhanVien | null>(null);

  const renderBadge = (status: string) => {
    const s = STATUS_MAP[status] ?? STATUS_MAP.KHONG_CO_CA;
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.cls}`}>{s.label}</span>;
  };

  const renderRoleBadge = (roles?: string[]) => {
    if (!roles || roles.length === 0) return null;
    return (
      <div className="flex gap-1 flex-wrap mt-0.5">
        {roles.map((r) => (
          <span key={r} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${ROLE_COLORS[r] ?? "bg-gray-100 text-gray-600"}`}>
            {r}
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 border-b text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 font-medium">Nhân viên</th>
              <th className="px-4 py-3 font-medium">Chức vụ / Bộ phận</th>
              <th className="px-4 py-3 font-medium">SĐT</th>
              <th className="px-4 py-3 font-medium">Ca hôm nay</th>
              <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
              <th className="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400 italic text-sm">
                  Chưa có nhân viên nào trong hệ thống.
                </td>
              </tr>
            ) : (
              employees.map((nv) => (
                <tr key={nv.id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Avatar + Tên */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                        {nv.anh_dai_dien
                          ? <img src={nv.anh_dai_dien} alt="avatar" className="w-full h-full object-cover" />
                          : (nv.ho_ten?.charAt(0) || "U")}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{nv.ho_ten}</div>
                        <div className="text-xs text-gray-400">{nv.email}</div>
                        {renderRoleBadge(nv.roles)}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-gray-700 font-medium">{nv.chuc_vu || "—"}</div>
                    <div className="text-xs text-gray-400">{nv.bo_phan || "—"}</div>
                  </td>

                  <td className="px-4 py-3 text-gray-600">{nv.sdt || "—"}</td>

                  <td className="px-4 py-3">
                    <span className="text-gray-700 font-medium">{nv.ca_hom_nay}</span>
                  </td>

                  <td className="px-4 py-3 text-center">{renderBadge(nv.trang_thai)}</td>

                  {/* Hành động */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditTarget(nv)}
                        title="Chỉnh sửa hồ sơ"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                      >
                        <Pencil size={12} />
                        Sửa
                      </button>

                      {(isAdmin || (nv.roles?.includes("STAFF") && !nv.roles?.includes("ADMIN"))) && (
                        <button
                          onClick={() => setDeleteTarget(nv)}
                          title="Cho nghỉ việc"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition"
                        >
                          <UserMinus size={12} />
                          Nghỉ việc
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editTarget && (
        <EditModal
          employee={editTarget}
          isAdmin={isAdmin}
          onClose={() => setEditTarget(null)}
          onSaved={() => onRefresh?.()}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          employee={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirmed={() => onRefresh?.()}
        />
      )}
    </>
  );
}
