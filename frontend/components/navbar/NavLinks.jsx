// components/navbar/NavLinks.jsx
// เมนูลิงก์ที่ใช้ซ้ำได้ทั้ง Desktop & Mobile

export default function NavLinks({ mobile = false, onClick }) {
  const links = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Help", href: "/help" },
  ];

  return (
    <ul
      className={`flex ${
        mobile ? "flex-col space-y-4" : "space-x-6"
      } text-gray-700 font-normal`}
    >
      {links.map((link) => (
        <li key={link.name}>
          <a
            href={link.href}
            className="hover:text-gray-900 text-base font-medium" 
            onClick={onClick}
          >
            {link.name}
          </a>
        </li>
      ))}
    </ul>
  );
}
