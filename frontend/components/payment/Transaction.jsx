// frontend/components/admin/Transaction.jsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { getAdminTransactions } from '@/services/adminTransactionService';

export default function Transaction() {
  const [searchTerm, setSearchTerm] = useState('');

  // กรองข้อมูลตามคำค้นหา
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // initial fetch: from Jan 1 of current year to today, page=0,size=20,payStatus=APPROVED
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        const year = now.getFullYear();
        const from = `${year}-01-01`;
        const to = now.toISOString().slice(0, 10);

        const resp = await getAdminTransactions({ from, to, page: 0, size: 20, payStatus: 'APPROVED' });
        if (!resp.ok) throw new Error(resp.message || 'โหลดข้อมูลไม่สำเร็จ');
        setTransactions(resp.data.items || []);
        setTotal(resp.data.total ?? (resp.data.items || []).length);
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    const lowerCaseSearch = searchTerm.toLowerCase();

    return transactions.filter(tx => 
      (tx.bookingId || tx.paymentId || '').toLowerCase().includes(lowerCaseSearch) ||
      (tx.locationName || '').toLowerCase().includes(lowerCaseSearch) ||
      (tx.paymentStatus || '').toLowerCase().includes(lowerCaseSearch) ||
      (tx.bookingStatus || '').toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm, transactions]);
  // ฟังก์ชันสำหรับดูรายละเอียด (ตอนนี้ยังเป็น console.log)
  const handleView = (id) => {
    console.log(`[Action] Showing details for Transaction ID: ${id}`);
  };
  
  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100">
      
      {/* Search Bar / Filter Toolbar */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex justify-between items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-700">Transaction</h2>
          <div className="relative flex-grow max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or keyword"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-red-500">{error}</td>
              </tr>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <tr key={tx.paymentId || tx.bookingId} className="hover:bg-gray-50 transition duration-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="font-mono text-gray-600 text-xs">{tx.paymentId || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <span className="font-mono text-gray-600 text-xs">{tx.bookingId || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <div className="font-semibold">{tx.locationName}</div>
                    <div className="text-xs text-gray-500">Host ID: {tx.hostId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div>
                        {typeof tx.amount === 'number' ? tx.amount.toLocaleString() : String(tx.amount)} <span className="text-xs text-gray-500 font-normal">Baht</span>
                      </div>
                      {/* removed duplicate inline APPROVED badge; status is shown in the Status column */}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {(() => {
                      const s = (tx.paymentStatus || tx.bookingStatus || '').toString().toUpperCase();
                      if (!s) return <span className="text-xs text-gray-400">-</span>;
                      if (s === 'APPROVED' || s === 'SUCCESS') {
                        return (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {s}
                          </span>
                        );
                      }
                      if (s === 'PENDING') {
                        return (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {s}
                          </span>
                        );
                      }
                      if (s === 'FAILED' || s === 'REJECTED') {
                        return (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            {s}
                          </span>
                        );
                      }
                      return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{s}</span>;
                    })()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  ไม่พบรายการธุรกรรมที่ตรงกับคำค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer / Pagination */}
      <div className="p-4 sm:px-6 bg-gray-50 flex justify-between items-center text-sm text-gray-600">
        <div>
          Showing <span className="font-semibold">{filteredTransactions.length}</span> out of <span className="font-semibold">{total}</span> results
        </div>
      </div>
    </div>
  );
}