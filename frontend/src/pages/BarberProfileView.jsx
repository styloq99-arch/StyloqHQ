import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getBarberProfile, getBarberPosts, getBarberReviews } from '../api/barberApi';
import { apiGet } from '../utils/api';
import CustomerSidebar from '../Components/CustomerSidebar';

// ── Helper: convert availability day_of_week (0-6) to working hours ──

const DAY_NAMES_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function formatTime24to12(t) {
  if (!t) return '';
  const parts = t.split(':');
  let h = parseInt(parts[0]);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}.${m} ${ampm}`;
}

function availabilityToWorkingHours(availability) {
  const hours = DAY_NAMES_FULL.map((day, idx) => {
    const slots = (availability || []).filter(s => s.day_of_week === idx);
    if (slots.length > 0) {
      const s = slots[0];
      return {
        day,
        time: `${formatTime24to12(s.start_time)} - ${formatTime24to12(s.end_time)}`,
        active: true,
      };
    }
    return { day, time: 'Closed', active: false };
  });
  return hours;
}

export default function BarberProfile() {
  const navigate = useNavigate();
  const { barberId } = useParams();

  // API-fetched state
  const [profileData, setProfileData] = useState(null);
  const [postsData, setPostsData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // Fetch barber profile, posts, and reviews from backend
  useEffect(() => {
    if (!barberId) return;

    const fetchAll = async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const [profileRes, postsRes, reviewsRes] = await Promise.all([
          getBarberProfile(barberId),
          getBarberPosts(barberId),
          getBarberReviews(barberId),
        ]);

        if (profileRes.success) {
          setProfileData(profileRes.data);
        } else {
          setProfileError(profileRes.message || 'Failed to load barber profile');
        }

        if (postsRes.success && Array.isArray(postsRes.data)) {
          setPostsData(postsRes.data);
        }

        if (reviewsRes.success && Array.isArray(reviewsRes.data)) {
          setReviewsData(reviewsRes.data);
        }
      } catch (err) {
        setProfileError('Unable to connect to server.');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchAll();
  }, [barberId]);

  // Derived data from API
  const barber = {
    name: profileData?.name || 'Barber',
    experience: profileData?.years_experience
      ? `${profileData.years_experience} years of experience`
      : '',
    bio: profileData?.bio || '',
    avatar: profileData?.avatar || profileData?.profile_image || '',
    coverImage: profileData?.cover_image || '',
    email: profileData?.email || '',
    phone: profileData?.phone || '',
    address: profileData?.current_location_name || '',
  };

  const services = Array.isArray(profileData?.services) ? profileData.services : [];
  const serviceCategories = [...new Set(services.map(s => s.category || 'Services'))];
  const certifications = Array.isArray(profileData?.certifications) ? profileData.certifications : [];
  const workingHours = availabilityToWorkingHours(profileData?.availability);
  const specialties = Array.isArray(profileData?.specialties) ? profileData.specialties : [];

  // Reviews from localStorage (user-submitted) + API
  const [allReviews, setAllReviews] = useState([]);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('styloq_reviews') || '[]');
      setAllReviews([...stored, ...reviewsData]);
    } catch {
      setAllReviews(reviewsData);
    }
  }, [reviewsData]);

  // Refresh reviews when coming back from add-review page
  useEffect(() => {
    const refresh = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('styloq_reviews') || '[]');
        setAllReviews([...stored, ...reviewsData]);
      } catch { }
    };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [reviewsData]);

  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showAllCerts, setShowAllCerts] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isListView, setIsListView] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Set default category when services load
  useEffect(() => {
    if (serviceCategories.length > 0 && !activeCategory) {
      setActiveCategory(serviceCategories[0]);
    }
  }, [serviceCategories]);

  const displayedCerts = showAllCerts ? certifications : certifications.slice(0, 1);
  const displayedReviews = showAllReviews ? allReviews : allReviews.slice(0, 3);

  return (
    <div className="app-layout">

      {/* ── 1. DESKTOP SIDEBAR ── */}
      <CustomerSidebar activePage="Search" />

      {/* ── 2. MAIN CONTENT ── */}
      <div className="main-content">
        <div className="bp-page-body">

          {/* Loading / Error states */}
          {profileLoading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>Loading barber profile...</div>
          )}
          {profileError && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#FF5722', background: 'rgba(255,87,34,0.1)', borderRadius: '8px', margin: '20px' }}>
              {profileError}
            </div>
          )}

          {!profileLoading && !profileError && (
            <>
              {/* ── HEADER ── */}
              <div className="bp-header">

                {/* Cover Image */}
                <div className="bp-cover-wrap">
                  {barber.coverImage ? (
                    <img src={barber.coverImage} alt="Cover" className="bp-cover-img" />
                  ) : (
                    <div className="bp-cover-img" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', minHeight: 200 }} />
                  )}
                  <div className="bp-cover-gradient"></div>

                  {/* Back button */}
                  <button className="bp-back-btn" onClick={() => window.history.back()}>
                    <i className="fas fa-chevron-left"></i>
                  </button>

                  {/* Avatar */}
                  <div className="bp-avatar-container">
                    {barber.avatar ? (
                      <img src={barber.avatar} alt={barber.name} className="bp-avatar-img" />
                    ) : (
                      <div className="bp-avatar-img" style={{ background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#888' }}>
                        <i className="fas fa-user"></i>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Card */}
                <div className="bp-info-card">

                  {/* Name + Follow */}
                  <div className="bp-info-row">
                    <div className="bp-info-text">
                      <h2 className="bp-barber-name">{barber.name}</h2>
                      {barber.experience && <p className="bp-barber-exp">{barber.experience}</p>}
                      {barber.bio && <p className="bp-barber-bio">{barber.bio}</p>}

                      {/* Specialties */}
                      {specialties.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                          {specialties.map(s => (
                            <span key={s} style={{
                              background: 'rgba(212, 175, 55, 0.15)',
                              color: '#d4af37',
                              padding: '3px 10px',
                              borderRadius: 12,
                              fontSize: 12,
                            }}>{s}</span>
                          ))}
                        </div>
                      )}
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
                    <Link to={`/booking/${barberId || ''}`} className="bp-book-btn bp-book-now-btn">
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
                {postsData.length > 0 ? (
                  <div className="categories-scroll bp-posts-scroll">
                    {postsData.map((post, i) => (
                      <img
                        key={post.id || i}
                        src={post.image_url || post.imageUrl}
                        alt={post.caption || 'Post'}
                        className="bp-post-img"
                      />
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#888', padding: '16px 0', fontSize: 14 }}>No posts yet.</p>
                )}
              </div>

              {/* ── 2. SERVICE RATES ── */}
              {services.length > 0 && (
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
                      {serviceCategories.length > 1 && (
                        <div className="categories-scroll bp-categories-scroll">
                          {serviceCategories.map((cat) => (
                            <button
                              key={cat}
                              className={`category-pill bp-category-pill ${activeCategory === cat ? 'active' : ''}`}
                              onClick={() => setActiveCategory(cat)}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Card scroll */}
                      <div className="categories-scroll bp-card-scroll">
                        {services
                          .filter(s => serviceCategories.length <= 1 || s.category === activeCategory)
                          .map((service) => (
                            <div
                              key={service.id}
                              className={`bp-service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                              onClick={() => setSelectedService(service)}
                            >
                              {service.image && (
                                <img src={service.image} alt={service.name} className="bp-service-card-img" />
                              )}
                              <div className="bp-service-card-info">
                                <p className="bp-service-card-name">{service.name}</p>
                                <p className="bp-service-card-price">Rs. {Number(service.price || 0).toLocaleString()}.00</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </>
                  ) : (
                    /* List view */
                    <div className="bp-list-view">
                      {serviceCategories.map((cat) => (
                        <div key={cat} className="bp-list-category">
                          {serviceCategories.length > 1 && (
                            <h4 className="bp-list-category-title">{cat}</h4>
                          )}
                          <div className="bp-list-items">
                            {services
                              .filter(s => serviceCategories.length <= 1 || s.category === cat)
                              .map((service) => (
                                <div
                                  key={service.id}
                                  className={`bp-list-item ${selectedService?.id === service.id ? 'selected' : ''}`}
                                  onClick={() => setSelectedService(service)}
                                >
                                  {service.image && (
                                    <img src={service.image} alt={service.name} className="bp-list-item-img" />
                                  )}
                                  <div className="bp-list-item-info">
                                    <div className="bp-list-item-name">{service.name}</div>
                                    <div className="bp-list-item-price">Rs. {Number(service.price || 0).toLocaleString()}.00</div>
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
              )}

              {/* ── 3. WORKING HOURS ── */}
              {workingHours.some(h => h.active) && (
                <div className="bp-section-working">
                  <h3 className="section-heading bp-section-title">Working Hours</h3>
                  <div className="bp-working-card">
                    {workingHours.map((slot, idx) => (
                      <div key={idx} className={`bp-working-row ${idx === workingHours.length - 1 ? 'last' : ''}`}>
                        <span className="bp-working-day">{slot.day}</span>
                        <span className="bp-working-time">{slot.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 4. LOCATIONS ── */}
              {barber.address && (
                <div className="bp-section-locations">
                  <h3 className="section-heading bp-section-title">Location</h3>
                  <div className="bp-location-card">
                    <p className="bp-location-address">{barber.address}</p>
                  </div>
                </div>
              )}

              {/* ── 5. CERTIFICATIONS ── */}
              {certifications.length > 0 && (
                <div className="bp-section-certs">
                  <h3 className="section-heading bp-section-title">Certifications</h3>
                  <div className="bp-cert-card">
                    {displayedCerts.map((cert, idx) => (
                      <div key={idx} className="bp-cert-item">
                        <h4 className="bp-cert-title">{cert.name}</h4>
                        {cert.issuing_body && <p className="bp-cert-institute">{cert.issuing_body}</p>}
                      </div>
                    ))}
                    {certifications.length > 1 && (
                      <button className="bp-cert-toggle" onClick={() => setShowAllCerts(!showAllCerts)}>
                        {showAllCerts ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── 6. REVIEWS ── */}
              <div className="bp-section-reviews">
                <div className="bp-reviews-header">
                  <h3 className="section-heading bp-section-title" style={{ margin: 0 }}>Reviews</h3>
                  <button className="bp-add-review-btn" onClick={() => navigate('/add-review')}>
                    <i className="fas fa-plus"></i> Add Your Review
                  </button>
                </div>

                {allReviews.length > 0 ? (
                  <div className="categories-scroll bp-reviews-scroll">
                    {displayedReviews.map((review, idx) => (
                      <div key={review.id || idx} className="bp-review-card">

                        {/* Stars */}
                        <div className="bp-review-stars">
                          {[1, 2, 3, 4, 5].map(s => (
                            <i
                              key={s}
                              className="fas fa-star bp-review-star"
                              style={{ color: s <= review.rating ? '#FFD700' : '#333' }}
                            ></i>
                          ))}
                        </div>

                        {/* Tags */}
                        {review.tags && review.tags.length > 0 && (
                          <div className="bp-review-tags">
                            {review.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="bp-review-tag">{tag}</span>
                            ))}
                          </div>
                        )}

                        {/* Text */}
                        <p className="bp-review-text">{review.text || review.comment}</p>

                        {/* Footer */}
                        <div className="bp-review-footer">
                          <img
                            src={review.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author || 'User')}&background=333&color=fff&size=40`}
                            alt={review.author}
                            className="bp-review-avatar"
                          />
                          <div className="bp-review-meta">
                            <div className="bp-review-author">{review.author}</div>
                            {review.date && <div className="bp-review-date">{review.date}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#888', padding: '16px 0', fontSize: 14 }}>No reviews yet. Be the first to leave one!</p>
                )}

                {allReviews.length > 3 && (
                  <button className="bp-show-more" onClick={() => setShowAllReviews(!showAllReviews)}>
                    {showAllReviews ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="bottom-nav">
        <Link to="/home" className="nav-item"><i className="fas fa-home"></i>   <span>Home</span></Link>
        <Link to="/customer-search" className="nav-item active"><i className="fas fa-search"></i><span>Search</span></Link>
        <Link to="/favourites" className="nav-item"><i className="fas fa-heart"></i>  <span>Favourites</span></Link>
        <Link to="/message" className="nav-item"><i className="fas fa-comments"></i><span>Message</span></Link>
        <Link to="/customer-profile" className="nav-item"><i className="fas fa-user"></i>   <span>Profile</span></Link>
      </nav>

    </div>
  );
}
