// components/host-dashboard/profile/OnboardingTips.jsx
"use client";

export default function OnboardingTips({ profile }) {
  if (!profile) return null;
  const isHost = profile.roles?.includes('HOST');
  const tips = [];
  if (isHost) {
    tips.push({
      title: 'สร้างสถานที่แรกของคุณ',
      desc: 'ไปที่เมนู Locations แล้วกด Add Listing เพื่อสร้าง Draft.'
    });
    tips.push({
      title: 'ส่งขออนุมัติ',
      desc: 'เมื่อกรอกครบ กด Submit for Review รอแอดมินตรวจสอบ.'
    });
    tips.push({
      title: 'เปิด Active หลังอนุมัติ',
      desc: 'สถานที่ APPROVED แล้วสามารถ Activate เพื่อให้ผู้ใช้เห็น.'
    });
  }
  if (tips.length === 0) return null;

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-purple-700 mb-3">Quick Tips</h2>
      <ul className="space-y-3">
        {tips.map((t) => (
          <li key={t.title} className="flex gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-purple-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-purple-900">{t.title}</div>
              <div className="text-xs text-purple-700 mt-0.5 leading-relaxed">{t.desc}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
