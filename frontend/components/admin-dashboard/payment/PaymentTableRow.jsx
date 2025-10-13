// components/admin-dashboard/payment/PaymentTableRow.jsx

import { FiCheckCircle, FiXCircle, FiCopy } from "react-icons/fi";
import StatusPill from "./StatusPill";
import SlipPreview from "./SlipPreview";

/**
 * Single row component for payment table with all payment details and actions
 * @param {object} payment - Payment data object
 * @param {function} onSlipPreview - Callback when slip preview is clicked
 * @param {function} onApprove - Callback when approve button is clicked
 * @param {function} onReject - Callback when reject button is clicked
 */
export default function PaymentTableRow({ payment, onSlipPreview, onApprove, onReject }) {
  
  // Copy text to clipboard with feedback
  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(String(text));
    // You could add toast notification here if needed
  };

  // Format date to Thai locale
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("th-TH", {
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Format amount display
  const formatAmount = (amount) => {
    if (typeof amount === "number") {
      return amount.toFixed(2);
    }
    return amount || "0.00";
  };

  return (
    <tr className="border-t hover:bg-gray-50 transition-colors">
      
      {/* Slip Preview */}
      <td className="px-4 py-3 align-top">
        <SlipPreview 
          slipUrl={payment.proofUrl} 
          onPreview={onSlipPreview}
        />
      </td>

      {/* Payment & Booking Info */}
      <td className="px-4 py-3 align-top">
        <div className="space-y-1">
          {/* Payment ID */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">{payment.paymentId}</span>
            <button 
              className="text-gray-400 hover:text-violet-600 transition-colors" 
              onClick={() => copyToClipboard(payment.paymentId)}
              title="คัดลอก Payment ID"
            >
              <FiCopy className="w-3 h-3" />
            </button>
          </div>
          
          {/* Booking ID */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Booking:</span>
            <span className="font-medium text-gray-800">{payment.bookingId}</span>
            <button 
              className="text-gray-400 hover:text-violet-600 transition-colors" 
              onClick={() => copyToClipboard(payment.bookingId)}
              title="คัดลอก Booking ID"
            >
              <FiCopy className="w-3 h-3" />
            </button>
          </div>
          
          {/* Payment Method */}
          <div className="text-xs text-gray-500">
            Method: {payment.method || "ไม่ระบุ"}
          </div>
        </div>
      </td>

      {/* Amount */}
      <td className="px-4 py-3 align-top">
        <div className="font-bold text-violet-700 text-lg">
          ฿{formatAmount(payment.amount)}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3 align-top">
        <StatusPill value={payment.status} />
      </td>

      {/* Created Date */}
      <td className="px-4 py-3 align-top">
        <div className="text-gray-700 text-sm">
          {formatDate(payment.createdAt)}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 align-top">
        {payment.status === "PENDING" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onApprove(payment)}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1 text-sm font-semibold text-emerald-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors"
              title="อนุมัติ"
            >
              <FiCheckCircle className="w-4 h-4" />
              อนุมัติ
            </button>
            <button
              onClick={() => onReject(payment)}
              className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-3 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors"
              title="ปฏิเสธ"
            >
              <FiXCircle className="w-4 h-4" />
              ปฏิเสธ
            </button>
          </div>
        ) : (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
            Complete
          </span>
        )}
      </td>
    </tr>
  );
}