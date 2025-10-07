// components/auth/register/LeftSide.jsx

import Image from 'next/image';

export default function LeftSide() {
  return (
    <div className="relative w-full h-full min-h-[360px] flex items-center justify-center text-white overflow-hidden">
      {/* background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/login-register/login-register.png"
          alt="Register hero"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority={true}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* text */}
      <div className="p-2 rounded-xl text-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-2 sm:mb-8">
          Join us
        </h1>
        <h2 className="text-5xl sm:text-xl md:text-2xl lg:text-8xl mb-4 font-nicomoji">
          Nang Nai Dee
        </h2>
      </div>
    </div>
  );
}
