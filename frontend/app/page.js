import { redirect } from 'next/navigation';

"use client";

import React from "react";
import { useEffect, useState } from "react";

// ข้อมูลตัวอย่างสําหรับทดสอบเบื้องต้น
const poploc = ["bangkok", "nonthaburi", "pathumthani"];
const locations = [
  {
    id: 1,
    name: "Co-Working Space Bangkok",
    address: "Bangkok, Thailand",
    hours: "Open 24 hours",
    wifi: true,
    rating: 4.7,
    reviews: 543,
    price: 50,
    image: "https://mpics.mgronline.com/pics/Images/561000009686901.JPEG",
  },
  {
    id: 2,
    name: "Co-Working Space Bangkok",
    address: "Bangkok, Thailand",
    hours: "Open 24 hours",
    wifi: true,
    rating: 4.5,
    reviews: 543,
    price: 50,
    image: "https://mpics.mgronline.com/pics/Images/561000009686901.JPEG",
  },
  {
    id: 3,
    name: "Co-Working Space Bangkok",
    address: "Bangkok, Thailand",
    hours: "Open 24 hours",
    wifi: true,
    rating: 3,
    reviews: 543,
    price: 50,
    image: "https://mpics.mgronline.com/pics/Images/561000009686901.JPEG",
  },
  {
    id: 4,
    name: "Co-Working Space Bangkok",
    address: "Bangkok, Thailand",
    hours: "Open 24 hours",
    wifi: true,
    rating: 3,
    reviews: 543,
    price: 50,
    image: "https://mpics.mgronline.com/pics/Images/561000009686901.JPEG",
  },
  {
    id: 5,
    name: "Co-Working Space Bangkok",
    address: "Bangkok, Thailand",
    hours: "Open 24 hours",
    wifi: true,
    rating: 3,
    reviews: 543,
    price: 50,
    image: "https://mpics.mgronline.com/pics/Images/561000009686901.JPEG",
  },
  {
    id: 6,
    name: "Co-Working Space Bangkok",
    address: "Bangkok, Thailand",
    hours: "Open 24 hours",
    wifi: true,
    rating: 3,
    reviews: 543,
    price: 50,
    image: "https://mpics.mgronline.com/pics/Images/561000009686901.JPEG",
  }
];

// ไอคอน SVG
const IconPin = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-gray-500">
    <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 4.418 7 13 7 13s7-8.582 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-gray-500">
    <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 11h-4V7h2v4h2Z" />
  </svg>
);

const IconWifi = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-gray-500">
    <path fill="currentColor" d="M12 18a2 2 0 1 0 2 2a2 2 0 0 0-2-2m7.07-2.93a10 10 0 0 0-14.14 0l1.41 1.41a8 8 0 0 1 11.32 0ZM12 8a14 14 0 0 0-9.9 4.1l1.41 1.41A12 12 0 0 1 12 10a12 12 0 0 1 8.49 3.51l1.41-1.41A14 14 0 0 0 12 8" />
  </svg>
);



//ไอคอน Star
function StarRating({ value }) {
  // ปัดเป็นครึ่งๆ ได้ถ้าต้องการ; ที่นี่ใช้ปัดธรรมดา
  const full = Math.round(value);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`h-6 w-6 ${i < full ? "text-amber-400" : "text-gray-300"
            }`}
        >
          <path
            fill="currentColor"
            d="m12 17.27l-5.18 3.05l1.64-5.81L3 9.74l6-.5L12 3l3 6.24l6 .5l-5.46 4.77l1.64 5.81Z"
          />
        </svg>
      ))}
    </div>
  );
}

//card component
function Card({ p }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      {/* รูปด้านบน (มุมโค้งในกรอบ) */}
      <div className="p-4">
        <div className="overflow-hidden rounded-xl">
          <img
            src={p.image}
            alt={p.name}
            className="h-48 w-full object-cover md:h-56"
          />
        </div>
      </div>

      {/* เนื้อหา */}
      <div className="px-4 pb-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">{p.name}</h3>

        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <IconPin />
            <span>{p.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconClock />
            <span>{p.hours}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconWifi />
            <span>{p.wifi ? "WiFi support" : "No WiFi"}</span>
          </div>
        </div>
      </div>

      {/* เส้นคั่น */}
      <div className="h-px bg-gray-100" />

      {/* ฟุตเตอร์: ดาว/รีวิวกับราคา */}
      <div className="flex items-end justify-between px-4 pb-4 pt-3">
        <div className="flex flex-col gap-1">
          <StarRating value={p.rating} />
          <span className="text-xs text-gray-500">{p.reviews} reviews</span>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold leading-none text-violet-600">
            {p.price} <span className="text-l font-bold text-violet-600">Bath</span>
          </div>
          <div className="text-xs text-gray-500">per hour</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* หัวเรื่อง */}
      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        Most popular location
      </h1>
      {/* แคปซูลกรอง */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {poploc.map((item, index) => (
          <button key={index} className="rounded-full border border-[#9747FF] bg-white text-[#9747FF] px-4 py-1.5 text-sm hover:bg-gray-50 cursor-pointer">
            {item}
          </button>
        ))}
      </div>
      {/* การ์ดแสดงข้อมูล */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {locations.map((p) => (
          <Card key={p.id} p={p} />
        ))}
      </div>
      {/* ปุ่ม See more */}
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          className="group inline-flex items-center gap-2 rounded-full
               bg-[#7C3AED] px-8 py-3 text-white font-semibold
               shadow-[0_8px_24px_rgba(124,58,237,0.35)]
               hover:bg-[#6D28D9] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 transition cursor-pointer"
        >
          See more
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
      )
}
