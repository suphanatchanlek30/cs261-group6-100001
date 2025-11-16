"use client";
import { adminMenuItems } from '@/components/admin-dashboard/transaction/TransactionData.jsx';
import SidebarLink from "./SidebarLink";
import {
  FiUsers, FiMapPin, FiClipboard, FiStar, FiCreditCard,
  FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { LuChartNoAxesCombined } from "react-icons/lu";

export default function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  const items = [
    { label: "Manage Users", href: "/admin/users", icon: <FiUsers /> },
    { label: "Manage Location", href: "/admin/locations", icon: <FiMapPin /> },
    { label: "Manage Booking", href: "/admin/bookings", icon: <FiClipboard /> },
    { label: "Manage Review", href: "/admin/reviews", icon: <FiStar /> },
    { label: "Payments", href: "/admin/payments", icon: <FiCreditCard /> },
    { label: "Financial Report", href: "/admin/FinancialReport", icon: <LuChartNoAxesCombined /> },
   {label: "Transaction", href: "/admin/transaction", icon: <LuChartNoAxesCombined /> },
    ];
  return (
    <aside
      className={[
        "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)]",
        "border-r border-gray-200 bg-white",
        "transition-[width] duration-300 ease-in-out",
        "flex flex-col justify-between",
        isCollapsed ? "w-16" : "w-[250px]",
      ].join(" ")}
    >
      <div className="p-4 space-y-2 flex-1 overflow-y-auto">
        {items.map((it) => (
          <SidebarLink key={it.href} href={it.href} icon={it.icon} collapsed={isCollapsed}>
            {it.label}
          </SidebarLink>
        ))}
      </div>

      <div className="border-t border-gray-100 py-3 flex justify-center">
        <button
          onClick={() => setIsCollapsed((v) => !v)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 mb-20 rounded-full transition"
          title={isCollapsed ? "Expand menu" : "Collapse menu"}
        >
          {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
