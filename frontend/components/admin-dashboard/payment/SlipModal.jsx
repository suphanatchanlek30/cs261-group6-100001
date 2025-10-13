// components/admin-dashboard/payment/SlipModal.jsx

import { useEffect } from "react";
import { FiX, FiDownload } from "react-icons/fi";

/**
 * Minimal and smooth modal for viewing payment slip images
 * @param {string} imageUrl - URL of the slip image to display
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Callback to close modal
 */
export default function SlipModal({ imageUrl, isOpen, onClose }) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  // Handle backdrop click to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle download
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'payment-slip.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300"
      onClick={handleBackdropClick}
      style={{
        backdropFilter: 'blur(8px)',
        background: 'rgba(0, 0, 0, 0.6)'
      }}
    >
      {/* Modal container with smooth entrance */}
      <div className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-90 duration-300 ease-out">
        
        {/* Minimal header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/20 to-transparent">
          <div className="text-white/90 text-sm font-medium">
            Payment Slip
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm"
              title="Download"
            >
              <FiDownload className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm"
              title="Close"
            >
              <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Image content - full focus */}
        <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-white min-h-[300px] sm:min-h-[400px] max-h-[75vh] sm:max-h-[80vh] p-4">
          <img
            src={imageUrl}
            alt="Payment slip"
            className="max-w-full max-h-full object-contain rounded-lg sm:rounded-2xl shadow-lg animate-in zoom-in-95 duration-500 ease-out"
            style={{ 
              maxHeight: '75vh',
              filter: 'drop-shadow(0 10px 25px rgb(0 0 0 / 0.15))'
            }}
          />
        </div>

        {/* Minimal footer hint */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/20 to-transparent">
          <p className="text-center text-white/70 text-xs sm:text-sm">
            Tap outside or press ESC to close
          </p>
        </div>
      </div>
    </div>
  );
}