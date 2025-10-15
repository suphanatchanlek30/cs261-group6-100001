// app/(public)/admin/reviews/page.jsx
"use client";

import AdminReviewTable from "@/components/admin-dashboard/reviews/AdminReviewTable";

export default function AdminReviewsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Manage Review</h1>
      <p className="text-gray-600">ตรวจสอบ อนุมัติ หรือซ่อนรีวิวจากผู้ใช้ เพื่อรักษาคุณภาพและความน่าเชื่อถือของระบบ</p>
      
      {/* Review Management Table */}
      <AdminReviewTable pageSize={10} />
    </section>
  );
}
