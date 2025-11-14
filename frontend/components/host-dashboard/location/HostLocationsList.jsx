// components/host-dashboard/location/HostLocationsList.jsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { getMyLocations, submitForReview } from "@/services/hostlocationService";
import HostLocationTableRow from "./HostLocationTableRow";
import HostPageHeader from "@/components/host-dashboard/HostPageHeader"; // ใช้ Header ของ Host

export default function HostLocationsList() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [keyword, setKeyword] = useState("");
  const [submittingIds, setSubmittingIds] = useState(new Set());
  const [status, setStatus] = useState(""); // ตัวกรองสถานะตามสเปค
  
  const pageSize = 20; // กำหนดค่าคงที่ไปเลย
  const q = useMemo(() => keyword?.trim() || undefined, [keyword]);

  // ฟังก์ชันโหลดข้อมูล
  const loadLocations = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      // ใช้ getMyLocations ของ Host พร้อมตัวกรองสถานะตามสเปค
      const params = { q, page, size: pageSize };
      if (status && status !== "ALL") params.status = status;
      const { ok, data, message } = await getMyLocations(params);
      if (!ok) throw new Error(message);
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      setErr(e.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [q, page, pageSize, status]);

  // โหลดข้อมูลเมื่อ q หรือ page เปลี่ยน
  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  // Handler: เมื่อกดปุ่ม Add
  const handleAdd = () => router.push("/host/locations/new");

  // Handler: เมื่อกดปุ่ม Submit for Review (จากแถว)
  const handleSubmitReview = async (id, name) => {
    if (submittingIds.has(id)) return;

    const result = await Swal.fire({
      title: "Submit for Review?",
      html: `คุณกำลังจะส่ง <b>${name || id}</b> ให้แอดมินตรวจสอบ`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ส่งตรวจสอบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#7C3AED",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    setSubmittingIds(new Set(submittingIds).add(id));

    try {
      const { ok, message } = await submitForReview(id);
      if (!ok) throw new Error(String(message || "ส่งตรวจสอบไม่สำเร็จ"));

      Swal.fire({
        icon: "success",
        title: "ส่งสำเร็จ",
        text: "ส่งสถานที่ให้แอดมินตรวจสอบแล้ว",
        timer: 2000,
        showConfirmButton: false,
      });
      // โหลดข้อมูลใหม่เพื่ออัปเดตสถานะ
      loadLocations(); 
    } catch (e) {
      Swal.fire("ผิดพลาด", e.message, "error");
    } finally {
      setSubmittingIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  return (
    <>
      <HostPageHeader
        title="Manage Your Locations"
        placeholder="Search by name..."
        onSearch={setKeyword}
        onAdd={handleAdd}
      />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-4 py-3 border-b border-gray-200">
          <div className="text-sm text-gray-700 font-medium">Filters</div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Status:</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Image</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Location Details</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Address</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-800">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">Loading...</td>
                </tr>
              ) : err ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-red-600">{err}</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">No locations found.</td>
                </tr>
              ) : (
                items.map((location) => (
                  <HostLocationTableRow
                    key={location.id}
                    location={location}
                    onSubmit={handleSubmitReview} // ส่งฟังก์ชัน Submit ไป
                    isSubmitting={submittingIds.has(location.id)}
                    viewType="table"
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : err ? (
            <div className="p-6 text-center text-red-600">{err}</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No locations found.</div>
          ) : (
            items.map((location) => (
               <HostLocationTableRow
                key={location.id}
                location={location}
                onSubmit={handleSubmitReview}
                isSubmitting={submittingIds.has(location.id)}
                viewType="card"
              />
            ))
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
            <div className="text-gray-600">
              Page <b>{page + 1}</b> / {totalPages} • Total: {total}
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
    </>
  );
}