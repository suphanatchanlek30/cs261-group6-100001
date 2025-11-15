// components
"use client";

// หัวเรื่องและคำอธิบายด้านบน

export default function Headline() {
  return (
    <div className="w-full text-center mb-4 sm:mb-6">
      <h1 className="text-[26px] sm:text-[28px] lg:text-[28px] font-extrabold text-[#7C3AED]">
        จองพื้นที่อ่านเงียบๆได้ในไม่กี่คลิก
      </h1>
      <p className="mt-1 text-[14px] sm:text-[16px] text-black/80 font-semibold">
        ค้นหา เลือกเวลา ชำระเงิน แล้วรอคอนเฟิร์ม
      </p>
    </div>
  );
}
