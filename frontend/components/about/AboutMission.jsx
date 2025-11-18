// components/about/AboutMission.jsx

const items = [
  {
    title: "จองง่ายภายในไม่กี่วินาที",
    description:
      "ออกแบบให้ flow การจองสั้น กระชับ เลือกสถานที่ เวลา และจำนวนชั่วโมงได้ในหน้าเดียว",
  },
  {
    title: "ลดปัญหาการแย่งที่นั่ง",
    description:
      "ช่วยจัดการรอบการใช้งาน แสดงสถานะว่าง/ไม่ว่างแบบชัดเจน ทำให้วางแผนได้ล่วงหน้า",
  },
  {
    title: "ข้อมูลชัดเจน โปร่งใส",
    description:
      "มีประวัติการจอง การชำระเงิน และสถานะต่างๆ ให้ตรวจสอบย้อนหลังได้ตลอดเวลา",
  },
];

export default function AboutMission() {
  return (
    <section className="mb-10">
      <h2 className="text-lg md:text-xl font-semibold text-neutral-900 mb-3">
        วิสัยทัศน์และแนวคิด
      </h2>
      <p className="text-sm text-neutral-600 mb-5 max-w-2xl">
        เราอยากทำให้การหาที่นั่งอ่านหนังสือและพื้นที่ทำงาน
        เป็นเรื่องที่ไม่ต้องลุ้นอีกต่อไป
        นักศึกษาสามารถใช้เวลาโฟกัสกับการเรียนและโปรเจกต์สำคัญได้เต็มที่
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-neutral-900 mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-neutral-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
