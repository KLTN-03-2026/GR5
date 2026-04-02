import React from "react";
import Link from "next/link";

export function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  alertCount,
}: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3.5 text-[15px] font-medium border-b-2 transition-all whitespace-nowrap ${active ? "border-[#1D9E75] text-[#1D9E75] bg-[#1D9E75]/5" : "border-transparent text-[#888780] hover:text-[#2C2C2A] hover:bg-gray-50"}`}
    >
      <Icon size={18} /> {label}
      {alertCount > 0 && (
        <span className="ml-1 bg-[#E24B4A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {alertCount}
        </span>
      )}
    </button>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
  valueSize = "text-2xl",
}: any) {
  return (
    <div className="bg-[#FFFFFF] p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}
      >
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[13px] font-medium text-[#888780] uppercase tracking-wide">
          {label}
        </p>
        <p className={`${valueSize} font-bold mt-1 text-[#2C2C2A]`}>{value}</p>
      </div>
    </div>
  );
}

export function FormInput({ label, type, options, defaultValue }: any) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#888780] mb-1.5">
        {label}
      </label>
      {type === "select" ? (
        <select className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#1D9E75] text-[#2C2C2A]">
          {options.map((opt: string) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          defaultValue={defaultValue}
          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#1D9E75] text-[#2C2C2A]"
        />
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    normal: {
      color: "bg-teal-50 text-[#1D9E75] border-teal-200",
      label: "Bình thường",
    },
    warning: {
      color: "bg-amber-50 text-[#EF9F27] border-amber-200",
      label: "Sắp hết hạn",
    },
    error: {
      color: "bg-red-50 text-[#E24B4A] border-red-200",
      label: "Hết hạn",
    },
    empty: {
      color: "bg-gray-100 text-[#888780] border-gray-200",
      label: "Kệ trống",
    },
  };
  const c = config[status] || config.empty;
  return (
    <span
      className={`px-2 py-0.5 text-[11px] font-bold border rounded ${c.color}`}
    >
      {c.label}
    </span>
  );
}
