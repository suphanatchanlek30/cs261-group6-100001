// services/hostlocationService.js

import axios from "./axiosInstance";

/** POST /hosts/locations - create draft location */
export async function createDraftLocation(payload) {
	try {
		const res = await axios.post("/hosts/locations", payload, { validateStatus: () => true });
		if (res.status === 201) return { ok: true, data: res.data };
		return { ok: false, status: res.status, message: res.data?.message || "สร้างสถานที่ล้มเหลว" };
	} catch (err) {
		return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
	}
}

/** GET /hosts/locations - get my locations (all statuses) */
export async function getMyLocations(params = {}) {
    try {
        const res = await axios.get("/hosts/locations", { params, validateStatus: () => true });
        
        if (res.status === 200) {
            // --- 💡 นี่คือส่วนที่แก้ไข ---
            // API คืนค่าเป็น Array [ ... ] แต่ Component คาดหวัง { items: [...], total: ... }
            // เราจึงต้อง "ห่อ" ข้อมูลที่ได้กลับไปให้ Component
            const items = Array.isArray(res.data) ? res.data : [];
            
            const dataObject = {
                items: items,
                // API นี้ไม่ได้ส่งการแบ่งหน้า (Pagination) มา เราจึงจำลองขึ้นมาเอง
                page: params.page || 0,
                size: params.size || 20,
                total: items.length, // ใช้จำนวน items ที่ได้เป็น total
                totalPages: 1 // API นี้ไม่มีการแบ่งหน้า จึงมีแค่ 1 หน้า
            };
            return { ok: true, data: dataObject };
            // --- สิ้นสุดส่วนที่แก้ไข ---
        }

        return { ok: false, status: res.status, message: res.data?.message || "โหลดรายการสถานที่ไม่สำเร็จ" };
    } catch (err) {
        return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
    }
}

/** GET /hosts/locations/{id} - get my location detail */
export async function getMyLocationDetail(id) {
	try {
		const res = await axios.get(`/hosts/locations/${id}`, { validateStatus: () => true });
		if (res.status === 200) return { ok: true, data: res.data };
		return { ok: false, status: res.status, message: res.data?.message || "โหลดรายละเอียดสถานที่ไม่สำเร็จ" };
	} catch (err) {
		return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
	}
}

/** PATCH /hosts/locations/{id} - update draft/rejected location */
export async function updateDraftLocation(id, payload) {
	try {
		const res = await axios.patch(`/hosts/locations/${id}`, payload, { validateStatus: () => true });
		if (res.status === 200) return { ok: true, data: res.data };
		return { ok: false, status: res.status, message: res.data?.message || "อัปเดตสถานที่ไม่สำเร็จ" };
	} catch (err) {
		return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
	}
}

/** POST /hosts/locations/{id}/submit - submit draft for review */
export async function submitForReview(id) {
	try {
		const res = await axios.post(`/hosts/locations/${id}/submit`, {}, { validateStatus: () => true });
		if (res.status === 200) return { ok: true, data: res.data };
		return { ok: false, status: res.status, message: res.data?.message || "ส่งขออนุมัติไม่สำเร็จ" };
	} catch (err) {
		return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
	}
}

/** PATCH /hosts/locations/{id} - toggle isActive when APPROVED */
export async function updateLocationActive(id, isActive) {
	try {
		const res = await axios.patch(`/hosts/locations/${id}`, { isActive }, { validateStatus: () => true });
		if (res.status === 200) return { ok: true, data: res.data, status: res.status };
		return { ok: false, status: res.status, message: res.data?.message || "สลับสถานะ Active ไม่สำเร็จ" };
	} catch (err) {
		return { ok: false, message: err?.message || "เกิดข้อผิดพลาด" };
	}
}
