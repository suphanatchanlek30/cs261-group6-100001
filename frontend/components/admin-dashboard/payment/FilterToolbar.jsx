// components/admin-dashboard/payment/FilterToolbar.jsx

import { FiSearch } from "react-icons/fi";

/**
 * Toolbar for filtering payments by status and configuring table settings
 * @param {string} status - Current selected status filter
 * @param {function} onStatusChange - Callback when status filter changes
 * @param {number} size - Current page size
 * @param {function} onSizeChange - Callback when page size changes
 */
export default function FilterToolbar({ status, onStatusChange, size, onSizeChange }) {
  // Available status filters
  const statusOptions = [
    { value: "", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" }
  ];

  return (
    <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
      
      {/* Status filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {statusOptions.map(({ value, label }) => {
          const isActive = status === value;
          return (
            <button
              key={value || "ALL"}
              onClick={() => onStatusChange(value)}
              className={`rounded-full border px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? "bg-violet-600 border-violet-600 text-white shadow-md"
                  : "bg-white border-violet-600 text-violet-700 hover:bg-violet-50 hover:shadow-sm"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Search and settings */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        
        {/* Search input (disabled for now) */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            disabled
            placeholder="Search payments..."
            className="w-full sm:min-w-[180px] pl-9 pr-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:outline-none"
          />
        </div>

        {/* Page size selector */}
        <select
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="w-full sm:w-auto rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          {[10, 20, 50, 100].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}/page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}