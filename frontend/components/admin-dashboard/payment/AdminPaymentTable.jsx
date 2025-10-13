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
      title: "Approve Payment?",
      html: `
        <div class="text-left space-y-2">
          <p><strong>Payment ID:</strong> ${payment.paymentId}</p>
          <p><strong>Booking ID:</strong> ${payment.bookingId}</p>
          <p><strong>Amount:</strong> <span class="text-emerald-600 font-bold">฿${payment.amount?.toFixed?.(2) ?? payment.amount}</span></p>
          <p><strong>Method:</strong> ${payment.method || 'Not specified'}</p>
        </div>
        <div class="mt-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded">
          <p class="text-sm text-emerald-700">
            <i class="fas fa-info-circle mr-1"></i>
            After approval, the booking will be confirmed and a booking code will be generated.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-check mr-2"></i>Approve',
      cancelButtonText: '<i class="fas fa-times mr-2"></i>Cancel',
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
      focusCancel: true,
    });
    
    if (!result.isConfirmed) return;

    // แสดง loading
    Swal.fire({
      title: "Processing...",
      text: "Approving payment...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const { ok, message, data } = await updateAdminPaymentStatus(payment.paymentId, "APPROVE");
    
    if (!ok) {
      return void Swal.fire({
        icon: "error",
        title: "Approval Failed",
        text: message || "เกิดข้อผิดพลาดในการอนุมัติ",
        confirmButtonColor: "#EF4444"
      });
    }
    
    // แสดงผลลัพธ์สำเร็จพร้อมข้อมูลจาก API
    await Swal.fire({
      icon: "success",
      title: "Payment Approved!",
      html: `
        <div class="text-left space-y-2">
          <p><strong>Payment Status:</strong> <span class="text-emerald-600">${data?.paymentStatus || 'APPROVED'}</span></p>
          <p><strong>Booking Status:</strong> <span class="text-blue-600">${data?.bookingStatus || 'CONFIRMED'}</span></p>
          ${data?.bookingCode ? `<p><strong>Booking Code:</strong> <span class="font-mono bg-gray-100 px-2 py-1 rounded">${data.bookingCode}</span></p>` : ''}
        </div>
      `,
      confirmButtonColor: "#10B981",
      timer: 3000,
      timerProgressBar: true
    });
    
    loadPayments(); // Reload data
  };

  // Handle payment rejection
  const handleReject = async (payment) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Reject Payment?",
      html: `
        <div class="text-left space-y-2 mb-4">
          <p><strong>Payment ID:</strong> ${payment.paymentId}</p>
          <p><strong>Booking ID:</strong> ${payment.bookingId}</p>
          <p><strong>Amount:</strong> <span class="text-rose-600 font-bold">฿${payment.amount?.toFixed?.(2) ?? payment.amount}</span></p>
          <p><strong>Method:</strong> ${payment.method || 'Not specified'}</p>
        </div>
        <div class="p-3 bg-rose-50 border-l-4 border-rose-500 rounded">
          <p class="text-sm text-rose-700">
            <i class="fas fa-exclamation-triangle mr-1"></i>
            After rejection, the booking will be put on hold. The customer will need to resubmit a new payment slip.
          </p>
        </div>
      `,
      input: "textarea",
      inputLabel: "Reason for rejection (optional)",
      inputPlaceholder: "เช่น: สลิปไม่ชัดเจน, จำนวนเงินไม่ตรง, สลิปปลอม...",
      inputAttributes: {
        maxlength: 500,
        rows: 3
      },
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-times mr-2"></i>Reject',
      cancelButtonText: '<i class="fas fa-arrow-left mr-2"></i>Cancel',
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
      focusCancel: true,
      preConfirm: (value) => {
        // ไม่บังคับให้ใส่เหตุผล แต่ถ้าใส่ต้องไม่เป็นช่องว่าง
        if (value && value.trim().length === 0) {
          Swal.showValidationMessage('Please provide a valid reason or leave it empty');
          return false;
        }
        return value?.trim() || undefined;
      }
    });
    
    if (!result.isConfirmed) return;

    // แสดง loading
    Swal.fire({
      title: "Processing...",
      text: "Rejecting payment...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const reason = result.value;
    const { ok, message, data } = await updateAdminPaymentStatus(payment.paymentId, "REJECT", reason);
    
    if (!ok) {
      return void Swal.fire({
        icon: "error", 
        title: "Rejection Failed",
        text: message || "เกิดข้อผิดพลาดในการปฏิเสธ",
        confirmButtonColor: "#EF4444"
      });
    }
    
    // แสดงผลลัพธ์สำเร็จ
    await Swal.fire({
      icon: "success",
      title: "Payment Rejected",
      html: `
        <div class="text-left space-y-2">
          <p><strong>Payment Status:</strong> <span class="text-rose-600">${data?.paymentStatus || 'REJECTED'}</span></p>
          <p><strong>Booking Status:</strong> <span class="text-amber-600">${data?.bookingStatus || 'HOLD'}</span></p>
          ${reason ? `<p><strong>Rejection Reason:</strong> <em class="text-gray-600">"${reason}"</em></p>` : ''}
        </div>
        <div class="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
          The customer will be notified and can resubmit a new payment slip.
        </div>
      `,
      confirmButtonColor: "#10B981",
      timer: 4000,
      timerProgressBar: true
    });
    
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
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200">
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
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-200 border-t-violet-600"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-red-600">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">⚠️</span>
                      <span>{error}</span>
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      {/* <span className="text-2xl">📄</span> */}
                      <span>No payments found</span>
                    </div>
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
            <div className="p-6 text-center text-gray-500">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-200 border-t-violet-600"></div>
                <span>Loading payments...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <span className="text-red-700 font-medium">Error</span>
                  <span className="text-red-600 text-sm">{error}</span>
                </div>
              </div>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">📄</span>
                </div>
                <div>
                  <p className="font-medium">No payments found</p>
                  <p className="text-sm text-gray-400">Try changing the filter or check back later</p>
                </div>
              </div>
            </div>
          ) : (
            payments.map((payment) => (
              <PaymentTableRow
                key={payment.paymentId}
                payment={payment}
                onSlipPreview={setSelectedSlip}
                onApprove={handleApprove}
                onReject={handleReject}
                viewType="card"
              />
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && !error && total > 0 && totalPages > 1 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 gap-3 text-sm">
            <div className="text-gray-600 text-center sm:text-left">
              Page <b>{page + 1}</b> of {totalPages} • {total} total payments
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Next
              </button>
            </div>
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
