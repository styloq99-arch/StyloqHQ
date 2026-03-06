import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// --- DATA ---

const BARBER_DATA = {
  name: "S.S.K.Perera",
  experience: "17 years of experience",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  coverImage: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80"
};

const SERVICE_CATEGORIES = ["Hair Services", "Hair Colours", "Beard Trim"];

const SERVICES = [
  // Hair Services
  { id: 1, category: "Hair Services", name: "SIDE PART",   price: "Rs. 1500.00", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&q=80" },
  { id: 2, category: "Hair Services", name: "UNDER CUT",   price: "Rs. 2000.00", image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=300&q=80" },
  { id: 3, category: "Hair Services", name: "FRENCH CROP", price: "Rs. 1500.00", image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300&q=80" },
  // Hair Colours
  { id: 4, category: "Hair Colours", name: "BLUE SKUNK",        price: "Rs. 1500.00", image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300&q=80" },
  { id: 5, category: "Hair Colours", name: "GLOW HAZEL BROWN",  price: "Rs. 2000.00", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300&q=80" },
  { id: 6, category: "Hair Colours", name: "PINK SKUNK",        price: "Rs. 1500.00", image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=300&q=80" },
  // Beard Trim
  { id: 7, category: "Beard Trim", name: "GOATEE STYLES", price: "Rs. 1500.00", image: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=300&q=80" },
  { id: 8, category: "Beard Trim", name: "BOX CUT",        price: "Rs. 2000.00", image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=300&q=80" },
  { id: 9, category: "Beard Trim", name: "BEARD LINE-UP",  price: "Rs. 1500.00", image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=300&q=80" },
];


export default function BarberProfile() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory]   = useState("Hair Services");
  const [selectedService, setSelectedService] = useState(null);
  const [isListView, setIsListView]           = useState(false);
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

          {/* ── 1. POSTS & REELS ── */}
          <div className="bp-section-posts">
            <div className="bp-posts-header">
              <h3 className="section-heading bp-section-title" style={{ margin: 0 }}>Posts &amp; Reels</h3>
            </div>
            <div className="categories-scroll bp-posts-scroll">
              {[1, 2, 3, 4].map(i => (
                <img
                  key={i}
                  src={`https://picsum.photos/seed/post${i}/200/200`}
                  alt="Post"
                  className="bp-post-img"
                />
              ))}
            </div>
          </div>

          {/* ── 2. SERVICE RATES ── */}
          <div className="bp-section-rates">
            <div className="bp-section-rates-header">
              <h3 className="section-heading bp-section-heading">Service Rates</h3>
              <button className="bp-view-toggle" onClick={() => setIsListView(!isListView)}>
                {isListView ? 'Card View' : 'View All'}
              </button>
            </div>

            {!isListView ? (
              <>
                {/* Category pills */}
                <div className="categories-scroll bp-categories-scroll">
                  {SERVICE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className={`category-pill bp-category-pill ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Card scroll */}
                <div className="categories-scroll bp-card-scroll">
                  {SERVICES.filter(s => s.category === activeCategory).map((service) => (
                    <div
                      key={service.id}
                      className={`bp-service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                      onClick={() => setSelectedService(service)}
                    >
                      <img src={service.image} alt={service.name} className="bp-service-card-img" />
                      <div className="bp-service-card-info">
                        <p className="bp-service-card-name">{service.name}</p>
                        <p className="bp-service-card-price">{service.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* List view */
              <div className="bp-list-view">
                {SERVICE_CATEGORIES.map((cat) => (
                  <div key={cat} className="bp-list-category">
                    <h4 className="bp-list-category-title">{cat}</h4>
                    <div className="bp-list-items">
                      {SERVICES.filter(s => s.category === cat).map((service) => (
                        <div
                          key={service.id}
                          className={`bp-list-item ${selectedService?.id === service.id ? 'selected' : ''}`}
                          onClick={() => setSelectedService(service)}
                        >
                          <img src={service.image} alt={service.name} className="bp-list-item-img" />
                          <div className="bp-list-item-info">
                            <div className="bp-list-item-name">{service.name}</div>
                            <div className="bp-list-item-price">{service.price}</div>
                          </div>
                          <div className="bp-list-item-chevron">
                            <i className="fas fa-chevron-right"></i>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
