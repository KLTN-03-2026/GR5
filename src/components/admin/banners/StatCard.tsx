"use client";
import { cn } from "@/lib/utils";
import { Stat } from "@/types";

export function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-emerald-100/50 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div
          className={cn(
            "p-3 rounded-2xl",
            stat.status === "active"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-50 text-slate-500",
          )}
        >
          {/* Icon mặc định hoặc xử lý theo type của Phú */}
          <div className="w-5 h-5 bg-current rounded-md opacity-20" />
        </div>
        {stat.trend && (
          <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-slate-50 text-slate-500 uppercase">
            {stat.trend}
          </span>
        )}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
        {stat.label}
      </p>
      <h3 className="text-3xl font-black text-[#0D261B] mt-1">
        {stat.value || "---"}
      </h3>
    </div>
  );
}
