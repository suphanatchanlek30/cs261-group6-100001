// components/admin-dashboard/FinancialReport/financialcontent.jsx
"use client";

import { HiCalendarDays } from "react-icons/hi2";
import { FaSackDollar } from "react-icons/fa6";
export default function FinancialReportContent() {
    const totalBookings = 23;
    const totalIncome = 3450;

    const StatCard = ({ icon, value, label }) => (
        <div className="flex flex-1 min-w-[220px] items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E4FF] text-[#7C3AED]">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-xl font-semibold text-slate-900">{value}</span>
                <span className="text-sm text-slate-900">{label}</span>
            </div>
        </div>
    );

    return (
        <section className="grid gap-4 md:grid-cols-3 -mt-4">
            <StatCard
                icon={<HiCalendarDays size={20} />}
                value={totalBookings}
                label="Total Bookings"
            />
            <StatCard
                icon={<FaSackDollar size={20} />}
                value={`฿${totalIncome.toLocaleString()}`}
                label="Total Income"
            />
        </section>
    );
}
