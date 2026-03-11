import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function BookingPage() {
  const navigate = useNavigate();

  const SERVICE_CATALOG = {
    Male: {
      "Beard Services": [
        { id: 4, name: "FULL BEARD", price: "Rs.800.00",  img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&h=300&fit=crop&crop=top" },
        { id: 5, name: "BEARD TRIM", price: "Rs.600.00",  img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=300&fit=crop&crop=top" },
        { id: 6, name: "HOT SHAVE",  price: "Rs.1000.00", img: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300&h=300&fit=crop&crop=top" },
      ],
    },
  };

  const SERVICE_TYPES = {
    Male:   ["Beard Services"],
  };

  const [selectedGender, setSelectedGender]  = useState("Male");
  const [selectedServiceType, setSelectedServiceType] = useState("Beard Services");
  const [selectedService, setSelectedService]       = useState(null);
  
  const SERVICES = (SERVICE_CATALOG[selectedGender] || {})[selectedServiceType] || [];

  const getServiceDetails = () =>
    Object.values(SERVICE_CATALOG)
      .flatMap(g => Object.values(g).flat())
      .find(s => s.id === selectedService);

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

        {/* Gender */}
        <div className="bp-gender-section">
          <div className="bp-gender-label">Gender</div>
          <div className="bp-gender-row">
            {['Male', 'Female'].map(g => (
              <div
                key={g}
                className={`bp-gender-opt ${selectedGender === g ? 'active' : ''}`}
                onClick={() => {
                  setSelectedGender(g);
                  setSelectedService(null);
                  setSelectedServiceType(SERVICE_TYPES[g][0]);
                }}
              >
                <div className="bp-radio-outer">
                  <div className="bp-radio-inner"></div>
                </div>
                {g}
              </div>
            ))}
          </div>
        </div>
        
        {/* Service Type - Male */}
        {selectedGender === 'Male' && (
          <div className="bp-haircut-section">
            <div className="bp-haircut-header">
              <span className="bp-haircut-title">Select</span>
              <button className="bp-view-all">View All</button>
            </div>
            <div className="bp-haircut-cards">
              {SERVICES.map(service => (
                <div
                  key={service.id}
                  className={`bp-haircut-card ${selectedService === service.id ? 'selected' : ''}`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <img src={service.img} alt={service.name} />
                  <div className="bp-haircut-card-info">
                    <div className="bp-haircut-name">{service.name}</div>
                    <div className="bp-haircut-price">{service.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
