// components/auth/admin/AdminLoginForm.jsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginservice } from "@/services/authService";
import { setToken } from "@/utils/authClient";
// optional: ถ้าอยาก decode JWT เพื่อตรวจ role จาก payload
// import jwtDecode from "jwt-decode";

export default function AdminLoginForm({
  adminRedirect = "/admin/dashboard",
  fallbackUserRedirect = "/admin",
}) {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next"); // รองรับ /admin?next=/admin/dashboard

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginservice({ email, password });
      if (!res.ok) {
        setError(res.message || "เข้าสู่ระบบล้มเหลว");
        return;
      }

      if (res.token) setToken(res.token);

      // ดึง roles จาก response; ถ้าไม่มีค่อยลอง decode token (เปิดใช้ถ้าจำเป็น)
      let roles = res.roles || [];
      // if ((!roles || roles.length === 0) && res.token) {
      //   const payload = jwtDecode(res.token);
      //   roles = payload?.roles || payload?.authorities || [];
      // }

      const isAdmin = (roles || []).includes("ADMIN");

      // ลำดับการ redirect
      router.replace(next || (isAdmin ? adminRedirect : fallbackUserRedirect));
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">E-mail</label>
        <input
          type="email"
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
          placeholder="example@email.com"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
            placeholder="Your password"
          autoComplete="current-password"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1800ad] hover:bg-[#1F0C48] text-white py-2 rounded-lg text-lg font-medium"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
