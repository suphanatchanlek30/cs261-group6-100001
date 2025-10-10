// components/admin-dashboard/locations/ManageLocationTable.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiTrash2, FiImage } from "react-icons/fi";
import { getLocations, getAllLocations } from "@/services/locationService";

export default function ManageLocationTable({
  keyword = "",
  modeAll = true,        // true = โหลดทั้งหมด (ตามที่ขอ), false = แบ่งหน้า
  pageSize = 20,         // ใช้เมื่อ modeAll=false
}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);       // ใช้เมื่อ modeAll=false
  const [total, setTotal] = useState(0);     // ใช้เมื่อ modeAll=false
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ทำให้ debounce เล็ก ๆ ตอนเปลี่ยน keyword
  const q = useMemo(() => keyword?.trim() || undefined, [keyword]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");

      try {
        if (modeAll) {
          // โหมดโหลดทั้งหมด (จะไล่ทุกหน้าในฝั่ง client)
          const { ok, data, message } = await getAllLocations({ q, batchSize: 100 });
          if (!ok) throw new Error(message);
          if (cancelled) return;
          setItems(data.items || []);
          setTotal(data.total || 0);
        } else {
          // โหมดแบ่งหน้า
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

    return () => {
      cancelled = true;
    };
  }, [q, modeAll, page, pageSize]);

  const totalPages = useMemo(
    () => (modeAll ? 1 : Math.max(1, Math.ceil(total / pageSize))),
    [modeAll, total, pageSize]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-12 px-4 py-3 text-sm font-semibold text-gray-800 border-b border-gray-200">
        <div className="col-span-2">Image</div>
        <div className="col-span-4">Place name</div>
        <div className="col-span-4">Address</div>
        <div className="col-span-1 text-center">Is Active</div>
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
          {items.map((it) => (
            <li
              key={it.id}
              className="grid grid-cols-12 items-center border-b border-gray-200 px-4 py-3 hover:bg-gray-50"
            >
              {/* Image */}
              <div className="col-span-2">
                {it.coverImageUrl ? (
                  <div className="relative w-40 h-16 rounded-md overflow-hidden">
                    {/* ใช้ <img> เพื่อเลี่ยง config next/image ตอนนี้ */}
                    <img
                      src={it.coverImageUrl}
                      alt={it.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-14 rounded-md border flex items-center justify-center text-gray-400">
                    <FiImage />
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="col-span-4">
                <div className="font-medium text-gray-800">{it.name}</div>
                {/* (ออปชัน) แสดง id เล็ก ๆ */}
                <div className="text-xs text-gray-400">id : {it.id}</div>
              </div>

              {/* Address */}
              <div className="col-span-4 text-gray-600">{it.address}</div>

              {/* Is Active */}
              <div className="col-span-1 text-center">
                {it.isActive ? (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">
                    Inactive
                  </span>
                )}
              </div>

              {/* Manage */}
              <div className="col-span-1">
                <div className="flex items-center justify-center gap-3 text-[#7C3AED]">
                  <button
                    onClick={() => alert(`Edit ${it.id}`)}
                    className="hover:text-[#5c23cf]"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => confirm("Delete this location?") && alert(`Delete ${it.id}`)}
                    className="hover:text-[#5c23cf]"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination (แสดงเฉพาะโหมดแบ่งหน้า) */}
      {!modeAll && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
          <div className="text-gray-600">
            Page <b>{page + 1}</b> / {totalPages} &nbsp;•&nbsp; Total: {total}
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
