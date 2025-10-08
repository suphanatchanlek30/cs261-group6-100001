// components/search/SearchSection.jsx
"use client";

// รวมทุกอย่าง (พาดหัว + การ์ดค้นหา)

import { useState } from "react";
import Headline from "./Headline";
import Banner from "./Banner";

import SearchInput from "./Controls/SearchInput";
import NearMeToggle from "./Controls/NearMeToggle";
import DistanceSelect from "./Controls/DistanceSelect";
import SearchButton from "./Controls/SearchButton";

export default function SearchSection({ onSearch }) {
  const [keyword, setKeyword] = useState("");
  const [nearMe, setNearMe] = useState(true);
  const [distance, setDistance] = useState(5);

  const handleSearch = () => {
    const payload = {
      keyword: keyword.trim(),
      nearMe,
      distanceKm: distance,
    };
    if (typeof onSearch === "function") onSearch(payload);
    else console.log("Search Payload:", payload);
  };

  return (
    <section className="w-full mx-auto max-w-7xl px-4 sm:px-6 pt-4 sm:pt-6">
      <Headline />

      <Banner>
        <div className="w-full max-w-[980px] mx-auto">
          {/* On small screens: stacked (input then controls). On md+: inline row (input left, controls right) */}
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
        </div>
      </Banner>
    </section>
  );
}
