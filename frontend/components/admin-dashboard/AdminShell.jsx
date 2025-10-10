// components/admin-dashboard/AdminShell.jsx

// layout หลัก (topbar + sidebar + content)

"use client";
/**
 * AdminShell: layout หลักของแผง Admin
 * - มี Topbar ด้านบน + Sidebar ซ้าย + Content
 * - ใส่ guard เบื้องต้น: ถ้าไม่ authed → เด้ง login
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminTopbar from "./AdminTopbar";
import AdminSidebar from "./AdminSidebar";
import { isAuthenticated } from "@/utils/authClient";

export default function AdminShell({ children }) {
  const router = useRouter();

  useEffect(() => {
    // guard: ถ้าไม่ได้ล็อกอิน → ไปหน้า login
    if (!isAuthenticated()) {
        router.replace("/admin-login?next=/admin/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      {/* Topbar */}
      <AdminTopbar />

      {/* Content area with Sidebar */}
      <div className="flex">
        {/* Sidebar (fixed width) */}
        <AdminSidebar />

        {/* Main content */}
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
