// cs261-group6-100001/frontend/components/admin-dashboard/transaction/TransactionData.jsx
"use client";

import React, { useState, useMemo } from 'react';
import { FiSearch, FiEye } from 'react-icons/fi';
// **แก้ไข Import Path ให้ชี้ไปที่แหล่งข้อมูลส่วนกลางของ Admin**
import { mockData } from '@/components/admin-dashboard/transaction/mockData.js'; 

// ฟังก์ชันสำหรับกำหนดสีและไอคอนตามสถานะ
const StatusPill = ({ status }) => {
  const baseClasses = "inline-flex items-center px-3 py-1 text-xs font-semibold leading-5 rounded-full capitalize";
  let colorClasses = "";
  let icon = null;

  switch (status) {
    case 'SUCCESS':
      colorClasses = "bg-green-100 text-green-800 ring-1 ring-green-600";
      icon = <span className="text-lg mr-1">✔</span>;
      break;
    case 'PENDING':
      colorClasses = "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-600";
      icon = <span className="text-lg mr-1">ⓘ</span>;
      break;
    case 'FAILED':
      colorClasses = "bg-red-100 text-red-800 ring-1 ring-red-600";
      icon = <span className="text-lg mr-1">X</span>;
      break;
    default:
      colorClasses = "bg-gray-100 text-gray-800 ring-1 ring-gray-400";
  }

  return (
    <span className={`${baseClasses} ${colorClasses}`}>
      {icon} {status}
    </span>
  );
};

export default function TransactionList() {
  const [searchTerm, setSearchTerm] = useState('');

  // กรองข้อมูลตามคำค้นหา
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return mockData;
    const lowerCaseSearch = searchTerm.toLowerCase();
    
    return mockData.filter(tx => 
      tx.id.toLowerCase().includes(lowerCaseSearch) ||
      tx.user.toLowerCase().includes(lowerCaseSearch) ||
      tx.location.toLowerCase().includes(lowerCaseSearch) ||
      tx.status.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm]);

  // ฟังก์ชันสำหรับจำลองการดูรายละเอียด
  const handleView = (id) => {
    // ใช้ console.log แทน window.alert() ตามกฎของระบบ
    console.log(`[Action] Showing details for Transaction ID: ${id}`);
  };
  
  // Custom Alert function เนื่องจากห้ามใช้ window.alert()
  const alert = (message) => {
    console.log(`[Notification] ${message}`);
    // For now, we will just log to the console to comply with the rule.
  }

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-auto">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-auto">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-auto">Status</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-auto">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition duration-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="font-mono text-gray-600 text-xs">{tx.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold transition duration-150">{tx.user}</a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <a href="#" className="text-indigo-600 hover:text-indigo-800 transition duration-150">{tx.location}</a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                    {tx.amount.toLocaleString()} <span className="text-xs text-gray-500 font-normal">Baht</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <StatusPill status={tx.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => handleView(tx.id)}
                      className="text-blue-600 hover:text-blue-800 flex items-center justify-center p-1 rounded-md hover:bg-blue-50 transition duration-150"
                      title="View Details"
                    >
                      <FiEye className="w-5 h-5" />
                      <span className="ml-1 text-xs">View Q</span> 
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  ไม่พบรายการธุรกรรมที่ตรงกับคำค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer / Pagination (Optional, added a visual style for completeness) */}
      <div className="p-4 sm:px-6 bg-gray-50 flex justify-between items-center text-sm text-gray-600">
        <div>
          Showing <span className="font-semibold">{filteredTransactions.length}</span> out of <span className="font-semibold">{mockData.length}</span> results
        </div>
      </div>
    </div>
  );
}