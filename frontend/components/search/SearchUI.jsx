// components/search/Search.jsx
"use client";

import { useRef, useState } from "react";

// SVG Icons
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"/>
    </svg>
);
const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);
const ArrowsUpDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-neutral-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
    </svg>
);


export default function Search({ onSearch }) {
    const [keyword, setKeyword] = useState("");
    const [nearOn, setNearOn] = useState(true);
    const [priceSort, setPriceSort] = useState("Low → High"); 
    const detailsRef = useRef(null);
    const [ph, setPh] = useState("Search by name or keyword");

    const handleSearch = () => {
        const payload = {
            keyword: keyword.trim(),
            nearMe: nearOn,
            priceSort: priceSort,
        };
        if (typeof onSearch === "function") onSearch(payload);
        else console.log("Search Payload:", payload);
    };

    const priceOptions = ["Low → High", "High → Low"];

    return (
        <div className="mx-auto max-w-6xl sm:my-8" style={{ fontFamily: "'Prompt', sans-serif" }}>
            <div className="relative sm:rounded-3xl sm:shadow-lg">
                <div className="absolute inset-0 sm:rounded-3xl overflow-hidden">
                    <div
                        className="absolute inset-0 bg-center bg-no-repeat"
                        style={{ backgroundImage: "url('/login-register.png')", backgroundSize: "120%" }} 
                    />
                    <div className="absolute inset-0 bg-white/40" />
                </div>

                <main className="relative z-10 flex flex-col justify-center p-8 md:p-16">
                    <div className="max-w-3xl text-center md:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black drop-shadow-sm md:text-4xl text-outline whitespace-nowrap">
                            All Place
                        </h1>
                        <p className="mt-4 text-sm sm:text-base text-black/90 whitespace-nowrap">
                        </p>
                    </div>

                    <div className="mt-10 flex flex-wrap items-center gap-2 rounded-xl bg-white/80 p-2 shadow-lg ring-1 ring-black/5 backdrop-blur-md">
                        
                        <div className="flex flex-1 items-center gap-2 px-3 h-11 min-w-[200px] rounded-lg bg-white shadow-sm ring-1 ring-black/5">
                            <SearchIcon />
                            <input
                                type="text" placeholder={ph} value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onFocus={() => setPh("")}
                                onBlur={() => !keyword.trim() && setPh("Search by name or keyword")}
                                className="w-full h-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-500 focus:outline-none"
                            />
                        </div>
                        
                        <button
                            type="button" aria-pressed={nearOn} onClick={() => setNearOn((v) => !v)}
                            className={`flex items-center justify-center gap-2 rounded-lg px-3 h-11 text-sm font-medium transition-colors ${ nearOn ? "bg-white text-neutral-800 shadow-sm ring-1 ring-black/5" : "bg-gray-50 text-neutral-600" }`}
                        >
                            <LocationIcon />
                            <span className="hidden sm:inline">Near Me</span>
                        </button>
                        
                        <div className="relative">
                            <details ref={detailsRef} className="group">
                                <summary className="flex list-none cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-3 h-11 text-sm font-medium text-neutral-800 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-gray-50">
                                    <span className="hidden sm:inline">Price:</span>
                                    <span className="font-semibold">{priceSort}</span>
                                    <ArrowsUpDownIcon />
                                </summary>
                                {/* REVISED POSITIONING FOR DROPDOWN MENU */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 origin-top rounded-xl border bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
                                    {priceOptions.map((option) => (
                                        <button
                                            key={option} 
                                            onClick={() => { setPriceSort(option); detailsRef.current?.removeAttribute("open"); }}
                                            className={`block w-full rounded-lg px-4 py-2 text-left text-sm ${ priceSort === option ? "bg-violet-500 text-white" : "text-neutral-700 hover:bg-violet-100" }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </details>
                        </div>

                        <button
                            onClick={handleSearch}
                            className="flex-grow sm:flex-grow-0 rounded-lg bg-violet-500 px-5 h-12 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:bg-violet-600 active:scale-95"
                        >
                            Search
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}

