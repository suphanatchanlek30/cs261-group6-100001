"use client";

import StatusPill from "@/components/payment/StatusPill";
import { formatThaiDate, formatThaiTime, formatTHB } from "./timeHelpers";

export default function BookingsTable({ items = [], loading, onRowClick }) {
  return (
    <div className="hidden md:block">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">bookingId</th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">bookingCode</th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">สถานะ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">เวลา</th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600">ชั่วโมง</th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600">ยอดรวม</th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">สถานที่</th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">ยูนิต</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={8}>
                  กำลังโหลด...
                </td>
              </tr>
            ) : items.length ? (
              items.map((b) => (
                <tr
                  key={b.bookingId}
                  className="cursor-pointer transition hover:bg-violet-50/50"
                  onClick={() => onRowClick?.(b.bookingId)}
                >
                  <td className="px-4 py-3 font-mono text-[12px] text-gray-800" title={b.bookingId}>
                    {(b.bookingId || "").slice(0, 8) || "-"}
                  </td>
                  <td className="px-4 py-3 font-mono text-[13px] text-gray-800">{b.bookingCode || "-"}</td>
                  <td className="px-4 py-3"><StatusPill status={b.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="flex flex-col">
                      <span>{formatThaiDate(b.startTime)}</span>
                      <span className="text-xs text-gray-500">{formatThaiTime(b.startTime)} - {formatThaiTime(b.endTime)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-800">{b.hours}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{formatTHB(b.total)}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{b.locationName || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{b.unitCode} · {b.unitName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={8}>
                  ไม่พบรายการ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
