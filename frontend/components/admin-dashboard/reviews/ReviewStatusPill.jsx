// components/admin-dashboard/reviews/ReviewStatusPill.jsx

/**
 * แสดงคะแนนรีวิวในรูปแบบ pill พร้อมสีที่สื่อความหมาย
 * @param {number} rating - คะแนนรีวิว (1-5)
 */
export default function ReviewStatusPill({ rating }) {
  // แสดงดาวตามคะแนน
  const renderStars = (score) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-base ${i < score ? "text-yellow-400" : "text-gray-300"}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {renderStars(rating)}
      </div>
      <span className="text-sm font-medium text-gray-700">{rating}/5</span>
    </div>
  );
}