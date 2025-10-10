// services/unitService.js
import axios from "./axiosInstance";

/** ดึงรายละเอียดยูนิต **/
export async function getUnitById(id) {
  try {
    const res = await axios.get(`/units/${id}`);
    return { ok: true, data: res.data };
  } catch (err) {
    const msg = err?.response?.data || err?.message || "โหลดยูนิตไม่สำเร็จ";
    return { ok: false, message: msg, status: err?.response?.status };
  }
}

/** PATCH /api/units/{id} : แก้ไขยูนิตแบบ partial */
export async function updateUnit(id, payload) {
  try {
    const res = await axios.patch(`/units/${id}`, payload);
    return { ok: true, data: res.data };
  } catch (err) {
    const msg = err?.response?.data?.message || err?.response?.data || err?.message || "อัปเดตยูนิตไม่สำเร็จ";
    return { ok: false, message: msg, status: err?.response?.status };
  }
}

// DELETE /api/units/{id} : ลบยูนิต
export async function deleteUnit(id) {
  try {
    const res = await axios.delete(`/units/${id}`);
    // backend อาจส่ง 204 (ตามสเปก) หรือ 200+body (กันไว้)
    if (res.status === 204 || res.status === 200) {
      return { ok: true, data: res.data };
    }
    return { ok: false, message: `Unexpected status: ${res.status}` };
  } catch (err) {
    const msg = err?.response?.data || err?.message || "ลบยูนิตไม่สำเร็จ";
    return { ok: false, message: msg, status: err?.response?.status };
  }
}