// components/auth/login/LoginForm.jsx

"use client";

// ฟอร์ม Login ที่จะเชื่อม API จริงในภายหลัง
import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: เรียก API Login ของ Backend ที่คุณทำไว้ เช่น /api/auth/login
    console.log({ email, password });
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

      {/* ปุ่ม Login */}
      <button
        type="submit"
        className="w-full bg-[#1800ad] hover:bg-[#1F0C48FF] text-white py-2 rounded-lg text-lg font-medium mt-4"
      >
        Sign In
      </button>

      {/* ลิงก์ไปสมัครสมาชิก */}
      <p className="text-center text-sm text-gray-600 mt-2">
        New account ?{" "}
        <a href="/register" className="text-[#1800ad] hover:underline">
          Register here.
        </a>
      </p>
    </form>
  );
}
