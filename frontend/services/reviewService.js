// services/reviewService.js
import axios from "./axiosInstance";

/**
 * POST /api/reviews
 * body: { bookingId, rating, comment }
 */
export async function createReview({ bookingId, rating, comment }) {
  try {
    const res = await axios.post("/reviews", { bookingId, rating, comment });
    return { ok: true, data: res.data };
  } catch (err) {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err.message ||
      "ส่งรีวิวไม่สำเร็จ";
    return { ok: false, status, message };
  }
}

/**
 * GET /api/locations/{locationId}/reviews
 * query: page,size,minRating
 */
export async function getLocationReviews(
  locationId,
  { page = 0, size = 10, minRating } = {}
) {
  try {
    const params = { page, size };
    if (minRating != null) params.minRating = minRating;

    const res = await axios.get(`/locations/${locationId}/reviews`, { params });
    // response: { items, page, size, total, totalPages }
    return { ok: true, data: res.data };
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err.message ||
      "โหลดรีวิวไม่สำเร็จ";
    return { ok: false, message };
  }
}

/**
 * GET /api/locations/{locationId}/reviews/overview
 * response: {
 *   items: [...],
 *   page, size, total, totalPages,
 *   stats: { avgRating, totalReviews, reviewers, r5, r4, r3, r2, r1 }
 * }
 */
export async function getLocationReviewsOverview(locationId, params = {}) {
  try {
    const res = await axios.get(`/locations/${locationId}/reviews/overview`, { params });
    return { ok: true, data: res.data };
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err.message ||
      "โหลดสรุปรีวิวไม่สำเร็จ";
    return { ok: false, message };
  }
}
