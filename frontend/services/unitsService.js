// services/unitsService.js
import axios from "./axiosInstance";

/** GET /api/units/{unitId}/occupied?from=ISO&to=ISO */
export async function getUnitOccupied(unitId, fromISO, toISO) {
  try {
    const res = await axios.get(`/units/${unitId}/occupied`, {
      params: { from: fromISO, to: toISO },
    });
    return { ok: true, data: res.data }; // { unitId, from, to, slots:[{start,end,status}] }
  } catch (err) {
    const msg = err?.response?.data || err?.message || "โหลดช่วงไม่ว่างล้มเหลว";
    return { ok: false, message: msg };
  }
}

/** util: ตรวจว่าช่วง [start,end) ทับกับใครไหม */
export function hasOverlap(startISO, endISO, slots = []) {
  const s = new Date(startISO).getTime();
  const e = new Date(endISO).getTime();
  if (Number.isNaN(s) || Number.isNaN(e) || e <= s) return true; // ป้องกันข้อมูลผิด

  // นับเฉพาะสถานะที่ถือว่า "ไม่ว่าง"
  const BUSY = new Set(["HOLD", "PENDING_REVIEW", "CONFIRMED"]);

  return slots.some((slot) => {
    if (!BUSY.has(slot?.status)) return false;
    const ss = new Date(slot.start).getTime();
    const ee = new Date(slot.end).getTime();
    // overlap if ss < e && s < ee
    return ss < e && s < ee;
  });
}
