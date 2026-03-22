import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SalonDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="db-root">
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{ fontSize: '40px' }}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/salon-dashboard" className="sidebar-link active">
            <i className="fas fa-tachometer-alt"></i> <span>Dashboard</span>
          </Link>
          <Link to="/salon-hire" className="sidebar-link">
            <i className="fas fa-users"></i> <span>Hire Barbers</span>
          </Link>
          <Link to="/salon-home" className="sidebar-link">
            <i className="fas fa-home"></i> <span>Home</span>
          </Link>
          <Link to="/salon-profile" className="sidebar-link">
            <i className="fas fa-building"></i> <span>Salon Profile</span>
          </Link>
          <button className="sidebar-link" onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF5722', width: '100%', textAlign: 'left', padding: '12px 16px', marginTop: 'auto' }}>
            <i className="fas fa-sign-out-alt"></i> <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="db-main">
        <header className="db-header">
          <h2 className="db-header-title">SALON DASHBOARD</h2>
          <div className="db-header-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FF5722', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
            {user?.full_name?.charAt(0) || 'S'}
          </div>
        </header>

        <div className="db-body">
          <div className="db-content-grid">
            <div className="db-col">
              {/* Welcome Card */}
              <section className="db-card">
                <h3 className="db-section-title">Welcome, {user?.full_name || 'Salon Owner'}!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                  Your salon dashboard is ready. Manage your barbers, appointments, and salon profile from here.
                </p>
              </section>

              {/* Quick Stats */}
              <section className="db-card">
                <h3 className="db-section-title">Quick Stats</h3>
                <div className="db-sub-grid">
                  <div className="db-sub-item">
                    <span className="db-sub-big">0</span>
                    <span className="db-sub-label">Active Barbers</span>
                  </div>
                  <div className="db-sub-item">
                    <span className="db-sub-big">0</span>
                    <span className="db-sub-label">Today's Appointments</span>
                  </div>
                  <div className="db-sub-item">
                    <span className="db-sub-big db-sub-orange">Rs. 0</span>
                    <span className="db-sub-label">Monthly Revenue</span>
                  </div>
                </div>
              </section>

              {/* Coming Soon */}
              <section className="db-card">
                <h3 className="db-section-title">Coming Soon</h3>
                <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li>Barber management and recruitment</li>
                  <li>Appointment scheduling and tracking</li>
                  <li>Revenue analytics and reports</li>
                  <li>Customer reviews and ratings</li>
                  <li>Salon profile customization</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-nav">
        <Link to="/salon-dashboard" className="nav-item active">
          <i className="fas fa-tachometer-alt"></i>
          <span>Dashboard</span>
        </Link>
        <Link to="/salon-hire" className="nav-item">
          <i className="fas fa-users"></i>
          <span>Hire</span>
        </Link>
        <Link to="/salon-home" className="nav-item">
          <i className="fas fa-home"></i>
          <span>Home</span>
        </Link>
        <Link to="/salon-profile" className="nav-item">
          <i className="fas fa-building"></i>
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
