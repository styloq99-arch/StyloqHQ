import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function SalonHirePage() {
  const [page, setPage]           = useState('listings');
  const [listings, setListings]   = useState([]);
  const [apps, setApps]           = useState([]);
  const [filter, setFilter]       = useState('All');
  const [confirm, setConfirm]     = useState(null);
  const [postModal, setPostModal] = useState(false);
  const [form, setForm]           = useState({});
  const [formErr, setFormErr]     = useState({});
  const [toast, setToast]         = useState('');
  const photoRef                  = useRef(null);

  const showToast  = msg => { setToast(msg); setTimeout(() => setToast(''), 2500); };
  const closeModal = ()  => { setPostModal(false); setForm({}); setFormErr({}); };

  return (
    <div className="app-layout barber-home-page">

      {/* ── Desktop Sidebar ── */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{ fontSize: '40px' }}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/salon-home"    className="sidebar-link"><i className="fas fa-home" />        <span>Home</span></Link>
          <Link to="/salon-hire"    className="sidebar-link active"><i className="fas fa-users" /> <span>Hire Barbers</span></Link>
          <Link to="/salon-profile" className="sidebar-link"><i className="fas fa-user-circle" />  <span>Profile</span></Link>
        </nav>
        <div className="sidebar-user">
          <img src="https://i.pravatar.cc/150?img=32" alt="Salon" className="user-avatar" />
          <div className="user-info">
            <p className="user-name">Liyo Salon</p>
            <p className="user-status">Colombo 07</p>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <header className="customer-barber-header">
          <div className="header-top">
            <div className="header-profile">
              <div className="barber-welcome-text">
                <h2 className="hire-title-large">HIRE</h2>
                <h2>BARBERS</h2>
              </div>
            </div>
          </div>

          {/* Page toggle */}
          <div className="page-toggle-bar">
            {[
              { key: 'listings',     label: 'Job Listings', icon: 'fas fa-briefcase' },
              { key: 'applications', label: 'Applications', icon: 'fas fa-users'     },
            ].map(btn => (
              <button
                key={btn.key}
                onClick={() => setPage(btn.key)}
                className={`page-toggle-btn${page === btn.key ? ' active' : ''}`}
              >
                <i className={btn.icon} /> {btn.label}
              </button>
            ))}
          </div>
        </header>

        <div className="page-body barber-home-body" />
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav">
        <Link to="/salon-home"    className="nav-item"><i className="fas fa-home"/>        <span>Home</span></Link>
        <Link to="/salon-hire"    className="nav-item active"><i className="fas fa-users" /><span>Hire</span></Link>
        <Link to="/salon-profile" className="nav-item"><i className="fas fa-user-circle" /> <span>Profile</span></Link>
      </nav>

    </div>
  );
}