// components/home/parts/LocationCard.jsx
"use client";

import Link from "next/link";
import { FiMapPin, FiClock, FiWifi } from "react-icons/fi";
import StarRating from "@/components/common/StarRating";

/** การ์ดหน้า Home */
export default function LocationCard({ loc }) {
  const address = loc.address || "-";
  const price = loc.priceHourly ?? loc.startingPriceHourly ?? 50; // fallback

  return (
    <Link
      href={`/locations/${loc.id}`}
      className="block rounded-[14px] bg-white shadow-[0_8px_16px_rgba(0,0,0,0.06)] ring-1 ring-black/5
                 transition hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] focus:outline-none"
    >
      <div className="p-3">
        <div className="overflow-hidden rounded-[12px]">
          <img
            src={loc.coverImageUrl || "/placeholder.jpg"}
            alt={loc.name}
            className="h-48 w-full object-cover md:h-52"
          />
        </div>
      </div>

      <div className="px-4 pb-4">
        <h3 className="text-[18px] font-semibold text-[#252525] line-clamp-1">{loc.name}</h3>
        <div className="mt-2 space-y-1.5 text-[13px] text-[#4B5563]">
          <div className="flex items-center gap-2">
            <FiMapPin className="h-[16px] w-[16px] text-gray-500" />
            <span className="line-clamp-1">{address}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiClock className="h-[16px] w-[16px] text-gray-500" />
            <span>24 hour</span>
          </div>
          <div className="flex items-center gap-2">
            <FiWifi className="h-[16px] w-[16px] text-gray-500" />
            <span>WiFi support</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      <div className="flex items-end justify-between px-4 pb-4 pt-3">
        <div className="flex items-start flex-col gap-2 text-[12px] text-gray-500">
          <StarRating value={4.2} size={14} />
          <span>(584 reviews)</span>
        </div>
        <div className="text-right leading-tight">
          <div className="text-[18px] sm:text-[22px] font-bold text-[#7C3AED]">
            {price} <span className="text-[18px] font-bold">Bath</span>
          </div>
          <div className="text-[11px] text-gray-500">per hour</div>
        </div>
      </div>
    </Link>
  );
}
