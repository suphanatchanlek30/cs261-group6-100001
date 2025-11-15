// components/admin-dashboard/reviews/ReviewTableRow.jsx

import { FiTrash2, FiUser, FiMapPin, FiCalendar } from "react-icons/fi";
import ReviewStatusPill from "./ReviewStatusPill";

/**
 * Single row component for review table with responsive layout
 * @param {object} review - Review data object
 * @param {function} onDelete - Callback when delete button is clicked
 * @param {string} viewType - "table" or "card" layout
 * @param {boolean} isDeleting - Whether review is being deleted
 */
export default function ReviewTableRow({ review, onDelete, viewType = "table", isDeleting = false }) {
  
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

  // Card layout for mobile
  if (viewType === "card") {
    return (
      <div className={`p-4 transition-colors ${
        isDeleting ? "opacity-50 pointer-events-none" : "hover:bg-gray-50"
      }`}>
        <div className="space-y-4">
          
          {/* Header: Location Image + Rating + Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={review.locationCoverImageUrl}
                alt={review.locationName}
                className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-gray-200 shadow-sm"
              />
              <div>
                <div className="font-bold text-gray-900 text-sm sm:text-base">
                  {review.locationName}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </div>
              </div>
            </div>
            <ReviewStatusPill rating={review.rating} />
          </div>

          {/* Review Details */}
          <div className="space-y-2">
            {/* Reviewer */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Reviewer:</span>
              <span className="font-medium text-gray-900 text-sm">{review.userName}</span>
            </div>
            
            {/* Review ID */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Review ID:</span>
              <span className="font-medium text-gray-900 text-sm">{review.reviewId.substring(0, 8)}...</span>
            </div>
            
            {/* Booking ID */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Booking ID:</span>
              <span className="font-medium text-gray-900 text-sm">{review.bookingId.substring(0, 8)}...</span>
            </div>
            
            {/* User ID */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">User ID:</span>
              <span className="text-sm text-gray-700">{review.userId}</span>
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-medium text-gray-600 mb-2">Comment:</h4>
              <p className="text-sm text-gray-800 leading-relaxed">{review.comment}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => onDelete(review.reviewId, review.userName, review.locationName)}
              disabled={isDeleting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiTrash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete"}
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
      
      {/* Location Info */}
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-3">
          <img
            src={review.locationCoverImageUrl}
            alt={review.locationName}
            className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0 shadow-sm"
          />
          <div className="min-w-0">
            <div className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base truncate">
              {review.locationName}
            </div>
            <div className="text-xs text-gray-500">
              {review.locationId.substring(0, 8)}...
            </div>
          </div>
        </div>
      </td>

      {/* Review Details (User & IDs) */}
      <td className="px-4 py-3 align-top">
        <div className="space-y-1">
          {/* User Name */}
          <div className="font-semibold text-gray-900 text-sm">{review.userName}</div>
          
          {/* Review ID */}
          <div className="text-sm">
            <span className="text-gray-500">Review:</span> <span className="font-medium text-gray-800">{review.reviewId.substring(0, 8)}...</span>
          </div>
          
          {/* Booking ID */}
          <div className="text-sm">
            <span className="text-gray-500">Booking:</span> <span className="font-medium text-gray-800">{review.bookingId.substring(0, 8)}...</span>
          </div>
          
          {/* User ID */}
          <div className="text-xs text-gray-500">
            User ID: {review.userId}
          </div>
        </div>
      </td>

      {/* Rating */}
      <td className="px-4 py-3 align-center">
        <ReviewStatusPill rating={review.rating} />
      </td>

      {/* Comment */}
      <td className="px-4 py-3 align-center">
        <div className="max-w-xs">
          {review.comment ? (
            <p className="text-sm text-gray-700 line-clamp-3" title={review.comment}>
              {review.comment}
            </p>
          ) : (
            <span className="text-xs text-gray-400 italic">No comment</span>
          )}
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3 align-center">
        <div className="text-gray-700 text-sm">
          {formatDate(review.createdAt)}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 align-center">
        <button
          onClick={() => onDelete(review.reviewId, review.userName, review.locationName)}
          disabled={isDeleting}
          className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-3 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete review"
        >
          <FiTrash2 className="w-4 h-4" />
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </td>
    </tr>
  );
}