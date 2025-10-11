// services/bookingService.js
import axios from "./axiosInstance";
import { toUtcZ, addHoursToIsoReturnUtcZ } from "@/utils/date";

// เช็คว่ายูนิตว่างหรือไม่ ด้วย occupied endpoint
export async function checkUnitAvailability({ unitId, startTime, hours }) {
  try {
    const from = toUtcZ(startTime);                                // 2025-10-16T05:00:00Z
    const to   = addHoursToIsoReturnUtcZ(startTime, Number(hours)); // 2025-10-16T06:00:00Z

    const res = await axios.get(`/units/${unitId}/occupied`, {
      params: { from, to },
      validateStatus: () => true,
    });

    if (res.status === 200) {
      const slots = Array.isArray(res.data?.slots) ? res.data.slots : [];
      const busy = slots.length > 0; // ถ้ามี slot ทับช่วง => ไม่ว่าง
      return {
        ok: true,
        available: !busy,
        message: busy ? "ช่วงเวลานี้ถูกจองแล้ว" : "พื้นที่ว่าง สามารถจองได้",
      };
    }

    // รูปแบบพารามิเตอร์ไม่ถูก
    if (res.status === 400) {
      return { ok: false, available: false, message: typeof res.data === "string" ? res.data : "รูปแบบเวลาต้องเป็น ISO-8601 เช่น 2025-10-10T00:00:00+07:00 หรือ Z" };
    }
    if (res.status === 404) {
      return { ok: false, available: false, message: "ไม่พบยูนิต" };
    }
    return { ok: false, available: false, message: res.data?.message || "ตรวจสอบไม่สำเร็จ" };
  } catch (err) {
    return { ok: false, available: false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}

// สมัครการจอง (ส่ง ISO+offset ตามที่ BE ต้องการ)
export async function createBooking(payload) {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    if (!token) return { ok: false, message: "กรุณาเข้าสู่ระบบก่อนจอง", status: 401 };

    const res = await axios.post(`/bookings`, payload);

    if (res.status === 201) return { ok: true, data: res.data };

    let errorMsg = "Booking failed";
    if (res.status === 401) errorMsg = "ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบใหม่";
    else if (res.status === 400) errorMsg = typeof res.data === "string" ? res.data : "ข้อมูลไม่ถูกต้อง (เวลาต้องเป็นชั่วโมงเต็ม)";
    else if (res.status === 404) errorMsg = "ไม่พบยูนิตที่เลือก";
    else if (res.status === 409) errorMsg = "ช่วงเวลานี้ถูกจองแล้ว";
    else if (res.status === 403) errorMsg = "เฉพาะ USER เท่านั้นที่สามารถสร้างการจองได้";
    else if (res.status === 422) errorMsg = "สถานะการจองไม่อนุญาต";
    else if (res.data) errorMsg = typeof res.data === "string" ? res.data : (res.data.message || errorMsg);

    return { ok: false, message: errorMsg, status: res.status };
  } catch (err) {
    return { ok: false, message: err?.message || "เกิดข้อผิดพลาดในระบบ" };
  }
}
