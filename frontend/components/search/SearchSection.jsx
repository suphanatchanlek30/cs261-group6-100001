// components/search/SearchSection.jsx
"use client";

import Banner from "./parts/Banner";
import SearchBar from "./parts/SearchBar";

/** ส่วนบนของหน้า Search: แบนเนอร์ + แถบค้นหา */
export default function SearchSection({ onSearch }) {
  return (
    <section className="w-full mx-auto max-w-7xl px-4 sm:px-6 pt-1 sm:pt-2">
      <Banner>
        <div className="w-full max-w-[980px] mx-auto">
          <SearchBar onSubmit={onSearch} />
        </div>
      </Banner>
    </section>
  );
}
