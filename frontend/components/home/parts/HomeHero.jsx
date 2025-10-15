// components/home/parts/HomeHero.jsx
"use client";
import Image from "next/image";
import SearchBarHome from "@/components/search/parts/SearchBarHome";

/** Hero ของหน้า Home: หัวเรื่อง + แบนเนอร์ + กล่องค้นหา (แท็บเดิม) */
export default function HomeHero() {
  return (
    <section className="w-full">
      <div className="w-full text-center mb-4 sm:mb-6">
        <h1 className="text-[28px] font-extrabold text-[#7C3AED]">
          จองพื้นที่อ่านเงียบได้ในไม่กี่คลิก
        </h1>
        <p className="mt-1 text-[15px] sm:text-[16px] text-black/80 font-semibold">
          ค้นหา เลือกเวลา ชำระเงิน แล้วรอคอนเฟิร์ม
        </p>
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto rounded-[20px] shadow-md overflow-visible px-3 sm:px-6">
        <div className="rounded-[20px] overflow-hidden">
          <div className="relative h-[140px] sm:h-[160px] md:h-[180px] lg:h-[200px]">
            <Image
              src="/login-register/login-register.png"
              alt="Search background"
              fill
              className="object-cover object-center"
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
                  <SearchBarHome />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-black/5" />
      </div>
    </section>
  );
}
