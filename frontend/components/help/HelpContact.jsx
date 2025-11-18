// components/help/HelpContact.jsx

export default function HelpContact() {
  return (
    <section className="mt-6">
      <h2 className="text-lg md:text-xl font-semibold text-neutral-900 mb-4">
        ยังต้องการความช่วยเหลือเพิ่มเติม?
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2">
            ช่องทางหลัก
          </p>
          <p className="text-sm font-medium text-neutral-900 mb-1">
            ติดต่อผ่านอีเมล
          </p>
          <p className="text-sm text-neutral-600 mb-3">
            ส่งรายละเอียดปัญหาและรูปประกอบมาที่อีเมลทีมงาน
          </p>
          <p className="text-xs font-mono text-neutral-700">
            nangnaidee.support@gmail.com
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2">
            แชท
          </p>
          <p className="text-sm font-medium text-neutral-900 mb-1">
            กลุ่ม Discord
          </p>
          <p className="text-sm text-neutral-600 mb-3">
            เข้าร่วมกลุ่ม Discord เพื่อพูดคุยและขอความช่วยเหลือจากทีมงาน
          </p>
          <p className="text-xs font-mono text-neutral-700">
            <a href="https://discord.gg/gyCr54kY">Discord NangNaiDee</a>
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2">
            เอกสาร
          </p>
          <p className="text-sm font-medium text-neutral-900 mb-1">
            คู่มือการใช้งาน
          </p>
          <p className="text-sm text-neutral-600 mb-3">
            สามารถแนบลิงก์เอกสาร PDF / Notion / Google Docs
            สำหรับอธิบายการใช้งานแบบละเอียด
          </p>
          <p className="text-xs font-mono text-neutral-700">
            docs.example.com/help
          </p>
        </div>
      </div>
    </section>
  );
}
