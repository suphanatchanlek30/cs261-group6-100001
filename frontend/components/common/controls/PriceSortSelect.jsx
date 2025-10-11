// components/common/controls/PriceSortSelect.jsx

"use client";
import { useRef, useMemo } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function PriceSortSelect({
  sort = "price_asc",
  setSort,
  options = [
    { value: "price_asc", label: "Price(Low → High)" },
    { value: "price_desc", label: "Price(High → Low)" },
  ],
}) {
  const detailsRef = useRef(null);
  const current = useMemo(
    () => options.find((o) => o.value === sort) ?? options[0],
    [sort, options]
  );

  return (
    <div className="relative">
      <details ref={detailsRef} className="group">
        <summary className="flex list-none cursor-pointer items-center gap-2 h-10 px-3 rounded-[10px] bg-white text-sm font-medium text-neutral-800 shadow-[0_1px_6px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
          <span className="truncate">{current.label}</span>
          <FiChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
        </summary>

        <div className="absolute top-[44px] right-0 w-56 rounded-xl bg-white p-1 shadow-2xl ring-1 ring-gray-300 z-50">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setSort(opt.value);
                detailsRef.current?.removeAttribute("open");
              }}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                sort === opt.value ? "bg-[#7C3AED] text-white" : "text-neutral-700 hover:bg-violet-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
