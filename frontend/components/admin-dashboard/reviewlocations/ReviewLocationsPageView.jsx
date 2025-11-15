"use client";
import React, { useEffect, useMemo, useState } from "react";
import ReviewLocationsFilters from "@/components/admin-dashboard/reviewlocations/ReviewLocationsFilters";
import ReviewLocationsTable from "@/components/admin-dashboard/reviewlocations/ReviewLocationsTable";
import ReviewLocationDetailModal from "@/components/admin-dashboard/reviewlocations/ReviewLocationDetailModal";
import { getAdminReviewLocations, decideAdminReviewLocation } from "@/services/adminReviewLocationsService";

export default function ReviewLocationsPageView(){
  const [filters, setFilters] = useState({ q:"", hostId:"", page:0, size:10 });

  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAdminReviewLocations({ q: filters.q, hostId: filters.hostId, page: filters.page, size: filters.size });
      if (res?.ok) {
        const d = res.data || {};
        // normalize into a page-like object
        const content = d.content || d.items || d.data || [];
        const totalPages = d.totalPages ?? d.total_pages ?? 1;
        const totalElements = d.totalElements ?? d.total_elements ?? content.length ?? 0;
        setData({ content, totalPages, totalElements });
      } else {
        setData({ content: [], totalPages: 0, totalElements: 0 });
      }
    } catch (e) {
      console.error(e);
      setData({ content: [], totalPages: 0, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters.q, filters.hostId, filters.page, filters.size]);

  const openView = (item) => { setSelected(item); setDetailOpen(true); };

  const onDecide = async ({ status, reason }) => {
    if (!selected) return;
    setBusyId(selected.id);
    try {
      const res = await decideAdminReviewLocation(selected.id, status, reason);
      if (res?.ok) {
        setDetailOpen(false);
        // optimistic remove from list
        setData(prev => ({ ...prev, content: prev.content.filter(x => x.id !== selected.id), totalElements: Math.max(0, (prev.totalElements||0)-1) }));
      } else {
        alert(res?.message || "อัปเดตผลการพิจารณาไม่สำเร็จ");
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = data?.totalPages || 0;
  const canPrev = (filters.page||0) > 0;
  const canNext = (filters.page||0) + 1 < totalPages;

  return (
    <div className="space-y-4">
      <ReviewLocationsFilters value={filters} onChange={setFilters} />

      <ReviewLocationsTable
        items={data?.content || []}
        loading={loading}
        busyId={busyId}
        onView={openView}
      />

      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600">หน้าที่ {filters.page+1} จาก {Math.max(1,totalPages)}</div>
        <div className="flex items-center gap-2">
          <button disabled={!canPrev} onClick={()=>setFilters(f=>({ ...f, page: Math.max(0, (f.page||0)-1) }))} className={`px-3 py-1.5 rounded-md border text-sm ${canPrev?"bg-white hover:bg-neutral-50 border-neutral-300":"bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed"}`}>ก่อนหน้า</button>
          <button disabled={!canNext} onClick={()=>setFilters(f=>({ ...f, page: (f.page||0)+1 }))} className={`px-3 py-1.5 rounded-md border text-sm ${canNext?"bg-white hover:bg-neutral-50 border-neutral-300":"bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed"}`}>ถัดไป</button>
        </div>
      </div>

      <ReviewLocationDetailModal
        open={detailOpen}
        item={selected}
        onClose={()=>setDetailOpen(false)}
        onDecide={onDecide}
        busy={!!busyId}
      />
    </div>
  );
}
