// components/auth/admin/AdminSection.jsx

// รวมฉากหลัง (AdminHero) + กล่องฟอร์ม (AdminPanel)
import AdminHero from "./AdminHero";
import AdminPanel from "./AdminPanel";

export default function AdminSection() {
  return (
    <div className="relative min-h-screen">
      {/* พื้นหลังเต็มจอ + overlay มืด */}
      <AdminHero />

      {/* เนื้อหาด้านหน้า (ฟอร์ม) */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <AdminPanel />
      </div>
    </div>
  );
}
