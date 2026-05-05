"use client";

import { useMemo } from "react";
import { ClipboardList, PackageSearch } from "lucide-react";
import { useSupplierDetail } from "@/components/admin/suppliers/SupplierDetailShell";

export default function SupplierHistoryPage() {
  const { ncc, loading } = useSupplierDetail();

  const historyRows = useMemo(() => ncc?.phieu_nhap_kho ?? [], [ncc]);

  if (loading || !ncc) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        Đang tải lịch sử nhập...
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-slate-950 p-3 text-white">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Lịch sử nhập hàng
          </h2>
          <p className="text-sm text-slate-500">
            Danh sách phiếu nhập gần nhất của nhà cung cấp này.
          </p>
        </div>
      </div>

      {historyRows.length === 0 ? (
        <div className="grid min-h-[220px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
          Chưa có phiếu nhập nào.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Mã phiếu</th>
                <th className="px-4 py-3 text-left font-medium">Ngày tạo</th>
                <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {historyRows.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    #{item.id}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.ngay_tao
                      ? new Date(item.ngay_tao).toLocaleString("vi-VN")
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.trang_thai ?? "N/A"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {Number(item.tong_tien ?? 0).toLocaleString("vi-VN")}đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <PackageSearch className="h-4 w-4" /> Ghi chú nghiệp vụ
        </div>
        <p className="mt-2">
          Tab này hiển thị lịch sử nhập kho từ API NCC hiện có, đủ để đối chiếu
          các đợt nhập và trạng thái phiếu.
        </p>
      </div>
    </div>
  );
}
