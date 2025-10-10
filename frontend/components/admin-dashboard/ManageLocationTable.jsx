// components/admin-dashboard/ManageLocationTable.jsx

// ตารางตัวอย่าง (image/name/address/time/manage)

"use client";
/**
 * ตารางตัวอย่าง “Manage Location”
 * - ตอนนี้ใช้ mock data → จุดต่อ API อยู่ใน useEffect (comment)
 * - ปุ่ม edit/delete เป็น placeholder (คุณต่อ modal/route ได้เลย)
 */
import Image from "next/image";
import { FiEdit2, FiTrash2, FiImage } from "react-icons/fi";
import { useEffect, useState } from "react";

export default function ManageLocationTable() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // TODO: ต่อ API จริง
    // ตัวอย่าง: const res = await api.get('/admin/locations');
    // setItems(res.data.items);
    setItems([
      {
        id: "loc1",
        name: "The Meal Co-Op",
        address: "Samyan Mitrtown, 2nd Floor",
        time: "08:00-20:00",
        image:
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=400&auto=format&fit=crop",
      },
      {
        id: "loc2",
        name: "Nang nai jai",
        address: "Thammasat Rangsit, Puy 1st Flor",
        time: "08:00-20:00",
        image:
          "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=400&auto=format&fit=crop",
      },
    ]);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-12 px-4 py-3 text-sm font-semibold text-gray-500 border-b">
        <div className="col-span-2">Image</div>
        <div className="col-span-4">Place name</div>
        <div className="col-span-4">Address</div>
        <div className="col-span-1 text-center">Time</div>
        <div className="col-span-1 text-center">Manage</div>
      </div>

      {/* Rows */}
      <ul className="divide-y">
        {items.map((it) => (
          <li
            key={it.id}
            className="grid grid-cols-12 items-center px-4 py-3 hover:bg-gray-50"
          >
            <div className="col-span-2">
              {it.image ? (
                <div className="relative w-20 h-14 rounded-md overflow-hidden border">
                  <Image src={it.image} alt={it.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-20 h-14 rounded-md border flex items-center justify-center text-gray-400">
                  <FiImage />
                </div>
              )}
            </div>

            <div className="col-span-4">
              <div className="font-medium text-gray-800">{it.name}</div>
            </div>

            <div className="col-span-4 text-gray-600">{it.address}</div>

            <div className="col-span-1 text-center text-gray-700">{it.time}</div>

            <div className="col-span-1">
              <div className="flex items-center justify-center gap-3 text-[#7C3AED]">
                <button
                  onClick={() => alert(`Edit ${it.id}`)}
                  className="hover:text-[#5c23cf]"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => confirm("Delete?") && alert(`Delete ${it.id}`)}
                  className="hover:text-[#5c23cf]"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
