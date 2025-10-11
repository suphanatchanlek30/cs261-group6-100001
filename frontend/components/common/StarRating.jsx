// components/common/StarRating.jsx
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export default function StarRating({ value = 0, max = 5, size = 20 }) {
  const rating = Math.max(0, Math.min(value, max));
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = max - full - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1" aria-label={`rating ${rating} out of ${max}`}>
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
