// components/admin-dashboard/payment/SlipPreview.jsx

import { FiImage, FiZoomIn } from "react-icons/fi";

/**
 * Minimal slip preview component with smooth interactions
 * @param {string} slipUrl - URL of the payment slip image
 * @param {function} onPreview - Callback when user clicks to preview
 */
export default function SlipPreview({ slipUrl, onPreview }) {
  if (!slipUrl) {
    return (
      <div className="flex items-center justify-center w-16 h-12 rounded-lg border border-dashed border-gray-200 bg-gray-50">
        <FiImage className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <button
      onClick={() => onPreview(slipUrl)}
      className="group relative block w-16 h-12 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
      title="คลิกเพื่อดูสลิปขนาดใหญ่"
    >
      {/* Main image */}
      <img
        src={slipUrl}
        alt="Payment slip"
        className="w-full h-full object-cover transition-all duration-200 group-hover:brightness-110"
        loading="lazy"
      />
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-white rounded-full p-1 shadow-lg">
            <FiZoomIn className="w-3 h-3 text-violet-600" />
          </div>
        </div>
      </div>
    </button>
  );
}