// components/admin-dashboard/FinancialReport/financialprintbutton.jsx
"use client";

import { AiOutlinePrinter } from "react-icons/ai";
import { useState } from "react";
import { getUsageReport } from "../../../services/adminReport";
import { renderReportHtml } from "./FinancialReportTemplate";

function formatNumber(n) {
    return typeof n === 'number' ? n.toLocaleString() : n ?? '-';
}

function formatDateRange(from, to) {
    if (!from && !to) return 'Last 30 days';
    return `${from || '-'} → ${to || '-'}`;
}

export default function FinancialPrintButton() {
        const [loading, setLoading] = useState(false);

        const handlePrint = async () => {
                setLoading(true);
                try {
                        // Fetch default 30-day report (no params)
                        const resp = await getUsageReport();
                        if (!resp.ok) throw new Error(resp.message || 'โหลดรายงานไม่สำเร็จ');

                        const html = renderReportHtml(resp.data, 'Usage Report');

                        const w = window.open('', '_blank');
                        if (!w) {
                                alert('Unable to open print window. Please allow popups.');
                                setLoading(false);
                                return;
                        }
                        w.document.open();
                        w.document.write(html);
                        w.document.close();
                        // Wait a bit for resources / rendering then call print
                        setTimeout(() => {
                                w.focus();
                                w.print();
                        }, 500);
                } catch (err) {
                        console.error('Print report error', err);
                        alert('Failed to fetch report: ' + (err?.message || err));
                } finally {
                        setLoading(false);
                }
        };

    return (
        
            <button
                onClick={handlePrint}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg
               text-slate-700 bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
               hover:bg-slate-100 hover:-translate-y-0.5 hover:shadow-md"
            >
                <AiOutlinePrinter size={18} />
                {loading ? 'Preparing...' : 'Print Report'}
            </button>
        
    );
}