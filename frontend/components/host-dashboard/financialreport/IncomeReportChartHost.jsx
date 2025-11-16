"use client";
import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Month labels for aggregation
const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function IncomeReportChartHost({ view = 'month', setView = () => {}, cards = {}, bookingTrend = [], revenueDaily = [], loading }) {

  const { labels, revenueData } = useMemo(() => buildAggregated(view, revenueDaily, cards), [view, revenueDaily, cards]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: revenueData,
        backgroundColor: '#8B5CF6',
        hoverBackgroundColor: '#7C3AED',
        borderRadius: 4,
        borderSkipped: 'bottom'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label(ctx) {
            const label = ctx.dataset.label || '';
            const v = ctx.parsed.y;
            return `${label}: ฿${v.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        afterBuildTicks: (axis) => {
          axis.ticks = [];
          const maxValue = Math.max(...revenueData, 0);
          const stepSize = view === 'year' ? Math.max(1, Math.ceil(maxValue / 5)) : Math.max(1, Math.ceil(maxValue / 5));
          axis.ticks = [];
          for (let v=0; v<=maxValue; v+=stepSize){
            axis.ticks.push({ value: v, label: v===0? '0' : v.toLocaleString() });
          }
        },
        grid: { drawTicks: false, borderDash: [2,3] },
        border: { display: false },
      },
      x: { grid: { display: false }, border: { display: false } }
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Income Report</h2>
        <div className="border border-[#E9D5FF] rounded-md flex overflow-hidden">
          <button onClick={() => setView('month')} className={`px-3 py-1 text-sm cursor-pointer transition-colors ${view==='month'? 'bg-[#E9D5FF] font-semibold text-violet-700':'bg-transparent text-slate-700'}`}>month</button>
          <button onClick={() => setView('year')} className={`px-3 py-1 text-sm cursor-pointer transition-colors ${view==='year'? 'bg-[#E9D5FF] font-semibold text-violet-700':'bg-transparent text-slate-700'}`}>year</button>
        </div>
      </div>
      <div style={{ height: '400px' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm text-neutral-500">กำลังโหลด...</div>
        ) : revenueData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-neutral-400">ไม่มีข้อมูล</div>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}

function buildAggregated(view, revenueDaily, cards){
  const today = new Date();
  const currentMonthIndex = today.getMonth();
  const currentYear = today.getFullYear();
  // Month view: always 12 months
  if (view === 'month') {
    const monthTotals = new Array(12).fill(0);
    revenueDaily.forEach(r => {
      const d = new Date(r.date);
      const m = d.getMonth();
      monthTotals[m] += Number(r.revenue || 0);
    });
    if (monthTotals.every(v => v === 0) && cards.todayIncome) {
      monthTotals[currentMonthIndex] = Number(cards.todayIncome);
    }
    return { labels: monthLabels, revenueData: monthTotals };
  }
  // Year view: aggregate by year present in data, else show current year if todayIncome exists
  const yearMap = new Map();
  revenueDaily.forEach(r => {
    const d = new Date(r.date);
    const y = d.getFullYear();
    yearMap.set(y, (yearMap.get(y) || 0) + Number(r.revenue || 0));
  });
  if (yearMap.size === 0 && cards.todayIncome) {
    yearMap.set(currentYear, Number(cards.todayIncome));
  } else if (yearMap.size > 0) {
    // Inject todayIncome into current year if all revenues zero
    const hasAnyRevenue = Array.from(yearMap.values()).some(v => v > 0);
    if (!hasAnyRevenue && cards.todayIncome) {
      yearMap.set(currentYear, Number(cards.todayIncome));
    }
  }
  const yearLabels = Array.from(yearMap.keys()).map(String);
  const yearData = yearLabels.map(y => yearMap.get(Number(y)) || 0);
  return { labels: yearLabels, revenueData: yearData };
}
