// services/hostRevenueService.js
import axios from "./axiosInstance";

// GET /api/hosts/revenue/summary?from=&to=&groupBy=day
// Backend currently supports only groupBy=day. If week requested, we aggregate client-side.
export async function getRevenueSummary({ from, to, groupBy = "day" }) {
  try {
    const { fromDt, toDt } = buildDateTimeRange(from, to);
    const res = await axios.get("/hosts/revenue/summary", {
      params: { from: fromDt, to: toDt, groupBy: "day" }, // force day for backend
      validateStatus: () => true,
    });
    if (res.status === 200) {
      const list = Array.isArray(res.data) ? res.data : [];
      if (groupBy === "week") {
        // aggregate by ISO week (Mon-Sun) client-side
        const byWeek = new Map();
        list.forEach((d) => {
          const dateObj = new Date(d.date);
          // use Monday as first day
          const day = dateObj.getDay(); // 0 Sun ... 6 Sat
            // shift to Monday-based week: Convert JS Sunday(0) to 7 then compute week start
          const jsDay = day === 0 ? 7 : day; // 1..7
          const startOffset = jsDay - 1; // days since Monday
          const weekStart = new Date(dateObj);
          weekStart.setDate(dateObj.getDate() - startOffset);
          weekStart.setHours(0,0,0,0);
          const key = weekStart.toISOString().slice(0,10); // yyyy-MM-dd
          const cur = byWeek.get(key) || { date: key, totalRevenue: 0, totalBookings: 0 };
          cur.totalRevenue += Number(d.totalRevenue || 0);
          cur.totalBookings += Number(d.totalBookings || 0);
          byWeek.set(key, cur);
        });
        return { ok: true, data: Array.from(byWeek.values()) };
      }
      return { ok: true, data: list };
    }
    return { ok: false, status: res.status, message: res.data?.message || "โหลดสรุปรายได้ไม่สำเร็จ" };
  } catch (err) {
    return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}

// GET /api/hosts/revenue/transactions
// Params: from,to,method?,locationId?,page?,size?
export async function getRevenueTransactions(params = {}) {
  try {
    const { fromDt, toDt } = buildDateTimeRange(params.from, params.to);
    const res = await axios.get("/hosts/revenue/transactions", {
      params: { ...params, from: fromDt, to: toDt },
      validateStatus: () => true,
    });
    if (res.status === 200) {
      return { ok: true, data: res.data };
    }
    return { ok: false, status: res.status, message: res.data?.message || "โหลดธุรกรรมรายได้ไม่สำเร็จ" };
  } catch (err) {
    return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}

// Convert date-only (yyyy-MM-dd) into ISO DATE_TIME expected by backend LocalDateTime
function buildDateTimeRange(from, to) {
  const fromDt = from ? ensureDateTime(from, false) : undefined;
  const toDt = to ? ensureDateTime(to, true) : undefined;
  return { fromDt, toDt };
}

function ensureDateTime(dateStr, isEnd) {
  // already contains 'T'
  if (/T\d{2}:\d{2}/.test(dateStr)) return dateStr;
  return isEnd ? `${dateStr}T23:59:59` : `${dateStr}T00:00:00`;
}
