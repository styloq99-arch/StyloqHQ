import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavourites } from './FavouritesContext';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export default function Favourites() {
  const { favouriteList, toggleFavourite } = useFavourites();

  const [sortBy, setSortBy] = useState('newest');
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const [removeToast, setRemoveToast] = useState(false);

  const filtered = favouriteList
    .sort((a, b) => {
      if (sortBy === 'oldest') return a.id - b.id;
      return b.id - a.id;
    });

  const handleRemoveAll = () => {
    favouriteList.forEach(p => toggleFavourite(p));
  };

  const handleRemove = (post) => setRemoveConfirm(post);

  const confirmRemove = () => {
    if (removeConfirm) {
      toggleFavourite(removeConfirm);
      setRemoveConfirm(null);
      setRemoveToast(true);
      setTimeout(() => setRemoveToast(false), 2200);
    }
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <i
        key={i}
        className={`fas fa-star ${i < rating ? 'star--filled' : 'star--empty'}`}
      ></i>
    ));

  return (
    <div className="app-layout">

      {/* Remove Toast */}
      {removeToast && (
        <div className="cp-toast cp-toast--remove">
          <i className="fas fa-trash"></i> Removed from Favourites
        </div>
      )}

      {/* Confirm Remove Modal */}
      {removeConfirm && (
        <div className="cp-modal-overlay">
          <div className="cp-modal">
            <div className="cp-modal-icon">
              <i className="fas fa-bookmark"></i>
            </div>
            <h3>Remove from Favourites?</h3>
            <p>
              <strong className="cp-modal-name">{removeConfirm.name}</strong>'s post will be removed from your saved collection.
            </p>
            <div className="cp-modal-actions">
              <button className="cp-modal-keep" onClick={() => setRemoveConfirm(null)}>Keep It</button>
              <button className="cp-modal-cancel" onClick={confirmRemove}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{fontSize : '40px'}}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/customer-home" className="sidebar-link"><i className="fas fa-home"></i> <span>Home</span></Link>
          <Link to="/customer-search" className="sidebar-link"><i className="fas fa-search"></i> <span>Search</span></Link>
          <Link to="/favourites" className="sidebar-link active"><i className="fas fa-heart"></i> <span>Favourites</span></Link>
          <Link to="/customer-profile" className="sidebar-link"><i className="fas fa-user"></i> <span>Profile</span></Link>
        </nav>
        <div className="sidebar-user">
          <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="User" className="user-avatar" />
          <div className="user-info">
            <p className="user-name">John Doe</p>
            <p className="user-status">Customer</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">

        {/* Header */}
        <header className="customer-barber-header fav-header">
          <div className="header-top">
            <div className="fav-header__left">
              <Link to="/customer-home" className="back-btn back-btn--static">
                <i className="fas fa-arrow-left"></i>
              </Link>
              <div>
                <h1 className="fav-header__title">Favourites</h1>
                <p className="fav-header__subtitle">
                  {favouriteList.length} saved {favouriteList.length === 1 ? 'post' : 'posts'}
                </p>
              </div>
            </div>
            <div className="fav-header__actions">
              {favouriteList.length > 0 && (
                <button onClick={handleRemoveAll} className="fav-clear-btn">
                  <i className="fas fa-trash"></i> Clear All
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Controls: Sort */}
        {favouriteList.length > 0 && (
          <div className="fav-controls">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="fav-sort-select"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Empty State */}
        {favouriteList.length === 0 && (
          <div className="fav-empty">
            <div className="fav-empty__icon-wrap">
              <i className="far fa-bookmark fav-empty__icon"></i>
            </div>
            <h2 className="fav-empty__title">Nothing saved yet</h2>
            <p className="fav-empty__desc">
              Tap the <i className="far fa-bookmark fav-empty__inline-icon"></i> icon on any post to save it here for later.
            </p>
            <Link to="/customer-home" className="btn btn-primary fav-empty__btn">
              <i className="fas fa-home"></i> Browse Feed
            </Link>
          </div>
        )}

        {/* Grid View */}
        {filtered.length > 0 && (
          <div className="fav-grid">
            {filtered.map(post => (
              <div key={post.id} className="feed-card fav-card">

                <div className="image-container">
                  <img src={post.image} alt="Post" className="feed-image fav-card__image" />
                </div>

                <div className="card-header fav-card__header">
                  <div className="header-left">
                    <img src={post.avatar} alt="Avatar" className="profile-avatar" />
                    <div className="header-text">
                      <h4 className="barber-name fav-card__name">{post.name}</h4>
                      <div className="stars-container">{renderStars(post.rating)}</div>
                    </div>
                  </div>
                </div>

                <div className="card-content fav-card__content">
                  <p className="caption-text fav-card__caption">{post.caption}</p>
                </div>

                <div className="fav-card__actions">
                  <Link to="/barber-profile-view" className="btn btn-secondary fav-card__btn">
                    View Profile
                  </Link>
                  <button onClick={() => handleRemove(post)} className="fav-list-item__remove-btn">
                    <i className="fas fa-trash"></i> Remove
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <Link to="/customer-home" className="nav-item"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/customer-search" className="nav-item"><i className="fas fa-search"></i><span>Search</span></Link>
        <Link to="/favourites" className="nav-item active"><i className="fas fa-heart"></i><span>Favourites</span></Link>
        <Link to="/customer-profile" className="nav-item"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>

    </div>
  );
}
