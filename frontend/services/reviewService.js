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

/**
 * รับรายการรีวิวทั้งหมดสำหรับ admin
 * @param {number} page - หมายเลขหน้า (0-based)
 * @param {number} size - จำนวนรายการต่อหน้า
 * @returns {Promise<{ok: boolean, data?: any, message?: string}>}
 */
export async function getAdminReviews(page = 0, size = 10) {
  try {
    const response = await axios.get(`/admin/reviews`, {
      params: { page, size }
    });

    return {
      ok: true,
      data: response.data,
    };
  } catch (error) {
    console.error("getAdminReviews error:", error);
    
    if (error.response?.status === 401) {
      return { ok: false, message: "ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบใหม่" };
    }
    if (error.response?.status === 403) {
      return { ok: false, message: "เฉพาะ Admin เท่านั้นที่เข้าถึงได้" };
    }
    
    return {
      ok: false,
      message: error.response?.data?.message || error.message || "เกิดข้อผิดพลาดในการโหลดรีวิว"
    };
  }
}

/**
 * ลบรีวิวโดย admin
 * @param {string} reviewId - UUID ของรีวิวที่จะลบ
 * @returns {Promise<{ok: boolean, message?: string}>}
 */
export async function deleteAdminReview(reviewId) {
  try {
    await axios.delete(`/admin/reviews/${reviewId}`);
    
    return {
      ok: true,
      message: "ลบรีวิวสำเร็จ"
    };
  } catch (error) {
    console.error("deleteAdminReview error:", error);
    
    if (error.response?.status === 401) {
      return { ok: false, message: "ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบใหม่" };
    }
    if (error.response?.status === 403) {
      return { ok: false, message: "เฉพาะ Admin เท่านั้นที่สามารถลบรีวิวได้" };
    }
    if (error.response?.status === 404) {
      return { ok: false, message: "ไม่พบรีวิวที่ต้องการลบ" };
    }
    
    return {
      ok: false,
      message: error.response?.data?.message || error.message || "เกิดข้อผิดพลาดในการลบรีวิว"
    };
  }
}
