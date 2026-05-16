"use client";

import Link from "next/link";
import { Clock, ArrowLeft, Building2 } from "lucide-react";

export default function B2BPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-24">
      <div className="max-w-lg w-full text-center">

        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-[#f0fdf4] border border-[#d1fae5] flex items-center justify-center mx-auto mb-8">
          <Building2 className="w-9 h-9 text-[#16a34a]" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 mb-6">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-medium text-amber-700">Đang phát triển</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-[#111827] mb-4 leading-snug">
          Dịch vụ B2B<br />
          <span className="text-[#16a34a]">sắp ra mắt</span>
        </h1>

        {/* Description */}
        <p className="text-[#6b7280] text-[15px] leading-relaxed mb-4 max-w-md mx-auto">
          Chúng tôi đang xây dựng nền tảng cung ứng chuyên biệt dành cho nhà hàng,
          khách sạn và bếp ăn tập thể.
        </p>
        <p className="text-[#9ca3af] text-sm mb-10">
          Vui lòng quay lại sau, hoặc liên hệ trực tiếp nếu có nhu cầu cấp thiết.
        </p>

        {/* Divider */}
        <div className="border-t border-[#e5e7eb] mb-10" />

        {/* Tính năng sắp có */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
          {[
            { emoji: "📦", label: "Đặt hàng sỉ", desc: "Đơn từ 50kg/tuần" },
            { emoji: "📋", label: "Hóa đơn VAT", desc: "Xuất tự động" },
            { emoji: "🤝", label: "Hợp đồng định kỳ", desc: "Giá cố định theo quý" },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4"
            >
              <div className="text-xl mb-2">{f.emoji}</div>
              <p className="text-[13px] font-semibold text-[#111827]">{f.label}</p>
              <p className="text-[12px] text-[#9ca3af] mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="mailto:b2b@verdantcurator.vn"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-[#16a34a] text-white rounded-lg font-medium text-sm hover:bg-[#15803d] transition-colors"
          >
            Liên hệ đội ngũ B2B
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-white border border-[#e5e7eb] text-[#374151] rounded-lg font-medium text-sm hover:border-[#d1d5db] hover:bg-[#f9fafb] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Về trang chủ
          </Link>
        </div>

      </div>
    </main>
  );
}
