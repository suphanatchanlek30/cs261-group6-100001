// components/common/Pagination.jsx
"use client";

export default function Pagination({ page = 0, totalPages = 1, onPageChange }) {
  const prev = () => onPageChange(Math.max(0, page - 1));
  const next = () => onPageChange(Math.min(totalPages - 1, page + 1));

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(0)}
        disabled={page === 0}
        className="rounded border border-gray-600 px-2 py-1 text-sm disabled:opacity-40"
      >
        «
      </button>
      <button
        type="button"
        onClick={prev}
        disabled={page === 0}
        className="rounded border border-gray-600 px-2 py-1 text-sm disabled:opacity-40"
      >
        ‹
      </button>
      <span className="rounded bg-violet-500 px-3 py-1 text-sm font-semibold text-white">
        {page + 1}
      </span>
      <button
        type="button"
        onClick={next}
        disabled={page >= totalPages - 1}
        className="rounded border border-gray-600 px-2 py-1 text-sm disabled:opacity-40"
      >
        ›
      </button>
      <button
        type="button"
        onClick={() => onPageChange(totalPages - 1)}
        disabled={page >= totalPages - 1}
        className="rounded border border-gray-600 px-2 py-1 text-sm disabled:opacity-40"
      >
        »
      </button>
    </div>
  );
}
