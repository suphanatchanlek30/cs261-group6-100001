// app/(public)/host/locations/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMyLocationDetail, submitForReview, updateLocationActive } from "@/services/hostlocationService";
import { deleteUnit } from "@/services/unitService"; 
import { FiEdit2, FiTrash2, FiSend } from "react-icons/fi"; // 1. ลบ FiClock, FiSlash
import Swal from "sweetalert2";

// 2. ลบ Import ที่ไม่ใช้ออก
import HostAddUnitModal from "@/components/host-dashboard/location/HostAddUnitModal";
import HostEditUnitModal from "@/components/host-dashboard/location/HostEditUnitModal";
// import HostHoursEditor from "@/components/host-dashboard/location/HostHoursEditor"; // <-- 2. ลบออก
// import HostBlockerModal from "@/components/host-dashboard/location/HostBlockerModal"; // <-- 2. ลบออก

export default function HostLocationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loc, setLoc] = useState(null);
  const [error, setError] = useState("");

  // States สำหรับ Modal
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null); 
  const [openEditUnit, setOpenEditUnit] = useState(false);
  // const [showHoursEditor, setShowHoursEditor] = useState(false); // <-- 3. ลบ State
  // const [showBlockModal, setShowBlockModal] = useState({ ... }); // <-- 3. ลบ State

  // States สำหรับ Loading
  const [deletingUnitIds, setDeletingUnitIds] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLocation = async () => {
    const { ok, data, message } = await getMyLocationDetail(id);
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
  
  // --- Handlers สำหรับ Location ---
  const handleSubmitReview = async () => {
    // ... (เหมือนเดิม) ...
    setIsSubmitting(true);
     const { ok, message } = await submitForReview(id);
     setIsSubmitting(false);
     if (!ok) {
         return Swal.fire("ผิดพลาด", String(message || "ส่งตรวจสอบไม่สำเร็จ"), "error");
     }
     await Swal.fire("ส่งสำเร็จ", "ส่งสถานที่ให้แอดมินตรวจสอบแล้ว", "success");
     fetchLocation();
  };

  // --- Handlers สำหรับ Unit ---
  const handleDeleteUnit = async (unit) => {
    // ... (เหมือนเดิม) ...
    if (!unit?.id || deletingUnitIds.has(unit.id)) return;
    const result = await Swal.fire({
      title: "ลบยูนิตนี้?",
      html: `คุณกำลังจะลบ <b>${unit.name || unit.code || unit.id}</b>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
    });
    if (!result.isConfirmed) return;

    setDeletingUnitIds((prev) => new Set(prev).add(unit.id));
    const { ok, message } = await deleteUnit(unit.id); 
    if (!ok) {
      setDeletingUnitIds((prev) => {
        const s = new Set(prev); s.delete(unit.id); return s;
      });
      return Swal.fire("ลบไม่สำเร็จ", String(message), "error");
    }

    setLoc((prev) => ({
      ...prev,
      units: (prev.units || []).filter((u) => u.id !== unit.id),
    }));
    setDeletingUnitIds((prev) => {
       const s = new Set(prev); s.delete(unit.id); return s;
    });
    Swal.fire({ icon: "success", title: "ลบยูนิตแล้ว", timer: 1200, showConfirmButton: false });
  };

  const handleUnitUpdated = (updated) => {
    // ... (เหมือนเดิม) ...
    setLoc((prev) => {
      if (!prev?.units) return prev;
      const nextUnits = prev.units.map((u) => (u.id === updated.id ? { ...u, ...updated } : u));
      return { ...prev, units: nextUnits };
    });
  };
  
  // 4. ลบ Handlers ทั้งหมดของ Blocker
  // const handleOpenBlocker = (...) => { ... };
  // const handleCloseBlocker = (...) => { ... };
  // const handleSubmitBlock = (...) => { ... };


  if (loading) return <div className="min-h-screen flex justify-center items-center"><p>Loading...</p></div>;
  if (error) return <div className="min-h-screen flex justify-center items-center"><p className="text-red-600">{error}</p></div>;
  if (!loc) return null;

  // normalize status from API
  const raw = (loc.publishStatus ?? loc.status ?? "DRAFT");
  const upper = String(raw).toUpperCase();
  const status = upper === "PENDING" ? "PENDING_REVIEW" : upper;
  const canEdit = status === "DRAFT" || status === "REJECTED";
  const canSubmit = status === "DRAFT" || status === "REJECTED";
  const isActive = Boolean(loc.isActive ?? loc.active);

  const handleToggleActive = async () => {
    if (status !== "APPROVED") return;
    const target = !Boolean(loc.isActive ?? loc.active);
    const result = await Swal.fire({
      title: target ? "เปิดใช้งานสถานที่นี้?" : "ปิดใช้งานสถานที่นี้?",
      text: target ? "ผู้ใช้จะมองเห็นและสามารถจองได้" : "ผู้ใช้จะไม่เห็นและไม่สามารถจองได้",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: target ? "เปิดใช้งาน" : "ปิดใช้งาน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: target ? "#10b981" : "#ef4444",
    });
    if (!result.isConfirmed) return;
    const { ok, data, status: httpStatus, message } = await updateLocationActive(id, target);
    if (!ok) {
      const reason = httpStatus === 422
        ? "เมื่อสถานะ APPROVED สามารถแก้ได้เฉพาะ isActive เท่านั้น"
        : httpStatus === 403
        ? "คุณไม่มีสิทธิ์แก้ไขสถานที่นี้"
        : String(message || "สลับสถานะไม่สำเร็จ");
      return Swal.fire("ไม่สำเร็จ", reason, "error");
    }
    // อัปเดตสถานะทันที แล้วดึงจากเซิร์ฟเวอร์เพื่อยืนยันค่าจริง
    setLoc((prev) => ({ ...prev, isActive: (data?.isActive ?? data?.active ?? target) }));
    await fetchLocation();
    Swal.fire({ icon: "success", title: "อัปเดตสถานะแล้ว", timer: 1200, showConfirmButton: false });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-4 px-4 sm:py-10 sm:px-0">
      <section className="max-w-4xl mx-auto bg-white shadow-sm rounded-2xl p-4 sm:p-6 lg:p-10 border border-gray-100">
        
        {/* Header (เหมือนเดิม) */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b pb-5 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 tracking-tight break-words">
            {loc.name}
          </h1>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {canSubmit && (
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm border border-emerald-300 bg-emerald-50 rounded-md text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                >
                  <FiSend className="inline -mt-1 mr-1" />
                  {isSubmitting ? "Submitting..." : "Submit for Review"}
                </button>
            )}
            {canEdit && (
                <button
                  onClick={() => router.push(`/host/locations/${id}/edit`)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 text-center"
                >
                  <FiEdit2 className="inline -mt-1 mr-1" /> แก้ไข Location
                </button>
            )}
            <button
              onClick={() => router.push("/host/locations")}
              className="px-4 py-2 text-sm border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 text-center"
            >
              ← กลับ
            </button>
          </div>
        </div>

        {/* --- 5. ลบส่วนจัดการ Hours/Block --- */}
        {/* (โค้ดส่วนนี้ถูกลบออกทั้งหมด) */}
        
        {/* Info Grid (ปรับ mt-6 ออก) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <InfoBlock label="Publish Status" value={<StatusDisplay loc={loc} />} />
            <InfoBlock 
                label="Active Status" 
                value={
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <span className="inline-flex px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                    ) : (
                      <span className="inline-flex px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">Inactive</span>
                    )}
                    {status === "APPROVED" && (
                      <button
                        type="button"
                        onClick={handleToggleActive}
                        className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${isActive ? "border-rose-200 text-rose-700 hover:bg-rose-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </div>
                }
            />
            {loc.publishStatus === "REJECTED" && loc.rejectReason && (
                <div className="sm:col-span-2">
                    <InfoBlock label="Reason for Rejection" value={
                        <span className="text-rose-600">{loc.rejectReason}</span>
                    } />
                </div>
            )}
            <div className="sm:col-span-2">
                <InfoBlock label="คำอธิบาย" value={loc.description || "-"} />
            </div>
            <div className="sm:col-span-2">
                <InfoBlock label="ที่อยู่" value={loc.address || "-"} />
            </div>
            <InfoBlock label="Latitude" value={loc.geoLat?.toFixed?.(6) ?? "-"} />
            <InfoBlock label="Longitude" value={loc.geoLng?.toFixed?.(6) ?? "-"} />
        </div>

        {/* Cover Image (เหมือนเดิม) */}
        <div className="mt-6 sm:mt-8 lg:mt-10">
            {/* ... (Image) ... */}
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
                const isDeleting = deletingUnitIds.has(u.id);
                return (
                  <div key={u.id} className={`border border-gray-100 rounded-xl p-4 sm:p-5 bg-gray-50 transition ${isDeleting ? "opacity-50 pointer-events-none" : "hover:bg-white hover:shadow-sm"}`}>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* ... (Image) ... */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* ... (Name/Desc) ... */}
                            <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">{u.name}</div>
                            <div className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{u.shortDesc || "-"}</div>
                          </div>
                          
                          {/* 6. ลบปุ่ม "Block Unit" (FiSlash) */}
                          <div className="flex items-center gap-1 text-[#7C3AED] flex-shrink-0">
                            {/* (ปุ่ม Block Unit ถูกลบออกจากตรงนี้แล้ว) */}
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
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Details (เหมือนเดิม) */}
                        <div className="mt-3 space-y-1">
                          {/* ... (Capacity, Price, Status) ... */}
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
              {/* ... (No Units UI) ... */}
            </div>
          )}
        </div>
      </section>

      {/* --- Modals --- */}
      <HostAddUnitModal
        open={showAddUnit}
        onClose={() => setShowAddUnit(false)}
        locationId={loc.id}
        onAdded={() => fetchLocation()}
      />
      <HostEditUnitModal
        open={openEditUnit}
        onClose={() => setOpenEditUnit(false)}
        unit={editingUnit}
        onUpdated={handleUnitUpdated}
      />
      
    </div>
  );
}

// Helper components (เหมือนเดิม)
function InfoBlock({ label, value }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs sm:text-sm font-medium text-gray-500">{label}</label>
      <div className="text-gray-800 bg-gray-50 border border-gray-100 rounded-lg p-3 font-normal text-sm sm:text-base break-words">
        {value}
      </div>
    </div>
  );
}
function StatusDisplay({ loc }) {
  // Normalize status from detail API: accept publishStatus or status and casing
  const raw = (loc.publishStatus ?? loc.status ?? "DRAFT");
  const upper = String(raw).toUpperCase();
  const norm = upper === "PENDING" ? "PENDING_REVIEW" : upper;
  let statusText = norm;
  let statusClass = "text-gray-700";
  switch (norm) {
    case "DRAFT": statusClass = "text-gray-700"; break;
    case "PENDING_REVIEW": statusClass = "text-blue-700"; break;
    case "APPROVED": statusClass = "text-emerald-700"; break;
    case "REJECTED": statusClass = "text-rose-700"; break;
  }
  return <span className={`font-semibold ${statusClass}`}>{statusText}</span>
}