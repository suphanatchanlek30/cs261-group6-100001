"use client";
import HostFinancialDashboardView from "../../../../components/host-dashboard/financialreport/HostFinancialDashboardView";

export default function HostPaymentsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Financial Report</h1>
      <p className="text-gray-600">ดูรายงานสรุปการเงินและแนวโน้มการจอง</p>
      <HostFinancialDashboardView />
    </section>
  );
}