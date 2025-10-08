// components/search/SearchSectionSearch.jsx
"use client";

// รวมทุกอย่าง (พาดหัว + การ์ดค้นหา)

import { useState } from "react";
import Banner from "./Banner";

import SearchInput from "./Controls/SearchInput";
import NearMeToggle from "./Controls/NearMeToggle";
import SearchButton from "./Controls/SearchButton";
import PriceSortSelect from "./Controls/PriceSortSelect"; // นำเข้า PriceSortSelect

export default function SearchSectionSearch({ onSearch }) {
  const [keyword, setKeyword] = useState("");
  const [nearMe, setNearMe] = useState(true);
  const [sort, setSort] = useState("price_asc");

  const handleSearch = () => {
    const payload = {
      keyword: keyword.trim(),
      nearMe,
      sort,                 // "price_asc" | "price_desc"
      sortBy: "price",      // เผื่อ backend ต้องการแยกฟิลด์
      sortOrder: sort === "price_asc" ? "asc" : "desc",
    };
    if (typeof onSearch === "function") onSearch(payload);
    else console.log("Search Payload:", payload);
  };

  return (
    <section className="w-full mx-auto max-w-7xl px-4 sm:px-6 pt-4 sm:pt-6">

      <Banner>
        <div className="w-full max-w-[980px] mx-auto">
          {/* xs: ซ้อนแนวตั้ง / md+: เรียง 1 แถว */}
          <div className="flex flex-col md:flex-row items-center md:items-stretch gap-3">
            <div className="w-full md:flex-1">
              <SearchInput value={keyword} onChange={setKeyword} />
            </div>

            <div className="flex items-center gap-3 md:ml-4 md:flex-shrink-0">
              <NearMeToggle on={nearMe} setOn={setNearMe} />
              <PriceSortSelect sort={sort} setSort={setSort} />
              <SearchButton onClick={handleSearch} />
            </div>
          </div>
        </div>
      </Banner>
    </section>
  );
}
