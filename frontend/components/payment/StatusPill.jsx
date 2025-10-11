// components/payment/StatusPill.jsx
export default function StatusPill({ status }) {
  const map = {
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-rose-100 text-rose-700",
    PENDING_REVIEW: "bg-cyan-100 text-cyan-700",
    HOLD: "bg-amber-100 text-amber-700",
    EXPIRED: "bg-gray-100 text-gray-700",
    WAIT_FOR_PAYMENT: "bg-violet-100 text-violet-700",
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${map[status] || "bg-gray-100 text-gray-700"}`}>
      {String(status || "").replaceAll("_", " ")}
    </span>
  );
}
