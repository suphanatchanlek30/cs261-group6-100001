"use client";
import React, { useState, useEffect } from "react";

export default function ConfirmSuspendModal({ open, user, makeActive, onCancel, onConfirm, busy }){
  const isSuspend = !makeActive;
  const [reason, setReason] = useState("");

  useEffect(()=>{
    if (open) setReason("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-neutral-200">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {isSuspend ? "ยืนยันการระงับผู้ใช้" : "ยืนยันการปลดระงับ"}
          </h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-gray-700">
            {isSuspend
              ? `คุณต้องการระงับผู้ใช้งาน ${user?.fullName || user?.email || "นี้"} หรือไม่?`
              : `คุณต้องการปลดระงับผู้ใช้งาน ${user?.fullName || user?.email || "นี้"} หรือไม่?`}
          </p>
          {isSuspend && (
            <div>
              <label className="text-xs text-neutral-600">เหตุผล (ระบุหรือไม่ก็ได้)</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e)=>setReason(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                placeholder="พิมพ์เหตุผล..."
              />
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-neutral-200 flex items-center justify-end gap-2 bg-neutral-50/50">
          <button onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" disabled={busy}>ยกเลิก</button>
          {isSuspend ? (
            <button onClick={()=>onConfirm?.(reason)} disabled={busy} className={`rounded-md px-4 py-2 text-sm text-white ${busy? 'opacity-60 cursor-not-allowed':''} bg-rose-500 hover:bg-rose-600`}>
              {busy? 'กำลังดำเนินการ...' : 'ระงับผู้ใช้'}
            </button>
          ) : (
            <button onClick={()=>onConfirm?.()} disabled={busy} className={`rounded-md px-4 py-2 text-sm text-white ${busy? 'opacity-60 cursor-not-allowed':''} bg-emerald-500 hover:bg-emerald-600`}>
              {busy? 'กำลังดำเนินการ...' : 'ปลดระงับ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
