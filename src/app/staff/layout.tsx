import React from "react";
import StaffSidebar from "@/components/staff/layout/StaffSidebar";
import StaffTopbar from "@/components/staff/layout/StaffTopbar";
import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/rbac";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Vận Hành - Nông Sản",
  description: "Trang dành cho nhân viên vận hành",
};

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Double-check: middleware đã chặn rồi nhưng layout guard thêm lớp bảo vệ
  if (!session?.user) redirect("/login");
  if (!isStaff(session.user)) redirect("/403");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar cố định bên trái */}
      <StaffSidebar />

      {/* Cột phải chứa Topbar và Nội dung */}
      <div className="flex-1 flex flex-col min-w-0">
        <StaffTopbar />

        {/* Main content có thể cuộn */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
