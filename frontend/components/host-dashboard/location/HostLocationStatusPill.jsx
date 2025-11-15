// components/host-dashboard/location/HostLocationStatusPill.jsx

/**
 * Status pill component for displaying location publish status
 * @param {string} status - DRAFT | PENDING_REVIEW | APPROVED | REJECTED
 * @param {boolean} isActive - Whether location is active (only relevant if APPROVED)
 */
export default function HostLocationStatusPill({ status, isActive }) {
  // Normalize input status (case-insensitive and synonyms)
  const upper = String(status || "DRAFT").toUpperCase();
  const norm = upper === "PENDING" ? "PENDING_REVIEW" : upper;

  // 1. Publish Status
  let statusText = norm;
  let statusClass = "bg-gray-100 text-gray-700 border-gray-200";

  switch (norm) {
    case "DRAFT":
      statusText = "Draft";
      statusClass = "bg-gray-100 text-gray-700 border-gray-200";
      break;
    case "PENDING_REVIEW":
      statusText = "Pending";
      statusClass = "bg-blue-100 text-blue-700 border-blue-200";
      break;
    case "APPROVED":
      statusText = "Approved";
      statusClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
      break;
    case "REJECTED":
      statusText = "Rejected";
      statusClass = "bg-rose-100 text-rose-700 border-rose-200";
      break;
  }
  
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${statusClass}`}>
        {statusText}
      </span>
      {/* แสดงเฉพาะกรณี Approved และชัดเจนว่า Inactive เท่านั้น */}
      {norm === "APPROVED" && isActive === false && (
         <span className="text-xs font-medium text-rose-700">(Inactive)</span>
      )}
    </div>
  );
}