// components/payment/PaymentSummaryCard.jsx
"use client";
import { FiMapPin, FiUsers, FiVolumeX, FiWifi, FiClock } from "react-icons/fi";
import StatusPill from "./StatusPill";
import RatingWithCount from "@/components/common/RatingWithCount";

export default function PaymentSummaryCard({
  coverImageUrl,
  status,
  locationName,
  unitLabel,
  address,
  capacity,
  quiet = false,
  wifi = false,
  dateText,
  timeText,
  total,
  rating,          // nullable
  reviewCount,     // nullable
  bookingCode,     // nullable
  canPay = true,
  onCreateQR,
}) {
  return (
    <div className="flex items-stretch gap-0 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* รูปซ้ายเต็มสูง */}
      <div className="relative w-44 shrink-0 sm:w-48 md:w-60">
        <img src={coverImageUrl || "/placeholder.jpg"} alt={unitLabel || "unit"} className="absolute inset-0 w-full h-full object-cover" />
      </div>

      {/* เนื้อหา */}
      <div className="flex-1 min-w-0 p-5">
        <div className="flex items-center gap-2 mb-1">
          <StatusPill status={status} />
          <RatingWithCount
            rating={typeof rating === 'number' ? rating : 0}
            count={typeof reviewCount === 'number' ? reviewCount : 0}
            size={14}
            labelClassName="text-neutral-500"
          />
        </div>

        <h2 className="text-lg font-semibold text-gray-800">
          {locationName}{" "}
          {unitLabel && <span className="text-violet-600 font-semibold">{unitLabel ? ` ${unitLabel}` : ""}</span>}
        </h2>

        <div className="mt-1 text-sm text-neutral-600 space-y-1">
          <p className="flex items-center gap-2">
            <FiMapPin className="shrink-0" /> {address}
            <span className="mx-2 h-3 w-px bg-gray-300" />
            <FiUsers className="shrink-0" /> {capacity ?? 1}
            {quiet && (<><span className="mx-2 h-3 w-px bg-gray-300" /><FiVolumeX className="shrink-0" /></>)}
            {wifi && (<><span className="mx-2 h-3 w-px bg-gray-300" /><FiWifi className="shrink-0" /></>)}
          </p>

          <p className="flex items-center gap-2">
            Booking Date: {dateText}
            <span className="mx-2 h-3 w-px bg-gray-300" />
            <FiClock className="shrink-0" /> {timeText}
            {bookingCode && (
              <>
                <span className="mx-2 h-3 w-px bg-gray-300" />
                <span className="text-neutral-500">Booking Code: {bookingCode}</span>
              </>
            )}
          </p>
        </div>

        <p className="mt-2 text-sm font-semibold text-violet-700">
          Total {typeof total === "number" ? total.toFixed(2) : total} Baht
        </p>
      </div>

      {/* ปุ่มขวา */}
      <div className="p-5 flex items-center">
        <button
          onClick={onCreateQR}
          disabled={!canPay}
          className="rounded-xl bg-[#7C3AED] px-4 py-2 text-white text-sm font-semibold hover:bg-[#6d28d9] transition disabled:opacity-40"
        >
          Create a payment QR code
        </button>
      </div>
    </div>
  );
}
