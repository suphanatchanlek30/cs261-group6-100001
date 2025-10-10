// app/(public)/admin/locations/page.jsx

"use client";

import { useState } from "react";
import PageHeader from "@/components/admin-dashboard/PageHeader";
import ManageLocationTable from "@/components/admin-dashboard/ManageLocationTable";

export default function AdminDashboardPage() {
  const [keyword, setKeyword] = useState("");

  const handleSearch = (kw) => setKeyword(kw);
  const handleAdd = () => {
    // TODO: เปิด modal / ไปหน้า add location
    alert("open add location modal");
  };

  return (
    <>
     <section className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Manage Location</h1>
      <p className="text-gray-600">หน้านี้ไว้จัดการ Location</p>
      <PageHeader
        title="Manage Location"
        placeholder="Search by name or keyword"
        onSearch={handleSearch}
        onAdd={handleAdd}
      />
      {/* ถ้าจะ filter ฝั่ง client ก็ส่ง keyword ไปที่ตารางได้เลย */}
      <ManageLocationTable keyword={keyword} />
    </section>
    </>
  );
}
