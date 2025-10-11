// components/home/HomeSection.jsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import { getLocations } from "@/services/locationService";
import LocationCard from "./LocationCard";
import PopularFilters from "./PopularFilters";
import SearchSectionHome from "../search/SearchSectionHome";
import { PROVINCE_PRESETS, POPULAR_LOCATIONS } from "./provincePresets";

export default function HomeSection() {
  const [activeProvince, setActiveProvince] = useState(null); // null = โหมดทั้งหมด
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // โหลดข้อมูลทุกครั้งที่เปลี่ยนจังหวัด
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        let params;
        if (activeProvince && PROVINCE_PRESETS[activeProvince]) {
          const { lat, lng, radiusKm } = PROVINCE_PRESETS[activeProvince];
          params = { near: `${lat},${lng}`, radiusKm, page: 0, size: 6 };
        } else {
          params = { page: 0, size: 6 }; // ทั้งหมด 6 รายการแรก
        }
        const { ok, data, message } = await getLocations(params);
        if (!ok) throw new Error(message);
        if (cancelled) return;

        setItems(data.items || []);
        setTotal(data.total ?? (data.items || []).length);
      } catch (e) {
        if (!cancelled) setErr(e.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeProvince]);

  const hasMore = useMemo(() => total > 6, [total]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* ส่วนค้นหา (ยังไม่ยิงจริง) */}
      <SearchSectionHome onSearch={(payload) => console.log("Search:", payload)} />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* หัวเรื่อง */}
        <h1 className="text-2xl font-bold text-[#282828] mb-6 mt-4">
          Most popular location
        </h1>

        {/* ปุ่มกรองยอดนิยม (3 จังหวัด) */}
        <PopularFilters
          items={POPULAR_LOCATIONS}
          active={activeProvince}
          onSelect={setActiveProvince}
        />

        {/* เนื้อหา */}
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : err ? (
          <div className="py-10 text-center text-red-600">{err}</div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No locations found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {items.map((p) => (
              <LocationCard key={p.id} loc={p} />
            ))}
          </div>
        )}

        {/* ปุ่ม See more (ไปหน้า search) แสดงเฉพาะตอน “โหมดทั้งหมด” หรือมีมากกว่า 6 */}
        {!activeProvince && hasMore && (
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
    </div>
  );
}
