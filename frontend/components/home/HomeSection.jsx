// components/home/HomeSection.jsx

"use client";

import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import { useMemo, useState } from "react";
import HomeHero from "./parts/HomeHero";
import PopularFilters from "./parts/PopularFilters";
import LocationCard from "./parts/LocationCard";
import useHomeLocations from "./hooks/useHomeLocations";

const PAGE_SIZE = 6;

/** หน้า Home: Hero + ป็อปปูล่าร์ + การ์ด 3 คอลัมน์ + See more */
export default function HomeSection() {
  const [activeProvince, setActiveProvince] = useState(null); // null = ทั้งหมด
  const { items, total, loading, error } = useHomeLocations({
    province: activeProvince,
    size: PAGE_SIZE,
  });

  const hasMore = useMemo(() => total > PAGE_SIZE, [total]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <HomeHero />

      <section className="mx-auto max-w-6xl px-2 sm:px-4 py-10">
        <h2 className="text-[22px] sm:text-[24px] font-bold text-[#282828] mb-4">
          Population place
        </h2>

        <PopularFilters
          items={["Bangkok", "Nonthaburi", "Pathum Thani"]}
          active={activeProvince}
          onSelect={setActiveProvince}
        />

        {loading ? (
          <p className="py-10 text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="py-10 text-center text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-gray-500">No locations found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {items.map((p) => (
              <LocationCard key={p.id} loc={p} />
            ))}
          </div>
        )}

        {!activeProvince && hasMore && (
          <div className="mt-10 flex justify-center">
            <Link
              href="/search"
              className="group inline-flex items-center gap-2 rounded-[12px]
                         bg-[#7C3AED] px-6 py-3 text-white text-[15px] font-semibold
                         shadow-[0_10px_24px_rgba(124,58,237,0.35)] hover:bg-[#6D28D9]
                         transition active:scale-[0.99]"
            >
              See more
              <FiChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
