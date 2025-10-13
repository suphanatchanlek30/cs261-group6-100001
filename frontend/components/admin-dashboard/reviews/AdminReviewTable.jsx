// components/admin-dashboard/reviews/AdminReviewTable.jsx

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { getAdminReviews, deleteAdminReview } from "@/services/reviewService";
import ReviewTableRow from "./ReviewTableRow";

/**
 * ตารางจัดการรีวิวสำหรับ admin พร้อม responsive design
 * @param {number} pageSize - จำนวนรายการต่อหน้า (default: 10)
 */
export default function AdminReviewTable({ pageSize = 10 }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  // Delete handling
  const [deletingIds, setDeletingIds] = useState(new Set());

  // Fetch reviews data
  const fetchReviews = useCallback(async (page = 0) => {
    setLoading(true);
    setError("");

    const { ok, data, message } = await getAdminReviews(page, pageSize);
    
    if (!ok) {
      setError(message || "เกิดข้อผิดพลาดในการโหลดรีวิว");
      setReviews([]);
    } else {
      setReviews(data.items || []);
      setCurrentPage(data.page || 0);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.total || 0);
    }
    
    setLoading(false);
  }, [pageSize]);

  // Handle delete review with confirmation
  const handleDelete = async (reviewId, userName, locationName) => {
    if (!reviewId || deletingIds.has(reviewId)) return;

    const result = await Swal.fire({
      title: "ลบรีวิวนี้?",
      html: `คุณกำลังจะลบรีวิวของ <b>${userName}</b><br/>สำหรับสถานที่ <b>${locationName}</b><br/><br/><small class="text-gray-500">การดำเนินการนี้ไม่สามารถย้อนกลับได้</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    // Optimistic update: disable the review being deleted
    setDeletingIds(prev => new Set(prev).add(reviewId));

    const { ok, message } = await deleteAdminReview(reviewId);
    
    if (!ok) {
      // Remove from deleting set if failed
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
      
      return Swal.fire("ลบไม่สำเร็จ", message, "error");
    }

    // Remove from local state
    setReviews(prev => prev.filter(review => review.reviewId !== reviewId));
    setTotalItems(prev => Math.max(0, prev - 1));
    
    // Remove from deleting set
    setDeletingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(reviewId);
      return newSet;
    });

    // Show success message
    Swal.fire({
      icon: "success",
      title: "ลบรีวิวแล้ว",
      text: "รีวิวถูกลบออกจากระบบเรียบร้อยแล้ว",
      timer: 1500,
      showConfirmButton: false
    });

    // If current page is empty and not the first page, go to previous page
    if (reviews.length === 1 && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      fetchReviews(currentPage - 1);
    }
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchReviews(newPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchReviews(newPage);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchReviews(0);
  }, [fetchReviews]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                Location
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                Review Details
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                Rating
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                Comment
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-violet-200 border-t-violet-600"></div>
                    <span className="text-sm font-medium">Loading reviews...</span>
                    <span className="text-xs text-gray-400">Please wait a moment</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                      <span className="text-3xl">⚠️</span>
                    </div>
                    <div>
                      <p className="font-semibold text-red-700">Error Loading Reviews</p>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center">
                      <span className="text-4xl">💭</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">No Reviews Found</p>
                      <p className="text-sm text-gray-500">Reviews from users will appear here</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <ReviewTableRow
                  key={review.reviewId}
                  review={review}
                  onDelete={handleDelete}
                  viewType="table"
                  isDeleting={deletingIds.has(review.reviewId)}
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
              <span>Loading reviews...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
                <div>
                  <p className="text-red-800 font-semibold">Error Loading Reviews</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center shadow-sm">
                <span className="text-4xl">💭</span>
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-lg">No Reviews Found</p>
                <p className="text-sm text-gray-500 mt-1">Reviews from users will appear here when available</p>
              </div>
            </div>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewTableRow
              key={review.reviewId}
              review={review}
              onDelete={handleDelete}
              viewType="card"
              isDeleting={deletingIds.has(review.reviewId)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
          <div className="text-gray-600">
            Page <b>{currentPage + 1}</b> / {totalPages} • Total: {totalItems} reviews
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="px-3 py-1 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}