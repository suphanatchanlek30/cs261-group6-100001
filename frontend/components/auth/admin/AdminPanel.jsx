// components/auth/admin/AdminPanel.jsx

import AdminLoginForm from "./AdminLoginForm";

export default function AdminPanel() {
  return (
    <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 sm:p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">
          Sign in for admin
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          ยินดีต้อนรับสู่ระบบ NangNaiDee Admin Panel.
        </p>
      </div>

      {/* พาไป path ที่อยากให้แอดมินเข้า */}
      <AdminLoginForm adminRedirect="/admin/dashboard" />
    </div>
  );
}
