// components/admin-dashboard/SidebarLink.jsx

// ลิงก์ใน sidebar

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * ลิงก์ใน Sidebar + ไฮไลต์ active
 */
export default function SidebarLink({ href, icon, children }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        active ? "bg-[#F2EAFF] text-[#7C3AED]" : "text-gray-700 hover:bg-gray-50",
      ].join(" ")}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium text-sm">{children}</span>
    </Link>
  );
}
