"use client";

import { redirect } from "next/navigation";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/suppliers/${id}/info`);
}
