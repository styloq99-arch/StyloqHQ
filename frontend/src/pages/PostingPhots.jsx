import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BarberSidebar from '../Components/BarberSidebar';

const MOCK_GALLERY = [
  { id: 1, src: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&q=85' },
  { id: 2, src: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&q=85' },
  { id: 3, src: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&q=85' },
  { id: 4, src: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&q=85' },
  { id: 5, src: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&q=85' },
  { id: 6, src: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=500&q=85' },
  { id: 7, src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&q=85' },
  { id: 8, src: 'https://images.unsplash.com/photo-1560869713-bf919fd4a88a?w=500&q=85' },
  { id: 9, src: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&q=85' },
  { id: 10, src: 'https://images.unsplash.com/photo-1549236177-f9b0031b5e8b?w=500&q=85' },
  { id: 11, src: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=500&q=85' },
  { id: 12, src: 'https://images.unsplash.com/photo-1618354691551-44de113f0164?w=500&q=85' },
];

export default function PostingPhotos() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [selected, setSelected] = useState(MOCK_GALLERY[0]);
  const [previewSrc, setPreviewSrc] = useState(MOCK_GALLERY[0].src);
  const [previewAnim, setPreviewAnim] = useState(false);
  const [activeTab, setActiveTab] = useState('POST');

  const triggerAnim = () => {
    setPreviewAnim(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setPreviewAnim(true)));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewSrc(url);
    setSelected({ id: 'custom', src: url, file: file });
    triggerAnim();
  };

  const handleGalleryClick = (item) => {
    if (selected.id === item.id) return;
    setSelected(item);
    setPreviewSrc(item.src);
    triggerAnim();
  };

  const handleNext = () => {
    navigate('/share-post', { state: { imageSrc: previewSrc, file: selected.file || null } });
  };

  const GallerySection = () => (
    <div className="pp-gallery-section">
      <div className="pp-gallery-header">
        <button className="pp-recents-btn">
          Recents <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      <div className="pp-gallery-grid">
        <div className="pp-gallery-cam pp-gallery-tile" onClick={() => fileRef.current.click()}>
          <div className="pp-cam-inner">
            <i className="fas fa-camera"></i>
            <span>Camera</span>
          </div>
        </div>
        {MOCK_GALLERY.map((item, idx) => (
          <div
            key={item.id}
            className={`pp-gallery-tile ${selected.id === item.id ? 'pp-tile-active' : ''}`}
            onClick={() => handleGalleryClick(item)}
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            <img src={item.src} alt="" className="pp-tile-img" loading="lazy" />
            <div className="pp-tile-overlay">
              {selected.id === item.id && (
                <span className="pp-tile-badge">
                  <i className="fas fa-check"></i>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* Desktop Sidebar */}
      <BarberSidebar activePage="New Post" />

      <div className="main-content pp-main">

        {/* HEADER */}
        <header className="pp-header">
          <button className="pp-btn-icon" onClick={() => navigate('/barber-home')}>
            <i className="fas fa-times"></i>
          </button>
          <h1 className="pp-header-title">New post</h1>
          <button className="pp-btn-next" onClick={handleNext}>
            Next <i className="fas fa-chevron-right"></i>
          </button>
        </header>

        {/* ── MOBILE layout ── */}
        <div className="pp-mobile">
          <div className="pp-preview-mobile">
            <img
              key={previewSrc}
              src={previewSrc}
              alt="preview"
              className={`pp-preview-img ${previewAnim ? 'pp-img-enter' : ''}`}
            />
            <button className="pp-expand-btn" onClick={() => fileRef.current.click()}>
              <i className="fas fa-expand-alt"></i>
            </button>
          </div>
          <GallerySection />
          <div className="pp-type-tabs">
            {['POST', 'STORY', 'REEL', 'LIVE'].map(tab => (
              <button
                key={tab}
                className={`pp-type-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >{tab}</button>
            ))}
          </div>
        </div>

        {/* ── DESKTOP layout ── */}
        <div className="pp-desktop">

          {/* Left — blurred bg + crisp preview */}
          <div className="pp-preview-desktop">
            <div
              className="pp-preview-bg"
              style={{ backgroundImage: `url(${previewSrc})` }}
            />
            <div className="pp-preview-glass" />
            <img
              key={previewSrc}
              src={previewSrc}
              alt="preview"
              className={`pp-preview-img-d ${previewAnim ? 'pp-img-enter' : ''}`}
            />
          </div>

          {/* Right — gallery */}
          <div className="pp-gallery-panel">
            <GallerySection />
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
