"use client";
import HostFinancialDashboardView from "../../../../components/host-dashboard/financialreport/HostFinancialDashboardView";

export default function HostPaymentsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <section className="space-y-1">
        <h1 className="text-2xl font-bold text-neutral-800">Financial Report</h1>
        <p className="text-sm text-neutral-600">ดูรายงานสรุปการเงินและแนวโน้มการจอง</p>
      </section>
      <HostFinancialDashboardView />
    </main>
  );
}