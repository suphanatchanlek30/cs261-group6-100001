// components/about/AboutHero.jsx

export default function AboutHero() {
  return (
    <section className="border-b border-neutral-200 pb-8 mb-10">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-3">
        About
      </p>
      <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-4">
        เกี่ยวกับ NangNaiDee
      </h1>
      <p className="text-sm md:text-base text-neutral-600 max-w-2xl">
        NangNaiDee เป็นแพลตฟอร์มจองพื้นที่อ่านหนังสือ / พื้นที่ทำงาน
        สำหรับนักศึกษา ที่ช่วยให้การจองที่นั่ง การจัดการเวลา
        และการติดตามประวัติการใช้งาน ทำได้ง่ายในไม่กี่คลิก
      </p>
    </section>
  );
}
