// services/hostProfileService.js
import axios from './axiosInstance';

export async function getHostProfile() {
  try {
    const res = await axios.get('/hosts/me', { validateStatus: () => true });
    if (res.status === 200) return { ok: true, data: res.data };
    return { ok: false, status: res.status, message: res.data?.message || 'โหลดโปรไฟล์ไม่สำเร็จ' };
  } catch (err) {
    return { ok: false, message: err?.message || 'เกิดข้อผิดพลาด' };
  }
}
