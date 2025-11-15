// components/admin-dashboard/locations/LocationStatusPill.jsx

/**
 * Status pill component for displaying location status (Active/Inactive)
 * @param {boolean} isActive - Whether location is active or not
 */
export default function LocationStatusPill({ isActive }) {
  if (isActive) {
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
        Active
      </span>
    );
  }

  return (
    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700 border border-rose-200">
      Inactive
    </span>
  );
}