// components/search/parts/Banner.jsx
"use client";

import Image from "next/image";

export default function Banner({ children }) {
  return (
    <div className="relative w-full max-w-[1400px] mx-auto rounded-[20px] shadow-md overflow-visible px-3 sm:px-6">
      <div className="rounded-[20px] overflow-hidden">
        <div className="relative h-[120px] sm:h-[140px] md:h-[160px] lg:h-[200px]">
          <Image
            src="/login-register/login-register.png"
            alt="Search background"
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1100px"
            priority
          />
          <div className="absolute inset-0 bg-white/20" />
        </div>
      </div>

      <div className="z-30 w-full">
        <div className="mx-auto w-full px-3 sm:px-4">
          <div className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full">
            <div className="mx-auto w-full max-w-[980px]">
              <div className="bg-none md:bg-white/95 rounded-xl md:shadow-lg p-3 sm:p-4">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-black/5" />
    </div>
  );
}
