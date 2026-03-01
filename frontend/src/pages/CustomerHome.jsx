import React, { useState } from 'react';
import { Link } from 'react-router-dom';


export default function CustomerHome() {

  return (
    <div className="app-layout">

      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{ fontSize: '40px' }}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/customer-home" className="sidebar-link active"><i className="fas fa-home"></i> <span>Home</span></Link>
          <Link to="/customer-search" className="sidebar-link"><i className="fas fa-search"></i> <span>Search</span></Link>
          <Link to="/favourites" className="sidebar-link"><i className="fas fa-heart"></i> <span>Favourites</span></Link>
          <Link to="/profile" className="sidebar-link"><i className="fas fa-user"></i> <span>Profile</span></Link>
        </nav>
        <div className="sidebar-user">
          <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="User" className="user-avatar" />
          <div className="user-info">
            <p className="user-name">John Doe</p>
            <p className="user-status">Customer</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="customer-barber-header" style={{ paddingBottom: '5px' }}>
          <div className="header-top">
            <div className="mobile-brandContent">
              <h1 className="mobile-brand">StyloQ</h1>
            </div>
          </div>
        </header>

        <div className="page-body">
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <Link to="/customer-home" className="nav-item active"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/customer-search" className="nav-item"><i className="fas fa-search"></i><span>Search</span></Link>
        <Link to="/favourites" className="nav-item"><i className="fas fa-heart"></i><span>Favourites</span></Link>
        <Link to="/profile" className="nav-item"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>

    </div>
  );
}
