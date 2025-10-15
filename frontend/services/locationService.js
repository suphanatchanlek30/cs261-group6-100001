// services/locationService.js
import axios from "./axiosInstance";

/** POST /api/locations */
export async function createLocation(data) {
  try {
    const res = await axios.post("/locations", data);
    return { ok: true, data: res.data };
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data ||
      err.message ||
      "สร้างสถานที่ล้มเหลว";
    return { ok: false, message: msg };
  }
}

/**
 * GET /api/locations (แบ่งหน้า)
 * @param {{ q?:string, near?:string, radiusKm?:number, page?:number, size?:number }} params
 * @returns {Promise<{ ok:boolean, data?:{items:any[], page:number, size:number, total:number}, message?:string }>}
 */
export async function getLocations(params = {}) {
  try {
    const res = await axios.get("/locations", { params });
    // คาดหวังโครงสร้าง: { items, page, size, total }
    return { ok: true, data: res.data };
  } catch (err) {
    const message =
      err?.response?.data || err?.message || "โหลดรายการสถานที่ล้มเหลว";
    return { ok: false, message };
  }
}

/**
 * ดึง “ทั้งหมด” โดยไล่ทุกหน้า (ระวังจำนวนเยอะมาก)
 * @param {{ q?:string, near?:string, radiusKm?:number, batchSize?:number }} params
 */
export async function getAllLocations({ q, near, radiusKm, batchSize = 20 } = {}) {
  let page = 0;
  const size = Math.min(batchSize, 20); // backend limit 20
  const all = [];

  while (true) {
    const { ok, data, message } = await getLocations({ q, near, radiusKm, page, size });
    if (!ok) return { ok: false, message };

    all.push(...(data.items || []));
    const fetched = (page + 1) * size;
    if (fetched >= data.total || (data.items || []).length === 0) break;
    page += 1;
  }

  return { ok: true, data: { items: all, page: 0, size: all.length, total: all.length } };
}


export async function getLocationById(id) {
  try {
    const res = await axios.get(`/locations/${id}`);
    return { ok: true, data: res.data };
  } catch (err) {
    return {
      ok: false,
      message: err.response?.data || err.message || "เกิดข้อผิดพลาด",
    };
  }
}


// แก้ไขข้อมูลสถานที่ (PATCH)
export async function updateLocation(id, payload) {
  try {
    const res = await axios.patch(`/locations/${id}`, payload);
    return { ok: true, data: res.data };
  } catch (err) {
    const msg = err?.response?.data?.message || err?.response?.data || err?.message || "อัปเดตไม่สำเร็จ";
    return { ok: false, message: msg, status: err?.response?.status };
  }
}
// เพิ่มยูนิตใหม่ในสถานที่ (POST)
export async function createUnit(locationId, payload) {
  try {
    const res = await axios.post(`/locations/${locationId}/units`, payload);
    return { ok: true, data: res.data };
  } catch (err) {
    const msg = err?.response?.data?.message || err?.response?.data || err?.message || "เพิ่มยูนิตไม่สำเร็จ";
    return { ok: false, message: msg, status: err?.response?.status };
  }
}

/** ลบสถานที่ตาม id */
export async function deleteLocation(id) {
  try {
    const res = await axios.delete(`/locations/${id}`);
    // โค้ดจริงอาจคืน 200 + body หรือ 204 no content (รองรับทั้งคู่)
    if (res.status === 200 || res.status === 204) {
      return { ok: true, data: res.data };
    }
    return { ok: false, message: `Unexpected status: ${res.status}` };
  } catch (err) {
    console.error("❌ deleteLocation error:", err);
    const msg = err?.response?.data || err?.message || "ลบไม่สำเร็จ";
    return { ok: false, message: msg };
  }
}



/** จุดกึ่งกลางจังหวัด (approx) + รัศมีที่เหมาะสมสำหรับหน้า Home */
export const PROVINCE_CENTER = {
  "Bangkok":      { lat: 13.7563, lng: 100.5018, radiusKm: 35 }, // กรุงเทพมหานคร
  "Nonthaburi":   { lat: 13.8621, lng: 100.5144, radiusKm: 25 },
  "Pathum Thani": { lat: 14.0209, lng: 100.5250, radiusKm: 30 },
};

/**
 * ดึงรายการสถานที่สำหรับหน้า Home
 * - ถ้ามี province → ใช้ near+radiusKm ตามพิกัดจังหวัดนั้น
 * - ถ้าไม่เลือก province → ดึงทั้งหมดแบบแบ่งหน้า (default 6)
 * @param {{ province?: 'Bangkok'|'Nonthaburi'|'Pathum Thani', q?: string, size?: number }} opts
 * @returns {Promise<{ok:boolean, data?: {items:any[], page:number, size:number, total:number}, message?:string }>}
 */
export async function getHomeLocations({ province, q, size = 6 } = {}) {
  // ไม่มี province → โชว์ทั้งหมด 6 รายการแรก
  if (!province) {
    return getLocations({ q, page: 0, size });
  }

  const center = PROVINCE_CENTER[province];
  if (!center) {
    // ป้องกันสะกดไม่ตรง key
    return { ok: false, message: `ไม่รู้จักจังหวัด: ${province}` };
  }

  const near = `${center.lat},${center.lng}`;
  const radiusKm = center.radiusKm;

  return getLocations({ q, near, radiusKm, page: 0, size });
}

/**
 * ดึง “เพิ่มเติม/see more” สำหรับหน้า Home (หน้า 2,3,...) เวลาไปหน้า search ก็ใช้ฟังก์ชัน getLocations เดิมได้
 * ทำไว้เผื่อจะใช้กดโหลดเพิ่มภายหลัง
 */
export async function getMoreHomeLocations({ province, q, page = 1, size = 6 } = {}) {
  if (!province) {
    return getLocations({ q, page, size });
  }
  const center = PROVINCE_CENTER[province];
  if (!center) return { ok: false, message: `ไม่รู้จักจังหวัด: ${province}` };

  const near = `${center.lat},${center.lng}`;
  return getLocations({ q, near, radiusKm: center.radiusKm, page, size });
}