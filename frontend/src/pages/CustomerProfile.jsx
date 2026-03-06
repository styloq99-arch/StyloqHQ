import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ─── Static Data ─────────────────────────────────────────────────────────────

const INITIAL_PROFILE = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '077 123 4567',
  idNumber: '200012345678',
  city: 'Colombo',
  username: 'john_doe',
  avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
};

const PROFILE_FIELDS = [
  { icon: 'fa-user',           label: 'Full Name',     key: 'name'     },
  { icon: 'fa-envelope',       label: 'Email Address', key: 'email'    },
  { icon: 'fa-phone',          label: 'Phone Number',  key: 'phone'    },
  { icon: 'fa-id-card',        label: 'ID Number',     key: 'idNumber' },
  { icon: 'fa-at',             label: 'Username',      key: 'username', prefix: '@' },
  { icon: 'fa-map-marker-alt', label: 'City',          key: 'city'     },
];


export default function CustomerProfile() {
  const navigate     = useNavigate();

  const [profile, setProfile] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('styloq_profile') || 'null');
      return saved || INITIAL_PROFILE;
    } catch { return INITIAL_PROFILE; }
  });

  const [activeTab, setActiveTab]  = useState('profile');

  // Sync to localStorage whenever profile changes
  React.useEffect(() => {
    try { localStorage.setItem('styloq_profile', JSON.stringify(profile)); } catch (_) {}
  }, [profile]);

  return (
    <div className="app-layout">

      {/* ── Desktop Sidebar ── */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{fontSize : '40px'}}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/customer-home"   className="sidebar-link"><i className="fas fa-home"></i>   <span>Home</span></Link>
          <Link to="/customer-search" className="sidebar-link"><i className="fas fa-search"></i> <span>Search</span></Link>
          <Link to="/favourites"       className="sidebar-link"><i className="fas fa-heart"></i>  <span>Favourites</span></Link>
          <Link to="/profile"         className="sidebar-link active"><i className="fas fa-user"></i> <span>Profile</span></Link>
        </nav>
        <div className="sidebar-user">
          <img src={profile.avatar} alt="User" className="user-avatar" />
          <div className="user-info">
            <p className="user-name">{profile.name.split(' ')[0]}</p>
            <p className="user-status">Customer</p>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-content cp-page">

        {/* Hero */}
        <div className="cp-hero">
          <img
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=300&fit=crop"
            alt="Profile"
            className="cp-hero-img"
          />
          <div className="cp-hero-overlay" />
        </div>

        {/* Identity */}
        <div className="cp-identity">
          <div className="cp-avatar-wrap">
            <img src={profile.avatar} alt={profile.name} className="cp-avatar" />
          </div>
          <h2 className="cp-identity-name">{profile.name}</h2>
          <p className="cp-identity-username">@{profile.username}</p>
          <div className="cp-identity-city-badge">
            <i className="fas fa-map-marker-alt"></i>
            {profile.city}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="cp-tabs">
          <button
            className={`cp-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i> Profile
          </button>
          <button
            className={`cp-tab ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <i className="fas fa-calendar-alt"></i> Appointments
           
          </button>
        </div>

        {/* ══ PROFILE TAB ══ */}
        {activeTab === 'profile' && (
          <div className="cp-profile-section">

            <div className="cp-section-header">
              <span className="cp-section-title">Personal Details</span>
            
            </div>

            {/* View Mode */}
            <div className="cp-info-grid">
              {PROFILE_FIELDS.map(({ icon, label, key, prefix }) => (
                <div className="cp-info-row" key={label}>
                  <div className="cp-info-icon">
                    <i className={`fas ${icon}`}></i>
                  </div>
                  <div className="cp-info-content">
                    <div className="cp-info-label">{label}</div>
                    <div className="cp-info-value">{prefix}{profile[key]}</div>
                  </div>
                </div>
              ))}
            </div>
          

            {/* Danger Zone */}
            <div className="cp-danger-zone">
              <div className="cp-danger-title">
                <i className="fas fa-exclamation-triangle"></i> Account
              </div>
              <button className="cp-logout-btn" onClick={() => navigate('/')}>
                <i className="fas fa-sign-out-alt"></i> Log Out
              </button>
            </div>

          </div>
        )}

        <div className="cp-page-spacer" />
      </div>

      {/* ── Bottom Nav ── */}
      <nav className="bottom-nav">
        <Link to="/customer-home"   className="nav-item"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/customer-search" className="nav-item"><i className="fas fa-search"></i><span>Search</span></Link>
        <Link to="/favourites"       className="nav-item"><i className="fas fa-heart"></i><span>Favourites</span></Link>
        <Link to="/profile"         className="nav-item active"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>

      
    </div>
  );
}
