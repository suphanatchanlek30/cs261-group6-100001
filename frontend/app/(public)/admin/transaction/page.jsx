//app/(public)/admin/transaction/page.jsx
"use client";
import Transaction from "@/components/payment/Transaction";

export default function AdminTransactionPage() {
    return (
        <main>
            <section className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Transaction List</h1>
                <p className="mt-4 text-gray-600">ดูรายงการธุรกรรมได้ที่นี่ !</p>
            </section>
            <Transaction />
        </main>
    );
}
