// components/location/UnitList.jsx

// รายการยูนิตทั้งหมด

"use client";

import UnitRow from "./UnitRow";

export default function UnitList({ units = [], selectedUnitId, onSelect }) {
  return (
    <div className="rounded-[14px] border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900 mb-3">
        Units available for booking
      </h3>

      <div className="space-y-3">
        {units.length === 0 ? (
          <div className="text-sm text-neutral-500">No units available.</div>
        ) : (
          units.map((u) => (
            <UnitRow
              key={u.id}
              unit={u}
              selected={selectedUnitId === u.id}
              onSelect={(unit) => onSelect?.(unit)}
            />
          ))
        )}
      </div>
    </div>
  );
}
