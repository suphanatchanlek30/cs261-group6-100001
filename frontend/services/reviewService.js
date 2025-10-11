// services/reviewService.js
import axios from "./axiosInstance";

/** ดึงรีวิวของสถานที่ */
export async function getLocationReviews(locationId, { page = 0, size = 3, minRating } = {}) {
  try {
    const params = { page, size };
    if (minRating) params.minRating = minRating;
    const res = await axios.get(`/locations/${locationId}/reviews`, { params });
    return { ok: true, data: res.data };
  } catch (err) {
    const msg = err?.response?.data || err?.message || "โหลดรีวิวล้มเหลว";
    return { ok: false, message: msg };
  }
}
