import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


export default function AddReviewPage() {
  const navigate = useNavigate();

  // Auto-read customer name from profile saved in localStorage
  const [authorName] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('styloq_profile') || 'null');
      return saved?.name || 'John Doe';
    } catch {
      return 'John Doe';
    }
  });

  /* ─── MAIN FORM ─── */
  return (
    <div className="app-layout">

      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
        <h1 className="brand-title" style={{fontSize : '40px'}}>StyloQ</h1>
        </div>
        
        <nav className="sidebar-nav">
        <Link to="/customer-home" className="sidebar-link active">
            <i className="fas fa-home"></i> <span>Home</span>
        </Link>
        <Link to="/customer-search" className="sidebar-link">
            <i className="fas fa-search"></i> <span>Search</span>
        </Link>
        <Link to="/favourites" className="sidebar-link">
            <i className="fas fa-heart"></i> <span>Favourites</span>
        </Link>
        <Link to="/profile" className="sidebar-link">
            <i className="fas fa-user"></i> <span>Profile</span>
        </Link>
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
      <div className="main-content ar-page">

        {/* Hero */}
        <div className="ar-hero">
          <img
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=700&h=300&fit=crop"
            alt="Barbershop"
            className="ar-hero-img"
          />
          <div className="ar-hero-overlay" />
          <button className="bp-back-btn" onClick={() => navigate('/barber-profile-view')}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="ar-hero-text">
            <span className="ar-hero-label">Writing a review for</span>
            <h1 className="ar-hero-title">S.S.K. Perera</h1>
          </div>
        </div>

        {/* Barber Mini Card */}
        <div className="ar-barber-card">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Barber"
            className="ar-barber-avatar"
          />
          <div className="ar-barber-info">
            <span className="ar-barber-name">S.S.K. Perera</span>
            <span className="ar-barber-exp">17 years of experience</span>
          </div>
          <div className="ar-barber-badge">
            <i className="fas fa-shield-alt"></i> Verified
          </div>
        </div>

        {/* Reviewing As */}
        <div className="ar-reviewing-as">
          <i className="fas fa-user-circle ar-reviewing-icon"></i>
          <span className="ar-reviewing-label">Reviewing as</span>
          <span className="ar-reviewing-name">{authorName}</span>
        </div>
        
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <Link to="/customer-home"   className="nav-item"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/customer-search" className="nav-item active"><i className="fas fa-search"></i><span>Search</span></Link>
        <Link to="/favourites"       className="nav-item"><i className="fas fa-heart"></i><span>Favourites</span></Link>
        <Link to="/profile"         className="nav-item"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>
    </div>
  );
}
