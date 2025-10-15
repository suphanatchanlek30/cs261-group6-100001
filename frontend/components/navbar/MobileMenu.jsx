// components/navbar/MobileMenu.jsx

// MobileMenu.jsx
// เมนูที่โผล่มาเฉพาะตอนจอมือถือ

import NavLinks from "./NavLinks";

export default function MobileMenu({ authed, onClose, onLogout }) {
  return (
    <div className="md:hidden bg-white shadow-md border-t border-gray-200">
      <div className="px-4 py-4 space-y-6">
        {/* เมนูลิงก์ */}
        <NavLinks mobile={true} onClick={onClose} />

        {/* ปุ่ม Sign In */}
        <div className="pt-4 border-t border-gray-200 grid grid-cols-1 gap-3">
          {!authed ? (
            <>
              <a
                href="/login"
                className="block text-center bg-[#7C3AED] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#3a1777]"
                onClick={onClose}
              >
                Sign In
              </a>
              <a
                href="/register"
                className="block text-center px-4 py-2 rounded-md text-sm font-semibold text-[#7C3AED] border border-[#e0dbff] hover:bg-[#f7f6ff]"
                onClick={onClose}
              >
                Register
              </a>
            </>
          ) : (
            <button
              onClick={onLogout}
              className="w-full text-center bg-[#7C3AED] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#3a1777]"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
