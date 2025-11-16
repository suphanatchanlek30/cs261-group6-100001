// components/admin-dashboard/SidebarLink.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * SidebarLink
 * - แสดงเป็นลิงก์คลิกได้
 * - รองรับสถานะ active (ตาม pathname)
 * - โหมดพับ (collapsed) จะซ่อน label และใส่ title เป็น tooltip
 */
export default function SidebarLink({ href, icon, children, collapsed = false }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/admin/FinancialReport");

  return (
    <Link
      href={href}
      title={collapsed ? String(children) : undefined}
      className={[
        "group flex items-center gap-3 p-2 rounded-md transition-colors",
        collapsed ? "justify-center" : "pl-3",
        active
          ? "bg-purple-50 text-purple-700"
          : "text-gray-700 hover:bg-purple-50",
      ].join(" ")}
    >
      <span className={`text-xl ${active ? "text-purple-700" : "text-purple-600"}`}>
        {icon}
      </span>
      {!collapsed && (
        <span className="text-sm font-medium">{children}</span>
      )}
    </Link>
  );
}
