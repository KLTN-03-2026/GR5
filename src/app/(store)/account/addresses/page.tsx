"use client";

import React, { useEffect, useState } from "react";
import {
  MapPin, Edit2, Trash2, Plus, Loader2, X, Save,
  User, Phone, ChevronDown, Home, CheckCircle2, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface Address {
  id: number;
  chi_tiet_dia_chi: string;
  la_mac_dinh: boolean;
  ho_ten?: string;
  so_dien_thoai?: string;
  tinh_thanh?: string;
  quan_huyen?: string;
  phuong_xa?: string;
  ma_tinh_ghn?: number;
  ma_quan_huyen_ghn?: number;
  ma_phuong_xa_ghn?: string;
}

interface AddrForm {
  ho_ten: string;
  so_dien_thoai: string;
  chi_tiet: string;
  tinh_thanh: string;
  quan_huyen: string;
  phuong_xa: string;
  ma_tinh: number | null;
  ma_quan_huyen: number | null;
  ma_phuong_xa: string;
}

const EMPTY_FORM: AddrForm = {
  ho_ten: "", so_dien_thoai: "", chi_tiet: "",
  tinh_thanh: "", quan_huyen: "", phuong_xa: "",
  ma_tinh: null, ma_quan_huyen: null, ma_phuong_xa: "",
};

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAddr, setEditAddr] = useState<Address | null>(null);
  const [form, setForm] = useState<AddrForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingWard, setLoadingWard] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/store/account/addresses");
      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  useEffect(() => {
    fetch("/api/ghn/master-data?type=province")
      .then(r => r.json())
      .then(d => setProvinces(d || []));
  }, []);

  useEffect(() => {
    if (!form.ma_tinh) { setDistricts([]); return; }
    setLoadingDistrict(true);
    fetch(`/api/ghn/master-data?type=district&province_id=${form.ma_tinh}`)
      .then(r => r.json())
      .then(d => setDistricts(d || []))
      .finally(() => setLoadingDistrict(false));
  }, [form.ma_tinh]);

  useEffect(() => {
    if (!form.ma_quan_huyen) { setWards([]); return; }
    setLoadingWard(true);
    fetch(`/api/ghn/master-data?type=ward&district_id=${form.ma_quan_huyen}`)
      .then(r => r.json())
      .then(d => setWards(d || []))
      .finally(() => setLoadingWard(false));
  }, [form.ma_quan_huyen]);

  const openAdd = () => {
    setEditAddr(null);
    setForm(EMPTY_FORM);
    setDistricts([]);
    setWards([]);
    setShowModal(true);
  };

  const openEdit = (addr: Address) => {
    setEditAddr(addr);
    setForm({
      ho_ten: addr.ho_ten || "",
      so_dien_thoai: addr.so_dien_thoai || "",
      chi_tiet: addr.chi_tiet_dia_chi || "",
      tinh_thanh: addr.tinh_thanh || "",
      quan_huyen: addr.quan_huyen || "",
      phuong_xa: addr.phuong_xa || "",
      ma_tinh: addr.ma_tinh_ghn || null,
      ma_quan_huyen: addr.ma_quan_huyen_ghn || null,
      ma_phuong_xa: addr.ma_phuong_xa_ghn || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.ho_ten.trim()) { toast.error("Vui lòng nhập họ tên người nhận"); return; }
    if (!form.so_dien_thoai.trim()) { toast.error("Vui lòng nhập số điện thoại"); return; }
    if (!form.ma_tinh || !form.ma_quan_huyen || !form.ma_phuong_xa) {
      toast.error("Vui lòng chọn đầy đủ tỉnh / quận / phường");
      return;
    }
    if (!form.chi_tiet.trim()) { toast.error("Vui lòng nhập số nhà, tên đường"); return; }

    const fullAddress = `${form.chi_tiet}, ${form.phuong_xa}, ${form.quan_huyen}, ${form.tinh_thanh}`;

    setSaving(true);
    try {
      const payload = {
        chi_tiet_dia_chi: fullAddress,
        ho_ten: form.ho_ten,
        so_dien_thoai: form.so_dien_thoai,
        tinh_thanh: form.tinh_thanh,
        quan_huyen: form.quan_huyen,
        phuong_xa: form.phuong_xa,
        ma_tinh_ghn: form.ma_tinh,
        ma_quan_huyen_ghn: form.ma_quan_huyen,
        ma_phuong_xa_ghn: form.ma_phuong_xa,
      };

      if (editAddr) {
        await fetch("/api/store/account/addresses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editAddr.id, action: "update", ...payload }),
        });
        toast.success("Đã cập nhật địa chỉ");
      } else {
        await fetch("/api/store/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Đã thêm địa chỉ mới");
      }
      setShowModal(false);
      fetchAddresses();
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    await fetch("/api/store/account/addresses", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "set-default" }),
    });
    toast.success("Đã đặt địa chỉ mặc định");
    fetchAddresses();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn chắc chắn muốn xoá địa chỉ này?")) return;
    setDeletingId(id);
    await fetch("/api/store/account/addresses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("Đã xoá địa chỉ");
    setDeletingId(null);
    fetchAddresses();
  };

  const inputCls = "w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-400";
  const selectCls = inputCls + " cursor-pointer appearance-none pr-8";

  return (
    <div className="addr-page">
      {/* Header */}
      <div className="addr-header">
        <div className="flex items-center gap-3">
          <div className="addr-header__icon">
            <MapPin size={18} />
          </div>
          <div>
            <h1 className="addr-header__title">Sổ địa chỉ</h1>
            <p className="addr-header__sub">Quản lý địa chỉ giao hàng của bạn</p>
          </div>
        </div>
        <button onClick={openAdd} className="addr-add-btn">
          <Plus size={15} />
          Thêm địa chỉ
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="addr-loading">
          <Loader2 className="animate-spin" size={24} color="#16a34a" />
          <span>Đang tải địa chỉ...</span>
        </div>
      ) : addresses.length === 0 ? (
        <div className="addr-empty">
          <div className="addr-empty__icon">
            <MapPin size={28} />
          </div>
          <p className="addr-empty__title">Chưa có địa chỉ nào</p>
          <p className="addr-empty__sub">Thêm địa chỉ để đặt hàng nhanh hơn và thuận tiện hơn</p>
          <button onClick={openAdd} className="addr-empty__btn">
            <Plus size={14} /> Thêm địa chỉ đầu tiên
          </button>
        </div>
      ) : (
        <div className="addr-list">
          {addresses.map((addr, i) => (
            <motion.div
              key={addr.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`addr-card ${addr.la_mac_dinh ? "addr-card--default" : ""}`}
            >
              {/* Default stripe */}
              {addr.la_mac_dinh && <div className="addr-card__stripe" />}

              <div className="addr-card__icon-wrap">
                <Home size={16} />
              </div>

              <div className="addr-card__body">
                <div className="addr-card__top">
                  <div className="addr-card__name-row">
                    <span className="addr-card__name">{addr.ho_ten || "—"}</span>
                    {addr.so_dien_thoai && (
                      <span className="addr-card__phone">{addr.so_dien_thoai}</span>
                    )}
                    {addr.la_mac_dinh && (
                      <span className="addr-card__badge">
                        <CheckCircle2 size={10} />
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="addr-card__addr">{addr.chi_tiet_dia_chi}</p>
                </div>

                <div className="addr-card__footer">
                  {!addr.la_mac_dinh && (
                    <button onClick={() => handleSetDefault(addr.id)} className="addr-card__set-default">
                      <Star size={12} />
                      Đặt làm mặc định
                    </button>
                  )}
                  <div className="addr-card__actions">
                    <button onClick={() => openEdit(addr)} className="addr-card__btn addr-card__btn--edit">
                      <Edit2 size={12} />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      disabled={deletingId === addr.id}
                      className="addr-card__btn addr-card__btn--delete"
                    >
                      {deletingId === addr.id
                        ? <Loader2 size={12} className="animate-spin" />
                        : <Trash2 size={12} />}
                      Xoá
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 8 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {editAddr ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Điền đầy đủ thông tin để giao hàng chính xác</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-5 space-y-4">
                {/* Họ tên + SĐT */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Họ tên người nhận <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        className={inputCls + " pl-8"}
                        value={form.ho_ten}
                        onChange={e => setForm(f => ({ ...f, ho_ten: e.target.value }))}
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        className={inputCls + " pl-8"}
                        value={form.so_dien_thoai}
                        onChange={e => setForm(f => ({ ...f, so_dien_thoai: e.target.value }))}
                        placeholder="0901 234 567"
                      />
                    </div>
                  </div>
                </div>

                {/* Tỉnh/thành */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Tỉnh / Thành phố <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className={selectCls}
                      value={form.ma_tinh || ""}
                      onChange={e => {
                        const p = provinces.find(x => x.ProvinceID === Number(e.target.value));
                        setForm(f => ({
                          ...f,
                          ma_tinh: p?.ProvinceID || null,
                          tinh_thanh: p?.ProvinceName || "",
                          ma_quan_huyen: null, quan_huyen: "",
                          ma_phuong_xa: "", phuong_xa: "",
                        }));
                        setWards([]);
                      }}
                    >
                      <option value="">Chọn tỉnh / thành phố</option>
                      {provinces.map(p => (
                        <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Quận/huyện + Phường/xã */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Quận / Huyện <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className={selectCls + ((!form.ma_tinh) ? " opacity-50" : "")}
                        value={form.ma_quan_huyen || ""}
                        disabled={!form.ma_tinh}
                        onChange={e => {
                          const d = districts.find(x => x.DistrictID === Number(e.target.value));
                          setForm(f => ({
                            ...f,
                            ma_quan_huyen: d?.DistrictID || null,
                            quan_huyen: d?.DistrictName || "",
                            ma_phuong_xa: "", phuong_xa: "",
                          }));
                        }}
                      >
                        <option value="">{loadingDistrict ? "Đang tải..." : "Chọn quận / huyện"}</option>
                        {districts.map(d => (
                          <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Phường / Xã <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className={selectCls + ((!form.ma_quan_huyen) ? " opacity-50" : "")}
                        value={form.ma_phuong_xa}
                        disabled={!form.ma_quan_huyen}
                        onChange={e => {
                          const w = wards.find(x => x.WardCode === e.target.value);
                          setForm(f => ({ ...f, ma_phuong_xa: w?.WardCode || "", phuong_xa: w?.WardName || "" }));
                        }}
                      >
                        <option value="">{loadingWard ? "Đang tải..." : "Chọn phường / xã"}</option>
                        {wards.map(w => (
                          <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Số nhà, tên đường */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Số nhà, tên đường <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={inputCls}
                    value={form.chi_tiet}
                    onChange={e => setForm(f => ({ ...f, chi_tiet: e.target.value }))}
                    placeholder="Ví dụ: 123 Đường Lê Lợi"
                  />
                </div>

                {/* Preview */}
                {form.chi_tiet && form.phuong_xa && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex gap-2.5"
                  >
                    <MapPin size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-1">Địa chỉ giao hàng</p>
                      <p className="text-sm text-green-800 leading-relaxed">
                        {form.chi_tiet}, {form.phuong_xa}, {form.quan_huyen}, {form.tinh_thanh}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Modal footer */}
              <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {editAddr ? "Lưu thay đổi" : "Thêm địa chỉ"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
