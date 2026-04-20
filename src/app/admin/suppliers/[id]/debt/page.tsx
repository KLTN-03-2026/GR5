"use client";

import SupplierDebtTab from "@/components/admin/suppliers/SupplierDebtTab";
import { useSupplierDetail } from "@/components/admin/suppliers/SupplierDetailShell";

export default function SupplierDebtPage() {
  const { nccId, loading } = useSupplierDetail();

  if (loading) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        Đang tải công nợ...
      </div>
    );
  }

  return <SupplierDebtTab nccId={nccId} />;
}
