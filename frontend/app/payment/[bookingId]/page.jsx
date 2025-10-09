"use client";
import { useState } from "react";
import { FiMapPin, FiUsers, FiVolumeX, FiWifi, FiClock } from "react-icons/fi";



export default function PaymentPage() {
    const [showQR, setShowQR] = useState(false);

    // ข้อมูลจองโต๊ะ (ตัวอย่าง)
    const booking = {
        name: "The Meal Co-Op",
        table: "T-06 - Table 6",
        image: "https://res.cloudinary.com/dqo72maxa/image/upload/v1759995103/ashley-byrd-p1zbVPGjLdg-unsplash_2_zngdrm.png",
        address: "Samyan Mitrtown, 2nd Floor",
        date: "09/06/2568",
        time: "09:00-12:00(3 hrs)",
        total: 210,
        rating: 4.5,
        reviews: 584,
        status: "HOLD",
    };

    return (
        <main className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-bold text-black-700 mb-6">Payment</h1>

            {/* รายละเอียดการ์ด */}
            <div className="flex flex-col md:flex-row bg-white shadow-md rounded-2xl p-4 md:p-6 items-center justify-between">
                {/* รูป */}
                <img
                    src={booking.image}
                    alt={booking.name}
                    className="w-full md:w-40 h-28 object-cover rounded-lg"
                />

                {/* เนื้อหา */}
                <div className="flex-1 md:px-5 mt-3 md:mt-0">
                    {/* สถานะ */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-yellow-400 text-xs font-semibold px-2 py-1 rounded-full">
                            {booking.status}
                        </span>

                        <div className="flex items-center text-yellow-400 text-sm">
                            {"★".repeat(Math.floor(booking.rating))}
                            <span className="text-gray-300">
                                {"★".repeat(5 - Math.floor(booking.rating))}
                            </span>
                            <span className="text-gray-500 text-xs ml-1">
                                ({booking.reviews} reviews)
                            </span>
                        </div>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        {booking.name}{" "}
                        <span className="bg-purple-100 text-purple-700 font-bold text-sm px-3 py-1 rounded-lg shadow-sm">
                            {booking.table}
                        </span>
                    </h2>

                    <div className="text-sm text-gray-600 space-y-1 mt-1">
                        <p className="flex items-center gap-2">
                            <FiMapPin className="text-gray-600" />
                            {booking.address} |<FiUsers className="text-gray-600" /> 2
                            | <FiVolumeX className="text-gray-600" /> | <FiWifi className="text-gray-600" />
                        </p>

                        <p className="flex items-center gap-2">
                            Booking Date: {booking.date} |<FiClock className="text-gray-600" />
                            {booking.time}
                        </p>
                    </div>

                    <p className="text-sm text-purple-600 font-semibold mt-1">
                        Total {booking.total} Baht
                    </p>
                </div>

                {/* ปุ่มสร้าง QR code */}
                <div className="mt-4 flex justify-end w-full md:mt-0 md:w-auto">
                    <button
                        onClick={() => setShowQR(true)}
                        className="bg-[#9747FF] hover:bg-[#6750A4] text-white text-sm px-5 py-2 rounded-lg"
                    >
                        Create a payment QR code
                    </button>
                </div>
            </div>
        </main>
    );
}
