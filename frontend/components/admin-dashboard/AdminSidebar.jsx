// components/admin-dashboard/AdminSidebar.jsx
"use client";

import { useState } from "react";
import SidebarLink from "./SidebarLink";
import {
  FiUsers,
  FiMapPin,
  FiClipboard,
  FiStar,
  FiCreditCard,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const items = [
    { label: "Manage Users", href: "/admin/users", icon: <FiUsers /> },
    { label: "Manage Location", href: "/admin/locations", icon: <FiMapPin /> },
    { label: "Manage Booking", href: "/admin/bookings", icon: <FiClipboard /> },
    { label: "Manage Review", href: "/admin/reviews", icon: <FiStar /> },
    { label: "Payments", href: "/admin/payments", icon: <FiCreditCard /> },
  ];

  return (
    <aside
      className={`relative h-screen border-r border-gray-200 bg-white transition-all duration-300 ease-in-out flex flex-col justify-between
        ${isCollapsed ? "w-16" : "w-[250px]"}`}
    >
      {/* เมนู */}
      <div className="p-4 space-y-2 mt-6 flex-1 overflow-y-auto">
        {items.map((it) => (
          <SidebarLink
            key={it.href}
            href={it.href}
            icon={it.icon}
            collapsed={isCollapsed}
          >
            {it.label}
          </SidebarLink>
        ))}
      </div>

      {/* ปุ่มพับ/ขยายด้านล่าง */}
      <div className="border-t border-gray-100 py-3 mb-40 flex justify-center">
        <button
          onClick={() => setIsCollapsed((v) => !v)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition"
          title={isCollapsed ? "Expand menu" : "Collapse menu"}
        >
          {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
