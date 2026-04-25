import React from "react";
import WarehouseManagerSidebar from "@/components/warehouse-manager/WarehouseManagerSidebar";
import AdminTopbar from "@/components/admin/layout/AdminTopbar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isThuKho } from "@/lib/rbac";

export default async function WarehouseManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Basic check for THU_KHO inside page/middleware
  if (!session?.user) redirect("/login");
  if (!isThuKho(session.user)) redirect("/403");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <WarehouseManagerSidebar userEmail={session.user.email} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
