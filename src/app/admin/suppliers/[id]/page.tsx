"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, User, Package, Truck, CreditCard, FileText,
  Star, AlertTriangle, Phone, MapPin
} from "lucide-react";
import SupplierInfoTab from "@/components/admin/suppliers/SupplierInfoTab";
import SupplierProductsTab from "@/components/admin/suppliers/SupplierProductsTab";
import SupplierDeliveryTab from "@/components/admin/suppliers/SupplierDeliveryTab";
import SupplierDebtTab from "@/components/admin/suppliers/SupplierDebtTab";
import SupplierContractsTab from "@/components/admin/suppliers/SupplierContractsTab";

const TABS = [
  { id: "info", label: "Thông tin chung", icon: User },
  { id: "products", label: "Sản phẩm & Giá", icon: Package },
  { id: "delivery", label: "Lịch sử & Đánh giá", icon: Truck },
  { id: "debt", label: "Công nợ & Thanh toán", icon: CreditCard },
  { id: "contracts", label: "Hợp đồng & Tài liệu", icon: FileText },
];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DANG_HOP_TAC: { label: "Đang hợp tác", className: "bg-green-100 text-green-700" },
  TAM_DUNG: { label: "Tạm dừng", className: "bg-yellow-100 text-yellow-700" },
  NGUNG: { label: "Đã ngừng", className: "bg-red-100 text-red-700" },
};

export default function SupplierDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("info");
  const [ncc, setNcc] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNcc = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/ncc/${id}`);
    const data = await res.json();
    setNcc(data);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchNcc(); }, [fetchNcc]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!ncc) return <div className="text-center py-20 text-gray-500">Không tìm thấy nhà cung cấp</div>;

  const status = STATUS_CONFIG[(ncc.trang_thai as string) ?? "DANG_HOP_TAC"];
  const diemUyTin = Number(ncc.diem_uy_tin ?? 5);
  const congNo = Number((ncc as Record<string, unknown>).cong_no_hien_tai ?? 0);

  return (
    <div className="space-y-6">
      <Link href="/admin/suppliers" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft size={16} /> Quay lại danh sách NCC
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-bold text-blue-600">
              {(ncc.ten_ncc as string)?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{ncc.ten_ncc as string}</h1>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.className}`}>{status.label}</span>
                {diemUyTin < 6 && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${diemUyTin < 4 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                    <AlertTriangle size={11} />
                    {diemUyTin < 4 ? "Cân nhắc dừng hợp tác" : "Cần theo dõi"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500 flex-wrap">
                <span className="font-mono text-xs text-gray-400">{ncc.ma_ncc as string}</span>
                {ncc.tinh_thanh && <span className="flex items-center gap-1"><MapPin size={12} /> {ncc.tinh_thanh as string}</span>}
                {ncc.so_dien_thoai && <span className="flex items-center gap-1"><Phone size={12} /> {ncc.so_dien_thoai as string}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${diemUyTin >= 7 ? "text-green-600" : diemUyTin >= 5 ? "text-amber-500" : "text-red-500"}`}>
                {diemUyTin.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1 justify-center mt-0.5">
                <Star size={10} fill="currentColor" className="text-amber-400" /> Điểm uy tín
              </div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold ${congNo > 0 ? "text-red-600" : "text-green-600"}`}>
                {congNo > 0 ? `${congNo.toLocaleString("vi-VN")}đ` : "Sạch nợ"}
              </div>
              <div className="text-xs text-gray-400">Công nợ hiện tại</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-6 border-t border-gray-100 pt-4 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "info" && <SupplierInfoTab ncc={ncc} onRefresh={fetchNcc} />}
      {activeTab === "products" && <SupplierProductsTab nccId={Number(id)} />}
      {activeTab === "delivery" && <SupplierDeliveryTab ncc={ncc} nccId={Number(id)} onRefresh={fetchNcc} />}
      {activeTab === "debt" && <SupplierDebtTab nccId={Number(id)} />}
      {activeTab === "contracts" && <SupplierContractsTab nccId={Number(id)} />}
    </div>
  );
}
