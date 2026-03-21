// ═══════════════════════════════════════════════════════════════════════════════
// COMPLETE WORKING EXAMPLE - BarberProfileView.jsx with API Integration
// ═══════════════════════════════════════════════════════════════════════════════
// This file shows a complete, production-ready integration

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getBarberProfile, getBarberPortfolio, getBarberPosts } from '../services/barberApi';

// Original mock data (kept as fallback if API fails)
const BARBER_DATA_FALLBACK = {
  name: "S.S.K.Perera",
  experience: "17 years of experience",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  coverImage: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80"
};

const WORKING_HOURS = [
  { day: "Monday",    time: "9.00 AM - 6.00 PM" },
  { day: "Tuesday",   time: "9.00 AM - 6.00 PM" },
  { day: "Wednesday", time: "9.00 AM - 6.00 PM" },
  { day: "Thursday",  time: "9.00 AM - 6.00 PM" },
  { day: "Friday",    time: "9.00 AM - 6.00 PM" },
  { day: "Saturday",  time: "9.00 AM - 6.00 PM" },
  { day: "Sunday",    time: "9.00 AM - 6.00 PM" },
];

const LOCATIONS = [
  { id: 1, name: "Liyo Salons (pvt) Ltd", address: "No. 06, Pagoda Road, Nugegoda\nColombo 11800" },
  { id: 2, name: "Salon Next (pvt) Ltd",  address: "No. 7D, Vihara Mawatha, Peliyagoda\nColombo 11600" },
];

const CERTIFICATIONS = [
  {
    title: "Hair / Barber Diploma / Certification",
    institute: "Institute of Hairdressers & Beauticians (IHB)",
    desc: "Basic hair-cutting, styling, salon hygiene, hair & scalp treatment, general barbering skills."
  },
  {
    title: "Advanced Color Specialist",
    institute: "L'Oréal Professional Academy",
    desc: "Mastery in hair coloring techniques, balayage, ombre, and color correction."
  },
];

const BASE_REVIEWS = [
  { id: 1, text: "Best fade I've had in years!", author: "Ruwan D.",  rating: 5, avatar: "https://randomuser.me/api/portraits/men/10.jpg" },
  { id: 2, text: "Professional and friendly. Booked online, no waiting.", author: "Kevin S.",  rating: 5, avatar: "https://randomuser.me/api/portraits/men/20.jpg" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function BarberProfile() {
  const navigate = useNavigate();
  const { barberId } = useParams(); // Get barberId from URL: /barber/:barberId

  // ──────────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────────

  // API Data
  const [profileData, setProfileData] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [posts, setPosts] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI states (existing)
  const [allReviews, setAllReviews] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('styloq_reviews') || '[]');
      return [...stored, ...BASE_REVIEWS];
    } catch {
      return BASE_REVIEWS;
    }
  });

  const [activeCategory, setActiveCategory]   = useState("Hair Services");
  const [selectedService, setSelectedService] = useState(null);
  const [showAllCerts, setShowAllCerts]       = useState(false);
  const [showAllReviews, setShowAllReviews]   = useState(false);
  const [isListView, setIsListView]           = useState(false);
  const [isFollowing, setIsFollowing]         = useState(false);

  // Derived data (for display logic)
  const displayedCerts   = showAllCerts   ? CERTIFICATIONS : CERTIFICATIONS.slice(0, 1);
  const displayedReviews = showAllReviews ? allReviews     : allReviews.slice(0, 3);

  // ──────────────────────────────────────────────────────────────────────────
  // FETCH DATA ON MOUNT
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchBarberData = async () => {
      try {
        setLoading(true);
        setError(null);

        // NOTE: Fetch all three resources in parallel for better performance
        const [profileRes, portfolioRes, postsRes] = await Promise.all([
          getBarberProfile(barberId),
          getBarberPortfolio(barberId),
          getBarberPosts(barberId)
        ]);

        // Handle profile response
        if (profileRes.success) {
          setProfileData(profileRes.data);
        } else {
          // Fallback to mock data if API fails
          setProfileData(BARBER_DATA_FALLBACK);
          setError(profileRes.message || 'Failed to load profile');
        }

        // Handle portfolio response
        if (portfolioRes.success) {
          setPortfolioItems(portfolioRes.data || []);
        } else {
          console.warn('Portfolio failed:', portfolioRes.message);
          setPortfolioItems([]); // Empty array if API fails
        }

        // Handle posts response
        if (postsRes.success) {
          setPosts(postsRes.data || []);
        } else {
          console.warn('Posts failed:', postsRes.message);
          setPosts([]); // Empty array if API fails
        }

      } catch (err) {
        console.error('Error fetching barber data:', err);
        setError(err.message || 'An error occurred');
        // Fallback to mock data
        setProfileData(BARBER_DATA_FALLBACK);
        setPortfolioItems([]);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if barberId is available
    if (barberId) {
      fetchBarberData();
    } else {
      setError('Barber ID not found');
      setLoading(false);
    }
  }, [barberId]); // Re-fetch if barberId changes

  // ──────────────────────────────────────────────────────────────────────────
  // REFRESH REVIEWS FROM STORAGE (existing functionality)
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const refresh = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('styloq_reviews') || '[]');
        setAllReviews([...stored, ...BASE_REVIEWS]);
      } catch {}
    };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // HANDLERS (existing)
  // ──────────────────────────────────────────────────────────────────────────

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
  };

  const handleBookingClick = () => {
    navigate(`/booking/${barberId}`);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // JSX RENDERING
  // ──────────────────────────────────────────────────────────────────────────

  // Use API data if available, fallback to mock data
  const displayProfile = profileData || BARBER_DATA_FALLBACK;

  return (
    <div className="app-layout">

      {/* ── DESKTOP SIDEBAR ── */}
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

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        <div className="bp-page-body">

          {/* ── ERROR BANNER (NEW) ── */}
          {error && (
            <div className="error-banner" style={{
              background: '#fee',
              color: '#c00',
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '4px',
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}

          {/* ── LOADING SPINNER (NEW) ── */}
          {loading && (
            <div className="loading-spinner" style={{
              textAlign: 'center',
              padding: '2rem',
              fontSize: '1.1rem',
              color: '#666'
            }}>
              Loading barber profile...
            </div>
          )}

          {/* ── HEADER ── */}
          {!loading && (
            <div className="bp-header">

              {/* Cover Image */}
              <div className="bp-cover-wrap">
                <img 
                  src={displayProfile.coverImage || displayProfile.coverImageUrl} 
                  alt="Cover" 
                  className="bp-cover-img" 
                  onError={(e) => e.target.src = BARBER_DATA_FALLBACK.coverImage}
                />
                <div className="bp-cover-gradient"></div>

                {/* Back button */}
                <button className="bp-back-btn" onClick={() => window.history.back()}>
                  <i className="fas fa-chevron-left"></i>
                </button>

                {/* Avatar */}
                <div className="bp-avatar-container">
                  <img 
                    src={displayProfile.avatar || displayProfile.profilePictureUrl} 
                    alt={displayProfile.name || displayProfile.fullName} 
                    className="bp-avatar-img"
                    onError={(e) => e.target.src = BARBER_DATA_FALLBACK.avatar}
                  />
                </div>
              </div>

              {/* Info Card */}
              <div className="bp-info-card">
                <div className="bp-info-left">
                  <h2 className="bp-name">{displayProfile.name || displayProfile.fullName}</h2>
                  <p className="bp-experience">{displayProfile.experience || displayProfile.bio || BARBER_DATA_FALLBACK.experience}</p>
                  
                  {/* Rating */}
                  <div className="bp-rating">
                    <span className="rating-stars">⭐⭐⭐⭐⭐</span>
                    <span className="rating-text">(4.9 ratings)</span>
                  </div>

                  {/* Stats */}
                  <div className="bp-stats">
                    <div className="stat-item">
                      <span className="stat-number">2.5K</span>
                      <span className="stat-label">Clients</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">98%</span>
                      <span className="stat-label">Satisfaction</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bp-info-right">
                  <button 
                    className={`bp-btn-follow ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollowClick}
                  >
                    <i className="fas fa-heart"></i>
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button 
                    className="bp-btn-book"
                    onClick={handleBookingClick}
                  >
                    <i className="fas fa-calendar"></i>
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── SERVICES / PORTFOLIO SECTION ── */}
          {!loading && (
            <section className="bp-services">
              <h3 className="bp-section-title">Portfolio</h3>

              {/* Category Filter (if you have categories) */}
              <div className="bp-category-filter">
                <button 
                  className={`category-btn ${activeCategory === 'All' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('All')}
                >
                  All
                </button>
              </div>

              {/* Services Grid */}
              <div className={`bp-services-grid ${isListView ? 'list-view' : 'grid-view'}`}>
                {portfolioItems.length > 0 ? (
                  portfolioItems.slice(0, 6).map(item => (
                    <div 
                      key={item.id} 
                      className="service-card"
                      onClick={() => setSelectedService(item)}
                    >
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=No+Image'}
                      />
                      <div className="service-info">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No portfolio items available</p>
                )}
              </div>

              {portfolioItems.length > 6 && (
                <button className="view-more-btn">View All Portfolio</button>
              )}
            </section>
          )}

          {/* ── POSTS SECTION (NEW) ── */}
          {!loading && posts.length > 0 && (
            <section className="bp-posts">
              <h3 className="bp-section-title">Latest Posts</h3>
              <div className="bp-posts-grid">
                {posts.slice(0, 6).map(post => (
                  <div key={post.id} className="post-card">
                    <img 
                      src={post.imageUrl} 
                      alt="Post"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=Post'}
                    />
                    {post.caption && (
                      <p className="post-caption">{post.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── WORKING HOURS SECTION ── */}
          {!loading && (
            <section className="bp-working-hours">
              <h3 className="bp-section-title">Working Hours</h3>
              <div className="working-hours-list">
                {WORKING_HOURS.map((wh, idx) => (
                  <div key={idx} className="working-hour-item">
                    <span className="day">{wh.day}</span>
                    <span className="time">{wh.time}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── LOCATIONS SECTION ── */}
          {!loading && (
            <section className="bp-locations">
              <h3 className="bp-section-title">Work Locations</h3>
              <div className="locations-list">
                {LOCATIONS.map(loc => (
                  <div key={loc.id} className="location-item">
                    <h4>📍 {loc.name}</h4>
                    <p>{loc.address}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── CERTIFICATIONS SECTION ── */}
          {!loading && (
            <section className="bp-certifications">
              <h3 className="bp-section-title">Certifications</h3>
              <div className="certifications-list">
                {displayedCerts.map((cert, idx) => (
                  <div key={idx} className="certification-item">
                    <h4>{cert.title}</h4>
                    <p className="institute">From: {cert.institute}</p>
                    <p className="description">{cert.desc}</p>
                  </div>
                ))}
              </div>
              {CERTIFICATIONS.length > 1 && !showAllCerts && (
                <button 
                  className="show-more-btn"
                  onClick={() => setShowAllCerts(true)}
                >
                  Show More Certifications
                </button>
              )}
            </section>
          )}

          {/* ── REVIEWS SECTION ── */}
          {!loading && (
            <section className="bp-reviews">
              <h3 className="bp-section-title">Reviews</h3>
              <div className="reviews-list">
                {displayedReviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <img src={review.avatar} alt={review.author} className="review-avatar" />
                      <div className="review-author">
                        <h5>{review.author}</h5>
                        <span className="rating">{'⭐'.repeat(review.rating)}</span>
                      </div>
                    </div>
                    <p className="review-text">"{review.text}"</p>
                  </div>
                ))}
              </div>
              {allReviews.length > 3 && !showAllReviews && (
                <button 
                  className="show-more-btn"
                  onClick={() => setShowAllReviews(true)}
                >
                  Show More Reviews ({allReviews.length - 3})
                </button>
              )}
            </section>
          )}

        </div>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEY CHANGES MADE FOR API INTEGRATION:
// ═══════════════════════════════════════════════════════════════════════════════

/*
1. IMPORTS ADDED:
   - import { getBarberProfile, getBarberPortfolio, getBarberPosts } from '../services/barberApi';
   - import { useParams } from 'react-router-dom';

2. STATE ADDED:
   - profileData, setProfileData - stores barber profile from API
   - portfolioItems, setPortfolioItems - stores portfolio from API
   - posts, setPosts - stores posts from API
   - loading, setLoading - tracks loading state
   - error, setError - tracks any errors

3. USEEFFECT ADDED:
   - Fetches all three data sources on component mount
   - Uses Promise.all() for parallel requests (performance)
   - Falls back to mock data if API fails
   - Handles errors gracefully and displays them

4. DATA DISPLAY:
   - profileData used for name, bio, avatar
   - portfolioItems mapped instead of static SERVICES
   - posts displayed in new section
   - Fallback images if URLs are broken

5. USER EXPERIENCE:
   - Loading spinner while fetching
   - Error banner if something fails
   - Graceful degradation - mock data as fallback
   - Existing UI layout unchanged

6. NO BREAKING CHANGES:
   - All existing state/handlers kept
   - All existing props/navigation intact
   - Existing CSS classes unchanged
   - Existing review system preserved
   - Works with existing sidebar and navigation

*/
