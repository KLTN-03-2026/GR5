"use client";
import {
  GripVertical,
  Link as LinkIcon,
  Calendar,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Banner } from "@/types";

export function BannerRow({ banner }: { banner: Banner }) {
  return (
    <div
      className={cn(
        "flex items-center px-8 py-6 hover:bg-emerald-50/30 transition-colors group",
        !banner.isActive && "opacity-75",
      )}
    >
      <div className="cursor-grab active:cursor-grabbing mr-6 text-emerald-300 group-hover:text-emerald-600 transition-colors">
        <GripVertical className="w-5 h-5" />
      </div>

      <div
        className={cn(
          "w-48 aspect-video rounded-xl overflow-hidden bg-emerald-100 flex-shrink-0 relative shadow-sm border border-emerald-100",
          !banner.isActive && "grayscale",
        )}
      >
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="ml-8 flex-grow">
        <h4
          className={cn(
            "font-bold text-lg",
            banner.isActive ? "text-[#171d16]" : "text-emerald-900/60",
          )}
        >
          {banner.title}
        </h4>
        <div className="flex items-center gap-4 mt-1 text-sm font-medium text-emerald-700">
          <div className="flex items-center gap-1">
            <LinkIcon size={14} />
            <span>{banner.url}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{banner.startDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-50 hover:bg-[#006b2c] hover:text-white transition-all">
          <Pencil size={16} />
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-50 hover:bg-red-500 hover:text-white transition-all">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
