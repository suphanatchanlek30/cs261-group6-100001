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
      <div className="min-h-screen bg-[#fafafa] flex justify-center items-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-violet-200 border-t-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm sm:text-base">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-[#fafafa] flex justify-center items-center px-4">
        <div className="text-center bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-600 font-medium mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => router.push("/admin/locations")}
            className="w-full px-5 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
          >
            กลับหน้าจัดการสถานที่
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fafafa] py-4 px-4 sm:py-10 sm:px-0">
      <section className="max-w-4xl mx-auto bg-white shadow-sm rounded-2xl p-4 sm:p-6 lg:p-10 border border-gray-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b pb-5 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 tracking-tight break-words">
            {loc.name}
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => router.push(`/admin/locations/${id}/edit`)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 text-center"
            >
              <span className="hidden sm:inline">แก้ไข Location</span>
              <span className="sm:hidden">แก้ไข Location</span>
            </button>
            <button
              onClick={() => router.push("/admin/locations")}
              className="px-4 py-2 text-sm border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 text-center"
            >
              ← กลับ
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <div className="sm:col-span-2">
            <InfoBlock label="คำอธิบาย" value={loc.description || "-"} />
          </div>
          <div className="sm:col-span-2">
            <InfoBlock label="ที่อยู่" value={loc.address || "-"} />
          </div>
          <InfoBlock label="Latitude" value={loc.geoLat?.toFixed?.(6) ?? "-"} />
          <InfoBlock label="Longitude" value={loc.geoLng?.toFixed?.(6) ?? "-"} />
          <InfoBlock
            label="สถานะการใช้งาน"
            value={
              loc.active ? (
                <span className="inline-flex px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                  Active
                </span>
              ) : (
                <span className="inline-flex px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">
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
        <div className="mt-6 sm:mt-8 lg:mt-10">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            รูปภาพหลัก
          </label>
          {loc.coverImageUrl ? (
            <div className="w-full max-w-md">
              <img
                src={loc.coverImageUrl}
                alt={loc.name}
                className="w-full h-48 sm:h-64 object-cover rounded-xl shadow-sm border border-gray-200"
              />
            </div>
          ) : (
            <div className="w-full max-w-md h-48 sm:h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
              <p className="text-gray-400 text-sm">ไม่มีรูปภาพ</p>
            </div>
          )}
        </div>

        {/* Units Section */}
        <div className="mt-8 sm:mt-10 lg:mt-14">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              รายการพื้นที่ในสถานที่ (Units)
            </h2>
            <button
              onClick={() => setShowAddUnit(true)}
              className="w-full sm:w-auto px-4 py-2 bg-[#7C3AED] text-white rounded-md hover:bg-[#6B21A8] text-center text-sm"
            >
              + เพิ่มยูนิต
            </button>
          </div>

          {loc.units && loc.units.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {loc.units.map((u) => {
                const isDeleting = deletingUnitIds.has(u.id); // เช็คกำลังลบ?
                return (
                  <div
                    key={u.id}
                    className={`border border-gray-100 rounded-xl p-4 sm:p-5 bg-gray-50 transition ${isDeleting ? "opacity-50 pointer-events-none" : "hover:bg-white hover:shadow-sm"
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0 self-center sm:self-start">
                        <img
                          src={u.imageUrl}
                          alt={u.name}
                          className="w-full h-48 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-cover rounded-md border border-gray-200"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">{u.name}</div>
                            <div className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{u.shortDesc || "-"}</div>
                          </div>

                          {/* ปุ่มแก้ไข + ปุ่มลบยูนิต */}
                          <div className="flex items-center gap-3 text-[#7C3AED] flex-shrink-0">
                            <button
                              onClick={() => { setEditingUnit(u); setOpenEditUnit(true); }}
                              className="hover:text-[#5c23cf] p-2 hover:bg-violet-50 rounded-lg transition-colors"
                              title="แก้ไขยูนิตนี้"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUnit(u)}
                              className={`hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
                              title="ลบยูนิตนี้"
                              disabled={isDeleting}
                              aria-label="Delete unit"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="mt-3 space-y-1">
                          <div className="flex flex-col xs:flex-row xs:gap-4 gap-1 text-xs sm:text-sm">
                            <div className="text-gray-500">💺 {u.capacity} ที่นั่ง</div>
                            <div className="text-gray-700 font-medium">💰 {u.priceHourly} บาท/ชั่วโมง</div>
                          </div>
                          <div className="mt-2">
                            {(u.isActive ?? u.active) ? (
                              <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">Active</span>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium">Inactive</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center mt-8 py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏢</span>
              </div>
              <p className="text-gray-500 text-sm sm:text-base">ยังไม่มียูนิตในสถานที่นี้</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">เริ่มต้นด้วยการเพิ่มยูนิตแรก</p>
            </div>
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
    <div className="space-y-2">
      <label className="block text-xs sm:text-sm font-medium text-gray-500">
        {label}
      </label>
      <div className="text-gray-800 bg-gray-50 border border-gray-100 rounded-lg p-3 font-normal text-sm sm:text-base break-words">
        {value}
      </div>
    </div>
  );
}
