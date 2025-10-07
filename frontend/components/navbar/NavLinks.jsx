// components/navbar/NavLinks.jsx

// เมนูลิงก์ที่ใช้ซ้ำได้ทั้ง Desktop & Mobile

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks({ mobile = false, onClick }) {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/home" },
    { name: "Search", href: "/search" },
    { name: "About Us", href: "/about" },
    { name: "Help", href: "/help" },
  ];

  // ฟังก์ชันเช็ค active
  const isActive = (href) => {
    if (href === "/") {
      // ให้ Home active เฉพาะตอนอยู่หน้า root จริง ๆ
      return pathname === "/home";
    }
    // หน้าอื่น ให้ active เมื่อ path เริ่มต้นด้วย href นั้น
    return pathname.startsWith(href);
  };

  return (
    <ul
      className={`flex ${
        mobile ? "flex-col space-y-4" : "space-x-6"
      } text-gray-700 font-normal`}
    >
      {links.map((link) => {
        const active = isActive(link.href);
        return (
          <li key={link.name}>
            <Link
              href={link.href}
              onClick={onClick}
              aria-current={active ? "page" : undefined}
              className={[
                "text-base font-medium transition-colors",
                active
                  ? "text-purple-600" // สีไฮไลต์ (เหมือนรูปตัวอย่าง)
                  : "text-gray-700 hover:text-gray-900",
              ].join(" ")}
            >
              {link.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
