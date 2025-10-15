// components/common/controls/DistanceSelect.jsx

"use client";
import { useRef } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function DistanceSelect({ value, setValue, options = [5, 10, 20] }) {
  const detailsRef = useRef(null);

  return (
    <div className="relative">
      <details ref={detailsRef} className="group">
        <summary className="flex list-none cursor-pointer items-center gap-2 h-10 px-3 rounded-[10px] bg-white text-sm font-medium text-neutral-800 shadow-[0_1px_6px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
          <span className="hidden sm:inline">Distance</span>
          <span className="font-semibold">{value} km</span>
          <FiChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
        </summary>

        <div className="absolute top-[44px] right-0 w-44 rounded-xl bg-white p-1 shadow-2xl ring-1 ring-gray-300 z-50">
          {options.map((d) => (
            <button
              key={d}
              onClick={() => {
                setValue(d);
                detailsRef.current?.removeAttribute("open");
              }}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                value === d ? "bg-[#7C3AED] text-white" : "text-neutral-700 hover:bg-violet-50"
              }`}
            >
              {d} km
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
