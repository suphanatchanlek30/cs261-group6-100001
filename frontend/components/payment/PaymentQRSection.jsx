// components/payment/PaymentQRSection.jsx
"use client";
import { FiUpload } from "react-icons/fi";

export default function PaymentQRSection({
  show,
  amount,
  qrImageUrl,
  slipUrl,
  uploading = false,
  canUploadSlip = true,
  onPickFile,   // (file: File) => void
  onSendSlip,   // () => void
}) {
  if (!show) return null;

  return (
    <div className="mt-8 text-center p-6 bg-white shadow-md rounded-2xl">
      <p className="mb-4 text-sm text-gray-700">
        Payment has been made through the banking app. <br /> Upload payment slip below
      </p>

      <img src={qrImageUrl} alt="QR Code" className="mx-auto w-44 rounded-lg shadow" />
      <p className="mt-2 text-xs text-neutral-600">Total payment {amount} Baht</p>
      <p className="mt-1 text-xs text-rose-600">***Please make the payment within 30 minutes***</p>

      {slipUrl && (
        <div className="mt-4">
          <img src={slipUrl} alt="Uploaded Slip" className="mx-auto w-56 rounded-lg shadow-md border border-gray-200" />
          <p className="text-xs text-gray-500 mt-1">Slip uploaded successfully</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-center items-center gap-3 mt-5">
        <label className={`w-[85%] md:w-[200px] h-[44px] border ${canUploadSlip ? "border-[#7C3AED] text-[#7C3AED] hover:bg-purple-50" : "border-gray-300 text-gray-400 cursor-not-allowed"} px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${!canUploadSlip ? "pointer-events-none" : "cursor-pointer"}`}>
          <FiUpload />
          {uploading ? "Uploading..." : "Upload payment slip"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onPickFile?.(e.target.files?.[0])} disabled={uploading || !canUploadSlip} />
        </label>

        <button
          onClick={onSendSlip}
          className="w-[85%] md:w-[200px] h-[44px] bg-[#7C3AED] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
          disabled={!slipUrl}
        >
          Send the slip
        </button>
      </div>
    </div>
  );
}
