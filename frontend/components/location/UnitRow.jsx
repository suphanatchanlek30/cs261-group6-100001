// components/location/UnitRow.jsx

// แถวของยูนิต + ปุ่ม “select time”

"use client";

export default function UnitRow({ unit, selected, onSelect }) {
  const price = unit?.priceHourly ?? unit?.startingPriceHourly ?? 50;

  return (
    <div
      className={[
        "flex items-center gap-3 p-3 rounded-[12px] border",
        selected ? "border-violet-400 bg-violet-50" : "border-gray-200 bg-white",
      ].join(" ")}
    >
      <img
        src={unit?.imageUrl || "/placeholder.jpg"}
        alt={unit?.name}
        className="h-16 w-20 object-cover rounded-[10px]"
      />

      <div className="flex-1">
        <div className="text-sm font-semibold text-neutral-900">
          {unit?.code ? `${unit.code} - ${unit.name}` : unit?.name}
        </div>
        <div className="mt-1 text-xs text-neutral-600">
          {unit?.description || "An area suitable for reading books."}
        </div>
      </div>

      <div className="text-right">
        <div className="text-[13px] text-violet-700 font-semibold">{price} Bath/hour</div>
        <button
          onClick={() => onSelect?.(unit)}
          className={[
            "mt-2 inline-flex items-center rounded-[12px] px-3 py-1.5 text-sm font-medium",
            "border border-violet-400 text-violet-700 hover:bg-violet-50",
          ].join(" ")}
        >
          {selected ? "selected" : "select time"}
        </button>
      </div>
    </div>
  );
}
