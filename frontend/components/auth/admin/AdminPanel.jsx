// components/auth/admin/AdminPanel.jsx

// กล่องฟอร์มตรงกลาง (reuse LoginForm เดิมให้หน้าตาคงที่)
// ถ้าต้องการเปลี่ยนข้อความ/ปุ่ม ค่อยปรับที่นี่ ไม่ต้องไปแก้ฟอร์ม
import LoginForm from "@/components/auth/login/LoginForm";

export default function AdminPanel() {
  return (
    <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 sm:p-8">
      {/* หัวข้อ */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">
          Sign in for admin
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          ยินดีต้อนรับสู่ระบบ NangNaiDee Admin Panel.
        </p>
      </div>

      {/* ฟอร์มที่ใช้ซ้ำจากหน้า Login ปิดลิงก์สมัคร */}
      <LoginForm showRegisterLink={false} />
    </div>
  );
}
