"use client";
import { formatTHB } from "../../../utils/format";
import { formatThaiDate, formatThaiTime, normalizeUtc } from "../../../utils/date";

export default function TransactionsTable({ data, loading, page, size, total, onPageChange }) {
  const list = Array.isArray(data) ? data : [];
  const pages = Math.ceil((total || 0) / (size || 1));

  return (
    <div className="p-4 rounded-xl bg-white/70 backdrop-blur border border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-neutral-700">ธุรกรรม</h3>
        {loading && <span className="text-xs text-neutral-400 animate-pulse">กำลังโหลด...</span>}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-neutral-500 border-b border-neutral-200">
              <th className="py-2 pr-3 font-medium">Booking</th>
              <th className="py-2 pr-3 font-medium">Payment</th>
              <th className="py-2 pr-3 font-medium">ยอด</th>
              <th className="py-2 pr-3 font-medium">วิธี</th>
              <th className="py-2 pr-3 font-medium">เวลาอนุมัติ</th>
              <th className="py-2 pr-3 font-medium">สถานที่</th>
            </tr>
          </thead>
          <tbody>
            {loading && list.length === 0 && (
              <tr><td colSpan={6} className="py-6 text-center text-neutral-400">กำลังโหลด...</td></tr>
            )}
            {!loading && list.length === 0 && (
              <tr><td colSpan={6} className="py-6 text-center text-neutral-400">ไม่มีข้อมูล</td></tr>
            )}
            {list.map((tx, idx) => (
              <tr key={buildKey(tx, idx)} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                <td className="py-2 pr-3 whitespace-nowrap text-neutral-700">{tx.bookingId}</td>
                <td className="py-2 pr-3 whitespace-nowrap text-neutral-600">{tx.paymentId || '-'}</td>
                <td className="py-2 pr-3 whitespace-nowrap font-medium text-neutral-800">{formatTHB(tx.amount)}</td>
                <td className="py-2 pr-3 whitespace-nowrap text-neutral-700">{tx.method || '-'}</td>
                <td className="py-2 pr-3 whitespace-nowrap text-neutral-600">{renderApprovedAt(tx.approvedAt)}</td>
                <td className="py-2 pr-3 whitespace-nowrap text-neutral-700">{tx.locationName || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            disabled={page <= 0}
            onClick={() => onPageChange?.(page - 1)}
            className="px-3 py-1 rounded-md text-xs border border-neutral-300 bg-white disabled:opacity-40"
          >ก่อนหน้า</button>
          <span className="text-xs text-neutral-600">{page + 1} / {pages}</span>
          <button
            disabled={page >= pages - 1}
            onClick={() => onPageChange?.(page + 1)}
            className="px-3 py-1 rounded-md text-xs border border-neutral-300 bg-white disabled:opacity-40"
          >ถัดไป</button>
        </div>
      )}
    </div>
  );
}

function renderApprovedAt(val) {
  if (!val) return '-';
  try {
    const d = normalizeUtc(val);
    return `${formatThaiDate(d)} ${formatThaiTime(d)}`;
  } catch (_) {
    return '-';
  }
}

function buildKey(tx, idx) {
  const base = tx.id || tx.paymentId || tx.bookingId || 'tx';
  return `${base}-${idx}`;
}
