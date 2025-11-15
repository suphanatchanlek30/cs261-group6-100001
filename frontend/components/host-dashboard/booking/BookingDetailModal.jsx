"use client";

import StatusPill from "@/components/payment/StatusPill";
import { formatThaiDate, formatThaiTime, formatTHB } from "./timeHelpers";

export default function BookingDetailModal({ open, onClose, booking }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">รายละเอียดการจอง</h3>
          <button className="rounded px-2 py-1 text-sm hover:bg-gray-100" onClick={onClose}>
            ปิด
          </button>
        </div>
        {!booking ? (
          <div className="py-8 text-center text-gray-500">กำลังโหลด...</div>
        ) : (
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium">รหัส</div>
              <div className="font-mono">{booking.bookingCode || "-"}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-medium">สถานะ</div>
              <StatusPill status={booking.status} />
            </div>
            <div className="flex items-center justify-between">
              <div className="font-medium">ยูนิต</div>
              <div>
                {booking.locationUnitCode} · {booking.locationUnitName}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-medium">ช่วงเวลา</div>
              <div className="text-right">
                <div>
                  {formatThaiDate(booking.startTime)} {formatThaiTime(booking.startTime)}
                </div>
                <div>
                  {formatThaiDate(booking.endTime)} {formatThaiTime(booking.endTime)}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-medium">ชั่วโมง</div>
              <div>{booking.hours}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-medium">ยอดรวม</div>
              <div>{formatTHB(booking.total)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
