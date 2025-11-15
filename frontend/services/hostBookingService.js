// services/hostBookingService.js
import axios from "./axiosInstance";

/**
 * GET /api/hosts/bookings
 * Query params: { status, locationId, unitId, from, to, page, size, sort }
 * Returns Spring Page<GetAllBookingHostResponse>
 */
export async function getHostBookings(params = {}) {
  try {
    const res = await axios.get("/hosts/bookings", {
      params,
      validateStatus: () => true,
    });

    if (res.status === 200) {
      // Spring Page structure: { content, number, size, totalElements, totalPages, ... }
      const data = res.data || {};
      return { ok: true, data };
    }

    const msg =
      typeof res.data === "string"
        ? res.data
        : res.data?.message || "โหลดรายการจอง (Host) ไม่สำเร็จ";
    return { ok: false, status: res.status, message: msg };
  } catch (err) {
    return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}

/**
 * GET /api/hosts/bookings/{id}
 * Returns GetBookingHostResponse
 */
export async function getHostBooking(id) {
  if (!id) return { ok: false, message: "ต้องระบุ booking id" };
  try {
    const res = await axios.get(`/hosts/bookings/${id}`, {
      validateStatus: () => true,
    });

    if (res.status === 200) return { ok: true, data: res.data };

    const msg =
      typeof res.data === "string"
        ? res.data
        : res.data?.message || "โหลดรายละเอียดการจอง (Host) ไม่สำเร็จ";
    return { ok: false, status: res.status, message: msg };
  } catch (err) {
    return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}
