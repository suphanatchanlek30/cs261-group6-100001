// components/auth/register/RegisterForm.jsx

"use client";

import { useState } from "react";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("USER");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // test
    console.log({ fullName, email, password, role });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="User One"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          E-mail address
        </label>
        <input
          type="email"
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {/* Role Selection as toggle buttons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sign up as</label>
        <div className="flex gap-3" role="tablist" aria-label="Select role">
          <button
            type="button"
            role="tab"
            aria-pressed={role === 'USER'}
            onClick={() => setRole('USER')}
            className={`px-4 py-2 rounded-lg font-medium ${
              role === 'USER'
                ? 'bg-[#1800ad] text-white shadow-md'
                : 'bg-white text-[#1800ad] border border-[#e9e2ff]'
            }`}
          >
            User
          </button>

          <button
            type="button"
            role="tab"
            aria-pressed={role === 'HOST'}
            onClick={() => setRole('HOST')}
            className={`px-4 py-2 rounded-lg font-medium ${
              role === 'HOST'
                ? 'bg-[#1800ad] text-white shadow-md'
                : 'bg-white text-[#1800ad] border border-[#e9e2ff]'
            }`}
          >
            Host
          </button>
        </div>
      </div>

      {/* ปุ่ม Register */}
      <button
        type="submit"
        className="w-full bg-[#1800ad] hover:bg-[#1F0C48FF] text-white py-2 rounded-lg text-lg font-medium mt-4"
      >
        Sign Up
      </button>

      {/* ลิงก์กลับไป Login */}
      <p className="text-center text-sm text-gray-600 mt-2">
        Already have an account ?{" "}
        <a href="/login" className="text-[#1800ad] hover:underline">
          Login here.
        </a>
      </p>
    </form>
  );
}
