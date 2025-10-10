// components/admin-dashboard/AdminSidebar.jsx

// sidebar ซ้าย + เมนู

"use client";
/**
 * AdminSidebar: แถบเมนูซ้าย
 * - เมนูหลัก 5 รายการ (Users / Location / Booking / Review / Payments)
 * - รองรับ active ตาม pathname
 */
import SidebarLink from "./SidebarLink";
import { FiUsers, FiMapPin, FiClipboard, FiStar, FiCreditCard } from "react-icons/fi";

export default function AdminSidebar() {
  const items = [
    { label: "Manage Users", href: "/admin/users", icon: <FiUsers /> },
    { label: "Manage Location", href: "/admin/locations", icon: <FiMapPin /> },
    { label: "Manage Booking", href: "/admin/bookings", icon: <FiClipboard /> },
    { label: "Manage Review", href: "/admin/reviews", icon: <FiStar /> },
    { label: "Payments", href: "/admin/payments", icon: <FiCreditCard /> },
  ];

  return (
    <aside className="w-[250px] h-screen shrink-0 hidden md:block border-r border-gray-200 bg-white">
      <div className="p-4 space-y-1">
        {items.map((it) => (
          <SidebarLink key={it.href} href={it.href} icon={it.icon}>
            {it.label}
          </SidebarLink>
        ))}
      </div>
    </aside>
  );
}
