// components/auth/login/LoginForm.jsx

"use client";

import { loginservice } from "@/services/authService";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { setToken } from "@/utils/authClient";

export default function LoginForm({ showRegisterLink = true }) {
  const router = useRouter();
  const search = useSearchParams();
  const nextPath = search.get("next") || "/home"; // กลับไป path เดิมหลัง login
  const [okMsg, setOkMsg] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setOkMsg("");

    try {
      const res = await loginservice({ email, password });
      if (!res.ok) {
        setError(res.message || "เข้าสู่ระบบล้มเหลว");
        return;
      }

      // เก็บ token (ถ้าคุณยังใช้ localStorage)
      if (res.token) {
        localStorage.setItem("token", res.token);
      }

      // ดึง token จาก response ตามที่ backend ส่งมา
      const token = res.token || res.accessToken || res.data?.token || res.data?.accessToken;
      if (token) {
        setToken(token); // trigger "auth-changed" ให้ Navbar อัปเดต
      }

      // ไปหน้า home
      setOkMsg("เข้าสู่ระบบสำเร็จ! กำลังพาไปหน้าหลัก...");
      // ไปหน้า login (อาจพก email ไปเติมในฟอร์ม)
      setTimeout(() => router.replace(nextPath), 700);

    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ช่องกรอก Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          E-mail address
        </label>
        <input
          type="email"
          className="w-full mt-1 p-2 border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* ช่องกรอก Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          className="w-full mt-1 p-2 border-1 border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* ลืมรหัสผ่าน */}
        {/* <div className="text-right mt-1">
          <a href="#" className="text-sm text-[#1800ad] hover:underline">
            Lost your password?
          </a>
        </div> */}
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}
      {/* Ok message */}
      {okMsg && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-2">
          {okMsg}
        </div>
      )}

      {/* ปุ่ม Login */}
      <button
        type="submit"
        className="w-full bg-[#1800ad] hover:bg-[#1F0C48FF] text-white py-2 rounded-lg text-lg font-medium mt-4"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      {/* ลิงก์ไปสมัครสมาชิก (โชว์เฉพาะถ้าเปิดใช้งาน) */}
      {showRegisterLink && (
        <p className="text-center text-sm text-gray-600 mt-2">
          New account?{" "}
          <a href="/register" className="text-[#1800ad] hover:underline">
            Register here.
          </a>
        </p>
      )}
    </form>
  );
}
