import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// --- DATA ---

const BARBER_DATA = {
  name: "S.S.K.Perera",
  experience: "17 years of experience",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  coverImage: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80"
};


export default function BarberProfile() {
  const navigate = useNavigate();

  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="app-layout">

      {/* ── 1. DESKTOP SIDEBAR ── */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{ fontSize: '40px' }}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/customer-home"   className="sidebar-link active"><i className="fas fa-home"></i>   <span>Home</span></Link>
          <Link to="/customer-search" className="sidebar-link"><i className="fas fa-search"></i> <span>Search</span></Link>
          <Link to="/favourites"       className="sidebar-link"><i className="fas fa-heart"></i>  <span>Favourites</span></Link>
          <Link to="/profile"         className="sidebar-link"><i className="fas fa-user"></i>   <span>Profile</span></Link>
        </nav>
        <div className="sidebar-user">
          <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="User" className="user-avatar" />
          <div className="user-info">
            <p className="user-name">John Doe</p>
            <p className="user-status">Customer</p>
          </div>
        </div>
      </aside>

      {/* ── 2. MAIN CONTENT ── */}
      <div className="main-content">
        <div className="bp-page-body">

          {/* ── HEADER ── */}
          <div className="bp-header">

            {/* Cover Image */}
            <div className="bp-cover-wrap">
              <img src={BARBER_DATA.coverImage} alt="Cover" className="bp-cover-img" />
              <div className="bp-cover-gradient"></div>

              {/* Back button */}
              <button className="bp-back-btn" onClick={() => window.history.back()}>
                <i className="fas fa-chevron-left"></i>
              </button>

              {/* Avatar */}
              <div className="bp-avatar-container">
                <img src={BARBER_DATA.avatar} alt={BARBER_DATA.name} className="bp-avatar-img" />
              </div>
            </div>

            {/* Info Card */}
            <div className="bp-info-card">

              {/* Name + Follow */}
              <div className="bp-info-row">
                <div className="bp-info-text">
                  <h2 className="bp-barber-name">{BARBER_DATA.name}</h2>
                  <p className="bp-barber-exp">{BARBER_DATA.experience}</p>
                  <p className="bp-barber-bio">
                    Fresh fades • Clean shaves • Good vibes. Crafting confidence one cut at a time
                  </p>
                </div>

                <button
                  className={`bp-follow-btn ${isFollowing ? 'following' : ''}`}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  <i className={`fas ${isFollowing ? 'fa-user-check' : 'fa-user-plus'}`} style={{ fontSize: '13px' }}></i>
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>

              <div className="bp-info-divider"></div>

              {/* Book Now */}
              <div className="bp-book-row">
                <Link to="/booking" className="bp-book-btn bp-book-now-btn">
                  <i className="fas fa-calendar-check"></i>
                  Book Now
                </Link>
              </div>
            </div>
          </div>
          {/* ── END HEADER ── */}

        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="bottom-nav">
        <Link to="/customer-home"   className="nav-item"><i className="fas fa-home"></i>   <span>Home</span></Link>
        <Link to="/customer-search" className="nav-item active"><i className="fas fa-search"></i><span>Search</span></Link>
        <Link to="/favourites"       className="nav-item"><i className="fas fa-heart"></i>  <span>Favourites</span></Link>
        <Link to="/profile"         className="nav-item"><i className="fas fa-user"></i>   <span>Profile</span></Link>
      </nav>

    </div>
  );
}
