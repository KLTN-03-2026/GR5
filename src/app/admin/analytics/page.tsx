"use client";

import { useState } from "react";
import { StatCard } from "@/components/admin/banners/StatCard";
import { BannerRow } from "@/components/admin/banners/BannerRow";
import {
  ChevronRight,
  Plus,
  Filter,
  SortAsc,
  Info,
  ChevronLeft,
} from "lucide-react";
import { motion } from "framer-motion"; // Phú đang dùng motion/react hoặc framer-motion đều được
import type { Banner, Stat } from "@/types";

const mockStats: Stat[] = [
  { label: "Tổng Banner", value: 12, trend: "+2 tháng này", trendType: "up" },
  { label: "Đang hiển thị", value: "05" },
  { label: "Tỷ lệ Click", value: "3.4%", trend: "↑ 12%", trendType: "up" },
  { label: "Trạng thái", value: "Ổn định", status: "active" },
];

const mockBanners: Banner[] = [
  {
    id: "1",
    title: "Khuyến mãi Mùa Gặt 2026",
    url: "/khuyen-mai-mua-gat",
    startDate: "01/10",
    endDate: "30/10",
    order: 1,
    isActive: true,
    imageUrl:
      "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=500",
  },
  {
    id: "2",
    title: "Sản phẩm GlobalGap mới",
    url: "/global-gap-fresh",
    startDate: "Vĩnh viễn",
    endDate: "",
    order: 2,
    isActive: true,
    imageUrl:
      "https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=500",
  },
];

export default function BannersPage() {
  const [banners] = useState<Banner[]>(mockBanners);

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <nav className="flex items-center gap-2 text-sm text-emerald-600 mb-2 font-medium">
            <span>Trang chủ</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#006b2c] font-semibold">
              Cấu hình Banner
            </span>
          </nav>
          <h2 className="text-4xl font-black text-[#171d16] tracking-tight italic uppercase">
            Quản lý Banner
          </h2>
          <p className="text-emerald-900/60 mt-2 max-w-xl leading-relaxed font-medium">
            Sắp xếp, cập nhật các chương trình khuyến mãi nông sản tại trang
            chủ.
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group flex items-center gap-2 bg-[#006b2c] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-900/20 hover:bg-black transition-all"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Thêm Banner mới
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {mockStats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <StatCard stat={stat} />
          </motion.div>
        ))}
      </div>

      {/* Banner List Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-emerald-100/50"
      >
        <div className="px-8 py-6 bg-[#F1FAF4]/50 flex justify-between items-center border-b border-emerald-50">
          <h3 className="font-black text-lg text-[#0D261B] italic uppercase">
            Danh sách hiển thị
          </h3>
          <div className="flex gap-2">
            <button className="p-2.5 bg-white shadow-sm rounded-xl text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2.5 bg-white shadow-sm rounded-xl text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all">
              <SortAsc className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-emerald-50">
          {banners.map((banner) => (
            <BannerRow key={banner.id} banner={banner} />
          ))}
        </div>

        {/* Pagination */}
        <div className="px-8 py-5 bg-white flex justify-between items-center border-t border-emerald-50">
          <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest">
            Hiển thị{" "}
            <span className="text-[#171d16]">1 - {banners.length}</span> của{" "}
            <span className="text-[#171d16]">12</span> banner
          </p>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-emerald-50 text-emerald-600">
              <ChevronLeft size={18} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-[#006b2c] text-white font-black">
              1
            </button>
            <button className="w-10 h-10 rounded-xl hover:bg-emerald-50 font-bold">
              2
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-emerald-50 text-emerald-600">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Info Tip Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4 bg-[#00873a]/5 p-6 rounded-[2rem] border border-[#00873a]/10"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#00873a]/10 flex items-center justify-center text-[#00873a]">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <h5 className="font-black text-[#00873a] uppercase italic text-sm">
            Mẹo quản trị
          </h5>
          <p className="text-emerald-900/70 text-sm font-medium mt-0.5">
            Phú có thể nắm kéo biểu tượng ⠿ ở đầu mỗi banner để thay đổi thứ tự
            ưu tiên trên App/Web.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
