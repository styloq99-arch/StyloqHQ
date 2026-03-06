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
    desc: "Basic hair-cutting, styling, salon hygiene, hair & scalp treatment, general barbering skills. Serves as a recognized vocational qualification."
  },
  {
    title: "Advanced Color Specialist",
    institute: "L'Oréal Professional Academy",
    desc: "Mastery in hair coloring techniques, balayage, ombre, and color correction. Specialized training in chemical safety."
  },
  {
    title: "Men's Grooming Masterclass",
    institute: "British Barbers Association",
    desc: "Advanced straight razor shaving techniques, beard sculpting, and classic modern fade transitions."
  },
];

const BASE_REVIEWS = [
  { id: 1, text: "\u201cBest fade I've had in years! Clean shop, great vibe, and super detailed. My beard lineup has never looked sharper.\u201d", author: "Ruwan D.",  rating: 5, avatar: "https://randomuser.me/api/portraits/men/10.jpg" },
  { id: 2, text: "\u201cProfessional and friendly. Booked online, no waiting. Barber listened to exactly what I wanted and delivered perfectly.\u201d", author: "Kevin S.",  rating: 5, avatar: "https://randomuser.me/api/portraits/men/20.jpg" },
  { id: 3, text: "\u201cHighly recommended. Great service, clean tools, and the skin fade is always on point. Definitely my go-to barber.\u201d", author: "Hashan T.", rating: 5, avatar: "https://randomuser.me/api/portraits/men/30.jpg" },
  { id: 4, text: "\u201cS.S.K is a true artist. I came in with a photo of a complicated style and he executed it flawlessly. Worth every rupee!\u201d", author: "Aruna B.",  rating: 5, avatar: "https://randomuser.me/api/portraits/men/40.jpg" },
];

export default function BarberProfile() {
  const navigate = useNavigate();

  const [allReviews, setAllReviews] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('styloq_reviews') || '[]');
      return [...stored, ...BASE_REVIEWS];
    } catch {
      return BASE_REVIEWS;
    }
  });

  // Refresh reviews when coming back from add-review page
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

  const [activeCategory, setActiveCategory]   = useState("Hair Services");
  const [selectedService, setSelectedService] = useState(null);
  const [showAllCerts, setShowAllCerts]       = useState(false);
  const [showAllReviews, setShowAllReviews]   = useState(false);
  const [isListView, setIsListView]           = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const displayedCerts   = showAllCerts   ? CERTIFICATIONS         : CERTIFICATIONS.slice(0, 1);
  const displayedReviews = showAllReviews ? allReviews             : allReviews.slice(0, 3);

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

          {/* ── 3. WORKING HOURS ── */}
          <div className="bp-section-working">
            <h3 className="section-heading bp-section-title">Working Hours</h3>
            <div className="bp-working-card">
              {WORKING_HOURS.map((slot, idx) => (
                <div key={idx} className={`bp-working-row ${idx === WORKING_HOURS.length - 1 ? 'last' : ''}`}>
                  <span className="bp-working-day">{slot.day}</span>
                  <span className="bp-working-time">{slot.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── 4. LOCATIONS ── */}
          <div className="bp-section-locations">
            <h3 className="section-heading bp-section-title">Locations</h3>
            {LOCATIONS.map((loc) => (
              <div key={loc.id} className="bp-location-card">
                <h4 className="bp-location-name">{loc.name}</h4>
                <p className="bp-location-address">{loc.address}</p>
              </div>
            ))}
          </div>

          {/* ── 5. CERTIFICATIONS ── */}
          <div className="bp-section-certs">
            <h3 className="section-heading bp-section-title">Certifications</h3>
            <div className="bp-cert-card">
              {displayedCerts.map((cert, idx) => (
                <div key={idx} className="bp-cert-item">
                  <h4 className="bp-cert-title">{cert.title}</h4>
                  <p className="bp-cert-institute">{cert.institute}</p>
                  <p className="bp-cert-desc">{cert.desc}</p>
                </div>
              ))}
              {CERTIFICATIONS.length > 1 && (
                <button className="bp-cert-toggle" onClick={() => setShowAllCerts(!showAllCerts)}>
                  {showAllCerts ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
          </div>

          {/* ── 6. REVIEWS ── */}
          <div className="bp-section-reviews">
            <div className="bp-reviews-header">
              <h3 className="section-heading bp-section-title" style={{ margin: 0 }}>Reviews</h3>
              <button className="bp-add-review-btn" onClick={() => navigate('/add-review')}>
                <i className="fas fa-plus"></i> Add Your Review
              </button>
            </div>

            <div className="categories-scroll bp-reviews-scroll">
              {displayedReviews.map(review => (
                <div key={review.id} className="bp-review-card">

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
                  <p className="bp-review-text">{review.text}</p>

                  {/* Footer */}
                  <div className="bp-review-footer">
                    <img
                      src={review.avatar || `https://randomuser.me/api/portraits/men/${(review.id % 70) + 10}.jpg`}
                      alt={review.author}
                      className="bp-review-avatar"
                    />
                    <div className="bp-review-meta">
                      <div className="bp-review-author">{review.author}</div>
                      {review.date && <div className="bp-review-date">{review.date}</div>}
                    </div>
                    {review.tags !== undefined && (
                      <span className="bp-review-new-badge">NEW</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {allReviews.length > 3 && (
              <button className="bp-show-more" onClick={() => setShowAllReviews(!showAllReviews)}>
                {showAllReviews ? 'Show Less' : 'Show More'}
              </button>
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
