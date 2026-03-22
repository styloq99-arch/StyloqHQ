import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CustomerSidebar from '../Components/CustomerSidebar';
import { useAuth } from '../context/AuthContext';
import { submitReview } from '../api/supabaseBarber';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];


export default function AddReviewPage() {
  const navigate = useNavigate();
  const { barberId } = useParams();
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [charCount, setCharCount] = useState(0);

  const authorName = user?.full_name || 'Anonymous';
  const authorAvatar = `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 70) + 10}.jpg`;

  const activeRating = hoverRating || rating;

  const validate = () => {
    const e = {};
    if (rating === 0) e.rating = 'Please select a rating.';
    if (reviewText.trim().length < 20) e.review = 'Review must be at least 20 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!user) {
      alert("Please sign in to submit a review.");
      return;
    }

    try {
      await submitReview(barberId, user.id, authorName, authorAvatar, rating, reviewText.trim(), selectedTags);
      setSubmitted(true);
    } catch (err) {
      alert("Failed to submit review.");
    }
  };

  /* ─── SUCCESS SCREEN ─── */
  if (submitted) {
    return (
      <div className="app-layout">
        <CustomerSidebar activePage="Search" />

        <div className="main-content ar-page ar-success-wrap">
          <div className="ar-success-card">

            <div className="ar-success-ring">
              <div className="ar-success-icon">
                <i className="fas fa-check"></i>
              </div>
            </div>

            <h2 className="ar-success-title">Review Submitted!</h2>
            <p className="ar-success-sub">
              Thank you, {authorName}. Your review has been added to the Barber's profile.
            </p>

            <div className="ar-success-preview">
              <div className="ar-success-stars">
                {[1, 2, 3, 4, 5].map(s => (
                  <i
                    key={s}
                    className={`fas fa-star ${s <= rating ? 'ar-success-star-lit' : 'ar-success-star-dim'}`}
                  />
                ))}
              </div>
              <p className="ar-success-quote">"{reviewText}"</p>
              <span className="ar-success-author">— {authorName}</span>
            </div>

            <div className="ar-success-actions">
              <button className="ar-back-btn" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left"></i> Back to Profile
              </button>
              <Link to="/home" className="ar-home-btn">
                <i className="fas fa-home"></i> Go Home
              </Link>
            </div>

          </div>
        </div>

        <nav className="bottom-nav">
          <Link to="/home" className="nav-item"><i className="fas fa-home"></i><span>Home</span></Link>
          <Link to="/customer-search" className="nav-item active"><i className="fas fa-search"></i><span>Search</span></Link>
          <Link to="/favourites" className="nav-item"><i className="fas fa-heart"></i><span>Favourites</span></Link>
          <Link to="/message" className="nav-item"><i className="fas fa-comments"></i><span>Message</span></Link>
          <Link to="/customer-profile" className="nav-item"><i className="fas fa-user"></i><span>Profile</span></Link>
        </nav>
      </div>
    );
  }

  /* ─── MAIN FORM ─── */
  return (
    <div className="app-layout">

      {/* Desktop Sidebar */}
      <CustomerSidebar activePage="Search" />


      {/* Main Content */}
      <div className="main-content ar-page">

        {/* Hero */}
        <div className="ar-hero">
          <img
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=700&h=300&fit=crop"
            alt="Barbershop"
            className="ar-hero-img"
          />
          <div className="ar-hero-overlay" />
          <button className="bp-back-btn" onClick={() => navigate('/barber-profile-view')}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="ar-hero-text">
            <span className="ar-hero-label">Writing a review</span>
            <h1 className="ar-hero-title">For your recent cut</h1>
          </div>
        </div>

        {/* Barber Mini Card */}
        <div className="ar-barber-card">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Barber"
            className="ar-barber-avatar"
          />
          <div className="ar-barber-info">
            <span className="ar-barber-name">Your Master Barber</span>
            <span className="ar-barber-exp">We value your feedback</span>
          </div>
          <div className="ar-barber-badge">
            <i className="fas fa-shield-alt"></i> Verified
          </div>
        </div>

        {/* Reviewing As */}
        <div className="ar-reviewing-as">
          <i className="fas fa-user-circle ar-reviewing-icon"></i>
          <span className="ar-reviewing-label">Reviewing as</span>
          <span className="ar-reviewing-name">{authorName}</span>
        </div>

        {/* Form */}
        <div className="ar-form-wrap">

          {/* Step 01 — Star Rating */}
          <div className="ar-section">
            <div className="ar-section-num">01</div>
            <div className="ar-section-body">
              <h3 className="ar-section-title">Rate Your Experience</h3>
              <p className="ar-section-sub">Tap a star to rate</p>

              <div className="ar-stars-row">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`ar-star ${s <= activeRating ? 'ar-star-lit' : ''}`}
                    onClick={() => {
                      setRating(s);
                      setErrors(e => ({ ...e, rating: '' }));
                    }}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <i className="fas fa-star"></i>
                  </button>
                ))}
              </div>

              {activeRating > 0 && (
                <div className="ar-rating-label-pill">
                  <span className="ar-rating-label-dot" />
                  {RATING_LABELS[activeRating]}
                </div>
              )}

              <div className="ar-rating-bar-wrap">
                {[1, 2, 3, 4, 5].map(s => (
                  <div
                    key={s}
                    className={`ar-rating-bar-seg ${s <= activeRating ? 'filled' : ''}`}
                  />
                ))}
              </div>

              {errors.rating && (
                <p className="ar-field-error">
                  <i className="fas fa-exclamation-circle"></i> {errors.rating}
                </p>
              )}
            </div>
          </div>



          {/* Step 03 — Write Review */}
          <div className="ar-section">
            <div className="ar-section-num">02</div>
            <div className="ar-section-body">
              <h3 className="ar-section-title">Write Your Review</h3>
              <p className="ar-section-sub">Minimum 20 characters</p>
              <div className={`ar-textarea-wrap ${errors.review ? 'ar-input-error' : ''}`}>
                <textarea
                  className="ar-textarea"
                  placeholder="Share your experience — the cut, the atmosphere, the service..."
                  rows={5}
                  value={reviewText}
                  maxLength={500}
                  onChange={e => {
                    setReviewText(e.target.value);
                    setCharCount(e.target.value.length);
                    setErrors(er => ({ ...er, review: '' }));
                  }}
                />
                <div className="ar-char-count">{charCount}/500</div>
              </div>
              {errors.review && (
                <p className="ar-field-error">
                  <i className="fas fa-exclamation-circle"></i> {errors.review}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button className="ar-submit-btn" onClick={handleSubmit}>
            <i className="fas fa-paper-plane"></i>
            Submit Review
          </button>

          <p className="ar-submit-note">
            <i className="fas fa-lock"></i>
            Reviews are moderated and publicly visible on the barber's profile.
          </p>

        </div>

      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <Link to="/home" className="nav-item"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/customer-search" className="nav-item active"><i className="fas fa-search"></i><span>Search</span></Link>
        <Link to="/favourites" className="nav-item"><i className="fas fa-heart"></i><span>Favourites</span></Link>
        <Link to="/message" className="nav-item"><i className="fas fa-comments"></i><span>Message</span></Link>
        <Link to="/customer-profile" className="nav-item"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>
    </div>
  );
}
