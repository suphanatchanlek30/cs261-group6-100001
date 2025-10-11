// components/home/PopularFilters.jsx

"use client";

export default function PopularFilters({ items = [], active, onSelect }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {items.map((item) => {
        const isActive = active === item;
        return (
          <button
            key={item}
            onClick={() => onSelect?.(item === active ? null : item)}
            type="button"
            className={[
              "rounded-full px-4 py-1.5 text-sm border transition",
              isActive
                ? "bg-[#9747FF] text-white border-[#9747FF]"
                : "bg-white text-[#9747FF] border-[#9747FF] hover:bg-gray-50",
            ].join(" ")}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
