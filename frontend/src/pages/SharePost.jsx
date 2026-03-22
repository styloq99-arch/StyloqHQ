import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import BarberSidebar from '../Components/BarberSidebar';
import { useAuth } from '../context/AuthContext';
import { uploadPostImage, createPostRecord } from '../api/supabasePosts';


export default function SharePost() {
  const navigate = useNavigate();
  const location = useLocation();

  const imageSrc = location.state?.imageSrc
    || 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=85';

  const [caption, setCaption] = useState('');
  const [sharing, setSharing] = useState(false);
  const [charFocus, setCharFocus] = useState(false);

  const { user } = useAuth();

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    
    try {
      let finalImageUrl = imageSrc;
      
      // 1. If it's a real local file, upload to Supabase Storage
      if (fileToUpload && user?.id) {
         const { url, error } = await uploadPostImage(fileToUpload, user.id);
         if (error) {
           throw new Error("Failed to upload image. Please ensure your 'posts' storage bucket is created!");
         }
         finalImageUrl = url;
      }

      // 2. Insert into the Supabase database
      if (user?.id) {
         const { success, error } = await createPostRecord(user.id, finalImageUrl, caption);
         if (!success) {
           throw new Error("Failed to save post to the database. Does the 'posts' table exist?");
         }
      }

      // 3. Navigate home
      navigate('/barber-home'); // Sending to barber-home is a cleaner experience
    } catch (err) {
      alert(err.message);
      console.error(err);
      setSharing(false);
    }
  };

  const remaining = 2200 - caption.length;
  const pct = (caption.length / 2200) * 100;

  return (
    <div className="app-layout">

      {/* Desktop Sidebar */}
      <BarberSidebar activePage="New Post" />

      <div className="main-content sp-main">

        {/* HEADER */}
        <header className="pp-header">
          <button className="pp-btn-icon" onClick={() => navigate(-1)}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <h1 className="pp-header-title">New post</h1>
          <button
            className={`sp-share-btn ${sharing ? 'sp-sharing' : ''}`}
            onClick={handleShare}
            disabled={sharing}
          >
            {sharing ? <><i className="fas fa-circle-notch fa-spin"></i> Sharing…</> : 'Share'}
          </button>
        </header>

        {/* ── MOBILE layout ── */}
        <div className="sp-mobile">
          <div className="sp-preview-wrap-mobile">
            {/* Blurred atmospheric background */}
            <div
              className="sp-mobile-preview-bg"
              style={{ backgroundImage: `url(${imageSrc})` }}
            />
            {/* Crisp photo on top */}
            <img src={imageSrc} alt="Post" className="sp-preview-mobile" />
          </div>

          <div className="sp-caption-card">
            <textarea
              className="sp-caption-ta"
              placeholder="Write a caption…"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              maxLength={2200}
              rows={4}
              onFocus={() => setCharFocus(true)}
              onBlur={() => setCharFocus(false)}
            />
            <div className={`sp-char-row ${charFocus ? 'sp-char-focus' : ''}`}>
              <div className="sp-char-bar-track">
                <div
                  className="sp-char-bar-fill"
                  style={{
                    width: `${pct}%`,
                    background: remaining < 100 ? '#ff4444' : remaining < 300 ? '#ffaa00' : '#FF5722',
                  }}
                />
              </div>
              <span className={`sp-char-num ${remaining < 100 ? 'sp-char-warn' : ''}`}>
                {remaining}
              </span>
            </div>
          </div>

          <button
            className={`sp-mobile-share-btn ${sharing ? 'sp-sharing' : ''}`}
            onClick={handleShare}
            disabled={sharing}
          >
            {sharing
              ? <><i className="fas fa-circle-notch fa-spin"></i> Sharing…</>
              : <><i className="fas fa-paper-plane"></i> Share Post</>
            }
          </button>
          <p className="sp-mobile-hint">Your post will appear on your profile.</p>
        </div>

        {/* ── DESKTOP layout ── */}
        <div className="sp-desktop">

          {/* Left — large photo preview */}
          <div className="sp-left">
            <div className="sp-preview-frame">
              <div
                className="sp-preview-bg-blur"
                style={{ backgroundImage: `url(${imageSrc})` }}
              />
              <img src={imageSrc} alt="Post preview" className="sp-preview-img-d" />
            </div>
          </div>

          {/* Right — caption panel */}
          <div className="sp-right">
            <div className="sp-right-inner">
              {/* Barber mini profile row */}
              <div className="sp-profile-row">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Barber"
                  className="sp-profile-avatar"
                />
                <div>
                  <p className="sp-profile-name">S.S.K. Perera</p>
                  <p className="sp-profile-role">Barber · StyloQ</p>
                </div>
              </div>

              <div className="sp-divider" />

              {/* Caption textarea */}
              <label className="sp-label">Caption</label>
              <textarea
                className="sp-caption-ta-d"
                placeholder="Write something about this post…"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                maxLength={2200}
                rows={6}
                onFocus={() => setCharFocus(true)}
                onBlur={() => setCharFocus(false)}
              />

              {/* Character meter */}
              <div className="sp-meter-row">
                <div className="sp-meter-track">
                  <div
                    className="sp-meter-fill"
                    style={{
                      width: `${pct}%`,
                      background: remaining < 100
                        ? '#ff4444'
                        : remaining < 300
                          ? '#ffaa00'
                          : '#FF5722',
                    }}
                  />
                </div>
                <span className={`sp-meter-num ${remaining < 100 ? 'warn' : ''}`}>
                  {remaining}
                </span>
              </div>

              <div className="sp-divider" />

              {/* Share button */}
              <button
                className={`sp-share-large ${sharing ? 'sp-sharing' : ''}`}
                onClick={handleShare}
                disabled={sharing}
              >
                {sharing ? (
                  <><i className="fas fa-circle-notch fa-spin"></i> Sharing…</>
                ) : (
                  <><i className="fas fa-paper-plane"></i> Share Post</>
                )}
              </button>

              <p className="sp-hint">Your post will appear on your profile immediately.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        <Link to="/barber-home" className="nav-item"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/barber-dashboard" className="nav-item"><i className="fas fa-chart-bar"></i><span>Dashboard</span></Link>
        <Link to="/postingPhotos" className="nav-item active add-circle-btn"><i className="fas fa-plus"></i></Link>
        <Link to="/message" className="nav-item"><i className="fas fa-comments"></i><span>Message</span></Link>
        <Link to="/barber-OwnProfile" className="nav-item"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>
    </div>
  );
}
