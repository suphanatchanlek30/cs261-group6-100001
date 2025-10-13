// app/(public)/admin/payments/page.jsx

import AdminPaymentTable from "@/components/admin-dashboard/payment/AdminPaymentTable";

export default function AdminPaymentsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
      <p className="text-gray-600">ตรวจสอบสลิปและอัปเดตสถานะการชำระเงินของคำสั่งจองได้จากหน้านี้</p>
      {/* TODO: ตาราง payments + ดูสลิป + เปลี่ยนสถานะ */}
      <AdminPaymentTable />
    </section>
  );
}
