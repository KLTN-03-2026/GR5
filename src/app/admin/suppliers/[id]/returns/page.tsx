"use client";
import SupplierReturnTab from "@/components/admin/suppliers/SupplierReturnTab";
import { useSupplierDetail } from "@/components/admin/suppliers/SupplierDetailShell";

export default function SupplierReturnsPage() {
  const { nccId } = useSupplierDetail();
  return <SupplierReturnTab nccId={nccId} />;
}
