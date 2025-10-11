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
      className={`px-2 py-0.5 text-xs font-semibold rounded-full  ${
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
    <div className="relative flex items-stretch gap-4 rounded-2xl border border-gray-200 bg-white p-0 shadow-sm hover:shadow transition overflow-hidden">
    {/* ภาพซ้าย: เต็มสูงการ์ด */}
    <div className="relative w-34 shrink-0 sm:w-38 md:w-46">
      <img
        src={coverImageUrl || "/placeholder.jpg"}
        alt={unitLabel || "unit"}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>

      <div className="flex-1 min-w-0 space-y-2 pl-2 pt-4 pb-4">
        <div className="flex items-center justify-start gap-1">
          <StatusPill status={status} className="shrink-0 align-middle relative top-[1px]" />
          {/* เส้นแบ่งแนวตั้ง */}
          <span aria-hidden="true" className="mx-3 h-3 w-px bg-gray-300" />
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
          <span className="text-base font-semibold text-[#7C3AED]">
            {unitLabel}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1 text-sm text-neutral-600">
          <span className="inline-flex items-center gap-1">
            <CiLocationOn className="flex items-center" /> {addressText}
          </span>
          {/* เส้นแบ่งแนวตั้ง */}
          <span aria-hidden="true" className="mx-3 h-3 w-px bg-gray-300" />

          <span className="inline-flex items-center gap-2">
            <GoPeople className="flex items-center" /> {capacity}
          </span>

          {quiet && (
            <span className="inline-flex items-center gap-2">
              <RiVolumeMuteLine className="flex items-center" /> Quiet
            </span>
          )}
          {/* เส้นแบ่งแนวตั้ง */}
          <span aria-hidden="true" className="mx-3 h-3 w-px bg-gray-300" />
          {wifi && (
            <span className="inline-flex items-center gap-2">
              <IoWifi /> Wi-Fi
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-0 text-sm text-neutral-600">
          <span>Booking Date: {dateText}</span>
          {/* เส้นแบ่งแนวตั้ง */}
          <span aria-hidden="true" className="mx-3 h-3 w-px bg-gray-300" />
          <span className="inline-flex items-center gap-1">
            <GoClock /> {timeText} ({hours} {hours > 1 ? "hours" : "hour"})
          </span>
          
          {!!bookingCode && (
            <span className="inline-flex items-center gap-1">
              {/* เส้นแบ่งแนวตั้ง */}
              <span aria-hidden="true" className="mx-3 h-3 w-px bg-gray-300" />
              <MdContentCopy size={16} /> Booking Code: {bookingCode}
            </span>
          )}
        </div>

        <div className="mt-1 text-sm font-semibold text-[#7C3AED]">
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
