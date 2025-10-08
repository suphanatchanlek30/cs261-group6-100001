// components/home/LocationCard.jsx
import { FiMapPin, FiClock, FiWifi } from "react-icons/fi";
import StarRating from "./StarRating";

export default function LocationCard({ p }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      <div className="p-4">
        <div className="overflow-hidden rounded-xl">
          <img src={p.image} alt={p.name} className="h-48 w-full object-cover md:h-56" />
        </div>
      </div>

      <div className="px-4 pb-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">{p.name}</h3>

        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <FiMapPin className="h-[18px] w-[18px] text-gray-500" />
            <span>{p.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiClock className="h-[18px] w-[18px] text-gray-500" />
            <span>{p.hours}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiWifi className="h-[18px] w-[18px] text-gray-500" />
            <span>{p.wifi ? "WiFi support" : "No WiFi"}</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      <div className="flex items-end justify-between px-4 pb-4 pt-3">
        <div className="flex flex-col gap-1">
          <StarRating value={p.rating} />   {/* 4.5 → ครึ่งดาว */}
          <span className="text-xs text-gray-500">{p.reviews} reviews</span>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold leading-none text-violet-600">
            {p.price} <span className="text-xl font-bold text-violet-600">Bath</span>
          </div>
          <div className="text-xs text-gray-500">per hour</div>
        </div>
      </div>
    </div>
  );
}
