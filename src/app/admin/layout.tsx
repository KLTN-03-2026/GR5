import React from "react";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminTopbar from "@/components/admin/layout/AdminTopbar";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Double-check: middleware đã chặn rồi nhưng layout guard thêm lớp bảo vệ
  if (!session?.user) redirect("/login");
  if (!isAdmin(session.user)) redirect("/403");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar cố định bên trái */}
      <AdminSidebar />

      {/* Cột phải chứa Topbar và Nội dung */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />

        {/* Main content có thể cuộn */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
