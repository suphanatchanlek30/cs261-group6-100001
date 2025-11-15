// app/frontend/app/(public)/host/revenue/page.jsx

"use client";
import HostRevenueView from "../../../../components/host-dashboard/revenue/HostRevenueView";

export default function HostRevenuePage() {
    return (
        <section className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">รายได้ของฉัน</h1>
            <p className="text-gray-600">ดูรายงานรายได้และธุรกรรมทั้งหมด</p>
            <HostRevenueView />
        </section>
    );
}