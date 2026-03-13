import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function BarberHomePage() {
  const appointments = [];

  return (
    <div className="app-layout barber-home-page">

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{fontSize : '40px'}}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/barber-home" className="sidebar-link active">
            <i className="fas fa-home"></i> <span>Home</span>
          </Link>
          <Link to="/barber-dashboard" className="sidebar-link">
            <i className="fas fa-calendar-alt"></i> <span>DashBoard</span>
          </Link>
          <Link to="/message" className="sidebar-link">
            <i className="fas fa-comments"></i> <span>Message</span>
          </Link>
          <Link to="/barber-OwnProfile" className="sidebar-link">
            <i className="fas fa-user"></i> <span>Profile</span>
          </Link>
          <Link to="/postingPhotos" className="sidebar-link">
            <i className="fa fa-plus"></i>
          </Link>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="main-content">

        <div className="page-body barber-home-body">

        </div>
      </div>

      {/* --- MOBILE BOTTOM NAV --- */}
      <nav className="bottom-nav">
        <Link to="/barber-home" className="nav-item active">
          <i className="fas fa-home"></i>
          <span>Home</span>
        </Link>
        <Link to="/barber-dashboard" className="nav-item">
          <i className="fas fa-calendar-alt"></i>
          <span>DashBoard</span>
        </Link>
        <Link to="/addphoto" className="nav-item add-circle-btn">
          <i className="fas fa-plus"></i>
        </Link>
        <Link to="/message" className="nav-item">
          <i className="fas fa-comments"></i>
          <span>Message</span>
        </Link>
        <Link to="/barber-OwnProfile" className="nav-item">
          <i className="fas fa-user"></i>
          <span>Profile</span>
        </Link>                  
      </nav>

    </div>
  );
}