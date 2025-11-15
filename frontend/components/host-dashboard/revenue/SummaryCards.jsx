"use client";
import { formatTHB } from "../../../utils/format";

export default function SummaryCards({ points, loading }) {
  const totals = computeTotals(points);
  const items = [
    { label: "รายได้รวม", value: formatTHB(totals.totalRevenue) },
    { label: "จำนวนการจอง", value: totals.totalBookings },
    { label: "เฉลี่ยต่อการจอง", value: formatTHB(totals.avgPerBooking) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((it) => (
        <div key={it.label} className="p-4 rounded-xl bg-white/70 backdrop-blur border border-neutral-200 shadow-sm flex flex-col">
          <span className="text-xs font-medium text-neutral-500 tracking-wide">{it.label}</span>
          <span className="mt-2 text-xl font-semibold text-neutral-800">
            {loading ? <Skeleton /> : it.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function computeTotals(list = []) {
  if (!list.length) return { totalRevenue: 0, totalBookings: 0, avgPerBooking: 0 };
  let r = 0, b = 0;
  list.forEach(p => {
    r += Number(p.totalRevenue || 0);
    b += Number(p.totalBookings || 0);
  });
  return { totalRevenue: r, totalBookings: b, avgPerBooking: b ? r / b : 0 };
}

function Skeleton() {
  return <span className="inline-block h-5 w-20 rounded bg-neutral-200 animate-pulse" />;
}
