// utils/authClient.js
const TOKEN_KEY = "token";

// อ่าน token
export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

// เซ็ต token (เรียกหลัง login สำเร็จ)
export const setToken = (token) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event("auth-changed")); // บอก navbar ให้รีเฟรชสถานะ
};

// ลบ token (เรียกตอน logout)
export const clearToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("auth-changed"));
};

// helper
export const isAuthenticated = () => !!getToken();
