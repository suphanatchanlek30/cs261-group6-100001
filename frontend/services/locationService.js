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
