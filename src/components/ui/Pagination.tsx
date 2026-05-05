import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const generatePagination = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const paginationItems = generatePagination();

  return (
    <div className="mt-4 px-6 py-4 bg-gray-50/50 border-t flex justify-between items-center rounded-b-xl">
      <span className="text-sm font-medium text-gray-500">
        Trang {currentPage} / {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          className="w-8 h-8 flex items-center justify-center bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {paginationItems.map((item, index) =>
          item === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold"
            >
              ...
            </span>
          ) : (
            <button
              key={`page-${item}`}
              onClick={() => onPageChange(Number(item))}
              className={`w-8 h-8 flex items-center justify-center rounded font-bold transition-all ${
                currentPage === item
                  ? "bg-[#006b2c] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#006b2c]"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          className="w-8 h-8 flex items-center justify-center bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}