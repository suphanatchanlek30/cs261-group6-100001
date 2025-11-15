"use client";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function DashboardTrendChart({ bookingTrend = [], revenueDaily = [], loading }) {
  const data = useMemo(() => buildData(bookingTrend, revenueDaily), [bookingTrend, revenueDaily]);
  return (
    <div className="p-5 rounded-xl bg-white/70 backdrop-blur shadow-sm border border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-neutral-800">Income / Booking Trend</h2>
        {loading && <span className="text-xs text-neutral-400 animate-pulse">กำลังโหลด...</span>}
      </div>
      <div className="h-80">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

function buildData(bt, rd) {
  // align by date; assume both arrays same range
  const labels = (rd.length ? rd : bt).map(p => p.date);
  const revenueMap = new Map(rd.map(p => [p.date, p.revenue]));
  const bookingMap = new Map(bt.map(p => [p.date, p.bookings]));
  return {
    labels,
    datasets: [
      {
        label: "Revenue (฿)",
        data: labels.map(d => revenueMap.get(d) || 0),
        backgroundColor: "rgba(139,92,246,0.6)",
        borderRadius: 5,
        yAxisID: "y",
      },
      {
        label: "Bookings",
        data: labels.map(d => bookingMap.get(d) || 0),
        backgroundColor: "rgba(99,102,241,0.4)",
        borderRadius: 5,
        yAxisID: "y1",
      },
    ],
  };
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  scales: {
    y: {
      position: "left",
      grid: { drawBorder: false, color: "rgba(0,0,0,0.06)" },
      ticks: { callback: v => formatShort(v) },
    },
    y1: {
      position: "right",
      grid: { drawBorder: false, display: false },
      ticks: { callback: v => v },
    },
    x: { grid: { display: false } },
  },
  plugins: {
    legend: { labels: { font: { size: 11 } } },
    tooltip: {
      callbacks: {
        label(ctx) {
          const label = ctx.dataset.label || "";
          const v = ctx.parsed.y;
          if (label.includes("Revenue")) return `${label}: ฿${v?.toLocaleString()}`;
          return `${label}: ${v}`;
        },
      },
    },
  },
};

function formatShort(v) {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
  if (v >= 1000) return (v / 1000).toFixed(1) + "K";
  return v;
}
