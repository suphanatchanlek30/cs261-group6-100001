// app/(public)/locations/[id]/page.jsx

// หน้าหลัก ดึงข้อมูลสถานที่ + ยูนิต + รีวิว และประกอบทั้งหมดเข้าด้วยกัน

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getLocationById } from "@/services/locationService";
import { getLocationReviews } from "@/services/reviewService";
import LocationHeader from "@/components/location/LocationHeader";
import UnitList from "@/components/location/UnitList";
import BookingPanel from "@/components/location/BookingPanel";
import StarRating from "@/components/common/StarRating";
import { getLocationReviews as fetchLocationReviews } from "@/services/reviewService";

export default function LocationDetailPage() {
  const { id } = useParams();
  const [loc, setLoc] = useState(null);
  const [units, setUnits] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");

      // ดึงรายละเอียดสถานที่
      const { ok, data, message } = await getLocationById(id);
      if (cancelled) return;
      if (!ok) {
        setErr(message || "โหลดสถานที่ไม่สำเร็จ");
        setLoading(false);
        return;
      }
      // สมมติ payload อาจเป็น { ...location, units: [...] } หรือไม่มีก็ได้
      setLoc(data);
      setUnits(Array.isArray(data?.units) ? data.units : []);

      // รีวิว 3 รายการแรก
      const rv = await fetchLocationReviews(id, { page: 0, size: 3, minRating: 1 });
      if (!cancelled && rv.ok) setReviews(rv.data.items || []);

      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleBooked = (booking) => {
    // ตรงนี้จะพาไปหน้าต่อไป (เช่น หน้าชำระเงิน) หรือแจ้งสำเร็จ
    // ตอนนี้แค่วาง hook ให้ชัดเจน
    console.log("Booked:", booking);
  };

  if (loading) return <div className="mx-auto max-w-6xl p-6">Loading...</div>;
  if (err) return <div className="mx-auto max-w-6xl p-6 text-red-600">{err}</div>;
  if (!loc) return <div className="mx-auto max-w-6xl p-6">Not found</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
      {/* Header */}
      <LocationHeader
        coverImageUrl={loc.coverImageUrl}
        name={loc.name}
        address={loc.address}
        isActive={loc.active ?? loc.is_active}
      />

      {/* เนื้อหา 2 คอลัมน์ */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        {/* ซ้าย: รายละเอียด + ยูนิต */}
        <div className="space-y-4">
          {/* Detail box */}
          <div className="rounded-[14px] border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">Detail</h3>
            <p className="mt-2 text-sm text-neutral-700">
              {loc.description ||
                "This place is a new collaborative workspace designed with the concept of a quiet reading area, allowing you to fully engage your thoughts."}
            </p>
          </div>

          {/* Unit list */}
          <UnitList
            units={units}
            selectedUnitId={selectedUnit?.id}
            onSelect={(u) => setSelectedUnit(u)}
          />
        </div>

        {/* ขวา: Booking Panel */}
        <BookingPanel selectedUnit={selectedUnit} onBooked={handleBooked} />
      </div>

      {/* Reviews */}
      <div className="mt-8 rounded-[14px] border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">Reviewed</h3>
          {/* ปุ่มดูเพิ่มเติม (ถ้าต้องการ) */}
          <a
            className="text-sm text-violet-700 hover:underline"
            href={`/locations/${id}/reviews`}
          >
            See more reviews →
          </a>
        </div>

        <div className="mt-3 space-y-3">
          {reviews.length === 0 ? (
            <div className="text-sm text-neutral-500">No reviews yet.</div>
          ) : (
            reviews.map((rv) => (
              <div
                key={rv.id}
                className="rounded-[12px] border border-gray-200 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold">
                    {(rv.userFirstName || "U").charAt(0).toUpperCase()}
                  </div>
                  <StarRating value={rv.rating || 4} size={12} />
                  <span className="text-xs text-neutral-500">
                    {rv.createdAt?.split("T")[0] || ""}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-700">{rv.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
