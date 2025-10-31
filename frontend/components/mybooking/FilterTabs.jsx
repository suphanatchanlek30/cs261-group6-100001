// components/mybooking/FilterTabs.jsx
"use client";

const TABS = [
  { key: "HOLD", label: "Pending payment" },
  { key: "PENDING_REVIEW", label: "Waiting for approval" },
  { key: "CONFIRMED", label: "Success" },
  { key: "CANCELLED", label: "Cancel" },
  // ถ้ามี EXPIRED ในระบบและอยากโชว์:
  // { key: "EXPIRED", label: "Expired" },
];

export default function FilterTabs({ value, onChange }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {TABS.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(active ? undefined : t.key)}
            className={[
              "rounded-xl px-3 py-1.5 text-sm border transition-colors",
              active
                ? "bg-violet-500 text-white border-violet-500"
                : "bg-white text-violet-700 border-violet-600 hover:bg-violet-50",
            ].join(" ")}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
