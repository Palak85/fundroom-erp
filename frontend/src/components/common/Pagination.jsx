import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = pagination;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 text-sm text-[#77767D]">
      <div>
        Showing <span className="font-bold text-[#1E222B]">{startItem}</span> to{' '}
        <span className="font-bold text-[#1E222B]">{endItem}</span> of{' '}
        <span className="font-bold text-[#1E222B]">{total}</span> results
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-xl bg-white border border-[#DCE0EB] text-[#2D3139] hover:bg-[#EEF0F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
          .map((p, idx, arr) => {
            const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
            return (
              <React.Fragment key={p}>
                {showEllipsis && <span className="px-2 text-[#77767D]">...</span>}
                <button
                  onClick={() => onPageChange(p)}
                  className={`min-w-[36px] h-9 px-3 rounded-xl text-xs font-bold border transition-colors shadow-sm ${
                    p === page
                      ? 'bg-[#5E72C6] border-[#5E72C6] text-white shadow-btn'
                      : 'bg-white border-[#DCE0EB] text-[#2D3139] hover:bg-[#EEF0F6]'
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            );
          })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-xl bg-white border border-[#DCE0EB] text-[#2D3139] hover:bg-[#EEF0F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
