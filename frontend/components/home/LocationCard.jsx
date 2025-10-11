// components/home/LocationCard.jsx


import Link from "next/link";
import { FiMapPin, FiClock, FiWifi } from "react-icons/fi";

export default function LocationCard({ loc }) {
  // address จะแสดงเป็น “จังหวัด” โดยดึงจากสตริง address (ถ้าไม่ชัดให้แสดงทั้ง address)
  const province = extractProvince(loc.address) || loc.address || "-";

  return (
    <Link
      href={`/locations/${loc.id}`}
      className="block rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
    >
      {/* รูป */}
      <div className="p-4">
        <div className="overflow-hidden rounded-xl">
          <img
            src={loc.coverImageUrl || "/placeholder.jpg"}
            alt={loc.name}
            className="h-48 w-full object-cover md:h-56"
          />
        </div>
      </div>

      {/* เนื้อหา */}
      <div className="px-4 pb-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-900 line-clamp-1">
          {loc.name}
        </h3>

        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <FiMapPin className="h-[18px] w-[18px] text-gray-500" />
            <span className="line-clamp-1">{province}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiClock className="h-[18px] w-[18px] text-gray-500" />
            <span>Open 24 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <FiWifi className="h-[18px] w-[18px] text-gray-500" />
            <span>WiFi support</span>
          </div>
        </div>
      </div>

      {/* เส้นคั่น */}
      <div className="h-px bg-gray-100" />

      {/* มุมขวาล่าง แทน “ราคา” ด้วย “ระยะทาง” ถ้ามี */}
      <div className="flex items-end justify-between px-4 pb-4 pt-3">
        <div className="text-xs text-gray-500">
          {/* เผื่ออนาคตจะมีรีวิว */}
          {/* 584 reviews */}
        </div>

        <div className="text-right">
          {typeof loc.distanceKm === "number" ? (
            <>
              <div className="text-xl font-bold leading-none text-violet-600">
                {loc.distanceKm.toFixed(2)} <span className="text-base">km</span>
              </div>
              <div className="text-xs text-gray-500">from center</div>
            </>
          ) : (
            <div className="text-xs text-gray-400">View details</div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ---- helper: ตัดคำ “จังหวัด …” คร่าว ๆ จาก address ----
function extractProvince(address = "") {
  // ครอบคลุม “กรุงเทพมหานคร/Nonthaburi/Pathum Thani” แบบง่าย ๆ
  const lowers = address.toLowerCase();
  if (lowers.includes("กรุงเทพ") || lowers.includes("bangkok")) return "Bangkok";
  if (lowers.includes("นนทบุรี") || lowers.includes("nonthaburi")) return "Nonthaburi";
  if (lowers.includes("ปทุมธานี") || lowers.includes("pathum")) return "Pathum Thani";
  return null;
}

