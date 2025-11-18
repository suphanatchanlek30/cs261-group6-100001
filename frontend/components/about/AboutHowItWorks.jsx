// components/about/AboutHowItWorks.jsx

const steps = [
  {
    label: "1",
    title: "ค้นหาพื้นที่ที่ต้องการ",
    description: "เลือกอาคาร / พื้นที่ / ประเภทที่นั่งที่เหมาะกับรูปแบบการอ่านหรือทำงาน",
  },
  {
    label: "2",
    title: "เลือกวันและช่วงเวลา",
    description: "กำหนดวัน เวลาเริ่ม และจำนวนชั่วโมง ระบบจะแสดงความพร้อมใช้งานให้ทันที",
  },
  {
    label: "3",
    title: "ยืนยันการจองและใช้งาน",
    description: "ยืนยันการจอง ดูรายละเอียดได้ในหน้า My Booking และแสดงหลักฐานเมื่อเข้าใช้พื้นที่",
  },
];

export default function AboutHowItWorks() {
  return (
    <section className="mb-10">
      <h2 className="text-lg md:text-xl font-semibold text-neutral-900 mb-3">
        ทำงานอย่างไร?
      </h2>
      <p className="text-sm text-neutral-600 mb-5 max-w-2xl">
        ออกแบบให้ใช้งานได้ง่ายสำหรับทุกคน แม้จะเพิ่งเข้ามาใช้ครั้งแรก
        โดยมีขั้นตอนหลักเพียงไม่กี่ขั้นตอนดังนี้
      </p>

      <ol className="space-y-3">
        {steps.map((step) => (
          <li
            key={step.label}
            className="flex gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3"
          >
            <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white text-xs font-semibold text-neutral-700">
              {step.label}
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                {step.title}
              </p>
              <p className="text-sm text-neutral-600">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
