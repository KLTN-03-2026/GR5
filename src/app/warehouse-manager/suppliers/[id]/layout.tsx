import SupplierDetailShell from "@/components/admin/suppliers/SupplierDetailShell";

export default function SupplierDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SupplierDetailShell>{children}</SupplierDetailShell>;
}
