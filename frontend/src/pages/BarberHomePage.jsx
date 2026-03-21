import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function BarberHomePage() {
  const appointments = [
    {
      id: 1,
      customerName: 'Chamodi Wimansa',
      customerAvatar: 'https://i.pravatar.cc/150?img=5',
      date: '27/11/2025',
      rawDate: '2025-11-27',
      time: '9.30PM',
      location: 'Liyo Salon',
      hairStyle: 'Layer cut',
      hairStyleImage: 'https://tse1.mm.bing.net/th/id/OIP.maLe0tFcOIenZvcJJ9rgLwHaIS?rs=1&pid=ImgDetMain&o=7&rm=3',
      service: 'Layer cut',
      amount: 'RS.2500.00',
      status: 'Paid',
      paymentOption: 'Pay Online'
    },
    {
      id: 2,
      customerName: 'Danush Wijewardana',
      customerAvatar: 'https://i.pravatar.cc/150?img=12',
      date: '27/11/2025',
      rawDate: '2025-11-27',
      time: '10.30PM',
      location: 'Liyo Salon',
      hairStyle: 'Fade',
      hairStyleImage: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=250&fit=crop',
      service: 'Fade',
      amount: 'RS.2500.00',
      status: 'Not Paid',
      paymentOption: 'Pay Online'
    },
    {
      id: 3,
      customerName: 'Ranuthi Dahamsa',
      customerAvatar: 'https://i.pravatar.cc/150?img=12',
      date: '16/1/2026',
      rawDate: '2026-01-16',
      time: '1.00PM',
      location: 'Liyo Salon',
      hairStyle: 'relax',
      hairStyleImage: 'https://thumbs.dreamstime.com/z/happy-people-beautiful-portrait-attractive-young-caucasian-brunette-waving-head-smiling-broadly-being-happy-people-112905105.jpg',
      service: 'relax',
      amount: 'RS.3500.00',
      status: 'Not Paid',
      paymentOption: 'Pay Online'
    }
  ];

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
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{fontSize : '40px'}}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/barber-home" className="sidebar-link active">
            <i className="fas fa-home"></i> <span>Home</span>
          </Link>
          <Link to="/barber-dashboard" className="sidebar-link">
            <i className="fas fa-calendar-alt"></i> <span>DashBoard</span>
          </Link>
          <Link to="/message" className="sidebar-link">
            <i className="fas fa-comments"></i> <span>Message</span>
          </Link>
          <Link to="/barber-OwnProfile" className="sidebar-link">
            <i className="fas fa-user"></i> <span>Profile</span>
          </Link>
          <Link to="/postingPhotos"     className="sidebar-link">
          <i className="fas fa-plus-square"></i> <span>New Post</span>
          </Link>
          
        </nav>
      </aside>

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
                <h2>MR. PERERA</h2>
              </div>
            </div>
            <div className="notification-bell">
              <i className="far fa-bell"></i>
              <span className="badge">3</span>
            </div>
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

        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        <Link to="/barber-home"       className="nav-item active"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/barber-dashboard"  className="nav-item"><i className="fas fa-chart-bar"></i><span>Dashboard</span></Link>
        <Link to="/postingPhotos"     className="nav-item add-circle-btn"><i className="fas fa-plus"></i></Link>
        <Link to="/message"           className="nav-item"><i className="fas fa-comments"></i><span>Message</span></Link>
        <Link to="/barber-OwnProfile" className="nav-item"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>

    </div>
  );
}