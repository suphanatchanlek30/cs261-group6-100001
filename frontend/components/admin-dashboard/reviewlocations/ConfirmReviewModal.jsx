"use client";
import React, { useState } from "react";

export default function ConfirmReviewModal({ open, mode, item, onClose, onConfirm, busy }){
  const [reason, setReason] = useState("");

  if (!open) return null;
  const isApprove = mode === "approve";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={() => !busy && onClose?.()} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white border border-neutral-200 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-800">
            {isApprove ? "ยืนยันการอนุมัติสถานที่" : "ยืนยันการปฏิเสธสถานที่"}
          </h3>
          <p className="mt-1 text-xs text-neutral-500">รหัส: {item?.id} — {item?.name}</p>
        </div>

        <div className="px-5 py-4">
          {!isApprove && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-neutral-700 mb-1">เหตุผล (ไม่บังคับ)</label>
              <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3} className="w-full rounded-md border border-neutral-300 focus:ring-2 focus:ring-neutral-800 focus:border-neutral-800 text-sm p-2.5" placeholder="ระบุเหตุผลการปฏิเสธ (ถ้ามี)" />
            </div>
          )}
          <div className="text-sm text-neutral-600">คุณแน่ใจหรือไม่ที่จะ {isApprove?"อนุมัติ":"ปฏิเสธ"} สถานที่นี้?</div>
        </div>

        <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50/60 flex items-center justify-end gap-2">
          <button onClick={()=>onClose?.()} disabled={busy} className={`px-4 py-2 rounded-md border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 ${busy?"opacity-60 cursor-not-allowed":""}`}>ยกเลิก</button>
          {isApprove ? (
            <button onClick={()=>onConfirm?.({ decision: "APPROVE" })} disabled={busy} className={`px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white ${busy?"opacity-60 cursor-not-allowed":""}`}>{busy?"กำลังยืนยัน...":"อนุมัติ"}</button>
          ) : (
            <button onClick={()=>onConfirm?.({ decision: "REJECT", reason })} disabled={busy} className={`px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white ${busy?"opacity-60 cursor-not-allowed":""}`}>{busy?"กำลังยืนยัน...":"ปฏิเสธ"}</button>
          )}
        </div>
      </div>
    </div>
  );
}
