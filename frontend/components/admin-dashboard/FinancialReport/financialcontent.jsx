// components/admin-dashboard/FinancialReport/financialcontent.jsx
"use client";

import { useEffect, useState } from "react";
import { HiCalendarDays, HiBuildingOffice2 } from "react-icons/hi2";
import { FaSackDollar } from "react-icons/fa6";
import IncomeReportChart from "./financialincomereport.jsx";
import FinancialPrintButton from "./financialprintbutton.jsx";
import ExportCsvButton from './financialexportcsvbutton.jsx';

import { fetchFinanceSummary } from "../../../services/adminFinanceReportService";

export default function FinancialReportContent() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      setLoading(true);
      const res = await fetchFinanceSummary({
        groupBy: "month",
        from: "2025-01-01",
      });

      if (!isMounted) return;

      if (res.ok) {
        setSummary(res.data);
        setError("");
      } else {
        setError(res.message || "ไม่สามารถโหลดรายงานการเงินได้");
      }

      setLoading(false);
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const totalBookings = summary?.totalBookings ?? 0;
  const totalIncome = summary?.totalRevenue ?? 0;
  const totalPayments = summary?.totalPayments ?? 0; // ใช้แทน Active Locations ตอนนี้

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          ไม่สามารถโหลดรายงานการเงินได้: {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3 -mt-4">
        <StatCard
          icon={<HiCalendarDays size={20} />}
          value={loading ? "…" : totalBookings.toLocaleString("en-US")}
          label="Total Bookings"
        />
        <StatCard
          icon={<FaSackDollar size={20} />}
          value={
            loading
              ? "…"
              : `฿${totalIncome.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
          }
          label="Total Income"
        />
        <StatCard
          icon={<HiBuildingOffice2 size={20} />}
          value={loading ? "…" : totalPayments.toLocaleString("en-US")}
          label="Total Payments"
        />
      </section>

      <IncomeReportChart summary={summary} />
      <div className="flex justify-end gap-x-3">
        <ExportCsvButton />
        <FinancialPrintButton />
      </div>
    </div>
  );
}