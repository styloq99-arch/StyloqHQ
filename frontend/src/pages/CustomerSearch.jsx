import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomerSidebar from '../Components/CustomerSidebar';
import { apiGet } from '../utils/api';

const CATEGORIES = ["All", "Top Rated", "Near Me", "Price Low to High", "Beard Specialist"];


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

  // Filter Logic
  const filteredBarbers = barbers.filter(barber => {
    const name = barber.full_name || barber.name || '';
    const salon = barber.salon_name || barber.salon || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.toLowerCase().includes(searchTerm.toLowerCase());

    const rating = barber.average_rating || barber.rating || 0;
    const matchesCategory = activeCategory === "All" ? true :
      activeCategory === "Top Rated" ? rating >= 4.5 :
        true;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app-layout">

      {/* --- 1. DESKTOP SIDEBAR --- */}
      <CustomerSidebar activePage="Search" />


      {/* --- 2. MAIN CONTENT AREA --- */}
      <div className="main-content">

        {/* --- Header (Identical to Home) --- */}
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

        {/* --- Scrollable Page Content --- */}
        <div className="page-body">

          {/* Search Bar Section */}
          <section className="search-section">
            <div className="search-bar-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                className="search-input-field"
                placeholder="Search barbers, salons, or styles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </section>

          {/* Categories Section */}
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

          {/* Results List */}
          <section className="results-section">
            <h3 className="section-heading">Available Barbers</h3>

            {loading ? (
              <div className="no-results"><p>Loading barbers...</p></div>
            ) : error ? (
              <div className="no-results"><p>{error}</p></div>
            ) : filteredBarbers.length > 0 ? (
              <div className="barber-list">
                {filteredBarbers.map((barber) => (
                  <div key={barber.id} className="barber-result-card">

                    {/* Left: Image & Basic Info */}
                    <div className="card-left">
                      <img src={barber.profile_image || barber.image || 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&q=80'} alt={barber.full_name || barber.name} className="barber-preview-img" />
                      <div className="barber-details">
                        <h4 className="barber-name">{barber.full_name || barber.name || 'Unknown'}</h4>
                        <p className="barber-salon-name">{barber.salon_name || barber.salon || 'Independent'}</p>
                        <div className="meta-tags">
                          <span className="meta-tag"><i className="fas fa-star"></i> {barber.average_rating || barber.rating || 'N/A'}</span>
                          <span className="meta-tag"><i className="fas fa-map-marker-alt"></i> {barber.distance || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price & Actions */}
                    <div className="card-right">
                      <div className="price-tag">
                        <span className="price-label">Starts at</span>
                        <span className="price-value">{barber.starting_price || barber.price || 'N/A'}</span>
                      </div>
                      <div className="action-buttons">

                        <Link to={`/barber-profile-view/${barber.id}`} className="btn btn-secondary" style={{ width: '100%', height: '40px', marginTop: '2rem', borderRadius: '20px' }}>
                          View Profile
                        </Link>

                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <p>No barbers found matching your search.</p>
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