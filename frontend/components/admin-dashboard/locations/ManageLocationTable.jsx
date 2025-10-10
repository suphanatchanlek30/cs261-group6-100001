// components/admin-dashboard/locations/ManageLocationTable.jsx

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiTrash2, FiImage } from "react-icons/fi";
import Swal from "sweetalert2";
import { getLocations, getAllLocations, deleteLocation } from "@/services/locationService";

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
       <div className="overflow-x-auto">
      <div className="grid grid-cols-12 px-4 py-3 text-sm font-semibold text-gray-800 border-b border-gray-200">
        <div className="col-span-2">Image</div>
        <div className="col-span-4">Place name</div>
        <div className="col-span-4">Address</div>
        <div className="col-span-1 text-center">Status</div>
        <div className="col-span-1 text-center">Manage</div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-500">Loading...</div>
      ) : err ? (
        <div className="p-6 text-center text-red-600">{err}</div>
      ) : items.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No locations</div>
      ) : (
        <ul className="divide-y">
          {items.map((it) => {
            const isDeleting = deletingIds.has(it.id);
            return (
              <li
                key={it.id}
                className={`grid grid-cols-12 items-center px-4 py-3 border-b border-gray-200 ${
                  isDeleting ? "opacity-50 pointer-events-none" : "hover:bg-gray-50"
                }`}
              >
                <div className="sm:col-span-2 flex justify-center sm:justify-start">
                  {it.coverImageUrl ? (
                    <div className="relative w-28 h-16 sm:w-18 md:w-20 xl:w-50 rounded-md overflow-hidden">
                      <img src={it.coverImageUrl} alt={it.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-14 rounded-md border flex items-center justify-center text-gray-400">
                      <FiImage />
                    </div>
                  )}
                </div>

                {/* คลิกชื่อ → หน้า detail */}
                <div className="sm:col-span-4">
                  <Link
                    href={`/admin/locations/${it.id}`}
                    className="font-medium text-[#7C3AED] hover:text-[#7C3AED] transition underline"
                    title="ดูรายละเอียดสถานที่"
                  >
                    {it.name}
                  </Link>
                  <div className="text-xs text-gray-400">id : {it.id}</div>
                </div>

                <div className="sm:col-span-4 text-gray-600 text-sm flex wrap">{it.address}</div>

                <div className="col-span-1 text-center">
                  {(it.isActive ?? it.active) ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="col-span-1">
                  <div className="flex items-center justify-center gap-2 md:gap-4 text-[#7C3AED]">
                    <Link
                      href={`/admin/locations/${it.id}/edit`}
                      className="hover:text-[#5c23cf]"
                      title="Edit location"
                    >
                      <FiEdit2 />
                    </Link>

                    <button
                      onClick={() => handleDelete(it.id, it.name)}
                      className={`hover:text-[#5c23cf] ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
                      title="Delete"
                      disabled={isDeleting}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                
              </li>
            );
          })}
        </ul>
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
