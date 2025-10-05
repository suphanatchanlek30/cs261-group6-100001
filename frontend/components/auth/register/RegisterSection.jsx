// components/auth/register/RegisterSection.jsx

import LeftSide from "./LeftSide";
import RightSide from "./RightSide";

// รวม layout ซ้าย-ขวา
export default function RegisterSection() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* ซ้าย */}
      <div className="w-full lg:w-1/2">
        <LeftSide />
      </div>

      {/* ขวา */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <RightSide />
      </div>
    </div>
  );
}
