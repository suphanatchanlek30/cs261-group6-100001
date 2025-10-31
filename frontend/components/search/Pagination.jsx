// components/search/Pagination.jsx

"use client";

export default function Pagination({ page, totalPages, setPage }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 flex items-center justify-center gap-2 select-none">
      <PageBtn label="«" onClick={() => setPage(0)} disabled={page === 0} />
      <PageBtn label="‹" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} />

      {page > 1 && <PageNumber n={1} onClick={() => setPage(0)} />}
      {page > 2 && <Dots />}
      {Array.from({ length: totalPages }, (_, i) => i)
        .filter(i => Math.abs(i - page) <= 1)
        .map(i => (
          <PageNumber key={i} n={i + 1} active={i === page} onClick={() => setPage(i)} />
        ))}
      {page < totalPages - 3 && <Dots />}
      {page < totalPages - 2 && (
        <PageNumber n={totalPages} onClick={() => setPage(totalPages - 1)} />
      )}

      <PageBtn label="›" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} />
      <PageBtn label="»" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} />
    </div>
  );
}

function PageBtn({ label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-9 w-9 rounded-[10px] border border-gray-300 bg-white text-sm font-semibold disabled:opacity-40 hover:bg-gray-50"
    >
      {label}
    </button>
  );
}

function PageNumber({ n, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "h-9 w-9 rounded-[10px] text-sm font-semibold",
        active
          ? "bg-[#7C3AED] text-white shadow-[0_8px_20px_rgba(124,58,237,.28)]"
          : "bg-white border border-gray-300 hover:bg-gray-50",
      ].join(" ")}
    >
      {n}
    </button>
  );
}

function Dots() {
  return <span className="mx-1 text-gray-500">…</span>;
}
