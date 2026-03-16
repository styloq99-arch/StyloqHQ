import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════ */
const BARBER = {
  name: 'Mr. Perera',
  avatar: 'https://i.pravatar.cc/150?img=11',
  rating: 4.0,
  reviewCount: '1.2K',
};

/* ═══════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════ */
export default function BarberDashboard() {

  return (
    <div className="db-root">

     {/* --- DESKTOP SIDEBAR --- */}
          <aside className="desktop-sidebar">
            <div className="sidebar-logo">
              <h1 className="brand-title" style={{fontSize : '40px'}}>StyloQ</h1>
            </div>
            <nav className="sidebar-nav">
              <Link to="/barber-home" className="sidebar-link">
                <i className="fas fa-home"></i> <span>Home</span>
              </Link>
              <Link to="/barber-dashboard" className="sidebar-link active">
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

      {/* ═══ MAIN ═══ */}
      <div className="db-main">
        {/* HEADER */}
        <header className="db-header">
          <Link to="/barber-home" className="db-back-btn"><i className="fas fa-chevron-left"></i></Link>
          <h2 className="db-header-title">DASHBOARD</h2>
          <img src={BARBER.avatar} alt="Profile" className="db-header-avatar" />
        </header>

      </div>{/* end main */}

      
      {/* --- MOBILE BOTTOM NAV --- */}
            <nav className="bottom-nav">
              <Link to="/barber-home" className="nav-item">
                <i className="fas fa-home"></i>
                <span>Home</span>
              </Link>
              <Link to="/barber-dashboard" className="nav-item active">
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