import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
import './Sidebar.css';
import { NavLink } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [isBestTimeOpen, setIsBestTimeOpen] = useState<boolean>(false);

  const toggleSpareModule = () => {
    setIsBestTimeOpen(prev => !prev);
  };

  return (
    <div className="sidebar">
      <NavLink className={({ isActive }) => isActive ? "static-link active" : "nav-link"} style={{ textDecoration: "none"}} to="/welcomepage">Dashboard</NavLink>

      <div className={`menu-group ${isBestTimeOpen ? 'active' : ''}`}>
      <NavLink className={({ isActive }) => isActive ? "static-link active" : "static-link"} to="/">Master</NavLink>
      <NavLink className={({ isActive }) => isActive ? "static-link active" : "static-link"} to="/AddFormDataList">Add Master Data</NavLink>
        <button className='linkClass' onClick={toggleSpareModule}>
          Spare {isBestTimeOpen ? '▾' : '▸'}
        </button>
        {isBestTimeOpen && (
          <div className="submenu">
            <NavLink style={{padding : "5px"}} className={({ isActive }) => isActive ? "static-link active" : "static-link"} to="/create-mrr">Create MRR</NavLink>
            <NavLink style={{padding : "5px"}} className={({ isActive }) => isActive ? "static-link active" : "static-link"} to="/place-order">Place Order</NavLink>
            <NavLink style={{padding : "5px"}} className={({ isActive }) => isActive ? "static-link active" : "static-link"} to="/allparts">Sale Invoice</NavLink>
            <NavLink style={{padding : "5px"}} className={({ isActive }) => isActive ? "static-link active" : "static-link"} to="/mis">MIS</NavLink>
          </div>
        )}
      </div>      
      <NavLink className={({ isActive }) => isActive ? "static-link active" : "static-link"} to="/analytics">Analytics</NavLink>
      <NavLink className={({ isActive }) => isActive ? "static-link active" : "static-link"} to="/reports">Reports</NavLink>
      <NavLink className={({ isActive }) => isActive ? "static-link active" : "static-link"} to="/settings">Settings</NavLink>
    </div>
  );
};

export default Sidebar;
