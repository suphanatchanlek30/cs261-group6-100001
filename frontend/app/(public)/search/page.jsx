// app/(public)/search/page.jsx

"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchSection from "@/components/search/SearchSection";
import SearchResultRow from "@/components/search/parts/SearchResultRow";
import Pagination from "@/components/search/Pagination";
import { useSearchLocations } from "./useSearchLocations";

const ROWS_PER_PAGE = 10;

export default function SearchPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const q = sp.get("q") || "";
  const near = sp.get("near") || "";
  const radiusKm = sp.get("radiusKm") || "";

  const [page, setPage] = useState(0);
  const size = ROWS_PER_PAGE;

  const { items, total, loading, err } = useSearchLocations({ q, near, radiusKm, page, size });
  const totalPages = Math.max(1, Math.ceil(total / size));

  const handleSearch = (payload) => {
    const params = new URLSearchParams();
    if (payload?.keyword?.trim()) params.set("q", payload.keyword.trim());

    if (payload?.nearMe && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          params.set("near", `${lat},${lng}`);
          params.set("radiusKm", String(payload.distanceKm || 5));
          router.replace(`/search?${params.toString()}`);
          setPage(0);
        },
        () => {
          router.replace(`/search?${params.toString()}`);
          setPage(0);
        }
      );
    } else {
      router.replace(`/search?${params.toString()}`);
      setPage(0);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <SearchSection onSearch={handleSearch} />

      <header className="mt-10 mb-6">
        <h1 className="text-[26px] font-extrabold text-[#7C3AED]">All Locations</h1>
        <p className="text-[15px] text-neutral-600 mt-1">สถานที่ทั้งหมด</p>
      </header>

      {loading && <div className="py-16 text-center text-neutral-500">Loading...</div>}
      {!loading && err && <div className="py-16 text-center text-red-600">{err}</div>}
      {!loading && !err && items.length === 0 && <div className="py-16 text-center text-neutral-500">No results</div>}
      {!loading && !err && items.length > 0 && (
        <div className="space-y-5">
          {items.map((it) => (
            <SearchResultRow key={it.id} item={it} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
