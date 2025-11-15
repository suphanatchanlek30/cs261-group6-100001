// components/common/RatingWithCount.jsx
"use client";

import StarRating from "./StarRating";

/**
 * RatingWithCount
 * - Shows 0..5 stars using rounding-to-int rule (4.5 -> 5, 4.4 -> 4)
 * - Always renders stars and a review count label
 * - Pass className to control wrapper styles
 */
export default function RatingWithCount({
  rating = 0,
  count = 0,
  size = 14,
  className = "",
  labelClassName = "text-gray-500",
}) {
  const safeRating = Number.isFinite(Number(rating)) ? Number(rating) : 0;
  const safeCount = typeof count === "number" && count >= 0 ? count : 0;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <StarRating value={safeRating} size={size} roundToInt />
      <span className={`${labelClassName} text-xs`}>({safeCount} reviews)</span>
    </div>
  );
}
