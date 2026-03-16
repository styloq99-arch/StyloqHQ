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
   STAR RATING
═══════════════════════════════════════════════════════ */
function Stars({ rating, max = 5 }) {
  return (
    <div className="db-stars">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`db-star ${i < Math.floor(rating) ? 'filled' : i < rating ? 'half' : 'empty'}`}>★</span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════ */
export default function BarberDashboard() {

     const ratingBreakdown = { 5: 45, 4: 30, 3: 15, 2: 7, 1: 3 };

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

              <div className="db-body">
                  <div className="db-content-grid">
                      <div className="db-col">
                             {/* 1. AVERAGE RATING */}
                            <section className="db-card">
                                <div className="db-card-row">
                                <h3 className="db-card-title">Average Rating</h3>
                                <div className="db-rating-right">
                                    <Stars rating={BARBER.rating} />
                                    <span className="db-rating-count">{BARBER.rating} ({BARBER.reviewCount})</span>
                                </div>
                                </div>
                                <div className="db-rating-bars">
                                {[5, 4, 3, 2, 1].map(s => (
                                    <div key={s} className="db-rbar-row">
                                    <span className="db-rbar-star">{s}★</span>
                                    <div className="db-rbar-track">
                                        <div className="db-rbar-fill" style={{ width: `${ratingBreakdown[s]}%` }} />
                                    </div>
                                    <span className="db-rbar-pct">{ratingBreakdown[s]}%</span>
                                    </div>
                                ))}
                                </div>
                            </section>

                            

                      </div>
                      <div className="db-col">{/* right */}</div>
                  </div>
                  <div style={{ height: 90 }} />
              </div>



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