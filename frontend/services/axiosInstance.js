// services/axiosInstance.js

import axios from 'axios';

const axiosInstance = axios.create({
// baseURL: environment.BaseUrl,
  baseURL: process.env.NEXT_PUBLIC_URL, // Replace with your API base URL
  // withCredentials: true,
    headers: {
    'Content-Type': 'application/json', 
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // เฝ้าระวังการเข้าถึง window ใน SSR
    if (typeof window !== "undefined") {
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        // ไปหน้า login พร้อมส่ง next=path ปัจจุบันไว้ (optional)
        const next = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?next=${next}`;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;