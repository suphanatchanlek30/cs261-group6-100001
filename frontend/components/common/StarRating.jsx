// components/common/StarRating.jsx
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

/**
 * StarRating
 * - By default supports half-stars based on value's fractional part.
 * - When roundToInt=true, the number of filled stars will be Math.round(value)
 *   and no half-star will be rendered (matches "4.5 => 5 stars", "4.4 => 4 stars").
 */
export default function StarRating({ value = 0, max = 5, size = 20, roundToInt = false }) {
  const clamped = Math.max(0, Math.min(Number(value) || 0, max));
  let full = 0;
  let hasHalf = false;

  if (roundToInt) {
    full = Math.round(clamped);
    hasHalf = false;
  } else {
    full = Math.floor(clamped);
    hasHalf = clamped - full >= 0.5;
  }

  const empty = Math.max(0, max - full - (hasHalf ? 1 : 0));

  return (
    <div className="flex items-center gap-1" aria-label={`rating ${clamped} out of ${max}`}>
      {Array.from({ length: full }).map((_, i) => (
        <FaStar key={`full-${i}`} className="text-amber-400" size={size} />
      ))}
      {hasHalf && <FaStarHalfAlt className="text-amber-400" size={size} />}
      {Array.from({ length: empty }).map((_, i) => (
        <FaRegStar key={`empty-${i}`} className="text-gray-300" size={size} />
      ))}
    </div>
  );
}
