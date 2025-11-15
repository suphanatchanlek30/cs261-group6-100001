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

export default function RevenueChart({ points = [], loading }) {
  const data = useMemo(() => buildData(points), [points]);
  return (
    <div className="p-4 rounded-xl bg-white/70 backdrop-blur border border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-neutral-700">กราฟรายได้</h3>
        {loading && <span className="text-xs text-neutral-400 animate-pulse">กำลังโหลด...</span>}
      </div>
      <div className="h-72">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

function buildData(list) {
  const labels = list.map(p => p.date);
  return {
    labels,
    datasets: [
      {
        label: "รายได้ (฿)",
        data: list.map(p => p.totalRevenue),
        backgroundColor: "rgba(139,92,246,0.6)",
        borderRadius: 6,
        yAxisID: "y",
      },
      {
        label: "การจอง",
        data: list.map(p => p.totalBookings),
        backgroundColor: "rgba(99,102,241,0.4)",
        borderRadius: 6,
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
      grid: { drawBorder: false, color: "rgba(0,0,0,0.04)" },
      ticks: { callback: (v) => formatShort(v) },
    },
    y1: {
      position: "right",
      grid: { drawBorder: false, display: false },
      ticks: { callback: (v) => v },
    },
    x: {
      grid: { display: false },
    },
  },
  plugins: {
    legend: { labels: { font: { size: 11 } } },
    tooltip: {
      callbacks: {
        label(ctx) {
          const label = ctx.dataset.label || "";
          const v = ctx.parsed.y;
          if (label.includes("รายได้")) return `${label}: ฿${v?.toLocaleString()}`;
          return `${label}: ${v}`;
        },
      },
    },
  },
};

function formatShort(v) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(1) + "K";
  return v;
}
