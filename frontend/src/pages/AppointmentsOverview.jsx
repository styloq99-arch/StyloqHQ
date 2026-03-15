import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const AppointmentsOverview = () => {
  return (
    <div className="overview-page app-layout">

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────── */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{ fontSize: '40px' }}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/barber-home"      className="sidebar-link"><i className="fas fa-home" /><span>Home</span></Link>
          <Link to="/barber-dashboard" className="sidebar-link"><i className="fas fa-calendar-alt" /><span>DashBoard</span></Link>
          <Link to="/message"          className="sidebar-link"><i className="fas fa-comments" /><span>Message</span></Link>
          <Link to="/barber-OwnProfile"          className="sidebar-link"><i className="fas fa-user" /><span>Profile</span></Link>
          <Link to="/postingPhotos"    className="sidebar-link"><i className="fa fa-plus" /></Link>
        </nav>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <div className="overview-main main-content">
        {/* Header */}
        <header className="overview-header">
          <img
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=900&q=60"
            alt=""
            className="overview-header-bg"
          />
          <div className="overview-header-top">
            <Link to="/barber-home" className="back-arrow">
              <i className="fas fa-chevron-left" />
            </Link>
            <div className="header-titles">
              <h1>APPOINTMENTS</h1>
              <h1>OVERVIEW</h1>
            </div>
            <img
              src="https://i.pravatar.cc/150?img=11"
              alt="Barber"
              className="overview-avatar"
            />
          </div>
        </header>

        {/* Body */}
        <div className="overview-body">
            
        </div>{/* end overview-body */}

        {/* ── MOBILE BOTTOM NAV ────────────────────────────────── */}
        <nav className="bottom-nav">
          <Link to="/barber-home"      className="nav-item"><i className="fas fa-home" /><span>Home</span></Link>
          <Link to="/barber-dashboard" className="nav-item"><i className="fas fa-calendar-alt" /><span>DashBoard</span></Link>
          <Link to="/addphoto"         className="nav-item add-circle-btn"><i className="fas fa-plus" /></Link>
          <Link to="/message"          className="nav-item"><i className="fas fa-comments" /><span>Message</span></Link>
          <Link to="/barber-OwnProfile"          className="nav-item"><i className="fas fa-user" /><span>Profile</span></Link>
        </nav>

      </div>{/* end overview-main */}
    </div>
  );
};

export default AppointmentsOverview;
