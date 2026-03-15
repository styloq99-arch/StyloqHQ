import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';


// ─── MOCK DATA ───────────────────────────────────────────────────────────────
// workingHours drives Peak Hours x-axis — comes from SignUpBarberStep6 data.
const BARBER_WORKING_HOURS = { start: 9, end: 19 }; // 9 AM – 7 PM

const WEEK_DATA = [
  { day: 'S', value: 15 },
  { day: 'M', value: 4  },
  { day: 'T', value: 5  },
  { day: 'W', value: 1  },
  { day: 'T', value: 3  },
  { day: 'F', value: 7  },
  { day: 'S', value: 10 },
];

const MONTH_DATA = [
  { day: 'W1', value: 28 },
  { day: 'W2', value: 34 },
  { day: 'W3', value: 19 },
  { day: 'W4', value: 41 },
];

const PEAK_HOURS_RAW = {
  9: 6, 10: 4, 11: 3, 12: 2, 13: 3,
  14: 5, 15: 7, 16: 9, 17: 12, 18: 5,
};

const STATS = { today: 10, total: 45, cancelled: 10, paid: 5 };

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
            {/* ── STATS ───────────────────────────────────────────── */}
          <div className="stats-grid">
            <div className="stat-card stat-card--orange">
              <span className="stat-label text-orange">TODAY<br />BOOKINGS</span>
              <span className="stat-value">{STATS.today}</span>
            </div>
            <div className="stat-card stat-card--orange">
              <span className="stat-label text-orange">TOTAL<br />BOOKINGS</span>
              <span className="stat-value">{STATS.total}</span>
            </div>
            <div className="stat-card stat-card--red">
              <span className="stat-label text-red">CANCEL<br />BOOKINGS</span>
              <span className="stat-value">{STATS.cancelled}</span>
            </div>
            <div className="stat-card stat-card--green">
              <span className="stat-label text-green">PAID<br />BOOKINGS</span>
              <span className="stat-value">{STATS.paid}</span>
            </div>
          </div>

          <hr className="overview-divider" />

          {/* ── CHARTS ROW (side-by-side on desktop) ────────────── */}
          <div className="charts-row"></div>

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
