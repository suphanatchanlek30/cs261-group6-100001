//javascript:Transaction Page:frontend/app/(public)/admin/transaction/page.jsx
// frontend/app/(public)/admin/transaction/page.jsx

import React from 'react';
// Import TransactionList จาก Path ที่ถูกต้อง
import Transaction from '@/components/payment/Transaction.jsx'; 

export default function AdminTransactionPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <section className="space-y-4">
        {/* Page Header */}
        <h1 className="text-3xl font-bold text-gray-800">Transaction List</h1>
        <p className="text-gray-600">รายการธุรกรรมทั้งหมดที่นี่</p>
        
        {/* Load the Transaction List Component */}
        <Transaction /> 

        {/* [TODO] Footer/Notes */}
        <div className="text-sm text-blue-500 bg-blue-50 p-3 rounded-lg mt-8">
          [TODO: พัฒนาการค้นหา + ฟิลเตอร์ข้อมูล + Modal แสดงรายละเอียดเล็กน้อย]
        </div>
      </section>
    </div>
  );
}
