// components/common/EmptyState.jsx
"use client";

export default function EmptyState({ onGoSearch }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-24 w-24 rounded-full bg-violet-100" />
      <p className="mt-6 text-neutral-700">No reservations yet. Try starting search</p>
      <button
        type="button"
        onClick={onGoSearch}
        className="mt-4 h-10 w-56 rounded-xl bg-violet-600 font-semibold text-white hover:bg-violet-700 transition"
      >
        Go to Search
      </button>
    </div>
  );
}
