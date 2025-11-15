"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getAdminHostLocations } from "@/services/adminReviewLocationsService";

function Label({children}){ return <div className="text-xs text-neutral-500">{children}</div>; }
function Value({children}){ return <div className="text-sm text-neutral-800 font-medium">{children ?? "-"}</div>; }

export default function ReviewLocationDetailModal({ open, item, onClose, onDecide, busy }){
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [reason, setReason] = useState("");

  useEffect(()=>{
    if (!open || !item?.ownerId) return;
    setLoading(true);
    getAdminHostLocations(item.ownerId)
      .then(res=>{
        if (res?.ok) setList(res.data||[]); else setList([]);
      })
      .catch(()=> setList([]))
      .finally(()=> setLoading(false));
  }, [open, item?.ownerId]);

  const location = useMemo(()=> list?.find(l => l?.id === item?.id), [list, item?.id]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={()=>!busy && onClose?.()} />
      <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white border border-neutral-200 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-800">รายละเอียดสถานที่</h3>
          <p className="mt-1 text-xs text-neutral-500">รหัส: {item?.id} • Host ID: {item?.ownerId}</p>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-auto">
          {loading ? (
            <div className="text-sm text-neutral-500">กำลังโหลดรายละเอียด…</div>
          ) : !location ? (
            <div className="text-sm text-neutral-500">ไม่พบรายละเอียดสถานที่จาก Host</div>
          ) : (
            <>
              {location?.coverImageUrl ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-neutral-200">
                  <Image src={location.coverImageUrl} alt={location.name || "Location cover"} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
                </div>
              ) : (
                <div className="w-full h-40 rounded-lg border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-sm">ไม่มีรูปภาพหน้าปก</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>ชื่อสถานที่</Label>
                  <Value>{location.name}</Value>
                </div>
                <div>
                  <Label>สถานะการใช้งาน</Label>
                  <Value>{location.isActive ? "Active" : "Inactive"}</Value>
                </div>
                <div className="md:col-span-2">
                  <Label>ที่อยู่</Label>
                  <Value>{location.address}</Value>
                </div>
                <div>
                  <Label>Latitude</Label>
                  <Value>{location.geoLat}</Value>
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Value>{location.geoLng}</Value>
                </div>
              </div>
              <div className="pt-2 border-t border-neutral-200">
                <Label>เหตุผล (กรณีปฏิเสธ - ไม่บังคับ)</Label>
                <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-neutral-300 focus:ring-2 focus:ring-neutral-800 focus:border-neutral-800 text-sm p-2.5" placeholder="ระบุเหตุผลการปฏิเสธ (ถ้ามี)" />
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
          <button onClick={()=>onClose?.()} disabled={busy} className={`px-4 py-2 rounded-md border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 ${busy?"opacity-60 cursor-not-allowed":""}`}>ปิด</button>
          <div className="flex items-center gap-2">
            <button onClick={()=>onDecide?.({ status: "APPROVED" })} disabled={busy || loading || !location} className={`px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white ${busy||loading||!location?"opacity-60 cursor-not-allowed":""}`}>{busy?"กำลังบันทึก...":"อนุมัติ"}</button>
            <button onClick={()=>onDecide?.({ status: "REJECTED", reason })} disabled={busy || loading || !location} className={`px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white ${busy||loading||!location?"opacity-60 cursor-not-allowed":""}`}>{busy?"กำลังบันทึก...":"ปฏิเสธ"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
