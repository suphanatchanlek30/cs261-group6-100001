// components/navbar/Navbar.jsx

"use client"; 

import { useEffect,useState } from "react";
import { HiMenu, HiX } from "react-icons/hi"; // ไอคอน hamburger / close
import { useRouter } from "next/navigation";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import { isAuthenticated, clearToken } from "@/utils/authClient";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // state คุมเมนูมือถือ
  const [authed, setAuthed] = useState(false); // state คุมการเข้าสู่ระบบ

  // อ่านสถานะครั้งแรก + subscribe การเปลี่ยนแปลง
  useEffect(() => {
    setAuthed(isAuthenticated());

    const onChange = () => setAuthed(isAuthenticated());
    window.addEventListener("storage", onChange);      // กรณี login/logout จากแท็บอื่น
    window.addEventListener("auth-changed", onChange); // custom event จาก setToken/clearToken

    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("auth-changed", onChange);
    };
  }, []);

  const handleLogout = () => {
    clearToken(); // ลบ JWT + ยิง event
    setIsOpen(false);
    router.replace("/"); // กลับหน้าแรก
  };

  return (
    <header className="w-full bg-white shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* ===== LOGO ===== */}
          <div className="flex-shrink-0 text-2xl font-nicomoji text-[#495560]">
            NangNaiDee
          </div>

          {/* ===== Desktop Menu (จอใหญ่) ===== */}
           {/* Desktop menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <NavLinks />
            {!authed ? (
              <div className="flex items-center gap-3">
                <a
                  href="/login"
                  className="bg-[#1800ad] text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-[#10026a]"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="px-5 py-2 rounded-md text-sm font-semibold text-[#1800ad] border border-[#e0dbff] hover:bg-[#f7f6ff]"
                >
                  Register
                </a>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-md text-sm font-semibold text-white bg-[#1800ad] hover:bg-[#1F0C48]"
              >
                Sign Out
              </button>
            )}
          </div>

          {/* ===== Mobile Hamburger ===== */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ===== Mobile Menu Slide ===== */}
      {isOpen && <MobileMenu authed={authed} onClose={() => setIsOpen(false)} onLogout={handleLogout} />}
    </header>
  );
}
