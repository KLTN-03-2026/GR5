"use client";

import React, { useEffect, useState } from "react";
import { Package, TrendingUp, TrendingDown } from "lucide-react";

interface NccProduct {
  id: number;
  ma_san_pham: number;
  gia_nhap_gan_nhat?: number;
  don_vi_tinh?: string;
  so_luong_toi_thieu?: number;
  thoi_gian_giao_hang_ngay?: number;
  ghi_chu?: string;
  ngay_cap_nhat_gia?: string;
  san_pham: { id: number; ten_san_pham: string };
}

export default function SupplierProductsTab({ nccId }: { nccId: number }) {
  const [products, setProducts] = useState<NccProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/ncc/${nccId}`)
      .then((r) => r.json())
      .then((d) => { setProducts(d.ncc_san_pham ?? []); setLoading(false); });
  }, [nccId]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-800">Sản phẩm NCC có thể cung cấp</h2>
        <p className="text-xs text-gray-400">Cập nhật giá khi tạo phiếu nhập kho mới</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Package size={36} className="mx-auto mb-2 opacity-30" />
          <p>Chưa có sản phẩm nào được liên kết với NCC này.</p>
          <p className="text-xs mt-1">Sản phẩm sẽ tự động xuất hiện khi tạo phiếu nhập kho từ NCC này.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Sản phẩm</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Đơn vị</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Giá nhập gần nhất</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">SL tối thiểu</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Lead time</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.san_pham.ten_san_pham}</td>
                  <td className="px-4 py-3 text-gray-600">{p.don_vi_tinh ?? "—"}</td>
                  <td className="px-4 py-3">
                    {p.gia_nhap_gan_nhat ? (
                      <span className="font-bold text-blue-600">{Number(p.gia_nhap_gan_nhat).toLocaleString("vi-VN")}đ</span>
                    ) : <span className="text-gray-400">Chưa có</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.so_luong_toi_thieu ?? 1}</td>
                  <td className="px-4 py-3 text-gray-600">{p.thoi_gian_giao_hang_ngay ?? 1} ngày</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {p.ngay_cap_nhat_gia ? new Date(p.ngay_cap_nhat_gia).toLocaleDateString("vi-VN") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
