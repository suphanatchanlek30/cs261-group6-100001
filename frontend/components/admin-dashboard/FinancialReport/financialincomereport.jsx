// components/admin-dashboard/FinancialReport/financialincomereport.jsx
"use client";

import React, { useState } from 'react';
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

// 1. ลงทะเบียน Component ที่จำเป็นสำหรับ Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- 2. ข้อมูลจำลอง (Data) ---

// ข้อมูลสำหรับมุมมองรายปี (Year View)
const yearLabels = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
const yearData = {
    labels: yearLabels,
    datasets: [
        {
            label: 'QQ Co-Op',
            data: [25000, 43000, 28000, 8000, 15000, 20000, 10000, 32000, 55000, 37000], 
            backgroundColor: '#8B5CF6', 
            hoverBackgroundColor: '#8B5CF6',
        },
        {
            label: 'The Meal Co-Op',
            data: [22000, 53000, 10000, 10500, 10000, 10000, 25000, 20000, 48000, 41000], 
            backgroundColor: '#EF4444', 
            hoverBackgroundColor: '#EF4444',
        },
    ],
};

// ข้อมูลสำหรับมุมมองรายเดือน (Month View)
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthData = {
    labels: monthLabels,
    datasets: [
        {
            label: 'QQ Co-Op',
            data: [3500, 6000, 10000, 7000, 3000, 2500, 3200, 5000, 3800, 7500, 12000, 8000], 
            backgroundColor: '#8B5CF6',
            hoverBackgroundColor: '#8B5CF6',
        },
        {
            label: 'The Meal Co-Op',
            data: [3000, 5300, 11500, 3000, 2500, 3000, 3000, 3000, 5000, 5000, 10500, 9200], 
            backgroundColor: '#EF4444',
            hoverBackgroundColor: '#EF4444',
        },
    ],
};


// 3. กำหนด Options สำหรับ Bar Chart
const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false, // ตั้งเป็น false เพื่อควบคุมขนาดได้ง่ายขึ้น
  plugins: {
    legend: {
      position: 'bottom', 
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      // แสดง Tooltip ตามรูปภาพ (ตัวอย่าง 2022 และ Jul 2025)
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            // เพิ่มสัญลักษณ์ B (บาท) ข้างหน้าตัวเลข
            label += 'B' + context.parsed.y.toLocaleString();
          }
          return label;
        }
      }
    }
  }
};


// 4. Component หลัก
export default function IncomeReportChart() {
  const [chartView, setChartView] = useState('month'); // State: 'month' หรือ 'year'
  
  // เลือกข้อมูลตาม State
  const data = chartView === 'year' ? yearData : monthData;
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        elements: { bar: { borderRadius: 4, borderSkipped: 'bottom' } },
        scales: {
            y: {
                beginAtZero: true,
                max: chartView === 'year' ? 55000 : 12000,
                afterBuildTicks: (axis) => {
                    if (chartView === 'year') {
                        axis.ticks = [];
                        const customYearTicks = [0, 10000, 25000, 40000, 55000];
                        customYearTicks.forEach(tickValue => {
                            axis.ticks.push({
                                value: tickValue,
                                label: tickValue === 0 ? '0' : tickValue / 1000 + 'k'
                            });
                        });
                    }
                    if (chartView === 'month') {
                        axis.ticks = [];
                        const customMonthTicks = [0, 3000, 6000, 9000, 12000];
                         customMonthTicks.forEach(tickValue => {
                            axis.ticks.push({
                                value: tickValue,
                                label: tickValue === 0 ? '0' : tickValue / 1000 + 'k'
                            });
                        });
                    }
                },
                ticks: {},
                grid: { drawTicks: false, borderDash: [2, 3] },
                border: { display: false },
            },
            x: {
                grid: { display: false },
                border: { display: false },
            }
        },
        plugins: {
            legend: {
                position: 'bottom',
                align: 'center',
                labels:{
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    boxWidth: 8,
                },
            },
            tooltip: {enabled: true,
                mode: 'index',
                intersect: false,
                backgroundColor: '#f2e7feff', 
                titleColor: '#333333',       
                bodyColor: '#333333',        
                padding: 10,
                displayColors: true,
                usePointStyle: true,
                callbacks: { /* ... */ }}
        }
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            {/* Header และปุ่มสลับมุมมอง */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Income Report</h2>
                <div className="border border-[#E9D5FF] rounded-md flex overflow-hidden">
                    <button 
                        onClick={() => setChartView('month')} 
                        className={`px-3 py-1 text-sm cursor-pointer transition-colors ${
                            chartView === 'month' ? 'bg-[#E9D5FF] font-semibold text-violet-700' : 'bg-transparent text-slate-700'
                        }`}
                    >
                        month
                    </button>
                    <button 
                        onClick={() => setChartView('year')} 
                        className={`px-3 py-1 text-sm cursor-pointer transition-colors ${
                            chartView === 'year' ? 'bg-[#E9D5FF] font-semibold text-violet-700' : 'bg-transparent text-slate-700'
                        }`}
                    >
                        year
                    </button>
                </div>
            </div>

            {/* Bar Chart Wrapper */}
            <div style={{ height: '400px' }}>
                <Bar data={data} options={chartOptions} />
            </div>
        </div>
    );
}
