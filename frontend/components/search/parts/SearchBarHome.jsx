// components/search/parts/SearchBarHome.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchInput from "@/components/common/controls/SearchInput";
import NearMeToggle from "@/components/common/controls/NearMeToggle";
import DistanceSelect from "@/components/common/controls/DistanceSelect";
import SearchButton from "@/components/common/controls/SearchButton";

/** แถบค้นหาในหน้า Home (ค้นหาแล้วไป /search ในแท็บเดิม) */
export default function SearchBarHome() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [nearMe, setNearMe] = useState(true);
  const [distance, setDistance] = useState(5);

  const handleSearch = () => {
    const params = new URLSearchParams();
    const q = keyword.trim();
    if (q) params.set("q", q);

    if (nearMe && typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = +pos.coords.latitude.toFixed(6);
          const lng = +pos.coords.longitude.toFixed(6);
          params.set("near", `${lat},${lng}`);
          params.set("radiusKm", String(distance || 5));
          router.push(`/search?${params.toString()}`);
        },
        () => router.push(`/search?${params.toString()}`),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
      return;
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-stretch gap-3">
      <div className="w-full md:flex-1">
        <SearchInput value={keyword} onChange={setKeyword} />
      </div>
      <div className="flex items-center gap-3 md:ml-4 md:flex-shrink-0">
        <NearMeToggle on={nearMe} setOn={setNearMe} />
        <DistanceSelect value={distance} setValue={setDistance} />
        <SearchButton onClick={handleSearch} />
      </div>
    </div>
  );
}
