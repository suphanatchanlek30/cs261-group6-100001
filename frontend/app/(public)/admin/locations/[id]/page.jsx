// app/(public)/admin/locations/[id]/page.jsx
// รายละเอียดสถานที่ + รายการยูนิตในสถานที่นั้น
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLocationById } from "@/services/locationService";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import AddUnitModal from "@/components/admin-dashboard/locations/AddUnitModal";
import EditUnitModal from "@/components/admin-dashboard/units/EditUnitModal";
import Swal from "sweetalert2";
import { deleteUnit } from "@/services/unitService";

export default function LocationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loc, setLoc] = useState(null);
  const [error, setError] = useState("");
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null); // unit ที่กำลังจะแก้
  const [openEditUnit, setOpenEditUnit] = useState(false); // ควบคุม modal
  const [deletingUnitIds, setDeletingUnitIds] = useState(new Set()); // กันกดซ้ำตอนลบ id ของ unit ที่กำลังลบ

  const handleDeleteUnit = async (unit) => {
    if (!unit?.id) return;
    if (deletingUnitIds.has(unit.id)) return;

    const result = await Swal.fire({
      title: "ลบยูนิตนี้?",
      html: `คุณกำลังจะลบ <b>${unit.name || unit.code || unit.id}</b><br/><small class="text-gray-500">หากยูนิตมีการจองที่เกี่ยวข้อง ระบบอาจไม่อนุญาตให้ลบ</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    // optimistic: ทำให้จางและกันกด
    setDeletingUnitIds((prev) => new Set(prev).add(unit.id));

    const { ok, message } = await deleteUnit(unit.id);
    if (!ok) {
      setDeletingUnitIds((prev) => {
        const s = new Set(prev);
        s.delete(unit.id);
        return s;
      });
      return Swal.fire("ลบไม่สำเร็จ", String(message), "error");
    }

    // ตัดยูนิตออกจาก state
    setLoc((prev) => ({
      ...prev,
      units: (prev.units || []).filter((u) => u.id !== unit.id),
    }));

    setDeletingUnitIds((prev) => {
      const s = new Set(prev);
      s.delete(unit.id);
      return s;
    });

    Swal.fire({ icon: "success", title: "ลบยูนิตแล้ว", timer: 1200, showConfirmButton: false });
  };

  const handleUnitUpdated = (updated) => {
    setLoc((prev) => {
      if (!prev?.units) return prev;
      const nextUnits = prev.units.map((u) => (u.id === updated.id ? { ...u, ...updated } : u));
      return { ...prev, units: nextUnits };
    });
  };

  const fetchLocation = async () => {
    const { ok, data, message } = await getLocationById(id);
    if (!ok) setError(message || "ไม่พบข้อมูลสถานที่");
    else setLoc(data);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchLocation();
      setLoading(false);
    })();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500">
        กำลังโหลดข้อมูล...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600 p-10">
        {error}
        <div>
          <button
            onClick={() => router.push("/admin/locations")}
            className="mt-4 px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            กลับ
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fafafa] py-10">
      <section className="max-w-4xl mx-auto bg-white shadow-sm rounded-2xl p-10 border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-5 mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
            {loc.name}
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/admin/locations/${id}/edit`)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
            >
              แก้ไข Location
            </button>
            <button
              onClick={() => router.push("/admin/locations")}
              className="px-4 py-2 text-sm border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
            >
              ← กลับ
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8">
          <InfoBlock label="คำอธิบาย" value={loc.description || "-"} />
          <InfoBlock label="ที่อยู่" value={loc.address || "-"} />
          <InfoBlock label="Latitude" value={loc.geoLat?.toFixed?.(6) ?? "-"} />
          <InfoBlock label="Longitude" value={loc.geoLng?.toFixed?.(6) ?? "-"} />
          <InfoBlock
            label="สถานะการใช้งาน"
            value={
              loc.active ? (
                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                  Active
                </span>
              ) : (
                <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">
                  Inactive
                </span>
              )
            }
          />
          <InfoBlock
            label="วันที่สร้าง"
            value={loc.createdAt ? new Date(loc.createdAt).toLocaleString("th-TH") : "-"}
          />
        </div>

        {/* Cover Image */}
        <div className="mt-10">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            รูปภาพหลัก
          </label>
          {loc.coverImageUrl ? (
            <img
              src={loc.coverImageUrl}
              alt={loc.name}
              className="w-full max-w-md rounded-xl shadow-sm border border-gray-200"
            />
          ) : (
            <p className="text-gray-400">ไม่มีรูปภาพ</p>
          )}
        </div>

        {/* Units Section */}
        <div className="mt-14">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-800">
              รายการพื้นที่ในสถานที่ (Units)
            </h2>
            <button
              onClick={() => setShowAddUnit(true)}
              className="px-4 py-2 bg-[#7C3AED] text-white rounded-md hover:bg-[#6B21A8]"
            >
              + เพิ่มยูนิต
            </button>
          </div>

          {loc.units && loc.units.length > 0 ? (
            <div className="grid grid-cols-2 gap-6">
              {loc.units.map((u) => {
                const isDeleting = deletingUnitIds.has(u.id); // ✅ เช็คกำลังลบ?
                return (
                  <div
                    key={u.id}
                    className={`border border-gray-100 rounded-xl p-5 bg-gray-50 transition ${isDeleting ? "opacity-50 pointer-events-none" : "hover:bg-white hover:shadow-sm"
                      }`}
                  >
                    <div className="flex gap-4">
                      <img
                        src={u.imageUrl}
                        alt={u.name}
                        className="w-24 h-24 object-cover rounded-md border border-gray-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-gray-800">{u.name}</div>
                            <div className="text-sm text-gray-600 mt-1">{u.shortDesc || "-"}</div>
                          </div>

                          {/* ปุ่มแก้ไข + ปุ่มลบยูนิต */}
                          <div className="flex items-center gap-3 text-[#7C3AED]">
                            <button
                              onClick={() => { setEditingUnit(u); setOpenEditUnit(true); }}
                              className="hover:text-[#5c23cf] text-sm"
                              title="แก้ไขยูนิตนี้"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDeleteUnit(u)}
                              className={`hover:text-[#5c23cf] text-sm ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
                              title="ลบยูนิตนี้"
                              disabled={isDeleting}
                              aria-label="Delete unit"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 mt-1">💺 {u.capacity} ที่นั่ง</div>
                        <div className="text-sm text-gray-700 font-medium mt-1">💰 {u.priceHourly} บาท/ชั่วโมง</div>
                        <div className="mt-2">
                          {(u.isActive ?? u.active) ? (
                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Active</span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Inactive</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-5">ยังไม่มียูนิตในสถานที่นี้</p>
          )}
        </div>
      </section>

      {/* Modal เพิ่มยูนิต */}
      <AddUnitModal
        open={showAddUnit}
        onClose={() => setShowAddUnit(false)}
        locationId={loc.id}
        onAdded={() => fetchLocation()}
      />

      <EditUnitModal
        open={openEditUnit}
        onClose={() => setOpenEditUnit(false)}
        unit={editingUnit}
        onUpdated={handleUnitUpdated}
      />
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">
        {label}
      </label>
      <div className="text-gray-800 bg-gray-50 border border-gray-100 rounded-lg p-3 font-normal">
        {value}
      </div>
    </div>
  );
}
