import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getBarberProfile, getBarberPortfolio } from "../api/barberApi";
import { getBarberPosts as getSupabaseBarberPosts } from "../api/supabasePosts";
import { getUserByUid } from "../api/supabaseDb";
import { getBarberProfileData, getBarberReviews } from '../api/supabaseBarber';
import CustomerSidebar from "../Components/CustomerSidebar";

// --- DATA ---

const BARBER_DATA = {
  name: "S.S.K.Perera",
  experience: "17 years of experience",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  coverImage:
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
};

const SERVICE_CATEGORIES = ["Hair Services", "Hair Colours", "Beard Trim"];

const SERVICES = [
  // Hair Services
  {
    id: 1,
    category: "Hair Services",
    name: "SIDE PART",
    price: "Rs. 1500.00",
    image:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&q=80",
  },
  {
    id: 2,
    category: "Hair Services",
    name: "UNDER CUT",
    price: "Rs. 2000.00",
    image:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=300&q=80",
  },
  {
    id: 3,
    category: "Hair Services",
    name: "FRENCH CROP",
    price: "Rs. 1500.00",
    image:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300&q=80",
  },
  // Hair Colours
  {
    id: 4,
    category: "Hair Colours",
    name: "BLUE SKUNK",
    price: "Rs. 1500.00",
    image:
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300&q=80",
  },
  {
    id: 5,
    category: "Hair Colours",
    name: "GLOW HAZEL BROWN",
    price: "Rs. 2000.00",
    image:
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300&q=80",
  },
  {
    id: 6,
    category: "Hair Colours",
    name: "PINK SKUNK",
    price: "Rs. 1500.00",
    image:
      "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=300&q=80",
  },
  // Beard Trim
  {
    id: 7,
    category: "Beard Trim",
    name: "GOATEE STYLES",
    price: "Rs. 1500.00",
    image:
      "https://images.unsplash.com/photo-1621607512214-68297480165e?w=300&q=80",
  },
  {
    id: 8,
    category: "Beard Trim",
    name: "BOX CUT",
    price: "Rs. 2000.00",
    image:
      "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=300&q=80",
  },
  {
    id: 9,
    category: "Beard Trim",
    name: "BEARD LINE-UP",
    price: "Rs. 1500.00",
    image:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=300&q=80",
  },
];

const WORKING_HOURS = [
  { day: "Monday", time: "9.00 AM - 6.00 PM" },
  { day: "Tuesday", time: "9.00 AM - 6.00 PM" },
  { day: "Wednesday", time: "9.00 AM - 6.00 PM" },
  { day: "Thursday", time: "9.00 AM - 6.00 PM" },
  { day: "Friday", time: "9.00 AM - 6.00 PM" },
  { day: "Saturday", time: "9.00 AM - 6.00 PM" },
  { day: "Sunday", time: "9.00 AM - 6.00 PM" },
];

const LOCATIONS = [
  {
    id: 1,
    name: "Liyo Salons (pvt) Ltd",
    address: "No. 06, Pagoda Road, Nugegoda\nColombo 11800",
  },
  {
    id: 2,
    name: "Salon Next (pvt) Ltd",
    address: "No. 7D, Vihara Mawatha, Peliyagoda\nColombo 11600",
  },
];

const CERTIFICATIONS = [
  {
    title: "Hair / Barber Diploma / Certification",
    institute: "Institute of Hairdressers & Beauticians (IHB)",
    desc: "Basic hair-cutting, styling, salon hygiene, hair & scalp treatment, general barbering skills. Serves as a recognized vocational qualification.",
  },
  {
    title: "Advanced Color Specialist",
    institute: "L'Oréal Professional Academy",
    desc: "Mastery in hair coloring techniques, balayage, ombre, and color correction. Specialized training in chemical safety.",
  },
  {
    title: "Men's Grooming Masterclass",
    institute: "British Barbers Association",
    desc: "Advanced straight razor shaving techniques, beard sculpting, and classic modern fade transitions.",
  },
];

const BASE_REVIEWS = [
  {
    id: 1,
    text: "\u201cBest fade I've had in years! Clean shop, great vibe, and super detailed. My beard lineup has never looked sharper.\u201d",
    author: "Ruwan D.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
  },
  {
    id: 2,
    text: "\u201cProfessional and friendly. Booked online, no waiting. Barber listened to exactly what I wanted and delivered perfectly.\u201d",
    author: "Kevin S.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/20.jpg",
  },
  {
    id: 3,
    text: "\u201cHighly recommended. Great service, clean tools, and the skin fade is always on point. Definitely my go-to barber.\u201d",
    author: "Hashan T.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/30.jpg",
  },
  {
    id: 4,
    text: "\u201cS.S.K is a true artist. I came in with a photo of a complicated style and he executed it flawlessly. Worth every rupee!\u201d",
    author: "Aruna B.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/40.jpg",
  },
];

export default function BarberProfile() {
  const navigate = useNavigate();
  const { barberId } = useParams();

  // API-fetched profile state
  const [profileData, setProfileData] = useState(null);
  const [postsData, setPostsData] = useState([]);
  const [dbReviews, setDbReviews] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Fetch barber profile from backend
  useEffect(() => {
    if (!barberId) return;

    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const [profileRes, postsRes, userRes, jsonbRes, reviewsRes] = await Promise.all([
          getBarberProfile(barberId).catch(() => ({
            success: false,
            message: "Fallback",
          })),
          getSupabaseBarberPosts(barberId),
          getUserByUid(barberId),
          getBarberProfileData(barberId),
          getBarberReviews(barberId)
        ]);

        let combined = null;
        if (profileRes.success) combined = profileRes.data;

        if (userRes.user) {
          combined = {
            ...(combined || {}),
            name: userRes.user.full_name,
            email: userRes.user.email,
            phone: userRes.user.phone_number,
          };
        }

        if (jsonbRes.success && jsonbRes.data) {
          combined = {
            ...(combined || {}),
            ...jsonbRes.data
          };
        }

        if (combined) {
          setProfileData(combined);
        } else {
          setProfileError("Failed to fully load barber profile");
        }

        if (postsRes.success && Array.isArray(postsRes.data)) {
          setPostsData(postsRes.data);
        }
        
        if (reviewsRes.success && Array.isArray(reviewsRes.data)) {
          setDbReviews(reviewsRes.data);
        }
      } catch (err) {
        setProfileError("Unable to connect to server.");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [barberId]);

  // Merge API data with fallback hardcoded data
  const barber = {
    name: profileData?.name || BARBER_DATA.name,
    experience: profileData?.experience
      ? `${profileData.experience} years of experience`
      : profileData?.years_experience
      ? `${profileData.years_experience} years of experience`
      : BARBER_DATA.experience,
    bio:
      profileData?.bio ||
      "Fresh fades \u2022 Clean shaves \u2022 Good vibes. Crafting confidence one cut at a time",
    avatar: profileData?.avatar || BARBER_DATA.avatar,
    coverImage: profileData?.coverImage || profileData?.cover_image || BARBER_DATA.coverImage,
    email: profileData?.email || "",
    phone: profileData?.phone || "",
    address: profileData?.address || "",
  };

  const servicesList = profileData?.services || [];
  const serviceCategories = servicesList.length > 0
    ? [...new Set(servicesList.map(s => s.category))]
    : [];

  const workingHoursList = profileData?.workingHours
    ? (Array.isArray(profileData.workingHours)
        ? profileData.workingHours
        : Object.keys(profileData.workingHours).map(day => ({ 
            day, 
            time: profileData.workingHours[day].active 
              ? `${profileData.workingHours[day].open} - ${profileData.workingHours[day].close}` 
              : 'Closed' 
          }))
      )
    : [];

  const certsList = profileData?.certifications || [];
  const locationsList = profileData?.locations || [];

  const [activeCategory, setActiveCategory] = useState(serviceCategories[0] || "");
  const [selectedService, setSelectedService] = useState(null);
  const [showAllCerts, setShowAllCerts] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isListView, setIsListView] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fallback empty UI builder when barber lists are empty
  const EmptyState = ({ title }) => (
    <div style={{ padding: '20px', textAlign: 'center', background: 'transparent', borderRadius: '8px', border: '1px dashed #ccc', margin: '10px 0', color: '#666' }}>
      <i className="fas fa-info-circle" style={{ display: 'block', fontSize: '24px', marginBottom: '8px', color: '#aaa' }}></i>
      Barber has not displayed their {title} information yet.
    </div>
  );

  const displayedCerts = showAllCerts
    ? certsList
    : certsList.slice(0, 1);
  const displayedReviews = showAllReviews ? dbReviews : dbReviews.slice(0, 3);

  return (
    <div className="app-layout">
      {/* ── 1. DESKTOP SIDEBAR ── */}
      <CustomerSidebar activePage="Search" />

      {/* ── 2. MAIN CONTENT ── */}
      <div className="main-content">
        <div className="bp-page-body">
          {/* Loading / Error states */}
          {profileLoading && (
            <div
              style={{ textAlign: "center", padding: "40px 0", color: "#aaa" }}
            >
              Loading barber profile...
            </div>
          )}
          {profileError && (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#FF5722",
                background: "rgba(255,87,34,0.1)",
                borderRadius: "8px",
                margin: "20px",
              }}
            >
              {profileError}
            </div>
          )}

          {/* ── HEADER ── */}
          <div className="bp-header">
            {/* Cover Image */}
            <div className="bp-cover-wrap">
              <img
                src={barber.coverImage}
                alt="Cover"
                className="bp-cover-img"
              />
              <div className="bp-cover-gradient"></div>

              {/* Back button */}
              <button
                className="bp-back-btn"
                onClick={() => window.history.back()}
              >
                <i className="fas fa-chevron-left"></i>
              </button>

              {/* Avatar */}
              <div className="bp-avatar-container">
                <img
                  src={barber.avatar}
                  alt={barber.name}
                  className="bp-avatar-img"
                />
              </div>
            </div>

            {/* Info Card */}
            <div className="bp-info-card">
              {/* Name + Follow */}
              <div className="bp-info-row">
                <div className="bp-info-text">
                  <h2 className="bp-barber-name">{barber.name}</h2>
                  <p className="bp-barber-exp">{barber.experience}</p>
                  <p className="bp-barber-bio">{barber.bio}</p>
                </div>

                <button
                  className={`bp-follow-btn ${isFollowing ? "following" : ""}`}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  <i
                    className={`fas ${isFollowing ? "fa-user-check" : "fa-user-plus"}`}
                    style={{ fontSize: "13px" }}
                  ></i>
                  {isFollowing ? "Following" : "Follow"}
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
              <h3
                className="section-heading bp-section-title"
                style={{ margin: 0 }}
              >
                Posts &amp; Reels
              </h3>
            </div>
            <div className="categories-scroll bp-posts-scroll">
              {postsData && postsData.length > 0 ? (
                postsData.map((post) => (
                  <img
                    key={post.id}
                    src={post.image_url}
                    alt={post.caption || "Post"}
                    className="bp-post-img"
                  />
                ))
              ) : (
                <div
                  style={{
                    color: "var(--text-dim)",
                    fontStyle: "italic",
                    padding: "10px 0",
                  }}
                >
                  No posts yet.
                </div>
              )}
            </div>
          </div>

          {/* ── 2. SERVICE RATES ── */}
          <div className="bp-section-rates">
            <div className="bp-section-rates-header">
              <h3 className="section-heading bp-section-heading">
                Service Rates
              </h3>
              <button
                className="bp-view-toggle"
                onClick={() => setIsListView(!isListView)}
              >
                {isListView ? "Card View" : "View All"}
              </button>
            </div>

            {!isListView ? (
              <>
                {servicesList.length === 0 ? (
                  <EmptyState title="services" />
                ) : (
                  <>
                    {/* Category pills */}
                    <div className="categories-scroll bp-categories-scroll">
                      {serviceCategories.map((cat) => (
                        <button
                          key={cat}
                          className={`category-pill bp-category-pill ${activeCategory === cat ? "active" : ""}`}
                          onClick={() => setActiveCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Card scroll */}
                    <div className="categories-scroll bp-card-scroll">
                      {servicesList.filter((s) => s.category === activeCategory).map(
                    (service) => (
                      <div
                        key={service.id}
                        className={`bp-service-card ${selectedService?.id === service.id ? "selected" : ""}`}
                        onClick={() => setSelectedService(service)}
                      >
                        <img
                          src={service.image}
                          alt={service.name}
                          className="bp-service-card-img"
                        />
                        <div className="bp-service-card-info">
                          <p className="bp-service-card-name">{service.name}</p>
                          <p className="bp-service-card-price">
                            {service.price}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </>
            )}
            </>
            ) : (
              /* List view */
              <div className="bp-list-view">
                {servicesList.length === 0 ? (
                  <EmptyState title="services" />
                ) : (
                  serviceCategories.map((cat) => (
                    <div key={cat} className="bp-list-category">
                      <h4 className="bp-list-category-title">{cat}</h4>
                      <div className="bp-list-items">
                        {servicesList.filter((s) => s.category === cat).map(
                        (service) => (
                          <div
                            key={service.id}
                            className={`bp-list-item ${selectedService?.id === service.id ? "selected" : ""}`}
                            onClick={() => setSelectedService(service)}
                          >
                            <img
                              src={service.image}
                              alt={service.name}
                              className="bp-list-item-img"
                            />
                            <div className="bp-list-item-info">
                              <div className="bp-list-item-name">
                                {service.name}
                              </div>
                              <div className="bp-list-item-price">
                                {service.price}
                              </div>
                            </div>
                            <div className="bp-list-item-chevron">
                              <i className="fas fa-chevron-right"></i>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ))
                )}
              </div>
            )}
          </div>

          {/* ── 3. WORKING HOURS ── */}
          <div className="bp-section-working">
            <h3 className="section-heading bp-section-title">Working Hours</h3>
            {workingHoursList.length === 0 ? (
              <EmptyState title="working hours" />
            ) : (
              <div className="bp-working-card">
                {workingHoursList.map((slot, idx) => (
                  <div
                    key={idx}
                    className={`bp-working-row ${idx === workingHoursList.length - 1 ? "last" : ""}`}
                  >
                    <span className="bp-working-day">{slot.day}</span>
                    <span className="bp-working-time">{slot.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 4. LOCATIONS ── */}
          <div className="bp-section-locations">
            <h3 className="section-heading bp-section-title">Locations</h3>
            {locationsList.length === 0 ? (
              <EmptyState title="locations" />
            ) : (
              locationsList.map((loc) => (
                <div key={loc.id || loc.name} className="bp-location-card">
                  <h4 className="bp-location-name">{loc.name}</h4>
                  <p className="bp-location-address">{loc.address}</p>
                </div>
              ))
            )}
          </div>

          {/* ── 5. CERTIFICATIONS ── */}
          <div className="bp-section-certs">
            <h3 className="section-heading bp-section-title">Certifications</h3>
            {certsList.length === 0 ? (
              <EmptyState title="certifications" />
            ) : (
              <div className="bp-cert-card">
                {displayedCerts.map((cert, idx) => (
                  <div key={idx} className="bp-cert-item">
                    <h4 className="bp-cert-title">{cert.title}</h4>
                    <p className="bp-cert-institute">{cert.institute}</p>
                    <p className="bp-cert-desc">{cert.desc}</p>
                  </div>
                ))}
                {certsList.length > 1 && (
                  <button
                    className="bp-cert-toggle"
                    onClick={() => setShowAllCerts(!showAllCerts)}
                  >
                    {showAllCerts ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── 6. REVIEWS ── */}
          <div className="bp-section-reviews">
            <div className="bp-reviews-header">
              <h3
                className="section-heading bp-section-title"
                style={{ margin: 0 }}
              >
                Reviews
              </h3>
              <button
                className="bp-add-review-btn"
                onClick={() => navigate("/add-review")}
              >
                <i className="fas fa-plus"></i> Add Your Review
              </button>
            </div>

            <div className="categories-scroll bp-reviews-scroll">
              {displayedReviews.map((review) => (
                <div key={review.id} className="bp-review-card">
                  {/* Stars */}
                  <div className="bp-review-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <i
                        key={s}
                        className="fas fa-star bp-review-star"
                        style={{
                          color: s <= review.rating ? "#FFD700" : "#333",
                        }}
                      ></i>
                    ))}
                  </div>

                  {/* Tags */}
                  {review.tags && review.tags.length > 0 && (
                    <div className="bp-review-tags">
                      {review.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="bp-review-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Text */}
                  <p className="bp-review-text">{review.text || review.review_text}</p>

                  {/* Footer */}
                  <div className="bp-review-footer">
                    <img
                      src={
                        review.avatar ||
                        review.author_avatar ||
                        `https://randomuser.me/api/portraits/men/${(review.id % 70) + 10}.jpg`
                      }
                      alt={review.author || review.author_name}
                      className="bp-review-avatar"
                    />
                    <div className="bp-review-meta">
                      <div className="bp-review-author">{review.author || review.author_name}</div>
                      {(review.date || review.created_at) && (
                        <div className="bp-review-date">
                           {review.date || new Date(review.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {review.tags !== undefined && (
                      <span className="bp-review-new-badge">NEW</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {dbReviews.length === 0 && (
              <EmptyState title="reviews" />
            )}

            {dbReviews.length > 3 && (
              <button
                className="bp-show-more"
                onClick={() => setShowAllReviews(!showAllReviews)}
              >
                {showAllReviews ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="bottom-nav">
        <Link to="/home" className="nav-item">
          <i className="fas fa-home"></i> <span>Home</span>
        </Link>
        <Link to="/customer-search" className="nav-item active">
          <i className="fas fa-search"></i>
          <span>Search</span>
        </Link>
        <Link to="/favourites" className="nav-item">
          <i className="fas fa-heart"></i> <span>Favourites</span>
        </Link>
        <Link to="/message" className="nav-item">
          <i className="fas fa-comments"></i>
          <span>Message</span>
        </Link>
        <Link to="/customer-profile" className="nav-item">
          <i className="fas fa-user"></i> <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
