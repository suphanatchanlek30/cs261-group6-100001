// components/admin-dashboard/FinancialReport/financialincomereport.jsx
"use client";

import React, { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import {
  fetchFinanceSummary,      // ถ้าจะใช้ซ้ำภายหลังได้
  fetchFinanceDashboard,    // ใช้สำหรับ view=year
} from "../../../services/adminFinanceReportService";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// summary.groupBy = MONTH
function buildMonthChartData(summary) {
  if (!summary || !Array.isArray(summary.buckets)) return null;

  const revenueByMonth = new Array(12).fill(0);

  summary.buckets.forEach((bucket) => {
    if (!bucket.periodStart) return;
    const monthIndex = parseInt(bucket.periodStart.substring(5, 7), 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      revenueByMonth[monthIndex] = bucket.revenue ?? 0;
    }
  });

  return {
    labels: monthLabels,
    datasets: [
      {
        label: "Total Revenue",
        data: revenueByMonth,
        backgroundColor: "#8B5CF6",
        hoverBackgroundColor: "#8B5CF6",
      },
    ],
  };
}

function buildYearChartData(dashboard) {
  if (!dashboard || !Array.isArray(dashboard.years)) return null;

  const labels = dashboard.years.map((y) => String(y.year));
  const incomes = dashboard.years.map((y) => y.income ?? 0);

  return {
    labels,
    datasets: [
      {
        label: "Total Revenue",
        data: incomes,
        backgroundColor: "#8B5CF6",
        hoverBackgroundColor: "#8B5CF6",
      },
    ],
  };
}

export default function IncomeReportChart({ summary }) {
  const [chartView, setChartView] = useState("month");
  const [yearDashboard, setYearDashboard] = useState(null);
  const [loadingYear, setLoadingYear] = useState(false);
  const [error, setError] = useState("");

  const monthChartData = useMemo(
    () => buildMonthChartData(summary),
    [summary]
  );
  const yearChartData = useMemo(
    () => buildYearChartData(yearDashboard),
    [yearDashboard]
  );

  const chartData = chartView === "year" ? yearChartData : monthChartData;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: { bar: { borderRadius: 4, borderSkipped: "bottom" } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback(value) {
            if (value === 0) return "0";
            return value / 1000 + "k";
          },
        },
        grid: { drawTicks: false, borderDash: [2, 3] },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        border: { display: false },
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        align: "center",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          boxWidth: 8,
        },
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        backgroundColor: "#f2e7feff",
        titleColor: "#333333",
        bodyColor: "#333333",
        padding: 10,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label(context) {
            let label = context.dataset.label || "";
            if (label) label += ": ";
            if (context.parsed.y != null) {
              label += "฿" + context.parsed.y.toLocaleString();
            }
            return label;
          },
        },
      },
    },
  };

  const handleChangeView = async (view) => {
    setChartView(view);

    if (view === "year" && !yearDashboard) {
      setLoadingYear(true);
      setError("");

      const res = await fetchFinanceDashboard({ view: "year" });

      if (res.ok) {
        setYearDashboard(res.data);
      } else {
        setError(res.message || "ไม่สามารถโหลดข้อมูลรายปีได้");
      }

      setLoadingYear(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
      {/* Header + ปุ่มสลับ month/year */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Income Report</h2>
        <div className="border border-[#E9D5FF] rounded-md flex overflow-hidden">
          <button
            onClick={() => handleChangeView("month")}
            className={`px-3 py-1 text-sm cursor-pointer transition-colors ${
              chartView === "month"
                ? "bg-[#E9D5FF] font-semibold text-violet-700"
                : "bg-transparent text-slate-700"
            }`}
          >
            month
          </button>
          <button
            onClick={() => handleChangeView("year")}
            className={`px-3 py-1 text-sm cursor-pointer transition-colors ${
              chartView === "year"
                ? "bg-[#E9D5FF] font-semibold text-violet-700"
                : "bg-transparent text-slate-700"
            }`}
          >
            year
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div style={{ height: "400px" }}>
        {!chartData ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            {chartView === "year"
              ? loadingYear
                ? "Loading year data..."
                : "No year data"
              : "No month data"}
          </div>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
