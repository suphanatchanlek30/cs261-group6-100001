// components/location/LocationHeader.jsx

// หัวข้อ + รูป + สถานะ Open/Closed

"use client";

import Image from "next/image";
import { FiMapPin } from "react-icons/fi";

export default function LocationHeader({ coverImageUrl, name, address, isActive }) {
  const open = !!isActive;

  return (
    <section>
      <div className="relative w-full h-[320px] sm:h-[360px] rounded-[14px] overflow-hidden">
        <Image
          src={coverImageUrl || "/placeholder.jpg"}
          alt={name || "cover"}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">{name}</h1>
        <span
          className={[
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
            open ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700",
          ].join(" ")}
        >
          <span
            className={[
              "mr-2 inline-block h-2 w-2 rounded-full",
              open ? "bg-emerald-500" : "bg-gray-500",
            ].join(" ")}
          />
          {open ? "OPEN" : "CLOSED"}
        </span>
      </div>

      <div className="mt-2 text-sm text-neutral-700 flex items-center gap-2">
        <FiMapPin className="text-neutral-500" />
        <span>{address || "-"}</span>
      </div>
    </section>
  );
}
