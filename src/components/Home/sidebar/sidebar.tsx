import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const [isBestTimeOpen, setIsBestTimeOpen] = useState<boolean>(false);

  const toggleSpareModule = () => {
    setIsBestTimeOpen(prev => !prev);
  };

  return (
    <div className="sidebar">
      <h2>Dashboard</h2>

      <div className={`menu-group ${isBestTimeOpen ? 'active' : ''}`}>
        <button onClick={toggleSpareModule}>
          Spare {isBestTimeOpen ? '▾' : '▸'}
        </button>
        {isBestTimeOpen && (
          <div className="submenu">
            <Link to="/create-mrr">* Create MRR</Link>
            <Link to="/place-order">* Place Order</Link>
            <Link to="/allparts">* Sale Invoice</Link>
            <Link to="/mis">* MIS</Link>
          </div>
        )}
      </div>

      <Link className="static-link" to="/analytics">Analytics</Link>
      <Link className="static-link" to="/reports">Reports</Link>
      <Link className="static-link" to="/settings">Settings</Link>
    </div>
  );
};

export default Sidebar;
