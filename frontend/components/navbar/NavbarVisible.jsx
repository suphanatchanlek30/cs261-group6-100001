// components/navbar/NavbarVisible.jsx

"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarVisible() {
  const pathname = usePathname();

  // หน้าที่ไม่ต้องแสดง navbar
  const hideOn =
    pathname === "/login" ||
    pathname === "/register" || 
    pathname === "/admin" || 
    pathname === "/admin/locations" ||
    pathname === "/admin/users" ||
    pathname === "/admin/bookings" ||
    pathname === "/admin/payments" ||
    pathname === "/admin/reviews" ||
    pathname === "/admin-login";
     // เพิ่มหน้าอื่นได้ เช่น || pathname.startsWith("/admin")

  if (hideOn) return null;
  return <Navbar />;
}
