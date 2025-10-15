// components/admin-dashboard/locations/LocationImagePreview.jsx

import { FiImage } from "react-icons/fi";

/**
 * Location image preview component with responsive sizing
 * @param {string} imageUrl - URL of the location cover image
 * @param {string} locationName - Name of the location for alt text
 */
export default function LocationImagePreview({ imageUrl, locationName }) {
  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center w-16 h-12 sm:w-20 sm:h-14 lg:w-24 lg:h-16 rounded-lg border border-dashed border-gray-200 bg-gray-50">
        <FiImage className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative w-16 h-12 sm:w-20 sm:h-14 lg:w-24 lg:h-16 rounded-lg overflow-hidden shadow-sm border border-gray-200 group">
      <img 
        src={imageUrl} 
        alt={locationName || "Location"} 
        className="w-full h-full object-cover transition-all duration-200 group-hover:scale-105" 
        loading="lazy"
      />
      {/* Subtle overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200"></div>
    </div>
  );
}