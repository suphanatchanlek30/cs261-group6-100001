// services/adminUsersService.js
import axios from "./axiosInstance";

export async function getAdminUsers({ q, role, status, page = 0, size = 10 } = {}) {
  try {
    const params = {};
    if (q) params.q = q;
    if (role && role !== "ALL") params.role = role;
    if (status && status !== "ALL") params.status = status; // backend may expect ACTIVE/INACTIVE
    if (page != null) params.page = page;
    if (size != null) params.size = size;

    const res = await axios.get("/admin/users", { params, validateStatus: () => true });
    if (res.status === 200) {
      const data = res.data || {};
      return { ok: true, data };
    }
    return { ok: false, status: res.status, message: res.data?.message || "โหลดรายชื่อผู้ใช้ไม่สำเร็จ" };
  } catch (err) {
    return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}

export async function patchAdminUserStatus(id, status, reason) {
  try {
    const body = { status };
    if (reason) body.reason = reason;
    const res = await axios.patch(`/admin/users/${id}/status`, body, { validateStatus: () => true });
    if (res.status === 200) {
      return { ok: true, data: res.data };
    }
    return { ok: false, status: res.status, message: res.data?.message || "อัปเดตสถานะไม่สำเร็จ" };
  } catch (err) {
    return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}
