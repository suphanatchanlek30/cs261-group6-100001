// app/(public)/admin/locations/page.jsx
"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/admin-dashboard/PageHeader";
import ManageLocationTable from "@/components/admin-dashboard/locations/ManageLocationTable";
import { useState } from "react";

export default function AdminLocationsPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const handleSearch = (kw) => setKeyword(kw);
  const handleAdd = () => router.push("/admin/locations/new");

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Manage Location</h1>
      <p className="text-gray-600">เพิ่ม แก้ไข หรือลบข้อมูลสถานที่ในระบบได้จากหน้านี้</p>

      <PageHeader
        title="Manage Location"
        placeholder="Search by name or keyword"
        onSearch={handleSearch}
        onAdd={handleAdd}
      />

      {/* โหมดโหลดทั้งหมด (ตามที่ต้องการ) */}
      {/* <ManageLocationTable keyword={keyword} modeAll /> */}

      
      {/* // ถ้าจะใช้โหมดแบ่งหน้า */}
      <ManageLocationTable keyword={keyword} modeAll={false} pageSize={20} />
     
    </section>
  );
}
