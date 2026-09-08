"use client";

import { AppSelect } from "@/components/app-select";
import { cn } from "@/lib/utils";

function buildPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const normalized = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
  const items: Array<number | "ellipsis"> = [];

  for (let index = 0; index < normalized.length; index += 1) {
    const page = normalized[index];
    const previous = normalized[index - 1];

    if (previous && page - previous > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  }

  return items;
}

export function PaginationControls({
  currentPage,
  pageSize,
  pageSizeOptions,
  totalItems,
  itemLabel = "items",
  pageSizeLabel = "Rows",
  onPageChange,
  onPageSizeChange
}: {
  currentPage: number;
  pageSize: number;
  pageSizeOptions: number[];
  totalItems: number;
  itemLabel?: string;
  pageSizeLabel?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageItems = buildPageItems(currentPage, totalPages);
  const hasItems = totalItems > 0;
  const startItem = hasItems ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = hasItems ? Math.min(currentPage * pageSize, totalItems) : 0;

  return (
    <div className="flex flex-col gap-3 px-5 py-3.5 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Showing</span>
          <span className="font-medium text-slate-900">{hasItems ? `${startItem}-${endItem}` : "0"}</span>
          <span className="text-slate-400">of</span>
          <span className="font-medium text-slate-900">{totalItems}</span>
          <span className="text-slate-400">{itemLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">{pageSizeLabel}</span>
          <AppSelect
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/10"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </AppSelect>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="inline-flex h-9 items-center justify-center px-1.5 text-slate-400">
                ...
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                className={cn(
                  "inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl border px-3 text-sm font-medium transition",
                  item === currentPage
                    ? "border-[#c8d8ff] bg-[#eef4ff] text-[#386df4]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                {item}
              </button>
            )
          )}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
      </div>
    </div>
  );
}
