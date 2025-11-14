// app/(public)/admin/FinancialReport/page.jsx
"use client";
import FinancialReportContent from "@/components/admin-dashboard/FinancialReport/financialcontent";

export default function AdminFinancialReportPage() {
    return (
        <main>
            <section className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Summary Financial Report</h1>
                <p className="mt-4 text-gray-600">ดูรายงานสรุปทางการเงินได้ที่นี่ !</p>
            </section>
            <FinancialReportContent />
        </main>
    );
}
