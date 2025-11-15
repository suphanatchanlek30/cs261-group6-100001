"use client";
import React from "react";

function StatusPill({ active }){
  const cls = active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700";
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${cls}`}>{active? "ACTIVE":"NOT ACTIVE"}</span>;
}

function RoleBadges({ roles=[] }){
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map(r=> (
        <span key={r} className="rounded-md bg-violet-100 text-violet-700 px-2 py-[2px] text-[11px] font-medium">{r}</span>
      ))}
    </div>
  );
}

function formatDate(d){
  if (!d) return "-";
  try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "-"; }
}

export default function UsersTable({ items = [], loading, busyId, onManage, onToggleActive }){
  return (
    <div className="rounded-xl bg-white/70 backdrop-blur border border-neutral-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto px-3 py-3 md:px-4 md:py-4">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 bg-neutral-50/70">
              <th className="px-6 py-3.5 text-neutral-700">User ID</th>
              <th className="px-6 py-3.5 text-neutral-700">Username</th>
              <th className="px-6 py-3.5 text-neutral-700">E-mail</th>
              <th className="px-6 py-3.5 text-neutral-700">Roles</th>
              <th className="px-6 py-3.5 text-neutral-700">Status</th>
              <th className="px-6 py-3.5 text-neutral-700">Last login</th>
              <th className="px-6 py-3.5 text-right text-neutral-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-neutral-500">กำลังโหลด...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-neutral-400">ไม่มีข้อมูลผู้ใช้</td></tr>
            ) : (
              items.map(u => (
                <tr key={u.id} className="hover:bg-neutral-50/60">
                  <td className="px-6 py-3.5 font-medium text-neutral-700">{(u.id)}</td>
                  <td className="px-6 py-3.5 text-neutral-800">{u.fullName || '-'}</td>
                  <td className="px-6 py-3.5"><span className="underline decoration-neutral-300">{u.email}</span></td>
                  <td className="px-6 py-3.5"><RoleBadges roles={u.roles} /></td>
                  <td className="px-6 py-3.5"><StatusPill active={u.active} /></td>
                  <td className="px-6 py-3.5">{formatDate(u.lastLoginAt)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      {u.active ? (
                        <button disabled={busyId===u.id} onClick={()=>onToggleActive?.(u,false)} className={`rounded-md bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 text-xs shadow-sm ${busyId===u.id?'opacity-60 cursor-not-allowed':''}`}>Suspend</button>
                      ) : (
                        <button disabled={busyId===u.id} onClick={()=>onToggleActive?.(u,true)} className={`rounded-md bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 text-xs shadow-sm ${busyId===u.id?'opacity-60 cursor-not-allowed':''}`}>Activate</button>
                      )}
                    </div>
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
