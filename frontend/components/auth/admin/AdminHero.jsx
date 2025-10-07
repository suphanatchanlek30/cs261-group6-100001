// components/auth/admin/AdminHero.jsx

// รูปพื้นหลังเต็มจอ + โลโก้ (ตัวหนังสือฟอนต์แบรนด์) ด้านบน
import Image from "next/image";

export default function AdminHero() {
  return (
    <div className="absolute inset-0 -z-10">
      {/* ภาพพื้นหลัง */}
      <Image
        // เปลี่ยน path ได้ตามไฟล์ภาพของคุณ
        src="/login-register/login-register.png"
        alt="Admin background"
        fill
        style={{ objectFit: "cover", objectPosition: "center" }}
        priority
      />
      {/* ทำให้มืดลงเพื่อให้กล่องฟอร์มเด่น */}
      <div className="absolute inset-0 bg-black/55" />

      {/* โลโก้/ชื่อแบรนด์ด้านบนกึ่งกลาง */}
      <div className="max-w-3xl mx-auto pt-30 text-center">
        <div className="text-white text-4xl sm:text-7xl font-nicomoji drop-shadow-lg tracking-wide">
          Nang Nai Dee
        </div>
      </div>
    </div>
  );
}
