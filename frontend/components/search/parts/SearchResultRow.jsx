// components/search/parts/SearchResultRow.jsx
"use client";

import Link from "next/link";
import { FiMapPin, FiClock, FiWifi } from "react-icons/fi";
import StarRating from "@/components/common/StarRating";

export default function SearchResultRow({ item }) {
    const price = item?.priceHourly ?? item?.startingPriceHourly ?? 50;
    const isOpen = !!item?.isActive;

    return (
        <div className="rounded-[18px] overflow-hidden bg-white shadow-[0_12px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
            <div className="grid grid-cols-[140px_1fr_auto] sm:grid-cols-[180px_1fr_auto] gap-0 items-stretch">
                <div className="h-full">
                    <img
                        src={item?.coverImageUrl || "/placeholder.jpg"}
                        alt={item?.name || "Location"}
                        className="block w-full h-[160px] object-cover"
                    />
                </div>

                {/* padding เฉพาะฝั่งเนื้อหา */}
                <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-0 text-xs mb-2">
                        {isOpen ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" /> OPEN
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 text-gray-700 px-3 py-1 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-gray-500" /> CLOSED
                            </span>
                        )}

                        {/* เส้นแบ่งแนวตั้ง */}
                        <span aria-hidden="true" className="mx-3 h-3 w-px bg-gray-300" />

                        <div className="flex items-center gap-2 text-[#f59e0b]">
                            <StarRating value={4} size={12} />
                            <span className="text-gray-500">(584 reviews)</span>
                        </div>
                    </div>

                    <Link
                        href={`/locations/${item?.id}`}
                        className="mt-2 block text-[16px] sm:text-[18px] font-semibold text-[#222] hover:underline mb-2"
                    >
                        {item?.name}
                    </Link>

                    <div className="mt-1.5 flex flex-col items-start gap-x-6 gap-y-2 text-[13px] text-gray-600">
                        <span className="inline-flex items-center gap-1 font-medium"><FiMapPin className="text-gray-600" /> {item.address || "-"}</span>
                        <div className="flex flex-wrap gap-0 text-gray-600 items-center">
                            <span className="inline-flex items-center gap-2 font-medium"><FiClock className="text-gray-600" /> 24 hour</span>
                            {/* เส้นแบ่งแนวตั้ง */}
                            <span aria-hidden="true" className="mx-3 h-3 w-px bg-gray-300" />
                            <span className="inline-flex items-center gap-2 font-medium"><FiWifi className="text-gray-600" /> WiFi support</span>
                        </div>
                    </div>
                </div>

                {/* ฝั่งราคา/ปุ่ม มี padding ของตัวเอง */}
                <div className="p-4 sm:p-5 text-right">
                    <div className="text-[#7C3AED] font-bold text-[18px] sm:text-[20px]">
                        {price} <span className="font-bold">Bath</span>
                        <span className="text-gray-600 text-[12px]">/hour</span>
                    </div>
                    <Link
                        href={`/locations/${item?.id}`}
                        className="mt-3 inline-flex items-center justify-center rounded-[12px] border border-gray-300  px-4 py-2 text-[14px] font-semibold hover:bg-black hover:text-white transition"
                    >
                        See more detail
                    </Link>
                </div>
            </div>
        </div>
    );
}
