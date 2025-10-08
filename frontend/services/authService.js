// services/authService.js

import axios from './axiosInstance';

/**
 * Login
 * @param {{email:string, password:string}} values
 * @returns {Promise<any>}
 */
export const loginservice = async (values) => {
  try {
    const res = await axios.post("/auth/login", values);
    const data = res.data;
    const token = data?.token || data?.accessToken;
    const roles = data?.roles || data?.user?.roles || []; // ← ดึง roles
  
    return { ok: true, data: res.data, token, roles };
  } catch (error) {
    error?.response?.data?.message ||
      error?.message ||
      'เข้าสู่ระบบล้มเหลว';
    return { status: "fail", message };
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
