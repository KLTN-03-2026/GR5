"use client";

import SupplierInfoTab from "@/components/admin/suppliers/SupplierInfoTab";
import { useSupplierDetail } from "@/components/admin/suppliers/SupplierDetailShell";

export default function SupplierInfoPage() {
  const { ncc, loading, refresh } = useSupplierDetail();

  if (loading || !ncc) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        Đang tải dữ liệu thông tin nhà cung cấp...
      </div>
    );
  }

  return <SupplierInfoTab ncc={ncc} onRefresh={refresh} />;
}
