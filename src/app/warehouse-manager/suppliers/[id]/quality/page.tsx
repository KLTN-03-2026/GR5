"use client";

import SupplierDeliveryTab from "@/components/admin/suppliers/SupplierDeliveryTab";
import { useSupplierDetail } from "@/components/admin/suppliers/SupplierDetailShell";

export default function SupplierQualityPage() {
  const { ncc, nccId, loading, refresh } = useSupplierDetail();

  if (loading || !ncc) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        Đang tải chất lượng NCC...
      </div>
    );
  }

  return <SupplierDeliveryTab ncc={ncc} nccId={nccId} onRefresh={refresh} />;
}
