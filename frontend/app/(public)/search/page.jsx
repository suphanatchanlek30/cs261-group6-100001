// app/search/page.jsx

"use client";

import SearchSectionSearch from "@/components/search/SearchSectionSearch";

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <SearchSectionSearch onSearch={(payload) => console.log("SEARCH:", payload)} />
      {/* TODO: ตำแหน่งผลลัพธ์ค้นหา (cards / list) */}
    </div>
  );
}
