// components/home/HomeSection.jsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import { LOCATIONS, POPULAR_LOCATIONS } from "./data";
import LocationCard from "./LocationCard";
import PopularFilters from "./PopularFilters";

export default function HomeSection() {
  // เตรียมข้อมูลโชว์หน้าแรกสูงสุด 6 การ์ด
  const displayed = useMemo(() => LOCATIONS.slice(0, 6), []);
  const hasMore = LOCATIONS.length > 6; // มีมากกว่า 6 ใบ → โชว์ปุ่ม

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* หัวเรื่อง */}
      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        Most popular location
      </h1>

      {/* ฟิลเตอร์ยอดนิยม (ต่อ API ภายหลังได้) */}
      <PopularFilters
        items={POPULAR_LOCATIONS}
        onSelect={(city) => console.log("filter:", city)}
      />

      {/* การ์ดสูงสุด 6 ใบ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {displayed.map((p) => (
          <LocationCard key={p.id} p={p} />
        ))}
      </div>

      {/* ปุ่ม See more: โชว์เฉพาะเมื่อมี item มากกว่า 6 */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Link
            href="/search"
            className="group inline-flex items-center gap-2 rounded-[10px]
                       bg-[#7C3AED] px-8 py-2 text-white font-semibold
                       shadow-[0_8px_24px_rgba(124,58,237,0.35)]
                       hover:bg-[#6D28D9] active:scale-[0.99]
                       focus:outline-none focus-visible:ring-2
                       focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 transition"
          >
            See more
            <FiChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
