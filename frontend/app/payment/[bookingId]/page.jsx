"use client";
import { useState } from "react";
import { FiMapPin, FiUsers, FiVolumeX, FiWifi, FiClock } from "react-icons/fi";



export default function PaymentPage() {

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
            <h1 className="text-2xl font-bold text-purple-700 mb-6">Payment</h1>
        </main>
    );
}
