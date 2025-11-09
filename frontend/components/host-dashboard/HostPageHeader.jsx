// components/host-dashboard/HostPageHeader.jsx

// หัวตาราง + search + ปุ่ม Add (สำหรับ Host)

"use client";
import { FiSearch, FiPlus } from "react-icons/fi";

export default function HostPageHeader({
  title = "Manage Listings",
  placeholder = "Search by name or keyword",
  onSearch,
  onAdd,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#1F2937]">{title}</h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:flex-1 md:w-[360px] rounded-lg border border-gray-200 bg-white px-3 py-2.5">
            <FiSearch className="text-gray-500 flex-shrink-0" />
            <input
              type="text"
              placeholder={placeholder}
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full outline-none text-sm placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={onAdd}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#7C3AED] text-white px-4 py-2.5 text-sm font-semibold shadow hover:bg-[#6B2FE5] transition-colors whitespace-nowrap"
          >
            <FiPlus className="text-base" />
            <span className="hidden sm:inline">Add Listing</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
