// components/admin-dashboard/locations/LocationTableRow.jsx

import Link from "next/link";
import { FiEdit2, FiTrash2, FiExternalLink, FiMapPin } from "react-icons/fi";
import LocationStatusPill from "./LocationStatusPill";
import LocationImagePreview from "./LocationImagePreview";

/**
 * Single row component for location table with responsive layout
 * @param {object} location - Location data object
 * @param {function} onDelete - Callback when delete button is clicked
 * @param {string} viewType - "table" or "card" layout
 * @param {boolean} isDeleting - Whether location is being deleted
 */
export default function LocationTableRow({ location, onDelete, viewType = "table", isDeleting = false }) {
  
  const isActive = location.isActive ?? location.active;

  // Card layout for mobile
  if (viewType === "card") {
    return (
      <div className={`p-4 transition-all duration-200 ${
        isDeleting ? "opacity-50 pointer-events-none" : "hover:bg-gray-50"
      }`}>
        <div className="space-y-4">
          
          {/* Header: Image + Name + Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LocationImagePreview 
                imageUrl={location.coverImageUrl} 
                locationName={location.name}
              />
              <div className="flex-1">
                <Link
                  href={`/admin/locations/${location.id}`}
                  className="font-semibold text-violet-700 hover:text-violet-800 transition-colors text-sm block"
                  title="View location details"
                >
                  {location.name}
                </Link>
                <div className="text-xs text-gray-500 mt-0.5 font-mono">
                  ID: {location.id.substring(0, 8)}...
                </div>
              </div>
            </div>
            <LocationStatusPill isActive={isActive} />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm text-gray-700">{location.address}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <Link
              href={`/admin/locations/${location.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-violet-50 border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
            >
              <FiExternalLink className="w-4 h-4" />
              View Details
            </Link>
            <Link
              href={`/admin/locations/${location.id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
              title="Edit location"
            >
              <FiEdit2 className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={() => onDelete(location.id, location.name)}
              disabled={isDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Delete location"
            >
              <FiTrash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Table layout for desktop
  return (
    <tr className={`transition-all duration-200 ${
      isDeleting ? "opacity-50 pointer-events-none" : "hover:bg-gray-50"
    }`}>
      
      {/* Image */}
      <td className="px-4 py-3 align-center">
        <div className="flex justify-center sm:justify-start">
          <LocationImagePreview 
            imageUrl={location.coverImageUrl} 
            locationName={location.name}
          />
        </div>
      </td>

      {/* Location Name & ID */}
      <td className="px-4 py-3 align-center">
        <div className="space-y-1">
          <Link
            href={`/admin/locations/${location.id}`}
            className="font-semibold text-violet-700 hover:text-violet-800 transition-colors underline"
            title="View location details"
          >
            {location.name}
          </Link>
          <div className="text-xs text-gray-500 font-mono">
            ID: {location.id}
          </div>
        </div>
      </td>

      {/* Address */}
      <td className="px-4 py-3 align-center">
        <div className="flex items-start gap-2">
          <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 text-sm">{location.address}</span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3 align-center text-center">
        <LocationStatusPill isActive={isActive} />
      </td>

      {/* Actions */}
      <td className="px-4 py-3 align-center">
        <div className="flex items-center justify-center gap-2">
          <Link
            href={`/admin/locations/${location.id}/edit`}
            className="p-2 text-violet-600 hover:text-violet-800 hover:bg-violet-50 rounded-lg transition-colors"
            title="Edit location"
          >
            <FiEdit2 className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(location.id, location.name)}
            disabled={isDeleting}
            className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Delete location"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}