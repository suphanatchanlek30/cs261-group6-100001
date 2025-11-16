"use client";

const STATUS_OPTIONS = [
  { value: "", label: "ทุกสถานะ" },
  { value: "HOLD", label: "HOLD" },
  { value: "PENDING_REVIEW", label: "PENDING_REVIEW" },
  { value: "CONFIRMED", label: "CONFIRMED" },
  { value: "CANCELLED", label: "CANCELLED" },
  { value: "EXPIRED", label: "EXPIRED" },
];

export default function BookingFilters({
  status,
  locationId,
  unitId,
  fromDate,
  toDate,
  locations = [],
  units = [],
  onChangeStatus,
  onChangeLocation,
  onChangeUnit,
  onChangeFrom,
  onChangeTo,
  onClear,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">ตัวกรอง</h3>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-violet-600 hover:text-violet-700"
        >
          ล้างตัวกรอง
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-12">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-gray-500">สถานะ</label>
          <select
            className="w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-300"
            value={status}
            onChange={(e) => onChangeStatus?.(e.target.value)}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4">
          <label className="mb-1 block text-xs text-gray-500">สถานที่</label>
          <select
            className="w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-300"
            value={locationId}
            onChange={(e) => onChangeLocation?.(e.target.value)}
          >
            <option value="">ทุกสถานที่</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-gray-500">ยูนิต</label>
          <select
            className="w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-300 disabled:opacity-60"
            value={unitId}
            onChange={(e) => onChangeUnit?.(e.target.value)}
            disabled={!locationId}
          >
            <option value="">ทุกยูนิต</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.code} · {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-gray-500">จากวันที่</label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-300"
            value={fromDate}
            onChange={(e) => onChangeFrom?.(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-gray-500">ถึงวันที่</label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-300"
            value={toDate}
            onChange={(e) => onChangeTo?.(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
