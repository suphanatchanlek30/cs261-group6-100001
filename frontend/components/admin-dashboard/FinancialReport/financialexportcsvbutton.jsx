// components/admin-dashboard/FinancialReport/financialexportcsvbutton.jsx
import React from 'react';

const ExportCsvButton = ({ onClick }) => {

  const buttonStyle = {
    display: 'inline-flex', 
    alignItems: 'center',    
    gap: '8px',             
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '16px',
    fontWeight: 500,
    color: '#000',          
    backgroundColor: '#fff', 
    border: '2px solid #000', 
    borderRadius: '8px',    
    padding: '10px 16px',   
    cursor: 'pointer',     
    whiteSpace: 'nowrap',   
  };


  const iconStyle = {
    width: '20px',
    height: '20px',
    strokeWidth: '2.5', 
  };

  return (
    <button style={buttonStyle} onClick={onClick}>
      <svg
        style={iconStyle}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >

        <path d="M12 4v12m-4-4 4 4 4-4" />
 
        <path d="M4 20h16" />
      </svg>
      <span>Export CSV</span>
    </button>
  );
};

export default ExportCsvButton;