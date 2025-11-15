"use client";
import UsersPageView from "../../../../components/admin-dashboard/users/UsersPageView";

// app/(public)/admin/users/page.jsx
export default function AdminUsersPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <p className="text-gray-600">ตรวจสอบ แก้ไข หรือตั้งสิทธิ์ของผู้ใช้งานในระบบได้จากหน้านี้</p>
      </div>
      <UsersPageView />
    </section>
  );
}
