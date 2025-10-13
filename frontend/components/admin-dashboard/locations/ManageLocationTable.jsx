// components/admin-dashboard/locations/ManageLocationTable.jsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { getLocations, getAllLocations, deleteLocation } from "@/services/locationService";
import LocationTableRow from "./LocationTableRow";

export default function ManageLocationTable({
  keyword = "",
  modeAll = true,
  pageSize = 20,
}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [deletingIds, setDeletingIds] = useState(new Set()); // กันกดซ้ำ + ใส่สถานะกำลังลบ

  const q = useMemo(() => keyword?.trim() || undefined, [keyword]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        if (modeAll) {
          const { ok, data, message } = await getAllLocations({ q, batchSize: 100 });
          if (!ok) throw new Error(message);
          if (cancelled) return;
          setItems(data.items || []);
          setTotal(data.total || 0);
        } else {
          const { ok, data, message } = await getLocations({ q, page, size: pageSize });
          if (!ok) throw new Error(message);
          if (cancelled) return;
          setItems(data.items || []);
          setTotal(data.total || 0);
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [q, modeAll, page, pageSize]);

  const totalPages = useMemo(
    () => (modeAll ? 1 : Math.max(1, Math.ceil(total / pageSize))),
    [modeAll, total, pageSize]
  );

  // ลบแบบ Optimistic: ตัดออกก่อน แล้วค่อยยิง API เบื้องหลัง
  const handleDelete = async (id, name) => {
    if (deletingIds.has(id)) return; // กันเผลอกดซ้ำ

    const result = await Swal.fire({
      title: "ยืนยันลบสถานที่?",
      html: `คุณกำลังจะลบ <b>${name || id}</b><br/><small class="text-gray-500">การลบอาจไม่สำเร็จหากมีการจองพ่วงอยู่</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    // เก็บของเดิมไว้เผื่อกู้คืน + ซ่อนแถวทันที
    const backup = items;
    const next = backup.filter((x) => x.id !== id);
    setItems(next);
    setDeletingIds(new Set(deletingIds).add(id));

    try {
      const { ok, message } = await deleteLocation(id); // รองรับ 200/204
      if (!ok) {
        // พัง → กู้คืนแถวเดิม
        setItems(backup);
        throw new Error(String(message || "ลบไม่สำเร็จ"));
      }
      // สำเร็จ → toast เร็ว ๆ
      Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire("ลบไม่สำเร็จ", e.message, "error");
    } finally {
      setDeletingIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Image</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Location Details</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Address</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-800">Status</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-200 border-t-violet-600"></div>
                    <span>Loading locations...</span>
                  </div>
                </td>
              </tr>
            ) : err ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-red-600">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    <span>{err}</span>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">🏢</span>
                    <span>No locations found</span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((location) => (
                <LocationTableRow
                  key={location.id}
                  location={location}
                  onDelete={handleDelete}
                  viewType="table"
                  isDeleting={deletingIds.has(location.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden divide-y divide-gray-100">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-200 border-t-violet-600"></div>
              <span>Loading locations...</span>
            </div>
          </div>
        ) : err ? (
          <div className="p-6 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <span className="text-red-700 font-medium">Error</span>
                <span className="text-red-600 text-sm">{err}</span>
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <p className="font-medium">No locations found</p>
                <p className="text-sm text-gray-400">Try changing your search or add a new location</p>
              </div>
            </div>
          </div>
        ) : (
          items.map((location) => (
            <LocationTableRow
              key={location.id}
              location={location}
              onDelete={handleDelete}
              viewType="card"
              isDeleting={deletingIds.has(location.id)}
            />
          ))
        )}
      </div>
      {!modeAll && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
          <div className="text-gray-600">
            Page <b>{page + 1}</b> / {totalPages} • Total: {total}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 rounded-md border hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 rounded-md border hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
