// components/review/ReviewHeader.jsx

"use client";
import { FiMapPin, FiClock, FiWifi } from "react-icons/fi";

export default function ReviewHeader({
  // coverImageUrl,
  unitImageUrl,
  locationName,
  address,
  dateText,
  timeText,
  hasWifi,
}) {
  return (
    <div className="flex gap-5 items-start">
      <img
        src={unitImageUrl || "/placeholder.jpg"}
        alt={locationName || "location"}
        className="w-[260px] h-[170px] rounded-xl object-cover shadow"
      />
      <div className="mt-1">
        <h3 className="text-xl font-semibold text-gray-900">{locationName}</h3>
        <p className="mt-1 flex items-center gap-2 text-neutral-600">
          <FiMapPin className="shrink-0" />
          <span>{address}</span>
        </p>
        <p className="mt-1 flex items-center gap-2 text-neutral-600">
          <FiClock className="shrink-0" />
          <span>{timeText ? `${dateText} · ${timeText}` : dateText}</span>
          {hasWifi && (
            <>
              <span className="mx-2 h-3 w-px bg-gray-300" />
              <FiWifi className="shrink-0" /> <span>WiFi support</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
