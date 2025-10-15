// components/admin-dashboard/payment/StatusPill.jsx

// Status color mapping for different payment statuses
const statusClasses = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700", 
  REJECTED: "bg-rose-100 text-rose-700",
};

/**
 * Status pill component for displaying payment status with colored background
 * @param {string} value - Payment status (PENDING|APPROVED|REJECTED)
 */
export default function StatusPill({ value }) {
  const cls = statusClasses[value] || "bg-gray-100 text-gray-700";
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cls}`}>
      {value}
    </span>
  );
}