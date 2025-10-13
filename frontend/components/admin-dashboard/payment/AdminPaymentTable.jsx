// components/admin-dashboard/payment/AdminPaymentTable.jsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { getAdminPayments, updateAdminPaymentStatus } from "@/services/adminService";
import FilterToolbar from "./FilterToolbar";
import PaymentTableRow from "./PaymentTableRow";
import SlipModal from "./SlipModal";
import Pagination from "@/components/common/Pagination";

/**
 * Main admin payment table component for managing payment approvals
 * Features: Filter by status, view slip images, approve/reject payments
 */
export default function AdminPaymentTable() {
  // Filter and pagination state
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Data loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);

  // Modal state for slip preview
  const [selectedSlip, setSelectedSlip] = useState("");
  
  // Calculate total pages
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);

  // Load payments data from API
  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    
    const { ok, data, message } = await getAdminPayments({ 
      status: status || undefined, 
      page, 
      size 
    });
    
    if (!ok) {
      setError(message || "ไม่สามารถโหลดข้อมูลการชำระเงินได้");
      setLoading(false);
      return;
    }
    
    setPayments(Array.isArray(data.items) ? data.items : []);
    setTotal(typeof data.total === "number" ? data.total : 0);
    setLoading(false);
  }, [status, page, size]);

  // Load data when dependencies change
  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Handle payment approval
  const handleApprove = async (payment) => {
    const result = await Swal.fire({
      icon: "question",
      title: "อนุมัติการชำระเงิน?",
      text: `Payment: ${payment.paymentId} • จำนวน: ฿${payment.amount?.toFixed?.(2) ?? payment.amount}`,
      showCancelButton: true,
      confirmButtonText: "อนุมัติ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#10B981",
    });
    
    if (!result.isConfirmed) return;

    const { ok, message } = await updateAdminPaymentStatus(payment.paymentId, "APPROVE");
    
    if (!ok) {
      return void Swal.fire("ไม่สำเร็จ", message || "เกิดข้อผิดพลาดในการอนุมัติ", "error");
    }
    
    await Swal.fire("สำเร็จ", "อนุมัติการชำระเงินเรียบร้อยแล้ว", "success");
    loadPayments(); // Reload data
  };

  // Handle payment rejection
  const handleReject = async (payment) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ปฏิเสธการชำระเงิน?",
      input: "text",
      inputPlaceholder: "เหตุผลในการปฏิเสธ (ไม่จำเป็น)",
      showCancelButton: true,
      confirmButtonText: "ปฏิเสธ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#EF4444",
    });
    
    if (!result.isConfirmed) return;

    const reason = result.value || undefined;
    const { ok, message } = await updateAdminPaymentStatus(payment.paymentId, "REJECT", reason);
    
    if (!ok) {
      return void Swal.fire("ไม่สำเร็จ", message || "เกิดข้อผิดพลาดในการปฏิเสธ", "error");
    }
    
    await Swal.fire("สำเร็จ", "ปฏิเสธการชำระเงินเรียบร้อยแล้ว", "success");
    loadPayments(); // Reload data
  };

  // Handle filter changes
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(0); // Reset to first page
  };

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setPage(0); // Reset to first page
  };

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <FilterToolbar
        status={status}
        onStatusChange={handleStatusChange}
        size={size}
        onSizeChange={handleSizeChange}
      />

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
          <thead className="border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Slip</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Payment Details</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Created Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <PaymentTableRow
                  key={payment.paymentId}
                  payment={payment}
                  onSlipPreview={setSelectedSlip}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && !error && total > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm bg-white rounded-b-2xl">
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

      {/* Slip Preview Modal */}
      <SlipModal
        imageUrl={selectedSlip}
        isOpen={!!selectedSlip}
        onClose={() => setSelectedSlip("")}
      />
    </div>
  );
}
