import React from "react";
import StaffSidebar from "@/components/staff/layout/StaffSidebar";
import StaffTopbar from "@/components/staff/layout/StaffTopbar";

export const metadata = {
  title: "Vận Hành - Nông Sản",
  description: "Trang dành cho nhân viên vận hành",
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
