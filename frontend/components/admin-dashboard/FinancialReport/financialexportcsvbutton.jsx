// components/admin-dashboard/FinancialReport/financialexportcsvbutton.jsx
"use client";

import React, { useState } from "react";
// ตรวจสอบ path นี้ให้ถูกต้อง
import { getMonthlyRevenueReport } from "../../../services/adminReport";

const ExportCsvButton = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await getMonthlyRevenueReport({ year: 2025 });
      if (res.ok) {
        const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "monthly_revenue_report_2025.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(`Export ไม่สำเร็จ: ${res.message}`);
      }
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const buttonClassName =
    "flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-slate-100 hover:-translate-y-0.5 hover:shadow-md whitespace-nowrap";

  return (
    <button
      className={buttonClassName}
      onClick={handleExport}
      disabled={isExporting}
    >
      {/* นี่คือโค้ด SVG สำหรับไอคอนดาวน์โหลดแบบใหม่
          - viewBox="0 0 24 24"
          - fill="none"
          - stroke="currentColor" เพื่อให้สีตาม text
          - strokeWidth="1.5" เพื่อให้เส้นบางลงและดูโมเดิร์นขึ้นตามรูป
          - className="h-[18px] w-[18px]" ขนาดไอคอน
      */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-[18px] w-[18px]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>

      {isExporting ? "Exporting..." : "Export CSV"}
    </button>
  );
};
export default ExportCsvButton;