// components/search/parts/SearchBar.jsx
"use client";

import { useState } from "react";
import SearchInput from "@/components/common/controls/SearchInput";
import NearMeToggle from "@/components/common/controls/NearMeToggle";
import PriceSortSelect from "@/components/common/controls/PriceSortSelect";
import SearchButton from "@/components/common/controls/SearchButton";

/** แถบค้นหาของหน้า Search */
export default function SearchBar({ onSubmit }) {
  const [keyword, setKeyword] = useState("");
  const [nearMe, setNearMe] = useState(true);
  const [sort, setSort] = useState("price_asc");

  const handleSubmit = () =>
    onSubmit?.({
      keyword: keyword.trim(),
      nearMe,
      distanceKm: 5,
      sort,
      sortBy: "price",
      sortOrder: sort === "price_asc" ? "asc" : "desc",
    });

  return (
    <div className="flex flex-col md:flex-row items-center md:items-stretch gap-3">
      <div className="w-full md:flex-1">
        <SearchInput value={keyword} onChange={setKeyword} />
      </div>
      <div className="flex items-center gap-3 md:ml-4 md:flex-shrink-0">
        <NearMeToggle on={nearMe} setOn={setNearMe} />
        <PriceSortSelect sort={sort} setSort={setSort} />
        <SearchButton onClick={handleSubmit} />
      </div>
    </div>
  );
}
