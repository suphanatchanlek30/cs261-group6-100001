// services/hostUnitService.js
import axios from "./axiosInstance";

/**
 * PATCH /api/hosts/units/{id}
 * แก้ไขยูนิตของ Host (owner)
 * @param {string} unitId - ID ของยูนิตที่จะแก้ไข
 * @param {object} payload - ข้อมูลที่ต้องการ patch (partial)
 */
export async function updateHostUnit(unitId, payload) {
  try {
    const res = await axios.patch(`/hosts/units/${unitId}`, payload, { validateStatus: () => true });
    
    if (res.status === 200) {
      return { ok: true, data: res.data };
    }
    
    const msg = res.data?.message || res.data || "อัปเดตยูนิตไม่สำเร็จ";
    return { ok: false, status: res.status, message: msg };
  } catch (err) {
    return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}

/**
 * POST /api/hosts/locations/{locationId}/units
 * (API ที่เพิ่มเข้ามาใหม่) เพิ่มยูนิตใหม่ในสถานที่ของ Host
 * @param {string} locationId - ID ของสถานที่ (Location)
 * @param {object} payload - ข้อมูลยูนิต { code, name, ... }
 */
export async function createHostUnit(locationId, payload) {
  try {
    const res = await axios.post(`/hosts/locations/${locationId}/units`, payload, { validateStatus: () => true });
    
    if (res.status === 201) {
      return { ok: true, data: res.data };
    }
    
    const msg = res.data?.message || res.data || "เพิ่มยูนิตไม่สำเร็จ";
    return { ok: false, status: res.status, message: msg };
  } catch (err) {
    return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}

