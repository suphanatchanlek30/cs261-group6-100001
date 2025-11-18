// components/help/HelpFAQ.jsx

const faqs = [
  {
    question: "สมัครสมาชิกไม่ได้ / ระบบแจ้งว่าอีเมลถูกใช้งานแล้ว?",
    answer:
      "ตรวจสอบก่อนว่าเคยสมัครด้วยอีเมลนี้แล้วหรือไม่ ถ้าเคยสมัครแล้วให้ลองเข้าสู่ระบบ หรือใช้ฟังก์ชัน “ลืมรหัสผ่าน” เพื่อรีเซ็ตรหัสผ่านใหม่",
  },
  {
    question: "จองแล้วแต่ไม่เห็นข้อมูลในประวัติการจอง?",
    answer:
      "ลองกดรีเฟรชหน้าอีกครั้ง หรือออกจากระบบแล้วเข้าสู่ระบบใหม่ หากยังไม่ขึ้นให้ติดต่อทีมงานพร้อมแนบสลิป/รูปหน้าจอประกอบ",
  },
  {
    question: "ต้องการแก้ไขหรือยกเลิกการจองได้อย่างไร?",
    answer:
      "ในหน้า “การจองของฉัน” สามารถเลือกดูรายละเอียดการจอง และกดปุ่มแก้ไข/ยกเลิกได้ตามเงื่อนไขของระบบ (เช่น ต้องยกเลิกก่อนเวลาที่กำหนด)",
  },
];

export default function HelpFAQ() {
  return (
    <section className="mb-10">
      <h2 className="text-lg md:text-xl font-semibold text-neutral-900 mb-4">
        คำถามที่พบบ่อย (FAQ)
      </h2>
      <div className="space-y-3">
        {faqs.map((item, idx) => (
          <details
            key={idx}
            className="group rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 transition hover:border-neutral-300"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <span className="text-sm md:text-base text-neutral-900">
                {item.question}
              </span>
              <span className="text-xl leading-none text-neutral-400 group-open:rotate-180 transition">
                +
              </span>
            </summary>
            <p className="mt-2 text-sm text-neutral-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
