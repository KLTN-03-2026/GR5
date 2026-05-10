'use client'

import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin, CheckCircle2, Banknote, FileText,
  ArrowRight, ChevronLeft, Building2, Copy, Check, QrCode,
  Lock, ShieldCheck, RefreshCw, Truck, Plus, Loader2, Package,
  ChevronDown, User, Phone,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from "@/lib/CartContext";

const BANK_INFO = {
  bankCode: "MB",
  bankName: "MB Bank",
  accountNumber: "0935462720",
  accountName: "LE VIET QUOC HUNG",
};

// ============================================================
// COMPONENT QR BANKING
// ============================================================
function BankTransferPanel({ total, orderId }: { total: number; orderId?: number | null }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const orderNote = orderId ? `DH${orderId}` : "Vui long dat hang truoc";
  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankCode}-${BANK_INFO.accountNumber}-compact2.png?amount=${Math.round(total)}&addInfo=${encodeURIComponent(orderNote)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} style={{ marginTop: 12, overflow: "hidden" }}>
      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flexShrink: 0, background: "#fff", borderRadius: 10, padding: 6, border: "1px solid #bfdbfe" }}>
            <img src={qrUrl} alt="QR" style={{ width: 100, height: 100, objectFit: "contain" }}
              onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2'%3E%3Crect x='3' y='3' width='7' height='7'/%3E%3C/svg%3E"; }} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Ngân hàng", value: BANK_INFO.bankName },
              { label: "Số tài khoản", value: BANK_INFO.accountNumber, copyKey: "account" },
              { label: "Tên chủ TK", value: BANK_INFO.accountName, copyKey: "name" },
              { label: "Số tiền", value: `${Math.round(total).toLocaleString('vi-VN')}đ`, copyKey: "amount" },
              { label: "Nội dung CK", value: orderNote, copyKey: "note" },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>{row.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: row.label === "Nội dung CK" ? "#1d4ed8" : "#111827", textAlign: "right" }}>{row.value}</span>
                  {(row as any).copyKey && (
                    <button onClick={() => handleCopy(row.value, (row as any).copyKey)} style={{ padding: "2px 4px", borderRadius: 4, border: "none", background: "transparent", cursor: "pointer" }}>
                      {copiedField === (row as any).copyKey ? <Check style={{ width: 12, height: 12, color: "#16a34a" }} /> : <Copy style={{ width: 12, height: 12, color: "#9ca3af" }} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "#fefce8", border: "1px solid #fde047", borderRadius: 8, padding: "8px 12px", marginTop: 12, fontSize: 12, color: "#854d0e" }}>
          ⚠️ Ghi đúng nội dung CK <strong style={{ fontFamily: "monospace" }}>{orderNote}</strong> để đơn hàng được xác nhận nhanh.
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// COMPONENT CHỌN ĐỊA CHỈ GHN (hỗ trợ địa chỉ đã lưu)
// ============================================================
function AddressForm({ onAddressChange }: {
  onAddressChange: (addr: {
    ho_ten: string; so_dien_thoai: string; chi_tiet: string;
    tinh_thanh: string; quan_huyen: string; phuong_xa: string;
    ma_tinh: number; ma_quan_huyen: number; ma_phuong_xa: string;
  } | null) => void
}) {
  const { data: session } = useSession();

  // Địa chỉ đã lưu
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<number | null>(null);
  const [useNewForm, setUseNewForm] = useState(false);

  // GHN master data cho form mới
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [selectedWard, setSelectedWard] = useState<any>(null);
  const [hoTen, setHoTen] = useState('');
  const [sdt, setSdt] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingWard, setLoadingWard] = useState(false);

  // Load địa chỉ đã lưu khi có session
  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      try {
        const res = await fetch('/api/store/account/addresses');
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) { setUseNewForm(true); return; }

        setSavedAddresses(data);
        const def = data.find((a: any) => a.la_mac_dinh) || data[0];
        if (def.tinh_thanh && def.quan_huyen && def.phuong_xa) {
          setSelectedSavedId(def.id);
          setUseNewForm(false);
          const codes = await resolveGhnCodes(def);
          if (codes) {
            onAddressChange({
              ho_ten: def.ho_ten || '', so_dien_thoai: def.so_dien_thoai || '',
              chi_tiet: def.chi_tiet_dia_chi || '',
              tinh_thanh: def.tinh_thanh || '', quan_huyen: def.quan_huyen || '', phuong_xa: def.phuong_xa || '',
              ma_tinh: codes.ma_tinh, ma_quan_huyen: codes.ma_quan_huyen, ma_phuong_xa: codes.ma_phuong_xa,
            });
          } else {
            setUseNewForm(true);
          }
        } else {
          setUseNewForm(true);
        }
      } catch { setUseNewForm(true); }
    })();
  }, [session]);

  // Load tỉnh khi mở form mới
  useEffect(() => {
    if (!useNewForm || provinces.length > 0) return;
    setLoadingProvince(true);
    fetch('/api/ghn/master-data?type=province')
      .then(r => r.json())
      .then(d => setProvinces(d || []))
      .finally(() => setLoadingProvince(false));
  }, [useNewForm]);

  useEffect(() => {
    if (!selectedProvince) { setDistricts([]); setSelectedDistrict(null); return; }
    setLoadingDistrict(true);
    fetch(`/api/ghn/master-data?type=district&province_id=${selectedProvince.ProvinceID}`)
      .then(r => r.json()).then(d => setDistricts(d || []))
      .finally(() => setLoadingDistrict(false));
    setSelectedDistrict(null); setSelectedWard(null); setWards([]);
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedDistrict) { setWards([]); setSelectedWard(null); return; }
    setLoadingWard(true);
    fetch(`/api/ghn/master-data?type=ward&district_id=${selectedDistrict.DistrictID}`)
      .then(r => r.json()).then(d => setWards(d || []))
      .finally(() => setLoadingWard(false));
    setSelectedWard(null);
  }, [selectedDistrict]);

  // Emit khi form mới thay đổi
  useEffect(() => {
    if (!useNewForm) return;
    if (hoTen && sdt && diaChi && selectedProvince && selectedDistrict && selectedWard) {
      onAddressChange({
        ho_ten: hoTen, so_dien_thoai: sdt, chi_tiet: diaChi,
        tinh_thanh: selectedProvince.ProvinceName,
        quan_huyen: selectedDistrict.DistrictName,
        phuong_xa: selectedWard.WardName,
        ma_tinh: selectedProvince.ProvinceID,
        ma_quan_huyen: selectedDistrict.DistrictID,
        ma_phuong_xa: String(selectedWard.WardCode),
      });
    } else {
      onAddressChange(null);
    }
  }, [hoTen, sdt, diaChi, selectedProvince, selectedDistrict, selectedWard, useNewForm]);

  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()
    .replace(/thành phố |tỉnh |quận |huyện |phường |xã |thị trấn |thị xã /g, '');

  const resolveGhnCodes = async (addr: any) => {
    try {
      const provRes = await fetch('/api/ghn/master-data?type=province').then(r => r.json());
      const prov = provRes.find((p: any) =>
        normalize(p.ProvinceName) === normalize(addr.tinh_thanh) ||
        p.ProvinceName === addr.tinh_thanh
      );
      if (!prov) return null;

      const distRes = await fetch(`/api/ghn/master-data?type=district&province_id=${prov.ProvinceID}`).then(r => r.json());
      const dist = distRes.find((d: any) =>
        normalize(d.DistrictName) === normalize(addr.quan_huyen) ||
        d.DistrictName === addr.quan_huyen
      );
      if (!dist) return null;

      const wardRes = await fetch(`/api/ghn/master-data?type=ward&district_id=${dist.DistrictID}`).then(r => r.json());
      const ward = wardRes.find((w: any) =>
        normalize(w.WardName) === normalize(addr.phuong_xa) ||
        w.WardName === addr.phuong_xa
      );
      if (!ward) return null;

      return { ma_tinh: prov.ProvinceID, ma_quan_huyen: dist.DistrictID, ma_phuong_xa: ward.WardCode };
    } catch {
      return null;
    }
  };

  const selectSaved = async (addr: any) => {
    setSelectedSavedId(addr.id);
    setUseNewForm(false);

    const codes = await resolveGhnCodes(addr);
    if (codes) {
      onAddressChange({
        ho_ten: addr.ho_ten || '', so_dien_thoai: addr.so_dien_thoai || '',
        chi_tiet: addr.chi_tiet_dia_chi || '',
        tinh_thanh: addr.tinh_thanh || '', quan_huyen: addr.quan_huyen || '', phuong_xa: addr.phuong_xa || '',
        ma_tinh: codes.ma_tinh, ma_quan_huyen: codes.ma_quan_huyen, ma_phuong_xa: codes.ma_phuong_xa,
      });
    } else {
      onAddressChange(null);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 40, border: "1px solid #d1d5db", borderRadius: 8,
    fontSize: 13, padding: "0 12px", outline: "none", boxSizing: "border-box",
    background: "#f9fafb", fontFamily: "var(--font-sans)",
  };
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Danh sách địa chỉ đã lưu */}
      {savedAddresses.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {savedAddresses.filter(a => a.ma_quan_huyen_ghn && a.ma_phuong_xa_ghn).map(addr => (
            <div key={addr.id} onClick={() => selectSaved(addr)}
              style={{
                padding: "12px 14px", borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
                border: `2px solid ${selectedSavedId === addr.id && !useNewForm ? "#16a34a" : "#e5e7eb"}`,
                background: selectedSavedId === addr.id && !useNewForm ? "#f0fdf4" : "#fafafa",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: selectedSavedId === addr.id && !useNewForm ? "#16a34a" : "#111827" }}>
                      {addr.ho_ten || "Người nhận"}
                    </span>
                    {addr.so_dien_thoai && (
                      <span style={{ fontSize: 12, color: "#6b7280" }}>· {addr.so_dien_thoai}</span>
                    )}
                    {addr.la_mac_dinh && (
                      <span style={{ fontSize: 10, fontWeight: 600, background: "#16a34a", color: "#fff", padding: "1px 6px", borderRadius: 4 }}>Mặc định</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>{addr.chi_tiet_dia_chi}</p>
                </div>
                {selectedSavedId === addr.id && !useNewForm && (
                  <CheckCircle2 style={{ width: 16, height: 16, color: "#16a34a", flexShrink: 0, marginLeft: 8 }} />
                )}
              </div>
            </div>
          ))}

          {/* Nút dùng địa chỉ mới */}
          <button onClick={() => { setUseNewForm(true); setSelectedSavedId(null); onAddressChange(null); }}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#16a34a", background: "transparent", border: "1.5px dashed #86efac", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 500, width: "fit-content" }}>
            <Plus style={{ width: 14, height: 14 }} /> Dùng địa chỉ khác
          </button>
        </div>
      )}

      {/* Form nhập địa chỉ mới */}
      {(useNewForm || savedAddresses.length === 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: savedAddresses.length > 0 ? "14px" : "0", borderRadius: 10, border: savedAddresses.length > 0 ? "1.5px solid #e5e7eb" : "none" }}>
          {savedAddresses.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Địa chỉ mới</span>
              <button onClick={() => { setUseNewForm(false); const def = savedAddresses.find(a => a.la_mac_dinh && a.ma_quan_huyen_ghn) || savedAddresses.find(a => a.ma_quan_huyen_ghn); if (def) selectSaved(def); }}
                style={{ fontSize: 12, color: "#6b7280", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                Dùng địa chỉ đã lưu
              </button>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="addr-2col">
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Họ tên người nhận *</label>
              <input style={inputStyle} value={hoTen} onChange={e => setHoTen(e.target.value)} placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Số điện thoại *</label>
              <input style={inputStyle} value={sdt} onChange={e => setSdt(e.target.value)} placeholder="0901234567" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }} className="addr-3col">
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Tỉnh/Thành phố *</label>
              <select style={selectStyle} value={selectedProvince?.ProvinceID || ''} onChange={e => {
                const p = provinces.find(x => x.ProvinceID === Number(e.target.value));
                setSelectedProvince(p || null);
              }}>
                <option value="">{loadingProvince ? "Đang tải..." : "Chọn tỉnh/thành"}</option>
                {provinces.map(p => <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Quận/Huyện *</label>
              <select style={selectStyle} value={selectedDistrict?.DistrictID || ''} onChange={e => {
                const d = districts.find(x => x.DistrictID === Number(e.target.value));
                setSelectedDistrict(d || null);
              }} disabled={!selectedProvince}>
                <option value="">{loadingDistrict ? "Đang tải..." : "Chọn quận/huyện"}</option>
                {districts.map(d => <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Phường/Xã *</label>
              <select style={selectStyle} value={selectedWard?.WardCode || ''} onChange={e => {
                const w = wards.find(x => x.WardCode === e.target.value);
                setSelectedWard(w || null);
              }} disabled={!selectedDistrict}>
                <option value="">{loadingWard ? "Đang tải..." : "Chọn phường/xã"}</option>
                {wards.map(w => <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Số nhà, tên đường *</label>
            <input style={inputStyle} value={diaChi} onChange={e => setDiaChi(e.target.value)} placeholder="Ví dụ: 01 Lê Lợi, Phường Bến Thành" />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TRANG THANH TOÁN CHÍNH
// ============================================================
export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [note, setNote] = useState('');
  const [noteLen, setNoteLen] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState<any>(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [loadingFee, setLoadingFee] = useState(false);
  const [feeError, setFeeError] = useState('');
  const [expectedDate, setExpectedDate] = useState<string>('');

  const { cart, clearCart } = useCart() as any;
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const subTotal = cart.reduce((acc: number, item: any) => acc + item.gia_ban * item.so_luong, 0);
  const total = subTotal + shippingFee;

  // Tính phí vận chuyển khi địa chỉ thay đổi
  useEffect(() => {
    if (!deliveryAddress) { setShippingFee(0); setFeeError(''); return; }

    const totalWeight = Math.max(
      cart.reduce((s: number, item: any) => s + (item.so_luong || 1) * 500, 0),
      200
    );

    setLoadingFee(true);
    setFeeError('');

    fetch('/api/ghn/fee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_district_id: deliveryAddress.ma_quan_huyen,
        to_ward_code: deliveryAddress.ma_phuong_xa,
        weight: totalWeight,
        insurance_value: Math.round(subTotal),
      }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.fee !== undefined) {
          setShippingFee(d.fee);
          if (d.expected_delivery_time) {
            const dt = new Date(d.expected_delivery_time * 1000);
            setExpectedDate(dt.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }));
          }
        } else {
          setFeeError(d.error || 'Không tính được phí ship');
        }
      })
      .catch(() => setFeeError('Lỗi kết nối GHN'))
      .finally(() => setLoadingFee(false));
  }, [deliveryAddress]);

  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);
      if (cart.length === 0) throw new Error("Giỏ hàng của bạn đang trống!");
      if (!deliveryAddress) throw new Error("Vui lòng nhập địa chỉ giao hàng!");

      const fullAddress = `${deliveryAddress.chi_tiet}, ${deliveryAddress.phuong_xa}, ${deliveryAddress.quan_huyen}, ${deliveryAddress.tinh_thanh}`;

      const createOrderRes = await fetch('/api/store/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phuong_thuc_thanh_toan: paymentMethod.toUpperCase() === 'COD' ? 'COD' : paymentMethod === 'bank_transfer' ? 'BANK' : paymentMethod.toUpperCase(),
          ghi_chu: note,
          phi_van_chuyen: shippingFee,
          items: cart,
          ho_ten_nguoi_nhan: deliveryAddress.ho_ten,
          sdt_nguoi_nhan: deliveryAddress.so_dien_thoai,
          dia_chi_giao_hang: fullAddress,
          ma_tinh_ghn: deliveryAddress.ma_tinh,
          ma_quan_huyen_ghn: deliveryAddress.ma_quan_huyen,
          ma_phuong_xa_ghn: deliveryAddress.ma_phuong_xa,
          idempotency_key: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        })
      });

      const orderData = await createOrderRes.json();
      if (!orderData.success) throw new Error(orderData.message);
      const orderId = orderData.orderId;

      if (paymentMethod === 'cod') {
        clearCart?.();
        window.location.href = `/payment/check?orderId=${orderId}&status=success&method=cod`;
      } else if (paymentMethod === 'bank_transfer') {
        setPendingOrderId(orderId);
        clearCart?.();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const paymentRes = await fetch('/api/store/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, type: paymentMethod })
        });
        const paymentData = await paymentRes.json();
        if (paymentData.success && paymentData.paymentUrl) {
          clearCart?.();
          window.location.href = paymentData.paymentUrl;
        } else {
          throw new Error(paymentData.message || "Không lấy được link thanh toán");
        }
      }
    } catch (error: any) {
      alert("❌ Lỗi: " + error.message);
      setIsSubmitting(false);
    }
  };

  // Màn hình chuyển khoản
  if (pendingOrderId) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f8f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ maxWidth: 480, width: "100%", background: "#fff", borderRadius: 24, padding: 32, boxShadow: "0 8px 32px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, background: "#dbeafe", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Building2 style={{ width: 28, height: 28, color: "#2563eb" }} />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>Hoàn tất chuyển khoản</h1>
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Đơn hàng <strong>#{pendingOrderId}</strong> đã được tạo</p>
          </div>
          <BankTransferPanel total={total} orderId={pendingOrderId} />
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => window.location.href = `/payment/check?orderId=${pendingOrderId}&status=pending&method=bank_transfer`}
              style={{ width: "100%", padding: "14px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Tôi đã chuyển khoản xong ✓
            </button>
            <Link href="/orders">
              <button style={{ width: "100%", padding: "12px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                Xem đơn hàng của tôi
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const isDisabled = isSubmitting || cart.length === 0 || !deliveryAddress;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8f6", fontFamily: "var(--font-sans)" }}>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 60px", boxSizing: "border-box", width: "100%" }}>

        <div style={{ marginBottom: 24 }}>
          <Link href="/cart" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", textDecoration: "none", marginBottom: 12 }}>
            <ChevronLeft style={{ width: 16, height: 16 }} /> Quay lại giỏ hàng
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Thanh toán</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }} className="checkout-grid">

          {/* CỘT TRÁI */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* 1. Địa chỉ giao hàng */}
            <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, background: "#f0fdf4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MapPin style={{ width: 16, height: 16, color: "#16a34a" }} />
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>Địa chỉ giao hàng</h2>
              </div>
              <AddressForm onAddressChange={setDeliveryAddress} />

              {/* Phí ship preview */}
              <AnimatePresence>
                {deliveryAddress && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginTop: 12, padding: "10px 14px", background: loadingFee ? "#f9fafb" : feeError ? "#fef2f2" : "#f0fdf4", borderRadius: 8, border: `1px solid ${feeError ? "#fecaca" : "#bbf7d0"}`, display: "flex", alignItems: "center", gap: 8 }}>
                    <Truck style={{ width: 16, height: 16, color: feeError ? "#dc2626" : "#16a34a", flexShrink: 0 }} />
                    {loadingFee ? (
                      <span style={{ fontSize: 13, color: "#6b7280" }}>Đang tính phí vận chuyển...</span>
                    ) : feeError ? (
                      <span style={{ fontSize: 13, color: "#dc2626" }}>{feeError}</span>
                    ) : (
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
                          Phí ship: {shippingFee.toLocaleString('vi-VN')}đ
                        </span>
                        {expectedDate && (
                          <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>· Dự kiến giao: {expectedDate}</span>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* 2. Phương thức thanh toán */}
            <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, background: "#f0fdf4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Banknote style={{ width: 16, height: 16, color: "#16a34a" }} />
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>Phương thức thanh toán</h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { id: 'cod', label: 'Tiền mặt (COD)', sub: 'Thanh toán khi nhận hàng', icon: <Banknote style={{ width: 22, height: 22, color: "#6b7280" }} />, badge: null },
                  { id: 'momo', label: 'Ví MoMo', sub: 'Thanh toán nhanh qua ứng dụng MoMo', img: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Transparent.png', badge: 'Phổ biến' },
                  { id: 'vnpay', label: 'VNPay', sub: 'ATM / QR Code / Thẻ quốc tế', img: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png', badge: null },
                  { id: 'bank_transfer', label: 'Chuyển khoản ngân hàng', sub: `MB Bank — ${BANK_INFO.accountNumber}`, icon: <Building2 style={{ width: 22, height: 22, color: "#2563eb" }} />, badge: null },
                ].map((m) => {
                  const active = paymentMethod === m.id;
                  return (
                    <div key={m.id}>
                      <label style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderRadius: 10, border: `2px solid ${active ? "#16a34a" : "#e5e7eb"}`, background: active ? "#f0fdf4" : "#fafafa", cursor: "pointer", transition: "border-color 0.15s", minHeight: 44 }}>
                        <input type="radio" name="payment" checked={active} onChange={() => setPaymentMethod(m.id)}
                          style={{ width: 18, height: 18, accentColor: "#16a34a", cursor: "pointer", flexShrink: 0 }} />
                        <div style={{ width: 40, height: 40, flexShrink: 0, background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 12px", overflow: "hidden" }}>
                          {(m as any).img ? <img src={(m as any).img} alt={m.label} style={{ width: "100%", height: "100%", objectFit: "contain" }} referrerPolicy="no-referrer" /> : (m as any).icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: active ? "#16a34a" : "#111827" }}>{m.label}</span>
                            {m.badge && <span style={{ fontSize: 11, fontWeight: 600, background: "#be185d", color: "#fff", padding: "2px 6px", borderRadius: 4 }}>{m.badge}</span>}
                          </div>
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>{m.sub}</span>
                        </div>
                        {active && <CheckCircle2 style={{ width: 18, height: 18, color: "#16a34a", flexShrink: 0 }} />}
                      </label>
                      <AnimatePresence>
                        {paymentMethod === 'bank_transfer' && m.id === 'bank_transfer' && <BankTransferPanel total={total} orderId={null} />}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
                <Lock style={{ width: 12, height: 12, color: "#9ca3af", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Thông tin thanh toán được mã hóa SSL 256-bit</span>
              </div>
            </section>

            {/* 3. Ghi chú */}
            <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, background: "#f0fdf4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText style={{ width: 16, height: 16, color: "#16a34a" }} />
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>Ghi chú cho cửa hàng</h2>
              </div>
              <div style={{ position: "relative" }}>
                <textarea value={note} maxLength={300} onChange={(e) => { setNote(e.target.value); setNoteLen(e.target.value.length); }}
                  placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước 30 phút..."
                  rows={3}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 13, color: "#374151", outline: "none", resize: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" }} />
                <span style={{ position: "absolute", bottom: 8, right: 12, fontSize: 11, color: "#9ca3af" }}>{noteLen}/300</span>
              </div>
            </section>
          </div>

          {/* CỘT PHẢI */}
          <div style={{ position: "sticky", top: 100 }}>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: "0 0 16px", paddingBottom: 12, borderBottom: "1px solid #f3f4f6" }}>Chi tiết đơn hàng</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 280, overflowY: "auto", marginBottom: 16 }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af", fontSize: 13 }}>Giỏ hàng trống</div>
                ) : (
                  cart.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb", flexShrink: 0 }}>
                        <img src={item.anh_chinh} alt={item.ten_san_pham} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "#111827", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.ten_san_pham}</p>
                        <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px", textTransform: "uppercase" }}>{item.phan_loai} · SL: {item.so_luong}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#16a34a", margin: 0 }}>{(item.gia_ban * item.so_luong).toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Coupon */}
              <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f3f4f6" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Mã giảm giá</label>
                {couponApplied ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 12px" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>{couponCode}</span>
                    <button onClick={() => { setCouponApplied(false); setCouponCode(''); }} style={{ fontSize: 12, color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Hủy</button>
                  </div>
                ) : (
                  <div style={{ display: "flex" }}>
                    <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Nhập mã voucher"
                      style={{ flex: 1, height: 38, border: "1px solid #d1d5db", borderRight: "none", borderRadius: "8px 0 0 8px", fontSize: 13, padding: "0 12px", outline: "none", boxSizing: "border-box" }} />
                    <button onClick={() => couponCode.trim() && setCouponApplied(true)}
                      style={{ height: 38, padding: "0 14px", background: "#16a34a", color: "#fff", fontSize: 13, fontWeight: 500, border: "none", borderRadius: "0 8px 8px 0", cursor: "pointer" }}>
                      Áp dụng
                    </button>
                  </div>
                )}
              </div>

              {/* Price summary */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#6b7280" }}>Tiền hàng</span>
                  <span style={{ color: "#111827", fontWeight: 500 }}>{subTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#6b7280" }}>Phí vận chuyển</span>
                  {loadingFee ? (
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>Đang tính...</span>
                  ) : !deliveryAddress ? (
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>Nhập địa chỉ để tính</span>
                  ) : feeError ? (
                    <span style={{ color: "#dc2626", fontSize: 12 }}>Lỗi</span>
                  ) : (
                    <span style={{ color: "#111827", fontWeight: 500 }}>{shippingFee.toLocaleString('vi-VN')}đ</span>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, marginTop: 4, borderTop: "1px solid #e5e7eb" }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>Tổng cộng</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#16a34a" }}>{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* CTA */}
              <button onClick={handlePlaceOrder} disabled={isDisabled}
                style={{ width: "100%", height: 48, marginTop: 16, background: isDisabled ? "#d1d5db" : "#16a34a", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: isDisabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s", boxSizing: "border-box" }}>
                {isSubmitting ? (
                  <><Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> Đang xử lý...</>
                ) : (
                  <>{paymentMethod === 'bank_transfer' ? 'Tạo đơn & Xem QR' : 'Xác nhận đặt hàng'} <ArrowRight style={{ width: 18, height: 18 }} /></>
                )}
              </button>

              {!deliveryAddress && (
                <p style={{ fontSize: 12, color: "#f59e0b", textAlign: "center", marginTop: 8 }}>
                  ⚠️ Vui lòng nhập đầy đủ địa chỉ giao hàng
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
                {[
                  { icon: <Lock style={{ width: 12, height: 12 }} />, label: "Bảo mật SSL" },
                  { icon: <RefreshCw style={{ width: 12, height: 12 }} />, label: "Đổi trả 7 ngày" },
                  { icon: <Truck style={{ width: 12, height: 12 }} />, label: "Giao hàng GHN" },
                ].map(({ icon, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#9ca3af" }}>{icon} {label}</div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
          .addr-2col { grid-template-columns: 1fr !important; }
          .addr-3col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
