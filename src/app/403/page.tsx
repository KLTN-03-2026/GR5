import Link from "next/link";
import { ShieldX, ArrowLeft, Home } from "lucide-react";

export const metadata = {
  title: "403 – Không có quyền truy cập",
};

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#0A1A17] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 mb-8">
          <ShieldX size={48} className="text-red-400" />
        </div>

        {/* Code */}
        <p className="text-8xl font-black text-red-400/30 leading-none mb-4 select-none">403</p>

        {/* Title */}
        <h1 className="text-2xl font-black text-white mb-3">
          Không có quyền truy cập
        </h1>

        {/* Description */}
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Tài khoản của bạn không có quyền truy cập vào trang này.
          Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3 rounded-xl text-sm transition-all"
          >
            <Home size={16} />
            Về trang chủ
          </Link>
          <Link
            href="javascript:history.back()"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all"
          >
            <ArrowLeft size={16} />
            Quay lại
          </Link>
        </div>
      </div>
    </div>
  );
}
