// utils/date.js

export function buildStartTimeISO(dateOnly, hour) {
  if (!dateOnly && dateOnly !== "0") return "";
  if (hour == null) return "";
  const [y, m, d] = dateOnly.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1, hour, 0, 0, 0);

  const offsetMin = -dt.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  const offset = `${sign}${hh}:${mm}`;

  const yyyy = dt.getFullYear();
  const MM = String(dt.getMonth() + 1).padStart(2, "0");
  const DD = String(dt.getDate()).padStart(2, "0");
  const HH = String(dt.getHours()).padStart(2, "0");
  return `${yyyy}-${MM}-${DD}T${HH}:00:00${offset}`;
}

// แปลงสตริง ISO (มี offset อยู่แล้ว) → UTC แบบ Z และตัด ms ออก
export function toUtcZ(isoWithOffset) {
  const z = new Date(isoWithOffset).toISOString();  // 2025-10-16T05:00:00.000Z
  return z.replace(".000Z", "Z");                    // 2025-10-16T05:00:00Z
}

// เพิ่มชั่วโมงจากสตริง ISO (มี offset) แล้วคืนเป็น UTC Z
export function addHoursToIsoReturnUtcZ(isoWithOffset, hours) {
  const d = new Date(isoWithOffset);
  d.setHours(d.getHours() + Number(hours || 0));
  const z = d.toISOString();
  return z.replace(".000Z", "Z");
}

// Treat naive 'YYYY-MM-DDTHH:mm:ss' as UTC and return Date object
export function normalizeUtc(naive) {
  if (!naive) return new Date(NaN);
  const hasZone = /Z|[+-]\d{2}:?\d{2}$/.test(naive);
  const iso = hasZone ? naive : naive + "Z";
  return new Date(iso);
}

export function formatThaiDate(date) {
  if (!(date instanceof Date) || isNaN(date)) return "";
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatThaiTime(date) {
  if (!(date instanceof Date) || isNaN(date)) return "";
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });
}
