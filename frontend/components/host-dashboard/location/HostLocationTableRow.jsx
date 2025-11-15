// components/host-dashboard/location/HostLocationTableRow.jsx
import Link from "next/link";
import { FiEdit2, FiSend, FiExternalLink, FiMapPin } from "react-icons/fi";
import HostLocationStatusPill from "./HostLocationStatusPill";
import HostLocationImagePreview from "./HostLocationImagePreview";

export default function HostLocationTableRow({ 
  location, 
  onSubmit, 
  viewType = "table", 
  isSubmitting = false 
}) {
  
  // Normalize status from API: support publishStatus or status, case-insensitive, and synonyms
  const rawStatus = (location.publishStatus ?? location.status ?? "DRAFT");
  const upper = String(rawStatus).toUpperCase();
  const status = upper === "PENDING" ? "PENDING_REVIEW" : upper;
  const isActive = location.isActive ?? location.active;
  // Host สามารถแก้ไขได้เฉพาะ DRAFT หรือ REJECTED
  const canEdit = (status === "DRAFT" || status === "REJECTED");
  // Host สามารถส่งตรวจสอบได้เฉพาะ DRAFT หรือ REJECTED
  const canSubmit = (status === "DRAFT" || status === "REJECTED");

  // Card layout for mobile
  if (viewType === "card") {
    return (
      <div className={`p-4 transition-all duration-200 ${
        isSubmitting ? "opacity-50 pointer-events-none" : "hover:bg-gray-50"
      }`}>
        <div className="space-y-4">
          
          {/* Header: Image + Name + Status */}
          <div className="flex items-center sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <HostLocationImagePreview 
                  imageUrl={location.coverImageUrl} 
                  locationName={location.name}
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/host/locations/${location.id}`}
                  className="font-semibold text-violet-700 hover:text-violet-800 transition-colors text-sm block truncate"
                  title="View location details"
                >
                  {location.name}
                </Link>
                <div className="text-xs text-gray-500 mt-0.5 font-mono truncate">
                  ID: {location.id.substring(0, 8)}...
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <HostLocationStatusPill status={status} isActive={isActive} />
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700 leading-relaxed">{location.address}</span>
            </div>
          </div>
          
          {/* Reject Reason (ถ้ามี) */}
          {status === "REJECTED" && location.rejectReason && (
             <div className="bg-rose-50 border-l-4 border-rose-400 rounded-r-lg p-3">
               <label className="text-xs font-bold text-rose-700">Reason for Rejection:</label>
               <p className="text-sm text-rose-600 mt-1">{location.rejectReason}</p>
             </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
            <Link
              href={`/host/locations/${location.id}`}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-violet-50 border border-violet-200 px-3 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
            >
              <FiExternalLink className="w-4 h-4" />
              <span className="sm:hidden">View</span>
              <span className="hidden sm:inline">View Details</span>
            </Link>
            
            <div className="flex gap-2 sm:contents">
              {/* Edit Button (มีเงื่อนไข) */}
              {canEdit ? (
                <Link
                  href={`/host/locations/${location.id}/edit`}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                  title="Edit location"
                >
                  <FiEdit2 className="w-4 h-4" />
                  <span>Edit</span>
                </Link>
              ) : (
                 <button
                  disabled
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-400 cursor-not-allowed"
                  title="ไม่สามารถแก้ไขได้ (สถานะ APPROVED หรือ PENDING)"
                >
                  <FiEdit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}

              {/* Submit Button (มีเงื่อนไข) */}
              {canSubmit ? (
                <button
                  onClick={() => onSubmit(location.id, location.name)}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Submit for review"
                >
                  <FiSend className="w-4 h-4" />
                  <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
                </button>
              ) : (
                 <button
                  disabled
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-400 cursor-not-allowed"
                  title="ส่งตรวจสอบแล้ว"
                >
                  <FiSend className="w-4 h-4" />
                  <span>Submit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Table layout for desktop
  return (
    <tr className={`transition-all duration-200 ${
      isSubmitting ? "opacity-50 pointer-events-none" : "hover:bg-gray-50"
    }`}>
      
      {/* Image */}
      <td className="px-4 py-3 align-middle">
        <div className="flex justify-center sm:justify-start">
          <HostLocationImagePreview 
            imageUrl={location.coverImageUrl} 
            locationName={location.name}
          />
        </div>
      </td>

      {/* Location Name & ID */}
      <td className="px-4 py-3 align-middle">
        <div className="space-y-1">
          <Link
            href={`/host/locations/${location.id}`}
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
      <td className="px-4 py-3 align-middle">
        <div className="flex items-start gap-2">
          <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 text-sm max-w-xs truncate" title={location.address}>
            {location.address}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3 align-middle text-center">
        <HostLocationStatusPill status={status} isActive={isActive} />
        {status === "REJECTED" && location.rejectReason && (
            <div className="text-xs text-rose-600 mt-1 truncate" title={location.rejectReason}>
                Reason: {location.rejectReason}
            </div>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center justify-center gap-2">
          {/* Edit Button (มีเงื่อนไข) */}
          {canEdit ? (
            <Link
              href={`/host/locations/${location.id}/edit`}
              className="p-2 text-violet-600 hover:text-violet-800 hover:bg-violet-50 rounded-lg transition-colors"
              title="Edit location"
            >
              <FiEdit2 className="w-4 h-4" />
            </Link>
          ) : (
            <span className="p-2 text-gray-400 cursor-not-allowed" title="ไม่สามารถแก้ไขได้ (สถานะ APPROVED หรือ PENDING)">
              <FiEdit2 className="w-4 h-4" />
            </span>
          )}

          {/* Submit Button (มีเงื่อนไข) */}
          {canSubmit ? (
             <button
              onClick={() => onSubmit(location.id, location.name)}
              disabled={isSubmitting}
              className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Submit for review"
            >
              <FiSend className="w-4 h-4" />
            </button>
          ) : (
            <span className="p-2 text-gray-400 cursor-not-allowed" title="ส่งตรวจสอบแล้ว">
              <FiSend className="w-4 h-4" />
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}