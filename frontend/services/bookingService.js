// services/bookingService.js
import axios from "./axiosInstance";
import { toUtcZ, addHoursToIsoReturnUtcZ } from "@/utils/date";

/* ---------------- Availability ---------------- */
/** GET /units/{unitId}/occupied — ตรวจช่วงเวลาว่างของยูนิต */
export async function checkUnitAvailability({ unitId, startTime, hours }) {
  try {
    const from = toUtcZ(startTime);
    const to = addHoursToIsoReturnUtcZ(startTime, Number(hours));

    const res = await axios.get(`/units/${unitId}/occupied`, {
      params: { from, to },
      validateStatus: () => true,
    });

    if (res.status === 200) {
      const slots = Array.isArray(res.data?.slots) ? res.data.slots : [];
      const busy = slots.length > 0;
      return {
        ok: true,
        available: !busy,
        message: busy ? "ช่วงเวลานี้ถูกจองแล้ว" : "พื้นที่ว่าง สามารถจองได้",
      };
    }
    if (res.status === 400) {
      return {
        ok: false,
        available: false,
        message:
          typeof res.data === "string"
            ? res.data
            : "รูปแบบเวลาต้องเป็น ISO-8601 เช่น 2025-10-10T00:00:00+07:00 หรือ Z",
      };
    }
    if (res.status === 404) {
      return { ok: false, available: false, message: "ไม่พบยูนิต" };
    }
    return {
      ok: false,
      available: false,
      message: res.data?.message || "ตรวจสอบไม่สำเร็จ",
    };
  } catch (err) {
    return {
      ok: false,
      available: false,
      message: err?.message || "เกิดข้อผิดพลาด",
    };
  }
}

/* ---------------- Create booking ---------------- */
/** POST /bookings — สมัครการจอง (JWT required) */
export async function createBooking(payload) {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : "";
    if (!token)
      return { ok: false, message: "กรุณาเข้าสู่ระบบก่อนจอง", status: 401 };

    const res = await axios.post(`/bookings`, payload, {
      validateStatus: () => true,
    });

    if (res.status === 201) return { ok: true, data: res.data };

    let errorMsg = "Booking failed";
    if (res.status === 401) errorMsg = "ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบใหม่";
    else if (res.status === 400)
      errorMsg =
        typeof res.data === "string"
          ? res.data
          : "ข้อมูลไม่ถูกต้อง (เวลาต้องเป็นชั่วโมงเต็ม)";
    else if (res.status === 404) errorMsg = "ไม่พบยูนิตที่เลือก";
    else if (res.status === 409) errorMsg = "ช่วงเวลานี้ถูกจองแล้ว";
    else if (res.status === 403)
      errorMsg = "เฉพาะ USER เท่านั้นที่สามารถสร้างการจองได้";
    else if (res.status === 422) errorMsg = "สถานะการจองไม่อนุญาต";
    else if (res.data)
      errorMsg =
        typeof res.data === "string" ? res.data : res.data.message || errorMsg;

    return { ok: false, message: errorMsg, status: res.status };
  } catch (err) {
    return { ok: false, message: err?.message || "เกิดข้อผิดพลาดในระบบ" };
  }
}

/* ---------------- My bookings (OVERVIEW) ---------------- */
/**
 * GET /bookings/me/overview?status=&page=&size=
 * คืน items ที่รวม booking + unit + location + payment + review + actions
 */
export async function getMyBookingsOverview(params = {}) {
  try {
    const res = await axios.get(`/bookings/me/overview`, {
      params,
      validateStatus: () => true,
    });
    if (res.status === 200) return { ok: true, data: res.data };
    return {
      ok: false,
      status: res.status,
      message:
        typeof res.data === "string"
          ? res.data
          : res.data?.message || "โหลดรายการจอง (overview) ไม่สำเร็จ",
    };
  } catch (err) {
    return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}

/* ---------------- (ยังคงเผื่อใช้) My bookings (raw) ---------------- */
/** GET /bookings/me — กรณีบางหน้าอยากได้แบบ entity เดิม */
export async function getMyBookings(params = {}) {
  try {
    const res = await axios.get(`/bookings/me`, {
      params,
      validateStatus: () => true,
    });
    if (res.status === 200) return { ok: true, data: res.data };
    return {
      ok: false,
      status: res.status,
      message:
        typeof res.data === "string"
          ? res.data
          : res.data?.message || "โหลดรายการจองไม่สำเร็จ",
    };
  } catch (err) {
    return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}

/* ---------------- Booking detail ---------------- */
/** GET /bookings/{id} — เจ้าของหรือ ADMIN เท่านั้น */
export async function getBookingDetail(id) {
  if (!id) return { ok: false, message: "ต้องระบุ booking id" };
  try {
    const res = await axios.get(`/bookings/${id}`, {
      validateStatus: () => true,
    });

    if (res.status === 200) return { ok: true, data: res.data };

    let msg = "โหลดรายละเอียดการจองไม่สำเร็จ";
    if (res.status === 401) msg = "ไม่ได้รับอนุญาต";
    else if (res.status === 403) msg = "คุณไม่มีสิทธิ์ดูการจองนี้";
    else if (res.status === 404) msg = "ไม่พบการจอง";
    else if (typeof res.data === "string") msg = res.data;
    else if (res.data?.message) msg = res.data.message;

    return { ok: false, status: res.status, message: msg };
  } catch (err) {
    return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}

/* ---------------- Cancel booking ---------------- */
/** PATCH /bookings/{id}/cancel — ยกเลิกโดยเจ้าของ (ตามสิทธิ์) */
export async function cancelBooking(id, reason) {
  try {
    const res = await axios.patch(
      `/bookings/${id}/cancel`,
      reason ? { reason } : {},
      { validateStatus: () => true }
    );
    if (res.status === 200) return { ok: true, data: res.data };

    const msg =
      typeof res.data === "string"
        ? res.data
        : res.data?.message || "ยกเลิกไม่สำเร็จ";
    return { ok: false, message: msg, status: res.status };
  } catch (err) {
    return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}

/* ---------------- UI helpers ---------------- */
/** แปลงช่วงเวลาเป็นข้อความตามโซนเวลาไทย (Asia/Bangkok)
 * - ตัด timezone เดิมทิ้ง แล้วตีความเป็น UTC (เพื่อบังคับให้ขยับ +7)
 */
export function formatRangeLocal(
  startISO,
  endISO,
  locale = "th-TH",
  timeZone = "Asia/Bangkok"
) {
  if (!startISO || !endISO) return { dateText: "-", timeText: "-" };

  // 🔹 ตัดส่วน timezone ออก แล้วเติม Z เพื่อบังคับตีความเป็น UTC
  const normalizeUtc = (s) => {
    if (typeof s !== "string") return s;
    // เอาเฉพาะ yyyy-MM-ddTHH:mm:ss แล้วเติม Z
    const m = s.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
    return m ? `${m[1]}Z` : s;
  };

  const s = new Date(normalizeUtc(startISO));
  const e = new Date(normalizeUtc(endISO));

  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
    return { dateText: "-", timeText: "-" };
  }

  const dateText = s.toLocaleDateString(locale, {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const t1 = s.toLocaleTimeString(locale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const t2 = e.toLocaleTimeString(locale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return { dateText, timeText: `${t1}-${t2}` };
}

// HOTFIX: บวก 14 ชั่วโมง เพื่อชดเชยที่ระบบโดนเลื่อน -7 ชม. มาแล้ว
export function formatRangeLocalHotfix(startISO, endISO, locale = "th-TH") {
  if (!startISO || !endISO) return { dateText: "-", timeText: "-" };
  const SHIFT_MS = 14 * 60 * 60 * 1000; // +14h

  const s0 = new Date(startISO);
  const e0 = new Date(endISO);
  if (Number.isNaN(s0.getTime()) || Number.isNaN(e0.getTime())) {
    return { dateText: "-", timeText: "-" };
  }
  const s = new Date(s0.getTime() + SHIFT_MS);
  const e = new Date(e0.getTime() + SHIFT_MS);

  const dateText = s.toLocaleDateString(locale, { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric" });
  const t1 = s.toLocaleTimeString(locale, { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: false });
  const t2 = e.toLocaleTimeString(locale, { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: false });

  return { dateText, timeText: `${t1}-${t2}` };
}


/** สรุปสิทธิ์ปุ่มจากสถานะ (fallback ถ้าไม่ได้ส่ง actions/flags มา) */
export function deriveActionsFromStatus(status) {
  const S = String(status || "").toUpperCase();
  return {
    canReview: S === "CONFIRMED",
    canPay: S === "HOLD",
    canCancel: S === "HOLD" || S === "PENDING_REVIEW",
    isHistoryOnly: S === "CANCELLED" || S === "EXPIRED",
  };
}


export async function getMyBookingOverviewById(bookingId) {
  try {
    const res = await axios.get(`/bookings/${bookingId}`);
    return { ok: true, data: res.data };
  } catch (err) {
    const msg = err?.response?.data?.message || err?.response?.data || err?.message || "โหลดรายละเอียดการจองล้มเหลว";
    return { ok: false, message: msg };
  }
}
