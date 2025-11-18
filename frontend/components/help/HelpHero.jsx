// components/help/HelpHero.jsx

export default function HelpHero() {
  return (
    <section className="border-b border-neutral-200 pb-8 mb-10">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-3">
        Help Center
      </p>
      <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-4">
        มีปัญหาอะไรให้ช่วยไหม?
      </h1>
      <p className="text-sm md:text-base text-neutral-600 max-w-2xl">
        รวบรวมคำถามที่พบบ่อย วิธีใช้งานระบบ และช่องทางติดต่อทีมงาน
        ถ้ายังหาไม่เจอ สามารถส่งข้อความมาถามเราได้ตลอดเวลา
      </p>

      <div className="mt-6 max-w-md">
        <label className="block text-xs font-medium text-neutral-600 mb-2">
          ค้นหาหัวข้อช่วยเหลือ
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 shadow-sm">
          <input
            type="text"
            placeholder="พิมพ์คำที่ต้องการค้นหา เช่น การจอง, การชำระเงิน"
            className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
        </div>
      </div>
    </section>
  );
}
