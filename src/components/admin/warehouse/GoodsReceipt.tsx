"use client";

import React, { useState } from "react";
import axios from "axios";
import { ScanBarcode, CheckCircle, Printer, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react"; // Thư viện tạo QR thật
import { FormInput } from "./WarehouseUI";
import { ImportGoodsSchema } from "@/schemas/warehouse.schema";

export default function GoodsReceipt({ formOptions }: { formOptions?: any }) {
  const [isCreated, setIsCreated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [expireDate, setExpireDate] = useState<string>("");

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      ma_ncc: formData.get("ma_ncc"),
      ma_bien_the: formData.get("ma_bien_the"),
      ngay_thu_hoach: formData.get("ngay_thu_hoach"),
      ngay_nhap_kho: formData.get("ngay_nhap_kho"),
      han_su_dung: formData.get("han_su_dung"),
      vi_tri: {
        khu: formData.get("khu"),
        day: formData.get("day"),
        ke: formData.get("ke"),
        tang: formData.get("tang"),
      },
      so_luong_thung: formData.get("so_luong_thung"),
    };

    const result = ImportGoodsSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const formattedErrors: Record<string, string> = {};
      for (const key in fieldErrors) {
        const k = key as keyof typeof fieldErrors;
        if (fieldErrors[k]) formattedErrors[k] = fieldErrors[k]![0];
      }

      const objErrors = result.error.format();
      if (objErrors.vi_tri?.khu?._errors[0])
        formattedErrors["khu"] = objErrors.vi_tri.khu._errors[0];
      if (objErrors.vi_tri?.day?._errors[0])
        formattedErrors["day"] = objErrors.vi_tri.day._errors[0];
      if (objErrors.vi_tri?.ke?._errors[0])
        formattedErrors["ke"] = objErrors.vi_tri.ke._errors[0];
      if (objErrors.vi_tri?.tang?._errors[0])
        formattedErrors["tang"] = objErrors.vi_tri.tang._errors[0];

      setErrors(formattedErrors);
      return;
    }

    try {
      // GỌI API (Đảm bảo API đã được chuyển vào src/app/api/...)
      const response = await axios.post(
        "/api/admin/warehouse/import",
        result.data,
      );
      if (response.data.success) {
        setQrCodes(response.data.data.qrCodes);
        setIsCreated(true);
        setExpireDate(result.data.han_su_dung);
      }
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Lỗi 404: Không tìm thấy API, hãy kiểm tra lại thư mục!",
      );
    }
  };

  // Hàm gọi lệnh in của trình duyệt
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* ========================================================= */}
      {/* GIAO DIỆN WEB: Dùng class `print:hidden` để ẩn đi khi in  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 print:hidden">
        <div className="lg:col-span-3 bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-5">
            Tạo phiếu nhập & Sinh mã QR
          </h2>
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-2 gap-4">
              {/* Đảm bảo dùng formOptions?.ncc và formOptions?.sp */}
              <FormInput
                name="ma_ncc"
                label="Nhà cung cấp"
                type="select"
                options={formOptions?.ncc || []}
                error={errors.ma_ncc}
              />
              <FormInput
                name="ma_bien_the"
                label="Sản phẩm (Biến thể)"
                type="select"
                options={formOptions?.sp || []}
                error={errors.ma_bien_the}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormInput
                name="ngay_thu_hoach"
                label="Ngày thu hoạch"
                type="date"
                error={errors.ngay_thu_hoach}
              />
              <FormInput
                name="ngay_nhap_kho"
                label="Ngày nhập kho"
                type="date"
                defaultValue={today}
                error={errors.ngay_nhap_kho}
              />
              <FormInput
                name="han_su_dung"
                label="Hạn sử dụng"
                type="date"
                error={errors.han_su_dung}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#888780] mb-1.5">
                Vị trí lưu kho (Khu → Dãy → Kệ → Tầng)
              </label>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <input
                    type="text"
                    name="khu"
                    placeholder="Khu A"
                    className={`w-full border rounded-lg p-2.5 text-sm uppercase placeholder:normal-case ${errors.khu ? "border-[#E24B4A]" : "border-gray-200 focus:border-[#1D9E75]"}`}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="day"
                    placeholder="Dãy 1"
                    className={`w-full border rounded-lg p-2.5 text-sm uppercase placeholder:normal-case ${errors.day ? "border-[#E24B4A]" : "border-gray-200 focus:border-[#1D9E75]"}`}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="ke"
                    placeholder="Kệ 2"
                    className={`w-full border rounded-lg p-2.5 text-sm uppercase placeholder:normal-case ${errors.ke ? "border-[#E24B4A]" : "border-gray-200 focus:border-[#1D9E75]"}`}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="tang"
                    placeholder="Tầng 3"
                    className={`w-full border rounded-lg p-2.5 text-sm uppercase placeholder:normal-case ${errors.tang ? "border-[#E24B4A]" : "border-gray-200 focus:border-[#1D9E75]"}`}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                name="so_luong_thung"
                label="Số lượng thùng"
                type="number"
                defaultValue="15"
                error={errors.so_luong_thung}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#1D9E75] hover:bg-teal-700 text-white font-medium rounded-lg transition-colors mt-2"
            >
              Tạo phiếu nhập
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-semibold mb-5">Mã QR (Preview Web)</h2>
          {!isCreated ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <ScanBarcode className="text-gray-300 w-16 h-16 mb-3" />
              <p className="text-sm text-[#888780]">
                Nhập thông tin để sinh mã QR thật.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col animate-in fade-in zoom-in duration-300">
              <div className="p-3 mb-4 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg flex items-center gap-2 text-sm font-medium">
                <CheckCircle size={16} className="text-[#1D9E75]" /> Đã tạo{" "}
                {qrCodes.length} mã thành công!
              </div>
              <div className="grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-1 max-h-[400px]">
                {qrCodes.map((qr, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 p-3 rounded-lg flex gap-3 items-center bg-gray-50"
                  >
                    <div className="bg-white p-1 rounded border border-gray-200 shadow-sm">
                      {/* Gắn QR Thật vào Web */}
                      <QRCodeSVG value={qr.ma_vach_quet} size={40} />
                    </div>
                    <div>
                      <p className="text-xs font-bold font-mono text-[#2C2C2A]">
                        {qr.ma_vach_quet}
                      </p>
                      <p className="text-[10px] text-[#888780] mt-1">
                        Trạng thái: OK
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-4 flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex-1 flex justify-center items-center gap-2 bg-[#2C2C2A] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-black"
                >
                  <Printer size={16} /> In Tem Dán Thùng ({qrCodes.length})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* GIAO DIỆN BẢN IN: Dùng class `hidden print:block` để chỉ in ra */}
      {/* ============================================================== */}
      <div className="hidden print:block w-full">
        <h1 className="text-2xl font-bold text-center mb-8 uppercase">
          Tem Dán Thùng Hàng
        </h1>
        {/* Chia lưới 4 cột để vừa khổ A4 */}
        <div className="grid grid-cols-4 gap-6">
          {qrCodes.map((qr, i) => (
            <div
              key={i}
              className="border-2 border-black p-4 flex flex-col items-center text-center"
            >
              <QRCodeSVG value={qr.ma_vach_quet} size={120} level="H" />
              <p className="font-mono font-bold text-lg mt-3 bg-black text-white px-2 py-1 w-full uppercase">
                {qr.ma_vach_quet}
              </p>
              <p className="text-xs mt-2 font-medium">
                <p className="text-xs mt-2 font-medium">
                  HSD: {expireDate || "---"}
                </p>{" "}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
