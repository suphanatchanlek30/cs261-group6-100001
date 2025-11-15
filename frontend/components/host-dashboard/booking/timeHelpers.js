// timeHelpers.js

// Treat naive ISO (no timezone) as UTC, then format in Thai timezone (+07)
export const normalizeUtc = (s) => {
  if (!s || typeof s !== "string") return s;
  const m = s.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
  return m ? `${m[1]}Z` : s;
};

export const formatThaiDate = (iso) => {
  const d = new Date(normalizeUtc(iso));
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatThaiTime = (iso) => {
  const d = new Date(normalizeUtc(iso));
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const formatTHB = (n) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
