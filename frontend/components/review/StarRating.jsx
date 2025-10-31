// components/review/StarRating.jsx
"use client";
import { useState } from "react";
import { MdStar, MdStarBorder } from "react-icons/md";

export default function StarRating({ value = 0, onChange, size = 28 }) {
  const [hover, setHover] = useState(0);
  const v = hover || value;

  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange?.(n)}
          aria-label={`${n} stars`}
          className="text-amber-400"
          title={`${n}`}
        >
          {v >= n ? <MdStar size={size}/> : <MdStarBorder size={size}/>}
        </button>
      ))}
    </div>
  );
}
