// components/navbar/Navbar.jsx

"use client"; 

import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi"; // ไอคอน hamburger / close
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // state คุมเมนูมือถือ

  return (
    <header className="w-full bg-white shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* ===== LOGO ===== */}
          <div className="flex-shrink-0 text-2xl font-nicomoji text-[#495560]">
            NangNaiDee
          </div>

          {/* ===== Desktop Menu (จอใหญ่) ===== */}
          <div className="hidden md:flex space-x-6 items-center">
            <NavLinks />
            <a
              href="/login"
              className="bg-gray-200 px-6 py-2 rounded-md text-base font-semibold text-gray-800 hover:bg-gray-300"
            >
              Sign In
            </a>
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
      {isOpen && <MobileMenu onClose={() => setIsOpen(false)} />}
    </header>
  );
}
