import React, { useState, useEffect } from 'react';
import { 
  FiUsers, FiBriefcase, FiMapPin, FiCalendar, FiStar, 
  FiCreditCard, FiList, FiTrendingUp, FiSearch, FiEye 
} from 'react-icons/fi';
import './App.css';

const mockData = [
  { id: 'ab2498b79-541c', user: 'ananya05', location: 'The Meet Co-Op', amount: 210, date: '01/11/2025', status: 'PENDING' },
  { id: 'ad2498b79-541c', user: 'ananya05', location: 'The Meet Co-Op', amount: 210, date: '01/11/2025', status: 'SUCCESS' },
  { id: 'af2498b79-541c', user: 'ananya05', location: 'The Meet Co-Op', amount: 210, date: '01/11/2025', status: 'FAILED' },
  { id: 'ag2498b79-541c', user: 'ananya05', location: 'The Meet Co-Op', amount: 210, date: '01/11/2025', status: 'PENDING' },
];

function Sidebar() {
  const menuItems = [
    { icon: <FiUsers />, name: 'Manage Users' },
    { icon: <FiBriefcase />, name: 'Manage Host' },
    { icon: <FiMapPin />, name: 'Manage Location' },
    { icon: <FiCalendar />, name: 'Manage Booking' },
    { icon: <FiStar />, name: 'Manage Review' },
    { icon: <FiCreditCard />, name: 'Payments' },
    { icon: <FiList />, name: 'Transaction', active: true },
    { icon: <FiTrendingUp />, name: 'Financial Report' },
  ];

  return (
    <nav className="sidebar">
      <ul>
        {menuItems.map((item) => (
          <li key={item.name} className={item.active ? 'active' : ''}>
            <a href="#">
              {item.icon}
              <span>{item.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}


function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // จำลองการดึงข้อมูลจาก Database เมื่อคอมโพเนนต์โหลด
  useEffect(() => {
    setLoading(true);
    // ใช้ setTimeout เพื่อจำลองเวลาที่ใช้ในการ fetch ข้อมูล
    setTimeout(() => {
      setTransactions(mockData);
      setLoading(false);
    }, 1000); // 1 วินาที
  }, []); // [] หมายถึงให้ทำงานแค่ครั้งเดียวตอนโหลด

  // กรองข้อมูลตามการค้นหา
  const filteredTransactions = transactions.filter(t =>
    t.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ฟังก์ชันช่วยสำหรับเปลี่ยนสี Status
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'success': return 'status-success';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return '';
    }
  };

  return (
    <main className="main-content">
      <h1>Transaction List</h1>
      <p className="subtitle">รายการธุรกรรมทั้งหมด</p>

      <div className="transaction-box">
        <div className="box-header">
          <h2>Transaction</h2>
          <div className="search-bar">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by name or keyword"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Location</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
<tbody>
              {loading ? (
                null 
              ) : (
                filteredTransactions.map((tx) => (
                  ...
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <TransactionList />
    </div>
  );
}

export default App;