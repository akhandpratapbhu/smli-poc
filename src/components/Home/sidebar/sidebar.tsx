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
      <NavLink className={({ isActive }) => isActive ? "static-link active" : "nav-link"} style={{ textDecoration: "none" }} to="/welcomepage">Dashboard</NavLink>

      <div className={`menu-group ${isBestTimeOpen ? 'active' : ''}`}>
        <NavLink className={({ isActive }) => isActive ? "static-link active" : "static-link"} to="/">Masters Management</NavLink>
        <NavLink className={({ isActive }) => isActive ? "static-link active" : "static-link"} to="/AddFormDataList">Add Master Data</NavLink>
      </div>

    </div>
  );
};

export default Sidebar;
