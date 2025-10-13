// services/adminService.js
import axios from "./axiosInstance";

// GET /api/admin/payments?status=&page=&size=
export async function getAdminPayments({ status, page = 0, size = 10 } = {}) {
  try {
    const res = await axios.get("/admin/payments", {
      params: { status, page, size },
      validateStatus: () => true,
    });
    if (res.status === 200) return { ok: true, data: res.data };
    return {
      ok: false,
      message:
        typeof res.data === "string"
          ? res.data
          : res.data?.message || `HTTP ${res.status}`,
      status: res.status,
    };
  } catch (err) {
    return {
      ok: false,
      message: err?.response?.data?.message || err?.message || "โหลดรายการชำระเงินล้มเหลว",
    };
  }
}

// PATCH สถานะ (สมมติฝั่ง BE มี endpoint เดียวรับ action: APPROVE/REJECT)
// ถ้าโปรเจกต์คุณแยกเป็น /approve และ /reject ก็แก้นิดเดียวได้
export async function updateAdminPaymentStatus(paymentId, action, reason) {
  try {
    const res = await axios.patch(
      `/admin/payments/${paymentId}`,
      { action, reason },
      { validateStatus: () => true }
    );
    if (res.status === 200) return { ok: true, data: res.data };
    return {
      ok: false,
      message:
        typeof res.data === "string"
          ? res.data
          : res.data?.message || `HTTP ${res.status}`,
      status: res.status,
    };
  } catch (err) {
    return {
      ok: false,
      message: err?.response?.data?.message || err?.message || "อัปเดตสถานะไม่สำเร็จ",
    };
  }
}
