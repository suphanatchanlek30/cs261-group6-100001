// components/mybooking/BookingCard.jsx
"use client";

import { MdOutlineStar, MdContentCopy } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";
import { GoPeople, GoClock } from "react-icons/go";
import { RiVolumeMuteLine } from "react-icons/ri";
import { IoWifi } from "react-icons/io5";

function StatusPill({ status }) {
  const map = {
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-rose-100 text-rose-700",
    PENDING_REVIEW: "bg-cyan-100 text-cyan-700",
    HOLD: "bg-amber-100 text-amber-700",
    EXPIRED: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
        map[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {String(status || "").replace("_", " ")}
    </span>
  );
}

/** การ์ดแสดงรายการจอง */
export default function BookingCard({
  coverImageUrl,
  status,
  locationName,
  unitLabel,
  addressText,
  rating = 0,
  reviewCount = 0,
  capacity,
  quiet,
  wifi,
  dateText,
  timeText,
  hours,
  bookingCode,
  total,
  onCancel,
  onPay,
  onReview,
  canPay,
  canCancel,
  canReview,
}) {
  const showReview =
    typeof canReview === "boolean" ? canReview : status === "CONFIRMED";
  const showCancel =
    typeof canCancel === "boolean"
      ? canCancel
      : status === "PENDING_REVIEW" || status === "HOLD";
  const showPay = typeof canPay === "boolean" ? canPay : status === "HOLD";

  return (
    <div className="relative flex gap-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow transition">
      <img
        src={coverImageUrl || "/placeholder.jpg"}
        alt={unitLabel || "unit"}
        className="h-28 w-36 rounded-xl object-cover"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <StatusPill status={status} />
          <div className="flex items-center gap-0.5 text-amber-400">
            {Array.from({ length: Math.min(5, Number(rating) || 0) }).map(
              (_, i) => (
                <MdOutlineStar key={i} size={18} />
              )
            )}
          </div>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-neutral-900">
            {locationName}
          </h3>
          <span className="text-base font-semibold text-violet-600">
            {unitLabel}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
          <span className="inline-flex items-center gap-1">
            <CiLocationOn /> {addressText}
          </span>
          <span className="inline-flex items-center gap-1">
            <GoPeople /> {capacity}
          </span>
          {quiet && (
            <span className="inline-flex items-center gap-1">
              <RiVolumeMuteLine /> Quiet
            </span>
          )}
          {wifi && (
            <span className="inline-flex items-center gap-1">
              <IoWifi /> Wi-Fi
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
          <span>Booking Date: {dateText}</span>
          <span className="inline-flex items-center gap-1">
            <GoClock /> {timeText} ({hours} {hours > 1 ? "hours" : "hour"})
          </span>
          {!!bookingCode && (
            <span className="inline-flex items-center gap-1">
              <MdContentCopy size={16} /> Booking Code: {bookingCode}
            </span>
          )}
        </div>

        <div className="mt-1 text-sm font-semibold text-violet-700">
          Total {typeof total === "number" ? total.toFixed(2) : total} Baht
        </div>
      </div>

      <div className="absolute right-3 bottom-3 flex gap-2">
        {showPay && (
          <button
            type="button"
            onClick={onPay}
            className="rounded-xl border border-amber-400 px-3 py-1.5 text-sm font-semibold text-amber-600 hover:bg-amber-400 hover:text-white transition"
          >
            Payment
          </button>
        )}
        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-rose-500 px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-500 hover:text-white transition"
          >
            Cancel the booking
          </button>
        )}
        {showReview && (
          <button
            type="button"
            onClick={onReview}
            className="rounded-xl border border-violet-600 px-3 py-1.5 text-sm font-semibold text-violet-700 hover:bg-violet-600 hover:text-white transition"
          >
            Rate & Review
          </button>
        )}
      </div>
    </div>
  );
}
