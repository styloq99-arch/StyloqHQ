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

  const filtered = favouriteList
    .sort((a, b) => {
      if (sortBy === 'oldest') return a.id - b.id;
      return b.id - a.id;
    });

  return (
    <div className="app-layout">

      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{fontSize : '40px'}}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/customer-home" className="sidebar-link"><i className="fas fa-home"></i> <span>Home</span></Link>
          <Link to="/customer-search" className="sidebar-link"><i className="fas fa-search"></i> <span>Search</span></Link>
          <Link to="/favourites" className="sidebar-link active"><i className="fas fa-heart"></i> <span>Favourites</span></Link>
          <Link to="/profile" className="sidebar-link"><i className="fas fa-user"></i> <span>Profile</span></Link>
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
            <div className="fav-header__actions"></div>
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

      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <Link to="/customer-home" className="nav-item"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/customer-search" className="nav-item"><i className="fas fa-search"></i><span>Search</span></Link>
        <Link to="/favourites" className="nav-item active"><i className="fas fa-heart"></i><span>Favourites</span></Link>
        <Link to="/profile" className="nav-item"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>

    </div>
  );
}
