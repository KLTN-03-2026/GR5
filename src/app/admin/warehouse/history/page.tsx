"use client";

import React, { useEffect, useState } from "react";
import IssueHistory from "@/components/admin/warehouse/IssueHistory";

export default function AdminWarehouseHistoryPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<"import" | "export">("import");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  const fetchHistory = async (tab: "import" | "export", page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/warehouse/history?type=${tab}&page=${page}&limit=${limit}`);
      const json = await res.json();
      if (!json.error) {
        setData(json.data || []);
        setTotalPages(json.meta?.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(activeTab, currentPage);
  }, [activeTab, currentPage]);

  const handleTabChange = (tab: "import" | "export") => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset page on tab change
  };

  if (loading && data.length === 0) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Đang tải biểu mẫu...</div>;
  }

  return (
    <IssueHistory 
      historyData={activeTab === "export" ? data : []} 
      importHistoryData={activeTab === "import" ? data : []}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  );
}
