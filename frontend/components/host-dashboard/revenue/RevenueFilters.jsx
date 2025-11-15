"use client";
import { useState, useEffect } from "react";
import { getMyLocations } from "../../../services/hostlocationService";

// A minimal placeholder for location options; replace with actual service if exists.
// Expects parent to pass onChange with merged filter object.
export default function RevenueFilters({ value, onChange }) {
  const [locations, setLocations] = useState([]);
  const v = value || {};

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getMyLocations();
        if (mounted && res.ok) {
          const items = res.data?.items || [];
          setLocations(items.map(i => ({ id: i.id, name: i.name || `สถานที่ #${i.id}` })));
        }
      } catch (_) {}
    })();
    return () => { mounted = false; };
  }, []);

  function update(patch) {
    onChange?.({ ...v, ...patch });
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-white/70 backdrop-blur rounded-xl border border-neutral-200 shadow-sm">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex flex-col flex-1">
          <label className="text-xs font-medium text-neutral-600">จากวันที่</label>
          <input
            type="date"
            value={v.from || ""}
            onChange={(e) => update({ from: e.target.value })}
            className="mt-1 rounded-md border border-neutral-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
        <div className="flex flex-col flex-1">
          <label className="text-xs font-medium text-neutral-600">ถึงวันที่</label>
          <input
            type="date"
            value={v.to || ""}
            onChange={(e) => update({ to: e.target.value })}
            className="mt-1 rounded-md border border-neutral-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
        <div className="flex flex-col flex-1">
          <label className="text-xs font-medium text-neutral-600">วิธีชำระเงิน</label>
          <select
            value={v.method || ""}
            onChange={(e) => update({ method: e.target.value || undefined })}
            className="mt-1 rounded-md border border-neutral-300 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            <option value="">ทั้งหมด</option>
            <option value="QR">QR</option>
            <option value="CASH">เงินสด</option>
            <option value="TRANSFER">โอน</option>
          </select>
        </div>
        <div className="flex flex-col flex-1">
          <label className="text-xs font-medium text-neutral-600">สถานที่</label>
          <select
            value={v.locationId || ""}
            onChange={(e) => update({ locationId: e.target.value || undefined })}
            className="mt-1 rounded-md border border-neutral-300 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            <option value="">ทั้งหมด</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col w-full md:w-40">
          <label className="text-xs font-medium text-neutral-600">กลุ่ม</label>
          <div className="mt-1 flex rounded-md overflow-hidden border border-neutral-300 text-sm">
            <button
              type="button"
              onClick={() => update({ groupBy: "day" })}
              className={`flex-1 px-2 py-1 ${v.groupBy === "day" ? "bg-violet-500 text-white" : "bg-white"}`}
            >วัน</button>
            <button
              type="button"
              onClick={() => update({ groupBy: "week" })}
              className={`flex-1 px-2 py-1 ${v.groupBy === "week" ? "bg-violet-500 text-white" : "bg-white"}`}
            >สัปดาห์</button>
          </div>
        </div>
      </div>
    </div>
  );
}
