// components/navbar/MobileMenu.jsx

// MobileMenu.jsx
// เมนูที่โผล่มาเฉพาะตอนจอมือถือ

import NavLinks from "./NavLinks";

export default function MobileMenu({ onClose }) {
  return (
    <div className="md:hidden bg-white shadow-md border-t border-gray-200">
      <div className="px-4 py-4 space-y-6">
        {/* เมนูลิงก์ */}
        <NavLinks mobile={true} onClick={onClose} />

        {/* ปุ่ม Sign In */}
        <div className="pt-4 border-t border-gray-200">
          <a
            href="/login"
            className="block text-center bg-gray-200 px-4 py-2 rounded-md text-sm font-semibold text-gray-800 hover:bg-gray-300"
            onClick={onClose}
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
