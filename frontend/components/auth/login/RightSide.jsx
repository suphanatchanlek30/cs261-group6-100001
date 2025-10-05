// components/auth/login/RightSide.jsx

// ส่วนขวา แสดงฟอร์ม Login
import LoginForm from "./LoginForm";

export default function RightSide() {
  return (
    <div className="w-full max-w-[520px] sm:max-w-[420px] md:max-w-[480px] ">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Sign In</h2>
        <p className="text-base text-gray-500 mt-4">ยินดีต้อนรับเข้าสู่ระบบ Nang Nai Dee</p>
      </div>
      <LoginForm />
    </div>
  );
}
