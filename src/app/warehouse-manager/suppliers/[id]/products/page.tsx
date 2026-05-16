"use client";

import SupplierProductsTab from "@/components/admin/suppliers/SupplierProductsTab";
import { useSupplierDetail } from "@/components/admin/suppliers/SupplierDetailShell";

export default function SupplierProductsPage() {
  const { nccId, loading } = useSupplierDetail();

  if (loading) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        Đang tải dữ liệu sản phẩm...
      </div>
    );
  }

  return <SupplierProductsTab nccId={nccId} />;
}
