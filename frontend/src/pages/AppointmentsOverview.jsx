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
