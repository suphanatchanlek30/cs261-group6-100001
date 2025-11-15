// components/host-dashboard/HostShell.jsx

"use client";
/**
 * HostShell: layout หลักของแผง Host
 * - มี Topbar ด้านบน + Sidebar ซ้าย + Content
 * - ใส่ guard เบื้องต้น: ถ้าไม่ authed → เด้ง login
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HostTopbar from "./HostTopbar";
import HostSidebar from "./HostSidebar";
import { isAuthenticated } from "@/utils/authClient";

export default function HostShell({ children }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login?next=/host");
    }
    router.replace("/host/payments")
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <HostTopbar />

      <HostSidebar isCollapsed={collapsed} setIsCollapsed={setCollapsed} />

      <main
        className={`${collapsed ? "ml-16" : "ml-[250px]"} p-5 lg:p-8 min-h-[calc(100vh-4rem)]`}
      >
        {children}
      </main>
    </div>
  );
}
