import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BarberSidebar from '../Components/BarberSidebar';

export default function BarberHomePage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => { logout(); navigate('/signin'); };

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { apiGet } = await import('../utils/api');
        const res = await apiGet('/barber/me/appointments');
        if (res.success && Array.isArray(res.data)) {
          setAppointments(res.data.map(a => ({
            id: a.id,
            customerName: a.customer_name || 'Customer',
            customerAvatar: a.customer_avatar || 'https://i.pravatar.cc/150?img=5',
            date: a.appointment_datetime ? new Date(a.appointment_datetime).toLocaleDateString('en-GB') : '',
            rawDate: a.appointment_datetime ? a.appointment_datetime.split('T')[0] : '',
            time: a.appointment_datetime ? new Date(a.appointment_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
            location: a.location || 'N/A',
            hairStyle: a.service_name || 'Service',
            service: a.service_name || 'Service',
            amount: a.price ? `RS.${Math.round(a.price).toLocaleString()}.00` : 'N/A',
            status: a.status === 'Confirmed' || a.status === 'Completed' ? 'Paid' : 'Not Paid',
            bookingStatus: a.status || 'Pending',
            durationMinutes: a.duration_minutes,
          })));
        } else {
          console.warn('Appointments response:', res);
        }
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // --- FILTER STATE ---
  const [filterOpen, setFilterOpen] = useState(false);
  const [paymentFilters, setPaymentFilters] = useState([]);
  const [locationFilters, setLocationFilters] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const filterRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePayment = (value) => {
    setPaymentFilters(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const toggleLocation = (value) => {
    setLocationFilters(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const clearAll = () => {
    setPaymentFilters([]);
    setLocationFilters([]);
    setDateFrom('');
    setDateTo('');
  };

  const uniqueLocations = [...new Set(appointments.map(a => a.location))];

  // --- FILTERING LOGIC ---
  const filteredAppointments = appointments.filter(appt => {
    if (paymentFilters.length > 0 && !paymentFilters.includes(appt.status)) return false;
    if (locationFilters.length > 0 && !locationFilters.includes(appt.location)) return false;
    if (dateFrom && appt.rawDate < dateFrom) return false;
    if (dateTo && appt.rawDate > dateTo) return false;
    return true;
  });

  const activeCount =
    paymentFilters.length + locationFilters.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  return (
    <div className="app-layout barber-home-page">

      {/* --- DESKTOP SIDEBAR --- */}
      <BarberSidebar activePage="Home" />

      {/* --- MAIN CONTENT --- */}
      <div className="main-content">
        <header className="customer-barber-header">
          <div className="header-top">
            <div className="header-profile">
              <img
                src="https://i.pravatar.cc/150?img=11"
                alt="Barber Profile"
                className="header-avatar"
              />
              <div className="barber-welcome-text">
                <h1>WELCOME</h1>
                <h2>{user?.full_name?.toUpperCase() || 'BARBER'}</h2>
              </div>
            </div>
            <div className="notification-bell">
              <i className="far fa-bell"></i>
              <span className="badge">3</span>
            </div>
            {/* Mobile Logout Button */}
            <button 
              onClick={handleLogout} 
              className="mobile-logout-btn" 
              style={{
                background: "var(--color-accent)",
                color: "var(--text-on-btn)",
                border: "none",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "14px",
                fontWeight: "600",
                display: "none", // Will be shown via CSS media query
                marginLeft: "10px",
                cursor: "pointer"
              }}
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
            <style>
              {`
                @media (max-width: 768px) {
                  .mobile-logout-btn {
                    display: flex !important;
                    align-items: center;
                    gap: 6px;
                  }
                }
              `}
            </style>
          </div>
        </header>

        <div className="page-body barber-home-body">

          {/* Appointments Header */}
          <div className="appointments-header">
            <h3>Appointments</h3>
            <Link to="/Appointment-overview" className="overview-link">
              Appointments overview
            </Link>
          </div>
          {/* Control Row */}
          <div className="appointments-control-row">
            <div className="appointments-info">
              <p className="appointments-subtitle">Showing Appointments for today</p>
              {/* Dynamic count from filtered results */}
              <p className="appointments-count">
                {filteredAppointments.length} Appointment{filteredAppointments.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* --- FILTER BUTTON & DROPDOWN --- */}
            <div className="filter-wrapper" ref={filterRef}>
              <button
                className="filter-btn"
                onClick={() => setFilterOpen(prev => !prev)}
              >
                <span>Filter By{activeCount > 0 ? ` (${activeCount})` : ''}</span>
                <i className={`fas fa-chevron-${filterOpen ? 'up' : 'down'}`}></i>
              </button>

              <div className={`filter-dropdown ${filterOpen ? 'open' : ''}`}>

                {/* Payment Status */}
                <p className="filter-section-title">Payment Status</p>
                <div className="filter-check-group">
                  {['Paid', 'Not Paid'].map(val => (
                    <label key={val} className="filter-check-label">
                      <input
                        type="checkbox"
                        checked={paymentFilters.includes(val)}
                        onChange={() => togglePayment(val)}
                      />
                      <span className="filter-custom-check">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span className="filter-check-text">{val}</span>
                      <span className={`filter-badge ${val === 'Paid' ? 'paid' : 'not-paid'}`}>
                        {val}
                      </span>
                    </label>
                  ))}
                </div>

                <hr className="filter-divider" />

                {/* Date & Time */}
                <p className="filter-section-title">Date & Time</p>
                <div className="filter-date-row">
                  <div className="filter-date-group">
                    <label>From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="filter-date-group">
                    <label>To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                    />
                  </div>
                </div>

                <hr className="filter-divider" />

                {/* Location */}
                <p className="filter-section-title">Location / Salon</p>
                <div className="filter-check-group">
                  {uniqueLocations.map(loc => (
                    <label key={loc} className="filter-check-label">
                      <input
                        type="checkbox"
                        checked={locationFilters.includes(loc)}
                        onChange={() => toggleLocation(loc)}
                      />
                      <span className="filter-custom-check">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span className="filter-check-text">{loc}</span>
                    </label>
                  ))}
                </div>

                {/* Footer */}
                <div className="filter-footer">
                  <button className="filter-clear-btn" onClick={clearAll}>Clear all</button>
                  <button className="filter-btn" onClick={() => setFilterOpen(false)}>
                    Apply
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* --- APPOINTMENT CARDS --- */}
          {loading ? (
            <div className="appt-loading">
              <i className="fas fa-spinner fa-spin"></i> Loading appointments…
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="appt-empty">
              <i className="fas fa-calendar-times"></i>
              <p>No appointments found</p>
            </div>
          ) : (
            <div className="appt-card-list">
              {filteredAppointments.map(appt => (
                <div key={appt.id} className="appt-card">
                  <div className="appt-card-left">
                    <img src={appt.customerAvatar} alt={appt.customerName} className="appt-card-avatar" />
                    <div className="appt-card-info">
                      <h4 className="appt-card-name">{appt.customerName}</h4>
                      <p className="appt-card-service">{appt.hairStyle}</p>
                      <p className="appt-card-datetime">
                        <i className="far fa-calendar-alt"></i> {appt.date}
                        <span className="appt-card-time-sep">·</span>
                        <i className="far fa-clock"></i> {appt.time}
                      </p>
                    </div>
                  </div>
                  <div className="appt-card-right">
                    <span className="appt-card-price">{appt.amount}</span>
                    <span className={`appt-card-status ${appt.bookingStatus === 'Pending' ? 'pending' : appt.bookingStatus === 'Accepted' ? 'accepted' : appt.bookingStatus === 'Rejected' ? 'rejected' : 'other'}`}>
                      {appt.bookingStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        <Link to="/barber-home" className="nav-item active"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/barber-dashboard" className="nav-item"><i className="fas fa-chart-bar"></i><span>Dashboard</span></Link>
        <Link to="/postingPhotos" className="nav-item add-circle-btn"><i className="fas fa-plus"></i></Link>
        <Link to="/message" className="nav-item"><i className="fas fa-comments"></i><span>Message</span></Link>
        <Link to="/barber-OwnProfile" className="nav-item"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>

    </div>
  );
}