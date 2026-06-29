import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  theme?: "dark" | "light";
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  theme = "dark",
}: PaginationProps) {
  if (!totalPages || totalPages <= 1) return null;

  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-center gap-2 mt-8 py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-1 ${
          isDark
            ? "bg-[#111a3b] border border-[#23356f] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#e5c158] hover:text-[#e5c158]"
            : "bg-white border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-900 hover:text-red-900 shadow-sm"
        }`}
      >
        &larr; Trang trước
      </button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          if (
            totalPages > 7 &&
            page !== 1 &&
            page !== totalPages &&
            Math.abs(page - currentPage) > 1
          ) {
            if (page === 2 || page === totalPages - 1) {
              return (
                <span
                  key={page}
                  className={`px-2 select-none ${isDark ? "text-slate-500" : "text-gray-400"}`}
                >
                  ...
                </span>
              );
            }
            return null;
          }

          const isActive = currentPage === page;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center ${
                isActive
                  ? isDark
                    ? "bg-[#e5c158] text-black shadow-lg shadow-[#e5c158]/20 font-bold scale-105"
                    : "bg-red-900 text-white shadow-md shadow-red-900/20 font-bold scale-105"
                  : isDark
                  ? "bg-[#111a3b] border border-[#23356f] text-white hover:border-[#e5c158] hover:text-[#e5c158]"
                  : "bg-white border border-gray-300 text-gray-700 hover:border-red-900 hover:text-red-900 shadow-sm"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-1 ${
          isDark
            ? "bg-[#111a3b] border border-[#23356f] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#e5c158] hover:text-[#e5c158]"
            : "bg-white border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-900 hover:text-red-900 shadow-sm"
        }`}
      >
        Trang sau &rarr;
      </button>
    </div>
  );
}
