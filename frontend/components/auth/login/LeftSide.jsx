// components/auth/login/LeftSide.jsx

import Image from 'next/image';

// ส่วนซ้าย แสดงรูปภาพ + ข้อความตอนรับ
export default function LeftSide() {
    return (
        <div className="relative w-full h-full min-h-[360px] flex items-center justify-center text-white overflow-hidden">
            {/* Image background */}
            <div className="absolute inset-0 -z-10">
                <Image 
                    src="/login-register/login-register.png" 
                    alt="Login hero" 
                    fill 
                    style={{ objectFit: 'cover', objectPosition: 'center' }} 
                    priority={true} 
                />
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Text */}
            <div className="p-2 rounded-xl text-center">
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-2 sm:mb-8">Welcome to</h1>
                <h2 className="text-5xl sm:text-xl md:text-2xl lg:text-8xl mb-4 font-nicomoji">Nang Nai Dee</h2>
                {/* <p className="text-base sm:text-lg">อ่านหนังสือสบาย จองที่นั่งง่าย</p> */}
            </div>
        </div>
    );
}
