// components/auth/login/LoginSection.jsx

import LeftSide from "./LeftSide";
import RightSide from "./RightSide";


// รวม layout ซ้าย-ขวา (LeftSide + RightSide)
export default function LoginSection() {
    return (

        <div className="flex flex-col lg:flex-row min-h-screen">
            {/* ด้านซ้าย */}
                    <div className="w-full lg:w-1/2">
                <LeftSide />
            </div>

            {/* ด้านขวา */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white ">
                <RightSide />
            </div>
        </div>
    );
}