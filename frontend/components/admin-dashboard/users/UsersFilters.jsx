"use client";
import { useEffect } from "react";

export default function UsersFilters({ value, onChange }){
  const v = value || {};
  useEffect(()=>{
    if (v.page == null || v.size == null){
      onChange?.({ q:"", role:"ALL", status:"ALL", page:0, size:10 });
    }
  },[]);
  function update(patch){ onChange?.({ ...v, ...patch, page: 0 }); }
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="col-span-2">
          <label className="text-xs text-neutral-600">ค้นหา</label>
          <input type="text" value={v.q || ""} onChange={e=>update({q:e.target.value})}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" placeholder="ชื่อ อีเมล เบอร์โทร" />
        </div>
        <div>
          <label className="text-xs text-neutral-600">บทบาท</label>
          <select value={v.role || "ALL"} onChange={e=>update({role:e.target.value})}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
            <option value="ALL">All</option>
            <option value="ADMIN">Admin</option>
            <option value="HOST">Host</option>
            <option value="USER">User</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-neutral-600">สถานะ</label>
          <select value={v.status || "ALL"} onChange={e=>update({status:e.target.value})}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Not Active</option>
          </select>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <label className="text-xs text-neutral-600">Page size</label>
        <select value={v.size || 10} onChange={e=>onChange?.({ ...v, size:Number(e.target.value), page:0 })}
          className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}