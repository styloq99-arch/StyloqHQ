import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomerSidebar from '../Components/CustomerSidebar';
import { apiGet } from '../utils/api';

const CATEGORIES = ["All", "Top Rated", "Near Me", "Price Low to High", "Beard Specialist"];

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&q=80',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&q=80',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&q=80',
  'https://images.unsplash.com/photo-1585747860019-8e75b83e2391?w=500&q=80',
];

// Render star icons based on rating
function StarRating({ rating }) {
  const stars = [];
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push(<i key={i} className="fas fa-star" style={{ color: '#f5a623' }} />);
    else if (i === full && hasHalf) stars.push(<i key={i} className="fas fa-star-half-alt" style={{ color: '#f5a623' }} />);
    else stars.push(<i key={i} className="far fa-star" style={{ color: '#555' }} />);
  }
  return <span className="stars-row">{stars}</span>;
}


export default function CustomerSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const res = await apiGet('/customers/barbers');
        if (res.success && Array.isArray(res.data)) {
          setBarbers(res.data);
        } else {
          setError('Failed to load barbers');
        }
      } catch (err) {
        setError('Network error loading barbers');
      } finally {
        setLoading(false);
      }
    };
    fetchBarbers();
  }, []);

  // Sort + filter logic
  const getFilteredBarbers = () => {
    let list = [...barbers];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(b => {
        const name = (b.name || '').toLowerCase();
        const location = (b.current_location_name || '').toLowerCase();
        const bio = (b.bio || '').toLowerCase();
        const skills = (b.skills || []).join(' ').toLowerCase();
        return name.includes(q) || location.includes(q) || bio.includes(q) || skills.includes(q);
      });
    }

    // Category filter / sort
    if (activeCategory === "Top Rated") {
      list = list.filter(b => (b.average_rating || 0) >= 4.0);
      list.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    } else if (activeCategory === "Price Low to High") {
      list.sort((a, b) => (a.starting_price || Infinity) - (b.starting_price || Infinity));
    } else if (activeCategory === "Beard Specialist") {
      list = list.filter(b =>
        (b.skills || []).some(s => s.toLowerCase().includes('beard')) ||
        (b.bio || '').toLowerCase().includes('beard')
      );
    }
    // "Near Me" — no geolocation currently, just show barbers with a location set
    else if (activeCategory === "Near Me") {
      list = list.filter(b => b.current_location_name);
    }

    return list;
  };

  const filteredBarbers = getFilteredBarbers();
  const resultCount = filteredBarbers.length;

  return (
    <div className="app-layout">

      {/* --- 1. DESKTOP SIDEBAR --- */}
      <CustomerSidebar activePage="Search" />

      {/* --- 2. MAIN CONTENT AREA --- */}
      <div className="main-content">

        {/* --- Header --- */}
        <header className="customer-barber-header">
          <div className="header-top">
            <div className="mobile-brandContent">
              <h1 className="mobile-brand">StyloQ</h1>
            </div>
            <div className="notification-bell">
              <i className="far fa-bell"></i>
              <span className="badge">3</span>
            </div>
          </div>
        </header>

        {/* ---  Page Content --- */}
        <div className="page-body">

          {/* Search Bar */}
          <section className="search-section">
            <div className="search-bar-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                className="search-input-field"
                placeholder="Search barbers, locations, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </section>

          {/* Category Chips */}
          <section className="categories-section">
            <div className="categories-scroll">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* Results */}
          <section className="results-section">
            <div className="results-header">
              <h3 className="section-heading">
                {searchTerm ? `Results for "${searchTerm}"` : 'Available Barbers'}
              </h3>
              <span className="results-count">{resultCount} barber{resultCount !== 1 ? 's' : ''}</span>
            </div>

            {loading ? (
              <div className="cs-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading barbers...</p>
              </div>
            ) : error ? (
              <div className="cs-error">
                <i className="fas fa-exclamation-circle"></i>
                <p>{error}</p>
                <button className="cs-retry-btn" onClick={() => window.location.reload()}>
                  <i className="fas fa-redo"></i> Retry
                </button>
              </div>
            ) : filteredBarbers.length > 0 ? (
              <div className="barber-list">
                {filteredBarbers.map((barber, idx) => {
                  const img = barber.profile_image || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
                  const rating = barber.average_rating || 0;
                  const price = barber.starting_price;
                  const location = barber.current_location_name;
                  const skills = barber.skills || [];
                  const reviewCount = barber.total_reviews || 0;

                  return (
                    <Link
                      to={`/barber-profile-view/${barber.id}`}
                      key={barber.id}
                      className="barber-result-card"
                      style={{ textDecoration: 'none' }}
                    >
                      {/* Left: Image & Info */}
                      <div className="card-left">
                        <img src={img} alt={barber.name} className="barber-preview-img" />
                        <div className="barber-details">
                          <div className="barber-name-row">
                            <h4 className="barber-name">{barber.name || 'Unknown'}</h4>
                            {barber.is_verified && (
                              <i className="fas fa-check-circle cs-verified-badge" title="Verified"></i>
                            )}
                          </div>

                          {/* Rating */}
                          <div className="cs-rating-row">
                            <StarRating rating={rating} />
                            <span className="cs-rating-text">
                              {rating > 0 ? rating.toFixed(1) : 'New'}
                            </span>
                            {reviewCount > 0 && (
                              <span className="cs-review-count">({reviewCount})</span>
                            )}
                          </div>

                          {/* Location */}
                          {location && (
                            <p className="cs-location">
                              <i className="fas fa-map-marker-alt"></i> {location}
                            </p>
                          )}

                          {/* Skills */}
                          {skills.length > 0 && (
                            <div className="specialties">
                              {skills.slice(0, 3).map(skill => (
                                <span className="spec-tag" key={skill}>{skill}</span>
                              ))}
                              {skills.length > 3 && (
                                <span className="spec-tag">+{skills.length - 3}</span>
                              )}
                            </div>
                          )}

                          {/* Experience */}
                          {barber.years_experience > 0 && (
                            <p className="cs-experience">
                              <i className="fas fa-award"></i> {barber.years_experience} yr{barber.years_experience > 1 ? 's' : ''} experience
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Price & CTA */}
                      <div className="card-right">
                        <div className="price-tag">
                          <span className="price-label">Starts at</span>
                          <span className="price-value">
                            {price != null ? `Rs.${price.toLocaleString()}` : '—'}
                          </span>
                        </div>
                        <div className="action-buttons">
                          <span className="btn btn-secondary cs-view-btn">
                            View Profile
                          </span>
                        </div>
                      </div>

                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <p>No barbers found matching your search.</p>
                {searchTerm && (
                  <button className="cs-clear-search" onClick={() => { setSearchTerm(""); setActiveCategory("All"); }}>
                    Clear search
                  </button>
                )}
              </div>
            )}
          </section>

        </div>
      </div>


      {/* --- 3. MOBILE BOTTOM NAV  --- */}
      <nav className="bottom-nav">
        <Link to="/home" className="nav-item">
          <i className="fas fa-home"></i>
          <span>Home</span>
        </Link>
        <Link to="/customer-search" className="nav-item active">
          <i className="fas fa-search"></i>
          <span>Search</span>
        </Link>
        <Link to="/favourites" className="nav-item">
          <i className="fas fa-heart"></i>
          <span>Favourites</span>
        </Link>
        <Link to="/message" className="nav-item"><i className="fas fa-comments"></i><span>Message</span></Link>
        <Link to="/customer-profile" className="nav-item">
          <i className="fas fa-user"></i>
          <span>Profile</span>
        </Link>
      </nav>

    </div>
  );
}