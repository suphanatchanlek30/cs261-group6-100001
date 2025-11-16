// services/hostDashboardService.js
import axios from "./axiosInstance";

export async function getHostDashboard({ from, to, groupBy } = {}) {
  try {
    const params = {};
    if (from) params.from = ensureDateTime(from, false);
    if (to) params.to = ensureDateTime(to, true);
    if (groupBy) params.groupBy = groupBy;
    const res = await axios.get("/hosts/dashboard", { params, validateStatus: () => true });
    if (res.status === 200) {
      const raw = res.data || {};
      const charts = raw.charts || raw; // support both shapes
      return {
        ok: true,
        data: {
          cards: raw.cards || {},
          bookingTrend: charts.bookingTrend || [],
          revenueDaily: charts.revenueDaily || [],
        },
      };
    }
    return { ok: false, status: res.status, message: res.data?.message || "โหลดแดชบอร์ดไม่สำเร็จ" };
  } catch (err) {
    return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}

function ensureDateTime(dateStr, isEnd) {
  if (/T\d{2}:\d{2}:\d{2}$/.test(dateStr)) return dateStr; // already a datetime
  return isEnd ? `${dateStr}T23:59:59` : `${dateStr}T00:00:00`;
}
