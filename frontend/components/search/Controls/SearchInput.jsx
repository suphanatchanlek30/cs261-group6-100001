// components/search/Controls/SearchInput.jsx

"use client";

// ช่องค้นหา + ไอคอน

import { FiSearch } from "react-icons/fi";

export default function SearchInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 h-10 min-w-[140px] sm:min-w-[200px] w-full max-w-[640px] rounded-[12px] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)] ring-1 ring-black/5 px-3">
      <FiSearch className="w-4 h-4 text-neutral-500" />
      <input
        type="text"
        placeholder="Search by name or keyword"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-500 focus:outline-none"
      />
    </div>
  );
}
