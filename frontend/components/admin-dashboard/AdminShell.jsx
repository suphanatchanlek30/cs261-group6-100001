// components/admin-dashboard/AdminShell.jsx

// layout หลัก (topbar + sidebar + content)

"use client";
/**
 * AdminShell: layout หลักของแผง Admin
 * - มี Topbar ด้านบน + Sidebar ซ้าย + Content
 * - ใส่ guard เบื้องต้น: ถ้าไม่ authed → เด้ง login
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminTopbar from "./AdminTopbar";
import AdminSidebar from "./AdminSidebar";
import { isAuthenticated } from "@/utils/authClient";

export default function AdminShell({ children }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/admin-login?next=/admin/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <AdminTopbar />

      {/* Sidebar แบบ fixed + ค้างใต้ Topbar */}
      <AdminSidebar isCollapsed={collapsed} setIsCollapsed={setCollapsed} />

      {/* เนื้อหาเลื่อน และเว้นซ้ายตามความกว้าง sidebar */}
      <main
        className={`${collapsed ? "ml-16" : "ml-[250px]"} p-5 lg:p-8 min-h-[calc(100vh-4rem)]`}
      >
        {children}
      </main>
    </div>
  );
}