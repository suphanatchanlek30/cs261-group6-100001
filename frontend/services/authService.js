// services/authService.js

import axios from './axiosInstance';

/**
 * Login
 * @param {{email:string, password:string}} values
 * @returns {Promise<any>}
 */
export const loginservice = async (values) => {
  try {
    const res = await axios.post('/auth/login', values);
    const data = res.data;

    // บางแบ็กเอนด์ส่ง roles เป็น ['ROLE_ADMIN'] หรือเป็น object
    const rawRoles = data?.roles ?? data?.user?.roles ?? [];
    const roles = (Array.isArray(rawRoles) ? rawRoles : [rawRoles])
      .map(r => {
        if (typeof r === 'string') return r.replace(/^ROLE_/, '');
        if (r && typeof r === 'object' && r.name) return String(r.name).replace(/^ROLE_/, '');
        return null;
      })
      .filter(Boolean);

    const token = data?.token || data?.accessToken;
    return { ok: true, data, token, roles };
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'เข้าสู่ระบบล้มเหลว';
    return { ok: false, message };
  }
};

/**
 * Register
 * @param {{email:string, password:string, fullName:string, role:'USER'|'HOST'}} values
 * @returns {Promise<any>}
 */
export const registerservice = async (values) => {
  try {
    const res = await axios.post("/auth/register", values);
    return { ok: true, data: res.data };
  } catch (error) {
    error?.response?.data?.message ||
      error?.message ||
      'ลงทะเบียนล้มเหลว';
    return { status: "fail", message };
  }
};
