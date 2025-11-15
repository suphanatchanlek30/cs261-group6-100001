"use client";
import React from "react";

function formatDateTime(s){
  if (!s) return "-";
  try {
    const d = new Date(s);
    return d.toLocaleDateString("en-GB") + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return "-"; }
}

export default function ReviewLocationsTable({ items = [], loading, busyId, onView }){
  return (
    <div className="rounded-xl bg-white/70 backdrop-blur border border-neutral-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto px-3 py-3 md:px-4 md:py-4">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 bg-neutral-50/70">
              <th className="px-6 py-3.5 text-neutral-700">Location ID</th>
              <th className="px-6 py-3.5 text-neutral-700">Name</th>
              <th className="px-6 py-3.5 text-neutral-700">Owner ID</th>
              <th className="px-6 py-3.5 text-neutral-700">Submitted</th>
              <th className="px-6 py-3.5 text-right text-neutral-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-neutral-500">กำลังโหลด...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-neutral-400">ไม่มีรายการรอตรวจสอบ</td></tr>
            ) : (
              items.map(it => (
                <tr key={it.id} className="hover:bg-neutral-50/60">
                  <td className="px-6 py-3.5 font-medium text-neutral-700 truncate max-w-[220px]">{it.id}</td>
                  <td className="px-6 py-3.5 text-neutral-800">{it.name}</td>
                  <td className="px-6 py-3.5">{it.ownerId}</td>
                  <td className="px-6 py-3.5">{formatDateTime(it.submittedAt)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <button disabled={busyId===it.id} onClick={()=>onView?.(it)} className={`inline-flex items-center gap-2 rounded-md bg-neutral-500 hover:bg-neutral-700 text-white px-3 py-1.5 text-xs shadow-sm ${busyId===it.id?'opacity-60 cursor-not-allowed':''}`}>
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
