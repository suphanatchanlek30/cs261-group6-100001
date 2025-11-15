// app/frontend/app/(public)/host/revenue/page.jsx

"use client";
import HostRevenueView from "../../../../components/host-dashboard/revenue/HostRevenueView";

export default function HostRevenuePage() {
    return (
        <main className="max-w-7xl mx-auto px-4 py-6">
            <section className="mb-6">
                <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">รายได้ของฉัน</h1>
                <p className="mt-2 text-sm text-neutral-600">ดูรายงานรายได้และธุรกรรมทั้งหมด</p>
            </section>
            <HostRevenueView />
        </main>
    );
}