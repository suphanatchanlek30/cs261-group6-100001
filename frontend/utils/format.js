// utils/format.js

export function formatLocal(iso, opts = {}) {
  if (!iso) return "";
  const d = new Date(iso); // รู้ offset อยู่แล้ว
  return d.toLocaleString([], {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
    ...opts,
  });
}
export function formatLocalTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

// Format number into Thai Baht currency without satang
export function formatTHB(amount) {
  const n = Number(amount || 0);
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}