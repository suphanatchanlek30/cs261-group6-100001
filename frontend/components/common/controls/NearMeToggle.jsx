// components/common/controls/NearMeToggle.jsx

"use client";
import { FiMapPin } from "react-icons/fi";

export default function NearMeToggle({ on, setOn }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setOn((v) => !v)}
      className={`flex items-center gap-2 h-10 px-3 rounded-[10px] text-sm font-medium transition-colors
        ${on ? "bg-white text-neutral-800 shadow-[0_1px_6px_rgba(0,0,0,.06)] ring-1 ring-black/5" : "bg-white/80 text-neutral-600 ring-1 ring-black/5"}`}
    >
      <FiMapPin className="shrink-0 w-4 h-4" />
      <span className="hidden sm:inline">Near Me</span>
    </button>
  );
}
