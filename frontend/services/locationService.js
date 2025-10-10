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
