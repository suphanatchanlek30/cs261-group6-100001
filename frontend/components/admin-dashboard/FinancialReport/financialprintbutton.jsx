// components/admin-dashboard/FinancialReport/financialprintbutton.jsx
"use client";

import { AiOutlinePrinter } from "react-icons/ai";

export default function FinancialPrintButton() {

    return (
        <div className="w-full flex justify-end mt-4">
            <button
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg
               text-slate-700 bg-white transition-all duration-200
               hover:bg-slate-100 hover:-translate-y-0.5 hover:shadow-md"
            >
                <AiOutlinePrinter size={18} />
                Print Report
            </button>
        </div>
    );
}