// components/home/parts/PopularFilters.jsx
"use client";

export default function PopularFilters({ items = [], active, onSelect }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-8">
      {items.map((item) => {
        const isActive = active === item;
        return (
          <button
            key={item}
            onClick={() => onSelect?.(item === active ? null : item)}
            type="button"
            className={[
              "rounded-full px-4 py-1.5 text-sm border transition shadow-sm",
              isActive
                ? "bg-white text-[#7C3AED] border-[#7C3AED] shadow-[0_6px_16px_rgba(124,58,237,.18)]"
                : "bg-white text-[#7C3AED] border-[#E9D5FF] hover:bg-violet-50",
            ].join(" ")}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
