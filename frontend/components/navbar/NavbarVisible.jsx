// components/navbar/NavbarVisible.jsx

"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarVisible() {
  const pathname = usePathname();

  // หน้าที่ไม่ต้องแสดง navbar
  const hideOn =
    pathname === "/login" ||
    pathname === "/register"; // เพิ่มหน้าอื่นได้ เช่น || pathname.startsWith("/admin")

  if (hideOn) return null;
  return <Navbar />;
}
