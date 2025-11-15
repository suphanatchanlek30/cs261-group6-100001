// services/adminReviewLocationsService.js
import axios from "./axiosInstance";

export async function getAdminReviewLocations({ q, hostId, page = 0, size = 10 } = {}){
  try{
    const params = {};
    if (q) params.q = q;
    if (hostId) params.hostId = hostId;
    if (page!=null) params.page = page;
    if (size!=null) params.size = size;
    const res = await axios.get("/admin/locations/reviews", { params, validateStatus: () => true });
    if (res.status === 200){
      return { ok: true, data: res.data || {} };
    }
    return { ok:false, status:res.status, message: res.data?.message || "โหลดคิวตรวจสอบไม่สำเร็จ" };
  }catch(err){
    return { ok:false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}

// Admin Review Action: PATCH /admin/locations/{id}/review
export async function decideAdminReviewLocation(id, decision, reason){
  try{
    const body = { status: decision };
    if (reason) body.reason = reason;
    const res = await axios.patch(`/admin/locations/${id}/review`, body, { validateStatus: () => true });
    if (res.status === 200){
      return { ok:true, data: res.data };
    }
    return { ok:false, status:res.status, message: res.data?.message || "อัปเดตผลการพิจารณาไม่สำเร็จ" };
  }catch(err){
    return { ok:false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}

// Admin Host Locations: GET /admin/hosts/{hostId}/locations
export async function getAdminHostLocations(hostId, { page, size } = {}){
  try{
    const params = {};
    if (page!=null) params.page = page;
    if (size!=null) params.size = size;
    const res = await axios.get(`/admin/hosts/${hostId}/locations`, { params, validateStatus: () => true });
    if (res.status === 200){
      const data = res.data;
      // Could be an array or a paginated object
      const list = Array.isArray(data) ? data : (data?.content || data?.items || []);
      return { ok:true, data: list };
    }
    return { ok:false, status:res.status, message: res.data?.message || "โหลดสถานที่ของ Host ไม่สำเร็จ" };
  } catch(err){
    return { ok:false, message: err?.message || "เกิดข้อผิดพลาด" };
  }
}
