"use client";

import StatusPill from "@/components/payment/StatusPill";
import { formatThaiDate, formatThaiTime, formatTHB } from "./timeHelpers";

export default function BookingsCards({ items = [], loading, onCardClick }) {
  return (
    <div className="space-y-3 md:hidden">
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center text-gray-500 shadow-sm">
          กำลังโหลด...
        </div>
      ) : items.length ? (
        items.map((b) => (
          <button
            key={b.bookingId}
            onClick={() => onCardClick?.(b.bookingId)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="font-mono text-sm text-gray-800">{b.bookingCode || "-"}</div>
              <StatusPill status={b.status} />
            </div>
            <div className="mt-1 font-mono text-[11px] text-gray-500" title={b.bookingId}>
              ID: {(b.bookingId || "").slice(0, 8) || "-"}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-gray-600">
              <div className="truncate">{formatThaiDate(b.startTime)}</div>
              <div className="text-right">{formatThaiTime(b.startTime)} - {formatThaiTime(b.endTime)}</div>
            </div>
            <div className="mt-1 text-sm text-gray-900">{b.locationName || "-"}</div>
            <div className="text-xs text-gray-600">{b.unitCode} · {b.unitName}</div>
            <div className="mt-2 text-right text-sm font-semibold text-gray-900">{formatTHB(b.total)}</div>
          </button>
        ))
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center text-gray-500 shadow-sm">
          ไม่พบรายการ
        </div>
      )}
    </div>
  );
}
