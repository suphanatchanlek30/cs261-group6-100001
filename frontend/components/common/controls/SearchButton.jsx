// components/common/controls/SearchButton.jsx

"use client";

export default function SearchButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="h-10 px-4 rounded-[10px] bg-[#7C3AED] text-white text-sm font-medium
                 shadow-[0_8px_20px_rgba(124,58,237,.28)] hover:bg-[#6D28D9]
                 active:scale-[0.98] transition"
    >
      Search
    </button>
  );
}
