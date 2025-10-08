// components/home/PopularFilters.jsx
"use client";

export default function PopularFilters({ items = [], onSelect }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onSelect?.(item)}
          className="rounded-full border border-[#9747FF] bg-white text-[#9747FF] px-4 py-1.5 text-sm hover:bg-gray-50"
          type="button"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
