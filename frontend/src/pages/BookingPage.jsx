import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function BookingPage() {
  const navigate = useNavigate();

  /* ─── Step 1: Booking Form ─── */
  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{ fontSize: '40px' }}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/customer-home"   className="sidebar-link"><i className="fas fa-home"></i>  <span>Home</span></Link>
          <Link to="/customer-search" className="sidebar-link active"><i className="fas fa-search"></i><span>Search</span></Link>
          <Link to="/favourites"       className="sidebar-link"><i className="fas fa-heart"></i> <span>Favourites</span></Link>
          <Link to="/profile"         className="sidebar-link"><i className="fas fa-user"></i>  <span>Profile</span></Link>
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
      <div className="main-content booking-page">

        {/* Hero Banner */}
        <div className="bp-hero">
          <img
            src="src/assets/images/booking_pg.jpg"
            alt="Barbershop"
            className="bp-hero-img"
          />
          <div className="bp-hero-overlay"></div>
          <button className="bp-back-btn" onClick={() => window.history.back()}>
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div className="bp-hero-title">Booking Appointments</div>
        </div>

        {/* Barber Profile */}
        <div className="bp-profile">
          <div className="bp-avatar-wrap">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Barber"
              className="bp-avatar"
            />
            <div className="bp-avatar-ring"></div>
          </div>
          <div className="bp-profile-info">
            <h3>S.S.K.Perera</h3>
            <p className="bp-exp">17 years of experience</p>
            <p className="bp-bio">Fresh fades • Clean shaves • Good vibes. Crafting confidence one cut at a time</p>
          </div>
        </div>

        <div className="bp-divider-line"></div>

        <div style={{ height: '80px' }}></div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <Link to="/customer-home"   className="nav-item"><i className="fas fa-home"></i>  <span>Home</span></Link>
        <Link to="/customer-search" className="nav-item active"><i className="fas fa-search"></i><span>Search</span></Link>
        <Link to="/favourites"       className="nav-item"><i className="fas fa-heart"></i> <span>Favourites</span></Link>
        <Link to="/profile"         className="nav-item"><i className="fas fa-user"></i>  <span>Profile</span></Link>
      </nav>
    </div>
  );
}
